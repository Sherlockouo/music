import { fetchTopPlaylist } from '@/web/api/playlist'
import CoverRowVirtual from '@/web/components/CoverRowVirtual'
import { useInfiniteQuery } from '@tanstack/react-query'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import useIntersectionObserver from '@/web/hooks/useIntersectionObserver'
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

  const dataSource = data?.pages.flatMap(page => page.playlists) || []
  const hasMore = hasNextPage
  const fetching = isFetchingNextPage

  const loadMore = useCallback(() => {
    if (hasMore && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasMore, isFetchingNextPage, fetchNextPage])

  const Footer = ()=>{
    const observePoint = useRef<HTMLDivElement | null>(null)
    const { onScreen: isScrollReachBottom } = useIntersectionObserver(observePoint)
    const [prevState,setPrevState] = useState<boolean>(false)

    useEffect(()=>{
      if(prevState != isScrollReachBottom && isScrollReachBottom && hasMore && !fetching){
        setPrevState(isScrollReachBottom)
        loadMore()
      }
    },[isScrollReachBottom, hasMore, fetching, loadMore])

    return <div ref={observePoint} className='flex justify-center pb-5'>{isFetchingNextPage && <Loading />}</div>
  }

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
        Footer={Footer}
        dynamicHeight={true}
        className='flex-1'
      />
    </div>
  )
}

const memoTop = memo(Top)
memoTop.displayName = 'Top'
export default memoTop
