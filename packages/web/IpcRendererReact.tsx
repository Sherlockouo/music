import { IpcChannels } from '@/shared/IpcChannels'
import useUserLikedTracksIDs, { useMutationLikeATrack } from '@/web/api/hooks/useUserLikedTracksIDs'
import player from '@/web/states/player'
import useIpcRenderer from '@/web/hooks/useIpcRenderer'
import { State as PlayerState } from '@/web/utils/player'
import { useEffect, useRef, useState } from 'react'
import { useEffectOnce } from 'react-use'
import { useSnapshot } from 'valtio'
import { appName } from './utils/const'

// The desktop-lyrics window loads the same React bundle as the main
// window (via `#/desktoplyrics`). Without this guard it would subscribe
// to player state and echo every SyncProgress/Play/Pause/Like/Tray IPC
// back to the main process — doubling IPC traffic during playback and
// making the lyrics window a second render process that does work it
// shouldn't. The lyrics window should be a read-only consumer of player
// state pushed from the main window; it has no business sending any of
// these events itself.
//
// Computed at module load (location.hash doesn't change for a given
// window instance — the main window is opened at `/` and the lyrics
// window is opened at `#/desktoplyrics`). Done this way rather than
// early-returning from the component so we never violate the Rules of
// Hooks.
const isLyricsWindow =
  typeof window !== 'undefined' &&
  window.location?.hash?.startsWith('#/desktoplyrics')

const IpcRendererReact = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const { track, state, progress, trackID } = useSnapshot(player)
  const trackIDRef = useRef(0)

  // Liked songs ids
  const { data: userLikedSongs } = useUserLikedTracksIDs()
  const mutationLikeATrack = useMutationLikeATrack()

  useIpcRenderer(IpcChannels.Like, () => {
    const id = trackIDRef.current
    id && mutationLikeATrack.mutate(id)
  })

  useEffect(() => {
    trackIDRef.current = track?.id ?? 0
    const coverImg = track?.al?.picUrl || ''
    const text = track?.name ? `${track.name} - ${appName}` : appName
    document.title = text
    if (isLyricsWindow) return
    window.ipcRenderer?.send(IpcChannels.SetTrayTooltip, {
      text,
      coverImg,
    })
    window.ipcRenderer?.send(IpcChannels.MetaData, {
      track: JSON.stringify(track)
    })
  }, [track])

  useEffect(() => {
    if (isLyricsWindow) return
    window.ipcRenderer?.send(IpcChannels.Like, {
      isLiked: userLikedSongs?.ids?.includes(track?.id ?? 0) ?? false,
    })
  }, [userLikedSongs, track])

  // 同步歌词进度›
  useEffect(() => {
    if (isLyricsWindow) return
    window.ipcRenderer?.send(IpcChannels.SyncProgress, {
      progress: progress,
    })
  }, [progress])

  // 同步歌曲
  useEffect(() => {
    if (isLyricsWindow) return
    window.ipcRenderer?.send(IpcChannels.Play, {
      trackID: trackID,
    })
  }, [trackID])

  useEffect(() => {
    const playing = [PlayerState.Playing, PlayerState.Loading].includes(state)
    if (isPlaying === playing) return

    if (!isLyricsWindow) {
      window.ipcRenderer?.send(playing ? IpcChannels.Play : IpcChannels.Pause, {})
    }

    setIsPlaying(playing)
  }, [isPlaying, state])

  useEffectOnce(() => {
    // 用于显示 windows taskbar buttons
    if (isLyricsWindow) return
    if (track?.id) {
      window.ipcRenderer?.send(IpcChannels.Pause)
    }
  })

  return <></>
}

export default IpcRendererReact
