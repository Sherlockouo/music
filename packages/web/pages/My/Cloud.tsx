import { useEffect, useState } from 'react'
import useArtistSongs from '@/web/api/hooks/useArtistSongs'
import useTracks from '@/web/api/hooks/useTracks'
import { FetchArtistSongsParams } from '@/shared/api/Artist'
import TrackList from '../Playlist/TrackList'
import player from '@/web/states/player'
import { useParams } from 'react-router-dom'
import ScrollPagination from '@/web/components/ScrollPage'
import { fetchArtistSongs } from '@/web/api/artist'
import { fetchTracks } from '@/web/api/track'
import toast from 'react-hot-toast'
import { CloudDiskInfoParam } from '@/shared/api/User'
import { cloudDisk } from '@/web/api/user'
const reactQueryOptions = {
  refetchOnWindowFocus: false,
  refetchInterval: 1000 * 60 * 60, // 1 hour
  refetchOnMount: false,
}


const Cloud = () => {
  const [dataSource, setDatasource] = useState<Track[]>([])
  const [songIDs, setSongIDs] = useState<number[]>([])
  const params = useParams()
  const [hasMore, setHasMore] = useState(true)

  const getData = async (pageNo: number, pageSize: number) => {
    if (hasMore === false) return
    const cloudParams: CloudDiskInfoParam = {
      limit: pageSize || 50,
      offset: (pageNo - 1) * pageSize || 0,
    }
    const resp = await cloudDisk(cloudParams)
    console.log('params ', cloudParams, resp)

    setHasMore(resp.hasMore)

    const songIDList = resp.data ? resp.data.map((song: SimpleSong) => song.simpleSong.id) : []
    let arr = [...songIDs, ...songIDList]
    setSongIDs([...new Set(arr)])

    const fetchTrackResp = await fetchTracks({ ids: songIDList })

    let arrSource = [...dataSource, ...(fetchTrackResp?.songs as Track[])]
    setDatasource([...new Set(arrSource)])

    return { hasMore: resp.hasMore }
  }
  const onPlay = (trackID: number | null = null) => {
    player.playAList(songIDs, trackID)
  }

  const renderItems = () => {
    return <TrackList tracks={dataSource} onPlay={onPlay}></TrackList>
  }

  return (
    <div className='h-800 z-10 mt-10'>
      <ScrollPagination getData={getData} renderItems={renderItems} />
    </div>
  )
}


export default Cloud