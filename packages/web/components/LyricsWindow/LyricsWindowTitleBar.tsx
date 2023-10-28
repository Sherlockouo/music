import Icon from '../Icon'
import { IpcChannels } from '@/shared/IpcChannels'
import { css, cx } from '@emotion/css'
import { useState } from 'react'
import Pin from '@/web/components/Tools/Pin'
import { pinLyricsWindow } from '@/web/utils/ipcRender'
import { toast } from 'react-hot-toast'
const Controls = () => {
  const isMac = window.env?.isMac as boolean
  const [pin, setPin] = useState(false)

  const minimize = () => {
    window.ipcRenderer?.send(IpcChannels.LyricsWindowMinimize)
  }

  // const maxRestore = () => {
  //   window.ipcRenderer?.send(IpcChannels.MaximizeOrUnmaximize)
  // }

  const close = () => {
    window.ipcRenderer?.send(IpcChannels.LyricsWindowClose)
  }

  const classNames = cx(
    'flex items-center app-region-no-drag  justify-center dark:text-white text-neutral hover:text-neutral-300 hover:bg-neutral-100/20 dark:hover:text-white dark:hover:bg-white/20 transition duration-400',
    'h-[28px] w-[48px]'
  )

  return (
    <div className='app-region-drag flex h-full w-full items-center justify-end rounded-lg bg-white  dark:bg-black'>
      {!isMac && (
        <button onClick={minimize} className={classNames}>
          <Icon className='h-3 w-3' name='windows-minimize' />
        </button>
      )}
      <button
        className={cx(classNames, pin && 'text-brand-500', !pin && 'text-neutral-300')}
        onClick={async () => {
          const pined = pinLyricsWindow()
          setPin((await pined).pin)
          if (pin) {
            toast.success('unpined lyric winows')
          } else {
            toast.success('pined lyric winows')
          }
        }}
      >
        <Icon name='pin' className='h-3 w-3' />
      </button>
      {!isMac && (
        <button
          onClick={close}
          className={cx(
            classNames,
            css`
              margin-right: 4px;
            `
          )}
        >
          <Icon className='h-3 w-3' name='windows-close' />
        </button>
      )}
    </div>
  )
}

const LyricsWindowTitleBar = () => {
  return (
    <div className='app-region-drag fixed z-30 bg-transparent  dark:text-white/80 '>
      <div className='flex h-9 w-screen items-center justify-between'>
        <Controls />
      </div>
    </div>
  )
}

export default LyricsWindowTitleBar
