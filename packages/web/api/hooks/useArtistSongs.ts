import { fetchArtistSongs } from '@/web/api/artist'
import { IpcChannels } from '@/shared/IpcChannels'
import { CacheAPIs } from '@/shared/CacheAPIs'
import {
  FetchArtistAlbumsParams,
  ArtistApiNames,
  FetchArtistSongsParams,
} from '@/shared/api/Artist'
import { useQuery } from '@tanstack/react-query'
import reactQueryClient from '@/web/utils/reactQueryClient'

export default function useArtistSongs(params: FetchArtistSongsParams) {
  const key = [ArtistApiNames.FetchArtistSongs, params]
  return useQuery(
    key,
    async () => {
      // fetch from cache as placeholder
      window.ipcRenderer
        ?.invoke(IpcChannels.GetApiCache, {
          api: CacheAPIs.ArtistAlbum,
          query: {
            ...params,
          },
        })
        .then(cache => {
          const existsQueryData = reactQueryClient.getQueryData(key)
          if (!existsQueryData && cache) {
            reactQueryClient.setQueryData(key, cache)
          }
        })

      return fetchArtistSongs(params)
    },
    {
      enabled: !!params.id && params.id !== 0,
      staleTime: 3600000,
    }
  )
}
