import { Howl, Howler } from 'howler'
import {
  fetchAudioSourceWithReactQuery,
  fetchTracksWithReactQuery,
} from '@/web/api/hooks/useTracks'
import { fetchPersonalFMWithReactQuery } from '@/web/api/hooks/usePersonalFM'
import { fmTrash } from '@/web/api/personalFM'
import { cacheAudio } from '@/web/api/r3play'
import { clamp, random } from 'lodash-es'
import axios from 'axios'
import { resizeImage } from './common'
import { fetchPlaylistWithReactQuery } from '@/web/api/hooks/usePlaylist'
import { fetchAlbumWithReactQuery } from '@/web/api/hooks/useAlbum'
import { IpcChannels } from '@/shared/IpcChannels'
import { RepeatMode } from '@/shared/playerDataTypes'
import toast from 'react-hot-toast'
import { scrobble } from '@/web/api/user'
import { fetchArtistWithReactQuery } from '../api/hooks/useArtist'
import { appName } from './const'

type TrackID = number
export enum TrackListSourceType {
  Album = 'album',
  Playlist = 'playlist',
  Artist = 'artist',
}
interface TrackListSource {
  type: TrackListSourceType
  id: number
}

export enum Mode {
  TrackList = 'trackList',
  FM = 'fm',
}
export enum State {
  Initializing = 'initializing',
  Ready = 'ready',
  Playing = 'playing',
  Paused = 'paused',
  Loading = 'loading',
}

const PLAY_PAUSE_FADE_DURATION = 200

let _howler = new Howl({ src: [''], format: ['mp3', 'flac'] })
let invoked = false

export class Player {
  private _track: Track | null = null
  private _trackIndex: number = 0
  private _progress: number = 0
  private _progressInterval: ReturnType<typeof setInterval> | undefined
  private _volume: number = 1 // 0 to 1
  private _nowVolume: number = 128
  private _repeatMode: RepeatMode = RepeatMode.Off

  state: State = State.Initializing
  mode: Mode = Mode.TrackList
  trackList: TrackID[] = []
  originTrackList: TrackID[] = []
  trackListSource: TrackListSource | null = null
  fmTrackList: TrackID[] = []
  shuffle: boolean = false
  fmTrack: Track | null = null
  dataArray: Uint8Array = new Uint8Array()

  init(params: { [key: string]: any }) {
    if (params._track) this._track = params._track
    if (params._trackIndex) this._trackIndex = params._trackIndex
    if (params._volume) this._volume = params._volume
    if (params._repeatMode) this._repeatMode = params._repeatMode
    if (params.state) this.trackList = params.state
    if (params.mode) this.mode = params.mode
    if (params.trackList) this.trackList = params.trackList
    if (params.trackListSource) this.trackListSource = params.trackListSource
    if (params.fmTrackList) this.fmTrackList = params.fmTrackList
    if (params.shuffle) {
      this.shuffle = params.shuffle
      this.shufflePlayList()
    }
    if (params.fmTrack) this.fmTrack = params.fmTrack

    this.state = State.Ready
    if (this.trackID) this._playAudio(false) // just load the audio, not play
    this._initFM()
    this._initMediaSession()

    // window.ipcRenderer?.send(IpcChannels.Repeat, { mode: this._repeatMode })
  }

  get howler() {
    return _howler
  }

  /**
   * Get prev track index
   */
  get _prevTrackIndex(): number | undefined {
    switch (this.repeatMode) {
      case RepeatMode.One:
        return this._trackIndex
      case RepeatMode.Off:
        if (this._trackIndex === 0) return 0
        return this._trackIndex - 1
      case RepeatMode.On:
        if (this._trackIndex - 1 < 0) return this.trackList.length - 1
        return this._trackIndex - 1
    }
  }

  /**
   * Get next track index
   */
  get _nextTrackIndex(): number | undefined {
    switch (this.repeatMode) {
      case RepeatMode.One:
        return this._trackIndex
      case RepeatMode.Off:
        if (this._trackIndex + 1 >= this.trackList.length) return
        return this._trackIndex + 1
      case RepeatMode.On:
        if (this._trackIndex + 1 >= this.trackList.length) return 0
        return this._trackIndex + 1
    }
  }

