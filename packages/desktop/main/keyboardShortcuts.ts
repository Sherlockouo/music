import { WebContents, globalShortcut } from 'electron'
import store from './store'
import { getPlatform } from './utils'
import { createMenu } from './menu'
import { IpcChannels } from '@/shared/IpcChannels'

export const readKeyboardShortcuts = () => {
  const platform = getPlatform()

  return store.get(`settings.keyboardShortcuts.${platform}`) as KeyboardShortcuts
}

const isGlobalKeyboardShortcutsEnabled = () => {
  return store.get('settings.keyboardShortcuts.globalEnabled') as boolean
}

export const bindingKeyboardShortcuts = (
  webContexts: WebContents,
  shortcuts?: KeyboardShortcuts
) => {
  if (!shortcuts) {
    shortcuts = readKeyboardShortcuts()
  } else {
    store.set(`settings.keyboardShortcuts.${getPlatform()}`, shortcuts)
  }

  createMenu(webContexts)

  bindingGlobalKeyboardShortcuts(webContexts, shortcuts)
}

const bindingGlobalKeyboardShortcuts = (
  webContexts: WebContents,
  shortcuts?: KeyboardShortcuts
) => {
  if (!shortcuts) {
    shortcuts = readKeyboardShortcuts()
  } else {
    store.set(`settings.keyboardShortcuts.${getPlatform()}`, shortcuts)
  }

  globalShortcut.unregisterAll()

  if (!isGlobalKeyboardShortcutsEnabled()) {
    return
  }

  if (shortcuts.playPause[1]) {
    globalShortcut.register(formatForAccelerator(shortcuts.playPause[1])!, () => {
      webContexts.send(IpcChannels.PlayOrPause)
    })
  }

  if (shortcuts.next[1]) {
    globalShortcut.register(formatForAccelerator(shortcuts.next[1])!, () => {
      webContexts.send(IpcChannels.Next)
    })
  }

  if (shortcuts.previous[1]) {
    globalShortcut.register(formatForAccelerator(shortcuts.previous[1])!, () => {
      webContexts.send(IpcChannels.Previous)
    })
  }

  if (shortcuts.favorite[1]) {
    globalShortcut.register(formatForAccelerator(shortcuts.favorite[1])!, () => {
      webContexts.send(IpcChannels.Like)
    })
  }
}

export const formatForAccelerator = (storeText: string[] | null) => {
  if (!storeText) {
    return null
  }

  return storeText.join('+')
}
