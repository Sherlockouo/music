import { IpcChannels } from '@/shared/IpcChannels'
import { merge } from 'lodash-es'
import { proxy, subscribe } from 'valtio'
import i18n, { getInitLanguage, SupportedLanguage, supportedLanguages } from '../i18n/i18n'

interface Settings {
  accentColor: string
  language: SupportedLanguage
  enableFindTrackOnYouTube: boolean
  httpProxyForYouTube?: {
    host: string
    port: number
    protocol: 'http' | 'https'
    auth?: {
      username: string
      password: string
    }
  }
  playAnimatedArtworkFromApple: boolean
  priorityDisplayOfAlbumArtistDescriptionFromAppleMusic: boolean
  displayPlaylistsFromNeteaseMusic: boolean
  showBackgroundImage: boolean
  unlock: boolean
  theme: string
  keyboardShortcuts: {
    globalEnabled: boolean
    localEnabled: boolean
    darwin: KeyboardShortcuts
    win32: KeyboardShortcuts
    linux: KeyboardShortcuts
  }
}

const initSettings: Settings = {
  accentColor: 'yellow',
  language: getInitLanguage(),
  enableFindTrackOnYouTube: false,
  playAnimatedArtworkFromApple: true,
  priorityDisplayOfAlbumArtistDescriptionFromAppleMusic: true,
  displayPlaylistsFromNeteaseMusic: true,
  showBackgroundImage: false,
  unlock: true,
  theme: 'dark',
  keyboardShortcuts: {
    localEnabled: true,
    globalEnabled: false,
    darwin: {
      playPause: [['Space'], ['Cmd', 'p']],
      next: [['Right'], ['Cmd', 'Right']],
      previous: [['Left'], ['Cmd', 'Left']],
      volumeUp: [['Up'], ['Cmd', 'up']],
      volumeDown: [['Down'], ['Cmd', 'Down']],
      favorite: [['l'], ['Cmd', 'l']],
      switchVisibility: [['m'], ['Cmd', 'm']],
    },
    win32: {
      playPause: [['Space'], ['Ctrl', 'Shift', 'p']],
      next: [['Right'], ['Ctrl', 'Shift', 'Right']],
      previous: [['Left'], ['Ctrl', 'Shift', 'Left']],
      volumeUp: [['Up'], ['Ctrl', 'Shift', 'up']],
      volumeDown: [['Down'], ['Ctrl', 'Shift', 'Down']],
      favorite: [['l'], ['Ctrl', 'Shift', 'l']],
      switchVisibility: [['m'], ['Ctrl', 'Shift', 'm']],
    },
    linux: {
      playPause: [['Space'], ['Ctrl', 'Shift', 'p']],
      next: [['Right'], ['Ctrl', 'Shift', 'Right']],
      previous: [['Left'], ['Ctrl', 'Shift', 'Left']],
      volumeUp: [['Up'], ['Ctrl', 'Shift', 'up']],
      volumeDown: [['Down'], ['Ctrl', 'Shift', 'Down']],
      favorite: [['l'], ['Ctrl', 'Shift', 'l']],
      switchVisibility: [['m'], ['Ctrl', 'Shift', 'm']],
    },
  },
}

const STORAGE_KEY = 'settings'

let statesInStorage = {}
try {
  statesInStorage = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
} catch {
  // ignore
}

const settings = proxy<Settings>(merge(initSettings, statesInStorage))

subscribe(settings, () => {
  if (settings.language !== i18n.language && supportedLanguages.includes(settings.language)) {
    i18n.changeLanguage(settings.language)
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  window.ipcRenderer?.send(IpcChannels.SyncSettings, JSON.parse(JSON.stringify(settings)))
})
export default settings
