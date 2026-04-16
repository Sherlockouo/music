import { resizeImage } from '@/web/utils/common'
import { cx } from '@emotion/css'
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
  memo,
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from 'react'
import { createPortal } from 'react-dom'
import humanNumber from 'human-number'

// 图片状态管理
class ImageManager {
  private cache = new Set<string>()
  private listeners = new Map<string, Set<() => void>>()
  private loading = new Set<string>()
  private readonly MAX_CACHE_SIZE = 500

  has(src: string): boolean {
    return this.cache.has(src)
  }

  load(src: string): void {
    if (!src || this.cache.has(src) || this.loading.has(src)) return

    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const entriesToDelete = Math.floor(this.MAX_CACHE_SIZE * 0.1)
      let deleted = 0
      for (const url of this.cache) {
        if (deleted >= entriesToDelete) break
        this.cache.delete(url)
        deleted++
      }
    }

    this.loading.add(src)

    const img = document.createElement('img')
    img.onload = () => {
      this.cache.add(src)
      this.loading.delete(src)
      this.notify(src)
      this.listeners.delete(src)
    }
    img.onerror = () => {
      this.cache.add(src)
      this.loading.delete(src)
      this.notify(src)
      this.listeners.delete(src)
    }
    img.src = src
  }

  subscribe(src: string, callback: () => void): () => void {
    if (!this.listeners.has(src)) {
      this.listeners.set(src, new Set())
    }
    this.listeners.get(src)!.add(callback)

    return () => {
      const callbacks = this.listeners.get(src)
      if (callbacks) {
        callbacks.delete(callback)
        if (callbacks.size === 0) {
          this.listeners.delete(src)
        }
      }
    }
  }

  private notify(src: string): void {
    const callbacks = this.listeners.get(src)
    if (callbacks) {
      Promise.resolve().then(() => {
        callbacks.forEach(cb => cb())
      })
    }
  }
}

const imageManager = new ImageManager()

type Item = Album | Playlist

const getImageUrl = (item: Item): string => {
  const url = item?.picUrl || (item as Playlist)?.coverImgUrl || ''
  return resizeImage(url, 'md')
}

const HoverPortal = memo(({ children }: { children?: ReactNode }) => {
  return createPortal(<>{children}</>, document.body.querySelector('#cover-hover-card')!)
})

const CoverItemHoverCard: FC<{
  item: Item
  imageUrl: string
}> = memo(({ item, imageUrl }) => {
  const hostRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [parentInfo, setParentInfo] = useState({ width: 0, height: 0, x: 0, y: 0 })
  const rafRef = useRef<number>()

  const isAlbum = useMemo(() => 'type' in item && item.type !== 1, [item])
  const playlist = useMemo(() => (!isAlbum ? (item as Playlist) : null), [item, isAlbum])

  const formattedPlayCount = useMemo(() => {
    if (!playlist) return null
    const count = playlist.playCount ?? (playlist as any).playcount
    return humanNumber(count, n => n.toFixed(0))
  }, [playlist])

  useEffect(() => {
    const parent = hostRef.current?.parentElement
    if (!parent) return

    const onMouseEnter = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        setParentInfo(parent.getBoundingClientRect())
        setVisible(true)
      })
    }

    const onMouseLeave = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      setVisible(false)
    }

    parent.addEventListener('pointerenter', onMouseEnter, { passive: true })
    parent.addEventListener('pointerleave', onMouseLeave, { passive: true })

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      parent.removeEventListener('pointerenter', onMouseEnter)
      parent.removeEventListener('pointerleave', onMouseLeave)
    }
  }, [])

  const { t } = useTranslation()

  if (!visible) {
    return <div ref={hostRef} />
  }

  return (
    <div ref={hostRef}>
      <HoverPortal>
        <div
          className='pointer-events-none fixed z-10 transition-all duration-300 ease-in-out opacity-100'
          style={{
            left: `${parentInfo.x - parentInfo.width / 2}px`,
            top: `${parentInfo.y + parentInfo.height / 5}px`,
            width: `${parentInfo.width * 2}px`,
          }}
        >
          <img
            alt={item.name}
            loading='eager'
            decoding='async'
            src={imageUrl}
            className='absolute top-0 left-0 h-full w-full rounded-24 object-cover shadow-lg'
          />
          <div className='absolute top-0 left-0 h-full w-full rounded-24 bg-white/60 shadow-lg'></div>
          <div className='relative flex flex-col gap-4 px-2 py-4'>
            <header className='flex gap-2'>
              <img
                alt={item.name}
                loading='eager'
                decoding='async'
                src={imageUrl}
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
                  {formattedPlayCount} {t`coverrow.plays`}
                </p>
              </footer>
            )}
          </div>
        </div>
      </HoverPortal>
    </div>
  )
})

