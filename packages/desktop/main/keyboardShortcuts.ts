import { BrowserWindow, WebContents, globalShortcut, ipcMain } from 'electron'
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
  shortcuts?: KeyboardShortcutSettings,
  win?: BrowserWindow
) => {
  if (!shortcuts) {
    shortcuts = readKeyboardShortcutSettings()
  } else {
    store.set(`settings.keyboardShortcuts`, shortcuts)
  }

  try {
    let mainWindowFocused = false

    createMenu(webContexts, !mainWindowFocused)

    bindingGlobalKeyboardShortcuts(webContexts, shortcuts)

    // 只有主窗口失去焦点时，才绑定应用内快捷键。主窗口激活时，使用 web 内的快捷键实现

    if (win) {
      const handleFocus = () => {
        mainWindowFocused = true
        createMenu(webContexts, !mainWindowFocused)
      }
      const handleBlur = () => {
        mainWindowFocused = false
        createMenu(webContexts, !mainWindowFocused)
      }
      win.addListener('focus', handleFocus)
      win.addListener('blur', handleBlur)

      win.once('close', () => {
        webContexts.removeListener('focus', handleFocus)
        webContexts.removeListener('blur', handleBlur)
        mainWindowFocused = false
        createMenu(webContexts, !mainWindowFocused)
      })
    }
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
      ipcMain.emit(IpcChannels.MinimizeOrUnminimize)
    })
  }
}

export const formatForAccelerator = (storeText: string[] | null) => {
  if (!storeText) {
    return null
  }

  return storeText
    .map(it =>
      it
        .replace(/^Key(.)$/, '$1')
        .replace(/^Digit(.)$/, '$1')
        .replace(/^NumberPad/, '')
    )
    .join('+')
}
