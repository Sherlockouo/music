import { fetchAudioSource, fetchTracks } from '@/web/api/track'
import type {} from '@/web/api/track'
import reactQueryClient from '@/web/utils/reactQueryClient'
import { IpcChannels } from '@/shared/IpcChannels'
import {
  FetchAudioSourceParams,
  FetchTracksParams,
  FetchTracksResponse,
  TrackApiNames,
  UnblockParam,
  UnblockResponse,
} from '@/shared/api/Track'
import { CacheAPIs } from '@/shared/CacheAPIs'
import { useQuery } from '@tanstack/react-query'
import settings from '@/web/states/settings'

export async function fetchLongTracks(params:FetchTracksParams) {
  const len = Math.ceil(params.ids.length / 500)
  const promiseArr = []
  let offset = 0
  const totalIds = params.ids
  for (let i = 0; i < len; i++) {
    const req = new Promise((resolve, reject) => {
      params.ids = totalIds.slice(offset, offset + 500)
      resolve(fetchTracks(params))
    })
    promiseArr.push(req)
    offset += 500
  }

  const results = await Promise.all(promiseArr)
  const mergedResponse: FetchTracksResponse = results.reduce(
    (acc, curr) => {
      // 合并 code 字段
      acc.code = curr.code

      // 合并 songs 字段
      if (curr.songs) {
        if (!acc.songs) {
          acc.songs = []
        }
        acc.songs.push(...curr.songs)
      }

      // 合并 privileges 字段
      if (curr.privileges) {
        Object.assign(acc.privileges, curr.privileges)
      }

      return acc
    },
    { code: 0, privileges: {} }
  )

  return mergedResponse
}

export default function useTracks(params: FetchTracksParams) {
  return useQuery(
    [TrackApiNames.FetchTracks, params],
    async () => {
      // fetch from cache as initial data
      const cache = await window.ipcRenderer?.invoke(IpcChannels.GetApiCache, {
        api: CacheAPIs.Track,
        query: {
          ids: params.ids.join(','),
        },
      })
      if (cache) return cache
      return await fetchLongTracks(params)
    },
    {
      enabled: params.ids.length !== 0,
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    }
  )
}

export function fetchTracksWithReactQuery(params: FetchTracksParams) {
  return reactQueryClient.fetchQuery(
    [TrackApiNames.FetchTracks, params],
    async () => {
      const cache = await window.ipcRenderer?.invoke(IpcChannels.GetApiCache, {
        api: CacheAPIs.Track,
        query: {
          ids: params.ids.join(','),
        },
      })
      if (cache) return cache as FetchTracksResponse
      return fetchTracks(params)
    },
    {
      retry: 4,
      retryDelay: (retryCount: number) => {
        return retryCount * 500
      },
      staleTime: 86400000,
    }
  )
}

export function fetchAudioSourceWithReactQuery(params: FetchAudioSourceParams) {
  params.qqCookie = settings.qqCookie
  params.miguCookie = settings.miguCookie
  params.jooxCookie = settings.jooxCookie
  return reactQueryClient.fetchQuery(
    [TrackApiNames.FetchAudioSource, params],
    () => {
      return fetchAudioSource(params)
    },
    {
      retry: 1,
      staleTime: 0, // TODO: Web版1小时缓存
    }
  )
}
