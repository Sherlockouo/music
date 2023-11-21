import player from '@/web/states/player'
import { IpcChannels, IpcChannelsReturns, IpcChannelsParams } from '@/shared/IpcChannels'
import uiStates from './states/uiStates'
import settings from './states/settings'
import toast from 'react-hot-toast'
import { changeAccentColor, changeTheme } from './utils/theme'
import { RepeatMode } from '@/shared/playerDataTypes'

const on = <T extends keyof IpcChannelsParams>(
  channel: T,
  listener: (event: any, params: IpcChannelsReturns[T]) => void
) => {
  window.ipcRenderer?.on(channel, listener)
}

export function ipcRenderer() {
  on(IpcChannels.Play, (e, { trackID }) => {
    if (!trackID) {
      player.play(true)
      return
    }
    player.trackID = trackID
  })

  on(IpcChannels.Pause, () => {
    player.pause(true)
  })

  on(IpcChannels.PlayOrPause, () => {
    player.playOrPause()
  })

  on(IpcChannels.SetDesktopLyric, () => {
    settings.showDesktopLyrics = false
  })

  on(IpcChannels.SyncProgress, (e, { progress }) => {
    player.progress = progress
  })

  on(IpcChannels.SyncAccentColor, (e, { color }) => {
    changeAccentColor(color)
  })

  on(IpcChannels.SyncTheme, (e, { theme }) => {
    changeTheme(theme as 'light' | 'dark')
  })

  on(IpcChannels.Next, e => {
    player.nextTrack()
  })

  on(IpcChannels.Previous, e => {
    player.prevTrack()
  })

  on(IpcChannels.Repeat, (e, mode) => {
    player.repeatMode = mode
    if (player.repeatMode == RepeatMode.Shuffle) {
      player.shufflePlayList()
    }
  })

  on(IpcChannels.FullscreenStateChange, (e, isFullscreen) => {
    uiStates.fullscreen = isFullscreen
  })

  on(IpcChannels.VolumeUp, () => {
    player.volume += 0.1
  })

  on(IpcChannels.VolumeDown, () => {
    player.volume -= 0.1
  })
}
