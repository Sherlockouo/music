import { fetchHQPlaylist } from '@/web/api/playlist'
import Loading from '@/web/components/Animation/Loading'
import CoverRowVirtual from '@/web/components/CoverRowVirtual'
import useIntersectionObserver from '@/web/hooks/useIntersectionObserver'
import { useInfiniteQuery } from '@tanstack/react-query'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'

const InfiniteScrollFooter = ({
  hasMore,
  fetching,
  isFetchingNextPage,
  loadMore,
}: {
  hasMore: boolean
  fetching: boolean
  isFetchingNextPage: boolean
  loadMore: () => void
}) => {
  const observePoint = useRef<HTMLDivElement | null>(null)
  const { onScreen: isScrollReachBottom } = useIntersectionObserver(observePoint)
  const [prevState, setPrevState] = useState<boolean>(false)

  useEffect(() => {
    if (prevState != isScrollReachBottom && isScrollReachBottom && hasMore && !fetching) {
      setPrevState(isScrollReachBottom)
      loadMore()
    }
  }, [isScrollReachBottom, hasMore, fetching, loadMore])

  return (
    <div ref={observePoint} className='flex justify-center pb-10'>
      {isFetchingNextPage && <Loading />}
    </div>
  )
}

const Hot = ({ cat }: { cat: string }) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery(
    ['hqPlaylist', cat],
    async ({ pageParam = 0 }) => {
      const resp = await fetchHQPlaylist({
        cat,
        limit: 50,
        before: pageParam || 0,
      })
      return {
        playlists: resp.playlists,
        hasMore: resp.more,
        lastUpdateTime: resp.playlists[resp.playlists.length - 1]?.updateTime || 0,
      }
    },
    {
      getNextPageParam: lastPage => {
        if (!lastPage.hasMore) return undefined
        return lastPage.lastUpdateTime
      },
      refetchOnWindowFocus: false,
      refetchInterval: 1000 * 60 * 60,
      refetchOnMount: false,
    }
  )

  // Stable identity: flatMap allocates a fresh array on every render, which
  // makes Virtuoso treat the list as new and re-key visible rows on every
  // unrelated parent render (background refetch, observer state change…),
  // briefly blanking tiles during fast scroll.
  const dataSource = useMemo(
    () => data?.pages.flatMap(page => page.playlists) || [],
    [data?.pages]
  )
  const hasMore = hasNextPage ?? false
  const fetching = isFetchingNextPage

  const loadMore = useCallback(() => {
    if (hasMore && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasMore, isFetchingNextPage, fetchNextPage])

  const Footer = useCallback(() => (
    <InfiniteScrollFooter
      hasMore={hasMore}
      fetching={fetching}
      isFetchingNextPage={isFetchingNextPage}
      loadMore={loadMore}
    />
  ), [hasMore, fetching, isFetchingNextPage, loadMore])

  if (isLoading && !dataSource.length) {
    return (
      <div className='flex h-full items-center justify-center'>
        <Loading />
      </div>
    )
  }

  return (
    <div className='flex h-full flex-col'>
      <CoverRowVirtual
        key={'Hot' + cat}
        playlists={dataSource}
        Footer={Footer}
        dynamicHeight={true}
        className='flex-1'
      />
    </div>
  )
}

const memoHot = memo(Hot)
memoHot.displayName = 'Hot'
export default memoHot
