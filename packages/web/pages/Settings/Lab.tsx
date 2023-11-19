import { BlockDescription, Input, Button, Option, OptionText, Switch } from './Controls'
import { useTranslation } from 'react-i18next'

const Lab = () => {
  const { t, i18n } = useTranslation()
  return (
    <>
      <div className='pt-5 text-xl font-medium'>{t`settings.lab.title`}</div>
      <div className='mt-3 h-px w-full bg-black/5 dark:bg-white/10'></div>
      <BlockDescription>{t`settings.lab.description`}</BlockDescription>
      {/* <ShowSongFrequency /> */}
    </>
  )
}

export default Lab