const CoverItem: FC<{
  item: Item
  goTo: (id: number) => void
  prefetch: (id: number) => void
  showTrackListName: boolean
}> = memo(({ item, goTo, prefetch, showTrackListName }) => {
  const imageUrl = useMemo(() => getImageUrl(item), [item])
  const [imageLoaded, setImageLoaded] = useState(() => imageManager.has(imageUrl))

  // 当 item 变化（Virtuoso 复用）时重置加载状态
  useEffect(() => {
    setImageLoaded(imageManager.has(imageUrl))
  }, [imageUrl])

  useEffect(() => {
    if (imageManager.has(imageUrl)) {
      if (!imageLoaded) setImageLoaded(true)
      return
    }

    const unsubscribe = imageManager.subscribe(imageUrl, () => {
      setImageLoaded(true)
    })

    imageManager.load(imageUrl)

    return () => {
      unsubscribe()
    }
  }, [imageUrl])

  return (
    <div
      className='group relative'
      onClick={() => goTo(item.id)}
      onMouseOver={() => prefetch(item.id)}
    >
      <div className='relative aspect-square w-full rounded-24 overflow-hidden'>
        <img
          alt={item.name}
          src={imageUrl}
          decoding='async'
          loading='lazy'
          className={cx(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-150 ease-out',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      </div>
      {showTrackListName && (
        <>
          <h4 className='relative mb-4 mt-1 box-border h-7 overflow-hidden text-ellipsis whitespace-nowrap text-center sm:text-sm lg:-mb-4 lg:text-base 2xl:mb-0 2xl:text-lg'>
            <span className='bottom-0 left-0 right-0 flex-col justify-end p-1'>{item.name}</span>
          </h4>
          <CoverItemHoverCard item={item} imageUrl={imageUrl} />
        </>
      )}
    </div>
  )
})

interface CoverRowProps {
  title?: string
  className?: string
  albums?: Album[]
  playlists?: Playlist[]
  containerClassName?: string
  containerStyle?: CSSProperties
  Footer?: React.FC
  dynamicHeight?: boolean
  style?: CSSProperties
}

const CoverRow = ({
  albums,
  playlists,
  title,
  className,
  Footer,
  dynamicHeight = false,
  style,
}: CoverRowProps) => {
  const navigate = useNavigate()
  const { showTrackListName } = useSettings()

  const goTo = useCallback((id: number) => {
    if (albums) navigate(`/album/${id}`)
    if (playlists) navigate(`/playlist/${id}`)
  }, [albums, playlists, navigate])

  const prefetch = useCallback((id: number) => {
    if (albums) prefetchAlbum({ id })
    if (playlists) prefetchPlaylist({ id })
  }, [albums, playlists])

  const items: Item[] = albums || playlists || []

  const rows = useMemo(() => {
    return items.reduce((rows: Item[][], item: Item, index: number) => {
      const rowIndex = Math.floor(index / 4)
      if (rows.length < rowIndex + 1) {
        rows.push([item])
      } else {
        rows[rowIndex].push(item)
      }
      return rows
    }, [])
  }, [items])

  // 预加载前 48 项 (12 行)
  useEffect(() => {
    if (items.length === 0) return

    const urlsToLoad = items.slice(0, 80).map(getImageUrl)
    let index = 0
    const batchSize = 12

    const loadBatch = () => {
      const batch = urlsToLoad.slice(index, index + batchSize)
      batch.forEach(url => imageManager.load(url))
      index += batchSize

      if (index < urlsToLoad.length) {
        requestIdleCallback ?
          requestIdleCallback(loadBatch) :
          setTimeout(loadBatch, 0)
      }
    }

    loadBatch()
  }, [items])

  const virtuosoStyle = useMemo(() => {
    if (dynamicHeight) {
      return { height: '100%', ...style }
    }
    return {
      height: 'calc(100vh - 132px)',
      ...style,
    }
  }, [dynamicHeight, style])

  return (
    <div className={className}>
      {title && <h4 className='mb-6 text-14 font-bold uppercase dark:text-neutral-300'>{title}</h4>}

      <Virtuoso
        className='no-scrollbar smooth-scroll'
        style={virtuosoStyle}
        components={{
          Footer: Footer,
        }}
        data={rows}
        overscan={4800}
        defaultItemHeight={320}
        totalCount={rows.length}
        itemContent={(index, row) => (
          <div
            key={index}
            className='virtuoso-grid-item grid w-full grid-cols-4 gap-4 lg:mb-6 lg:gap-6'
          >
            {row.map((item: Item) => (
              <CoverItem
                key={item.id}
                item={item}
                goTo={goTo}
                prefetch={prefetch}
                showTrackListName={showTrackListName}
              />
            ))}
          </div>
        )}
        increaseViewportBy={{ top: 6400, bottom: 6400 }}
      />
    </div>
  )
}

export default CoverRow
