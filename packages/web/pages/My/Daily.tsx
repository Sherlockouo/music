import {
  fetchDailyRecommendPlaylists,
  fetchDailyRecommendSongs,
  fetchRecommendedPlaylists,
} from '@/web/api/playlist'
import { PlaylistApiNames } from '@/shared/api/Playlists'
import { useQuery } from '@tanstack/react-query'
import TrackList from '../Playlist/TrackList'
import player from '@/web/states/player'
import Loading from '@/web/components/Animation/Loading'

const reactQueryOptions = {
  refetchOnWindowFocus: false,
  refetchInterval: 1000 * 60 * 60, // 1 hour
  refetchOnMount: false,
}

const Daily = () => {
  const { data: dailyRecommendSongs, isLoading: isLoadingDaily } = useQuery(
    [PlaylistApiNames.FetchDailyRecommendSongs],
    () => fetchDailyRecommendSongs(),
    reactQueryOptions
  )

  const songIDs =
    dailyRecommendSongs?.data?.dailySongs?.map(track => {
      return track.id
    }) ?? []

  const onPlay = (trackID: number | null = null) => {
    player.playAList(songIDs, trackID)
  }

  return (
    <>
      {isLoadingDaily ? (
        <div className='flex justify-center'>
          <Loading />
        </div>
      ) : (
        <TrackList tracks={dailyRecommendSongs?.data?.dailySongs || []} onPlay={onPlay}></TrackList>
      )}
    </>
  )
}

export default Daily
