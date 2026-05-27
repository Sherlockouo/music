import { fetchHQPlaylist } from '@/web/api/playlist'
import Loading from '@/web/components/Animation/Loading'
import CoverRowVirtual from '@/web/components/CoverRowVirtual'
import { useInfiniteQuery } from '@tanstack/react-query'
import { memo, useCallback, useMemo } from 'react'

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

  // Use Virtuoso's native endReached instead of IntersectionObserver.
  // The old IntersectionObserver-in-Footer approach caused a feedback loop:
  // new data → layout shift → observer re-fires → fetch again → bounce.
  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

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
        isLoadingMore={isFetchingNextPage}
        onEndReached={handleEndReached}
        dynamicHeight={true}
        className='flex-1'
      />
    </div>
  )
}

const memoHot = memo(Hot)
memoHot.displayName = 'Hot'
export default memoHot
