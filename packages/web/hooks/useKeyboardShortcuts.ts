import { useMemo } from 'react'
import useOSPlatform from './useOSPlatform'
import useSettings from './useSettings'

const useKeyboardShortcuts = () => {
  const { keyboardShortcuts } = useSettings()
  const platform = useOSPlatform()

  const shortcuts = useMemo(() => {
    return keyboardShortcuts[platform]
  }, [platform, keyboardShortcuts])

  return shortcuts
}

export default useKeyboardShortcuts
