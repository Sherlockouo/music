import {
  FetchArtistAlbumsResponse,
  FetchArtistResponse,
  FetchSimilarArtistsResponse,
  FetchArtistSongsResponse,
} from './api/Artist'
import { FetchAlbumResponse } from './api/Album'
import {
  FetchListenedRecordsResponse,
  FetchUserAccountResponse,
  FetchUserAlbumsResponse,
  FetchUserArtistsResponse,
  FetchUserLikedTracksIDsResponse,
  FetchUserPlaylistsResponse,
} from './api/User'
import {
  FetchAudioSourceResponse,
  FetchLyricResponse,
  FetchTracksResponse,
  UnblockResponse,
} from './api/Track'
import { FetchPlaylistResponse, FetchRecommendedPlaylistsResponse } from './api/Playlists'
import { AppleMusicAlbum, AppleMusicArtist } from './AppleMusic'

export enum CacheAPIs {
  Album = 'album',
  Artist = 'artists',
  ArtistAlbum = 'artist/album',
  Likelist = 'likelist',
  Lyric = 'lyric',
  Personalized = 'personalized',
  Playlist = 'playlist/detail',
  RecommendResource = 'recommend/resource',
  SongUrl = 'song/url/v1',
  Track = 'song/detail',
  UserAccount = 'user/account',
  UserAlbums = 'album/sublist',
  UserArtists = 'artist/sublist',
  UserPlaylist = 'user/playlist',
  SimilarArtist = 'simi/artist',
  ArtistSongs = 'artist/songs',
  ListenedRecords = 'user/record',
  Unblock = 'unblock',

  // not netease api
  CoverColor = 'cover_color',
  AppleMusicAlbum = 'apple_music_album',
  AppleMusicArtist = 'apple_music_artist',
}

export interface CacheAPIsParams {
  [CacheAPIs.Album]: { id: number }
  [CacheAPIs.Artist]: { id: number }
  [CacheAPIs.ArtistAlbum]: { id: number }
  [CacheAPIs.Likelist]: void
  [CacheAPIs.Lyric]: { id: number }
  [CacheAPIs.Personalized]: void
  [CacheAPIs.Playlist]: { id: number }
  [CacheAPIs.RecommendResource]: void
  [CacheAPIs.SongUrl]: { id: string }
  [CacheAPIs.Track]: { ids: string }
  [CacheAPIs.UserAccount]: void
  [CacheAPIs.UserAlbums]: void
  [CacheAPIs.UserArtists]: void
  [CacheAPIs.UserPlaylist]: void
  [CacheAPIs.SimilarArtist]: { id: number }
  [CacheAPIs.ArtistSongs]: { id: number; order: string; offset: number; limit: number }
  [CacheAPIs.ListenedRecords]: { id: number; type: number }
  [CacheAPIs.Unblock]: { track_id: number }

  [CacheAPIs.CoverColor]: { id: number }
  [CacheAPIs.AppleMusicAlbum]: { id: number }
  [CacheAPIs.AppleMusicArtist]: { id: number }
}

export interface CacheAPIsResponse {
  [CacheAPIs.Album]: FetchAlbumResponse
  [CacheAPIs.Artist]: FetchArtistResponse
  [CacheAPIs.ArtistAlbum]: FetchArtistAlbumsResponse
  [CacheAPIs.Likelist]: FetchUserLikedTracksIDsResponse
  [CacheAPIs.Lyric]: FetchLyricResponse
  [CacheAPIs.Personalized]: FetchRecommendedPlaylistsResponse
  [CacheAPIs.Playlist]: FetchPlaylistResponse
  [CacheAPIs.RecommendResource]: FetchRecommendedPlaylistsResponse
  [CacheAPIs.SongUrl]: FetchAudioSourceResponse
  [CacheAPIs.Track]: FetchTracksResponse
  [CacheAPIs.UserAccount]: FetchUserAccountResponse
  [CacheAPIs.UserAlbums]: FetchUserAlbumsResponse
  [CacheAPIs.UserArtists]: FetchUserArtistsResponse
  [CacheAPIs.UserPlaylist]: FetchUserPlaylistsResponse
  [CacheAPIs.SimilarArtist]: FetchSimilarArtistsResponse
  [CacheAPIs.ArtistSongs]: FetchArtistSongsResponse
  [CacheAPIs.ListenedRecords]: FetchListenedRecordsResponse
  [CacheAPIs.Unblock]: UnblockResponse

  [CacheAPIs.CoverColor]: string | undefined
  [CacheAPIs.AppleMusicAlbum]: AppleMusicAlbum | 'no'
  [CacheAPIs.AppleMusicArtist]: AppleMusicArtist | 'no'
}
