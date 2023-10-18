import { IpcChannels } from '@/shared/IpcChannels'

export const checkAPPUpdate = async () => {
  const res = await window.ipcRenderer?.invoke(IpcChannels.CheckUpdate)
  console.log('log', res);
}
