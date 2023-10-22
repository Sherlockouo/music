import request from '@/web/utils/request'
import {
  FetchAudioSourceParams,
  FetchAudioSourceResponse,
  FetchLyricParams,
  FetchLyricResponse,
  FetchTracksParams,
  FetchTracksResponse,
  LikeATrackParams,
  LikeATrackResponse,
  UnblockParam,
  UnblockResponse,
} from '@/shared/api/Track'

// 获取歌曲详情
export function unblock(params: UnblockParam): Promise<UnblockResponse> {
  return request({
    url: '/unblock',
    method: 'GET',
    params: {
      track_id: params.track_id,
    },
  })
}
// 获取歌曲详情
export function fetchTracks(params: FetchTracksParams): Promise<FetchTracksResponse> {
  // console.log('song ids length', params.ids.length)
  // Todo: 如果ids长度太长会导致请求问题，所以需要处理下，这里暂时截断下
  return request({
    url: '/song/detail',
    method: 'get',
    params: {
      ids: params.ids.join(','),
    },
  })
}

// 获取音源URL
export function fetchAudioSource(
  params: FetchAudioSourceParams
): Promise<FetchAudioSourceResponse> {
  return request({
    url: '/song/url/v1',
    method: 'get',
    params: {
      level: 'exhigh',
      ...params,
      timestamp: Date.now(),
    },
  })
}

// 获取歌词
export function fetchLyric(params: FetchLyricParams): Promise<FetchLyricResponse> {
  return request({
    url: '/lyric',
    method: 'get',
    params,
  })
}

// 收藏歌曲
export function likeATrack(params: LikeATrackParams): Promise<LikeATrackResponse> {
  return request({
    url: '/like',
    method: 'post',
    params: {
      ...params,
      timestamp: Date.now(),
    },
  })
}
