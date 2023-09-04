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
  return (
    <div>
      <Header />
      {/* Dividing line */}
      <div className='w-full flex justify-center mt-5 text-center items-center'>
        <button
          onClick={() => {
            changeShowAllSongs(!showAllSongs)
          }}
          className='flex gap-2 items-center justify-center rounded-full bg-white/20 text-white w-36'
        >
          {
            t`artist.all-songs`
          }
          <Icon name={showAllSongs ? 'eye' : 'eye-off'} className='h-6 w-6 text-white/80' />
        </button>
      </div>
      {
        !showAllSongs && <div>
          <Popular />
          <ArtistAlbum />
          <ArtistVideos />
          <FansAlsoLike />
        </div>
      }
      {
        showAllSongs && <div className='text-white'>
          <ScrollPagination >
            <ArtistSongs/>
          </ScrollPagination>
          </div>
      }
      {/* Page padding */}
      <div className='h-16'></div>
    </div>
  )
}

export default Artist
