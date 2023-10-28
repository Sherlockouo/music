import { css, cx } from '@emotion/css'
import Avatar from './Avatar'
import SearchBox from './SearchBox'
import SettingsButton from './SettingsButton'
import NavigationButtons from './NavigationButtons'
import uiStates from '@/web/states/uiStates'
import { useSnapshot } from 'valtio'
import { AnimatePresence, motion } from 'framer-motion'
import { ease } from '@/web/utils/const'
import { useLocation } from 'react-router-dom'
import { IpcChannels } from '@/shared/IpcChannels'
import player from '@/web/states/player'
import settings from '@/web/states/settings'
import Theme from '../Appearence/Theme'
const Background = () => {
  const { showBackgroundImage, theme } = useSnapshot(settings)

  // keep background
  const { hideTopbarBackground } = useSnapshot(uiStates)
  const location = useLocation()
  const isPageHaveBlurBG =
    location.pathname.startsWith('/album/') ||
    location.pathname.startsWith('/artist/') ||
    location.pathname.startsWith('/playlist/') ||
    location.pathname.startsWith('/lyrics/')
  const show = !hideTopbarBackground || !isPageHaveBlurBG
  const { fullscreen } = useSnapshot(uiStates)
  let bgURL = player.track?.al?.picUrl
  if (!showBackgroundImage) {
    bgURL = ''
  }
  return (
    <>
      <AnimatePresence>
        {
          <>
            <div
              className={cx(
                'top-bar',
                'absolute inset-0 h-full w-full',
                !showBackgroundImage && (theme === 'dark' ? 'top-bar-dark' : 'top-bar-light')
              )}
            >
              {bgURL ? (
                <motion.div
                  className={cx(
                    'ease absolute inset-0 z-0 h-full w-full',
                    css`
                      background-repeat: no-repeat;
                      background-size: cover;
                      background-position: center top;
                    `
                  )}
                  style={{ backgroundImage: `url(${bgURL})` }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                ></motion.div>
              ) : (
                <motion.div
                  className={cx('ease absolute inset-0 z-0 h-full w-full bg-white dark:bg-black')}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                ></motion.div>
              )}
              {/* 遮罩 */}
              <motion.div
                className={cx(
                  'absolute inset-0 z-0',
                  theme === 'dark' ? 'bg-black/50' : 'bg-white/50'
                )}
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ ease }}
                className={cx(
                  'relative inset-0 z-0 ',
                  'h-full w-full',
                  show && 'backdrop-blur-2xl',
                  window.env?.isElectron && !fullscreen && 'rounded-tr-12 rounded-tl-12'
                )}
              >
                <div
                  className={cx(
                    'z-1 absolute h-full w-full',
                    css`
                      background-color: rgba(0, 0, 0, 0.06);
                    `
                  )}
                ></div>
              </motion.div>
            </div>
          </>
        }
      </AnimatePresence>
    </>
  )
}

const TopbarDesktop = () => {
  const maxRestore = () => {
    window.ipcRenderer?.send(IpcChannels.MaximizeOrUnmaximize)
  }
  return (
    <div
      className={cx(
        // app-region-drag 删除后即可移动console
        'app-region-drag',
        ' fixed top-0 left-0 right-0 z-20 flex items-center justify-between',
        'pt-11 pb-10 pr-6',
        css`
          padding-left: 144px;
        `
      )}
      onDoubleClick={maxRestore}
    >
      {/* Background */}
      <Background />
      {/* Left Part */}
      <div className='z-10 flex items-center'>
        <NavigationButtons />
        {/* Dividing line */}
        <div className='mx-6 h-4 w-px'></div>

        <SearchBox />
      </div>

      {/* Right Part */}
      <div className='z-10 flex gap-2'>
        <Theme />
        <SettingsButton />
        <Avatar className='ml-3 h-12 w-12' />
      </div>
    </div>
  )
}

export default TopbarDesktop
