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
        win.removeListener('focus', handleFocus)
        win.removeListener('blur', handleBlur)
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

  const safeRegister = (shortcut: string[] | null, callback: () => void) => {
    const accelerator = formatForAccelerator(shortcut)
    if (!accelerator) return
    try {
      globalShortcut.register(accelerator, callback)
    } catch (err) {
      console.error('Failed to register global shortcut:', accelerator, err)
    }
  }

  safeRegister(platformShortcuts.playPause[1], () => {
    webContexts.send(IpcChannels.PlayOrPause)
  })

  safeRegister(platformShortcuts.next[1], () => {
    webContexts.send(IpcChannels.Next)
  })

  safeRegister(platformShortcuts.previous[1], () => {
    webContexts.send(IpcChannels.Previous)
  })

  safeRegister(platformShortcuts.favorite[1], () => {
    webContexts.send(IpcChannels.Like)
  })

  safeRegister(platformShortcuts.volumeUp[1], () => {
    webContexts.send(IpcChannels.VolumeUp)
  })

  safeRegister(platformShortcuts.volumeDown[1], () => {
    webContexts.send(IpcChannels.VolumeDown)
  })

  safeRegister(platformShortcuts.switchVisibility[1], () => {
    ipcMain.emit(IpcChannels.MinimizeOrUnminimize)
  })
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
