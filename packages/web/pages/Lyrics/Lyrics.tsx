import PageTransition from '../../components/PageTransition'
import { useEffect, useRef, useState } from 'react'
import { useSnapshot } from 'valtio'
import { css, cx } from '@emotion/css'
import useLyric from '@/web/api/hooks/useLyric'
import player from '@/web/states/player'
import { lyricParser } from '@/web/utils/lyric'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import AudioVisualization from '@/web/components/Animation/AudioVisualization'
import uiStates from '@/web/states/uiStates'
import { State } from '@/web/utils/player'

const Lyrics = () => {
  const containerRef = useRef(null)
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [currentVolumnValue, setCurrentVolumnValue] = useState(128)
  const lyricsRes = useLyric({ id: player.trackID })
  const lyricsResponse = lyricsRes.data
  const { lyric: lyrics, tlyric: tlyric } = lyricParser(lyricsResponse)
  const { state: playerState, progress, nowVolume } = useSnapshot(player)
  const { showSongFrequency, lyricsBlur } = useSnapshot(uiStates)
  const { t } = useTranslation()
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  useEffect(() => {
    const updateCurrentLineIndex = () => {
      var find = false
      for (let i = currentLineIndex; i < lyrics.length; i++) {
        if (progress + 0.2 >= lyrics[i]?.time && progress < lyrics[i + 1]?.time) {
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
    var light = (1 / (1 + Math.exp(-(nowVolume - 128) / 64))) * 20
    setCurrentVolumnValue(light)
  }, [nowVolume])

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
          inline: 'center', // 水平方向上将元素居中对齐
        })
      }
    }

    // 调用 scrollToCurrentLine 函数
    scrollToCurrentLine()
  }, [currentLineIndex]) // 当 currentLineIndex 变化时，重新执行该钩子函数

  const maxLength = Math.max(lyrics.length, tlyric.length)
  const renderedLyrics = Array.from({ length: maxLength }, (_, index) => {
    const lyric = lyrics[index]?.content
    // const time = lyrics[index]?.time || tlyric[index]?.time
    const tLyric = tlyric[index]?.content

    const setSongToLyric = (index: number) => {
      player.progress = lyrics[index].time
      player.play(true)
    }

    const lineClassName = cx(
      'lyrics-row leading-120 my-2 p-4 ease-in-out iterms-center text-center',
      'tracking-lyric leading-lyric text-2xl transition duration-400 dark:hover:bg-white/10 hover:bg-black/10  rounded-lg',
      index === currentLineIndex && 'font-bold text-accent-color-500 text-3xl my-3',
      index !== currentLineIndex && 'text-black/80 dark:text-white/60',
      index !== currentLineIndex && lyricsBlur && 'blur-sm',
      index !== currentLineIndex && isHovered && 'transition duration-500 blur-none'
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
          initial={{ opacity: 100 }}
          exit={{ opacity: 0 }}
          animate={currentLineIndex === index ? 'current' : 'notCurrent'}
          transition={{ duration: 0.4, ease: 'backOut' }}
        >
          {lyric}
        </motion.span>
        <br />
        <motion.span
          initial={{ opacity: 100 }}
          exit={{ opacity: 0 }}
          animate={currentLineIndex === index ? 'current' : 'notCurrent'}
          transition={{ duration: 0.4, ease: 'backOut' }}
        >
          {tLyric}
        </motion.span>
      </div>
    )
  })

  return (
    <PageTransition>
      <div
        className={cx(
          'lyrics-player h-921 ',
          'text-center',
          'font-Roboto font-bold backdrop-blur-xxl'
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          className={cx(
            'lyrics-container no-scrollbar  mb-8 mt-8 h-full pb-lyricBottom pt-lyricTop ',
            'inline-block'
          )}
          ref={containerRef}
          transition={{ duration: 0.5 }}
        >
          {renderedLyrics.length == 0 ? <>Enjoy the music</> : renderedLyrics}
        </motion.div>
        {window.env !== undefined && (
          <div className='sticky bottom-0 h-full w-full'>
            {showSongFrequency && playerState == State.Playing && <AudioVisualization />}
          </div>
        )}
      </div>
    </PageTransition>
  )
}

export default Lyrics
