export enum MVApiNames {
  FetchMV = 'fetchMV',
  FetchMVUrl = 'fetchMVUrl',
  FetchVideoUrl = 'fetchVideoUrl',
  FetchVideo = 'fetchVideo',
}

// MV详情
export interface FetchMVParams {
  mvid: number
}
export interface FetchMVResponse {
  code: number
  loadingPic: string
  bufferPic: string
  loadingPicFS: string
  bufferPicFS: string
  data: {
    artistId: number
    artistName: string
    artists: Artist[]
    briefDesc: string
    brs: {
      br: number
      point: number
      size: number
    }[]
    commentCount: number
    commentThreadId: string
    cover: string
    coverId: number
    coverId_str: string
    desc: string
    duration: number
    id: number
    nType: number
    name: string
    playCount: number
    price: null | unknown
    publishTime: string
    shareCount: number
    subCount: number
    videoGroup: unknown[]
  }
  mp: {
    cp: number
    dl: number
    fee: number
    id: number
    msg: null | string
    mvFee: number
    normal: boolean
    payed: number
    pl: number
    sid: number
    st: number
    unauthorized: boolean
  }
}

// MV地址
export interface FetchMVUrlParams {
  id: number
  r?: number
}
export interface FetchMVUrlResponse {
  code: number
  data: {
    code: number
    expi: number
    fee: number
    id: number
    md5: string
    msg: string
    mvFee: number
    promotionVo: null | unknown
    r: number
    size: number
    st: number
    url: string
  }
}

export interface FetchVideoParams {
  id: string
}

export interface FetchVideoURLResponse {
  urls: VideoUrl[]
  code: number
}

interface VideoUrl {
  id: string
  url: string
  size: number
  validityTime: number
  needPay: boolean
  payInfo: null | any
  r: number
}

interface Creator {
  authStatus: number
  followed: boolean
  accountStatus: number
  userId: number
  userType: number
  nickname: string
  avatarUrl: string
  expertTags: null
  experts: {
    [key: string]: string
  }
  avatarDetail: {
    userType: number
    identityLevel: number
    identityIconUrl: string
  }
}

interface Resolution {
  size: number
  resolution: number
}

interface VideoGroup {
  id: number
  name: string
  alg: null
}

export interface FetchVideoResponse {
  code: number
  data: {
    vid: string
    creator: Creator
    coverUrl: string
    title: string
    description: string
    durationms: number
    threadId: string
    playTime: number
    praisedCount: number
    commentCount: number
    shareCount: number
    subscribeCount: number
    publishTime: number
    avatarUrl: string
    width: number
    height: number
    resolutions: Resolution[]
    videoGroup: VideoGroup[]
    hasRelatedGameAd: boolean
    advertisement: boolean
    authType: number
    markTypes: number[]
    videoUserLiveInfo: null
  }
  message: string
}
