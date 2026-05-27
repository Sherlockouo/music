import { motion } from 'framer-motion'
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/web/utils/gsapSetup'
import useIsMobile from '@/web/hooks/useIsMobile'
import scrollPositions from '@/web/states/scrollPositions'
import { useLayoutEffect } from 'react'

const PageTransition = ({
  children,
  disableEnterAnimation,
}: {
  children: React.ReactNode
  disableEnterAnimation?: boolean
}) => {
  const isMobile = useIsMobile()
  const containerRef = useRef<HTMLDivElement>(null)

  // To restore scroll position
  useLayoutEffect(() => {
    const main = document.querySelector('main')
    if (main) {
      main.scrollTop = scrollPositions.get(window.location.pathname) ?? 0
    }
  }, [])

  // GSAP-powered enter animation — smoother than framer-motion's tween engine
  // Uses y-offset for a "float up" feel + opacity fade
  useGSAP(
    () => {
      if (isMobile || disableEnterAnimation) return
      const el = containerRef.current
      if (!el) return

      gsap.fromTo(
        el,
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          ease: 'power2.out',
          clearProps: 'transform', // remove inline transform after animation
        }
      )
    },
    { scope: containerRef, dependencies: [] }
  )

  if (isMobile) {
    return <>{children}</>
  }

  return (
    // framer-motion's exit still handles the exit animation via AnimatePresence
    <motion.div
      ref={containerRef}
      initial={false} // GSAP handles enter, skip framer-motion initial
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
      style={{ opacity: disableEnterAnimation ? 1 : 0 }} // start invisible, GSAP fades in
    >
      {children}
    </motion.div>
  )
}

export default PageTransition
