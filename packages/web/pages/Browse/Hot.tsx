import { fetchHQPlaylist } from '@/web/api/playlist'
import CoverRowVirtual from '@/web/components/CoverRowVirtual'
import { memo, useEffect, useState } from 'react'
import ScrollPagination from '@/web/components/ScrollPage'

const Hot = ({ cat }: { cat: string }) => {
  const [dataSource, setDatasource] = useState<Playlist[]>([])
  
  const [hasMore, setHasMore] = useState(true)
  
  const getData = async (pageNo: number, pageSize: number): Promise<{ hasMore: boolean }> => {
    if (hasMore === false) return { hasMore: false }
    const resp = await fetchHQPlaylist({
      cat: cat,
      limit: pageSize || 50,
      before: (pageNo - 1) * pageSize || 0,
    })
    
    setHasMore(resp.more)

    let arrSource = [...dataSource, ...resp.playlists]
    setDatasource([...new Set(arrSource)])
    return { hasMore: hasMore }
  }
  useEffect(() => {
    setDatasource([])
    setHasMore(true)
    getData(1, 50)
  }, [])
  const renderItems = () => {
    return <CoverRowVirtual key={"Hot" + cat} playlists={dataSource} />
  }

  return (
    <>
      <div className='calc(100vh - 132px)'>
        <ScrollPagination key={"Hot"+cat} getData={getData} renderItems={renderItems} />
      </div>
    </>
  )
}

const memoHot = memo(Hot)
memoHot.displayName = 'Hot'
export default memoHot
// export default Hot
