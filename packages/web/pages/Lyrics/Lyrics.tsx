import PageTransition from '../../components/PageTransition'
import { useEffect, useRef, useState, useMemo, memo } from 'react'
import { useSnapshot } from 'valtio'
import { cx } from '@emotion/css'
import { motion } from 'framer-motion'
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

  // --- 修复 1: 优化当前行索引计算逻辑 ---
  useEffect(() => {
    if (!lyrics.length) return

    // 处理边界情况：如果进度小于第一句歌词的时间，应该选中第一句
    if (progress < lyrics[0].time) {
      setCurrentLineIndex(0)
      return
    }

    for (let i = 0; i < lyrics.length; i++) {
      const current = lyrics[i]
      const next = lyrics[i + 1]
      if (progress >= current.time && (!next || progress < next.time)) {
        setCurrentLineIndex(i)
        break
      }
    }
  }, [progress, lyrics])

  // --- 修复 2: 修复滚动逻辑 ---
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // 核心修改：不要用 lines[index] 查找，因为虚拟列表导致 DOM 索引和歌词数组索引不一致。
    // 直接查找带有 'active-lyric-line' 标记的 DOM 元素。
    const currentLine = container.querySelector('.active-lyric-line') as HTMLElement

    if (!currentLine) return

    // 计算滚动位置：将高亮行置于容器高度的 35% - 40% 处
    const targetY =
      currentLine.offsetTop - container.clientHeight * 0.35 + currentLine.clientHeight / 2

    gsap.to(container, {
      scrollTo: { y: targetY, autoKill: true },
      duration: 1.2,
      ease: 'power4.out',
      overwrite: 'auto', // 确保快速切换时覆盖之前的动画
    })
  }, [currentLineIndex]) // 依赖项保持不变

  // 虚拟化渲染范围
  const visibleLyrics = useMemo(() => {
    const range = 10
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
          'relative flex h-[90vh] w-full flex-col justify-start overflow-hidden',
          'text-accent-color-400 dark:text-accent-color-400 select-none font-barlow'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          ref={containerRef}
          className='lyrics-container no-scrollbar h-full w-full overflow-y-scroll py-[40vh] pl-8 text-left md:pl-16'
        >
          {visibleLyrics.map(({ content, t, index }) => {
            const isActive = index === currentLineIndex

            return (
              <motion.div
                key={index}
                // --- 核心修改：添加 active-lyric-line 类名以便 querySelector 查找 ---
                className={cx(
                  'lyrics-row my-6 origin-left cursor-pointer transition-colors duration-500',
                  isActive ? 'active-lyric-line' : ''
                )}
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 0.95,
                  opacity: isActive ? 1 : 0.35,
                  filter: !isActive && lyricsBlur && !isHovered ? 'blur(4px)' : 'blur(0px)',
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
                      opacity: isActive ? 0.8 : 0.5,
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
