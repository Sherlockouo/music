import PageTransition from '../../components/PageTransition'
import { useEffect, useRef, useState, memo } from 'react'
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

const Lyrics = memo(() => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const lyricsRes = useLyric({ id: player.trackID })
  const lyricsResponse = lyricsRes.data
  const { lyric: lyrics, tlyric: tlyrics } = lyricParser(lyricsResponse)
  const { progress } = useSnapshot(player)
  const { lyricsBlur, minimizePlayer } = useSnapshot(persistedUiStates)
  const [isHovered, setIsHovered] = useState(false)

  // 根据播放列表状态计算底部内边距
  // 展开时：需要更多空间（播放列表高度约70vh+）
  // 收缩时：只需要较小的空间（播放器高度约80px）
  const bottomPadding = minimizePlayer ? 'pb-24' : 'pb-96'

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

  // GSAP 平滑滚动：保持高亮行在视野正中间
  useEffect(() => {
    const container = containerRef.current
    if (!container || lyrics.length === 0) return

    const lines = container.querySelectorAll('.lyrics-row')
    const currentLine = lines[currentLineIndex] as HTMLElement
    if (!currentLine) return

    // 计算滚动位置：将高亮行置于容器高度的正中间 (50%)
    const containerCenter = container.clientHeight / 2
    const lineCenter = currentLine.offsetTop + currentLine.clientHeight / 2
    const targetY = lineCenter - containerCenter

    gsap.to(container, {
      scrollTo: { y: targetY, autoKill: false }, // 关闭 autoKill，防止被用户交互打断
      duration: 0.8, // 适中的滚动速度
      ease: 'power2.out', // 平滑的缓动函数
    })
  }, [currentLineIndex, lyrics.length])

  return (
    <PageTransition>
      <div
        className={cx(
          // 布局改为 flex-col 和 justify-start，移除 items-center 以允许左对齐
          'relative flex h-[90vh] w-full flex-col justify-start overflow-hidden',
          'select-none font-barlow text-accent-color-600 dark:text-accent-color-400' // 浅色模式使用600提高对比度，深色模式使用400
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          ref={containerRef}
          // 动态底部内边距：根据播放列表展开/收缩状态调整
          className={cx(
            'lyrics-container no-scrollbar h-full w-full overflow-y-scroll text-left will-change-scroll',
            'pl-8 md:pl-16', // 左侧内边距
            'pt-[40vh]', // 顶部固定内边距
            bottomPadding // 动态底部内边距
          )}
        >
          {lyrics.map((lyric, index) => {
            const isActive = index === currentLineIndex
            const t = tlyrics[index]?.content

            return (
              <motion.div
                key={index}
                // 添加 content-visibility 优化非活跃行性能
                className={cx(
                  'lyrics-row my-6 origin-left cursor-pointer transition-colors duration-500',
                  // 非活跃行使用 content-visibility 优化渲染性能
                  !isActive && 'content-visibility-auto'
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
                  player.progress = lyric.time
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
                  {lyric.content}
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
