import Main from '@/web/components/Main'
import Player from '@/web/components/Player'
import MenuBar from '@/web/components/MenuBar'
import Topbar from '@/web/components/Topbar/TopbarDesktop'
import { css, cx } from '@emotion/css'
import player from '@/web/states/player'
import { useSnapshot } from 'valtio'
import Login from './Login'
import TrafficLight from './TrafficLight'
import BlurBackground from './BlurBackground'
import TitleBar from './TitleBar'
import uiStates from '@/web/states/uiStates'
import ContextMenus from './ContextMenus/ContextMenus'
import settings from '@/web/states/settings'
import { useState } from 'react'
import { MotionConfig, motion } from 'framer-motion'
import { ease } from '../utils/const'
import { getTheme } from '../utils/theme'

const Layout = () => {
  const playerSnapshot = useSnapshot(player)
  const { fullscreen } = useSnapshot(uiStates)
  const showPlayer = !!playerSnapshot.track
  const { showBackgroundImage,theme } = useSnapshot(settings)
  
  return (
    <div
      id='layout'
      className={cx(
        'h-full',
        'bg-img ',
        window.env?.isElectron && !fullscreen && 'rounded-24',
        css`
          position: relative;
        `
      )}
    >
      {/* layout 元素的内容 */}
      <motion.div
        className={cx(
          'h-full',
          css`
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            /* 其他样式属性 */
          `,
          showBackgroundImage &&
          css`
              // background-image: '${player.track?.al.picUrl}'
              background-repeat: no-repeat;
              background-size: cover;
              background-position: center;
              transform: translate3d(0, 0, 0);
            `, 
            theme === 'dark' ? 'bg-black/90':'bg-white/90'
        )}
        style={{backgroundImage:showBackgroundImage?`url(${player.track?.al.picUrl})`:''}}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3,ease }}
      >
 <div
    className={css`
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.15); /* 设置半透明背景颜色 */
      z-index: 1; /* 设置层级为较高的值，确保遮罩在内容上方 */
    `}
  ></div>
      </motion.div>
      <div
        id='layout-foreground'
        className={cx(
        'rounded-24',
          'backdrop-blur-md',
          'relative grid h-screen select-none overflow-hidden',
          'transition-colors duration-400 text-dark dark:text-white',
        )}
      >
        {/* <BlurBackground className={cx(
          'fixed z-0 object-cover opacity-70',
          css`
              top: -400px;
              left: -370px;
              width: 1572px;
              height: 528px;
              filter: blur(256px) saturate(1.2);
            `)} /> */}
        <MenuBar />
        <div className=''>
          <Topbar />
        </div>
        <Main />
        <Login />
        {showPlayer && <Player />}

        {window.env?.isMac && (
          <div className=' fixed top-5 left-5 z-30 translate-y-0.5'>
            <TrafficLight />
          </div>
        )}

        {(window.env?.isWindows ||
          window.env?.isLinux ||
          window.localStorage.getItem('showWindowsTitleBar') === 'true') && <TitleBar />}

        <ContextMenus />

        {/* Border */}
        {/* <div
          className={cx(
            'pointer-events-none fixed inset-0 z-50 rounded-24',
            css`
              box-shadow: inset 0px 0px 0px 1px rgba(255, 255, 255, 0.06);
            `
          )}
        ></div> */}
      </div>
    </div>
  )
}

export default Layout
