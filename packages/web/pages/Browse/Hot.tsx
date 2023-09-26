import { fetchHQPlaylist } from '@/web/api/playlist'
import { PlaylistApiNames } from '@/shared/api/Playlists'
import { useQuery } from '@tanstack/react-query'
import CoverRowVirtual from '@/web/components/CoverRowVirtual'
import { memo, useCallback } from 'react'
const reactQueryOptions = {
    refetchOnWindowFocus: false,
    refetchInterval: 1000 * 60 * 60, // 1 hour
    refetchOnMount: false,
}

const Hot = ({cat}:{cat:string}) => {
    const { data: hqPlayList, isLoading: isLoadingTop } = useQuery(
        [PlaylistApiNames.FetchHQPlaylistParams,cat],
        () => fetchHQPlaylist({cat:cat, limit: 500,before:0}),
        reactQueryOptions
    )
        
    const playlists = isLoadingTop? []: hqPlayList?.playlists || []

    return <CoverRowVirtual playlists={playlists} />
}

// const memoHot = memo(Hot)
// memoHot.displayName = 'Hot'
// export default memoHot
export default Hot