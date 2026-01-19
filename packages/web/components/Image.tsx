import { css, cx } from '@emotion/css'
import { AnimatePresence, motion, useAnimation } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { ease } from '@/web/utils/const'
import useIsMobile from '@/web/hooks/useIsMobile'

// 全局图片预加载缓存
const globalImageCache = new Set<string>()
const loadingImages = new Map<string, Promise<void>>()
const preloadImageGlobal = (src: string) => {
  if (!src || globalImageCache.has(src)) return

  // 如果正在加载，返回现有的 Promise
  if (loadingImages.has(src)) {
    return
  }

  // 创建加载 Promise
  const loadPromise = new Promise<void>((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      globalImageCache.add(src)
      loadingImages.delete(src)
      resolve()
    }
    img.onerror = () => {
      loadingImages.delete(src)
      reject()
    }
    img.src = src
  })

  loadingImages.set(src, loadPromise)
}

type Props = {
  src?: string
  srcSet?: string
  sizes?: string
  className?: string
  lazyLoad?: boolean
  placeholder?: 'artist' | 'album' | 'playlist' | 'podcast' | 'blank' | false
  onClick?: (e: React.MouseEvent<HTMLImageElement>) => void
  onMouseOver?: (e: React.MouseEvent<HTMLImageElement>) => void
  animation?: boolean
  fetchPriority?: 'high' | 'auto' | 'low'
}

const ImageDesktop = ({
  src,
  srcSet,
  className,
  lazyLoad = true,
  sizes,
  placeholder = 'blank',
  onClick,
  onMouseOver,
  animation = true,
  fetchPriority = 'auto',
}: Props) => {
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [inView, setInView] = useState(!lazyLoad)
  const animate = useAnimation()
  const placeholderAnimate = useAnimation()
  const isMobile = useIsMobile()
  const isAnimate = animation && !isMobile
  const imgRef = useRef<HTMLImageElement>(null)

  // Intersection Observer 懒加载
  useEffect(() => {
    if (!lazyLoad || !src) {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '50px', // 提前 50px 开始加载
      }
    )

    const currentRef = imgRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => observer.disconnect()
  }, [lazyLoad, src])

  // 重置状态当 src 改变时
  useEffect(() => {
    setError(false)
    setLoaded(false)
  }, [src])

  // 预加载图片
  useEffect(() => {
    if (src && inView) preloadImageGlobal(src)
  }, [src, inView])

  const onLoad = () => {
    setLoaded(true)
    // 快速显示图片，减少动画延迟
    if (isAnimate) {
      animate.start({ opacity: 1 })
      placeholderAnimate.start({ opacity: 0 })
    }
  }

  const onError = () => {
    setError(true)
    setLoaded(true)
  }

  const transition = { duration: 0.3, ease } // 减少动画时间从 0.6 到 0.3 秒

  const motionProps = isAnimate && !loaded
    ? {
        animate,
        initial: { opacity: 0 },
        transition,
      }
    : loaded
    ? {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
      }
    : {}

  const placeholderMotionProps = isAnimate
    ? {
        animate: placeholderAnimate,
        initial: { opacity: 1 },
        transition,
      }
    : {}

  return (
    <div
      onClick={onClick}
      onMouseOver={onMouseOver}
      className={cx(
        'overflow-hidden',
        className,
        className?.includes('absolute') === false && 'relative'
      )}
    >
      {src && inView && (
        <motion.img
          ref={imgRef}
          className='absolute inset-0 h-full w-full'
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          decoding='async'
          fetchPriority={fetchPriority}
          onError={onError}
          onLoad={onLoad}
          {...motionProps}
        />
      )}

      {placeholder && !loaded && (
        <motion.div
          {...placeholderMotionProps}
          className='absolute inset-0 h-full w-full bg-black/10 dark:bg-white/10'
        ></motion.div>
      )}
    </div>
  )
}

const ImageMobile = (props: Props) => {
  const { src, className, srcSet, sizes, lazyLoad, onClick, onMouseOver, fetchPriority = 'auto' } = props
  return (
    <div
      onClick={onClick}
      onMouseOver={onMouseOver}
      className={cx(
        'overflow-hidden',
        className,
        className?.includes('absolute') === false && 'relative'
      )}
    >
      {src && (
        <img
          className='absolute inset-0 h-full w-full'
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          decoding='async'
          loading={lazyLoad ? 'lazy' : undefined}
          fetchPriority={fetchPriority}
        />
      )}
    </div>
  )
}

const Image = (props: Props) => {
  const isMobile = useIsMobile()
  return isMobile ? <ImageMobile {...props} /> : <ImageDesktop {...props} />
}

export default Image
