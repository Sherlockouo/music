/**
 * player.ts 特征测试（characterization tests）
 *
 * 目的：锁住「当前」行为，而不是「应该」的行为。
 * 用途：任何针对 player.ts 的改动，跑这个文件就能知道有没有改变既有语义。
 *
 * 注意：文件里有两处标注了「当前行为待确认」的用例，分别对应
 * docs/ai/backlog.md 第 9 条的三个开放问题。它们断言的是现状，
 * 不是设计意图 —— 如果将来有人改了实现，这些用例应该失败，然后由人决定
 * 是新行为更好，还是把旧行为改回来。
 *
 * 本文件只测纯逻辑，不触碰网络、Howler 真实播放、localStorage。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  howlSeek: vi.fn(() => 0),
  howlPause: vi.fn(),
  howlPlay: vi.fn(),
  howlerVolume: vi.fn(),
  fetchAudioSource: vi.fn(),
  fetchTracks: vi.fn(),
  toast: vi.fn(),
}))

vi.mock('howler', () => {
  class Howl {
    seek = mocks.howlSeek
    pause = mocks.howlPause
    play = mocks.howlPlay
  }
  return { Howl, Howler: { volume: mocks.howlerVolume } }
})

vi.mock('@/web/api/hooks/useTracks', () => ({
  fetchAudioSourceWithReactQuery: mocks.fetchAudioSource,
  fetchTracksWithReactQuery: mocks.fetchTracks,
}))
vi.mock('@/web/api/hooks/usePersonalFM', () => ({ fetchPersonalFMWithReactQuery: vi.fn() }))
vi.mock('@/web/api/hooks/usePlaylist', () => ({ fetchPlaylistWithReactQuery: vi.fn() }))
vi.mock('@/web/api/hooks/useAlbum', () => ({ fetchAlbumWithReactQuery: vi.fn() }))
vi.mock('@/web/api/hooks/useArtist', () => ({ fetchArtistWithReactQuery: vi.fn() }))
vi.mock('@/web/api/personalFM', () => ({ fmTrash: vi.fn() }))
vi.mock('@/web/api/r3play', () => ({ cacheAudio: vi.fn() }))
vi.mock('@/web/api/user', () => ({ scrobble: vi.fn() }))
vi.mock('react-hot-toast', () => ({ default: mocks.toast }))
vi.mock('@/web/utils/isLyricsWindow', () => ({ isLyricsWindow: false }))

import { Mode, Player, State } from '@/web/utils/player'
import { RepeatMode } from '@/shared/playerDataTypes'

/** 构造一个只设内部字段、不触发播放的 Player，避免 init() 里的网络副作用 */
function makePlayer(trackList: number[], trackIndex: number): Player {
  const p = new Player()
  p.trackList = [...trackList]
  p.mode = Mode.TrackList
  // _trackIndex 是 private，测试里直接写；这样绕开 init() 的 _playAudio/_initFM
  ;(p as unknown as { _trackIndex: number })._trackIndex = trackIndex
  return p
}

const nextIndexOf = (p: Player) => (p as unknown as { _nextTrackIndex?: number })._nextTrackIndex
const prevIndexOf = (p: Player) => (p as unknown as { _prevTrackIndex?: number })._prevTrackIndex

beforeEach(() => {
  vi.clearAllMocks()
})

describe('队列推进：RepeatMode.Off（播完即停）', () => {
  it('中间位置正常前后移动', () => {
    const p = makePlayer([11, 22, 33, 44, 55], 2)
    p.repeatMode = RepeatMode.Off
    expect(nextIndexOf(p)).toBe(3)
    expect(prevIndexOf(p)).toBe(1)
  })

  it('最后一首没有下一首（undefined），此时 nextTrack 会 toast 并暂停', () => {
    const p = makePlayer([11, 22, 33], 2)
    p.repeatMode = RepeatMode.Off
    expect(nextIndexOf(p)).toBeUndefined()
  })

  it('第一首的「上一首」返回 0 而不是 undefined —— 即原地不动，不提示「没有上一首」', () => {
    const p = makePlayer([11, 22, 33], 0)
    p.repeatMode = RepeatMode.Off
    expect(prevIndexOf(p)).toBe(0)
  })
})

