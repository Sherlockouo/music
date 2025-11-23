import PageTransition from '../../components/PageTransition'
import { useEffect, useRef, useState, useMemo, memo } from 'react'
import { useSnapshot } from 'valtio'
import { cx } from '@emotion/css'
import { motion } from 'framer-motion' // 移除了 AnimatePresence，对于纯样式切换通常不需要它，减少性能开销
import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

import useLyric from '@/web/api/hooks/useLyric'
import player from '@/web/states/player'
import persistedUiStates from '@/web/states/persistedUiStates'
import { lyricParser } from '@/web/utils/lyric'

gsap.registerPlugin(ScrollToPlugin)

// eslint-disable-next-line react/display-name
const Lyrics = memo(() => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const lyricsRes = useLyric({ id: player.trackID })
  const lyricsResponse = lyricsRes.data
  const { lyric: lyrics, tlyric: tlyrics } = lyricParser(lyricsResponse)
  const { progress } = useSnapshot(player)
  const { lyricsBlur } = useSnapshot(persistedUiStates)
  const [isHovered, setIsHovered] = useState(false)

  // 更新当前歌词行索引
  useEffect(() => {
    if (!lyrics.length) return
    for (let i = 0; i < lyrics.length; i++) {
      const current = lyrics[i]
      const next = lyrics[i + 1]
      if (progress >= current.time && (!next || progress < next.time)) {
        setCurrentLineIndex(i)
        break
      }
    }
  }, [progress, lyrics])

  // GSAP 平滑滚动：保持高亮行在视野偏上位置 (更符合阅读习惯)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const lines = container.querySelectorAll('.lyrics-row')
    const currentLine = lines[currentLineIndex] as HTMLElement
    if (!currentLine) return

    // 计算滚动位置：将高亮行置于容器高度的 35% - 40% 处，而非绝对居中，视觉更舒适
    const targetY =
      currentLine.offsetTop - container.clientHeight * 0.35 + currentLine.clientHeight / 2

    gsap.to(container, {
      scrollTo: { y: targetY, autoKill: true },
      duration: 1.2, // 稍微放慢滚动速度，更优雅
      ease: 'power4.out', // 使用更平滑的缓动函数
    })
  }, [currentLineIndex])

  // 虚拟化渲染范围
  const visibleLyrics = useMemo(() => {
    const range = 10 // 稍微增加渲染范围以保证模糊背景的连续性
    const start = Math.max(0, currentLineIndex - range)
    const end = Math.min(lyrics.length, currentLineIndex + range)
    return lyrics.slice(start, end).map((l, i) => {
      const actualIndex = start + i
      return { ...l, t: tlyrics[actualIndex]?.content, index: actualIndex }
    })
  }, [currentLineIndex, lyrics, tlyrics])

  return (
    <PageTransition>
      <div
        className={cx(
          // 布局改为 flex-col 和 justify-start，移除 items-center 以允许左对齐
          'relative flex h-[90vh] w-full flex-col justify-start overflow-hidden',
          'text-accent-color-400 dark:text-accent-color-400 select-none font-barlow'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          ref={containerRef}
          // 增加左侧 padding (pl-12) 模拟图中的排版
          // 移除 text-center, 改为 text-left
          className='lyrics-container no-scrollbar h-full w-full overflow-y-scroll py-[40vh] pl-8 text-left md:pl-16'
        >
          {visibleLyrics.map(({ content, t, index }) => {
            const isActive = index === currentLineIndex

            return (
              <motion.div
                key={index}
                // transform-origin 设为 left，确保放大时向右扩展而不是向两边
                className={cx(
                  'lyrics-row my-6 origin-left cursor-pointer transition-colors duration-500'
                  // 增加上下 margin (my-6) 拉开行间距
                )}
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 0.95, // 激活时放大，非激活微缩
                  opacity: isActive ? 1 : 0.35, // 非激活行透明度大幅降低
                  filter: !isActive && lyricsBlur && !isHovered ? 'blur(4px)' : 'blur(0px)', // 增加模糊半径
                  y: 0,
                }}
                transition={{
                  stiffness: 200,
                  damping: 20,
                  opacity: { duration: 0.6 },
                }}
                onDoubleClick={() => {
                  player.progress = lyrics[index].time
                  player.play(true)
                }}
              >
                {/* 主歌词 */}
                <motion.div
                  className={cx(
                    'block leading-tight tracking-wide',
                    // 激活时：加粗、大字号、纯白/纯黑
                    // 非激活：普通字重
                    isActive
                      ? ' text-4xl font-extrabold drop-shadow-lg md:text-5xl'
                      : 'text-3xl font-medium'
                  )}
                >
                  {content}
                </motion.div>

                {/* 翻译歌词 */}
                {t && (
                  <motion.div
                    className={cx(
                      'mt-2 block font-sans text-lg font-normal tracking-normal md:text-xl'
                    )}
                    animate={{
                      opacity: isActive ? 0.8 : 0.5, // 翻译歌词始终比主歌词淡一点
                    }}
                  >
                    {t}
                  </motion.div>
                )}
              </motion.div>
            )
          })}

          {lyrics.length === 0 && (
            <div className='mt-20 pl-16 text-3xl font-bold opacity-50'>
              Instrumental / No Lyrics
            </div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  )
})

export default Lyrics
