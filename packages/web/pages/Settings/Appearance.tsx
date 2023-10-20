import settings from '@/web/states/settings'
import { changeAccentColor } from '@/web/utils/theme'
import { useSnapshot } from 'valtio'
import { cx, css } from '@emotion/css'
import { BlockDescription, BlockTitle, Button, Option, OptionText, Switch } from './Controls'
import { useTranslation } from 'react-i18next'
import uiStates from '@/web/states/uiStates'
import AccentColor from '@/web/components/Appearence/AccentColor'



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
