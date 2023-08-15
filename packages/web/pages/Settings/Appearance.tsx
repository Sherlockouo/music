import settings from '@/web/states/settings'
import { changeAccentColor } from '@/web/utils/theme'
import { useSnapshot } from 'valtio'
import { cx,css } from '@emotion/css'
import { BlockDescription, BlockTitle, Button, Option, OptionText, Switch } from './Controls'
import { useTranslation } from 'react-i18next'

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
    changeAccentColor(color)
  }

  const accentColor = useSnapshot(settings).accentColor
  return (
    <div className='mt-4'>
      <div className='mb-2 dark:text-white'>{t`settings.accent-color`}</div>
      <div className=' flex items-center'>
        {Object.entries(colors).map(([color, bg]) => (
          <div
            key={color}
            className={cx(bg, 'mr-2.5 flex h-5 w-5 items-center justify-center rounded-full')}
            onClick={() => changeColor(color)}
          >
            {color === accentColor && <div className='h-1.5 w-1.5 rounded-full bg-white'></div>}
          </div>
        ))}
      </div>
    </div>
  )
}

const Theme = () => {
  const { t, i18n } = useTranslation()
  return (
    <>
      <div className='text-xl font-medium text-gray-800 dark:text-white/70'>{t`settings.theme`}</div>
      <div className='h-px w-full bg-black/5 dark:bg-white/10'></div>
      <AccentColor />
      {/* <div className='h-px w-full bg-black/5 dark:bg-white/10'></div> */}
    </>
  )
}

const ChangeLyricBackground = () =>{
  const {showLyricBackground} = useSnapshot(settings)
  const { t, i18n } = useTranslation()
  return (
    <>
     <Option>
        <OptionText>{t`settings.show-lyric-background-img`}</OptionText>
        <Switch
          enabled={showLyricBackground}
          onChange={value => (settings.showLyricBackground = value)}
        />
      </Option>
    </>
  )
}

const LayoutBackground = () =>{
  const { t, i18n } = useTranslation()
  return (
    <>
    <div className='mt-3 h-px w-full bg-black/5 dark:bg-white/10'></div>
      <div className='mb-2 dark:text-white'>
        <ChangeLyricBackground />
      </div>
      <div className='mt-3 h-px w-full bg-black/5 dark:bg-white/10'></div>
    </>
  )
}
1
const Appearance = () => {
  return (
    <div className={cx(css`
      display: flex;
      flex-direction: column;

      `
    )}>
      <Theme />
      <LayoutBackground />
    </div>
  )
}

export default Appearance
