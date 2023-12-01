import path from 'path'
import { app, BrowserWindow, Menu, MenuItemConstructorOptions, nativeImage, Tray } from 'electron'
import { IpcChannels } from '@/shared/IpcChannels'
import { RepeatMode } from '@/shared/playerDataTypes'
import { appName } from './env'
import log from './log'
import store from './store'

log.info('[electron] tray.ts')

const iconDirRoot =
  process.env.NODE_ENV === 'development'
    ? path.join(process.cwd(), './assets/icons/tray')
    : path.join(__dirname, './assets/icons/tray')

enum MenuItemIDs {
  Play = 'play',
  Pause = 'pause',
  Like = 'like',
  Unlike = 'unlike',
}

export interface YPMTray {
  setTooltip(text: string): void
  setCoverImg(coverImg: string): void
  setLikeState(isLiked: boolean): void
  setPlayState(isPlaying: boolean): void
  setRepeatMode(mode: RepeatMode): void
  updateTray(): void
}

function createNativeImage(filename: string) {
  // log.info("tray icon path "+path.join(iconDirRoot, filename))
  return nativeImage.createFromPath(path.join(iconDirRoot, filename))
}

class YPMTrayImpl implements YPMTray {
  private _win: BrowserWindow
  private _tray: Tray
  private _template: MenuItemConstructorOptions[]
  private _contextMenu: Menu

  constructor(win: BrowserWindow) {
    this._win = win
    const icon = createNativeImage('menu@88.png').resize({
      height: 20,
      width: 20,
    })
    this._tray = new Tray(icon)
    this._template = this.createMenuTemplate(this._win)

    this._contextMenu = Menu.buildFromTemplate(this._template)
    this._updateContextMenu()

    this.setTooltip(appName)

    this._tray.on('click', () => {
      this._win.show()
    })
  }

  updateTray(){
    this._template = this.createMenuTemplate(this._win)

    this._contextMenu = Menu.buildFromTemplate(this._template)
    this._updateContextMenu()
  }

  private _updateContextMenu() {
    this._tray.setContextMenu(this._contextMenu)
  }

  createMenuTemplate(win: BrowserWindow): MenuItemConstructorOptions[] {
    const lang =  store.get("settings.language")
    
    const template: MenuItemConstructorOptions[] =
      process.platform === 'linux'
        ? [
            {
              label: lang === 'en-US' ? 'Show main panel':'显示主面板',
              click: () => win.show(),
            },
            {
              type: 'separator',
            },
          ]
        : []

    return template.concat([
      {
        label: lang === 'en-US' ? 'Play':'播放',
        click: () => {
          win.webContents.send(IpcChannels.Play, {})
          this.setPlayState(true)
        },
        icon: createNativeImage('play.png'),
        visible: true,
        id: MenuItemIDs.Play,
      },
      {
        label: lang === 'en-US' ? 'Pause':'暂停',
        click: () => {
          win.webContents.send(IpcChannels.Pause)
          this.setPlayState(false)
        },
        icon: createNativeImage('pause.png'),
        id: MenuItemIDs.Pause,
        visible: false,
      },
      {
        label: lang === 'en-US' ? 'Prev':'上一首',
        click: () => win.webContents.send(IpcChannels.Previous),
        icon: createNativeImage('left.png'),
      },
      {
        label: lang === 'en-US' ? 'Next':'下一首',
        click: () => win.webContents.send(IpcChannels.Next),
        icon: createNativeImage('right.png'),
      },
      {
        label: lang === 'en-US' ? 'Repeat Mode':'循环模式',
        icon: createNativeImage('repeat.png'),
        submenu: [
          {
            label: lang === 'en-US' ? 'Repeat Off':'关闭循环',
            click: () => win.webContents.send(IpcChannels.Repeat, RepeatMode.Off),
            id: RepeatMode.Off,
            checked: true,
            type: 'radio',
          },
          {
            label: lang === 'en-US' ? 'Repeat On':'列表循环',
            click: () => win.webContents.send(IpcChannels.Repeat, RepeatMode.On),
            id: RepeatMode.On,
            type: 'radio',
          },
          {
            label: lang === 'en-US' ? 'Repeat One':'单曲循环',
            click: () => win.webContents.send(IpcChannels.Repeat, RepeatMode.One),
            id: RepeatMode.One,
            type: 'radio',
          },
          {
            label: lang === 'en-US' ? 'Shuffle':'随机播放',
            click: () => win.webContents.send(IpcChannels.Repeat, RepeatMode.Shuffle),
            id: RepeatMode.Shuffle,
            type: 'radio',
          },
        ],
      },
      {
        label: lang === 'en-US' ? 'Like':'加入喜欢',
        click: () => win.webContents.send(IpcChannels.Like),
        icon: createNativeImage('like.png'),
        id: MenuItemIDs.Like,
      },
      {
        label: lang === 'en-US' ? 'Dislike':'取消喜欢',
        click: () => win.webContents.send(IpcChannels.Like),
        icon: createNativeImage('unlike.png'),
        id: MenuItemIDs.Unlike,
        visible: false,
      },
      {
        label: lang === 'en-US' ? 'Quit':'退出',
        click: () => app.exit(),
        icon: createNativeImage('exit.png'),
      },
    ])
  }

  setTooltip(text: string) {
    this._tray.setToolTip(text)
  }

  setCoverImg(coverImg: string): void {
    // 请求封面图片
    // axios
    //   .get(coverImg, {
    //     responseType: 'arraybuffer',
    //     httpsAgent: new https.Agent({
    //       rejectUnauthorized: false,
    //     }),
    //   })
    //   .then((response) => {
    //     const imagePath = './cover.jpg'
    //     console.log('cover-path ',imagePath);
    //     fs.writeFileSync(imagePath, Buffer.from(response.data));
    //     const coverImage = nativeImage.createFromPath(imagePath);
    //     console.log('cover-path ',coverImage);
    //     this._tray.setImage(coverImage);
    //   })
    //   .catch(() => {
    //     console.error('Failed to load cover image');
    //   });
  }

  setLikeState(isLiked: boolean) {
    this._contextMenu.getMenuItemById(MenuItemIDs.Like)!.visible = !isLiked
    this._contextMenu.getMenuItemById(MenuItemIDs.Unlike)!.visible = isLiked
    this._updateContextMenu()
  }

  setPlayState(isPlaying: boolean) {
    this._contextMenu.getMenuItemById(MenuItemIDs.Play)!.visible = !isPlaying
    this._contextMenu.getMenuItemById(MenuItemIDs.Pause)!.visible = isPlaying
    this._updateContextMenu()
  }

  setRepeatMode(mode: RepeatMode) {
    const item = this._contextMenu.getMenuItemById(mode)
    if (item) {
      item.checked = true
      this._updateContextMenu()
    }
  }
}

export function createTray(win: BrowserWindow): YPMTray {
  return new YPMTrayImpl(win)
}
