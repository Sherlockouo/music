import {
  app,
  BrowserWindow,
  Menu,
  MenuItem,
  MenuItemConstructorOptions,
  shell,
  WebContents,
} from 'electron'
import { isMac } from './env'
import { logsPath } from './utils'
import { exec } from 'child_process'
import log from './log'
import { IpcChannels } from '@/shared/IpcChannels'
import { formatForAccelerator, readKeyboardShortcuts } from './keyboardShortcuts'

log.info('[electron] menu.ts')

export const createMenu = (webContexts: WebContents) => {
  const shortcuts = readKeyboardShortcuts()

  const template: Array<MenuItemConstructorOptions | MenuItem> = [
    { role: 'appMenu' },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    {
      id: 'controls',
      label: '控制',
      submenu: [
        {
          id: 'playPause',
          label: '播放/暂停',
          click: () => {
            webContexts.send(IpcChannels.PlayOrPause)
          },
          accelerator: formatForAccelerator(shortcuts?.playPause[0]) ?? undefined,
        },
        {
          id: 'nextSong',
          label: '下一首',
          click: () => {
            webContexts.send(IpcChannels.Next)
          },
          accelerator: formatForAccelerator(shortcuts?.next[0]) ?? undefined,
        },
        {
          id: 'previousSong',
          label: '上一首',
          click: () => {
            webContexts.send(IpcChannels.Previous)
          },
          accelerator: formatForAccelerator(shortcuts?.previous[0]) ?? undefined,
        },
        {
          id: 'favoriteSong',
          label: '喜欢',
          click: () => {
            webContexts.send(IpcChannels.Like)
          },
          accelerator: formatForAccelerator(shortcuts?.favorite[0]) ?? undefined,
        },
      ],
    },
    { role: 'windowMenu' },
    {
      label: '帮助',
      submenu: [
        {
          label: '打开日志文件目录',
          click: async () => {
            if (isMac) {
              exec(`open "${logsPath}"`)
            } else {
              // TODO: 测试Windows和Linux是否能正确打开日志目录
              shell.openPath(logsPath)
            }
          },
        },
        {
          label: '打开应用数据目录',
          click: async () => {
            const path = app.getPath('userData')
            if (isMac) {
              exec(`open ${path}`)
            } else {
              // TODO: 测试Windows和Linux是否能正确打开日志目录
              shell.openPath(path)
            }
          },
        },
        {
          label: '打开开发者工具',
          click: async () => {
            webContexts.openDevTools()
          },
        },
        {
          label: '反馈问题',
          click: async () => {
            await shell.openExternal('https://github.com/qier222/YesPlayMusic/issues/new')
          },
        },
        { type: 'separator' },
        {
          label: '访问 GitHub 仓库',
          click: async () => {
            await shell.openExternal('https://github.com/qier222/YesPlayMusic')
          },
        },
        {
          label: '访问论坛',
          click: async () => {
            await shell.openExternal('https://github.com/qier222/YesPlayMusic/discussions')
          },
        },
        {
          label: '加入交流群',
          click: async () => {
            await shell.openExternal('https://github.com/qier222/YesPlayMusic/discussions')
          },
        },
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)

  Menu.setApplicationMenu(menu)
}
