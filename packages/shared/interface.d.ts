declare interface Playlist {
  id: number
  name: string
  highQuality: boolean
  playCount: number
  trackCount: number
  trackNumberUpdateTime: number

  // 非必有

  adType?: number
  alg?: string
  anonimous?: boolean
  artists?: Artist[]
  backgroundCoverId?: number
  backgroundCoverUrl?: string | null
  creator: User
  canDislike?: boolean
  cloudTrackCount?: number
  commentThreadId?: string
  copywriter?: string
  coverImgId_str?: string
  coverImgId?: number
  coverImgUrl?: string
  createTime?: number
  description?: string | null
  englishTitle?: string | null
  historySharedUsers: null
  newImported?: boolean
  officialPlaylistType: null
  opRecommend?: boolean
  ordered?: boolean
  picUrl?: string
  privacy?: number
  recommendInfo?: null
  remixVideo?: null
  sharedUsers?: null
  shareStatus?: null
  shareCount?: number
  specialType?: number
  status?: number
  subscribed?: boolean
  subscribedCount?: number
  subscribers?: []
  tags?: []
  titleImage?: number
  titleImageUrl?: string | null
  totalDuration?: number
  trackIds?: {
    alg: null
    at: number
    id: number
    rcmdReason: string
    t: number
    uid: number
    v: number
  }[]
  trackUpdateTime?: number
  tracks?: Track[]
  type?: number
  updateFrequency?: null
  updateTime?: number
  userId?: number
  videoIds: null //  TODO: unknown type
  videos?: null
}

declare interface RecentSongs {
  resourceId: string  
  playTime:number
  resouceType:string
  data:Track
  banned: boolean
  multiTerminalInfo:null
}

declare interface Track {
  id: number
  a: null
  al?: Album
  alia: string[]
  ar: Artist[]
  cd: string
  cf?: string
  copyright: number
  cp: number
  crbt: null
  djId: number
  dt: number
  fee: number
  ftype: number
  [key in ('h' | 'm' | 'l')]: {
    br: number
    fid: number
    size: number
    vd: number
  }
  mark: number
  mst: number
  mv: number
  name: string
  no: number
  noCopyrightRcmd: null
  originCoverType: number
  originSongSimpleData: null
  pop: number
  pst: number
  publishTime: number
  resourceState: boolean
  rt: string
  rtUrl: string | null
  rtUrls: (string | null)[]
  rtType: number
  rurl: null
  s_id: number
  single: number
  songJumpInfo: null
  st: number
  t: number
  tagPicList: null
  v: number
  version: number
  tns: (string | null)[]
  duration?: number
}
declare interface Artist {
  alias: unknown[]
  id: number
  name: string
  tns: string[]
  picUrl: string
  albumSize: number
  picId: string
  img1v1Url: string
  accountId: number
  img1v1: number
  identityIconUrl: string
  mvSize: number
  followed: boolean
  alg: string
  trans: unknown
  cover?: string
  musicSize?: number
  img1v1Id?: number
  topicPerson?: number
  briefDesc?: string
  publishTime?: number
  picId_str?: string
  img1v1Id_str?: string
  occupation?: string
}
declare interface Album {
  alias: unknown[]
  artist: Artist
  artists: Artist[]
  blurPicUrl: string
  briefDesc: string
  commentThreadId: string
  company: string
  companyId: string
  copyrightId: number
  description: string
  id: number
  info: {
    commentThread: unknown
  }
  mark: number
  name: string
  onSale: boolean
  paid: boolean
  pic_str: string
  pic: number
  picId_str: string
  picId: number
  picUrl: string
  publishTime: number
  size: number
  songs: Track[]
  status: number
  subType: string
  tags: string
  tns: unknown[]
  type: '专辑' | 'Single' | 'EP/Single' | 'EP' | '精选集'
}
declare interface User {
  defaultAvatar: boolean
  province: number
  authStatus: number
  followed: boolean
  avatarUrl: string
  accountStatus: number
  gender: number
  city: number
  birthday: number
  userId: number
  userType: number
  nickname: string
  signature: string
  description: string
  detailDescription: string
  avatarImgId: number
  backgroundImgId: number
  backgroundUrl: string
  authority: number
  mutual: boolean
  expertTags: null
  experts: null
  djStatus: number
  vipType: number
  remarkName: null
  authenticationTypes: number
  avatarDetail: null
  avatarImgIdStr: string
  backgroundImgIdStr: string
  anchor: boolean
  avatarImgId_str: string
}

declare interface Video {
  alg: null
  aliaName: string
  coverUrl: string
  creator: { userId: number; userName: string }[]
  userId: number
  userName: string
  durationms: number
  markTypes: null
  playTime: number
  title: string
  transName: string
  type: number
  vid: string
}

declare interface SimpleSong {
  simpleSong: Track
  album: string
  artist: string
  bitrate: number
  songId: number
  songName: string
  addTime: number
  cover: number
  coverId: string
  lyricId: string
  version: number
  fileSize: number
  fileName: string
}

/**
 * A keyboard shortcut item
 * [local, global]
 */
declare type KeyboardShortcutItem = [string[] | null, string[] | null]

declare interface KeyboardShortcuts {
  playPause: KeyboardShortcutItem
  next: KeyboardShortcutItem
  previous: KeyboardShortcutItem
  volumeUp: KeyboardShortcutItem
  volumeDown: KeyboardShortcutItem
  favorite: KeyboardShortcutItem
  switchVisibility: KeyboardShortcutItem
}

declare interface KeyboardShortcutSettings {
  globalEnabled: boolean
  localEnabled: boolean
  darwin: KeyboardShortcuts
  win32: KeyboardShortcuts
  linux: KeyboardShortcuts
}
