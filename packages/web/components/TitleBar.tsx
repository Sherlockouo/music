import Icon from './Icon'
import { IpcChannels } from '@/shared/IpcChannels'
import useIpcRenderer from '@/web/hooks/useIpcRenderer'
import { useState } from 'react'
import { css, cx } from '@emotion/css'
import { useSnapshot } from 'valtio'
import uiStates from '../states/uiStates'
import settings from '@/web/states/settings'

const Controls = () => {
  const [isMaximized, setIsMaximized] = useState(false)
  const { closeWindowInMinimize } = useSnapshot(settings)

  useIpcRenderer(IpcChannels.IsMaximized, (e, value) => {
    setIsMaximized(value)
    uiStates.fullscreen = value
  })

  const minimize = () => {
    window.ipcRenderer?.send(IpcChannels.Minimize)
  }

  const maxRestore = () => {
    window.ipcRenderer?.send(IpcChannels.MaximizeOrUnmaximize)
  }

  const close = () => {
    window.ipcRenderer?.send(IpcChannels.Close)
  }

  const hide = () => {
    window.ipcRenderer?.send(IpcChannels.Hide)
  }

  const classNames = cx(
    'flex items-center justify-center dark:text-white text-neutral hover:text-neutral-300 hover:bg-neutral-100/20 dark:hover:text-white dark:hover:bg-white/20 transition duration-400',
    css`
      height: 28px;
      width: 48px;
      border-radius: 4px;
    `
  )

  return (
    <div className='app-region-no-drag flex h-full items-center'>
      <button onClick={minimize} className={classNames}>
        <Icon className='h-3 w-3' name='windows-minimize' />
      </button>
      <button onClick={maxRestore} className={classNames}>
        <Icon className='h-3 w-3' name={isMaximized ? 'windows-un-maximize' : 'windows-maximize'} />
      </button>
      <button
        onClick={closeWindowInMinimize ? hide : close}
        className={cx(
          classNames,
          css`
            // border-radius: 4px 22px 4px 4px;
            margin-right: 4px;
          `
        )}
      >
        <Icon className='h-3 w-3' name='windows-close' />
      </button>
    </div>
  )
}

const TitleBar = () => {
  return (
    <div className='app-region-drag fixed z-30'>
      <div className='flex h-9 w-screen items-center justify-between'>
        <div></div>
        <Controls />
      </div>
    </div>
  )
}

export default TitleBar
