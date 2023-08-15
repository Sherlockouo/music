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

const Layout = () => {
  const playerSnapshot = useSnapshot(player)
  const { fullscreen } = useSnapshot(uiStates)
  const showPlayer = !!playerSnapshot.track
  const {showLyricBackground} = useSnapshot(settings)
  return (
    <div
  id="layout"
  className={cx(
    'bg-img',
    window.env?.isElectron && !fullscreen && 'rounded-24',
    css`
      position: relative;
      background: black;
      /* 其他样式属性 */
      `
      )}
>
  {/* layout 元素的内容 */}
  <div
    className={cx(css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
      /* 其他样式属性 */
    `,
    showLyricBackground && css`
    background-image: url(${player.track?.al.picUrl});
      background-repeat: no-repeat;
      background-size: cover;
      background-position: center;
      filter: blur(10px); /* 模糊效果 */
      `
    )
  }
  />
      <div 
      id='layout-foreground'
      className={cx(
        'relative grid h-screen select-none overflow-hidden bg-white/25 dark:bg-black/80',
        window.env?.isElectron && !fullscreen && 'rounded-24')}
      >
        <BlurBackground />
        <MenuBar />
        <div className="bg-white">
        <Topbar />

        </div>
        <Main />
        <Login />
        {showPlayer && <Player />}

        {window.env?.isMac && (
          <div className='fixed top-6 left-6 z-30 translate-y-0.5'>
            <TrafficLight />
          </div>
        )}

        {(window.env?.isWindows ||
          window.env?.isLinux ||
          window.localStorage.getItem('showWindowsTitleBar') === 'true') && <TitleBar />}

        <ContextMenus />

        {/* Border */}
        <div
          className={cx(
            'pointer-events-none fixed inset-0 z-50 rounded-24',
            css`
              box-shadow: inset 0px 0px 0px 1px rgba(255, 255, 255, 0.06);
            `
          )}
        ></div>
      </div>
      
    </div>
  )
}

export default Layout
