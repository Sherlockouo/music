# 已知债、已知红、已知禁区 — R3PLAYX (music)

> 生成：2026-11-25，只读测绘。
> **用途**：防止 agent（或未来的你）去"修"一个没人打算修的东西，或者在不知情的情况下踩红线。
> **未验证**：本次没有执行 `pnpm build` / `pnpm test` / 启动应用，所以"本来就红"的部分只记录了**结构事实**，实际红灯状态待第一次跑测试后补。

## 1. `CLAUDE.md` 版本信息全线过时（最高优先级）

根 `CLAUDE.md` 是每次会话都会加载的常驻上下文，它的技术栈描述与现实严重不符：

| CLAUDE.md 写的 | `package.json` 实际 | 依据 |
|---|---|---|
| Electron 28 | **^43.4.0** | `packages/desktop/package.json` devDeps |
| React 18 | **^19.2.8** | `packages/web/package.json` deps |
| Vite 4 | **^7.3.6** | 同上 devDeps |
| Fastify 4 | **^5.12.0** | desktop / server 两处 |
| Prisma（无版本） | **^6.19.3** | `packages/server/package.json` |
| Tailwind CSS（无版本） | **^4.3.3**，CSS-first，走 `@tailwindcss/vite` | `packages/web/package.json` |
| Node >= 16，推荐 18.12.1 | **>= 22.12** | 根 `package.json` engines |
| v2.7.6 Beta | **2.8.0** | 根 `package.json` |
| shared 是最先构建的包 | **shared 没有 package.json，无构建步骤** | `packages/shared/` |

**处理建议**：不要"顺手重写整份 CLAUDE.md"。只改事实层（版本、命令、目录地图），保持结构不动；改完在文件头加一行"最后校准：2026-11-25，以 `packages/*/package.json` 为准"。

**为什么不能放任**：模型会拿 Electron 28 / Fastify 4 的 API 给你写代码——这在升级后的大版本上是实打实的错误来源。

## 2. 双份路由实现需要同步修改

`desktop/main/appServer/routes/` 与 `server/src/routes/` 同构但**不共享代码**（详见 `architecture.md` 第 6 节）。改其中一个接口的形状，另一个大概率要跟。

**这是本项目最容易漏的地方**：没有编译期约束能提醒你，只有跑起来才发现另一头 404。

**安全做法**：任何触及 `routes/netease/*` 或 `routes/apple-music/*` 的改动，影响面清单里必须显式列出"另一个实现是否要同步"。

## 3. 跨包依赖主版本不一致

| 依赖 | desktop | web | 风险 |
|---|---|---|---|
| `@tanstack/react-query` | ^4.44.0 | ^5.101.4 | **v5 有破坏性 API 变更**（`useQuery` 签名、`cacheTime`→`gcTime` 等）。两套语义并存，从 web 抄代码到 desktop 会静默错 |
| `vitest` | ^0.26.3 | ^4.1.10 | 配置项、mock API、`--ui` 行为差异大；desktop 的测试写法不能照搬到 web |

**处理建议**：暂时别动。要统一就单独开一个 PR 只做这件事，且必须先补测试——现在测试总量只有 5 个文件，没有护栏的升级等于赌博。

## 4. 测试覆盖极薄

> **基线实测（2026-11-25 20:51）**：两个包现有测试**全绿**，但覆盖极薄。

| 包 | 测试结果 | 说明 |
|---|---|---|
| `web` | **3 文件 / 25 用例，全绿**（2.03s） | 只覆盖工具函数，**零组件/零业务逻辑测试** |
| `desktop` | **2 文件 / 11 用例，全绿**（1.83s） | 都是安全相关的小函数 |
| `server` | **0 个，且 package.json 里没有 test 脚本** | 未验证 |

**含义**：`player.ts`（772 行）、`ipcMain.ts`（393 行）、`CoverRowVirtual.tsx`（510 行）这三个高危文件**没有一行测试**。任何重构前必须先补特征测试，否则没有验证手段。

**优先级建议**：`player.ts` 的队列推进与音质回退逻辑 > `IpcChannels` 三处一致性 > `cache.ts` 的写入/清理路径。

### 4b. 类型检查基线：web 干净，desktop 本来就红

> 这是最重要的一条"本来就红"——不记下来，下一步一定有人去"修"它。

| 包 | `pnpm test:types` 结果 |
|---|---|
| `web` | **0 error**（干净，可作为回归基线） |
| `desktop` | **34 error / 6 文件**（失败） |

desktop 的 34 个错误分布：

| 文件 | 数量 | 性质 |
|---|---|---|
| `main/youtube.ts` | 16 | 第三方库类型缺失/API 漂移 |
| `scripts/build.main.ts` | 9 | 构建脚本，esbuild 类型收紧 + 隐式 any |
| `main/touchBar.ts` | 3 | 隐式 any（回调参数） |
| `main/db.ts` | 3 | 泛型推断退化（`unknown` 赋给 `TablesStructures[T]`） |
| `scripts/build.sqlite3.ts` | 2 | 隐式 any |
| `main/ipcMain.ts` | **1** | **真实缺陷，见下** |

