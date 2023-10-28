import React, { useEffect, useRef } from 'react'
import player from '@/web/states/player'
import { useSnapshot } from 'valtio'
import { State } from '@/web/utils/player'

interface AudioVisualizationProps {}

const AudioVisualization: React.FC<AudioVisualizationProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { state, dataArray } = useSnapshot(player)
  const devicePixelRatio = window.devicePixelRatio || 1

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas!.getContext('2d')
    if (!canvas) return
    canvas.width = canvas.width * devicePixelRatio
    canvas.height = canvas?.height * devicePixelRatio
    var bufferLength = 1024

    const draw = () => {
      requestAnimationFrame(draw)

      ctx!.clearRect(0, 0, canvas.width, canvas.height)

      const barWidth = (canvas.width * 3) / bufferLength
      const maxHeight = canvas.height * 0.8
      let x = 0

      for (let i = 0; i < bufferLength; i += 2) {
        const barHeight = dataArray[i]
        const height = (barHeight / 255) * maxHeight
        const y = canvas.height - height

        const hue = (i / bufferLength) * 1500

        ctx!.fillStyle = `hsl(${hue}, 120%, 50%)` // 使用固定颜色，避免模糊

        ctx!.fillRect(x, y, barWidth, height)

        x += barWidth + 1
      }
    }
    draw()
  }, [state])

  return (
    <>
      <div className=''>
        <canvas ref={canvasRef} className='w-full w-full'></canvas>
      </div>
    </>
  )
}

export default AudioVisualization
