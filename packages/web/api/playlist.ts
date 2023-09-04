import request from '@/web/utils/request'
import {
  FetchPlaylistParams,
  FetchPlaylistResponse,
  FetchRecommendedPlaylistsParams,
  FetchRecommendedPlaylistsResponse,
  FetchDailyRecommendPlaylistsResponse,
  LikeAPlaylistParams,
  LikeAPlaylistResponse,
  FetchTopPlaylistParams,
  FetchTopPlaylistResponse,
  FetchHQPlaylistParams,
  FetchHQPlaylistResponse,
} from '@/shared/api/Playlists'

// hq 歌单
export function fetchHQPlaylist(params: FetchHQPlaylistParams): Promise<FetchHQPlaylistResponse> {
  if (!params.cat) params.cat = '' // 网易云默认返回8个收藏者，这里设置为0，减少返回的JSON体积
  return request({
    url: '/top/playlist/highquality',
    method: 'get',
    params: {
      ...params,
    },
  })
}

// top歌单
export function fetchTopPlaylist(params: FetchTopPlaylistParams): Promise<FetchTopPlaylistResponse> {
  if (!params.cat) params.cat = '' // 网易云默认返回8个收藏者，这里设置为0，减少返回的JSON体积
  return request({
    url: '/top/playlist',
    method: 'get',
    params: {
      ...params,
    },
  })
}

// 歌单详情
export function fetchPlaylist(params: FetchPlaylistParams): Promise<FetchPlaylistResponse> {
  if (!params.s) params.s = 0 // 网易云默认返回8个收藏者，这里设置为0，减少返回的JSON体积
  return request({
    url: '/playlist/detail',
    method: 'get',
    params: {
      ...params,
      timestamp: new Date().getTime(),
    },
  })
}

// 推荐歌单
export function fetchRecommendedPlaylists(
  params: FetchRecommendedPlaylistsParams
): Promise<FetchRecommendedPlaylistsResponse> {
  return request({
    url: '/personalized',
    method: 'get',
    params,
  })
}

// 每日推荐歌单（需要登录）
export function fetchDailyRecommendPlaylists(): Promise<FetchDailyRecommendPlaylistsResponse> {
  return request({
    url: '/recommend/resource',
    method: 'get',
    params: {
      timestamp: Date.now(),
    },
  })
}

export function likeAPlaylist(params: LikeAPlaylistParams): Promise<LikeAPlaylistResponse> {
  return request({
    url: '/playlist/subscribe',
    method: 'post',
    params: {
      ...params,
      timestamp: Date.now(),
    },
  })
}
