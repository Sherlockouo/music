import { memo, useEffect, useRef, useState } from 'react'
import { useSnapshot } from 'valtio'
import { cx } from '@emotion/css'
import useLyric from '@/web/api/hooks/useLyric'
import { lyricParser } from '@/web/utils/lyric'
import { motion, useAnimation } from 'framer-motion'
import player from '@/web/states/player'
import LyricsWindowTitleBar from '@/web/components/LyricsWindow/LyricsWindowTitleBar'

const LyricsDesktop = memo(() => {
  const containerRef = useRef(null)
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const { progress, trackID } = useSnapshot(player)
  const lyricsRes = useLyric({ id: trackID })
  const lyricsResponse = lyricsRes.data
  const { lyric: lyrics, tlyric: tlyric } = lyricParser(lyricsResponse)

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
    // scrollToCurrentLine()
    requestAnimationFrame(scrollToCurrentLine)
  }, [currentLineIndex]) // 当 currentLineIndex 变化时，重新执行该钩子函数

  const maxLength = Math.max(lyrics.length, tlyric.length)
  const renderedLyrics = Array.from({ length: maxLength }, (_, index) => {
    const lyric = lyrics[index]?.content
    const tLyric = tlyric[index]?.content

    const lineClassName = cx(
      'lyrics-row leading-120 my-2 p-4 ease-in-out iterms-center text-center',
      'tracking-lyric leading-lyric text-md transition duration-400 dark:hover:bg-white/10 hover:bg-gray-500/10  rounded-lg',
      index === currentLineIndex &&
        'transition duration-400 font-bold text-accent-color-500 text-lg my-2',
      index !== currentLineIndex && 'transition duration-400 text-black/80 dark:text-white/60 '
    )

    const lineVariants = {
      current: {
        y: 0,
        transition: { type: 'spring', duration: 0.6, bounce: 0.36 },
      },
      notCurrent: {
        y: -5,
        transition: { type: 'spring', duration: 0.6, bounce: 0.36 },
      },
    }
    // todo: lyrics animation or effects
    return (
      <div className={cx(lineClassName, 'font-barlow ')} key={index}>
        <motion.span
          initial={{ opacity: 100 }}
          exit={{ opacity: 0 }}
          variants={lineVariants}
          animate={currentLineIndex === index ? 'current' : 'notCurrent'}
        >
          {lyric}
        </motion.span>
        <br />
        <motion.span
          initial={{ opacity: 100 }}
          exit={{ opacity: 0 }}
          variants={lineVariants}
          animate={currentLineIndex === index ? 'current' : 'notCurrent'}
        >
          {tLyric}
        </motion.span>
      </div>
    )
  })

  return (
    <>
      <LyricsWindowTitleBar />
      <motion.div
        className={cx(
          'h-[600px] overflow-scroll rounded-md',
          'no-scrollbar text-center',
          'font-Roboto font-bold'
        )}
      >
        <motion.div
          className={cx('inline-block py-80 text-center')}
          ref={containerRef}
          transition={{ duration: 0.5 }}
        >
          {renderedLyrics.length == 0 ? <>Enjoy the music</> : renderedLyrics}
        </motion.div>
      </motion.div>
    </>
  )
})

export default LyricsDesktop
