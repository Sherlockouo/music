import path from 'path'
import { app, BrowserWindow, Menu, MenuItemConstructorOptions, nativeImage, Tray } from 'electron'
import { IpcChannels } from '@/shared/IpcChannels'
import { RepeatMode } from '@/shared/playerDataTypes'
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import zhCN from '../../web/i18n/locales/zh-cn.json'
import enUS from '../../web/i18n/locales/en-us.json'
import { appName } from './env'
const fs = require('fs')
const axios = require('axios')
const https = require('https')
import log from './log'

log.info('[electron] tray.ts')

export const supportedLanguages = ['zh-CN', 'en-US'] as const
export type SupportedLanguage = typeof supportedLanguages[number]

export const getInitLanguage = async () => {
  console.log('[ appConsoleLog ] getInitLanguage');
  try {
    const settings = JSON.parse(localStorage.getItem('settings') || '{}')
    if (supportedLanguages.includes(settings.language)) {
      console.log('[ appConsoleLog ] settings.language ', settings.language);
      return settings.language
    }
    console.warn('[ appConsoleLog ] settings.language NOT FOUND!');
  } catch (e) {
  }

  // 返回一个 Promise 对象，使调用方可以等待异步操作完成
  return new Promise((resolve) => {
    app.whenReady().then(() => {
      if (app.isReady()) {
        console.log('[ appConsoleLog ] app.isReady()');
      }
      // 判断navigator.language是否为空
      if(typeof navigator === 'undefined') {
        resolve('zh-CN');
      }
      else if ( navigator.language.startsWith('zh-')) {
        resolve('zh-CN');
      } else {
        resolve('en-US');
      }
    });
  });
};

async function initializeI18n() {
  const language = await getInitLanguage();

  i18next.use(initReactI18next).init({
    lng: language, // 设置默认语言
    fallbackLng: 'en-US', // 设置回退语言
    resources: {
      'en-US': { translation: enUS }, // 设置英文翻译资源
      'zh-CN': { translation: zhCN }, // 设置中文翻译资源
    },
    interpolation: {
      escapeValue: false, // 如果你的翻译中包含 HTML 标签等，可以设置为 false
    },
  });
}
initializeI18n();

const iconDirRoot =
  process.env.NODE_ENV === 'development'
    ? path.join(process.cwd(), './src/main/assets/icons/tray')
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
}

function createNativeImage(filename: string) {
  return nativeImage.createFromPath(path.join(iconDirRoot, filename))
}

function createMenuTemplate(win: BrowserWindow): MenuItemConstructorOptions[] {
  const labelPlay = i18next.t('tray.play')
  const template: MenuItemConstructorOptions[] =
    process.platform === 'linux'
      ? [
        {
          label: '显示主面板',
          click: () => win.show(),
        },
        {
          type: 'separator',
        },
      ]
      : []

  return template.concat([
    {
      label: labelPlay,
      click: () => win.webContents.send(IpcChannels.Play),
      icon: createNativeImage('play.png'),
      id: MenuItemIDs.Play,
    },
    {
      label: '暂停',
      click: () => win.webContents.send(IpcChannels.Pause),
      icon: createNativeImage('pause.png'),
      id: MenuItemIDs.Pause,
      visible: false,
    },
    {
      label: '上一首',
      click: () => win.webContents.send(IpcChannels.Previous),
      icon: createNativeImage('left.png'),
    },
    {
      label: '下一首',
      click: () => win.webContents.send(IpcChannels.Next),
      icon: createNativeImage('right.png'),
    },
    {
      label: '循环模式',
      icon: createNativeImage('repeat.png'),
      submenu: [
        {
          label: '关闭循环',
          click: () => win.webContents.send(IpcChannels.Repeat, RepeatMode.Off),
          id: RepeatMode.Off,
          checked: true,
          type: 'radio',
        },
        {
          label: '列表循环',
          click: () => win.webContents.send(IpcChannels.Repeat, RepeatMode.On),
          id: RepeatMode.On,
          type: 'radio',
        },
        {
          label: '单曲循环',
          click: () => win.webContents.send(IpcChannels.Repeat, RepeatMode.One),
          id: RepeatMode.One,
          type: 'radio',
        },
      ],
    },
    {
      label: '加入喜欢',
      click: () => win.webContents.send(IpcChannels.Like),
      icon: createNativeImage('like.png'),
      id: MenuItemIDs.Like,
    },
    {
      label: '取消喜欢',
      click: () => win.webContents.send(IpcChannels.Like),
      icon: createNativeImage('unlike.png'),
      id: MenuItemIDs.Unlike,
      visible: false,
    },
    {
      label: '退出',
      click: () => app.exit(),
      icon: createNativeImage('exit.png'),
    },
  ])
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
    this._template = createMenuTemplate(this._win)
    this._contextMenu = Menu.buildFromTemplate(this._template)

    this._updateContextMenu()
    this.setTooltip(appName)

    this._tray.on('click', () => win.show())
  }

  private _updateContextMenu() {
    this._tray.setContextMenu(this._contextMenu)
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
