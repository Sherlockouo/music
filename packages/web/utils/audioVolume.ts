import player from '@/web/states/player'
import { State } from '@/web/utils/player'

/**
 * Single requestAnimationFrame loop that pushes the current audio
 * loudness (0..1) to every subscriber. Mirrors `subscribeAudioTime`:
 * one shared analyser + one shared loop, lazy start/stop.
 *
 * Preferred path: Web Audio AnalyserNode tapped onto Howler's
 * `<audio>` element. If CORS or autoplay policy blocks that path
 * (`createMediaElementSource` throws, or all bins read 0 for a few
 * seconds), we fall back to a smooth synthetic breathing curve so
 * the UI still pulses while the song plays.
 *
 * Subscribers are expected to mutate the DOM directly (e.g. write a
 * CSS variable) instead of calling React setState — this loop fires
 * up to ~60 times per second.
 */

type Listener = (volume: number) => void

let sharedCtx: AudioContext | null = null
let sharedAnalyser: AnalyserNode | null = null
const connectedElements = new WeakSet<HTMLMediaElement>()
let lastAudioEl: HTMLMediaElement | null = null
let dataArray: Uint8Array | null = null
let webAudioFailed = false

let useFallback = false
let zeroFrames = 0
let fallbackPhase = Math.random() * Math.PI * 2

let smoothed = 0
let rafId: number | null = null
const listeners = new Set<Listener>()

function getHowlerAudioElement(): HTMLMediaElement | null {
  try {
    const howler: any = (window as any).howler
    if (!howler?._sounds?.length) return null
    const node = howler._sounds[0]._node
    return node instanceof HTMLMediaElement ? node : null
  } catch {
    return null
  }
}

function tryConnect(audioEl: HTMLMediaElement) {
  if (webAudioFailed) return
  try {
    if (!sharedCtx || sharedCtx.state === 'closed') {
      const Ctor: typeof AudioContext =
        (window as any).AudioContext || (window as any).webkitAudioContext
      if (!Ctor) {
        webAudioFailed = true
        return
      }
      sharedCtx = new Ctor()
    }
    if (!sharedAnalyser && sharedCtx) {
      sharedAnalyser = sharedCtx.createAnalyser()
      sharedAnalyser.fftSize = 256
      sharedAnalyser.smoothingTimeConstant = 0.85
      sharedAnalyser.connect(sharedCtx.destination)
    }
    if (sharedCtx && sharedAnalyser && !connectedElements.has(audioEl)) {
      const source = sharedCtx.createMediaElementSource(audioEl)
      source.connect(sharedAnalyser)
      connectedElements.add(audioEl)
    }
    if (sharedCtx && sharedCtx.state === 'suspended') {
      void sharedCtx.resume()
    }
  } catch {
    // CORS / cross-origin without the right header / DRM — give up
    // on Web Audio for the rest of the session.
    webAudioFailed = true
  }
}

const tick = () => {
  let raw = 0

  if (useFallback || webAudioFailed) {
    if (player.state === State.Playing) {
      fallbackPhase += 0.05
      raw =
        0.4 +
        0.25 * Math.sin(fallbackPhase) +
        0.15 * Math.sin(fallbackPhase * 2.3 + 1.2)
    } else {
      raw = 0
    }
  } else {
    const audioEl = getHowlerAudioElement()
    if (audioEl && audioEl !== lastAudioEl) {
      lastAudioEl = audioEl
      tryConnect(audioEl)
    }
    if (sharedAnalyser) {
      if (!dataArray || dataArray.length !== sharedAnalyser.frequencyBinCount) {
        dataArray = new Uint8Array(sharedAnalyser.frequencyBinCount)
      }
      sharedAnalyser.getByteFrequencyData(dataArray)
      // Skip the very lowest bins (DC + sub-bass rumble) and the very
      // highest (mostly noise). Mid-band RMS reads more like perceived
      // loudness than the raw average.
      let sum = 0
      const start = 2
      const end = Math.min(64, dataArray.length)
      for (let i = start; i < end; i++) {
        const v = dataArray[i]
        sum += v * v
      }
      raw = Math.sqrt(sum / (end - start)) / 255

      if (raw === 0 && player.state === State.Playing) {
        zeroFrames++
        // ~1.5s of nothing while the player thinks it's playing → CORS
        // blocked the analyser; switch to the synthetic curve.
        if (zeroFrames > 90) useFallback = true
      } else {
        zeroFrames = 0
      }
    }
  }

  // Light one-pole low-pass so the value animates buttery instead
  // of jittering on every drum hit.
  smoothed = smoothed * 0.78 + raw * 0.22

  listeners.forEach(fn => {
    try {
      fn(smoothed)
    } catch {
      /* keep the loop alive */
    }
  })

  rafId = requestAnimationFrame(tick)
}

const start = () => {
  if (rafId != null) return
  rafId = requestAnimationFrame(tick)
}

const stop = () => {
  if (rafId == null) return
  cancelAnimationFrame(rafId)
  rafId = null
}

export function subscribeAudioVolume(listener: Listener): () => void {
  listeners.add(listener)
  start()

  // Push the latest value immediately so the first paint is correct.
  try {
    listener(smoothed)
  } catch {
    /* ignore */
  }

  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) stop()
  }
}
