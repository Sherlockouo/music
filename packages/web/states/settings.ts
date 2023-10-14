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

export interface KeyboardShortcuts {
  playPause: KeyboardShortcutItem
  next: KeyboardShortcutItem
  previous: KeyboardShortcutItem
  volumeUp: KeyboardShortcutItem
  volumeDown: KeyboardShortcutItem
  favorite: KeyboardShortcutItem
  switchVisibility: KeyboardShortcutItem
}

/**
 * A keyboard shortcut item
 * [local, global]
 */
type KeyboardShortcutItem = [string | null, string | null]

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
      playPause: ['space', 'option+command+p'],
      next: ['command+right', 'option+command+right'],
      previous: ['command+left', 'option+command+left'],
      volumeUp: ['command+up', 'option+command+up'],
      volumeDown: ['command+down', 'option+command+down'],
      favorite: ['command+l', 'option+command+l'],
      switchVisibility: ['command+m', 'option+command+m'],
    },
    win32: {
      playPause: ['space', 'ctrl+p'],
      next: ['right', 'ctrl+right'],
      previous: ['left', 'ctrl+left'],
      volumeUp: ['up', 'ctrl+up'],
      volumeDown: ['down', 'ctrl+down'],
      favorite: ['l', 'ctrl+l'],
      switchVisibility: ['m', 'ctrl+m'],
    },
    linux: {
      playPause: ['space', 'ctrl+p'],
      next: ['right', 'ctrl+right'],
      previous: ['left', 'ctrl+left'],
      volumeUp: ['up', 'ctrl+up'],
      volumeDown: ['down', 'ctrl+down'],
      favorite: ['l', 'ctrl+l'],
      switchVisibility: ['m', 'ctrl+m'],
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
