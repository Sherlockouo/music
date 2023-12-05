import { fetchHQPlaylist } from '@/web/api/playlist'
import Loading from '@/web/components/Animation/Loading'
import CoverRowVirtual from '@/web/components/CoverRowVirtual'
import useIntersectionObserver from '@/web/hooks/useIntersectionObserver'
import { useWhyDidYouUpdate } from 'ahooks'
import { throttle } from 'lodash-es'
import { memo, useEffect, useRef, useState } from 'react'

const reactQueryOptions = {
  refetchOnWindowFocus: false,
  refetchInterval: 1000 * 60 * 60, // 1 hour
  refetchOnMount: false,
}

const Hot = ({ cat }: { cat: string }) => {
  const [dataSource, setDatasource] = useState<Playlist[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const getData = async (pageSize: number)=> {
    
    if (hasMore === false) return
    setFetching(true)
    const resp = await fetchHQPlaylist({
      cat: cat,
      limit: pageSize || 50,
      before: dataSource.length ? dataSource[dataSource.length-1].updateTime || 0 : 0,
    })
    setFetching(false)
    
    setHasMore(resp.more)
    if(!resp.more) return 
    
    if(dataSource === resp.playlists) return 
    let arrSource = [...dataSource, ...resp.playlists]
    setDatasource([...new Set(arrSource)])
  }

  const getDataThrottle = throttle((pageSize: number)=>{
    getData(pageSize)
  },1000)

  useEffect(()=>{
    setHasMore(true)
    getDataThrottle(40)
  },[])

  useEffect(()=>{
    getDataThrottle(40)
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
        <CoverRowVirtual key={"Hot" + cat} playlists={dataSource} Footer={Footer} />
      </div>
    </>
  )
}

const memoHot = memo(Hot)
memoHot.displayName = 'Hot'
export default memoHot
// export default Hot