**不要做的事**：不要为了让 desktop 变绿而顺手改这 34 处。它们是既存状态，改动的风险不等于收益。要修就单独开一个 PR，一次只修一类。

### 4c. `ipcMain.ts:376` 是一处真实的静默失效（类型基线抓到的）

```ts
// packages/desktop/main/ipcMain.ts:375-377
handle(IpcChannels.GetPlatform, event => {
  event.returnValue = getPlatform()
})
```

- 用的是 `handle`（对应渲染端的 `invoke`），但写的是 `event.returnValue`——`returnValue` 属于 `ipcMain.on` 的 `IpcMainEvent`，`IpcMainInvokeEvent` 上没有这个属性。`handle` 的返回值只取回调的 `return`，而这里回调没有 `return`。
- 渲染端 `web/hooks/useOSPlatform.ts:21` 确实在等返回值：`await window.ipcRenderer?.invoke(IpcChannels.GetPlatform)`。

**影响面**：`useOSPlatform()` 在桌面端会拿到 `undefined`，然后回落到 `detectPlatform()`（UA 判断，`:7-18`）。所以**不崩、不报错，只是静默降级**。UA 判断在 Electron 43 下大概率仍能猜对，因此这个 bug 至今没被发现。

**建议改法**（低风险，一处）：

```ts
handle(IpcChannels.GetPlatform, () => getPlatform())
```

**验证方式**：改完 `pnpm test:types --filter desktop` 的该条错误消失；再在桌面端打印 `useOSPlatform()` 确认拿到 `win32`。注意此时 desktop 仍有 33 个既存错误，不要误以为"修好了就全绿"。

## 5. 安全红线（近期修复确立，不要回退）

来自提交 `b19cdb4 fix(security): sanitize description HTML and contain local audio-cache route`：

| 红线 | 守护测试 | 别做什么 |
|---|---|---|
| 歌单/专辑 `description` 的 HTML 必须净化后再渲染 | `web/test/utils/sanitizeHtml.test.ts` | 不要为了"显示更完整"去掉 `DOMPurify` 那层 |
| 本地音频缓存路由必须收敛在指定目录内 | `desktop/test/cacheAudioPath.test.ts` | 不要放开路径拼接，不要接受前端传入的任意路径 |
| 本地服务只接受 loopback 主机 | `desktop/test/loopbackHostCheck.test.ts` | 不要把 `registerLoopbackHostCheck` 去掉或放宽到 `0.0.0.0` |

**这三处属于"改之前先问"级别**，不是"顺手优化"级别。

## 6. 遗留物与噪音目录

| 项 | 状态 | 建议 |
|---|---|---|
| `package-lock.json`（96KB） | 与 `pnpm-lock.yaml` 并存 | 疑似遗留。**先确认没有 CI 依赖它**再删，删的时候单独一个 commit |
| `.zread/wiki/` | 旧工具生成的文档快照 | 事实不可信。要么删，要么在目录里放个 README 标明"历史快照，勿引用" |
| `.qoder/repowiki/wiki_plan.yaml` | 只有规划，没有生成产物 | 想用 Repo Wiki 就按规划跑一次；不想用就删，别留着误导 |
| `tmp/`（722 文件） | better-sqlite3 二进制 + Electron userData | 已在 `.gitignore`，不要提交 |
| `CLAUDE.md` 与 `.qoder/repowiki/wiki_plan.yaml` 并存 | 两份都在描述架构 | 以 `docs/ai/` 为准，`CLAUDE.md` 收敛为"命令 + 禁区 + 指针" |

## 7. 脆弱的外部依赖

- `@neteasecloudmusicapienhanced/api`：网易 API 的非官方增强版，接口形状随上游变。
- `@unblockneteasemusic/server`：用于绕过区域限制，随时可能失效。
- `ytdl-core ^4.11.5`：YouTube 下载库，上游长期不稳定，且与 YouTube 侧变更强耦合。

**含义**：这三处出问题，大概率不是本项目的 bug。排查顺序应该是"上游变了 → 降级/替换"，而不是"改我们的调用代码"。

## 8. 基线记录（2026-11-25 20:51 实测）

已执行：

```bash
pnpm --filter web exec vitest run          # 3 文件 / 25 用例 全绿  2.03s
pnpm --filter desktop exec vitest run      # 2 文件 / 11 用例 全绿  1.83s
pnpm --filter web test:types               # 0 error
pnpm --filter desktop test:types           # 34 error（既存，见 4b/4c）
```

未执行（下次开工补）：

- [ ] `pnpm install` 在 Node 22.22.2 下是否干净通过（`post-install` 会编译 better-sqlite3 + 生成 Prisma client）
- [ ] `pnpm build` 全链路是否绿
- [ ] `pnpm dev`（桌面）能否起来、`42710` 是否可访问
- [ ] `server` 包在无 test 脚本下的实际验证方式（可能只能手工启动）
- [ ] `pnpm lint` 的实际红灯情况

