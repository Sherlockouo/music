import { AppleMusicAlbum, AppleMusicArtist } from './AppleMusic'
import { CacheAPIs } from './CacheAPIs'
import { RepeatMode } from './playerDataTypes'

export const enum IpcChannels {
  ClearAPICache = 'ClearAPICache',
  Minimize = 'Minimize',
  MaximizeOrUnmaximize = 'MaximizeOrUnmaximize',
  Close = 'Close',
  IsMaximized = 'IsMaximized',
  FullscreenStateChange = 'FullscreenStateChange',
  GetApiCache = 'GetApiCache',
  DevDbExportJson = 'DevDbExportJson',
  CacheCoverColor = 'CacheCoverColor',
  SetTrayTooltip = 'SetTrayTooltip',
  SetDesktopLyric = 'SetDesktopLyric',
  PinDesktopLyric = 'PinDesktopLyric',
  // 准备三个播放相关channel, 为 mpris 预留接口
  Play = 'Play',
  Pause = 'Pause',
  PlayOrPause = 'PlayOrPause',
  SyncProgress = 'SyncProgress',
  Next = 'Next',
  Previous = 'Previous',
  LPlay = 'LPlay',
  LPause = 'LPause',
  LPlayOrPause = 'LPlayOrPause',
  LSyncProgress = 'LSyncProgress',
  LNext = 'LNext',
  LPrevious = 'LPrevious',
  Like = 'Like',
  Repeat = 'Repeat',
  SyncSettings = 'SyncSettings',
  GetAudioCacheSize = 'GetAudioCacheSize',
  ResetWindowSize = 'ResetWindowSize',
  GetAlbumFromAppleMusic = 'GetAlbumFromAppleMusic',
  GetArtistFromAppleMusic = 'GetArtistFromAppleMusic',
  Logout = 'Logout',
}

// ipcMain.on params
export interface IpcChannelsParams {
  [IpcChannels.ClearAPICache]: void
  [IpcChannels.Minimize]: void
  [IpcChannels.MaximizeOrUnmaximize]: void
  [IpcChannels.Close]: void
  [IpcChannels.IsMaximized]: void
  [IpcChannels.FullscreenStateChange]: void
  [IpcChannels.PinDesktopLyric]: void
  [IpcChannels.SyncProgress]: {
    progress: number
  }
  [IpcChannels.LSyncProgress]: {
    progress: number
  }
  [IpcChannels.SetDesktopLyric]: {
    componentString: string
  },
  [IpcChannels.GetApiCache]: {
    api: CacheAPIs
    query?: any
  }
  [IpcChannels.DevDbExportJson]: void
  [IpcChannels.CacheCoverColor]: {
    id: number
    color: string
  }
  [IpcChannels.SetTrayTooltip]: {
    text: string
  }
  [IpcChannels.Play]: {
    trackID: number
  }
  [IpcChannels.Pause]: void
  [IpcChannels.PlayOrPause]: void
  [IpcChannels.Next]: {
    trackID: number
  }
  [IpcChannels.Previous]: {
    trackID: number
  }
  [IpcChannels.LPlay]: {
    track: Track
  }
  [IpcChannels.LPause]: void
  [IpcChannels.LPlayOrPause]: void
  [IpcChannels.LNext]: void
  [IpcChannels.LPrevious]: void
  [IpcChannels.Like]: {
    isLiked: boolean
  }
  [IpcChannels.Repeat]: {
    mode: RepeatMode
  }
  [IpcChannels.SyncSettings]: any
  [IpcChannels.GetAudioCacheSize]: void
  [IpcChannels.ResetWindowSize]: void
  [IpcChannels.GetAlbumFromAppleMusic]: {
    id: number
    name: string
    artist: string
  }
  [IpcChannels.GetArtistFromAppleMusic]: { id: number; name: string }
  [IpcChannels.Logout]: void
}

// ipcRenderer.on params
export interface IpcChannelsReturns {
  [IpcChannels.ClearAPICache]: void
  [IpcChannels.Minimize]: void
  [IpcChannels.MaximizeOrUnmaximize]: void
  [IpcChannels.SetDesktopLyric]: boolean
  [IpcChannels.PinDesktopLyric]: boolean
  [IpcChannels.Close]: void
  [IpcChannels.IsMaximized]: boolean
  [IpcChannels.FullscreenStateChange]: boolean
  [IpcChannels.SyncProgress]: {
    progress: number
  }
  [IpcChannels.LSyncProgress]: {
    progress: number
  }
  [IpcChannels.GetApiCache]: any
  [IpcChannels.DevDbExportJson]: void
  [IpcChannels.CacheCoverColor]: void
  [IpcChannels.SetTrayTooltip]: {
    text: string
  }
  [IpcChannels.Play]: {
    trackID: number
  }
  [IpcChannels.Pause]: void
  [IpcChannels.PlayOrPause]: void
  [IpcChannels.Next]: {
    trackID: number
  }
  [IpcChannels.Previous]: {
    trackID: number
  }

  [IpcChannels.Like]: void
  [IpcChannels.Repeat]: RepeatMode
  [IpcChannels.GetAudioCacheSize]: void
  [IpcChannels.GetAlbumFromAppleMusic]: AppleMusicAlbum | undefined
  [IpcChannels.GetArtistFromAppleMusic]: AppleMusicArtist | undefined
  [IpcChannels.Logout]: void
}
