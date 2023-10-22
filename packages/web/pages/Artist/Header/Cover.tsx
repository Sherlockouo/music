import { resizeImage } from '@/web/utils/common'
import Image from '@/web/components/Image'
import { cx, css } from '@emotion/css'
import useAppleMusicArtist from '@/web/api/hooks/useAppleMusicArtist'
import { useEffect, useState } from 'react'
import uiStates from '@/web/states/uiStates'
import VideoCover from '@/web/components/VideoCover'
import { FetchAppleMusicArtistResponse } from '@/shared/api/AppleMusic'

const Cover = ({ artist }: { artist?: Artist }) => {
  const [video, setVideo] = useState('')
  const [cover, setCover] = useState(artist?.img1v1Url || '')
  const [isLoadingArtistFromAppleBool, setIsLoadingArtistFromApple] = useState(false)

  ;async () => {
    const { data: artistFromApple, isLoading: isLoadingArtistFromApple } = useAppleMusicArtist(
      artist?.id || 0
    )
    if (artistFromApple != null && isLoadingArtistFromApple != null) {
      setVideo(artistFromApple?.editorialVideo)
      setCover(isLoadingArtistFromApple ? '' : artistFromApple?.artwork || artist?.img1v1Url || '')
      setIsLoadingArtistFromApple(isLoadingArtistFromApple)
    }
  }

  useEffect(() => {
    if (cover) uiStates.blurBackgroundImage = cover
  }, [cover])

  return (
    <>
      <div
        className={cx(
          'relative overflow-hidden lg:rounded-24',
          css`
            grid-area: cover;
          `
        )}
      >
        <Image
          className={cx(
            'aspect-square h-full w-full  bg-black/10 dark:bg-white/10 lg:z-10',
            video ? 'opacity-0' : 'opacity-100'
          )}
          src={resizeImage(isLoadingArtistFromAppleBool ? '' : cover, 'lg')}
        />

        {video && <VideoCover source={video} />}
      </div>
    </>
  )
}

export default Cover
