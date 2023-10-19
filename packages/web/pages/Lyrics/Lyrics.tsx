import PageTransition from '../../components/PageTransition'
import { useEffect, useRef, useState } from 'react'
import { useSnapshot } from 'valtio'
import { css, cx } from '@emotion/css'
import useLyric from '@/web/api/hooks/useLyric'
import player from '@/web/states/player'
import { lyricParser } from '@/web/utils/lyric'
import { useTranslation } from 'react-i18next'
import useIsMobile from '@/web/hooks/useIsMobile'
import { motion } from 'framer-motion'
import AudioVisualization from '@/web/components/Animation/AudioVisualization'
import uiStates from '@/web/states/uiStates'
import toast from 'react-hot-toast'

const Lyrics = () => {
  const isMobile = useIsMobile()
  const containerRef = useRef(null)
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [currentVolumnValue, setCurrentVolumnValue] = useState(128)
  const lyricsRes = useLyric({ id: player.trackID})
  const lyricsResponse = lyricsRes.data
  const { lyric: lyrics, tlyric: tlyric } = lyricParser(lyricsResponse)
  const { state: playerState, progress, nowVolume } = useSnapshot(player)
  const { showSongFrequency } = useSnapshot(uiStates)
  const { t } = useTranslation()
  // const [isScrolling, setIsScrolling] = useState(false);
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
        if (progress + 10 >= lyrics[i]?.time && progress < lyrics[i + 1]?.time) {
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
    const time = lyrics[index]?.time || tlyric[index]?.time
    const tLyric = tlyric[index]?.content

    const setSongToLyric = (index:number) => {
      player.progress = lyrics[index].time
      player.play(true)
    }

    const lineClassName = cx(
      'lyrics-row leading-120 mt-5 mb-5 pb-2 ease-in-out',
      index === currentLineIndex && 'line-clamp-4 font-bold text-accent-color-500 text-2xl',
      index !== currentLineIndex &&
        'font-black tracking-lyric leading-lyric text-black/60 dark:text-white/60 text-xl ',
      index !== currentLineIndex && 'transition-opacity duration-1000'
    )

    const hightlightStyle = {
      textShadow:
        'rgb(216,216,216,' + currentVolumnValue / 25 + ') 3px 3px ' + currentVolumnValue + 'px',
    }

    return (
      <div
        className={cx(lineClassName, 'font-Roboto')}
        key={index}
        onDoubleClick={() => {
          setSongToLyric(index)
        }}
        style={hightlightStyle}
      >
        <p>{lyric}</p>
        <p>{tLyric}</p>
      </div>
    )
  })

  return (
    <PageTransition>
      <div
        className={cx(
          'lyrics-player h-921 ',
          'text-center',
          'font-Roboto font-bold backdrop-blur-md'
        )}
      >
        <motion.div
          className={cx(
            'lyrics-container no-scrollbar  mb-8 mt-8 h-full pb-lyricBottom pt-lyricTop ',
            'text-center'
          )}
          ref={containerRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          transition={{ duration: 0.5 }}
        >
          <div
            className={cx(
              'text-black/60 dark:text-white/60 ',
              'artist-info  no-scrollbar padding-bottom-20 mb-8 mt-8 text-left text-24',
              'text-center'
            )}
          >
            <p className=''>{player.track?.name}</p>
            <p className=''>By - {player.track?.ar[0].name ? player.track?.ar[0].name : 'X'}</p>
          </div>
          {renderedLyrics}
        </motion.div>
        {window.env !== undefined && <div className='sticky bottom-0 h-full w-full'>
          {showSongFrequency && <AudioVisualization />}
        </div>
}
      </div>
    </PageTransition>
  )
}

export default Lyrics
