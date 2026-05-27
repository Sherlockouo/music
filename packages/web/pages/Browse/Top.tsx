import { fetchTopPlaylist } from '@/web/api/playlist'
import CoverRowVirtual from '@/web/components/CoverRowVirtual'
import { useInfiniteQuery } from '@tanstack/react-query'
import { memo, useCallback, useMemo } from 'react'
import Loading from '@/web/components/Animation/Loading'

const Top = ({ cat }: { cat: string }) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery(
    ['topPlaylist', cat],
    async ({ pageParam = 1 }) => {
      const resp = await fetchTopPlaylist({
        cat,
        limit: 40,
        offset: (pageParam - 1) * 40 || 0,
      })
      return {
        playlists: resp.playlists,
        hasMore: resp.more,
      }
    },
    {
      getNextPageParam: (lastPage, pages) => {
        if (!lastPage.hasMore) return undefined
        return pages.length + 1
      },
      refetchOnWindowFocus: false,
      refetchInterval: 1000 * 60 * 60,
      refetchOnMount: false,
    }
  )

  // Stable identity — see comment in Hot.tsx / Recommend.tsx.
  const dataSource = useMemo(
    () => data?.pages.flatMap(page => page.playlists) || [],
    [data?.pages]
  )

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
    <div className='h-full flex flex-col'>
      <CoverRowVirtual
        key={"Top" + cat}
        playlists={dataSource}
        isLoadingMore={isFetchingNextPage}
        onEndReached={handleEndReached}
        dynamicHeight={true}
        className='flex-1'
      />
    </div>
  )
}

const memoTop = memo(Top)
memoTop.displayName = 'Top'
export default memoTop
