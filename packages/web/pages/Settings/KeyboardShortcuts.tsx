import Icon from '@/web/components/Icon'
import useKeyboardShortcuts from '@/web/hooks/useKeyboardShortcuts'
import useOSPlatform from '@/web/hooks/useOSPlatform'
import useSettings from '@/web/hooks/useSettings'
import settings from '@/web/states/settings'
import { t } from 'i18next'
import { FC, KeyboardEventHandler, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { BlockTitle, Button, Option, OptionText, Switch } from './Controls'
import { IpcChannels } from '@/shared/IpcChannels'
import { isEqual, last } from 'lodash-es'
import { getKeyboardShortcutDefaultSettings } from '@/shared/defaultSettings'

const modifierKeys = ['Control', 'Alt', 'Shift', 'Meta', 'Super', 'Cmd', 'Option']
const keyNameMap = {
  darwin: new Map<string, string>([
    ['Control', '⌃'],
    ['Alt', '⌥'],
    ['Shift', '⇧'],
    ['Meta', '⌘'],
    ['Super', '⌘'],
    ['Option', '⌥'],
    ['Cmd', '⌘'],
    ['Left', '◀'],
    ['Right', '▶'],
    ['Up', '▲'],
    ['Down', '▼'],
    ['Space', '␣'],
  ]),
  linux: new Map<string, string>([
    ['Control', 'Ctrl'],
    ['Alt', 'Alt'],
    ['Shift', 'Shift'],
    ['Meta', 'Super'],
    ['Super', 'Super'],
    ['Option', 'Alt'],
    ['Cmd', 'Super'],
    ['Left', '←'],
    ['Right', '→'],
    ['Up', '↑'],
    ['Down', '↓'],
    ['Space', '␣'],
  ]),
  win32: new Map<string, string>([
    ['Control', 'Ctrl'],
    ['Alt', 'Alt'],
    ['Shift', 'Shift'],
    ['Meta', 'Win'],
    ['Super', 'Win'],
    ['Option', 'Alt'],
    ['Cmd', 'Ctrl'],
    ['Left', '←'],
    ['Right', '→'],
    ['Up', '↑'],
    ['Down', '↓'],
    ['Space', '␣'],
  ]),
}

const ShortcutSwitchSettings = () => {
  const platform = useOSPlatform()
  const {
    keyboardShortcuts: { globalEnabled },
  } = useSettings()

  const onChange = (value: boolean) => {
    settings.keyboardShortcuts.globalEnabled = value
    window.ipcRenderer?.invoke(IpcChannels.BindKeyboardShortcuts, {
      shortcuts: JSON.parse(JSON.stringify(settings.keyboardShortcuts)),
    })
  }

  return (
    <>
      <BlockTitle>{t`settings.keyboard-shortcuts.title`}</BlockTitle>
      <Option>
        <OptionText>{t`settings.keyboard-shortcuts.enable-global`}</OptionText>
        <Switch enabled={globalEnabled} onChange={onChange} />
      </Option>
    </>
  )
}

const ShortcutBindingInput: FC<{
  value: string[] | null
  onChange?: (value: string[] | null) => void
}> = ({ value, onChange }) => {
  const [inputValue, setInputValue] = useState(value)
  const [isBinding, setBinding] = useState(false)
  const platform = useOSPlatform()

  useEffect(() => {
    setInputValue(value)
  }, [value])

  const textOrKeys = useMemo(() => {
    if (isBinding && inputValue === null) {
      return t`settings.keyboard-shortcuts.binding-input-waiting-keydown-placeholder`
    }

    if (inputValue === null) {
      return t`settings.keyboard-shortcuts.binding-input-unbound`
    }

    return inputValue
  }, [inputValue, isBinding])

  const clear = () => {
    setInputValue(null)
    onChange?.(null)
  }

  const startBinding = () => {
    setInputValue(null)
    setBinding(true)
  }

  const onKeyDown: KeyboardEventHandler = e => {
    if (!isBinding) {
      return
    }

    e.preventDefault()
    e.stopPropagation()

    if (e.key === 'Escape') {
      clear()
      return
    }

    if (e.key === 'Enter') {
      onChange?.(inputValue)
      setBinding(false)
      return
    }

    let arr = new Array<string>()

    if (e.metaKey && platform === 'darwin') {
      arr.push('Cmd')
    } else if (e.metaKey && platform !== 'darwin') {
      arr.push('Super')
    }

    if (e.altKey && platform === 'darwin') {
      arr.push('Option')
    } else if (e.altKey && platform !== 'darwin') {
      arr.push('Alt')
    }

    if (e.ctrlKey) {
      arr.push('Control')
    }

    if (e.shiftKey) {
      arr.push('Shift')
    }

    if (!modifierKeys.includes(e.code)) {
      arr.push(e.code)
    }

    setInputValue(arr)
  }

  const onBlur = () => {
    if (!isBinding) {
      return
    }

    setInputValue(value)
    setBinding(false)

    if (inputValue !== null) {
      onChange?.(inputValue)
    }
  }

  const keys = useMemo(() => {
    if (typeof textOrKeys === 'string') {
      return <small className='opacity-70'>{textOrKeys}</small>
    }

    return (
      <span className='flex gap-1'>
        {textOrKeys
          .map((it, index) => [
            index === 0 ? null : <span key={`connector-${index}`}>+</span>,
            <kbd
              key={it}
              className='inline-block min-w-[2em] rounded-full bg-stone-50/50 px-2 py-0.5 text-sm dark:bg-stone-500/50'
            >
              {keyNameMap[platform]?.get(it) ??
                it.replace(/^Key(.)$/, '$1').replace(/^Digit(.)$/, '$1')}
            </kbd>,
          ])
          .flat()
          .filter(Boolean)}
      </span>
    )
  }, [textOrKeys])

  return (
    <div
      className='group/binding-input mx-2 flex items-center gap-2 rounded-lg bg-stone-400/20 py-1 px-3 font-mono outline-none backdrop-blur'
      onClick={startBinding}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      tabIndex={0}
    >
      {keys}
      <button
        onClick={clear}
        className='ml-auto'
        title={t`settings.keyboard-shortcuts.item-clear`!}
      >
        <Icon
          name='x'
          className='ml-auto box-content h-4 w-4 rounded-full p-1 text-stone-500 opacity-0 transition-opacity hover:bg-stone-400/20 group-hover/binding-input:opacity-100 dark:text-stone-400'
        />
      </button>
    </div>
  )
}

const ShortcutItemBindings: FC<{
  fnKey: keyof KeyboardShortcuts
  name: string
  hideLocal?: boolean
}> = ({ fnKey, name, hideLocal = false }) => {
  const keyboardShortcuts = useKeyboardShortcuts()
  const platform = useOSPlatform()

  const updateBinding = (index: 0 | 1) => {
    return (value: string[] | null) => {
      if (value && index === 0) {
        if (modifierKeys.includes(last(value)!) || value.length < 1) {
          toast.error(t`settings.keyboard-shortcuts.local-shortcut-invalid`)
          return
        }
      }

      if (value && index === 1) {
        if (modifierKeys.includes(last(value)!) || value.length <= 1) {
          toast.error(t`settings.keyboard-shortcuts.global-shortcut-invalid`)
          return
        }
      }

      const conflicted =
        value !== null &&
        Object.entries(settings.keyboardShortcuts[platform]).some(
          ([key, v]: [string, KeyboardShortcutItem]) => {
            return (key !== fnKey && isEqual(v[index], value)) || isEqual(v[(index + 1) % 2], value)
          }
        )

      if (conflicted) {
        toast.error(t`settings.keyboard-shortcuts.keyboard-shortcut-in-used`)
        return
      }

      settings.keyboardShortcuts[platform][fnKey][index] = value
      window.ipcRenderer
        ?.invoke(IpcChannels.BindKeyboardShortcuts, {
          shortcuts: JSON.parse(JSON.stringify(settings.keyboardShortcuts)),
        })
        .catch(error => {
          console.error(error)
          toast.error(error.message)
        })
    }
  }

  return (
    <tr className='h-10 rounded-lg hover:bg-stone-100/20 hover:dark:bg-stone-600/10'>
      <td className='px-2 text-left font-normal'>{name}</td>
      <td className='text-center font-normal'>
        {hideLocal ? null : (
          <ShortcutBindingInput value={keyboardShortcuts[fnKey][0]} onChange={updateBinding(0)} />
        )}
      </td>
      <td className='text-center font-normal'>
        <ShortcutBindingInput value={keyboardShortcuts[fnKey][1]} onChange={updateBinding(1)} />
      </td>
    </tr>
  )
}

const ShortcutBindings = () => {
  return (
    <table className='mt-7 w-full'>
      <thead>
        <tr className='h-10 font-medium text-black/50 dark:text-white/50'>
          <th className='px-2 text-left font-normal'>{t`settings.keyboard-shortcuts.function`}</th>
          <th className='text-center font-normal'>{t`settings.keyboard-shortcuts.local`}</th>
          <th className='text-center font-normal'>{t`settings.keyboard-shortcuts.global`}</th>
        </tr>
      </thead>
      <tbody>
        <ShortcutItemBindings fnKey='playPause' name={t`player.play-pause`} />
        <ShortcutItemBindings fnKey='next' name={t`player.next`} />
        <ShortcutItemBindings fnKey='previous' name={t`player.previous`} />
        <ShortcutItemBindings fnKey='volumeUp' name={t`player.volume-up`} />
        <ShortcutItemBindings fnKey='volumeDown' name={t`player.volume-down`} />
        <ShortcutItemBindings fnKey='favorite' name={t`player.favorite`} />
        <ShortcutItemBindings
          fnKey='switchVisibility'
          name={t`common.hide-show-player`}
          hideLocal
        />
      </tbody>
    </table>
  )
}

const RestoreFactorySettings = () => {
  const reset = () => {
    toast.success(t`settings.keyboard-shortcuts.restore-factory-settings-success`)
    settings.keyboardShortcuts = getKeyboardShortcutDefaultSettings()
    window.ipcRenderer
      ?.invoke(IpcChannels.BindKeyboardShortcuts, {
        shortcuts: JSON.parse(JSON.stringify(settings.keyboardShortcuts)),
      })
      .catch(error => {
        console.error(error)
        toast.error(error.message)
      })
  }

  return (
    <div className='mt-7 w-full'>
      <Button onClick={reset}>{t('settings.keyboard-shortcuts.restore-factory-settings')}</Button>
    </div>
  )
}

const KeyboardShortcuts: FC = () => {
  return (
    <>
      <ShortcutSwitchSettings />
      <ShortcutBindings />
      <RestoreFactorySettings />
    </>
  )
}

export default KeyboardShortcuts
