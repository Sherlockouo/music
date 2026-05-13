import { fetchLyric, fetchLyricNew } from '@/web/api/track'
import reactQueryClient from '@/web/utils/reactQueryClient'
import { FetchLyricParams, TrackApiNames } from '@/shared/api/Track'
import { CacheAPIs } from '@/shared/CacheAPIs'
import { IpcChannels } from '@/shared/IpcChannels'
import { useQuery } from '@tanstack/react-query'

export default function useLyric(params: FetchLyricParams) {
  const key = [TrackApiNames.FetchLyric, params]
  return useQuery(
    key,
    async () => {
      // fetch from cache as initial data
      const cache = await window.ipcRenderer?.invoke(IpcChannels.GetApiCache, {
        api: CacheAPIs.Lyric,
        query: {
          id: params.id,
        },
      })

      if (cache) return cache

      // 优先使用 lyric_new（含逐字歌词）
      try {
        const newLyric = await fetchLyricNew(params)
        if (newLyric?.code === 200) return newLyric
      } catch {
        // fallback to old API
      }

      return fetchLyric(params)
    },
    {
      enabled: !!params.id && params.id !== 0,
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    }
  )
}

export function fetchLyricWithReactQuery(params: FetchLyricParams) {
  return reactQueryClient.fetchQuery(
    [TrackApiNames.FetchLyric, params],
    () => {
      return fetchLyricNew(params).catch(() => fetchLyric(params))
    },
    {
      retry: 4,
      retryDelay: (retryCount: number) => {
        return retryCount * 500
      },
      staleTime: Infinity,
    }
  )
}
