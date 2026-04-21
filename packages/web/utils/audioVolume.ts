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
let lastTickAt = 0
// Cap analyser+listener work at ~45Hz. The brightness pulse needs to
// feel responsive to drum hits without wasting CPU on every vsync.
// 22ms ≈ 45fps strikes a good perceptual balance: faster than 30Hz
// (which feels laggy on transients) but ~25% cheaper than full 60Hz.
const TICK_INTERVAL_MS = 22
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
      // Lower smoothing → more transient response. The CSS-side
      // transition (80ms) already provides visual smoothing, so
      // pre-smoothing the analyser would just add latency.
      sharedAnalyser.smoothingTimeConstant = 0.6
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

const tick = (now: number) => {
  if (now - lastTickAt < TICK_INTERVAL_MS) {
    rafId = requestAnimationFrame(tick)
    return
  }
  lastTickAt = now

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

  // One-pole low-pass. Lower memory weight (0.55) makes the
  // brightness actually track loudness changes instead of lagging
  // half a second behind. The CSS transition still smooths the
  // final pixel value so the result reads as fluid rather than jumpy.
  smoothed = smoothed * 0.55 + raw * 0.45

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
