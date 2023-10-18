import settings from '@/web/states/settings'
import { changeAccentColor } from '@/web/utils/theme'
import { useSnapshot } from 'valtio'
import { cx, css } from '@emotion/css'
import { BlockDescription, BlockTitle, Button, Option, OptionText, Switch } from './Controls'
import { useTranslation } from 'react-i18next'
import uiStates from '@/web/states/uiStates'

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

const ChangeLyricBackground = () => {
  const { showBackgroundImage } = useSnapshot(settings)
  const { t, i18n } = useTranslation()
  return (
    <>
      <div>
        <Option>
          <OptionText>{t`settings.show-lyric-background-img`}</OptionText>
          <Switch
            enabled={showBackgroundImage}
            onChange={value => (settings.showBackgroundImage = value)}
          />
        </Option>
      </div>
    </>
  )
}

const LayoutBackground = () => {
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

const ShowSongFrequency = () => {
  const { t, i18n } = useTranslation()
  const { showSongFrequency } = useSnapshot(uiStates)
  return (
    <>
      <Option>
        <div className='flex flex-col'>
          <OptionText>{t`common.showSongFrequency`}</OptionText>
          <div>{t`common.showSongFrequencyWarnning`}</div>
        </div>
        <Switch
          enabled={showSongFrequency}
          onChange={value => (uiStates.showSongFrequency = value)}
        ></Switch>
      </Option>
    </>
  )
}

const Appearance = () => {
  return (
    <div
      className={cx(css`
        display: flex;
        flex-direction: column;
      `)}
    >
      <Theme />
      <LayoutBackground />
      <ShowSongFrequency />
    </div>
  )
}

export default Appearance
