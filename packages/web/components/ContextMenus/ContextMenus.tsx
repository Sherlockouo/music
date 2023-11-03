import AlbumContextMenu from './AlbumContextMenu'
import ArtistContextMenu from './ArtistContextMenu'
import TrackContextMenu from './TrackContextMenu'

const ContextMenus = () => {
  return (
    <>
      <div className='bg-white/10 dark:bg-black/10'>
        <TrackContextMenu />
        <AlbumContextMenu />
        <ArtistContextMenu />
      </div>
    </>
  )
}

export default ContextMenus
