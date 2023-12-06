import { memo, useEffect, useState } from 'react'
import useArtistSongs from '@/web/api/hooks/useArtistSongs'
import useTracks from '@/web/api/hooks/useTracks'
import { FetchArtistSongsParams } from '@/shared/api/Artist'
import TrackList from '../../components/TrackList/TrackListVirtual'
import player from '@/web/states/player'
import { useParams } from 'react-router-dom'
import ScrollPagination from '@/web/components/ScrollPage'
import { fetchArtistSongs } from '@/web/api/artist'
import { fetchTracks } from '@/web/api/track'

const ArtistSongs = memo(() => {
  const [dataSource, setDatasource] = useState<Track[]>([])
  const [songIDs, setSongIDs] = useState<number[]>([])
  const params = useParams()
  const [hasMore, setHasMore] = useState(true)

  const getData = async (pageNo: number, pageSize: number) => {
    if (hasMore === false) return
    const songsParams: FetchArtistSongsParams = {
      id: Number(params.id) || 0,
      // order 加上time 会导致取不到更多的歌曲
      order: '',
      limit: pageSize || 50,
      offset: (pageNo - 1) * pageSize || 0,
    }
    const resp = await fetchArtistSongs(songsParams)
    console.log('params ', songsParams, resp)

    setHasMore(resp.more)

    const songIDList = resp.songs ? resp.songs.map((song: Track) => song.id) : []
    let arr = [...songIDs, ...songIDList]
    setSongIDs([...new Set(arr)])

    const fetchTrackResp = await fetchTracks({ ids: songIDList })

    let arrSource = [...dataSource, ...(fetchTrackResp?.songs as Track[])]
    setDatasource([...new Set(arrSource)])

    return { hasMore: resp.more }
  }
  const onPlay = (trackID: number | null = null) => {
    player.playAList(songIDs, trackID)
  }

  const renderItems = () => {
    return <TrackList tracks={dataSource} onPlay={onPlay}></TrackList>
  }

  return (
    <div className='h-800 z-10'>
      <ScrollPagination getData={getData} renderItems={renderItems} />
    </div>
  )
})

export default ArtistSongs
