import { IpcChannels } from '@/shared/IpcChannels'
import { proxy } from 'valtio'

interface UIStates {
  lyricsBlur: boolean
  showDeskttopLyrics: boolean
  showLoginPanel: boolean
  showSongFrequency: boolean
  showDevices:boolean
  hideTopbarBackground: boolean
  mobileShowPlayingNext: boolean
  blurBackgroundImage: string | null
  fullscreen: boolean
  playingVideoID: string | null
  isPauseVideos: boolean
}

const initUIStates: UIStates = {
  lyricsBlur: false,
  showDeskttopLyrics: false,
  showLoginPanel: false,
  showSongFrequency: false,
  showDevices:false,
  hideTopbarBackground: false,
  mobileShowPlayingNext: false,
  blurBackgroundImage: null,
  fullscreen: false,
  playingVideoID: null,
  isPauseVideos: false,
}

window.ipcRenderer
  ?.invoke(IpcChannels.IsMaximized)
  .then(isMaximized => (initUIStates.fullscreen = !!isMaximized))

const uiStates = proxy<UIStates>(initUIStates)
export default uiStates

export const closeVideoPlayer = () => {
  uiStates.playingVideoID = null
}
