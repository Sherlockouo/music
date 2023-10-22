import { cx, css } from '@emotion/css'
import { breakpoint as bp } from '@/web/utils/const'
import ArtistInfo from './ArtistInfo'
import Actions from './Actions'
import LatestRelease from './LatestRelease'
import Cover from './Cover'
import useArtist from '@/web/api/hooks/useArtist'
import { useParams } from 'react-router-dom'

const Header = () => {
  const params = useParams()
  const { data: artistRaw, isLoading } = useArtist({
    id: Number(params.id) || 0,
  })
  const artist = artistRaw?.artist

  return (
    // <div
    //   className={cx(
    //     'lg:grid lg:gap-10',
    //     css`
    //       grid-template-columns: auto 558px;
    //       grid-template-areas:
    //         'info cover'
    //         'info cover';
    //     `
    //   )}
    // >
    //   <Cover artist={artist} />

    //   <div
    //     className={cx(
    //       'lg:flex lg:flex-col lg:justify-between',
    //       css`
    //         grid-area: info;
    //       `
    //     )}
    //   >
    //     <div
    //       className={cx(
    //         'mx-2.5 rounded-48 bg-black/10 dark:bg-white/10 p-8 backdrop-blur-3xl lg:mx-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none',
    //         css`
    //           margin-top: -60px;
    //           ${bp.lg} {
    //             margin-top: 0px;
    //           }
    //           padding: 0.8rem;
    //         `
    //       )}
    //     >
    //       <ArtistInfo isLoading={isLoading} artist={artist} />
    //       <Actions isLoading={isLoading} />
    //     </div>

    //     <LatestRelease />
    //   </div>
    // </div>
    <div className={cx('flex w-full flex-col')}>
      <div className={cx('grid grid-cols-6 gap-4')}>
        <div className={cx('col-span-4')}>
          <ArtistInfo isLoading={isLoading} artist={artist} />
        </div>
        <div className={cx('col-span-2')}>
          <Cover artist={artist} />
        </div>
      </div>
      <Actions isLoading={isLoading} />
      <LatestRelease />
    </div>
  )
}

export default Header
