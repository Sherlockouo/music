import { AppleMusicAlbum, AppleMusicArtist } from './AppleMusic'
import { CacheAPIs } from './CacheAPIs'
import { RepeatMode } from './playerDataTypes'

export const enum IpcChannels {
  ClearAPICache = 'ClearAPICache',
  Minimize = 'Minimize',
  LyricsWindowMinimize = 'LyricsWindowMinimize',
  MaximizeOrUnmaximize = 'MaximizeOrUnmaximize',
  MinimizeOrUnminimize = 'MinimizeOrUnminimize',
  Close = 'Close',
  Hide = 'Hide',
  LyricsWindowClose = 'LyricsWindowClose',
  IsMaximized = 'IsMaximized',
  FullscreenStateChange = 'FullscreenStateChange',
  GetApiCache = 'GetApiCache',
  DevDbExportJson = 'DevDbExportJson',
  CacheCoverColor = 'CacheCoverColor',
  SetTrayTooltip = 'SetTrayTooltip',
  SetDesktopLyric = 'SetDesktopLyric',
  CheckUpdate = 'CheckUpdate',
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
  VolumeUp = 'VolumeUp',
  VolumeDown = 'VolumeDown',
  SyncSettings = 'SyncSettings',
  SyncTheme = 'SyncTheme',
  SyncAccentColor = 'SyncAccentColor',
  GetAudioCacheSize = 'GetAudioCacheSize',
  ResetWindowSize = 'ResetWindowSize',
  GetAlbumFromAppleMusic = 'GetAlbumFromAppleMusic',
  GetArtistFromAppleMusic = 'GetArtistFromAppleMusic',
  Logout = 'Logout',
  GetPlatform = 'GetPlatform',
  BindKeyboardShortcuts = 'BindKeyboardShortcuts',
  setInAppShortcutsEnabled = 'setInAppShortcutsEnabled',
}

// ipcMain.on params
export interface IpcChannelsParams {
  [IpcChannels.ClearAPICache]: void
  [IpcChannels.Minimize]: void
  [IpcChannels.LyricsWindowMinimize]: void
  [IpcChannels.MaximizeOrUnmaximize]: void
  [IpcChannels.MinimizeOrUnminimize]: void
  [IpcChannels.Close]: void
  [IpcChannels.Hide]: void
  [IpcChannels.LyricsWindowClose]: void
  [IpcChannels.IsMaximized]: void
  [IpcChannels.FullscreenStateChange]: void
  [IpcChannels.CheckUpdate]: void
  [IpcChannels.PinDesktopLyric]: void
  [IpcChannels.SyncProgress]: {
    progress: number
  }
  [IpcChannels.LSyncProgress]: {
    progress: number
  }
  [IpcChannels.SetDesktopLyric]: {
    componentString: string
  }
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
    coverImg: string
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
  [IpcChannels.VolumeUp]: void
  [IpcChannels.VolumeDown]: void
  [IpcChannels.SyncSettings]: any
  [IpcChannels.SyncAccentColor]: {
    color: string
  }
  [IpcChannels.SyncTheme]: {
    theme: string
  }
  [IpcChannels.GetAudioCacheSize]: void
  [IpcChannels.ResetWindowSize]: void
  [IpcChannels.GetAlbumFromAppleMusic]: {
    id: number
    name: string
    artist: string
  }
  [IpcChannels.GetArtistFromAppleMusic]: { id: number; name: string }
  [IpcChannels.Logout]: void
  [IpcChannels.GetPlatform]: void
  [IpcChannels.BindKeyboardShortcuts]: { shortcuts: KeyboardShortcutSettings }
  [IpcChannels.setInAppShortcutsEnabled]: { enabled: boolean }
}

// ipcRenderer.on params
export interface IpcChannelsReturns {
  [IpcChannels.ClearAPICache]: void
  [IpcChannels.Minimize]: void
  [IpcChannels.LyricsWindowMinimize]: void
  [IpcChannels.MaximizeOrUnmaximize]: void
  [IpcChannels.SetDesktopLyric]: boolean
  [IpcChannels.PinDesktopLyric]: boolean
  [IpcChannels.MinimizeOrUnminimize]: void
  [IpcChannels.Close]: void
  [IpcChannels.Hide]: void
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
    coverImg: string
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
  [IpcChannels.CheckUpdate]: void
  [IpcChannels.VolumeUp]: void
  [IpcChannels.VolumeDown]: void
  [IpcChannels.SyncSettings]: any
  [IpcChannels.SyncAccentColor]: {
    color: string
  }
  [IpcChannels.SyncTheme]: {
    theme: string
  }
  [IpcChannels.GetAudioCacheSize]: void
  [IpcChannels.ResetWindowSize]: void
  [IpcChannels.GetAlbumFromAppleMusic]: AppleMusicAlbum | undefined
  [IpcChannels.GetArtistFromAppleMusic]: AppleMusicArtist | undefined
  [IpcChannels.Logout]: void
  [IpcChannels.GetPlatform]: 'win32' | 'darwin' | 'linux'
  [IpcChannels.BindKeyboardShortcuts]: void
  [IpcChannels.setInAppShortcutsEnabled]: void
}
