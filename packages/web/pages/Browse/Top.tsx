import { fetchTopPlaylist } from '@/web/api/playlist'
import { PlaylistApiNames } from '@/shared/api/Playlists'
import { useQuery } from '@tanstack/react-query'
import CoverRowVirtual from '@/web/components/CoverRowVirtual'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import ScrollPagination from '@/web/components/ScrollPage'
import useIntersectionObserver from '@/web/hooks/useIntersectionObserver'
import Loading from '@/web/components/Animation/Loading'

const reactQueryOptions = {
  refetchOnWindowFocus: false,
  refetchInterval: 1000 * 60 * 60, // 1 hour
  refetchOnMount: false,
}

const Top = ({ cat }: { cat: string }) => {
  const [dataSource, setDatasource] = useState<Playlist[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const getData = async (pageNo: number, pageSize: number) =>{
    if (hasMore === false) return 
    setFetching(true)
    const resp = await fetchTopPlaylist({
      cat: cat,
      limit: pageSize || 40,
      offset: (pageNo - 1) * pageSize || 0,
    })
    setFetching(false)
    setHasMore(resp.more)
    if(!resp.more) return

    let arrSource = [...dataSource, ...resp.playlists]
    setDatasource([...new Set(arrSource)])
    return { hasMore: hasMore }
  }
  useEffect(() => {
    setDatasource([])
    setHasMore(true)
    getData(1, 40)
  }, [])

  useEffect(()=>{
    getData(currentPage,40)
  },[currentPage])

  const Footer = ()=>{
    const observePoint = useRef<HTMLDivElement | null>(null)
    const { onScreen: isScrollReachBottom } = useIntersectionObserver(observePoint)
    const [prevState,setPrevState] = useState<boolean>(false)
    const loadMore = ()=>{
      setCurrentPage(currentPage+1)
    }
    useEffect(()=>{
      if(prevState != isScrollReachBottom && isScrollReachBottom && hasMore && !fetching){
        setPrevState(isScrollReachBottom)
        loadMore()
      }
    },[isScrollReachBottom])

    return <div ref={observePoint} className='flex justify-center pb-5'>{hasMore && <Loading />}</div>
  }
  
  return (
    <>
      <div className='h-full'>
        <CoverRowVirtual key={"Top" + cat} playlists={dataSource} Footer={Footer} />
      </div>
    </>
  )
}

const memoTop = memo(Top)
memoTop.displayName = 'Top'
export default memoTop
