import { css, cx } from '@emotion/css'
import { useEffect, useRef, useCallback } from 'react'
import { gsap } from '@/web/utils/gsapSetup'

/**
 * GSAP-powered hover light spot effect.
 *
 * Uses gsap.quickTo() for butter-smooth pointer tracking — internally
 * reuses a single tween and just updates the target value each frame,
 * which is significantly more performant than creating new tweens on
 * every mousemove event.
 */
const useHoverLightSpot = (
  config: { opacity: number; size: number } = { opacity: 0.8, size: 32 }
) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const spotRef = useRef<HTMLDivElement>(null)
  const buttonStyleRef = useRef<HTMLElement | null>(null)

  // quickTo instances — created once, reused on every mousemove
  const quickX = useRef<gsap.QuickToFunc | null>(null)
  const quickY = useRef<gsap.QuickToFunc | null>(null)
  const quickOpacity = useRef<gsap.QuickToFunc | null>(null)
  const quickBtnX = useRef<gsap.QuickToFunc | null>(null)
  const quickBtnY = useRef<gsap.QuickToFunc | null>(null)

  useEffect(() => {
    const button = buttonRef.current
    const spot = spotRef.current
    if (!button || !spot) return

    // Initialize quickTo instances — each creates one tween that
    // gets its end value updated on each call (no GC pressure)
    quickX.current = gsap.quickTo(spot, 'x', { duration: 0.25, ease: 'power3.out' })
    quickY.current = gsap.quickTo(spot, 'y', { duration: 0.25, ease: 'power3.out' })
    quickOpacity.current = gsap.quickTo(spot, 'opacity', { duration: 0.3, ease: 'power2.out' })
    quickBtnX.current = gsap.quickTo(button, 'x', { duration: 0.4, ease: 'power3.out' })
    quickBtnY.current = gsap.quickTo(button, 'y', { duration: 0.4, ease: 'power3.out' })

    const handleMouseOver = () => {
      quickOpacity.current?.(config.opacity)
    }

    const handleMouseOut = () => {
      quickOpacity.current?.(0)
      quickBtnX.current?.(0)
      quickBtnY.current?.(0)
    }

    const handleMouseMove = (event: MouseEvent) => {
      const rect = button.getBoundingClientRect()
      const spotSize = config.size / 2
      const cursorX = event.clientX - rect.x
      const cursorY = event.clientY - rect.y

      // Move light spot to cursor position (centered)
      quickX.current?.(cursorX - spotSize)
      quickY.current?.(cursorY - spotSize)

      // Subtle parallax displacement on the button itself
      quickBtnX.current?.((cursorX - rect.width / 2) / 8)
      quickBtnY.current?.((cursorY - rect.height / 2) / 8)
    }

    button.addEventListener('mouseover', handleMouseOver)
    button.addEventListener('mouseout', handleMouseOut)
    button.addEventListener('mousemove', handleMouseMove)

    return () => {
      button.removeEventListener('mouseover', handleMouseOver)
      button.removeEventListener('mouseout', handleMouseOut)
      button.removeEventListener('mousemove', handleMouseMove)
    }
  }, [config.opacity, config.size])

  const LightSpot = useCallback(
    () => (
      <div
        ref={spotRef}
        className={cx(
          'pointer-events-none absolute top-0 left-0 rounded-full',
          css`
            filter: blur(16px);
            background: rgb(255, 255, 255);
            opacity: 0;
          `
        )}
        style={{ height: config.size, width: config.size }}
      />
    ),
    [config.size]
  )

  return {
    buttonRef,
    LightSpot,
    // No longer using framer-motion style values — the button's transform
    // is now directly controlled by gsap.quickTo via the buttonRef
    buttonStyle: {},
  }
}

export default useHoverLightSpot
