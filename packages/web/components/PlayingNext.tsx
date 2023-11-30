import { isIosPwa, resizeImage } from '@/web/utils/common'
import player from '@/web/states/player'
import { Mode, State as PlayerState } from '@/web/utils/player'
import { useSnapshot } from 'valtio'
import useTracks from '@/web/api/hooks/useTracks'
import { css, cx } from '@emotion/css'
import Wave from './Animation/Wave'
import Icon from '@/web/components/Icon'
import { useWindowSize } from 'react-use'
import { playerWidth, topbarHeight } from '@/web/utils/const'
import useIsMobile from '@/web/hooks/useIsMobile'
import { Virtuoso } from 'react-virtuoso'
import toast from 'react-hot-toast'
import { openContextMenu } from '@/web/states/contextMenus'
import { useTranslation } from 'react-i18next'
import useHoverLightSpot from '../hooks/useHoverLightSpot'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { RepeatMode } from '@/shared/playerDataTypes'

const FMButton = () => {
  const { buttonRef, buttonStyle } = useHoverLightSpot()
  const [fm, setFM] = useState(player.mode == Mode.FM)
  return (
    <motion.button
      ref={buttonRef}
      onClick={() => {
        // FM开关
        player.mode = player.mode == Mode.FM ? Mode.TrackList : Mode.FM
        setFM(player.mode == Mode.FM)
        player.nextTrack()
      }}
      className={cx(
        'group relative text-neutral-300 transition duration-300 ease-linear',
        player.mode == Mode.FM
          ? 'text-brand-500 opacity-100 hover:opacity-80'
          : 'text-neutral-500 opacity-60 hover:opacity-100'
      )}
      style={buttonStyle}
    >
      <div className='absolute top-1/2  left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 blur group-hover:opacity-100'></div>
      {!fm && <Icon name='fm' className='h-7 w-7' />}
      {fm && <Icon name='fm' className='h-7 w-7' />}
    </motion.button>
  )
}

const RepeatButton = () => {
  const { buttonRef, buttonStyle } = useHoverLightSpot()
  const [repeat, setRepeat] = useState(0)
  const { repeatMode } = useSnapshot(player)
  useEffect(() => {
    if (repeatMode == RepeatMode.Off) {
      setRepeat(0)
    }
    if (repeatMode == RepeatMode.On) {
      setRepeat(1)
    }
    if (repeatMode == RepeatMode.One) {
      setRepeat(2)
    }
  }, [repeatMode])
  return (
    <motion.button
      ref={buttonRef}
      onClick={() => {
        // 循环模式[关，开，单曲]
        const repeatloop = [RepeatMode.Off, RepeatMode.On, RepeatMode.One]
        setRepeat((repeat + 1) % 3)
        player.repeatMode = repeatloop[(repeat + 1) % 3]
      }}
      className={cx(
        player.mode == Mode.FM ? 'hidden' : 'block',
        'group relative transition duration-300 ease-linear',
        repeat == 0 && 'text-neutral-500 opacity-60 hover:opacity-100',
        repeat > 0 && 'text-brand-500 opacity-100 hover:opacity-80'
      )}
      style={buttonStyle}
    >
      <div className='absolute top-1/2  left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 blur group-hover:opacity-100'></div>
      {repeat == 0 && <Icon name='repeat' className='h-7 w-7' />}
      {repeat == 1 && <Icon name='repeat' className='h-7 w-7' />}
      {repeat == 2 && <Icon name='repeat-1' className='h-7 w-7' />}
    </motion.button>
  )
}

const ShuffleButton = () => {
  const { buttonRef, buttonStyle } = useHoverLightSpot()
  const { repeatMode } = useSnapshot(player)
  const [shuffle, setShuffle] = useState(repeatMode == RepeatMode.Shuffle)
  return (
    <motion.button
      ref={buttonRef}
      onClick={() => {
        setShuffle(!shuffle)
        player.shufflePlayList()
      }}
      className={cx(
        player.mode == Mode.FM ? 'hidden' : 'block',
        'group relative transition duration-300 ease-linear',
        repeatMode == RepeatMode.Shuffle
          ? 'text-brand-500 opacity-100 hover:opacity-90'
          : 'text-neutral-500 opacity-60 hover:opacity-100'
      )}
      style={buttonStyle}
    >
      <Icon name='shuffle' className='h-7 w-7' />
      <div className='absolute top-1/2 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 blur group-hover:opacity-100'></div>
    </motion.button>
  )
}

