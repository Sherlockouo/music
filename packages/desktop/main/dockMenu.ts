import { IpcChannels } from '@/shared/IpcChannels'
import { RepeatMode } from '@/shared/playerDataTypes'
import { BrowserWindow } from 'electron'

const { Menu } = require('electron')

export function createDockMenu(win: BrowserWindow | null) {
  return Menu.buildFromTemplate([
    {
      label: 'PlayOrPause',
      click() {
        win?.webContents.send(IpcChannels.PlayOrPause)
      },
    },
    {
      label: 'Next',
      click() {
        win?.webContents.send(IpcChannels.Next)
      },
    },
    {
      label: 'Previous',
      click() {
        win?.webContents.send(IpcChannels.Previous)
      },
    },
    {
      label: 'Like',
      click() {
        win?.webContents.send(IpcChannels.Like)
      },
    },
    {
      label: 'Repeat',
      click() {
        win?.webContents.send(IpcChannels.Repeat, RepeatMode.On)
      },
    },
    {
      label: 'RepeatOff',
      click() {
        win?.webContents.send(IpcChannels.Repeat, RepeatMode.Off)
      },
    },
    {
      label: 'RepeatOne',
      click() {
        win?.webContents.send(IpcChannels.Repeat, RepeatMode.One)
      },
    },
    {
      label: 'Shuffle',
      click() {
        win?.webContents.send(IpcChannels.Repeat, RepeatMode.Shuffle)
      },
    },
  ])
}
