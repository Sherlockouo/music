import { fetchMV, fetchMVUrl, fetchVideoUrl, fetchVideo } from '@/web/api/mv'
import { IpcChannels } from '@/shared/IpcChannels'
import {
  MVApiNames,
  FetchMVParams,
  FetchMVResponse,
  FetchMVUrlParams,
  FetchVideoParams,
} from '@/shared/api/MV'
import { useQuery } from '@tanstack/react-query'

export default function useMV(params: FetchMVParams) {
  return useQuery([MVApiNames.FetchMV, params], () => fetchMV(params), {
    enabled: !!params.mvid && params.mvid > 0 && !isNaN(Number(params.mvid)),
    staleTime: 5 * 60 * 1000, // 5 mins
  })
}

export function useMVUrl(params: FetchMVUrlParams) {
  return useQuery([MVApiNames.FetchMVUrl, params], () => fetchMVUrl(params), {
    enabled: !!params.id && params.id > 0 && !isNaN(Number(params.id)),
    staleTime: 60 * 60 * 1000, // 60 mins
  })
}

export function useVideo(params: FetchVideoParams) {
  return useQuery([MVApiNames.FetchVideo, params], () => fetchVideo(params), {
    enabled: !!params.id && params.id != '',
    staleTime: 5 * 60 * 1000, // 60 mins
  })
}

export function useVideoUrl(params: FetchVideoParams) {
  return useQuery([MVApiNames.FetchVideo, params, 'url'], () => fetchVideoUrl(params), {
    enabled: !!params.id && params.id != '',
    staleTime: 60 * 60 * 1000, // 60 mins
  })
}
