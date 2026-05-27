import { resizeImage } from '@/web/utils/common'
import Image from '@/web/components/Image'
import { memo, useEffect, useRef, useState } from 'react'
import uiStates from '@/web/states/uiStates'
import VideoCover from '@/web/components/VideoCover'
import ArtworkViewer from '../ArtworkViewer'
import useSettings from '@/web/hooks/useSettings'
import { gsap } from '@/web/utils/gsapSetup'
import { useGSAP } from '@gsap/react'

const Cover = memo(({ cover, videoCover }: { cover?: string; videoCover?: string }) => {
  useEffect(() => {
    if (cover) uiStates.blurBackgroundImage = cover
  }, [cover])

  const [isOpenArtworkViewer, setIsOpenArtworkViewer] = useState(false)
  const coverRef = useRef<HTMLDivElement>(null)

  // GSAP entrance animation — subtle scale + fade for a polished reveal
  useGSAP(
    () => {
      if (!coverRef.current || !cover) return
      gsap.fromTo(
        coverRef.current,
        { opacity: 0, scale: 0.92, y: 10 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
          clearProps: 'transform',
        }
      )
    },
    { scope: coverRef, dependencies: [cover] }
  )

  return (
    <>
      <div
        ref={coverRef}
        onClick={() => {
          if (cover) setIsOpenArtworkViewer(true)
        }}
        className='relative aspect-square w-full overflow-hidden rounded-24'
        style={{ opacity: 0 }} // start hidden, GSAP reveals
      >
        <Image className='absolute inset-0' src={resizeImage(cover || '', 'lg')} />

        {videoCover && <VideoCover source={videoCover} />}
      </div>

      <ArtworkViewer
        type='album'
        artwork={cover || ''}
        isOpen={isOpenArtworkViewer}
        onClose={() => setIsOpenArtworkViewer(false)}
      />
    </>
  )
})
Cover.displayName = 'Cover'

export default Cover
