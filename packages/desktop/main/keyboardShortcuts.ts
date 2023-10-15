import { WebContents } from 'electron'
import store from './store'
import { getPlatform } from './utils'
import { createMenu } from './menu'

export const readKeyboardShortcuts = () => {
  const platform = getPlatform()

  return store.get(`settings.keyboardShortcuts.${platform}`) as KeyboardShortcuts
}

export const bindingKeyboardShortcuts = (
  webContexts: WebContents,
  shortcuts?: KeyboardShortcuts
) => {
  if (!shortcuts) {
    shortcuts = readKeyboardShortcuts()
  } else {
    store.set(`settings.keyboardShortcuts.${getPlatform()}`, shortcuts)
  }

  console.log({ shortcuts })

  createMenu(webContexts)
}

export const formatForAccelerator = (storeText?: string[]) => {
  if (!storeText) {
    return storeText
  }

  return storeText.join('+')
}
