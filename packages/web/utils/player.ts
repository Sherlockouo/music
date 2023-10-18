import { Howl, Howler } from 'howler'
import request from '@/web/utils/request'
import {
  fetchAudioSourceWithReactQuery,
  fetchTracksWithReactQuery,
  unblock,
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
import { FetchAudioSourceResponse } from '@/shared/api/Track'
import { LogLevel } from 'react-virtuoso'
import settings from '@/web/states/settings'
import useIsMobile from '@/web/hooks/useIsMobile'

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
const port = import.meta.env.DEV ? 10660 : 30003

let _howler = new Howl({ src: [''], format: ['mp3', 'flac'] })
let _analyser = Howler.ctx.createAnalyser()

const isMobile = useIsMobile()

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

    window.ipcRenderer?.send(IpcChannels.Repeat, { mode: this._repeatMode })
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

  private getSongFFT() {
    if (isMobile) return
    _analyser = Howler.ctx.createAnalyser()
    Howler.masterGain.connect(_analyser)

    // Howler.volume(0.4)

    // Connect analyzer to destination
    // _analyser.connect(Howler.ctx.destination);

    // Creating output array (according to documentation https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API)
    _analyser.fftSize = 2048

    var bufferLength = _analyser.frequencyBinCount
    var dataArray = new Uint8Array(bufferLength)

    var smooth = 0.02

    var start = 16,
      end = 128

    // Display array on time each 3 sec (just to debug)
    setInterval(() => {
      _analyser.getByteFrequencyData(dataArray)
      var sum = 0
      dataArray.forEach(function (val, idx, arr) {
        if (start <= idx && idx < end) {
          sum += val
        }
      }, 0)
      // console.log(sum / (end - start));

      this._nowVolume = this._nowVolume * smooth + (sum / (end - start)) * (1 - smooth)
    }, 16)
  }

  // private fetchMP3(url: string): Promise<Blob> {
  //   const options = {
  //     method: 'GET',
  //     headers: {
  //       'Access-Control-Allow-Origin': 'GET', // 设置允许跨域的域名
  //       'Origin': 'music.126.net'
  //     },
  //   };
  //   axios.get(url).then((response) => {
  //     return response.data

  //     // if (!response.ok) {
  //     //   throw new Error(response.statusText);
  //     // }
  //     // return response.blob();
  //   });
  // }

  // private getSongFFT() {
  //   const audioCtx = new AudioContext();

  //   const audioElement = this.howler._sounds[0]._node as HTMLMediaElement;
  //   const data = this.fetchMP3(audioElement.src)

  //   audioElement.src = URL.createObjectURL(new Blob([data], { type: 'audio/flac' }))
  //   const source = audioCtx.createMediaElementSource(audioElement);

  //   const analyser = audioCtx.createAnalyser();
  //   analyser.fftSize = 2048;

  //   source.connect(analyser);
  //   analyser.connect(audioCtx.destination);

  //   const bufferLength = analyser.frequencyBinCount;
  //   const dataArray = new Uint8Array(bufferLength);

  //   const smooth = 0.02;
  //   const start = 16;
  //   const end = 128;

  //   setInterval(() => {
  //     analyser.getByteFrequencyData(dataArray);
  //     let sum = 0;
  //     dataArray.forEach((val, idx) => {
  //       if (start <= idx && idx < end) {
  //         sum += val;
  //       }
  //     });
  //     this._nowVolume = this._nowVolume * smooth + (sum / (end - start)) * (1 - smooth);
  //   }, 16);
  // }
  // private async fetchMP3(url: string) {
  //   console.log('[player][fetchMP3]', url)
  //
  //   const resp = await request({
  //     url: '/buffer',
  //     method: 'get',
  //     params: {
  //       url: url,
  //     },
  //   })
  //
  //   console.log('[player][fetchMP3]', resp)
  //   return resp
  // }
  //
  // private async createAudioElement(url: string): Promise<HTMLAudioElement> {
  //   return new Promise<HTMLAudioElement>((resolve, reject) => {
  //     const audioElement = new Audio()
  //     audioElement.addEventListener('loadedmetadata', () => {
  //       resolve(audioElement)
  //     })
  //     audioElement.addEventListener('error', error => {
  //       reject(error)
  //     })
  //     audioElement.src = url
  //   })
  // }
  //
  // private async startAudioAnalysis(url: string) {
  //   const data = await this.fetchMP3(url)
  //
  //   try {
  //     const audioElement = await this.createAudioElement('data:audio/mpeg;base64,' + data)
  //     // console.log('audio element', audioElement.src)
  //
  //     const audioCtx = new AudioContext()
  //     const source = audioCtx.createMediaElementSource(audioElement)
  //     console.log('source', source)
  //
  //     const analyser = audioCtx.createAnalyser()
  //     analyser.fftSize = 2048
  //     console.log('analyser', analyser)
  //
  //     source.connect(analyser)
  //     analyser.connect(audioCtx.destination)
  //
  //     const bufferLength = analyser.frequencyBinCount
  //     const dataArray = new Uint8Array(bufferLength)
  //     audioElement.addEventListener('canplay', () => {
  //       console.log('canplay')
  //       // audioElement.volume = 0
  //       audioElement.play()
  //       //
  //       // setInterval(() => {
  //       //   this.updateVolume(analyser, dataArray)
  //       // }, 16)
  //     })
  //     audioElement.addEventListener('play', () => {
  //       setInterval(() => {
  //         this.updateVolume(analyser, dataArray)
  //       }, 16)
  //     })
  //     return new Promise((resolve, reject) => {
  //       // Perform your audio analysis operations
  //
  //       // Once the analysis is complete, resolve the promise with the object
  //       resolve({ analyser, dataArray })
  //
  //       // If there's an error during the analysis, reject the promise
  //       // reject(new Error('Audio analysis failed'));
  //     })
  //   } catch (error) {
  //     console.log('analysis error', error)
  //   }
  // }
  //
  // private updateVolume(analyser: AnalyserNode, dataArray: Uint8Array) {
  //   const smooth = 0.02
  //   const start = 16
  //   const end = 128
  //
  //   analyser.getByteFrequencyData(dataArray)
  //
  //   console.log('dataArray', dataArray)
  //   let sum = 0
  //   dataArray.forEach((val, idx) => {
  //     if (start <= idx && idx < end) {
  //       sum += val
  //     }
  //   })
  //   // console.log('update volume called,sum',sum);
  //
  //   this._nowVolume = this._nowVolume * smooth + (sum / (end - start)) * (1 - smooth)
  // }
  //
  // private async getSongFFT() {
  //   const audioElement = this.howler._sounds[0]._node as HTMLMediaElement
  //   const { analyser, dataArray } = await this.startAudioAnalysis(audioElement.src)
  //
  //   // setInterval(() => {
  //   //   this.updateVolume(analyser, dataArray)
  //   // }, 16)
  // }

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
   * Get current playing track
   */
  get track(): Track | null {
    return this.mode === Mode.FM ? this.fmTrack : this._track
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
    window.ipcRenderer?.send(IpcChannels.Repeat, { mode: this._repeatMode })
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
  setDevice(deviceId: MediaDeviceInfo["deviceId"]){
    // Get the currently playing audio element
    const audioElement = _howler._sounds[0]._node;
    audioElement.setSinkId(deviceId)
      .then(() => {
        console.log('Audio output device set successfully');
      })
      .catch((error: any)  => {
        console.error('Error setting audio output device:', error);
      });
  }

  async getAudioSource(track_id: TrackID) {
    return await this._fetchAudioSource(track_id)
  }

  /**
   * Fetch unlocked audio source
   * @param trackID
   * @returns
   */
  private async _fetchUnlockAudioSource(trackID: TrackID) {
    if (settings.unlock) {
      try {
        const data = await unblock({ track_id: trackID })
        if (data.url === '')
          return {
            audio: null,
            id: trackID,
          }
        return {
          audio: data.url,
          id: trackID,
        }
      } catch (err) {
        console.log('[unblockneteasemusic] err', err)
        return {
          audio: null,
          id: trackID,
        }
      }
    }
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
    console.log(Howler.usingWebAudio)
    const url = audio.includes('?') ? `${audio}&dash-id=${id}` : `${audio}?dash-id=${id}`
    const howler = new Howl({
      src: [url],
      format: ['mp3', 'flac', 'webm'],
      html5: true,
      autoplay,
      volume: 1,
      onend: () => {
        this._howlerOnEndCallback()
      }
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

    // await this.getSongFFT()
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
      if (track?.al.picUrl) {
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
    if(this.shuffle){
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
      album: track.al.name,
      artwork: [
        {
          src: track.al.picUrl + '?param=256y256',
          type: 'image/jpg',
          sizes: '256x256',
        },
        {
          src: track.al.picUrl + '?param=512y512',
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
