import { css, cx } from '@emotion/css'
import Image from './Image'
import { resizeImage } from '@/web/utils/common'
import useBreakpoint from '@/web/hooks/useBreakpoint'
import { useNavigate } from 'react-router-dom'
import { prefetchAlbum } from '@/web/api/hooks/useAlbum'
import { prefetchPlaylist } from '@/web/api/hooks/usePlaylist'
import { useCallback } from 'react'
const sizes = {
  small: {
    sm: 'sm',
    md: 'sm',
    lg: 'sm',
    xl: 'sm',
    '2xl': 'md',
  },
  large: {
    sm: 'md',
    md: 'md',
    lg: 'md',
    xl: 'md',
    '2xl': 'lg',
  },
} as const

const CoverWall = ({
  albums,
  playlists,
}: {
  albums?: { id: number; coverUrl: string; large: boolean }[]
  playlists?: { id: number; coverUrl: string; large: boolean }[]
}) => {
  const navigate = useNavigate()
  const breakpoint = useBreakpoint()

  return (
    <div
      className={cx(
        'grid w-full grid-flow-row-dense grid-cols-4 lg:grid-cols-8',
        css`
          gap: 13px;
        `
      )}
    >
      {albums?.map(album => (
        <Image
          src={resizeImage(album.coverUrl, sizes[album.large ? 'large' : 'small'][breakpoint])}
          key={album.id}
          className={cx(
            'aspect-square h-full w-full rounded-20 lg:rounded-24',
            album.large && 'col-span-2 row-span-2'
          )}
          onClick={() => navigate(`/album/${album.id}`)}
          onMouseOver={() => prefetchAlbum({ id: album.id })}
        />
      ))}
      {playlists?.map(playlist => (
        <Image
          src={resizeImage(
            playlist.coverUrl,
            sizes[playlist.large ? 'large' : 'small'][breakpoint]
          )}
          key={playlist.id}
          className={cx(
            'aspect-square h-full w-full rounded-20 lg:rounded-24',
            playlist.large && 'col-span-2 row-span-2'
          )}
          onClick={() => navigate(`/playlist/${playlist.id}`)}
          onMouseOver={() => {
            prefetchPlaylist({ id: playlist.id })
          }}
        />
      ))}
    </div>
  )
}

export default CoverWall
