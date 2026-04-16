import { useEffect, useRef, useState } from 'react'
import player from '@/web/states/player'
import { State } from '@/web/utils/player'
import { useSnapshot } from 'valtio'

/**
 * 提取实时音量用于驱动歌词呼吸灯效果。
 *
 * 策略：尝试通过 Web Audio API AnalyserNode 分析 Howler 的 <audio> 元素。
 * 如果因 CORS 限制导致频率数据全为 0，则回退到基于播放状态的模拟呼吸效果。
 *
 * 返回归一化音量 (0-1)。
 */

let sharedCtx: AudioContext | null = null
let sharedAnalyser: AnalyserNode | null = null
let connectedElements = new WeakSet<HTMLMediaElement>()
let webAudioFailed = false

function tryConnectAnalyser(audioEl: HTMLMediaElement): AnalyserNode | null {
  if (webAudioFailed) return null

  try {
    if (!sharedCtx || sharedCtx.state === 'closed') {
      sharedCtx = new AudioContext()
    }

    if (!sharedAnalyser) {
      sharedAnalyser = sharedCtx.createAnalyser()
      sharedAnalyser.fftSize = 256
      sharedAnalyser.smoothingTimeConstant = 0.8
      sharedAnalyser.connect(sharedCtx.destination)
    }

    if (!connectedElements.has(audioEl)) {
      const source = sharedCtx.createMediaElementSource(audioEl)
      source.connect(sharedAnalyser)
      connectedElements.add(audioEl)
    }

    if (sharedCtx.state === 'suspended') {
      sharedCtx.resume()
    }

    return sharedAnalyser
  } catch {
    webAudioFailed = true
    return null
  }
}

function getHowlerAudioElement(): HTMLMediaElement | null {
  try {
    const howler = (window as any).howler
    if (!howler?._sounds?.length) return null
    const node = howler._sounds[0]._node
    return node instanceof HTMLMediaElement ? node : null
  } catch {
    return null
  }
}

export default function useAudioVolume(enabled: boolean = true) {
  const [volume, setVolume] = useState(0)
  const rafRef = useRef<number>(0)
  const lastAudioElRef = useRef<HTMLMediaElement | null>(null)
  const zeroCountRef = useRef(0)
  const useFallbackRef = useRef(false)
  const { state } = useSnapshot(player)

  // 回退模式：基于播放状态的模拟呼吸
  useEffect(() => {
    if (!enabled || !useFallbackRef.current) return
    if (state !== State.Playing) {
      setVolume(0)
      return
    }

    let destroyed = false
    let phase = Math.random() * Math.PI * 2

    const tick = () => {
      if (destroyed) return
      // 有机的呼吸感：双频叠加 + 随机漂移
      phase += 0.06
      const v = 0.35 + 0.25 * Math.sin(phase) + 0.15 * Math.sin(phase * 2.3 + 1.2)
      setVolume(v)
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      destroyed = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [enabled, state])

  // 主模式：Web Audio API 真实分析
  useEffect(() => {
    if (!enabled || webAudioFailed) {
      useFallbackRef.current = true
      return
    }

    let destroyed = false
    const dataArray = new Uint8Array(128)
    let lastUpdate = 0
    const INTERVAL = 33

    const tick = (time: number) => {
      if (destroyed) return

      if (time - lastUpdate >= INTERVAL) {
        lastUpdate = time

        const audioEl = getHowlerAudioElement()

        if (audioEl && audioEl !== lastAudioElRef.current) {
          lastAudioElRef.current = audioEl
          tryConnectAnalyser(audioEl)
        }

        if (sharedAnalyser && !webAudioFailed) {
          sharedAnalyser.getByteFrequencyData(dataArray)

          let sum = 0
          const start = 2
          const end = Math.min(64, dataArray.length)
          for (let i = start; i < end; i++) {
            sum += dataArray[i] * dataArray[i]
          }
          const rms = Math.sqrt(sum / (end - start)) / 255

          // 检测 CORS 导致的全零数据：连续 60 帧 (~2秒) 全为 0 则切换到回退模式
          if (rms === 0) {
            zeroCountRef.current++
            if (zeroCountRef.current > 60) {
              useFallbackRef.current = true
              return // 停止 Web Audio 循环，让回退模式接管
            }
          } else {
            zeroCountRef.current = 0
            setVolume(rms)
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    // 延迟启动，等待 Howler 初始化
    const timer = setTimeout(() => {
      if (!destroyed) rafRef.current = requestAnimationFrame(tick)
    }, 500)

    return () => {
      destroyed = true
      clearTimeout(timer)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [enabled])

  return volume
}
