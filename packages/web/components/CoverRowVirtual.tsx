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

// Heavy portion of the hover card. Only mounts after the user actually
// hovers a cover, so off-screen + on-screen-but-untouched cards pay zero
// state/effect/portal cost.
const CoverItemHoverCardContent: FC<{
  item: Item
  imageUrl: string
  rect: { width: number; height: number; x: number; y: number }
}> = memo(({ item, imageUrl, rect }) => {
  const isAlbum = 'type' in item && item.type !== 1
  const playlist = !isAlbum ? (item as Playlist) : null
  const { t } = useTranslation()

  const formattedPlayCount = useMemo(() => {
    if (!playlist) return null
    const count = playlist.playCount ?? (playlist as any).playcount
    return humanNumber(count, n => n.toFixed(0))
  }, [playlist])

  return (
    <HoverPortal>
      <div
        className='pointer-events-none fixed z-10 transition-all duration-300 ease-in-out opacity-100'
        style={{
          left: `${rect.x - rect.width / 2}px`,
          top: `${rect.y + rect.height / 5}px`,
          width: `${rect.width * 2}px`,
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
  )
})
CoverItemHoverCardContent.displayName = 'CoverItemHoverCardContent'

const CoverItem: FC<{
  item: Item
  goTo: (id: number) => void
  prefetch: (id: number) => void
  showTrackListName: boolean
}> = memo(({ item, goTo, prefetch, showTrackListName }) => {
  const imageUrl = useMemo(() => getImageUrl(item), [item])
  const [hoverRect, setHoverRect] = useState<{
    width: number
    height: number
    x: number
    y: number
  } | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>()

  // Warm the HTTP cache so hover-cards / detail navigations are instant.
  // We deliberately do NOT gate the visible <img>'s opacity on this — the
  // browser already paints from its own cache the moment the URL is
  // attached, and a JS-side "imageLoaded" flag was producing perceptible
  // blank tiles during fast Virtuoso scroll while React caught up.
  useEffect(() => {
    if (!imageManager.has(imageUrl)) {
      imageManager.load(imageUrl)
    }
  }, [imageUrl])

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    },
    []
  )

  // Hover handlers live on the card root — no extra <div> + useEffect per
  // card just to subscribe to pointer events. The expensive hover-card
  // markup is only rendered while the cursor is actually over the card.
  const handlePointerEnter = useCallback(() => {
    prefetch(item.id)
    if (!showTrackListName) return
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const el = rootRef.current
      if (!el) return
      setHoverRect(el.getBoundingClientRect())
    })
  }, [item.id, prefetch, showTrackListName])

  const handlePointerLeave = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setHoverRect(null)
  }, [])

  const handleClick = useCallback(() => goTo(item.id), [goTo, item.id])

  return (
    <div
      ref={rootRef}
      className='group relative'
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <div className='relative aspect-square w-full rounded-24 overflow-hidden'>
        <img
          alt={item.name}
          src={imageUrl}
          decoding='async'
          className='absolute inset-0 w-full h-full object-cover'
        />
      </div>
      {showTrackListName && (
        <>
          <h4 className='relative mb-4 mt-1 box-border h-7 overflow-hidden text-ellipsis whitespace-nowrap text-center sm:text-sm lg:-mb-4 lg:text-base 2xl:mb-0 2xl:text-lg'>
            <span className='bottom-0 left-0 right-0 flex-col justify-end p-1'>{item.name}</span>
          </h4>
          {hoverRect && (
            <CoverItemHoverCardContent
              item={item}
              imageUrl={imageUrl}
              rect={hoverRect}
            />
          )}
        </>
      )}
    </div>
  )
})
CoverItem.displayName = 'CoverItem'

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

  // Pin the source array's identity to either `albums` or `playlists`
  // (only one is ever supplied). Doing `albums || playlists || []`
  // inline allocates a fresh `[]` every render when both are undefined,
  // invalidating every downstream useMemo.
  const items: Item[] = useMemo(
    () => albums || playlists || [],
    [albums, playlists]
  )

  const rows = useMemo(() => {
    const out: Item[][] = []
    for (let i = 0; i < items.length; i++) {
      const rowIndex = i >> 2
      if (out.length <= rowIndex) out.push([items[i]])
      else out[rowIndex].push(items[i])
    }
    return out
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

  // We deliberately do NOT use scrollSeekConfiguration. The user prefers
  // real content rendered during fast scroll over skeleton placeholders.
  // CoverItem is memoized + ImageManager batches loads, so render cost is
  // cheap; we just need enough overscan/viewport so rows are mounted
  // before the user catches up to them.
  const components = useMemo(() => ({ Footer }), [Footer])

  // Stable itemContent so Virtuoso can reuse rows efficiently. The inline
  // version was re-created every render and forced Virtuoso to consider
  // every visible item dirty.
  const itemContent = useCallback(
    (index: number, row: Item[]) => (
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
    ),
    [goTo, prefetch, showTrackListName]
  )

  return (
    <div className={className}>
      {title && <h4 className='mb-6 text-14 font-bold uppercase dark:text-neutral-300'>{title}</h4>}

      <Virtuoso
        className='no-scrollbar smooth-scroll'
        style={virtuosoStyle}
        components={components}
        data={rows}
        // Item is one row of 4 cards (~320px tall). With 1200px buffer we
        // pre-mount ≈4 rows = 16 cards beyond the viewport — enough to
        // hide image-decode latency, small enough to keep initial mount
        // and scroll-while-still-mounting cheap. The previous values
        // (overscan 2400 + viewport 3200×2) mounted ~100 cards off-screen
        // each direction, which is the visible Browse-page jank.
        overscan={1200}
        defaultItemHeight={320}
        totalCount={rows.length}
        itemContent={itemContent}
        increaseViewportBy={{ top: 1200, bottom: 1200 }}
      />
    </div>
  )
}

export default CoverRow
