import { formatDuration } from '@/web/utils/common'
import { css, cx } from '@emotion/css'
import player from '@/web/states/player'
import { useSnapshot } from 'valtio'
import Wave from '../Animation/Wave'
import Icon from '@/web/components/Icon'
import useIsMobile from '@/web/hooks/useIsMobile'
import useUserLikedTracksIDs, { useMutationLikeATrack } from '@/web/api/hooks/useUserLikedTracksIDs'
import toast from 'react-hot-toast'
import { memo, useEffect, useMemo, useState } from 'react'
import contextMenus, { openContextMenu } from '@/web/states/contextMenus'
import { NavLink } from 'react-router-dom'

const Actions = ({ track }: { track: Track }) => {
  const { data: likedTracksIDs } = useUserLikedTracksIDs()
  const likeATrack = useMutationLikeATrack()

  // 当右键菜单开启时，让按钮组在鼠标移走了后也能继续显示
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false)
  const menu = useSnapshot(contextMenus)
  useEffect(() => {
    if (menu.type !== 'track' || !menu.dataSourceID) {
      setIsContextMenuOpen(false)
    }
  }, [menu.dataSourceID, menu.type])

  return (
    <div
      className={cx('mr-5 flex', 'text-black/90 dark:text-white/90')}
      onClick={e => e.stopPropagation()}
    >
      {/* Context menu */}
      <div
        className={cx(
          'transition-opacity group-hover:opacity-100',
          isContextMenuOpen ? 'opacity-100' : 'opacity-0'
        )}
      >
        <button
          onClick={event => {
            setIsContextMenuOpen(true)
            openContextMenu({
              event,
              type: 'track',
              dataSourceID: track.id,
            })
          }}
          className={cx(
            'mr-3 flex h-10 w-10 items-center justify-center rounded-full  ',
            'transition-colors duration-400 dark:hover:bg-white/30 dark:hover:text-white/70',
            'hover:bg-black/30 hover:text-black/70'
          )}
        >
          <Icon name='more' className='h-4 w-5' />
        </button>
      </div>

      {/* Done-TODO: Add to playlist */}
      <button
        className={cx(
          'transition-opacity group-hover:opacity-100',
          isContextMenuOpen ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div
          onClick={() => {
            player.addToPlayList(track.id)
            // translate
            toast('已添加到播放列表')
          }}
          className={cx(
            'mr-3 flex h-10 w-10 items-center justify-center rounded-full ',
            'transition-colors duration-400 dark:hover:bg-white/30 dark:hover:text-white/70',
            'hover:bg-black/30 hover:text-black/70'
          )}
        >
          <Icon name='plus' className='h-5 w-5' />
        </div>
      </button>

      {/* Like */}
      <button
        className={cx(
          'rounded-full ',
          likedTracksIDs?.ids.includes(track.id)
            ? 'group-hover:bg-white/10'
            : cx(
                'bg-white/10 transition-opacity group-hover:opacity-100',
                isContextMenuOpen ? 'opacity-100' : 'opacity-0'
              )
        )}
      >
        <div
          onClick={() => likeATrack.mutateAsync(track.id)}
          className={cx(
            'flex h-10 w-10 items-center justify-center rounded-full ',
            'transition-colors duration-400 dark:hover:bg-white/30 dark:hover:text-white/70',
            'hover:bg-black/30 hover:text-black/70'
          )}
        >
          <Icon
            name={likedTracksIDs?.ids.includes(track.id) ? 'heart' : 'heart-outline'}
            className='h-5 w-5'
          />
        </div>
      </button>
    </div>
  )
}

const Track  = memo(({
  track,
  handleClick,
}: {
  track: Track
  handleClick: (e: React.MouseEvent<HTMLElement>, trackID: number) => void
})=> {
  const { track: playingTrack, state } = useSnapshot(player)

  return (
    <div
      key={track.id}
      onClick={e => handleClick(e, track.id)}
      onContextMenu={e => handleClick(e, track.id)}
      className={cx(
        'group relative flex h-14 items-center py-2 text-16 font-medium transition duration-300',
        'text-black/90 dark:text-white/90'
      )}
    >
      {/* Track no */}
      <div className='mr-3 lg:mr-6'>
        {playingTrack?.id === track.id ? (
          <span className='inline-block'>
            <Wave playing={state === 'playing'} />
          </span>
        ) : (
          String(track.no).padStart(2, '0')
        )}
      </div>

      {/* Track name */}
      <div className='flex flex-grow items-center'>
        <span className='line-clamp-1'>{track?.name}</span>
        {/* Explicit symbol */}
        {[1318912, 1310848].includes(track.mark) && (
          <Icon name='explicit' className='ml-2 mr-1 mt-px h-3.5 w-3.5' />
        )}
        {/* Other artists */}
        {track?.ar?.length > 1 && (
          <div className=''>
            <span className='px-1'>-</span>
            {track.ar.slice(1).map((artist, index) => (
              <span key={artist.id}>
                <NavLink
                  to={`/artist/${artist.id}`}
                  className='transition duration-300 hover:text-black/40 hover:dark:text-white/40'
                >
                  {artist.name}
                </NavLink>
                {index !== track.ar.length - 2 && ', '}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Desktop menu  */}
      <div className={cx('text-black/90 dark:text-white/90')}>
        <Actions track={track} />
      </div>

      {/* Mobile menu */}
      {/* <div className='lg:hidden'> */}
      {/*   <div className='h-10 w-10 rounded-full bg-night-900'></div> */}
      {/* </div> */}

      {/* Track duration */}
      <div className='text-right lg:block'>{formatDuration(track.dt, 'en-US', 'hh:mm:ss')}</div>
    </div>
  )
})

const TrackList = ({
  tracks,
  onPlay,
  className,
  isLoading,
  placeholderRows = 12,
}: {
  tracks?: Track[]
  onPlay: (id: number) => void
  className?: string
  isLoading?: boolean
  placeholderRows?: number
}) => {
  const isMobile = useIsMobile()

  const handleClick = (e: React.MouseEvent<HTMLElement>, trackID: number) => {
    if (isLoading) return
    if (e.type === 'contextmenu') {
      e.preventDefault()
      openContextMenu({
        event: e,
        type: 'track',
        dataSourceID: trackID,
        options: {
          useCursorPosition: true,
        },
      })
      return
    }

    if (isMobile) {
      onPlay?.(trackID)
    } else {
      if (e.detail === 2) onPlay?.(trackID)
    }
  }

  return (
    <div className={cx(className)}>
      {(isLoading ? [] : tracks)?.map(track => (
        <Track key={track.id} track={track} handleClick={handleClick} />
      ))}
      {(isLoading ? Array.from(new Array(placeholderRows).keys()) : []).map(index => (
        <div
          key={index}
          className={cx(
            'group relative flex h-14 items-center py-2 text-16 font-medium  transition duration-300 ease-in-out',
            'text-black dark:text-white'
          )}
        >
          {/* Track no */}
          <div className='mr-3 rounded-full  lg:mr-6'>00</div>

          {/* Track name */}
          <div className='flex flex-grow items-center'>
            <span className='mr-4 rounded-full '>PLACEHOLDER1234567</span>
          </div>

          {/* Track duration */}
          <div className='hidden text-right lg:block'>
            <span className='rounded-full '>00:00</span>
          </div>
        </div>
      ))}
    </div>
  )
}

const memorizedTrackList = memo(TrackList)
memorizedTrackList.displayName = 'TrackList'
export default memorizedTrackList
