import player from '@/web/states/player'
import { resizeImage } from '@/web/utils/common'
import { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSnapshot } from 'valtio'
import { subscribeKey } from 'valtio/utils'
import { gsap } from '@/web/utils/gsapSetup'

/**
 * NowPlaying cover with GSAP dual-image cross-fade.
 *
 * Two <img> elements alternate — the incoming image fades in slightly
 * before the outgoing image finishes fading out, eliminating the
 * "black frame" gap that a sequential fade-out→swap→fade-in produces.
 */
const Cover = () => {
  const { track } = useSnapshot(player)
  const navigate = useNavigate()

  const imgARef = useRef<HTMLImageElement>(null)
  const imgBRef = useRef<HTMLImageElement>(null)
  const activeSlot = useRef<'A' | 'B'>('A')
  const isFirstMount = useRef(true)

  useEffect(() => {
    // Set initial cover on first mount
    if (isFirstMount.current && track?.al?.picUrl) {
      isFirstMount.current = false
      const el = imgARef.current
      if (el) {
        el.src = track.al.picUrl
        gsap.set(el, { opacity: 1 })
      }
    }

    const unsubscribe = subscribeKey(player, 'track', () => {
      const coverUrl = player.track?.al?.picUrl
      if (!coverUrl) return

      const incomingRef = activeSlot.current === 'A' ? imgBRef : imgARef
      const outgoingRef = activeSlot.current === 'A' ? imgARef : imgBRef

      const incoming = incomingRef.current
      const outgoing = outgoingRef.current
      if (!incoming || !outgoing) return

      // Preload the new image before starting the cross-fade
      const preloader = new Image()
      preloader.onload = () => {
        incoming.src = coverUrl

        // Cross-fade timeline: overlap prevents black frame
        const tl = gsap.timeline({ overwrite: true })
        tl.to(outgoing, {
          opacity: 0,
          scale: 0.96,
          duration: 0.4,
          ease: 'power2.inOut',
        }, 0)
        tl.fromTo(incoming,
          { opacity: 0, scale: 1.03 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.45,
            ease: 'power2.out',
          },
          0.08 // slight delay — incoming starts before outgoing fully gone
        )

        activeSlot.current = activeSlot.current === 'A' ? 'B' : 'A'
      }
      preloader.src = coverUrl
    })

    return unsubscribe
  }, [])

  const handleClick = () => {
    const id = track?.al?.id
    if (id) navigate(`/album/${id}`)
  }

  return (
    <>
      <img
        ref={imgARef}
        className='absolute inset-0 w-full h-full object-cover cursor-pointer'
        onClick={handleClick}
        style={{ opacity: 0 }}
        alt=''
      />
      <img
        ref={imgBRef}
        className='absolute inset-0 w-full h-full object-cover cursor-pointer'
        onClick={handleClick}
        style={{ opacity: 0 }}
        alt=''
      />
    </>
  )
}

export default Cover
