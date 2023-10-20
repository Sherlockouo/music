import PageTransition from '../../components/PageTransition'
import { useEffect, useRef, useState } from 'react'
import { useSnapshot } from 'valtio'
import { cx } from '@emotion/css'
import useLyric from '@/web/api/hooks/useLyric'
import { lyricParser } from '@/web/utils/lyric'
import { motion } from 'framer-motion'
import player from '@/web/states/player'
import LyricsWindowTitleBar from '@/web/components/LyricsWindow/LyricsWindowTitleBar'


const LyricsDesktop = () => {
  const containerRef = useRef(null)
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [currentVolumnValue, setCurrentVolumnValue] = useState(128)
  const { progress, nowVolume, trackID } = useSnapshot(player)
  const lyricsRes = useLyric({ id: trackID })
  const lyricsResponse = lyricsRes.data
  const { lyric: lyrics, tlyric: tlyric } = lyricParser(lyricsResponse)
  const [pin, setPin] = useState(false)

  useEffect(() => {
    const updateCurrentLineIndex = () => {
      var find = false
      for (let i = currentLineIndex; i < lyrics.length; i++) {
        if (progress + 20 >= lyrics[i]?.time && progress < lyrics[i + 1]?.time) {
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
      const tLyric = tlyric[index]?.content
  
      const lineClassName = cx(
        'lyrics-row leading-120 mt-5 mb-5 pb-2 ease-in-out',
        index === currentLineIndex && 'line-clamp-4 font-bold text-accent-color-500 text-2xl',
        index !== currentLineIndex &&
          'font-black tracking-lyric leading-lyric text-black/60 dark:text-white/60 text-md ',
        index !== currentLineIndex && 'transition-opacity duration-1000'
      )
  
      return (
        <div className={cx(lineClassName, 'font-Roboto')} key={index}>
          <p>{lyric}</p>
          <p>{tLyric}</p>
        </div>
      )
    })
  
  

  return (
    <>
      <div className='dark:text-white/80'>
        <LyricsWindowTitleBar />
        </div>
        <div
          className={cx(
            'h-[640px] overflow-scroll',
            'text-center no-scrollbar',
            'font-Roboto font-bold backdrop-blur-xl py-80',
          )}
        >
          <motion.div
            className={cx('text-center')}
            ref={containerRef}
            transition={{ duration: 0.5 }}
          >
            {renderedLyrics.length == 0 ? <>
              Enjoy the music
            </> :renderedLyrics}
          </motion.div>
        </div>
    </>
  )
}

export default LyricsDesktop
