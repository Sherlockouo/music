import { fetchPlaylist, fetchTopPlaylist, fetchHQPlaylist } from '@/web/api/playlist'
import reactQueryClient from '@/web/utils/reactQueryClient'
import { IpcChannels } from '@/shared/IpcChannels'
import { CacheAPIs } from '@/shared/CacheAPIs'
import {
  FetchPlaylistParams,
  PlaylistApiNames,
  FetchPlaylistResponse,
  FetchTopPlaylistParams,
  FetchHQPlaylistParams,
} from '@/shared/api/Playlists'
import { useQuery } from '@tanstack/react-query'

const fetch = (params: FetchPlaylistParams) => {
  return fetchPlaylist(params)
}

const fetchTop = (params: FetchTopPlaylistParams) => {
  return fetchTopPlaylist(params)
}

const fetchHQ = (params: FetchHQPlaylistParams) => {
  return fetchHQPlaylist(params)
}

export const fetchFromCache = async (
  params: FetchPlaylistParams
): Promise<FetchPlaylistResponse | undefined> =>
  window.ipcRenderer?.invoke(IpcChannels.GetApiCache, {
    api: CacheAPIs.Playlist,
    query: params,
  })

export function useTopPlaylist(params: FetchTopPlaylistParams) {
  const key = [PlaylistApiNames.FetchTopPlaylistParams, params]
  return useQuery(
    key,
    async () => {
      // fetch from cache as placeholder
      // fetchFromCache(params).then(cache => {
      //   const existsQueryData = reactQueryClient.getQueryData(key)
      //   if (!existsQueryData && cache) {
      //     reactQueryClient.setQueryData(key, cache)
      //   }
      // })

      return fetchTop(params)
    },
    {
      enabled: !!(params.limit && params.limit > 0 && !isNaN(Number(params.limit))),
      refetchOnWindowFocus: true,
    }
  )
}

// fetch hq
export function useHQPlaylist(params: FetchHQPlaylistParams) {
  const key = [PlaylistApiNames.FetchHQPlaylistParams, params]
  return useQuery(
    key,
    async () => {
      // fetch from cache as placeholder
      // const existsQueryData = reactQueryClient.getQueryData(key)
      // if (!existsQueryData) {
      //   reactQueryClient.setQueryData(key, existsQueryData)
      // }

      return fetchHQ(params)
    },
    {
      enabled: !!(params.limit && params.limit > 0 && !isNaN(Number(params.limit))),
      refetchOnWindowFocus: true,
    }
  )
}

export default function usePlaylist(params: FetchPlaylistParams) {
  const key = [PlaylistApiNames.FetchPlaylist, params]
  return useQuery(
    key,
    async () => {
      // fetch from cache as placeholder
      fetchFromCache(params).then(cache => {
        const existsQueryData = reactQueryClient.getQueryData(key)
        if (!existsQueryData && cache) {
          reactQueryClient.setQueryData(key, cache)
        }
      })

      return fetch(params)
    },
    {
      enabled: !!(params.id && params.id > 0 && !isNaN(Number(params.id))),
      refetchOnWindowFocus: true,
    }
  )
}

export function fetchPlaylistWithReactQuery(params: FetchPlaylistParams) {
  return reactQueryClient.fetchQuery(
    [PlaylistApiNames.FetchPlaylist, params],
    () => fetch(params),
    {
      staleTime: 3600000,
    }
  )
}

export async function prefetchPlaylist(params: FetchPlaylistParams) {
  if (await fetchFromCache(params)) return
  await reactQueryClient.prefetchQuery(
    [PlaylistApiNames.FetchPlaylist, params],
    () => fetch(params),
    {
      staleTime: 3600000,
    }
  )
}
