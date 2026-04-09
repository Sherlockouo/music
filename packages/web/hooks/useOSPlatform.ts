import { IpcChannels } from '@/shared/IpcChannels'
import { useAsync } from 'react-use'

export const supportedOSPlatform = ['darwin', 'win32', 'linux'] as const
export type SupportedOSPlatform = typeof supportedOSPlatform[number]

const detectPlatform = (): SupportedOSPlatform => {
  const userAgent = navigator.userAgent.toLowerCase()
  const platform = navigator.platform?.toLowerCase() || ''

  if (platform.includes('win32') || platform.includes('win64') || userAgent.includes('windows')) {
    return 'win32'
  }
  if (platform.includes('mac') || userAgent.includes('macintosh')) {
    return 'darwin'
  }
  return 'linux'
}

const getPlatform = async () => {
  return await window.ipcRenderer?.invoke(IpcChannels.GetPlatform)
}

const useOSPlatform = (): SupportedOSPlatform => {
  if (!window.ipcRenderer) {
    return detectPlatform()
  }

  const { value: platform } = useAsync(getPlatform, [])

  return platform ?? detectPlatform()
}

export default useOSPlatform
