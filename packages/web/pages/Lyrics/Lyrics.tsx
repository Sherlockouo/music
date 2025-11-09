import PageTransition from '../../components/PageTransition'
import { useEffect, useRef, useState, useMemo, memo } from 'react'
import { useSnapshot } from 'valtio'
import { cx } from '@emotion/css'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
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

  // 平滑滚动至中间（GSAP 替代 scrollIntoView）
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const lines = container.querySelectorAll('.lyrics-row')
    const currentLine = lines[currentLineIndex] as HTMLElement
    if (!currentLine) return

    const targetY =
      currentLine.offsetTop - container.clientHeight / 2 + currentLine.clientHeight / 2

    gsap.to(container, {
      scrollTo: { y: targetY, autoKill: true },
      duration: 0.8,
      ease: 'power3.out',
    })
  }, [currentLineIndex])

  // 虚拟化渲染：仅显示当前行上下若干行
  const visibleLyrics = useMemo(() => {
    const range = 8
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
          'relative flex h-[90vh] items-center justify-center overflow-hidden',
          'select-none font-barlow  text-2xl text-black dark:text-white'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          ref={containerRef}
          className='lyrics-container no-scrollbar h-full w-full overflow-y-scroll py-40 px-8 text-center'
        >
          {visibleLyrics.map(({ content, t, index }) => {
            const isActive = index === currentLineIndex
            return (
              <motion.div
                key={index}
                className={cx(
                  'lyrics-row my-3 transition-all duration-700 ease-out',
                  isActive
                    ? 'text-accent-color-500 scale-110 font-bold'
                    : 'scale-100 text-black dark:text-white'
                )}
                animate={{
                  opacity: isActive ? 1 : 0.6,
                  filter:
                    !isActive && lyricsBlur ? (isHovered ? 'blur(0px)' : 'blur(2px)') : 'blur(0px)',
                }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                onDoubleClick={() => {
                  player.progress = lyrics[index].time
                  player.play(true)
                }}
              >
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={content}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  >
                    {/* 主歌词 */}
                    <motion.span
                      animate={
                        isActive
                          ? {
                              scale: [1, 1.04, 1],
                              opacity: [1, 0.9, 1],
                            }
                          : {}
                      }
                      transition={
                        isActive
                          ? {
                              duration: 3,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }
                          : {}
                      }
                      className='block leading-relaxed'
                    >
                      {content}
                    </motion.span>
                    {/* 翻译歌词 */}
                    {t && (
                      <motion.span
                        className={cx(
                          ' block text-lg',
                          isActive ? 'text-accent-color-500' : 'text-black dark:text-white'
                        )}
                        animate={{
                          opacity: isActive ? 1 : 0.6,
                        }}
                        transition={{ duration: 0.8 }}
                      >
                        {t}
                      </motion.span>
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )
          })}

          {lyrics.length === 0 && (
            <div className='text-center text-xl opacity-60'>Enjoy the music 🎧</div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  )
})

export default Lyrics
