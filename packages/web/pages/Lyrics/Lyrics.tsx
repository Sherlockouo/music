import PageTransition from '../../components/PageTransition'
import { useEffect, useRef, useState, useMemo, memo } from 'react'
import { useSnapshot } from 'valtio'
import { css, cx } from '@emotion/css'
import useLyric from '@/web/api/hooks/useLyric'
import player from '@/web/states/player'
import { lyricParser } from '@/web/utils/lyric'
import { useTranslation } from 'react-i18next'
import { useScroll, useTransform, motion } from 'framer-motion'

import uiStates from '@/web/states/uiStates'
import toast from 'react-hot-toast'
import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import persistedUiStates from '@/web/states/persistedUiStates'
gsap.registerPlugin(ScrollToPlugin)

const Lyrics = memo(() => {
  const containerRef = useRef(null)
  const pContainerRef = useRef(null)
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const lyricsRes = useLyric({ id: player.trackID })
  const lyricsResponse = lyricsRes.data
  const { lyric: lyrics, tlyric: tlyric } = lyricParser(lyricsResponse)
  const { progress } = useSnapshot(player)
  const { lyricsBlur } = useSnapshot(persistedUiStates)
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  const { scrollYProgress } = useScroll({ container: containerRef })
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]) // 根据滚动进度控制透明度
  // set current lyrics
  useEffect(() => {
    const updateCurrentLineIndex = () => {
      var find = false
      for (let i = currentLineIndex; i < lyrics.length; i++) {
        if (progress < lyrics[i + 1]?.time && progress >= lyrics[i]?.time) {
          find = true
          setCurrentLineIndex(i)
          break
        } else if (i + 1 == lyrics.length && progress >= lyrics[i]?.time) {
          find = true
          setCurrentLineIndex(i)
        }
      }

      if (!find) {
        setCurrentLineIndex(0)
      }
    }
    updateCurrentLineIndex()
  }, [progress])

  useEffect(() => {
    // 添加一个钩子函数，在 currentLineIndex 发生变化时，调用一个函数来滚动歌词容器
    const scrollToCurrentLine = () => {
      // 获取所有的歌词行元素
      const lines = (containerRef.current as any).querySelectorAll('.lyrics-row')
      if (lines == null || lines.length == 0) {
        return
      }

      // 获取当前的歌词行元素
      const currentLine = lines[currentLineIndex]
      if (currentLine) {
        // 如果存在，就将其滚动到可视区域，并指定一些选项
        currentLine.scrollIntoView({
          behavior: 'smooth', // 滚动的行为为平滑过渡
          block: 'center', // 垂直方向上将元素居中对齐
          inline: 'center',
        })
      }
    }

    scrollToCurrentLine()
  }, [currentLineIndex]) // 当 currentLineIndex 变化时，重新执行该钩子函数

  const maxLength = Math.max(lyrics.length, tlyric.length)
  const renderedLyrics = useMemo(
    () =>
      Array.from({ length: maxLength }, (_, index) => {
        const lyric = lyrics[index]?.content
        const tLyric = tlyric[index]?.content

        const setSongToLyric = (index: number) => {
          player.progress = lyrics[index].time
          player.play(true)
        }

        const lineClassName = cx(
          'lyrics-row leading-120 my-2 p-4 ease-in-out iterms-center text-center',
          'tracking-lyric leading-lyric text-2xl transition duration-500 dark:hover:bg-white/10 hover:bg-black/10  rounded-lg',
          index === currentLineIndex &&
            'current-lyrics-row font-bold text-accent-color-500 text-3xl my-3',
          index !== currentLineIndex && 'text-black/80 dark:text-white/60',
          index !== currentLineIndex && lyricsBlur && 'blur-sm',
          index !== currentLineIndex && isHovered && 'blur-none'
        )

        return (
          <div
            className={cx(lineClassName, 'font-barlow')}
            key={index}
            onDoubleClick={() => {
              setSongToLyric(index)
            }}
          >
            <motion.span
              style={{
                opacity,
              }}
              animate={{
                transition: {
                  ease: 'easeInOut',
                  duration: 1,
                },
              }}
            >
              {lyric}
            </motion.span>
            <br />
            <motion.span
              style={{
                opacity,
              }}
              animate={{
                transition: {
                  ease: 'easeInOut',
                  duration: 1,
                },
              }}
            >
              {tLyric}
            </motion.span>
          </div>
        )
      }),
    [maxLength, currentLineIndex]
  )

  return (
    <PageTransition>
      <div
        className={cx(
          'lyrics-player h-921 ',
          'text-center',
          'font-Roboto font-bold backdrop-blur-xxl'
        )}
        ref={pContainerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          className={cx(
            'lyrics-container no-scrollbar  mb-8 mt-8 h-full pb-lyricBottom pt-lyricTop ',
            'inline-block'
          )}
          ref={containerRef}
        >
          {renderedLyrics.length == 0 ? <>Enjoy the music</> : renderedLyrics}
        </motion.div>
      </div>
    </PageTransition>
  )
})

export default Lyrics
