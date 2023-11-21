import { SupportedLanguage } from '@/web/i18n/i18n'
import persistedUiStates from '@/web/states/persistedUiStates'
import settings from '@/web/states/settings'
import { useTranslation } from 'react-i18next'
import { useSnapshot } from 'valtio'
import { BlockTitle, OptionText, Select, Option, Switch } from './Controls'

function General() {
  return (
    <div>
      <Language />
      <AppleMusic />
      <NeteaseMusic />
      <CloseWindow />
    </div>
  )
}

function Language() {
  const { t } = useTranslation()
  const supportedLanguages: { name: string; value: SupportedLanguage }[] = [
    { name: 'English', value: 'en-US' },
    { name: '简体中文', value: 'zh-CN' },
  ]
  const { language } = useSnapshot(settings)
  const setLanguage = (language: SupportedLanguage) => {
    settings.language = language
  }

  return (
    <>
      <BlockTitle>{t`settings.title-language`}</BlockTitle>
      <Option>
        <OptionText>{t`settings.general-choose-language`}</OptionText>
        <Select options={supportedLanguages} value={language} onChange={setLanguage} />
      </Option>
    </>
  )
}

function AppleMusic() {
  const { t } = useTranslation()

  const { playAnimatedArtworkFromApple, priorityDisplayOfAlbumArtistDescriptionFromAppleMusic } =
    useSnapshot(settings)

  return (
    <div className='mt-7'>
      <BlockTitle>Apple Music</BlockTitle>
      <Option>
        <OptionText>{t`settings.play-animated-artwork-from-apple-music`}</OptionText>
        <Switch
          enabled={playAnimatedArtworkFromApple}
          onChange={v => (settings.playAnimatedArtworkFromApple = v)}
        />
      </Option>
      <Option>
        <OptionText>{t`settings.priority-display-description-from-apple-music`}</OptionText>
        <Switch
          enabled={priorityDisplayOfAlbumArtistDescriptionFromAppleMusic}
          onChange={v => (settings.priorityDisplayOfAlbumArtistDescriptionFromAppleMusic = v)}
        />
      </Option>
    </div>
  )
}

function NeteaseMusic() {
  const { t } = useTranslation()

  const { displayPlaylistsFromNeteaseMusic } = useSnapshot(settings)
  return (
    <div className='mt-7'>
      <BlockTitle>{t`settings.title-netease-music`}</BlockTitle>
      <Option>
        <OptionText>{t`settings.display-playlists-from-netease-music`}</OptionText>
        <Switch
          enabled={displayPlaylistsFromNeteaseMusic}
          onChange={v => {
            settings.displayPlaylistsFromNeteaseMusic = v
            if (persistedUiStates.librarySelectedTab === 'playlists') {
              persistedUiStates.librarySelectedTab = 'albums'
            }
          }}
        />
      </Option>
    </div>
  )
}

function CloseWindow() {
  const { t } = useTranslation()

  const { closeWindowInMinimize } = useSnapshot(settings)
  return (
    <div className='mt-7'>
      <BlockTitle>{t`settings.minimize-window`}</BlockTitle>
      <Option>
        <OptionText>{t`settings.minimize-window-to-tray-when-close`}</OptionText>
        <Switch
          enabled={closeWindowInMinimize}
          onChange={v => (settings.closeWindowInMinimize = v)}
        />
      </Option>
    </div>
  )
}

export default General
