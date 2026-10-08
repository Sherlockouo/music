import { css, cx } from '@emotion/css'
import Avatar from './Avatar'
import SearchBox from './SearchBox'
import SettingsButton from './SettingsButton'
import NavigationButtons from './NavigationButtons'
import uiStates from '@/web/states/uiStates'
import { useSnapshot } from 'valtio'
import { motion } from 'framer-motion'
import { IpcChannels } from '@/shared/IpcChannels'
import player from '@/web/states/player'
import settings from '@/web/states/settings'
import Theme from '../Appearence/Theme'
// ─── 顶栏背景架构 ───────────────────────────────────────────────────
// 一套统一的「毛玻璃」层，替代以前并存的两种实现（呼吸灯路径的内联
// blur(12px) + 普通路径的 backdrop-blur-2xl）：
//
//   · `top-bar`（global.css）— filter:blur 作用于顶栏自身内容（专辑
//     封面图预先柔化）并向上多出 20px，让模糊边缘不可见。
//   · `top-bar-frost`（global.css）— backdrop-filter 统一由 CSS 定义
//     （16px 静止 / 8px 滚动中），是唯一的模糊真相来源。滚动降级
//     只降半径（模糊成本 ∝ 半径×面积，顶栏面积小），不再「关模糊
//     换黑底」——那会在每次滚动时产生黑闪。
//   · 呼吸灯开启：不铺封面、不铺渐变，保持透明让光晕透出，毛玻璃
//     只负责模糊滚过的内容。
//   · 呼吸灯关闭 + 开启封面背景：铺封面 + 主题色遮罩。
//   · 呼吸灯关闭 + 无封面：top-bar-dark/light 渐变兜底。
//
const Background = () => {
  const { showBackgroundImage, theme, enableBreathingEffect } = useSnapshot(settings)
  const { fullscreen } = useSnapshot(uiStates)
  let bgURL = player.track?.al?.picUrl
  if (!showBackgroundImage) {
    bgURL = ''
  }

  return (
    <div
      className={cx(
        'top-bar top-bar-frost',
        'absolute inset-0 h-full w-full',
        !enableBreathingEffect &&
          !showBackgroundImage &&
          (theme === 'dark' ? 'top-bar-dark' : 'top-bar-light'),
        window.env?.isElectron && !fullscreen && 'rounded-tl-12 rounded-tr-12'
      )}
      style={{
        maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
      }}
    >
      {!enableBreathingEffect && bgURL && (
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
        />
      )}
      {!enableBreathingEffect && (
        <div className={cx('absolute inset-0 z-0', theme === 'dark' ? 'bg-black/50' : 'bg-white/50')} />
      )}
    </div>
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
        ' fixed left-0 right-0 top-0 z-20 flex items-center justify-between',
        'pb-10 pr-6 pt-11',
        css`
          padding-left: 144px;
        `
      )}
      onDoubleClick={maxRestore}
    >
      {/* Background */}
      <Background />
      {/* Left Part */}
      <div className='z-10 flex items-center' onDoubleClick={(e) => e.stopPropagation()}>
        <NavigationButtons />
        {/* Dividing line */}
        <div className='mx-6 h-4 w-px'></div>

        <SearchBox />
      </div>

      {/* Right Part */}
      <div className='z-10 flex gap-2' onDoubleClick={(e) => e.stopPropagation()}>
        <Theme />
        <SettingsButton />
        <Avatar className='ml-3 h-12 w-12' />
      </div>
    </div>
  )
}

export default TopbarDesktop
