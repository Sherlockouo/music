import { fetchTopPlaylist } from '@/web/api/playlist'
import { PlaylistApiNames } from '@/shared/api/Playlists'
import { useQuery } from '@tanstack/react-query'
import CoverRowVirtual from '@/web/components/CoverRowVirtual'
import { memo, useCallback } from 'react'

const reactQueryOptions = {
  refetchOnWindowFocus: false,
  refetchInterval: 1000 * 60 * 60, // 1 hour
  refetchOnMount: false,
}

const Top = ({ cat }: { cat: string }) => {
  const { data: topPlayList, isLoading: isLoadingTop } = useQuery(
    [PlaylistApiNames.FetchTopPlaylistParams, cat],
    () => fetchTopPlaylist({ cat: cat, limit: 500, offset: 0 }),
    reactQueryOptions
  )

  const playlists = isLoadingTop ? [] : topPlayList?.playlists || []

  return <CoverRowVirtual playlists={playlists} />
}

const memoTop = memo(Top)
memoTop.displayName = 'Top'
export default memoTop
