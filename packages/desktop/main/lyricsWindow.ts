import { BrowserWindow, ipcMain, app, BrowserWindowConstructorOptions, App } from 'electron'
import { join } from 'path'
import store from './store'
import { IpcChannels, IpcChannelsParams } from '@/shared/IpcChannels'
import { handleLyricsWinClose } from './ipcMain'
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
    this.registerIPCListeners()
  }

  createWindow(pWin: BrowserWindow) {
    const options: BrowserWindowConstructorOptions = {
      title: 'Lyrics',
      webPreferences: {
        preload: join(__dirname, 'rendererPreload.js'),
        nodeIntegration: true,
      },
      width: store.get('lyricsWindow.width'),
      height: store.get('lyricsWindow.height'),
      minWidth: 300,
      minHeight: 600,
      titleBarStyle: 'hidden',
      trafficLightPosition: { x: 12, y: 6 },
      minimizable: true,  // 允许最小化
      maximizable: true,  // 允许最大化
      frame: false,
      fullscreenable: false,
      resizable: false,
      transparent:true,
      show: false,
    }

    if (store.get('lyricsWindow')) {
      options.x = store.get('lyricsWindow.x')
      options.y = store.get('lyricsWindow.y')
    }

    this.win = new BrowserWindow(options)
    this.win.webContents.setAudioMuted(true)
    this.win.loadURL(`http://localhost:${process.env.ELECTRON_WEB_SERVER_PORT}/desktoplyrics`)

    this.win.once('ready-to-show', () => {
      this.win && this.win.show()
    })
    this.win.on('close', () => {
      pWin.webContents.send(IpcChannels.SetDesktopLyric)
      handleLyricsWinClose()
    })
    // this.win.on('closed', () => {
    //   ipcMain.removeListener(IpcChannels.PinDesktopLyric, handle)
    //   this.win && this.win.close();
    // });
  }

  registerIPCListeners() {
    // 在窗口关闭时解除 'PinDesktopLyric' 事件的监听
    this.win?.on('closed', () => {
      ipcMain.removeHandler(IpcChannels.PinDesktopLyric)
      ipcMain.removeListener(IpcChannels.PinDesktopLyric, this.handlePinDesktopLyrics)
      this.win && this.win.close()
    })
  }

  handlePinDesktopLyrics(win: BrowserWindow) {
    // PinDesktopLyric
    handle(IpcChannels.PinDesktopLyric, () => {
      if (win && !win.isDestroyed()) {
        win.setMovable(!win.movable)
        //
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
