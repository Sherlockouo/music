import PageTransition from '../../components/PageTransition'
import { useEffect, useLayoutEffect, useRef, useState, useMemo, memo, useCallback } from 'react'
import { useSnapshot } from 'valtio'
import { cx } from '@emotion/css'
import { gsap } from '@/web/utils/gsapSetup'

import useLyric from '@/web/api/hooks/useLyric'
import player from '@/web/states/player'
import settings from '@/web/states/settings'
import persistedUiStates from '@/web/states/persistedUiStates'
import { lyricParser, YrcLine, YrcWord } from '@/web/utils/lyric'
import { subscribeAudioTime } from '@/web/utils/audioTime'

/**
 * Word span — Apple-Music-style karaoke fill.
 *
 * Every word writes its own `--p` CSS variable (0..1) on its DOM node,
 * driven by a single requestAnimationFrame loop in the parent. React only
 * mounts/unmounts spans when the line changes, so playback never triggers
 * a re-render — the karaoke fill is pure CSS variable mutation.
 */
const YrcWordSpan = memo(
  ({
    word,
    lineIndex,
    registerWord,
  }: {
    word: YrcWord
    lineIndex: number
    registerWord: (el: HTMLSpanElement | null, w: YrcWord, lineIdx: number) => void
  }) => {
    const ref = useRef<HTMLSpanElement>(null)

    useLayoutEffect(() => {
      registerWord(ref.current, word, lineIndex)
      return () => registerWord(null, word, lineIndex)
    }, [registerWord, word, lineIndex])

    return (
      <span
        ref={ref}
        className='lyric-word'
        style={{ ['--p' as any]: 0 }}
        data-word-time={word.time}
        data-word-end={word.time + word.duration}
      >
        {word.content}
      </span>
    )
  }
)
YrcWordSpan.displayName = 'YrcWordSpan'

/**
 * Single lyric line wrapper. Props are intentionally minimal — only the
 * three booleans that actually change between renders. This keeps memo()
 * effective: most lines never re-render even when the active line moves.
 *
 * Double-click is handled via event delegation on the container instead
 * of per-row closures, so each row keeps a stable identity.
 */
const LyricLine = memo(
  ({
    isActive,
    isPast,
    time,
    children,
  }: {
    isActive: boolean
    isPast: boolean
    time: number
    children: React.ReactNode
  }) => {
    return (
      <div
        className={cx(
          'lyrics-row my-5 origin-left cursor-pointer whitespace-pre-wrap',
          isActive && 'lyrics-row--active',
          !isActive && isPast && 'lyrics-row--past'
        )}
        data-line-time={time}
      >
        {children}
      </div>
    )
  }
)
LyricLine.displayName = 'LyricLine'

interface RegisteredWord {
  el: HTMLSpanElement
  start: number
  end: number
}

