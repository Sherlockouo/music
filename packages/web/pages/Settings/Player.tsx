import settings from '@/web/states/settings'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useSnapshot } from 'valtio'
import { BlockDescription, BlockTitle, Button, Option, OptionText, Switch } from './Controls'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import store from '@/desktop/main/store' 

function Player() {
  return (
    <div className='flex w-full justify-center iterms-center'>
      <FindTrackOnYouTube />
    </div>
  )
}

function FindTrackOnYouTube() {
  const { t, i18n } = useTranslation()
  
  const { enableFindTrackOnYouTube, httpProxyForYouTube } = useSnapshot(settings)
  const [proxy, setProxy] = useState<string>(httpProxyForYouTube?.proxy as string)

  return (
    <div>
      <BlockTitle>{t`settings.player-youtube-unlock`}</BlockTitle>
      <BlockDescription>
        {t`settings.player-find-alternative-track-on-youtube-if-not-available-on-netease`}
        {i18n.language === 'zh-CN' && (
          <>
            <br />
            此功能需要开启 Clash for Windows 的 TUN Mode 或 ClashX Pro 的增强模式。
          </>
        )}
      </BlockDescription>

      {/* Switch */}
      <Option>
        <OptionText>Enable YouTube Unlock</OptionText>
        <Switch
          enabled={enableFindTrackOnYouTube}
          onChange={value => (settings.enableFindTrackOnYouTube = value)}
        />
      </Option>

      {/* Proxy */}
      <Option>
        <OptionText>
          HTTP Proxy config for connecting to YouTube {httpProxyForYouTube?.host && '(Configured)'}
        </OptionText>
        <Button
          onClick={() => {
            // todo: check regex
            if(proxy === "") {
              toast.error("proxy is empty")
              return
            }
            settings.httpProxyForYouTube!.proxy = proxy
            toast.success('proxy is'+proxy)
          }}
        >
          Submit
        </Button>
      </Option>
      <Option>
        <OptionText>{t`settings.proxy`}</OptionText>
        <AnimatePresence>
          <motion.div
            initial='hidden'
            animate='show'
            exit='hidden'
            className='w-1/2'
          >
            <input
              onChange={e => {
                setProxy(e.target.value)
              }}
              className='w-full px-1 rounded-md flex-grow appearance-none placeholder:pl-1 placeholder:text-black/30 dark:placeholder:text-black/30'
              placeholder={'ext. https://192.168.10.1:8080'}
              type='proxy'
              value={proxy}
            />
          </motion.div>
        </AnimatePresence>
      </Option>
    </div>
  )
}

export default Player
