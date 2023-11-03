export enum PlaylistApiNames {
  FetchPlaylist = 'fetchPlaylist',
  FetchRecommendedPlaylists = 'fetchRecommendedPlaylists',
  FetchDailyRecommendPlaylists = 'fetchDailyRecommendPlaylists',
  FetchDailyRecommendSongs = 'fetchDailyRecommendSongs',
  LikeAPlaylist = 'likeAPlaylist',
  FetchTopPlaylistParams = 'fetchTopPlaylist',
  FetchHQPlaylistParams = 'fetchHQPlaylist',
}

// top playlist
export interface FetchTopPlaylistParams {
  cat?: string
  order?: string
  limit: number
  offset: number
}

export interface FetchTopPlaylistResponse {
  playlists: Playlist[]
  code: number
  more: boolean
  // 分类
  cat: string
  total: number
}

// hot playlist
export interface FetchHQPlaylistParams {
  cat: string
  limit: number
  before: number
}

export interface FetchHQPlaylistResponse {
  playlists: Playlist[]
  code: number
  more: boolean
  lasttime: number
  total: number
}

// 歌单详情
export interface FetchPlaylistParams {
  id: number
  s?: number // 歌单最近的 s 个收藏者
}
export interface FetchPlaylistResponse {
  code: number
  playlist: Playlist
  privileges: unknown // TODO: unknown type
  relatedVideos: null
  resEntrance: null
  sharedPrivilege: null
  urls: null
}

// 推荐歌单
export interface FetchRecommendedPlaylistsParams {
  limit?: number
}
export interface FetchRecommendedPlaylistsResponse {
  code: number
  category: number
  hasTaste: boolean
  result: Playlist[]
}

// 每日推荐歌曲（需要登录）
export interface FetchDailyRecommendSongsResponse {
  code: number
  data: {
    dailySongs: Track[]
    orderSongs: []
    recommendReasons: []
  }
}

// 每日推荐歌单（需要登录）
export interface FetchDailyRecommendPlaylistsResponse {
  code: number
  featureFirst: boolean
  haveRcmdSongs: boolean
  recommend: Playlist[]
}

export interface LikeAPlaylistParams {
  t: 1 | 2
  id: number
}
export interface LikeAPlaylistResponse {
  code: number
}

export interface AddSongToPlayListParams {
  // operation add|del
  op: string
  // playlist id
  pid: Number
  // 添加到pid的song ids, split with ,
  tracks: string
}

// 添加/删除歌曲到歌单
export interface AddSongToPlayListParams {
  // operation add|del
  op: string
  // playlist id
  pid: Number
  // 添加到pid的song ids, split with ,
  tracks: string
}

export interface AddSongToPlayListResponse {
  trackIDS: string[]
  code: Number
  count: Number
  cloudCount: Number
}
