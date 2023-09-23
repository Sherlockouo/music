import Header from './Header'
import Popular from './Popular'
import ArtistAlbum from './ArtistAlbums'
import FansAlsoLike from './FansAlsoLike'
import ArtistVideos from './ArtistVideos'
import { useState } from 'react'
import Icon from '@/web/components/Icon'
import ScrollPagination from '@/web/components/ScrollPage'
import ArtistSongs from './ArtistSongs'
import { useTranslation } from 'react-i18next'
const Artist = () => {
  const [showAllSongs, changeShowAllSongs] = useState(false)
  const { t, i18n } = useTranslation()
  const onClickShowAllSongs = () => {
    changeShowAllSongs(!showAllSongs)
  }
  return (
    <div>
      <Header />
      {/* Dividing line */}
      {showAllSongs && (
        <div className='mt-5 flex w-full items-center justify-center text-center'>
          <button
            onClick={() => {
              changeShowAllSongs(!showAllSongs)
            }}
            className='flex w-36 items-center justify-center gap-2 rounded-full bg-white/20 text-white'
          >
            {t`artist.all-songs`}
            <Icon name={showAllSongs ? 'eye' : 'eye-off'} className='h-6 w-6 text-white/80' />
          </button>
        </div>
      )}
      {!showAllSongs && (
        <div>
          <Popular showAllSongs={onClickShowAllSongs} />
          <ArtistAlbum />
          <ArtistVideos />
          <FansAlsoLike />
        </div>
      )}
      {showAllSongs && (
        <div className='text-white'>
          <ArtistSongs />
        </div>
      )}
      {/* Page padding */}
      <div className='h-16'></div>
    </div>
  )
}

export default Artist