**两个操作层面的坑（实测）**：

1. `pnpm test --filter <包>` 会进 watch 模式，在脚本/CI 里必须写 `pnpm --filter <包> exec vitest run`。
2. `vitest run --reporter=basic` 在 vitest 4 下会直接崩（`basic` reporter 已移除），用默认 reporter 或 `--reporter=dot`。

跑完之后，把结果回填到第 4 节与本节——这才是 `docs/ai/` 应有的闭环。

## 9. 特征测试落地记录（2026-11-25 20:54）

新增 `packages/web/test/utils/player.queue.test.ts`，**25 个用例**，锁住 `player.ts` 的纯逻辑部分：

| 覆盖范围 | 用例数 | 锁住了什么 |
|---|---|---|
| 队列推进（Off / On / One / 边界） | 8 | `_nextTrackIndex` / `_prevTrackIndex` 的全部现有语义，含"第一首的上一首返回 0 而不是 undefined"这种反直觉行为 |
| trackID 读写 | 4 | TrackList 与 FM 两种模式的取值来源；写入时**同时改两处**的既有约定 |
| progress / volume | 3 | Loading 态 progress 恒为 0；volume clamp 到 0–1 |
| `_fetchAudioSource` | 4 | 126.net 的 http→https；非 126.net 不动；两条失败路径 |
| 队列编辑 | 6 | `addToNextPlay` / `addToFirstPlay` 的插入位置与去重 |

**结果**：web 包测试从 `3 文件 / 25 用例` → `4 文件 / 50 用例`，全绿；`test:types` 仍 0 error。

**反向验证已做**：把 `RepeatMode.Off` 的 `return this._trackIndex + 1` 改成 `return this._trackIndex`，测试立刻 3 处失败（含 `addToNextPlay` 的连带影响），还原后恢复全绿。**说明这组测试真的能抓到回归，不是摆设。**

### 9a. 三个开放问题（测出来了，但不擅自改）

#### ① Shuffle 模式没有在队列推进里处理

`_nextTrackIndex` / `_prevTrackIndex` 的 `switch` 只写了 `Off` / `On` / `One`，`RepeatMode.Shuffle` 和 `RepeatMode.ShuffleOff` 落空 → 返回 `undefined`。

但 UI 侧的 shuffle 按钮（`web/components/PlayingNext.tsx:96`）只调用 `shufflePlayList()`，**并不设 `repeatMode`**；只有 IPC 的 `Repeat` 通道（`web/ipcRenderer.ts:57-62`）会在收到 Shuffle 时调 `shufflePlayList()`。

**两条路径不一致**：如果 `repeatMode` 真的被设成 `Shuffle`，`nextTrack()` 会走「没有下一首了 + 暂停」分支。需要人工确认哪个是意图：是"shuffle 只重排列表、repeatMode 保持 Off/On/One"，还是"repeatMode 应该设成 Shuffle、队列推进需要补 case"。

现状已被测试锁定（`Shuffle / ShuffleOff 未被 switch 处理，返回 undefined`），改之前先看那条用例。

#### ② `addToNextPlay` 在最后一首时会插到队首

```ts
// player.ts:566 / :569
this.trackList.splice(Number(this._nextTrackIndex), 0, trackID)
```

列表末位时 `_nextTrackIndex` 是 `undefined`，`Number(undefined)` 为 `NaN`，而 `splice(NaN, 0, x)` 等价于插到下标 0 —— **"下一首播放"变成了"置顶播放"**。

期望行为大概是追加到末尾。已有用例锁住现状（`addToNextPlay 在最后一首时被插到队首`），修的时候让它先失败。

#### ③ `_fetchAudioSource` 两条失败路径返回不同 falsy 值

- 接口无数据 → `{ audio: undefined }`
- 接口抛错 → `{ audio: null }`

调用方统一用 `if (!audio)` 判断（`player.ts:343`），所以目前无影响。但**任何改成 `audio === null` 的判断都会漏掉前者**。两条路径都已锁定。

### 9b. 还没测的部分（下一批候选）

`player.ts` 还剩这些高风险但耦合较深、需要先做接缝的区域：

- `_playTrack` / `_playAudio`：依赖 `fetchTracksWithReactQuery` + Howler 实例，需要把"取元数据 → 取流 → 播放"三段拆开才能单测
- `_scrobble` 的阈值判定（`progress > dt/1000/3`）——逻辑可测，但要伪造 `track.dt` 与 `trackListSource`
- `nextTrack()` 的完整副作用链（`_setStateToLoading` → `_scrobble` → `pause` → `_playTrack`）
- `shufflePlayList()`：依赖 `lodash.random`，需要固定随机源才能断言洗牌结果；当前只断言了"能来回切换"