const Header = () => {
  const { t } = useTranslation()
  return (
    <div
      className={cx(
        'absolute top-0 left-0 z-20 flex w-full items-center justify-between bg-contain bg-repeat-x px-7 pb-6 text-14 font-bold lg:px-0'
      )}
    >
      <div className='flex '>
        <div className='bg-accent-color-700 mr-2 h-4 w-1 rounded-full'></div>
        {t`player.queue`}
      </div>
      <div className='flex gap-2'>
        <RepeatButton />
        <ShuffleButton />
        <FMButton />
      </div>
    </div>
  )
}

const Track = ({
  track,
  index,
  playingTrackIndex,
  state,
}: {
  track?: Track
  index: number
  playingTrackIndex: number
  state: PlayerState
}) => {
  return (
    <div
      className={cx(
        'mb-5 flex items-center justify-between'
        // player.mode == Mode.FM && 'pointer-events-none'
      )}
      onClick={e => {
        if (e.detail === 2 && track?.id) player.playTrack(track.id)
      }}
      onContextMenu={event => {
        track?.id &&
          openContextMenu({
            event,
            type: 'track',
            dataSourceID: track.id,
            options: {
              useCursorPosition: true,
            },
          })
      }}
    >
      {/* Cover */}
      <img
        alt='Cover'
        className='mr-4 aspect-square h-14 w-14 flex-shrink-0 rounded-12'
        src={resizeImage(track?.al?.picUrl || '', 'sm')}
      />

      {/* Track info */}
      <div className='mr-3 flex-grow'>
        <div
          className={cx(
            'line-clamp-1 text-16 font-medium transition-colors duration-500',
            playingTrackIndex === index ? 'text-accent-color-500' : 'text-black dark:text-white'
          )}
        >
          {track?.name}
        </div>
        <div className='line-clamp-1 mt-1 text-14 font-bold text-black/80  dark:text-white/80'>
          {track?.ar.map(a => a.name).join(', ')}
        </div>
      </div>

      {/* Wave icon */}
      {playingTrackIndex === index ? (
        <Wave playing={state === 'playing'} />
      ) : (
        <div className='text-accent-color text-16 font-medium dark:text-neutral-200'>
          {String(index + 1).padStart(2, '0')}
        </div>
      )}
    </div>
  )
}

const TrackList = ({ className }: { className?: string }) => {
  const { trackList, trackIndex, state, fmTrackList, fmTrack } = useSnapshot(player)
  // track mode true/false
  const trackMode = player.mode == Mode.TrackList
  const { data: tracksRaw } = useTracks({ ids: trackMode ? trackList : fmTrackList })
  const tracks = tracksRaw?.songs || []
  const { height } = useWindowSize()
  const isMobile = useIsMobile()
  const listHeight = height - topbarHeight - playerWidth - 24 // 24是封面与底部间距
  const listHeightMobile = height - 154 - 110 - (isIosPwa ? 34 : 0) // 154是列表距离底部的距离，110是顶部的距离

  return (
    <motion.div>
      <div
        className={cx(css`
          mask-image: linear-gradient(to bottom, transparent 22px, black 42px); // 顶部渐变遮罩
        `)}
      >
        <Virtuoso
          style={{
            height: `${isMobile ? listHeightMobile : listHeight}px`,
          }}
          totalCount={tracks.length}
          className={cx(
            !trackMode && 'pointer-events-none',
            'no-scrollbar relative z-10 w-full overflow-auto',
            className,
            css`
              mask-image: linear-gradient(to top, transparent 8px, black 42px); // 底部渐变遮罩
            `
          )}
          fixedItemHeight={76}
          data={tracks}
          overscan={tracks.length}
          components={{
            Header: () => <div className='h-8'></div>,
            Footer: () => <div className='h-8'></div>,
          }}
          itemContent={(index, track) => (
            <Track
              key={index}
              track={track}
              index={index}
              playingTrackIndex={trackMode ? trackIndex : 0}
              state={state}
            />
          )}
        ></Virtuoso>
      </div>
    </motion.div>
  )
}

const PlayingNext = () => {
  return (
    <>
      <Header />
      <TrackList />
    </>
  )
}

export default PlayingNext
