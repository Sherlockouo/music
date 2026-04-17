import { FetchLyricResponse, FetchLyricNewResponse } from '@/shared/api/Track'

// ---- YRC (逐字歌词) types ----

export interface YrcWord {
  time: number // start time in seconds
  duration: number // duration in seconds
  content: string
}

export interface YrcLine {
  time: number // line start in seconds
  duration: number // line duration in seconds
  words: YrcWord[]
  content: string // full line text
}

// ---- Standard LRC types ----

interface ParsedLyric {
  time: number
  rawTime: string
  content: string
}

// ---- Parser entry ----

export function lyricParser(lrc: FetchLyricResponse | FetchLyricNewResponse | undefined) {
  const yrcRaw = (lrc as FetchLyricNewResponse)?.yrc?.lyric
  const romalrcRaw =
    (lrc as FetchLyricNewResponse)?.yromalrc?.lyric ||
    (lrc as FetchLyricNewResponse)?.romalrc?.lyric

  return {
    lyric: parseLyric(lrc?.lrc?.lyric || ''),
    tlyric: parseLyric(lrc?.tlyric?.lyric || ''),
    yrc: yrcRaw ? parseYrc(yrcRaw) : [],
    romalrc: romalrcRaw ? parseLyric(romalrcRaw) : [],
    lyricuser: (lrc as FetchLyricResponse)?.lyricUser || '',
    transuser: (lrc as FetchLyricResponse)?.transUser || '',
  }
}

// ---- YRC parser ----

/**
 * Parse YRC (word-by-word lyrics) format from NetEase lyric_new API.
 *
 * Format: [lineStart,lineDuration](wordStart,wordDuration,0)字(wordStart,wordDuration,0)字...
 *
 * - lineStart/wordStart: milliseconds
 * - wordDuration: centiseconds (0.01s)
 */
export function parseYrc(yrcStr: string): YrcLine[] {
  const lines: YrcLine[] = []
  const lineRegex = /^\[(\d+),(\d+)\](.+)$/

  for (const raw of yrcStr.split('\n')) {
    const trimmed = raw.trim()
    if (!trimmed) continue

    // Skip JSON metadata lines (artist info etc.)
    if (trimmed.startsWith('{')) continue

    const lineMatch = trimmed.match(lineRegex)
    if (!lineMatch) continue

    const lineStartMs = parseInt(lineMatch[1], 10)
    const lineDurationMs = parseInt(lineMatch[2], 10)
    const wordsPart = lineMatch[3]

    const words: YrcWord[] = []
    // Match (start,duration,0)text patterns
    const wordRegex = /\((\d+),(\d+),\d+\)([^(]*)/g
    let match: RegExpExecArray | null

    while ((match = wordRegex.exec(wordsPart)) !== null) {
      const wordStartMs = parseInt(match[1], 10)
      const wordDurationMs = parseInt(match[2], 10)
      const content = match[3]

      if (!content) continue

      words.push({
        time: wordStartMs / 1000,
        duration: wordDurationMs / 1000,
        content,
      })
    }

    if (words.length === 0) continue

    // Filter out metadata lines (作曲, 作词, etc.)
    const fullContent = words.map(w => w.content).join('')
    if (
      fullContent.match(
        /.*(?:作曲|作词|编曲|制作|Producers|Producer|Produced|贝斯|工程师|吉他|合成器|助理|编程|和声|母带|人声|鼓|混音|中提琴|编写|钢琴|出版|录音|发行|出品|键盘|弦乐|设计|监制|原曲|演唱|声明|版权|封面|插画|统筹|企划|填词|原唱|后期|和音|琵琶).*[:：]/
      )
    ) {
      continue
    }

    lines.push({
      time: lineStartMs / 1000,
      duration: lineDurationMs / 1000,
      words,
      content: fullContent,
    })
  }

  return lines
}

// ---- Standard LRC parser ----

/**
 * @see {@link https://regexr.com/6e52n}
 */
const extractLrcRegex = /^(?<lyricTimestamps>(?:\[.+?\])+)(?!\[)(?<content>.+)$/gm
const extractTimestampRegex = /\[(?<min>\d+):(?<sec>\d+)(?:\.|:)*(?<ms>\d+)*\]/g

function parseLyric(lrc: string): ParsedLyric[] {
  const parsedLyrics: ParsedLyric[] = []

  const binarySearch = (lyric: ParsedLyric) => {
    const time = lyric.time
    let low = 0
    let high = parsedLyrics.length - 1

    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      const midTime = parsedLyrics[mid].time
      if (midTime === time) {
        return mid
      } else if (midTime < time) {
        low = mid + 1
      } else {
        high = mid - 1
      }
    }

    return low
  }

  function trimContent(content: string): string {
    const t = content.trim()
    return t.length < 1 ? content : t
  }

  for (const line of lrc.trim().matchAll(extractLrcRegex)) {
    const { lyricTimestamps, content } = line.groups as {
      lyricTimestamps: string
      content: string
    }

    if (content === '纯音乐，请欣赏') continue

    if (
      content.match(
        /.*(?<role>作曲|作词|编曲|制作|Producers|Producer|Produced|贝斯|工程师|吉他|合成器|助理|编程|制作|和声|母带|人声|鼓|混音|中提琴|编写|Talkbox|钢琴|出版|录音|发行|出品|键盘|弦乐|设计|监制|原曲|演唱|声明|版权|封面|插画|统筹|企划|填词|原唱|后期|和音|琵琶).*[:：]\s*(?<name>.*)/
      )
    ) {
      continue
    }

    for (const timestamp of lyricTimestamps.matchAll(extractTimestampRegex)) {
      const { min, sec, ms } = timestamp.groups as {
        min: string
        sec: string
        ms: string
      }
      const rawTime = timestamp[0]
      const time = Number(min) * 60 + Number(sec) + Number(ms ?? 0) * 0.001

      const parsedLyric = { rawTime, time, content: trimContent(content) }
      parsedLyrics.splice(binarySearch(parsedLyric), 0, parsedLyric)
    }
  }

  return parsedLyrics
}