const Lyrics = memo(() => {
  const containerRef = useRef<HTMLDivElement>(null)

  // Only re-render when the active line actually changes.
  const [currentLineIndex, setCurrentLineIndex] = useState(0)

  const { trackID } = useSnapshot(player)
  const { lyricsBlur, minimizePlayer } = useSnapshot(persistedUiStates)
  const { enableBreathingEffect } = useSnapshot(settings)

  const lyricsRes = useLyric({ id: trackID })
  const lyricsResponse = lyricsRes.data
  const { lyric: lyrics, tlyric: tlyrics, yrc, romalrc } = lyricParser(lyricsResponse)

  const userScrollingRef = useRef(false)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const hasYrc = yrc.length > 0

  const mainLines = useMemo(() => {
    if (hasYrc) {
      return yrc.map((line: YrcLine) => ({ time: line.time, content: line.content }))
    }
    return lyrics.map(line => ({ time: line.time, content: line.content }))
  }, [hasYrc, yrc, lyrics])

  const bottomPadding = minimizePlayer ? 'pb-24' : 'pb-96'

  // ---------- User-scroll detection (pauses auto-scroll for 3s) ----------
  // Also handles double-click via event delegation — one stable handler
  // for the whole list instead of N per-row closures, which is what was
  // breaking memo() and forcing every row to re-render on line change.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const onWheel = () => {
      userScrollingRef.current = true
      clearTimeout(scrollTimeoutRef.current)
      scrollTimeoutRef.current = setTimeout(() => {
        userScrollingRef.current = false
      }, 3000)
    }
    const onTouchStart = () => {
      userScrollingRef.current = true
      clearTimeout(scrollTimeoutRef.current)
    }
    const onTouchEnd = () => {
      scrollTimeoutRef.current = setTimeout(() => {
        userScrollingRef.current = false
      }, 3000)
    }
    const onDoubleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      const row = target?.closest('.lyrics-row') as HTMLElement | null
      if (!row) return
      const t = parseFloat(row.dataset.lineTime || '')
      if (!Number.isFinite(t)) return
      player.progress = t
      player.play(true)
    }

    container.addEventListener('wheel', onWheel, { passive: true })
    container.addEventListener('touchstart', onTouchStart, { passive: true })
    container.addEventListener('touchend', onTouchEnd, { passive: true })
    container.addEventListener('dblclick', onDoubleClick)

    return () => {
      container.removeEventListener('wheel', onWheel)
      container.removeEventListener('touchstart', onTouchStart)
      container.removeEventListener('touchend', onTouchEnd)
      container.removeEventListener('dblclick', onDoubleClick)
      clearTimeout(scrollTimeoutRef.current)
    }
  }, [])

  // ---------- Word registry for direct-DOM karaoke fill ----------
  const wordsByLineRef = useRef<Map<number, RegisteredWord[]>>(new Map())

  // Wipe registry synchronously when the song changes — runs before
  // children mount, so fresh registrations land in an empty map.
  const lastTrackIdRef = useRef(trackID)
  if (lastTrackIdRef.current !== trackID) {
    wordsByLineRef.current = new Map()
    lastTrackIdRef.current = trackID
  }

  const registerWord = useCallback(
    (el: HTMLSpanElement | null, word: YrcWord, lineIdx: number) => {
      const map = wordsByLineRef.current
      if (!el) {
        const bucket = map.get(lineIdx)
        if (!bucket) return
        const i = bucket.findIndex(b => b.start === word.time)
        if (i >= 0) bucket.splice(i, 1)
        if (bucket.length === 0) map.delete(lineIdx)
        return
      }

      let bucket = map.get(lineIdx)
      if (!bucket) {
        bucket = []
        map.set(lineIdx, bucket)
      }
      const existing = bucket.findIndex(b => b.start === word.time)
      const entry: RegisteredWord = {
        el,
        start: word.time,
        end: word.time + word.duration,
      }
      if (existing >= 0) bucket[existing] = entry
      else bucket.push(entry)
    },
    []
  )

  // ---------- RAF loop: line index detection + per-word fill ----------
  const mainLinesRef = useRef(mainLines)
  const lastLineIndexRef = useRef(-1)

  useEffect(() => {
    mainLinesRef.current = mainLines
    // Reset memoized index so the next frame re-evaluates against the
    // new lyric set (otherwise we'd skip the first scroll on track switch).
    lastLineIndexRef.current = -1
  }, [mainLines])

  useEffect(() => {
    if (mainLines.length === 0) return

    // Binary search — O(log n) per frame instead of O(n).
    const findLineIndex = (time: number, lines: { time: number }[]) => {
      let lo = 0
      let hi = lines.length - 1
      let ans = 0
      while (lo <= hi) {
        const mid = (lo + hi) >> 1
        if (lines[mid].time <= time) {
          ans = mid
          lo = mid + 1
        } else {
          hi = mid - 1
        }
      }
      return ans
    }

    const unsubscribe = subscribeAudioTime(time => {
      const lines = mainLinesRef.current
      if (!lines.length) return

      const newIndex = findLineIndex(time, lines)
      const lineChanged = newIndex !== lastLineIndexRef.current

      if (lineChanged) {
        lastLineIndexRef.current = newIndex
        setCurrentLineIndex(newIndex)
      }

      if (!hasYrc) return

      // Per-frame: update karaoke fill on the active line's words only.
      const bucket = wordsByLineRef.current.get(newIndex)
      if (bucket) {
        for (let i = 0; i < bucket.length; i++) {
          const w = bucket[i]
          let p: number
          if (time >= w.end) p = 1
          else if (time <= w.start) p = 0
          else p = (time - w.start) / Math.max(w.end - w.start, 0.001)
          w.el.style.setProperty('--p', p.toFixed(3))
        }
      }

      // On line change: snap past lines to filled, future lines to empty.
      // Only runs at line boundaries (cheap), but correct on seek.
      if (lineChanged) {
        wordsByLineRef.current.forEach((b, idx) => {
          if (idx === newIndex) return
          const target = idx < newIndex ? '1' : '0'
          for (let i = 0; i < b.length; i++) {
            if (b[i].el.style.getPropertyValue('--p') !== target) {
              b[i].el.style.setProperty('--p', target)
            }
          }
        })
      }
    })

    return unsubscribe
  }, [mainLines, hasYrc])

  // ---------- Auto-scroll + line transition animation ----------
  // Look up the row by attribute (fast — single descendant hit) instead
  // of materializing a full NodeList of every lyric row.
  const prevLineIndexRef = useRef(-1)
  const lineTimelineRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || mainLines.length === 0) return

    const currentLine = container.querySelector(
      `.lyrics-row[data-line-time="${mainLines[currentLineIndex]?.time}"]`
    ) as HTMLElement | null
    if (!currentLine) return

    // --- GSAP line transition animation ---
    const prevIndex = prevLineIndexRef.current
    prevLineIndexRef.current = currentLineIndex

    // Kill previous timeline to prevent stacking
    if (lineTimelineRef.current) {
      lineTimelineRef.current.kill()
    }

    const tl = gsap.timeline({ overwrite: true })
    lineTimelineRef.current = tl

    // Active line: elastic scale up + full opacity
    tl.to(currentLine, {
      scale: 1.06,
      opacity: 1,
      duration: 0.55,
      ease: 'back.out(1.4)',
    }, 0)

    // Previous line: scale down + dim
    if (prevIndex >= 0 && prevIndex !== currentLineIndex) {
      const prevLine = container.querySelector(
        `.lyrics-row[data-line-time="${mainLines[prevIndex]?.time}"]`
      ) as HTMLElement | null
      if (prevLine) {
        tl.to(prevLine, {
          scale: 0.96,
          opacity: prevIndex < currentLineIndex ? 0.45 : 0.55,
          duration: 0.5,
          ease: 'power3.out',
        }, 0)
      }
    }

    // Neighbor stagger: ±2 lines get subtle scale/opacity gradients
    const neighbors = [-2, -1, 1, 2]
    neighbors.forEach((offset, i) => {
      const neighborIndex = currentLineIndex + offset
      if (neighborIndex < 0 || neighborIndex >= mainLines.length) return
      if (neighborIndex === prevIndex) return // already animated above

      const neighborLine = container.querySelector(
        `.lyrics-row[data-line-time="${mainLines[neighborIndex]?.time}"]`
      ) as HTMLElement | null
      if (!neighborLine) return

      const isPast = neighborIndex < currentLineIndex
      tl.to(neighborLine, {
        scale: 0.96 + (2 - Math.abs(offset)) * 0.005,
        opacity: isPast ? 0.45 : 0.55 - Math.abs(offset) * 0.03,
        duration: 0.4,
        ease: 'power2.out',
      }, 0.04 * i)
    })

    // --- Auto-scroll (skip if user is scrolling) ---
    if (!userScrollingRef.current) {
      const containerCenter = container.clientHeight / 2
      const lineCenter = currentLine.offsetTop + currentLine.clientHeight / 2
      const targetY = lineCenter - containerCenter

      gsap.to(container, {
        scrollTo: { y: targetY, autoKill: true },
        duration: 0.6,
        ease: 'expo.out',
        overwrite: true,
      })
    }
  }, [currentLineIndex, mainLines])

  // ---------- Translation/romaji match (memoized for current track) ----------
  const lineMeta = useMemo(() => {
    if (!hasYrc) return []
    return yrc.map(line => {
      const t = tlyrics.find(
        (tl, i) =>
          tl.time <= line.time + 0.5 &&
          (i + 1 >= tlyrics.length || tlyrics[i + 1].time > line.time + 0.5)
      )?.content
      const roma = romalrc.find(
        (rl, i) =>
          rl.time <= line.time + 0.5 &&
          (i + 1 >= romalrc.length || romalrc[i + 1].time > line.time + 0.5)
      )?.content
      return { t, roma }
    })
  }, [hasYrc, yrc, tlyrics, romalrc])

  return (
    <PageTransition>
      <div
        className={cx(
          'relative flex h-[90vh] w-full flex-col justify-start overflow-hidden',
          'select-none font-barlow',
          enableBreathingEffect
            ? 'text-white/90'
            : 'text-accent-color-600 dark:text-accent-color-400'
        )}
      >
        <div
          ref={containerRef}
          className={cx(
            'lyrics-container no-scrollbar relative z-10 h-full w-full overflow-y-scroll text-left',
            'pl-8 pr-4 md:pl-16 md:pr-8',
            'pt-[40vh]',
            bottomPadding,
            minimizePlayer ? 'lyrics-container--mini' : 'lyrics-container--full',
            lyricsBlur && 'lyrics-container--blur'
          )}
        >
          {hasYrc
            ? yrc.map((line, index) => {
                const isActive = index === currentLineIndex
                const isPast = index < currentLineIndex
                const meta = lineMeta[index]

                return (
                  <LyricLine
                    key={index}
                    isActive={isActive}
                    isPast={isPast}
                    time={line.time}
                  >
                    <div
                      className={cx(
                        'lyric-yrc-line block tracking-wide',
                        // leading-snug (1.375) on the active line gives
                        // descenders room without making the line look airy
                        isActive
                          ? 'text-4xl font-extrabold leading-snug md:text-5xl'
                          : 'text-3xl font-medium leading-tight'
                      )}
                    >
                      {line.words.map((word, wi) => (
                        <YrcWordSpan
                          key={`${index}-${wi}-${word.time}`}
                          word={word}
                          lineIndex={index}
                          registerWord={registerWord}
                        />
                      ))}
                    </div>

                    {meta?.roma && (
                      <div className='lyric-roma mt-1 block font-sans text-base font-normal tracking-normal md:text-lg'>
                        {meta.roma}
                      </div>
                    )}

                    {meta?.t && (
                      <div className='lyric-trans mt-1 block font-sans text-lg font-normal tracking-normal md:text-xl'>
                        {meta.t}
                      </div>
                    )}
                  </LyricLine>
                )
              })
            : lyrics.map((lyric, index) => {
                const isActive = index === currentLineIndex
                const isPast = index < currentLineIndex
                const t = tlyrics[index]?.content
                const roma = romalrc[index]?.content

                return (
                  <LyricLine
                    key={index}
                    isActive={isActive}
                    isPast={isPast}
                    time={lyric.time}
                  >
                    <div
                      className={cx(
                        'block tracking-wide',
                        isActive
                          ? 'text-4xl font-extrabold leading-snug md:text-5xl'
                          : 'text-3xl font-medium leading-tight'
                      )}
                    >
                      {lyric.content}
                    </div>

                    {roma && (
                      <div className='lyric-roma mt-1 block font-sans text-base font-normal tracking-normal md:text-lg'>
                        {roma}
                      </div>
                    )}

                    {t && (
                      <div className='lyric-trans mt-2 block font-sans text-lg font-normal tracking-normal md:text-xl'>
                        {t}
                      </div>
                    )}
                  </LyricLine>
                )
              })}

          {mainLines.length === 0 && (
            <div className='mt-20 pl-16 text-3xl font-bold opacity-50'>
              Instrumental / No Lyrics
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
})
Lyrics.displayName = 'Lyrics'

export default Lyrics
