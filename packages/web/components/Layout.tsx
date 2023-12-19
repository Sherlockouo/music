import Main from '@/web/components/Main'
import Player from '@/web/components/Player'
import MenuBar from '@/web/components/MenuBar'
import Topbar from '@/web/components/Topbar/TopbarDesktop'
import { css, cx } from '@emotion/css'
import player from '@/web/states/player'
import { useSnapshot } from 'valtio'
import Login from './Login'
import TitleBar from './TitleBar'
import uiStates from '@/web/states/uiStates'
import ContextMenus from './ContextMenus/ContextMenus'
import settings from '@/web/states/settings'
import { ease } from '../utils/const'
import { motion } from 'framer-motion'
import Router from '@/web/components/Router'

const Layout = () => {
  const playerSnapshot = useSnapshot(player)
  const { fullscreen } = useSnapshot(uiStates)
  const showPlayer = !!playerSnapshot.track
  const { showBackgroundImage, theme } = useSnapshot(settings)

  return (
    <div>
      {location.pathname == '/desktoplyrics' ? (
        <Router />
      ) : (
        <div
          id='layout'
          className={cx(
            'h-full',
            'bg-img ',
            window.env?.isElectron && !fullscreen && 'rounded-12',
            css`
              position: relative;
            `
          )}
        >
          {/* layout */}
          <motion.div
            className={cx(
              window.env?.isElectron && !fullscreen && 'rounded-12',
              'h-full',
              css`
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
              `,
              showBackgroundImage &&
                css`
                  background-repeat: no-repeat;
                  background-size: cover;
                  background-position: center;
                  transform: translate3d(0, 0, 0);
                `,
              theme === 'dark' ? 'bg-black/90' : 'bg-white/90'
            )}
            style={{
              backgroundImage: showBackgroundImage ? `url(${player.track?.al?.picUrl})` : '',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease }}
          >
            <div
              className={cx(
                window.env?.isElectron && !fullscreen && 'rounded-12',
                window.env?.isElectron && css`
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background-color: rgba(0, 0, 0, 0.05); /* 设置半透明背景颜色 */
                  z-index: 1; /* 设置层级为较高的值，确保遮罩在内容上方 */
                `
              )}
            ></div>
          </motion.div>
          {/* mask */}
          <motion.div
            className={cx(
              // mask will affect the borde radius
              window.env?.isElectron && !fullscreen && 'rounded-12',
              'absolute inset-0 z-0',
              theme === 'dark' ? 'bg-black/40' : 'bg-white/40'
            )}
          />
          <div
            id='layout-foreground'
            className={cx(
              'rounded-12',
              'backdrop-blur-md',
              'relative grid h-screen select-none overflow-hidden',
              'text-black transition-colors duration-400 dark:text-white'
            )}
          >
            <MenuBar />
            <div className=''>
              <Topbar />
            </div>
            <Main />
            <Login />
            {showPlayer && <Player />}

            {(window.env?.isWindows ||
              window.env?.isLinux ||
              window.localStorage.getItem('showWindowsTitleBar') === 'true') && <TitleBar />}

            <ContextMenus />
          </div>
        </div>
      )}
    </div>
  )
}

export default Layout
