import { fetchDailyRecommendPlaylists, fetchRecommendedPlaylists } from '@/web/api/playlist'
import { PlaylistApiNames } from '@/shared/api/Playlists'
import { useQuery } from '@tanstack/react-query'
import CoverRowVirtual from '@/web/components/CoverRowVirtual'
import { memo } from 'react'
import Loading from '@/web/components/Animation/Loading'

interface RecommendResult {
  recommend?: Playlist[]
  result?: Playlist[]
}

const Recommend = memo(() => {
  const { data: dailyRecommendPlaylists, isLoading: isLoadingDaily } = useQuery<
    RecommendResult
  >(
    [PlaylistApiNames.FetchDailyRecommendPlaylists],
    () => fetchDailyRecommendPlaylists(),
    {
      refetchOnWindowFocus: false,
      refetchInterval: 1000 * 60 * 60,
      refetchOnMount: false,
    }
  )
  const { data: recommendedPlaylists, isLoading: isLoading } = useQuery<RecommendResult>(
    [PlaylistApiNames.FetchRecommendedPlaylists, { limit: 500 }],
    () => fetchRecommendedPlaylists({ limit: 500 }),
    {
      refetchOnWindowFocus: false,
      refetchInterval: 1000 * 60 * 60,
      refetchOnMount: false,
    }
  )

  const isLoadingData = isLoadingDaily || isLoading

  const playlists = isLoadingData
    ? []
    : [...(dailyRecommendPlaylists?.recommend || []), ...(recommendedPlaylists?.result || [])]

  if (isLoadingData && !playlists.length) {
    return (
      <div className='flex h-full items-center justify-center'>
        <Loading />
      </div>
    )
  }

  return (
    <div className='h-full flex flex-col'>
      <CoverRowVirtual playlists={playlists} dynamicHeight={true} className='flex-1' />
    </div>
  )
})

export default Recommend
