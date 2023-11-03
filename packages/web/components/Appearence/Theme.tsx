import { changeTheme } from '@/web/utils/theme'
import Icon from '../Icon'
import { useSnapshot } from 'valtio'
import settings from '@/web/states/settings'
import { syncTheme } from '@/web/utils/ipcRender'
const Theme = () => {
  const { theme } = useSnapshot(settings)
  return (
    <>
      <div
        className='app-region-no-drag flex h-12 w-12 items-center justify-center rounded-full  bg-white/60 text-neutral-500 transition duration-400 hover:bg-white dark:bg-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-100'
        onClick={() => {
          if (theme == 'dark') {
            changeTheme('light')
            settings.theme = 'light'
          } else {
            changeTheme('dark')
            settings.theme = 'dark'
          }
          syncTheme(settings.theme)
        }}
      >
        <Icon name='sun' className='h-9 w-9 text-white' />
      </div>
    </>
  )
}

export default Theme
