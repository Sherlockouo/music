import { fetchTopPlaylist } from '@/web/api/playlist'
import { PlaylistApiNames } from '@/shared/api/Playlists'
import { useQuery } from '@tanstack/react-query'
import CoverRowVirtual from '@/web/components/CoverRowVirtual'
import { memo, useCallback, useEffect, useState } from 'react'
import ScrollPagination from '@/web/components/ScrollPage'

const reactQueryOptions = {
  refetchOnWindowFocus: false,
  refetchInterval: 1000 * 60 * 60, // 1 hour
  refetchOnMount: false,
}

const Top = ({ cat }: { cat: string }) => {
  const [dataSource, setDatasource] = useState<Playlist[]>([])

  const [hasMore, setHasMore] = useState(true)

  const getData = async (pageNo: number, pageSize: number): Promise<{ hasMore: boolean }> => {
    console.log('top ', cat, ' ', pageNo, ' ', pageSize);

    if (hasMore === false) return { hasMore: false }
    const resp = await fetchTopPlaylist({
      cat: cat,
      limit: pageSize || 50,
      offset: (pageNo - 1) * pageSize || 0,
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
    return <CoverRowVirtual key={"Top" + cat} playlists={dataSource} />
  }
  return (
    <>
      <div className='calc(100vh - 132px)'>
        <ScrollPagination key={"Top" + cat} getData={getData} renderItems={renderItems} />
      </div>
    </>
  )
}

const memoTop = memo(Top)
memoTop.displayName = 'Top'
export default memoTop
