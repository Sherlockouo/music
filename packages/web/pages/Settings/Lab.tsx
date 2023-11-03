import { BlockDescription, Input, Button, Option, OptionText, Switch } from './Controls'
import { useTranslation } from 'react-i18next'
import { useSnapshot } from 'valtio'
import uiStates from '@/web/states/uiStates'

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

const Lab = () => {
  const { t, i18n } = useTranslation()
  return (
    <>
      <div className='pt-5 text-xl font-medium'>{t`settings.lab.title`}</div>
      <div className='mt-3 h-px w-full bg-black/5 dark:bg-white/10'></div>
      <ShowSongFrequency />
    </>
  )
}

export default Lab
