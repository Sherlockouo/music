import PageTransition from '../../components/PageTransition'
import { useEffect, useRef, useState, memo } from 'react'
import { useSnapshot } from 'valtio'
import { cx } from '@emotion/css'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

import useLyric from '@/web/api/hooks/useLyric'
import player from '@/web/states/player'
import settings from '@/web/states/settings'
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
  const { enableBreathingEffect } = useSnapshot(settings)
  const [isHovered, setIsHovered] = useState(false)
  const userScrollingRef = useRef(false)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const bottomPadding = minimizePlayer ? 'pb-24' : 'pb-96'

  // 监听用户手动滚动：暂停自动滚动 3 秒
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let ticking = false
    const onWheel = () => {
      if (ticking) return
      ticking = true
      userScrollingRef.current = true
      clearTimeout(scrollTimeoutRef.current)
      scrollTimeoutRef.current = setTimeout(() => {
        userScrollingRef.current = false
        ticking = false
      }, 3000)
    }

    const onTouchStart = () => {
      userScrollingRef.current = true
      clearTimeout(scrollTimeoutRef.current)
    }
    const onTouchEnd = () => {
      scrollTimeoutRef.current = setTimeout(() => {
        userScrollingRef.current = false
      }, 3000)
    }

    container.addEventListener('wheel', onWheel, { passive: true })
    container.addEventListener('touchstart', onTouchStart, { passive: true })
    container.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('wheel', onWheel)
      container.removeEventListener('touchstart', onTouchStart)
      container.removeEventListener('touchend', onTouchEnd)
      clearTimeout(scrollTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (!lyrics.length) return

    let foundIndex = -1
    for (let i = 0; i < lyrics.length; i++) {
      const current = lyrics[i]
      const next = lyrics[i + 1]
      if (progress >= current.time && (!next || progress < next.time)) {
        foundIndex = i
        break
      }
    }

    if (foundIndex === -1) foundIndex = 0
    setCurrentLineIndex(foundIndex)
  }, [progress, lyrics])

  useEffect(() => {
    // 用户正在手动滚动时，跳过自动滚动
    if (userScrollingRef.current) return

    const container = containerRef.current
    if (!container || lyrics.length === 0) return

    const lines = container.querySelectorAll('.lyrics-row')
    const currentLine = lines[currentLineIndex] as HTMLElement
    if (!currentLine) return

    const containerCenter = container.clientHeight / 2
    const lineCenter = currentLine.offsetTop + currentLine.clientHeight / 2
    const targetY = lineCenter - containerCenter

    gsap.to(container, {
      scrollTo: { y: targetY, autoKill: false },
      duration: 0.8,
      ease: 'power2.out',
    })
  }, [currentLineIndex, lyrics.length])

  return (
    <PageTransition>
      <div
        className={cx(
          'relative flex h-[90vh] w-full flex-col justify-start overflow-hidden',
          'select-none font-barlow',
          enableBreathingEffect
            ? 'text-white/90'
            : 'text-accent-color-600 dark:text-accent-color-400'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          ref={containerRef}
          className={cx(
            'lyrics-container no-scrollbar relative z-10 h-full w-full overflow-y-scroll text-left will-change-scroll',
            'pl-8 pr-4 md:pl-16 md:pr-8',
            'pt-[40vh]',
            bottomPadding
          )}
        >
          {lyrics.map((lyric, index) => {
            const isActive = index === currentLineIndex
            const t = tlyrics[index]?.content

            return (
              <motion.div
                key={index}
                className={cx(
                  'lyrics-row my-6 max-w-[calc(100vw-420px)] origin-left cursor-pointer whitespace-pre-wrap transition-colors duration-500',
                  !isActive && 'content-visibility-auto'
                )}
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 0.95,
                  opacity: isActive ? 1 : 0.5,
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
                <motion.div
                  className={cx(
                    'block leading-tight tracking-wide',
                    isActive
                      ? 'text-4xl font-extrabold drop-shadow-lg md:text-5xl'
                      : 'text-3xl font-medium'
                  )}
                >
                  {lyric.content}
                </motion.div>

                {t && (
                  <motion.div
                    className='mt-2 block font-sans text-lg font-normal tracking-normal opacity-70 md:text-xl'
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
