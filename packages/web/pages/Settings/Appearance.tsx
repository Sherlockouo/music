import settings from '@/web/states/settings'
import { changeAccentColor } from '@/web/utils/theme'
import { useSnapshot } from 'valtio'
import { cx, css } from '@emotion/css'
import { BlockDescription, BlockTitle, Button, Option, OptionText, Switch } from './Controls'
import { useTranslation } from 'react-i18next'
import AccentColor from '@/web/components/Appearence/AccentColor'
import uiStates from '@/web/states/uiStates'

const Theme = () => {
  const { t, i18n } = useTranslation()
  return (
    <>
      <div className='text-xl font-medium text-gray-800 dark:text-white/70'>{t`settings.theme`}</div>
      <div className='h-px w-full bg-black/5 dark:bg-white/10'></div>
      <AccentColor />
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

const ShowDesktopLyrics = () => {
  const { t, i18n } = useTranslation()
  const { showDeskttopLyrics } = useSnapshot(uiStates)
  return (
    <>
      <Option>
        <div className='flex flex-col'>
          <OptionText>{t`common.showDeskttopLyrics`}</OptionText>
        </div>
        <Switch
          enabled={showDeskttopLyrics}
          onChange={value => (uiStates.showDeskttopLyrics = value)}
        ></Switch>
      </Option>
    </>
  )
}

const ShowDevices = () => {
  const { t, i18n } = useTranslation()
  const { showDevices } = useSnapshot(uiStates)
  return (
    <>
      <Option>
        <div className='flex flex-col'>
          <OptionText>{t`common.showDevices`}</OptionText>
        </div>
        <Switch enabled={showDevices} onChange={value => (uiStates.showDevices = value)}></Switch>
      </Option>
    </>
  )
}
const LyricsBlur = () => {
  const { t, i18n } = useTranslation()
  const { lyricsBlur } = useSnapshot(uiStates)
  return (
    <>
      <Option>
        <div className='flex flex-col'>
          <OptionText>{t`common.lyricsBlur`}</OptionText>
        </div>
        <Switch enabled={lyricsBlur} onChange={value => (uiStates.lyricsBlur = value)}></Switch>
      </Option>
    </>
  )
}




const Browse = () => {
  const { showTrackListName } = useSnapshot(settings)
  const { t } = useTranslation()
  return (
    <>
      <div>
        <Option>
          <OptionText>{t`settings.show-track-list-name`}</OptionText>
          <Switch
            enabled={showTrackListName}
            onChange={value => (settings.showTrackListName = value)}
          />
        </Option>
      </div>
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
      <ShowDesktopLyrics />
      <ShowDevices />
      <LyricsBlur />
      <Browse />
    </div>
  )
}

export default Appearance
