import settings from '@/web/states/settings'
import { changeAccentColor } from '@/web/utils/theme'
import { useSnapshot } from 'valtio'
import { cx, css } from '@emotion/css'
import { useTranslation } from 'react-i18next'
import { syncAccentColor } from '@/web/utils/ipcRender'

const AccentColor = () => {
  const { t, i18n } = useTranslation()
  const colors = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    amber: 'bg-amber-500',
    yellow: 'bg-yellow-500',
    lime: 'bg-lime-500',
    green: 'bg-green-500',
    emerald: 'bg-emerald-500',
    teal: 'bg-teal-500',
    cyan: 'bg-cyan-500',
    sky: 'bg-sky-500',
    blue: 'bg-blue-500',
    indigo: 'bg-indigo-500',
    violet: 'bg-violet-500',
    purple: 'bg-purple-500',
    fuchsia: 'bg-fuchsia-500',
    pink: 'bg-pink-500',
    rose: 'bg-rose-500',
  }

  const changeColor = (color: string) => {
    settings.accentColor = color
    syncAccentColor(color)
    changeAccentColor(color)
  }

  const accentColor = useSnapshot(settings).accentColor
  return (
    <div className='mt-4 flex  flex-row items-center'>
      <div className='flex w-full   min-w-[93px] items-center'>{t`settings.accent-color`}</div>
      <div className=' flex w-full flex-wrap items-center justify-center'>
        {Object.entries(colors).map(([color, bg]) => (
          <div
            key={color}
            className={cx(
              bg,
              'bg-data-accent-color-500 mr-2.5 mb-1  flex h-5 w-5 items-center justify-center rounded-full'
            )}
            onClick={() => changeColor(color)}
          >
            {color === accentColor && (
              <div className='h-1.5 w-1.5 rounded-full bg-black dark:bg-white'></div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default AccentColor
