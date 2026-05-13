import { multiMatchSearch, cloudSearch } from '@/web/api/search'
import player from '@/web/states/player'
import { resizeImage } from '@/web/utils/common'
import { SearchTypes, SearchApiNames } from '@/shared/api/Search'
import dayjs from 'dayjs'
import { useMemo, useCallback } from 'react'
import toast from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import Image from '@/web/components/Image'
import { cx } from '@emotion/css'
import CoverRowVirtual from '@/web/components/CoverRowVirtual'
import { useTranslation } from 'react-i18next'
import Loading from '@/web/components/Animation/Loading'

const Artists = ({ artists }: { artists: Artist[] }) => {
  const navigate = useNavigate()
  return (
    <>
      {artists.map(artist => (
        <div
          onClick={() => navigate(`/artist/${artist.id}`)}
          key={artist.id}
          className='flex cursor-pointer items-center py-2.5'
        >
          <img
            src={resizeImage(artist.img1v1Url, 'xs')}
            className='mr-4 h-14 w-14 rounded-full'
          />
          <div>
            <div className='text-lg font-semibold'>{artist.name}</div>
            <div className='mt-0.5 text-sm font-semibold opacity-60'>
              {(artist as any).occupation || 'Artist'}
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

const Albums = ({ albums }: { albums: Album[] }) => {
  const navigate = useNavigate()
  return (
    <>
      {albums.map(album => (
        <div
          onClick={() => navigate(`/album/${album.id}`)}
          key={album.id}
          className='flex cursor-pointer items-center py-2.5'
        >
          <img src={resizeImage(album.picUrl, 'xs')} className='mr-4 h-14 w-14 rounded-lg' />
          <div>
            <div className='text-lg font-semibold'>{album.name}</div>
            <div className='mt-0.5 text-sm font-semibold opacity-60'>
              {album?.artist?.name} · {dayjs(album.publishTime).year()}
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

const TrackItem = ({
  track,
  isPlaying,
  onPlay,
}: {
  track?: Track
  isPlaying?: boolean
  onPlay: (id: number) => void
}) => {
  return (
    <div
      className='flex cursor-pointer items-center justify-between'
      onClick={e => {
        if (e.detail === 2 && track?.id) onPlay(track.id)
      }}
    >
      <Image
        className='mr-4 aspect-square h-14 w-14 flex-shrink-0 rounded-12'
        src={resizeImage(track?.al?.picUrl || '', 'sm')}
        animation={false}
        placeholder={false}
      />
      <div className='mr-3 flex-grow'>
        <div
          className={cx(
            'line-clamp-1 text-16 font-medium',
            isPlaying ? 'text-brand-700' : 'text-neutral-700 dark:text-neutral-200'
          )}
        >
          {track?.name}
        </div>
        <div className='line-clamp-1 mt-1 text-14 font-bold text-neutral-200'>
          {track?.ar?.map(a => a.name).join(', ')}
        </div>
      </div>
    </div>
  )
}

const Search = () => {
  const { keywords = '' } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()

  // 最佳匹配
  const { data: bestMatchRaw } = useQuery(
    [SearchApiNames.MultiMatchSearch, keywords],
    () => multiMatchSearch({ keywords }),
    { enabled: !!keywords, refetchOnWindowFocus: false }
  )

  // 云搜索 - 歌曲
  const { data: trackResult, isLoading: isLoadingTracks } = useQuery(
    [SearchApiNames.CloudSearch, keywords, 'tracks'],
    () =>
      cloudSearch({
        keywords,
        limit: 100,
        offset: 0,
        type: 'Single' as keyof typeof SearchTypes,
      }),
    { enabled: !!keywords, refetchOnWindowFocus: false }
  )

  // 云搜索 - 歌单
  const { data: playlistResult, isLoading: isLoadingPlaylists } = useQuery(
    [SearchApiNames.CloudSearch, keywords, 'playlists'],
    () =>
      cloudSearch({
        keywords,
        limit: 50,
        offset: 0,
        type: 'Playlist' as keyof typeof SearchTypes,
      }),
    { enabled: !!keywords, refetchOnWindowFocus: false }
  )

  const bestMatch = useMemo(() => {
    if (!bestMatchRaw?.result) return []
    return bestMatchRaw.result.orders
      .filter(order => ['album', 'artist'].includes(order))
      .map(order => bestMatchRaw.result[order]?.[0])
      .filter(Boolean)
      .slice(0, 2)
  }, [bestMatchRaw?.result])

  const tracks = trackResult?.result?.songs
  const playlists = playlistResult?.result?.playlists

  // 提取搜索结果中的艺人和专辑（从歌曲结果中去重）
  const { artists, albums } = useMemo(() => {
    if (!tracks?.length) return { artists: [], albums: [] }

    const artistMap = new Map<number, Artist>()
    const albumMap = new Map<number, Album>()

    tracks.forEach(track => {
      track.ar?.forEach(ar => {
        if (ar.id && !artistMap.has(ar.id)) {
          artistMap.set(ar.id, ar as Artist)
        }
      })
      if (track.al?.id && !albumMap.has(track.al.id)) {
        albumMap.set(track.al.id, track.al as Album)
      }
    })

    return {
      artists: Array.from(artistMap.values()).slice(0, 5),
      albums: Array.from(albumMap.values()).slice(0, 5),
    }
  }, [tracks])

  const handlePlayTracks = useCallback(
    (trackID: number | null = null) => {
      if (!tracks?.length) {
        toast(t`common.no-playable-tracks` || '无法播放')
        return
      }
      player.playAList(
        tracks.map(t => t.id),
        trackID
      )
    },
    [tracks]
  )

  const navigateBestMatch = useCallback(
    (match: Artist | Album) => {
      if ((match as Artist).albumSize !== undefined) {
        navigate(`/artist/${match.id}`)
      } else if ((match as Album).artist !== undefined) {
        navigate(`/album/${match.id}`)
      }
    },
    [navigate]
  )

  const isLoading = isLoadingTracks && isLoadingPlaylists

  return (
    <div>
      <div className='mt-6 mb-8 text-4xl font-semibold'>
        <span>{t`search.search` || '搜索'}</span> &quot;{keywords}&quot;
      </div>

      {isLoading && (
        <div className='flex h-40 items-center justify-center'>
          <Loading />
        </div>
      )}

      {/* 最佳匹配 */}
      {bestMatch.length > 0 && (
        <div className='mb-6'>
          <div className='mb-2 text-14 font-bold uppercase'>
            {t`search.best-match` || '最佳匹配'}
          </div>
          <div className='grid grid-cols-2'>
            {bestMatch.map((match: any) => (
              <div
                onClick={() => navigateBestMatch(match)}
                key={`${match.id}${match.picUrl}`}
                className='btn-hover-animation flex cursor-pointer items-center py-3 after:rounded-xl after:bg-gray-100 dark:after:bg-white/10'
              >
                <img
                  src={resizeImage(match.picUrl, 'xs')}
                  className={cx(
                    'mr-6 h-20 w-20',
                    match.occupation === '歌手' ? 'rounded-full' : 'rounded-xl'
                  )}
                />
                <div>
                  <div className='text-xl font-semibold'>{match.name}</div>
                  <div className='mt-0.5 font-medium opacity-60'>
                    {match.occupation === '歌手'
                      ? t`search.artist` || '艺人'
                      : `${match.artist?.name} · ${dayjs(match.publishTime).year()}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 搜索结果 */}
      <div className='grid grid-cols-2 gap-6'>
        {artists.length > 0 && (
          <div>
            <div className='mb-2 text-14 font-bold uppercase'>
              {t`search.artist` || '艺人'}
            </div>
            <Artists artists={artists} />
          </div>
        )}
        {albums.length > 0 && (
          <div>
            <div className='mb-2 text-14 font-bold uppercase'>
              {t`search.album` || '专辑'}
            </div>
            <Albums albums={albums} />
          </div>
        )}

        {tracks && tracks.length > 0 && (
          <div className='col-span-2'>
            <div className='mb-2 text-14 font-bold uppercase'>
              {t`search.song` || '歌曲'}
            </div>
            <div className='mt-4 grid grid-cols-3 gap-5 gap-y-6 overflow-hidden pb-12'>
              {tracks.map(track => (
                <TrackItem key={track.id} track={track} onPlay={handlePlayTracks} />
              ))}
            </div>
          </div>
        )}

        {playlists && playlists.length > 0 && (
          <div className='col-span-2'>
            <div className='mb-2 text-14 font-bold uppercase'>
              {t`search.playlist` || '歌单'}
            </div>
            <CoverRowVirtual playlists={playlists} />
          </div>
        )}
      </div>
    </div>
  )
}

export default Search