describe('队列推进：RepeatMode.On（列表循环）', () => {
  it('末尾的下一首回到 0', () => {
    const p = makePlayer([11, 22, 33], 2)
    p.repeatMode = RepeatMode.On
    expect(nextIndexOf(p)).toBe(0)
  })

  it('首位的上一首回到末尾', () => {
    const p = makePlayer([11, 22, 33], 0)
    p.repeatMode = RepeatMode.On
    expect(prevIndexOf(p)).toBe(2)
  })
})

describe('队列推进：RepeatMode.One（单曲循环）', () => {
  it('下一首与上一首都是自己', () => {
    const p = makePlayer([11, 22, 33], 1)
    p.repeatMode = RepeatMode.One
    expect(nextIndexOf(p)).toBe(1)
    expect(prevIndexOf(p)).toBe(1)
  })
})

describe('队列推进：边界', () => {
  it('空列表：下一首 undefined，上一首 0', () => {
    const p = makePlayer([], 0)
    p.repeatMode = RepeatMode.Off
    expect(nextIndexOf(p)).toBeUndefined()
    expect(prevIndexOf(p)).toBe(0)
  })

  it('单曲列表 + 循环：下一首和上一首都是 0', () => {
    const p = makePlayer([7], 0)
    p.repeatMode = RepeatMode.On
    expect(nextIndexOf(p)).toBe(0)
    expect(prevIndexOf(p)).toBe(0)
  })

  // ⚠️ 当前行为待确认（backlog 第 9 条）
  // _nextTrackIndex / _prevTrackIndex 的 switch 只处理了 Off / On / One，
  // Shuffle 与 ShuffleOff 落空 → 返回 undefined。
  // 若 repeatMode 真被设成 Shuffle，nextTrack() 会走「没有下一首了 + 暂停」分支。
  // 但 UI 的 shuffle 按钮只调 shufflePlayList()、不设 repeatMode，
  // 所以实际运行时大概率不触发。两条路径不一致，需人工确认哪个是意图。
  it('Shuffle / ShuffleOff 未被 switch 处理，返回 undefined（当前行为）', () => {
    const p = makePlayer([11, 22, 33], 1)
    p.repeatMode = RepeatMode.Shuffle
    expect(nextIndexOf(p)).toBeUndefined()
    p.repeatMode = RepeatMode.ShuffleOff
    expect(prevIndexOf(p)).toBeUndefined()
  })
})

describe('trackID 的读写', () => {
  it('TrackList 模式读的是 trackList[trackIndex]', () => {
    const p = makePlayer([11, 22, 33], 1)
    expect(p.mode).toBe(Mode.TrackList)
    expect(p.trackID).toBe(22)
  })

  it('FM 模式读的是 fmTrackList[0]', () => {
    const p = makePlayer([11, 22, 33], 1)
    p.mode = Mode.FM
    p.fmTrackList = [999]
    expect(p.trackID).toBe(999)
  })

  it('写入时同时改 trackList 当前位置与 fmTrackList[0]（跨模式同步，别改成只改一处）', () => {
    const p = makePlayer([11, 22, 33], 1)
    p.fmTrackList = [999]
    p.trackID = 77
    expect(p.trackList).toEqual([11, 77, 33])
    expect(p.fmTrackList[0]).toBe(77)
  })

  it('越界索引读到 undefined 时回落为 0', () => {
    const p = makePlayer([11], 5)
    expect(p.trackID).toBe(0)
  })
})

describe('progress 与 volume', () => {
  it('Loading 状态下 progress 恒为 0，即使内部有值', () => {
    const p = makePlayer([11], 0)
    ;(p as unknown as { _progress: number })._progress = 42
    p.state = State.Loading
    expect(p.progress).toBe(0)
    p.state = State.Playing
    expect(p.progress).toBe(42)
  })

  it('设置 progress 会同步写 howler.seek', () => {
    const p = makePlayer([11], 0)
    p.progress = 30
    expect(mocks.howlSeek).toHaveBeenCalledWith(30)
  })

  it('volume 被 clamp 到 0–1，并透传给 Howler', () => {
    const p = makePlayer([11], 0)
    p.volume = 2
    expect(p.volume).toBe(1)
    p.volume = -1
    expect(p.volume).toBe(0)
    p.volume = 0.35
    expect(p.volume).toBeCloseTo(0.35)
    expect(mocks.howlerVolume).toHaveBeenCalledTimes(3)
  })
})

