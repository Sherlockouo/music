import { WebContents, globalShortcut, ipcMain } from 'electron'
import store from './store'
import { getPlatform } from './utils'
import { createMenu } from './menu'
import { IpcChannels } from '@/shared/IpcChannels'

export const readKeyboardShortcuts = () => {
  const platform = getPlatform()

  return store.get(`settings.keyboardShortcuts.${platform}`) as KeyboardShortcuts
}

export const readKeyboardShortcutSettings = () => {
  return store.get(`settings.keyboardShortcuts`) as KeyboardShortcutSettings
}

const isGlobalKeyboardShortcutsEnabled = () => {
  return store.get('settings.keyboardShortcuts.globalEnabled') as boolean
}

export const bindingKeyboardShortcuts = (
  webContexts: WebContents,
  shortcuts?: KeyboardShortcutSettings
) => {
  if (!shortcuts) {
    shortcuts = readKeyboardShortcutSettings()
  } else {
    store.set(`settings.keyboardShortcuts`, shortcuts)
  }

  try {
    createMenu(webContexts)

    bindingGlobalKeyboardShortcuts(webContexts, shortcuts)
  } catch (err) {
    console.error(err)
  }
}

const bindingGlobalKeyboardShortcuts = (
  webContexts: WebContents,
  shortcuts?: KeyboardShortcutSettings
) => {
  if (!shortcuts) {
    shortcuts = readKeyboardShortcutSettings()
  } else {
    store.set(`settings.keyboardShortcuts`, shortcuts)
  }

  globalShortcut.unregisterAll()

  if (!isGlobalKeyboardShortcutsEnabled()) {
    return
  }

  const platform = getPlatform()
  const platformShortcuts = shortcuts[platform] as KeyboardShortcuts

  if (platformShortcuts.playPause[1]) {
    globalShortcut.register(formatForAccelerator(platformShortcuts.playPause[1])!, () => {
      webContexts.send(IpcChannels.PlayOrPause)
    })
  }

  if (platformShortcuts.next[1]) {
    globalShortcut.register(formatForAccelerator(platformShortcuts.next[1])!, () => {
      webContexts.send(IpcChannels.Next)
    })
  }

  if (platformShortcuts.previous[1]) {
    globalShortcut.register(formatForAccelerator(platformShortcuts.previous[1])!, () => {
      webContexts.send(IpcChannels.Previous)
    })
  }

  if (platformShortcuts.favorite[1]) {
    globalShortcut.register(formatForAccelerator(platformShortcuts.favorite[1])!, () => {
      webContexts.send(IpcChannels.Like)
    })
  }

  if (platformShortcuts.volumeUp[1]) {
    globalShortcut.register(formatForAccelerator(platformShortcuts.volumeUp[1])!, () => {
      webContexts.send(IpcChannels.VolumeUp)
    })
  }

  if (platformShortcuts.volumeDown[1]) {
    globalShortcut.register(formatForAccelerator(platformShortcuts.volumeDown[1])!, () => {
      webContexts.send(IpcChannels.VolumeDown)
    })
  }

  if (platformShortcuts.switchVisibility[1]) {
    globalShortcut.register(formatForAccelerator(platformShortcuts.switchVisibility[1])!, () => {
      console.log('switchVisibility')
      ipcMain.emit(IpcChannels.MinimizeOrUnminimize)
    })
  }
}

export const formatForAccelerator = (storeText: string[] | null) => {
  if (!storeText) {
    return null
  }

  return storeText.join('+')
}
