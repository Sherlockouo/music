import Icon from '../Icon'
import { IpcChannels } from '@/shared/IpcChannels'
import { css, cx } from '@emotion/css'
import {useState} from 'react'
import Pin from '@/web/components/Tools/Pin'
import {pinLyricsWindow} from '@/web/utils/ipcRender'
import { toast } from 'react-hot-toast'
const Controls = () => {
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
    'h-[28px] w-[48px] rounded-[4px]'
  )

  return (
    <div className='app-region-drag flex h-full justify-end items-center w-full backdrop-blur-3xl'>
      <button onClick={minimize} className={classNames}>
        <Icon className='h-3 w-3' name='windows-minimize' />
      </button>
      <div
              className={cx('iterms-center right-0 h-12 w-12 pr-5')}
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
              <Pin
                className={cx(
                  'rounded-full transition duration-400 hover:bg-white dark:hover:bg-neutral-100',
                  pin && 'text-brand-500',
                  !pin && 'text-neutral-300'
                )}
              />
            </div>
      <button
        onClick={close}
        className={cx(
          classNames,
          css`
            border-radius: 4px 22px 4px 4px;
            margin-right: 4px;
          `
        )}
      >
        <Icon className='h-3 w-3' name='windows-close' />
      </button>
    </div>
  )
}

const LyricsWindowTitleBar = () => {
  return (
    <div className='app-region-drag fixed z-30'>
      <div className='flex h-9 w-screen items-center justify-between'>
        <div></div>
        <Controls />
      </div>
    </div>
  )
}

export default LyricsWindowTitleBar