  /*
    @deprecated this will violate CORS rules
  */
  private getSongFFT() {
    if (window.env === undefined) return
    const audioCtx = new window.AudioContext()
    const analyser = audioCtx.createAnalyser()
    const source = audioCtx.createMediaElementSource((_howler as any)._sounds[0]._node)

    if (!invoked) {
      source.connect(analyser)
      analyser.connect(audioCtx.destination)
      invoked = !invoked
    }

    analyser.fftSize = 2048
    const bufferLength = analyser.frequencyBinCount
    this.dataArray = new Uint8Array(bufferLength)

    let start = 16,
      end = 128,
      smooth = 0.02

    const updateFrequencyData = () => {
      analyser.getByteFrequencyData(this.dataArray)

      let sum = 0
      for (let i = start; i < end; i++) {
        sum += this.dataArray[i]
      }
      const average = sum / (end - start)
      this._nowVolume = this._nowVolume * smooth + average * (1 - smooth)
    }

    setInterval(updateFrequencyData, 80)
  }

  /**
   * Get current volume
   */
  get nowVolume(): number {
    return this._nowVolume
  }

  /**
   * Get current playing track ID
   */
  get trackID(): TrackID {
    if (this.mode === Mode.TrackList) {
      const { trackList, _trackIndex } = this
      return trackList[_trackIndex] ?? 0
    }
    return this.fmTrackList[0] ?? 0
  }

  /**
   * Set current playing track ID
   * !!
   */
  set trackID(value) {
    const { trackList, _trackIndex } = this
    trackList[_trackIndex] = value
    this.fmTrackList[0] = value
  }

  /**
   * Get current playing track
   */
  get track(): Track | null {
    return this.mode === Mode.FM ? this.fmTrack : this._track
  }

  set track(value) {
    this._track = value
  }

  get trackIndex() {
    return this._trackIndex
  }

  /**
   * Get/Set progress of current track
   */
  get progress(): number {
    return this.state === State.Loading ? 0 : this._progress
  }
  set progress(value) {
    this._progress = value
    _howler.seek(value)
  }

  /**
   * Get/Set current volume
   */
  get volume(): number {
    return this._volume
  }
  set volume(value) {
    this._volume = clamp(value, 0, 1)
    Howler.volume(this._volume)
  }

  get repeatMode(): RepeatMode {
    return this._repeatMode
  }
  set repeatMode(value) {
    this._repeatMode = value
    // window.ipcRenderer?.send(IpcChannels.Repeat, { mode: this._repeatMode })
  }

  private async _initFM() {
    if (this.fmTrackList.length === 0) await this._loadMoreFMTracks()

    const trackId = this.fmTrackList[0]
    const track = await this._fetchTrack(trackId)
    if (track) this.fmTrack = track

    this._loadMoreFMTracks()
  }

  private _setStateToLoading() {
    this._scrobble()
    this.state = State.Loading
    _howler.pause()
  }

  private async _setupProgressInterval() {
    this._progressInterval = setInterval(() => {
      if (this.state === State.Playing) this._progress = _howler.seek()
    }, 1000)
  }

  private async _scrobble() {
    if (!this.track?.id || !this.trackListSource?.id) {
      return
    }
    if (this.progress <= this.track.dt / 1000 / 3) {
      return
    }
    scrobble({
      id: this.track.id,
      sourceid: this.trackListSource.id,
      time: ~~this.progress,
    })
  }

  /**
   * Fetch track details from Netease based on this.trackID
   */
  private async _fetchTrack(trackID: TrackID) {
    const response = await fetchTracksWithReactQuery({ ids: [trackID] })
    return response?.songs?.length ? response.songs[0] : null
  }

  // set play device
  setDevice(deviceId: MediaDeviceInfo['deviceId']) {
    // Get the currently playing audio element
    const audioElement = (_howler as any)._sounds[0]._node
    audioElement
      .setSinkId(deviceId)
      .then(() => {
        console.log('Audio output device set successfully')
      })
      .catch((error: any) => {
        console.error('Error setting audio output device:', error)
      })
  }

  async getAudioSource(track_id: TrackID) {
    return await this._fetchAudioSource(track_id)
  }

