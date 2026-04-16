import { memo, useEffect, useRef, useState } from 'react'
import { useSnapshot } from 'valtio'
import player from '@/web/states/player'
import settings from '@/web/states/settings'
import useCoverColors from '@/web/hooks/useCoverColors'
import { resizeImage } from '@/web/utils/common'

interface ColorBlob {
  id: number
  x: number
  y: number
  size: number
  color: string
  opacity: number
}

let blobId = 0

/**
 * 全局呼吸灯背景（性能优化版）
 * - 使用 CSS will-change + transform: translateZ(0) 提升到 GPU 层
 * - 封面模糊用小图 + 更低 blur 值降低 GPU 开销
 * - 色团用纯 CSS transition，不用 JS 驱动动画
 * - 移除 useAudioVolume 的 RAF 循环，用纯 CSS 呼吸动画替代
 */
const BreathingBackground = memo(() => {
  const { track } = useSnapshot(player)
  const { enableBreathingEffect, theme } = useSnapshot(settings)
  const isDark = theme === 'dark'

  const coverUrl = track?.al?.picUrl || ''
  const colors = useCoverColors(coverUrl)

  const [blobs, setBlobs] = useState<ColorBlob[]>([])
  const colorsRef = useRef(colors)
  colorsRef.current = colors

  useEffect(() => {
    if (!enableBreathingEffect) {
      setBlobs([])
      return
    }

    const timers: ReturnType<typeof setTimeout>[] = []

    const spawnBlob = () => {
      const c = colorsRef.current
      const blob: ColorBlob = {
        id: blobId++,
        x: Math.random() * 70 + 5,
        y: Math.random() * 60 + 10,
        size: 12 + Math.random() * 18,
        color: c[Math.floor(Math.random() * c.length)],
        opacity: 0,
      }

      setBlobs(prev => {
        const next = prev.length >= 3 ? prev.slice(1) : prev
        return [...next, blob]
      })

      // 双 rAF 淡入
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setBlobs(prev =>
            prev.map(b => (b.id === blob.id ? { ...b, opacity: isDark ? 0.45 : 0.25 } : b))
          )
        })
      })

      // 淡出 + 移除
      const fadeTimer = setTimeout(() => {
        setBlobs(prev =>
          prev.map(b => (b.id === blob.id ? { ...b, opacity: 0 } : b))
        )
        const removeTimer = setTimeout(() => {
          setBlobs(prev => prev.filter(b => b.id !== blob.id))
        }, 3500)
        timers.push(removeTimer)
      }, 8000 + Math.random() * 8000)
      timers.push(fadeTimer)
    }

    spawnBlob()
    const initTimer = setTimeout(spawnBlob, 2000)
    timers.push(initTimer)

    // 每 6-10 秒生成一个（更慢，减少 state 更新）
    const interval = setInterval(spawnBlob, 6000 + Math.random() * 4000)

    return () => {
      clearInterval(interval)
      timers.forEach(clearTimeout)
    }
  }, [enableBreathingEffect, isDark])

  if (!enableBreathingEffect) return null

  return (
    <div
      className='pointer-events-none absolute inset-0 z-0'
      style={{ willChange: 'auto' }}
    >
      {/* 封面模糊底色 — 用 xs 小图 + 较低 blur 减少 GPU 开销 */}
      {coverUrl && (
        <div
          className='absolute inset-0'
          style={{
            backgroundImage: `url(${resizeImage(coverUrl, 'xs')})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: `blur(40px) saturate(1.2) brightness(${isDark ? 0.35 : 0.75})`,
            transform: 'scale(1.5) translateZ(0)', // GPU 加速 + 放大遮盖模糊边缘
            transition: 'background-image 2s ease-in-out',
          }}
        />
      )}

      {/* 蒙层 — 纯 CSS 呼吸动画替代 JS 驱动 */}
      <div
        className='absolute inset-0'
        style={{
          backgroundColor: isDark ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.5)',
          animation: 'breathing-overlay 8s ease-in-out infinite',
        }}
      />
      <style>{`
        @keyframes breathing-overlay {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
      `}</style>

      {/* 色团点缀 — GPU 加速 */}
      {blobs.map(blob => (
        <div
          key={blob.id}
          style={{
            position: 'absolute',
            width: `${blob.size * 2}vw`,
            height: `${blob.size * 2}vw`,
            left: `${blob.x - blob.size / 2}%`,
            top: `${blob.y - blob.size / 2}%`,
            background: `radial-gradient(circle, ${blob.color} 0%, transparent 65%)`,
            opacity: blob.opacity,
            transition: 'opacity 3s ease-in-out',
            transform: 'translateZ(0)',
            mixBlendMode: isDark ? 'soft-light' : 'multiply',
          }}
        />
      ))}
    </div>
  )
})

export default BreathingBackground
