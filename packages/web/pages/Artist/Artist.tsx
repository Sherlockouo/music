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
      {showAllSongs ? (
        <div className='mt-5 flex w-full items-center justify-center text-center'>
          <button
            onClick={() => {
              changeShowAllSongs(!showAllSongs)
            }}
            className='bg-dark/20 flex w-36 items-center justify-center gap-2 rounded-full dark:bg-white/20'
          >
            {t`artist.synthesis`}
            <Icon name={showAllSongs ? 'eye' : 'eye-off'} className='h-6 w-6' />
          </button>
        </div>
      ) : (
        <div className='mb-7.5 mt-10 h-px w-full bg-black/20 dark:bg-white/20'></div>
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
        <div>
          <ArtistSongs />
        </div>
      )}
      {/* Page padding */}
      <div className='h-16'></div>
    </div>
  )
}

export default Artist