  /**
   * Fetch track audio source url from Netease
   * @param {TrackID} trackID
   */
  private async _fetchAudioSource(trackID: TrackID) {
    try {
      // console.log(`[player] fetchAudioSourceWithReactQuery `, trackID)
      const response = await fetchAudioSourceWithReactQuery({ id: trackID })
      // console.log(`[player] fetchAudioSourceWithReactQuery `, response)
      let audio = response.data?.[0]?.url
      if (audio && audio.includes('126.net')) {
        audio = audio.replace('http://', 'https://')
      }
      return {
        audio,
        id: trackID,
      }
    } catch {
      return {
        audio: null,
        id: trackID,
      }
    }
  }

  /**
   * Play a track based on this.trackID
   */
  private async _playTrack() {
    const id = this.trackID
    if (!id) return
    this.state = State.Loading
    const track = await this._fetchTrack(id)
    if (!track) {
      toast('加载歌曲信息失败')
      return
    }
    if (this.mode === Mode.TrackList) this._track = track
    if (this.mode === Mode.FM) this.fmTrack = track
    this._updateMediaSessionMetaData()
    this._playAudio()
  }

  /**
   * Play audio via howler
   */
  private async _playAudio(autoplay: boolean = true) {
    this._progress = 0
    const { audio, id } = await this._fetchAudioSource(this.trackID)

    if (!audio) {
      toast('无法播放此歌曲')
      this.nextTrack()
      return
    }
    if (this.trackID !== id) return
    this._playAudioViaHowler(audio, id, autoplay)
  }

  private async _playAudioViaHowler(audio: string, id: number, autoplay: boolean = true) {
    Howler.unload()

    const url = audio.includes('?') ? `${audio}&dash-id=${id}` : `${audio}?dash-id=${id}`
    const howler = new Howl({
      src: [url],
      format: ['mp3', 'flac', 'webm'],
      html5: true,
      autoplay,
      volume: 1,
      onend: () => {
        this._howlerOnEndCallback()
      },
    })
    _howler = howler
    ;(window as any).howler = howler
    if (autoplay) {
      this.play()
      this.state = State.Playing
    }
    _howler.once('load', () => {
      this._cacheAudio((_howler as any)._src)
    })

    if (!this._progressInterval) {
      this._setupProgressInterval()
    }

    /* @deprecated */
    // this.getSongFFT()
  }

  private _howlerOnEndCallback() {
    if (this.mode !== Mode.FM && this.repeatMode === RepeatMode.One) {
      _howler.seek(0)
      _howler.play()
    } else {
      this.nextTrack()
    }
  }

  private async _cacheAudio(audio: string) {
    if (audio.includes(appName.toLowerCase()) || !window.ipcRenderer) return
    const id = Number(new URL(audio).searchParams.get('dash-id'))
    if (isNaN(id) || !id) return
    // audio info
    const response = await fetchAudioSourceWithReactQuery({ id })
    // 缓存
    cacheAudio(id, audio, response?.data?.[0]?.br)
  }

  private async _nextFMTrack() {
    const prefetchNextTrack = async () => {
      const prefetchTrackID = this.fmTrackList[1]
      const track = await this._fetchTrack(prefetchTrackID)
      if (track?.al?.picUrl) {
        axios.get(resizeImage(track.al.picUrl, 'md'))
        axios.get(resizeImage(track.al.picUrl, 'xs'))
      }
    }

    this.fmTrackList.shift()
    if (this.fmTrackList.length === 0) await this._loadMoreFMTracks()
    this._playTrack()

    this.fmTrackList.length <= 1 ? await this._loadMoreFMTracks() : this._loadMoreFMTracks()
    prefetchNextTrack()
  }

  private async _loadMoreFMTracks() {
    if (this.fmTrackList.length <= 5) {
      const response = await fetchPersonalFMWithReactQuery()
      const ids = (response?.data?.map(r => r.id) ?? []).filter(r => !this.fmTrackList.includes(r))
      this.fmTrackList.push(...ids)
    }
  }

  /**
   * Play current track
   * @param {boolean} fade fade in
   */
  play(fade: boolean = false) {
    if (_howler.playing()) {
      this.state = State.Playing
      return
    }
    _howler.play()
    if (fade) {
      this.state = State.Playing
      _howler.once('play', () => {
        _howler.fade(0, this._volume, PLAY_PAUSE_FADE_DURATION)
      })
    } else {
      this.state = State.Playing
    }
  }

