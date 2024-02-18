import { useEffect, useRef, useState } from 'react'
import useArtistSongs from '@/web/api/hooks/useArtistSongs'
import useTracks from '@/web/api/hooks/useTracks'
import { FetchArtistSongsParams } from '@/shared/api/Artist'
import TrackList from '../../components/TrackList/TrackListVirtual'
import player from '@/web/states/player'
import { useParams } from 'react-router-dom'
import ScrollPagination from '@/web/components/ScrollPage'
import { fetchArtistSongs } from '@/web/api/artist'
import { fetchTracks } from '@/web/api/track'
import toast from 'react-hot-toast'
import { CloudDiskInfoParam } from '@/shared/api/User'
import { cloudDisk } from '@/web/api/user'
import { motion } from 'framer-motion'
import Track from '@/web/components/TrackList/Track'
import { openContextMenu } from '@/web/states/contextMenus'
import { useSnapshot } from 'valtio'
import useIntersectionObserver from '@/web/hooks/useIntersectionObserver'
import { useThrottle } from 'react-use'
import { has, throttle } from 'lodash-es'
import Loading from '@/web/components/Animation/Loading'
import { cx } from '@emotion/css'
import { fetchFetchRecentSongs } from '@/web/api/playlist'
import { FetchRecentSongsParams } from '@/shared/api/Playlists'

const reactQueryOptions = {
  refetchOnWindowFocus: false,
  refetchInterval: 1000 * 60 * 60, // 1 hour
  refetchOnMount: false,
}

const Recent = () => {
  const {trackID, state} = useSnapshot(player)
  const [dataSource, setDatasource] = useState<Track[]>([])
  const [songIDs, setSongIDs] = useState<number[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const observePoint = useRef<HTMLDivElement | null>(null)
  const { onScreen: isScrollReachBottom } = useIntersectionObserver(observePoint)
  const getData = async (pageNo: number, pageSize: number) => {
    if (hasMore === false) return
    const cloudParams: FetchRecentSongsParams = {
      limit:  pageNo * pageSize || 50,
    }
    const resp = await fetchFetchRecentSongs(cloudParams)

    setHasMore(dataSource.length < resp.data.total)

    const songIDList = resp.data ? resp.data.list.map((song: RecentSongs) => song.data.id) : []
    let arr = [...songIDs, ...songIDList]
    setSongIDs([...new Set(arr)])

    const recentSongs = resp.data ? resp.data.list.map((song: RecentSongs) => song.data) : []
    
    setDatasource(recentSongs)

    return { hasMore: dataSource.length < resp.data.total }
  }
  const getDataThrottle = throttle((pageNo: number, pageSize: number)=>{
    console.log('page ',pageNo);
    
    getData(pageNo,pageSize)
  },1000)

  useEffect(()=>{
    if(isScrollReachBottom && hasMore){
      setCurrentPage(currentPage + 1)
      getDataThrottle(currentPage,50)
    }
  },[isScrollReachBottom])
  
  const onPlay = (trackID: number | null = null) => {
    player.playAList(songIDs, trackID)
  }
  
  const handleClick = (e: React.MouseEvent<HTMLElement>, trackID: number) => {
    if (e.type === 'contextmenu') {
      e.preventDefault()
      openContextMenu({
        event: e,
        type: 'track',
        dataSourceID: trackID,
        options: {
          useCursorPosition: true,
        },
      })
      return
    }

    if (e.detail === 2) onPlay?.(trackID)
  }
  return (
    <motion.div className={cx('min-h-screen')}>
      {(dataSource)?.map((track,index)=>{
              return <Track
              key={index}
                track={track} 
                index={index} 
                playingTrackID={trackID || 0}
                state={state}
                handleClick={handleClick} />
        })
        }
        <div ref={observePoint} className='flex justify-center'>{hasMore && <Loading />}</div>
    </motion.div>
  )
}

export default Recent
