import { IpcChannels } from '@/shared/IpcChannels'
import { merge } from 'lodash-es'
import { proxy, subscribe } from 'valtio'
import i18n, { getInitLanguage, SupportedLanguage, supportedLanguages } from '../i18n/i18n'
import { getKeyboardShortcutDefaultSettings } from '@/shared/defaultSettings'

interface Settings {
  accentColor: string
  language: SupportedLanguage
  qqCookie: string
  miguCookie: string
  jooxCookie: string
  enableFindTrackOnYouTube: boolean
  httpProxyForYouTube?: {
    proxy: string
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
  closeWindowInMinimize: boolean
  showBackgroundImage: boolean
  unlock: boolean
  theme: string
  showDesktopLyrics: boolean
  keyboardShortcuts: KeyboardShortcutSettings
  showTrackListName: boolean
}

const initSettings: Settings = {
  accentColor: 'yellow',
  language: getInitLanguage(),
  qqCookie: '',
  miguCookie: '',
  jooxCookie: '',
  enableFindTrackOnYouTube: false,
  playAnimatedArtworkFromApple: true,
  priorityDisplayOfAlbumArtistDescriptionFromAppleMusic: true,
  displayPlaylistsFromNeteaseMusic: true,
  closeWindowInMinimize: false,
  showBackgroundImage: false,
  httpProxyForYouTube: {
    proxy: '',
    host: '',
    port: 0,
    protocol: 'http',
  },
  unlock: true,
  theme: 'dark',
  showDesktopLyrics: false,
  keyboardShortcuts: getKeyboardShortcutDefaultSettings(),
  showTrackListName: false,
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
  // 同步electron set settings
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  window.ipcRenderer?.send(IpcChannels.SyncSettings, JSON.parse(JSON.stringify(settings)))
})
export default settings