  /**
   * Pause current track
   * @param {boolean} fade fade out
   */
  pause(fade: boolean = false) {
    if (fade) {
      _howler.fade(this._volume, 0, PLAY_PAUSE_FADE_DURATION)
      this.state = State.Paused
      _howler.once('fade', () => {
        _howler.pause()
      })
    } else {
      this.state = State.Paused
      _howler.pause()
    }
  }

  /**
   * Play or pause current track
   * @param {boolean} fade fade in-out
   */
  playOrPause(fade: boolean = true) {
    this.state === State.Playing ? this.pause(fade) : this.play(fade)
  }

  /**
   * Play previous track
   */
  prevTrack() {
    this._setStateToLoading()
    this._progress = 0
    if (this.mode === Mode.FM) {
      toast('Personal FM not support previous track')
      return
    }
    if (this._prevTrackIndex === undefined) {
      toast('No previous track')
      return
    }
    this._trackIndex = this._prevTrackIndex
    this._playTrack()
  }

  /**
   * Play next track
   */
  nextTrack(forceFM: boolean = false) {
    this._setStateToLoading()
    this._progress = 0
    if (forceFM || this.mode === Mode.FM) {
      this.mode = Mode.FM
      this._nextFMTrack()
      return
    }
    if (this._nextTrackIndex === undefined) {
      toast('没有下一首了')
      this.pause()
      return
    }
    this._trackIndex = this._nextTrackIndex

    this._playTrack()
  }

  /**
   * 播放一个track id列表
   * @param {number[]} list
   * @param {null|number} autoPlayTrackID
   */
  playAList(list: TrackID[], autoPlayTrackID?: null | number) {
    this._setStateToLoading()
    this.mode = Mode.TrackList
    this.trackList = list
    this._trackIndex = autoPlayTrackID ? list.findIndex(t => t === autoPlayTrackID) : 0
    this._playTrack()
  }

  /**
   *
   * @param trackID
   */
  addToFirstPlay(trackID: number) {
    console.log(`trackID:${trackID}`)
    // 判重
    if (this.trackList.includes(trackID)) {
      this.trackList = this.trackList.filter(item => item != trackID)
      this.trackList.splice(0, 0, trackID)
      return
    }
    this.trackList.splice(0, 0, trackID)
  }

  /**
   *
   * @param trackID
   */
  addToNextPlay(trackID: number) {
    // 判重
    if (this.trackList.includes(trackID)) {
      this.trackList = this.trackList.filter(item => item != trackID)
      this.trackList.splice(Number(this._nextTrackIndex), 0, trackID)
      return
    }
    this.trackList.splice(Number(this._nextTrackIndex), 0, trackID)
  }

  /**
   * deleteFromPlaylist() - function to remove a track from current play queue
   * 
   * @param trackID
   */

  deleteFromPlaylist(trackID: number) {
    // Check if the song existed in the tracklist
    if (!this.trackList.includes(trackID)) {
      return
    }
    // Check whether we are deleting the content that we are playing
    if (this.track?.id != undefined && this.track?.id != trackID){
      this.trackList = this.trackList.filter(item => item != trackID)
      return
    }
    // If we are deleting current playing. Switch to the next first
    this.prevTrack()
    this.trackList = this.trackList.filter(item => item != trackID)
    this.nextTrack()
  }

  /**
   *
   * @param trackID
   */
  addToPlayList(trackID: number) {
    // 判重
    if (this.trackList.includes(trackID)) {
      return
    }
    this.trackList.push(trackID)
  }

  /**
   * Play a playlist
   * @param  {number} id
   * @param  {null|number=} autoPlayTrackID
   */
  async playPlaylist(id: number | undefined, autoPlayTrackID?: null | number) {
    if (!id) {
      toast.error('无法播放: 歌单不存在')
      return
    }
    this._setStateToLoading()
    const playlist = await fetchPlaylistWithReactQuery({ id })
    if (!playlist?.playlist?.trackIds?.length) return
    this.trackListSource = {
      type: TrackListSourceType.Playlist,
      id,
    }
    this.playAList(
      playlist.playlist.trackIds.map(t => t.id),
      autoPlayTrackID
    )
  }

