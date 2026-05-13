import { memo, useEffect, useRef } from 'react'
import { useSnapshot } from 'valtio'
import player from '@/web/states/player'
import settings from '@/web/states/settings'
import { resizeImage } from '@/web/utils/common'
import { subscribeAudioVolume } from '@/web/utils/audioVolume'

/**
 * Audio-reactive ambient background.
 *
 * One blurred cover image, dimmed by an overlay. A single RAF loop reads
 * loudness from the shared analyser and writes `--vol` (0..1) to the
 * wrapper element; CSS turns that into brightness + saturation pulse on
 * the cover and opacity pulse on the overlay. No React re-renders happen
 * on the per-frame path.
 */
const BreathingBackground = memo(() => {
  const { track } = useSnapshot(player)
  const { enableBreathingEffect, theme } = useSnapshot(settings)
  const isDark = theme === 'dark'

  const coverUrl = track?.al?.picUrl || ''
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enableBreathingEffect) return
    const root = rootRef.current
    if (!root) return

    return subscribeAudioVolume(vol => {
      root.style.setProperty('--vol', vol.toFixed(3))
    })
  }, [enableBreathingEffect])

  if (!enableBreathingEffect) return null

  return (
    <div
      ref={rootRef}
      className='breathing-bg pointer-events-none absolute inset-0 z-0'
      style={
        {
          ['--vol' as any]: 0,
          ['--cover-brightness' as any]: isDark ? 0.35 : 0.75,
          ['--overlay-color' as any]: isDark
            ? 'rgba(0,0,0,0.45)'
            : 'rgba(255,255,255,0.5)',
        } as React.CSSProperties
      }
    >
      {coverUrl && (
        <div
          className='breathing-bg__cover absolute inset-0'
          style={{
            backgroundImage: `url(${resizeImage(coverUrl, 'xs')})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transition: 'background-image 2s ease-in-out',
          }}
        />
      )}

      <div className='breathing-bg__overlay absolute inset-0' />
    </div>
  )
})
BreathingBackground.displayName = 'BreathingBackground'

export default BreathingBackground
