import { BrowserWindow, ipcMain, app, BrowserWindowConstructorOptions, App } from 'electron'
import { join } from 'path'
import store from './store'
import { IpcChannels, IpcChannelsParams } from '@/shared/IpcChannels'
import { handleLyricsWinClose } from './ipcMain'
import { appName } from './env'

const on = <T extends keyof IpcChannelsParams>(
  channel: T,
  listener: (event: Electron.IpcMainEvent, params: IpcChannelsParams[T]) => void
) => {
  ipcMain.on(channel, listener)
}

const handle = <T extends keyof IpcChannelsParams>(
  channel: T,
  listener: (event: Electron.IpcMainInvokeEvent, params: IpcChannelsParams[T]) => void
) => {
  return ipcMain.handle(channel, listener)
}

export class LyricsWindow {
  win: BrowserWindow | null = null

  constructor(pWin: BrowserWindow) {
    this.createWindow(pWin)
    this.handlePinDesktopLyrics(this.win as BrowserWindow)
    this.registerIPCListeners(pWin)
  }

  createWindow(pWin: BrowserWindow) {
    const options: BrowserWindowConstructorOptions = {
      title: appName + 'Lyrics',
      webPreferences: {
        preload: join(__dirname, 'rendererPreload.js'),
        sandbox: false,
      },
      width: store.get('lyricsWindow.width'),
      height: store.get('lyricsWindow.height'),
      minWidth: 300,
      maxWidth: 300,
      minHeight: 640,
      maxHeight: 640,
      titleBarStyle: 'hidden',
      trafficLightPosition: { x: 12, y: 6 },
      fullscreenable: false,
      resizable: false,
      minimizable: true,
      frame: false,
      transparent: true,
      backgroundColor: 'rgba(0, 0, 0, 0)',
    }

    if (store.get('lyricsWindow')) {
      options.x = store.get('lyricsWindow.x')
      options.y = store.get('lyricsWindow.y')
    }

    this.win = new BrowserWindow(options)
    this.win.webContents.setAudioMuted(true)
    // Web server, load the web server to the electron
    // const url = `http://localhost:${process.env.ELECTRON_WEB_SERVER_PORT}`
    const url = `http://localhost:${process.env.ELECTRON_WEB_SERVER_PORT}/#/desktoplyrics`
    this.win.loadURL(url)

    this.win.once('ready-to-show', () => {
      this.win && this.win.show()
    })

    // Save window position
    const saveBounds = () => {
      const bounds = this.win?.getBounds()
      if (bounds) {
        store.set('lyricsWindow', bounds)
      }
    }
    this.win.on('moved', saveBounds)
  }

  registerIPCListeners(pWin: BrowserWindow) {
    // 在窗口关闭时解除 'PinDesktopLyric' 事件的监听
    this.win?.on('closed', () => {
      ipcMain.removeHandler(IpcChannels.PinDesktopLyric)
      ipcMain.removeHandler(IpcChannels.LyricsWindowClose)
      ipcMain.removeHandler(IpcChannels.LyricsWindowMinimize)
      ipcMain.removeListener(IpcChannels.PinDesktopLyric, this.handlePinDesktopLyrics)
      this.win && this.win.close()
    })

    this.win?.on('close', () => {
      pWin.webContents.send(IpcChannels.SetDesktopLyric)
      handleLyricsWinClose()
    })

    on(IpcChannels.LyricsWindowMinimize, () => {
      this.win?.minimize()
    })
    on(IpcChannels.LyricsWindowClose, () => {
      pWin.webContents.send(IpcChannels.SetDesktopLyric)
      this.win?.close()
      // If you only close the window without setting this window to null, when you reopen it, you will find it unclosable.
      this.win = null
    })
  }

  handlePinDesktopLyrics(win: BrowserWindow) {
    // PinDesktopLyric
    handle(IpcChannels.PinDesktopLyric, () => {
      if (win && !win.isDestroyed()) {
        win.setMovable(!win.movable)
        // pined and set to the top
        win.setAlwaysOnTop(true)
        if (win.movable) {
          win.setAlwaysOnTop(false)
        }

        return !win.movable
      } else {
        return false
      }
    })
  }
}
