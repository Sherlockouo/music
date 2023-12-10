import { resizeImage } from '@/web/utils/common'
import { cx, css } from '@emotion/css'
import useSettings from '@/web/hooks/useSettings'
import { useNavigate } from 'react-router-dom'
import { prefetchAlbum } from '@/web/api/hooks/useAlbum'
import { prefetchPlaylist } from '@/web/api/hooks/usePlaylist'
import { Virtuoso } from 'react-virtuoso'
import { useTranslation } from 'react-i18next'
import React, {
  CSSProperties,
  FC,
  ReactNode,
  createRef,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import humanNumber from 'human-number'

const CoverRow = ({
  albums,
  playlists,
  title,
  className,
  Footer,
}: {
  title?: string
  className?: string
  albums?: Album[]
  playlists?: Playlist[]
  containerClassName?: string
  containerStyle?: CSSProperties
  Footer?:React.FC
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

  const CoverItem: FC<{ item: Item }> = memo(({ item }) => {
    return (
      <div
        className='group relative'
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
          <>
            <h4 className='relative mb-4 mt-1 box-content h-7 overflow-hidden text-ellipsis whitespace-nowrap text-center sm:text-sm lg:-mb-4 lg:text-base 2xl:mb-0 2xl:text-lg'>
              <span className='bottom-0 left-0 right-0 flex-col justify-end p-1'>{item.name}</span>
            </h4>
            <CoverItemHoverCard item={item} />
          </>
        )}
      </div>
    )
  })
  const CoverItemHoverCard: FC<{ item: Item }> = memo(({ item }) => {
    const hostRef = createRef<HTMLDivElement>()
    const [visible, setVisible] = useState(false)
    const [parentInfo, setParentInfo] = useState<{
      width: number
      height: number
      x: number
      y: number
    }>({
      width: 0,
      height: 0,
      x: 0,
      y: 0,
    })

    const isAlbum = useMemo(() => 'type' in item && item.type !== 1, [item])
    const playlist = useMemo(() => (!isAlbum ? (item as Playlist) : null), [item])

    useEffect(() => {
      const parent = hostRef.current?.parentElement
      if (!parent) return

      const onMouseEnter = () => {
        setParentInfo(parent.getBoundingClientRect())

        setVisible(true)
      }

      const onMouseLeave = () => {
        setVisible(false)
      }

      parent.addEventListener('pointerenter', onMouseEnter)
      parent.addEventListener('pointerover', onMouseEnter)
      parent.addEventListener('pointerleave', onMouseLeave)
      parent.addEventListener('pointerout', onMouseLeave)
      return () => {
        parent.removeEventListener('pointerenter', onMouseEnter)
        parent.removeEventListener('pointerover', onMouseEnter)
        parent.removeEventListener('pointerleave', onMouseLeave)
        parent.removeEventListener('pointerout', onMouseLeave)
      }
    }, [])

    const { t } = useTranslation()

    return (
      <div ref={hostRef}>
        {
          <Portal>
            <div
              className={cx(
                'delay-50 pointer-events-none fixed z-10 transition duration-300 ease-in',
                visible
                  ? 'opacity-100 duration-300'
                  : 'scale-y-150 scale-x-50 opacity-0 duration-100'
              )}
              style={{
                left: `${parentInfo.x - parentInfo.width / 2}px`,
                top: `${parentInfo.y + parentInfo.height / 5}px`,
                width: `${parentInfo.width * 2}px`,
              }}
            >
              <img
                alt={item.name}
                src={resizeImage(
                  item?.picUrl || (item as Playlist)?.coverImgUrl || item?.picUrl || '',
                  'md'
                )}
                className={cx(
                  'absolute top-0 left-0 h-full w-full rounded-24 object-cover transition delay-100 duration-400 ease-out',
                  visible ? 'opacity-100 shadow-lg' : 'opacity-0 shadow-sm'
                )}
              />
              <div
                className={cx(
                  'absolute top-0 left-0 h-full w-full rounded-24 bg-white/60 shadow-lg transition delay-200 ease-in-out',
                  visible ? 'opacity-100 duration-400' : 'opacity-0 duration-100'
                )}
              ></div>
              <div
                className={cx(
                  'relative flex flex-col gap-4 px-2 py-4 transition delay-300 ease-in-out',
                  visible ? 'opacity-100 duration-200' : 'opacity-0 duration-75'
                )}
              >
                <header className='flex gap-2'>
                  <img
                    alt={item.name}
                    src={resizeImage(
                      item?.picUrl || (item as Playlist)?.coverImgUrl || item?.picUrl || '',
                      'md'
                    )}
                    className='rounded-18 aspect-square w-1/6 rounded'
                  />
                  <h4 className='flex-auto self-center text-center text-2xl font-bold'>
                    {item.name}
                  </h4>
                </header>
                {playlist && (
                  <footer className='flex w-full justify-around gap-2 text-stone-700'>
                    <p>
                      {playlist.trackCount ?? '-'} {t`coverrow.songs`}
                    </p>
                    <p>
                      {humanNumber(playlist.playCount ?? (playlist as any).playcount, n =>
                        n.toFixed(0)
                      )}{' '}
                      {t`coverrow.plays`}
                    </p>
                  </footer>
                )}
              </div>
            </div>
          </Portal>
        }
      </div>
    )
  })

  const Portal = memo(({ children }: { children?: ReactNode }) => {
    return createPortal(<>{children}</>, document.body.querySelector('#cover-hover-card')!)
  })
  
  return (
    <div className={className}>
      {/* Title */}
      {title && <h4 className='mb-6 text-14 font-bold uppercase dark:text-neutral-300'>{title}</h4>}

      <Virtuoso
        className='no-scrollbar'
        style={{
          height: 'calc(100vh - 132px)',
        }}
        components={{
          Footer:Footer
        }}
        data={rows}
        overscan={600}
        itemSize={el => el.getBoundingClientRect().height + 24}
        totalCount={rows.length}
        itemContent={(index, row) => (
          <div key={index} className='grid w-full grid-cols-4 gap-4 lg:mb-6 lg:gap-6'>
            {
            row.map((item: Item) => (
              <CoverItem key={item.id} item={item} />
            ))
            }
          </div>
        )}
      />
    </div>
  )
}

export default CoverRow
