import player from '@/web/states/player'

/**
 * Single requestAnimationFrame loop that pushes the current audio playback
 * time to every subscriber. This decouples high-frequency (frame-rate) UI
 * updates — like karaoke-style lyric fills and the seek bar — from the
 * 80ms valtio progress tick, and avoids re-rendering React trees per frame.
 *
 * The loop is lazy: it only runs while at least one subscriber is attached.
 *
 * Subscribers receive the current playback time in seconds. They are
 * expected to mutate the DOM directly (e.g. set CSS variables) instead of
 * triggering React state updates.
 */

type Listener = (time: number) => void

const listeners = new Set<Listener>()
let rafId: number | null = null
let lastTime = -1

const tick = () => {
  const t = player.liveCurrentTime()

  // Skip dispatch if time hasn't advanced (paused / seeking jitter).
  // We still keep the loop alive so resume is instant.
  if (t !== lastTime) {
    lastTime = t
    listeners.forEach(fn => {
      try {
        fn(t)
      } catch {
        /* swallow to keep loop alive */
      }
    })
  }

  rafId = requestAnimationFrame(tick)
}

const start = () => {
  if (rafId != null) return
  lastTime = -1
  rafId = requestAnimationFrame(tick)
}

const stop = () => {
  if (rafId == null) return
  cancelAnimationFrame(rafId)
  rafId = null
}

/**
 * Subscribe to per-frame audio time updates.
 * Returns an unsubscribe function.
 */
export function subscribeAudioTime(listener: Listener): () => void {
  listeners.add(listener)
  start()

  // Push the current time immediately so the subscriber paints
  // a correct first frame instead of waiting for the next RAF.
  try {
    listener(player.liveCurrentTime())
  } catch {
    /* ignore */
  }

  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) stop()
  }
}
