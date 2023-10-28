import { IpcChannels } from '@/shared/IpcChannels'
import { toast } from 'react-hot-toast'

export const checkAPPUpdate = async () => {
  const res = await window.ipcRenderer?.invoke(IpcChannels.CheckUpdate)
}

export const pinLyricsWindow = async (): Promise<{ pin: boolean }> => {
  const pined = await window.ipcRenderer?.invoke(IpcChannels.PinDesktopLyric)
  return {
    pin: pined as boolean,
  }
}

export const syncAccentColor = async (color: string) => {
  window.ipcRenderer?.send(IpcChannels.SyncAccentColor, {
    color: color,
  })
  return
}

export const syncTheme = async (theme: string) => {
  window.ipcRenderer?.send(IpcChannels.SyncTheme, {
    theme: theme,
  })
  return
}
