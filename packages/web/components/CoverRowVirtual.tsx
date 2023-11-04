import { resizeImage } from '@/web/utils/common'
import { cx, css } from '@emotion/css'
import useSettings from '@/web/hooks/useSettings'
import { useNavigate } from 'react-router-dom'
import { prefetchAlbum } from '@/web/api/hooks/useAlbum'
import { prefetchPlaylist } from '@/web/api/hooks/usePlaylist'
import { Virtuoso } from 'react-virtuoso'
import { CSSProperties, FC, createRef, useRef } from 'react'

const CoverRow = ({
  albums,
  playlists,
  title,
  className,
}: {
  title?: string
  className?: string
  albums?: Album[]
  playlists?: Playlist[]
  containerClassName?: string
  containerStyle?: CSSProperties
}) => {
  const navigate = useNavigate()
  const { showTrackListName } = useSettings()

  const goTo = (id: number) => {
    if (albums) navigate(`/album/${id}`)
    if (playlists) navigate(`/playlist/${id}`)
  }

  const prefetch = (id: number) => {
    if (albums) prefetchAlbum({ id })
    if (playlists) prefetchPlaylist({ id })
  }

  type Item = Album | Playlist
  const items: Item[] = albums || playlists || []
  const rows = items.reduce((rows: Item[][], item: Item, index: number) => {
    const rowIndex = Math.floor(index / 4)
    if (rows.length < rowIndex + 1) {
      rows.push([item])
    } else {
      rows[rowIndex].push(item)
    }
    return rows
  }, [])

  const CoverItem: FC<{ item: Item }> = ({ item }) => {
    return (
      <div
        className='group'
        onClick={() => goTo(item.id)}
        onMouseOver={() => prefetch(item.id)}
        key={item.id}
      >
        <img
          alt={item.name}
          src={resizeImage(
            item?.picUrl || (item as Playlist)?.coverImgUrl || item?.picUrl || '',
            'md'
          )}
          className='aspect-square w-full rounded-24'
        />
        {showTrackListName && (
          <h4 className='group-hover:whitespace-wrap relative mb-4 box-content h-7 overflow-hidden text-ellipsis whitespace-nowrap text-center group-hover:overflow-visible lg:mb-0'>
            <span className='bottom-0 left-0 right-0 flex-col justify-end p-1 transition group-hover:absolute group-hover:flex group-hover:min-h-[3rem] group-hover:whitespace-normal group-hover:rounded-b-24 group-hover:bg-neutral-50/70 group-hover:backdrop-blur-xl'>
              {item.name}
            </span>
          </h4>
        )}
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Title */}
      {title && <h4 className='mb-6 text-14 font-bold uppercase dark:text-neutral-300'>{title}</h4>}

      <Virtuoso
        className='no-scrollbar'
        style={{
          height: 'calc(100vh - 132px)',
        }}
        data={rows}
        overscan={5}
        itemSize={el => el.getBoundingClientRect().height + 24}
        totalCount={rows.length}
        components={{
          Header: () => <div className={cx('ease-in-out')}></div>,
          Footer: () => <div className='h-16'></div>,
        }}
        itemContent={(index, row) => (
          <div key={index} className='grid w-full grid-cols-4 gap-4 lg:mb-6 lg:gap-6'>
            {row.map((item: Item) => (
              <CoverItem key={item.id} item={item} />
            ))}
          </div>
        )}
      />
    </div>
  )
}

export default CoverRow
