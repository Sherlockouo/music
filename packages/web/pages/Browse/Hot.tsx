import { fetchHQPlaylist } from '@/web/api/playlist'
import { PlaylistApiNames } from '@/shared/api/Playlists'
import { useQuery } from '@tanstack/react-query'
import CoverRowVirtual from '@/web/components/CoverRowVirtual'
import { memo, useCallback, useEffect, useState } from 'react'
import ScrollPagination from '@/web/components/ScrollPage'
import { toast } from 'react-hot-toast'
const reactQueryOptions = {
  refetchOnWindowFocus: false,
  refetchInterval: 1000 * 60 * 60, // 1 hour
  refetchOnMount: false,
}

const Hot = ({ cat }: { cat: string }) => {
  const [dataSource, setDatasource] = useState<Playlist[]>([])

  const [hasMore, setHasMore] = useState(true)

  const getData = async (pageNo: number, pageSize: number): Promise<{ hasMore: boolean }> => {
    console.log(pageNo, ' ', pageSize, 'cat ',cat, ' ',dataSource.length);

    if (hasMore === false) return { hasMore: false }

    const resp = await fetchHQPlaylist({ cat: cat, limit: pageSize || 50, before: (pageNo - 1) * pageSize || 0, })

    setHasMore(resp.more)
    
    let arrSource = [...dataSource, ...(resp.playlists)]
    setDatasource([...new Set(arrSource)])
    return { hasMore: hasMore }
  }
  useEffect(() => {
    
    setDatasource([])
    getData(1,50) 
    return () => {
    };
  }, []);
  const renderItems = () => {
    return <CoverRowVirtual playlists={dataSource} />
  }

  return (
    <>
      <div className='h-[600px]'>
        <ScrollPagination getData={getData} renderItems={renderItems} />
      </div>
    </>

  )
}

// const memoHot = memo(Hot)
// memoHot.displayName = 'Hot'
// export default memoHot
export default Hot
