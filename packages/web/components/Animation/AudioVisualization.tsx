import React, { useEffect, useRef } from 'react'
import player from '@/web/states/player'
import { State } from '@/web/utils/player'

interface AudioVisualizationProps {}

const AudioVisualization: React.FC<AudioVisualizationProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafIdRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    const targetWidth = Math.max(1, Math.floor(rect.width * dpr))
    const targetHeight = Math.max(1, Math.floor(rect.height * dpr))
    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth
      canvas.height = targetHeight
    }

    const bufferLength = 1024

    const draw = () => {
      rafIdRef.current = requestAnimationFrame(draw)

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (player.state !== State.Playing) {
        return
      }

      const barWidth = (canvas.width * 3) / bufferLength
      const maxHeight = canvas.height * 0.8
      let x = 0

      for (let i = 0; i < bufferLength; i += 2) {
        const barHeight = player.dataArray[i]
        const height = (barHeight / 255) * maxHeight
        const y = canvas.height - height

        const hue = (i / bufferLength) * 1500

        ctx.fillStyle = `hsl(${hue}, 120%, 50%)`
        ctx.fillRect(x, y, barWidth, height)

        x += barWidth + 1
      }
    }
    draw()

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
    }
  }, [])

  return (
    <>
      <div className=''>
        <canvas ref={canvasRef} className='w-full w-full'></canvas>
      </div>
    </>
  )
}

export default AudioVisualization