  /**
   * shuffle the playList
   * algorithm: https://bost.ocks.org/mike/shuffle/
   */
  async shufflePlayList() {
    let playingSongID = this.trackList[this._trackIndex]
    if (this.shuffle) {
      this.trackList = Array.from(this.originTrackList)
      this._trackIndex = this.trackList.indexOf(playingSongID)
      this.shuffle = !this.shuffle
      return
    }
    this.originTrackList = Array.from(this.trackList)
    this.shuffle = !this.shuffle

    let len = this.trackList.length,
      tmp,
      idx
    while (len) {
      idx = Math.floor(Math.min(random(), 0.99999) * len--)
      tmp = this.trackList[len]
      this.trackList[len] = this.trackList[idx]
      this.trackList[idx] = tmp
    }
    this._trackIndex = this.trackList.indexOf(playingSongID)
  }

  /**
   * Play an album
   * @param  {number} id
   * @param  {null|number=} autoPlayTrackID
   */
  async playAlbum(id: number, autoPlayTrackID?: null | number) {
    this._setStateToLoading()
    const album = await fetchAlbumWithReactQuery({ id })
    if (!album?.songs?.length) return
    this.trackListSource = {
      type: TrackListSourceType.Album,
      id,
    }
    this.playAList(
      album.songs.map(t => t.id),
      autoPlayTrackID
    )
  }

  /**
   * Listen artist's popular tracks
   * @param  {number} id
   * @param  {null|number=} autoPlayTrackID
   */
  async playArtistPopularTracks(id: number, autoPlayTrackID?: null | number) {
    this._setStateToLoading()
    const artist = await fetchArtistWithReactQuery({ id })
    if (!artist?.hotSongs.length) {
      toast('无法播放: 没有热门歌曲')
      return
    }
    this.trackListSource = {
      type: TrackListSourceType.Artist,
      id,
    }
    this.playAList(
      artist.hotSongs.map(t => t.id),
      autoPlayTrackID
    )
  }

  /**
   *  Play personal fm
   */
  async playFM() {
    this._setStateToLoading()
    this.mode = Mode.FM
    if (this.fmTrackList.length > 0 && this.fmTrack?.id === this.fmTrackList[0]) {
      this._track = this.fmTrack
      this._playAudio()
    } else {
      this._playTrack()
    }
  }

  /**
   * Trash current PersonalFMTrack
   */
  async fmTrash() {
    this.mode = Mode.FM
    const trashTrackID = this.fmTrackList[0]
    fmTrash(trashTrackID)
    this._nextFMTrack()
  }

  /**
   * Play track in trackList by id
   */
  async playTrack(trackID: TrackID) {
    this._setStateToLoading()
    const index = this.trackList.findIndex(t => t === trackID)
    if (index === -1) toast('播放失败，歌曲不在列表内')
    this._trackIndex = index
    this._playTrack()
  }

  private async _initMediaSession() {
    // console.log('init media session')
    if ('mediaSession' in navigator === false) return
    navigator.mediaSession.setActionHandler('play', () => this.play())
    navigator.mediaSession.setActionHandler('pause', () => this.pause())
    navigator.mediaSession.setActionHandler('previoustrack', () => this.prevTrack())
    navigator.mediaSession.setActionHandler('nexttrack', () => this.nextTrack())
    navigator.mediaSession.setActionHandler('seekto', event => {
      if (event.seekTime) this.progress = event.seekTime
    })
  }

  private async _updateMediaSessionMetaData() {
    if ('mediaSession' in navigator === false || !this.track) return
    const track = this.track
    const metadata = {
      title: track.name,
      artist: track.ar.map(a => a.name).join(', '),
      album: track.al?.name,
      artwork: [
        {
          src: track.al?.picUrl + '?param=256y256',
          type: 'image/jpg',
          sizes: '256x256',
        },
        {
          src: track.al?.picUrl + '?param=512y512',
          type: 'image/jpg',
          sizes: '512x512',
        },
      ],
      length: this.progress,
      trackId: track.id,
    }
    navigator.mediaSession.metadata = new window.MediaMetadata(metadata)
  }
}

if (import.meta.env.DEV) {
  ;(window as any).howler = _howler
}
