import PageTransition from '../components/PageTransition'
import { useEffect, useState, useRef } from 'react'
import { useSnapshot } from 'valtio'
import { cx, css } from '@emotion/css'
import useLyric from '@/web/api/hooks/useLyric'
import player from '@/web/states/player'
import { lyricParser } from '@/web/utils/lyric'
import { useTranslation } from 'react-i18next'

const Lyrics = () => {
  const containerRef = useRef(null)
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const lyricsRes = useLyric({ id: player.trackID })
  const lyricsResponse = lyricsRes.data
  const { lyric: lyrics, tlyric: tlyric } = lyricParser(lyricsResponse)
  const { track, progress } = useSnapshot(player)
  const { t } = useTranslation()
  useEffect(() => {
    const updateCurrentLineIndex = () => {
      for (let i = 0; i < lyrics.length; i++) {
        if (progress >= lyrics[i]?.time && progress < lyrics[i + 1]?.time) {
          setCurrentLineIndex(i)
          break
        }
      }
    }
    updateCurrentLineIndex()
  }, [progress])

  useEffect(() => {
    // 添加一个钩子函数，在 currentLineIndex 发生变化时，调用一个函数来滚动歌词容器
    const scrollToCurrentLine = () => {
      // 获取所有的歌词行元素
      const lines = containerRef.current?.querySelectorAll('.lyrics-row')
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

    const setSongToLyric = () => {
      player.progress = time
    }

    let highlight = css(`
      margin-top:15px;
      margin-bottom: 15px;
    `)
    
    let lineClassName = cx('lyrics-row', {
      'highlighted highlight-lyric  line-clamp-4 text-20 font-bold  text-neutral-700 dark:text-neutral-200 ':
        index === currentLineIndex,
    })
    
    const lyricRowCss = css(`
      padding-top: 6px;
      padding-bottom: 6px;
      
    `)

    return (
      <div className={lineClassName + ' ' + lyricRowCss} key={index} onDoubleClick={setSongToLyric}>
        <p>{lyric}</p>
        <p>{tLyric}</p>
      </div>
    )
  })

  if (lyricsResponse == undefined || lyricsResponse.code != 200 || lyrics.length == 0) {
    return (
      <PageTransition>
        {player?.state == 'playing' && (
          <div className='artist-info padding-bottom-20 text-20 mb-8 mt-8 text-center font-medium text-neutral-400'>
            <div className='no-lyrics mb-4 mt-8 text-center text-14 font-medium uppercase text-neutral-400'>
              <p className='line-clamp-2 text-30'>{player.track?.name}</p>
              <p className='line-clamp-2 text-26'>By - {player.track?.ar[0].name}</p>
            </div>
            请欣赏·纯音乐
          </div>
        )}
        <div className='artist-info padding-bottom-20 text-20 mb-8 mt-8 text-center font-medium text-neutral-400'>
          {player.state == 'ready' && t`common.lyric-welcome`}
        </div>
      </PageTransition>
    )
  }
  return (
    <PageTransition>
      <div className='lyrics-player'>
        <div
          className='lyrics-container text-20 mb-8 mt-8 text-center font-medium uppercase text-neutral-400'
          ref={containerRef}
        >
          <div className='artist-info padding-bottom-20 text-20 mb-8 mt-8 text-center font-medium text-neutral-400'>
            <p className='line-clamp-2 text-30'>{player.track?.name}</p>
            <p className='line-clamp-2 text-26'>By - {player.track?.ar[0].name}</p>
          </div>
          {renderedLyrics}
        </div>
      </div>
    </PageTransition>
  )
}

export default Lyrics