describe('_fetchAudioSource 的取值与净化', () => {
  const fetchSource = (p: Player, id: number) =>
    (p as unknown as { _fetchAudioSource: (id: number) => Promise<{ audio: string | null; id: number }> })
      ._fetchAudioSource(id)

  it('126.net 的 http 地址被强升为 https', async () => {
    mocks.fetchAudioSource.mockResolvedValue({ data: [{ url: 'http://m8.music.126.net/a.mp3' }] })
    const p = makePlayer([1], 0)
    await expect(fetchSource(p, 1)).resolves.toEqual({
      audio: 'https://m8.music.126.net/a.mp3',
      id: 1,
    })
  })

  it('非 126.net 的地址原样返回，不做协议替换', async () => {
    mocks.fetchAudioSource.mockResolvedValue({ data: [{ url: 'http://example.com/a.mp3' }] })
    const p = makePlayer([1], 0)
    await expect(fetchSource(p, 1)).resolves.toEqual({
      audio: 'http://example.com/a.mp3',
      id: 1,
    })
  })

  it('接口没有返回 url 时 audio 为 undefined（注意：与抛错分支的 null 不是同一个值）', async () => {
    mocks.fetchAudioSource.mockResolvedValue({ data: [] })
    const p = makePlayer([1], 0)
    // 两条失败路径的返回值不一致：无数据 → undefined，抛错 → null。
    // 调用方统一用 `if (!audio)` 判断，所以目前无影响；
    // 但任何改成 `audio === null` 的判断都会漏掉前者。
    await expect(fetchSource(p, 1)).resolves.toEqual({ audio: undefined, id: 1 })
  })

  it('接口抛错被吞掉，返回 audio: null —— 这是既有行为，不要在重构中改成向上抛', async () => {
    mocks.fetchAudioSource.mockRejectedValue(new Error('network'))
    const p = makePlayer([1], 0)
    await expect(fetchSource(p, 1)).resolves.toEqual({ audio: null, id: 1 })
  })
})

describe('队列编辑', () => {
  it('addToNextPlay 在列表中间时插到下一首之前', () => {
    const p = makePlayer([11, 22, 33], 0)
    p.repeatMode = RepeatMode.Off
    p.addToNextPlay(99)
    expect(p.trackList).toEqual([11, 99, 22, 33])
  })

  it('已存在的歌会被先去重再插入', () => {
    const p = makePlayer([11, 22, 33], 0)
    p.repeatMode = RepeatMode.Off
    p.addToNextPlay(33)
    expect(p.trackList).toEqual([11, 33, 22])
  })

  // ⚠️ 当前行为待确认（backlog 第 9 条）
  // 在「最后一首」时 _nextTrackIndex 为 undefined，代码里是
  // this.trackList.splice(Number(this._nextTrackIndex), 0, trackID)
  // Number(undefined) === NaN，而 splice(NaN, 0, x) 等价于插到队首。
  // 期望行为大概是「追加到末尾」，但现状是插到最前面。
  it('addToNextPlay 在最后一首时被插到队首（Number(undefined) → NaN → splice 0，当前行为）', () => {
    const p = makePlayer([11, 22, 33], 2)
    p.repeatMode = RepeatMode.Off
    p.addToNextPlay(99)
    expect(p.trackList).toEqual([99, 11, 22, 33])
  })

  it('addToFirstPlay 已存在时去重并置顶', () => {
    const p = makePlayer([11, 22, 33], 0)
    p.addToFirstPlay(33)
    expect(p.trackList).toEqual([33, 11, 22])
  })

  it('addToFirstPlay 不存在时直接置顶', () => {
    const p = makePlayer([11, 22], 0)
    p.addToFirstPlay(99)
    expect(p.trackList).toEqual([99, 11, 22])
  })
})
