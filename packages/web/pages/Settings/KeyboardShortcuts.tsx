import { t } from 'i18next'
import { FC } from 'react'
import settings, { KeyboardShortcuts } from '@/web/states/settings'
import useSettings from '@/web/hooks/useSettings'
import useKeyboardShortcuts from '@/web/hooks/useKeyboardShortcuts'
import { BlockTitle, OptionText, Option, Switch } from './Controls'

const ShortcutSwitchSettings = () => {
  const {
    keyboardShortcuts: { globalEnabled },
  } = useSettings()

  return (
    <>
      <BlockTitle>{t`settings.keyboard-shortcuts.title`}</BlockTitle>
      <Option>
        <OptionText>{t`settings.keyboard-shortcuts.enable-global`}</OptionText>
        <Switch
          enabled={globalEnabled}
          onChange={value => (settings.keyboardShortcuts.globalEnabled = value)}
        />
      </Option>
    </>
  )
}

const ShortcutBindingInput: FC<{
  value: string | null
  onChange?: (value: string | null) => void
}> = ({ value, onChange }) => {
  return (
    <div className='mx-2 rounded-lg bg-stone-400/20 py-1 px-3 font-mono backdrop-blur '>
      {value}
    </div>
  )
}

const ShortcutItemBindings: FC<{ fnKey: keyof KeyboardShortcuts; name: string }> = ({
  fnKey,
  name,
}) => {
  const keyboardShortcuts = useKeyboardShortcuts()

  console.log(keyboardShortcuts, fnKey)

  return (
    <tr className='h-10 rounded-lg hover:bg-stone-100/20 hover:dark:bg-stone-600/10'>
      <td className='px-2 text-left font-normal'>{name}</td>
      <td className='text-center font-normal'>
        <ShortcutBindingInput value={keyboardShortcuts[fnKey][0]} />
      </td>
      <td className='text-center font-normal'>
        <ShortcutBindingInput value={keyboardShortcuts[fnKey][1]} />
      </td>
    </tr>
  )
}

const ShortcutBindings = () => {
  return (
    <table className='mt-7 w-full'>
      <thead>
        <tr className='h-10  text-black/50 dark:text-white/50'>
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
        <ShortcutItemBindings fnKey='switchVisibility' name={t`common.hide-show-player`} />
      </tbody>
    </table>
  )
}

const KeyboardShortcuts: FC = () => {
  return (
    <>
      <ShortcutSwitchSettings />
      <ShortcutBindings />
    </>
  )
}

export default KeyboardShortcuts
