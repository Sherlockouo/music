import { IpcChannels } from '@/shared/IpcChannels'
import { useAsync } from 'react-use'

export const supportedOSPlatform = ['darwin', 'win32', 'linux'] as const
export type SupportedOSPlatform = typeof supportedOSPlatform[number]

const getPlatform = async () => {
  return await window.ipcRenderer?.invoke(IpcChannels.GetPlatform)
}

const useOSPlatform = (): SupportedOSPlatform => {
  if (!window.ipcRenderer) {
    return supportedOSPlatform[0]
  }

  const { value: platform } = useAsync(getPlatform, [])

  return platform ?? supportedOSPlatform[0]
}

export default useOSPlatform
