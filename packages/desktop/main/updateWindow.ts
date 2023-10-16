import { BrowserWindow, ipcMain, app,BrowserWindowConstructorOptions, App } from 'electron'
import { join } from 'path'
import store from './store'


export class UpdateWindow {
    win: BrowserWindow | null = null

    constructor() {
      this.createWindow();
    }
  
    createWindow() {
      const options:BrowserWindowConstructorOptions = {
        title: "Lyrics",
        webPreferences: {
          preload: join(__dirname, 'rendererPreload.js'),
          nodeIntegration: true,
        },
        width: store.get('lyricsWindow.width'),
        height: store.get('lyricsWindow.height'),
        minWidth: 1240,
        minHeight: 800,
        titleBarStyle: 'hidden',
        trafficLightPosition: { x: 12, y: 6 },
        frame: false,
        fullscreenable: true,
        resizable: false,
        // transparent: true, 
        backgroundColor: 'rgba(0, 0, 0, 0)',
        show: false,
      };
  
      if (store.get('lyricsWindow')) {
        options.x = store.get('lyricsWindow.x');
        options.y = store.get('lyricsWindow.y');
      }
  
      this.win = new BrowserWindow(options);
      this.win.webContents.setAudioMuted(true);
      this.win.loadURL('https://github.com/sherlockouo/music/releases/');
  
      this.win.once('ready-to-show', () => {
        this.win && this.win.show()
      });
  
      this.win.on('closed', () => {
        this.win && this.win.close();
      });
    }
  }
  
  