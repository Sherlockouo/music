import { resizeImage } from '@/web/utils/common'
import { cx, css } from '@emotion/css'
import useIsMobile from '@/web/hooks/useIsMobile'
import { useSnapshot } from 'valtio'
import uiStates from '@/web/states/uiStates'
import { AnimatePresence, motion, useAnimation } from 'framer-motion'
import { ease } from '@/web/utils/const'
import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

/* @deprecated for perfermance */
const BlurBackground = ({ className }: { className: string }) => {
  const isMobile = useIsMobile()
  const {blurBackgroundImage } = useSnapshot(uiStates)
  const location = useLocation()
  const animate = useAnimation()

  useEffect(() => {
    uiStates.blurBackgroundImage = null
  }, [location.pathname])

  const [isLoaded, setIsLoaded] = useState(false)
  useEffect(() => {
    setIsLoaded(false)
  }, [blurBackgroundImage])

  useEffect(() => {
    if (!isMobile && blurBackgroundImage && isLoaded) {
      animate.start({ opacity: 1 })
    } else {
      animate.start({ opacity: 0 })
    }
  }, [animate, blurBackgroundImage, isLoaded, isMobile])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={animate}
        exit={{ opacity: 0 }}
        transition={{ ease }}
      >
        <img
          onLoad={() => setIsLoaded(true)}
          className={className}
          src={resizeImage(
            blurBackgroundImage?.endsWith('gif') ? '' : blurBackgroundImage || '',
            'sm'
          )}
        />
      </motion.div>
    </AnimatePresence>
  )
}

export default BlurBackground
