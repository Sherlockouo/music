import PageTransition from '../../components/PageTransition'
import { useEffect, useRef, useState } from 'react'
import { useSnapshot } from 'valtio'
import { css, cx } from '@emotion/css'
import useLyric from '@/web/api/hooks/useLyric'
import { lyricParser } from '@/web/utils/lyric'
import { motion } from 'framer-motion'
import player from '@/web/states/player'
import { fetchTracksWithReactQuery } from '@/web/api/hooks/useTracks'
import toast from 'react-hot-toast'
import Theme from '@/web/components/Topbar/Theme'
import Pin from '@/web/components/Tools/Pin'
import { IpcChannels } from '@/shared/IpcChannels'

const LyricsDesktop = () => {
  const containerRef = useRef(null)
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [currentVolumnValue, setCurrentVolumnValue] = useState(128)
  const { progress, nowVolume, trackID } = useSnapshot(player)
  const lyricsRes = useLyric({ id: trackID })
  const lyricsResponse = lyricsRes.data
  const { lyric: lyrics, tlyric: tlyric } = lyricParser(lyricsResponse)
  const [pin, setPin] = useState(false)

  // let trackInfo:= null
  const [trackInfo, setTrackInfo] = useState<Track | null>(null)

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await fetchTracksWithReactQuery({ ids: [trackID] });
  //       const track = response?.songs?.length ? response.songs[0] : null;
  //       setTrackInfo(track);
  //     } catch (error) {
  //       console.log('[lyricWin] err:', error);

  //     }
  //   };
  //   fetchData();
  // }, []);
  // toast.success('lyric trackID '+ trackInfo);

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
      <div className=''>
        <div>
          {/* <div className='z-29 w-3/4 h-12 bg-brand-500 dark:bg-night-500 top-0 left-0 fixed app-region-drag'>
          </div> */}
          <div className='fixed right-0 top-0 z-30 flex w-full flex-row-reverse bg-brand-500 dark:bg-night-500'>
            <div
              className={cx('z-31 iterms-center right-0 h-12 w-12 pr-5')}
              onClick={async () => {
                const pined = await window.ipcRenderer?.invoke(IpcChannels.PinDesktopLyric)
                setPin(pined as boolean)
                if (pin) {
                  toast.success('unpined lyric winows')
                } else {
                  toast.success('pined lyric winows')
                }
              }}
            >
              <Pin
                className={cx(
                  'rounded-full transition duration-400 hover:bg-white dark:hover:bg-neutral-100',
                  pin && 'bg-white dark:bg-white/60',
                  !pin && 'bg-white/50'
                )}
              />
            </div>
            <Theme />
            <div className='app-region-drag w-3/4'></div>
          </div>
        </div>
        <div
          className={cx(
            'h-921',
            // 'text-black/60 dark:text-white/60',
            'text-center',
            'font-Roboto font-bold backdrop-blur-md'
          )}
        >
          <motion.div
            className={cx('no-scrollbar py-80', 'text-center')}
            ref={containerRef}
            transition={{ duration: 0.5 }}
          >
            {/* <div
              className={cx(
                'text-black/60 dark:text-white/60 overflow-y-hidden',
                'artist-info  no-scrollbar padding-bottom-20 mb-8 mt-8 text-left text-24',
                'text-center'
              )}>
              <p className=''>{trackInfo!?.name}</p>
              <p className=''>By - {trackInfo!?.ar[0].name ? player.track?.ar[0].name : 'X'}</p>
            </div> */}
            {renderedLyrics}
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default LyricsDesktop
