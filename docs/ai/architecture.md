# 架构地图 — R3PLAYX (music)

> 生成：2026-11-25，只读测绘，未改动任何源码。
> **覆盖范围**：monorepo 结构、三条核心链路、依赖热点。**未覆盖**：UI 组件逐层结构、i18n 细节、electron-builder 打包参数、GitHub Actions 工作流细节。
> **技术栈事实一律以各 `packages/*/package.json` 为准**，根 `CLAUDE.md` 的版本信息已过时（见 `backlog.md` 第 1 条）。

## 1. 目录地图

| 路径 | 职责 | 层 | 备注 |
|---|---|---|---|
| `packages/desktop/` | Electron 主进程 + preload + **内嵌本地 Fastify 服务** | 宿主 | 73 个源文件；`main/index.ts` 入口 |
| `packages/desktop/main/appServer/` | 本地 HTTP 服务（端口 42710），代理外部 API + 音频缓存路由 | 服务 | 与 `packages/server` **同构双实现**，不是同一份代码 |
| `packages/web/` | React UI（**同时**服务桌面与独立 Web 两种形态） | 前端 | 302 个源文件，47 个组件、10 个页面域 |
| `packages/web/api/hooks/` | React Query hooks，24 个文件 | 数据层 | 服务端状态唯一入口 |
| `packages/web/states/` | Valtio 客户端状态（6 个文件） | 状态层 | `player.ts` 是核心 |
| `packages/server/` | 独立后端（端口 35530，Fastify 5 + Prisma 6） | 服务 | 29 个源文件；无测试 |
| `packages/shared/` | **共享类型契约目录，不是 workspace 包**（无 `package.json`） | 契约 | 靠 tsconfig `paths` 的 `@/*` 引用，见第 4 节 |
| `tmp/` | better-sqlite3 二进制 + Electron userData | 生成物 | 722 个文件，已 gitignore |
| `.zread/wiki/` | **旧工具生成的文档快照** | 历史 | 事实不可信，只可参考目录结构 |
| `.qoder/repowiki/` | Qoder Repo Wiki 生成规划 | 历史 | 只有 `wiki_plan.yaml`，未见生成产物 |

## 2. 三种运行形态

同一份 `packages/web` 代码，三种跑法，**差别只在"`/netease` 这个相对路径最终落到谁"**：

| 形态 | 前端 | `/netease` 落到 | 持久化 |
|---|---|---|---|
| 桌面（Electron 43） | 由本地 Fastify 静态托管 | 同源 → 本地 Fastify（42710）→ 代理外部 | better-sqlite3 直连 |
| Web 独立部署 | Vite 构建产物 | 同源 → 需部署侧反代到 server(35530) | Prisma 6 |
| 开发 | Vite dev server（42710） | Vite proxy → `127.0.0.1:30001` | 视形态 |

**关键**：前端永远用相对路径 `/netease`，从不写绝对主机。见 `packages/web/utils/request.ts:13-15`——DEV 恒为 `/netease`，生产取 `VITE_APP_NETEASE_API_URL ?? '/netease'`。

开发态代理在 `packages/web/vite.config.ts:104-113`，有个容易被误解的分支：非 Electron 模式会 **rewrite 去掉 `/netease` 前缀**（`:108`），Electron 模式保留。改代理规则前先确认这条分支。

## 3. 三条核心链路

### A. 播放一首歌（最高频，也最复杂）

```
TrackList 点击
  → player.trackID = id              (web/states/player.ts，Valtio)
  → _playTrack()                     (web/utils/player.ts:321)
     → _fetchTrack() 取元数据
     → _updateMediaSessionMetaData()  系统媒体面板
  → _playAudio()                     (player.ts:339)
     → _fetchAudioSource()           (player.ts:297)
        → fetchAudioSourceWithReactQuery (api/hooks/useTracks.ts:100)
        → axios request，baseURL="/netease"，timeout 50s (utils/request.ts:17-21)
        → 拿到 response.data[0].url；126.net 的 http 强升 https (player.ts:303-305)
     → _playAudioViaHowler()         (player.ts:352)
        → URL 追加 ?dash-id=<trackID>，Howler 播放
  → 进度 loop（utils/audioTime.ts）读 _howler.seek()
     桌面端经 IPC SyncProgress 把进度推给歌词窗
  → 缓存：_cacheAudio()              (player.ts:410)
       纯 Web（无 window.ipcRenderer）直接 return
       桌面端走 IPC cacheAudio → 主进程写盘
       回放读取走本地路由 /netease/audio (appServer/routes/netease/audio.ts:147/261/270)
```

失败分支：拿不到 url → toast「无法播放此歌曲」+ 自动 `nextTrack()`（`player.ts:343-347`）。

**要点**：播放是"取地址"和"放音频"两段，中间由 Howler 承接；缓存只在桌面端生效，这一段是近期安全修复动过的地方（见 `backlog.md` 第 5 条）。

### B. 桌面端控制面（IPC）

```
托盘 / 全局快捷键 / Touch Bar / 未来 MPRIS
  → 主进程
  → webview 的 ipcRenderer.on(channel)   (web/ipcRenderer.ts:15+)
  → 改 Valtio 状态（player / settings / uiStates）
  → UI 自动响应
反向：UI 操作 → window.ipcRenderer.send → main/ipcMain.ts 分发
```

契约在 `packages/shared/IpcChannels.ts`，**39 个通道，三处必须同步**：`IpcChannels` 枚举（:5-46）、`IpcChannelsParams`（:49-118）、`IpcChannelsReturns`（:121-172）。漏一处，类型不会报错但运行时静默失效。

### C. 独立 server 请求

```
页面组件 → React Query hook (web/api/hooks/*)
  → axios /netease/*
  → server/src/app.ts 自动加载 routes/netease/*
  → 外部 NetEase API / @unblockneteasemusic（绕区域限制）
  → 持久化走 Prisma（plugins/prismaPlugin.ts）
```

## 4. `shared` 的真实身份（容易误判）

`packages/shared/` **没有 `package.json`，不是 workspace 包**。它通过 `packages/web/tsconfig.json` 的 `paths: { "@/*": ["./*"] }`（baseUrl 为 `packages/`）被引用，所以 `@/shared/...` 和 `@/web/...` 都只是路径别名。

由此推出两条约定：

1. **`shared` 没有构建步骤**，根 `CLAUDE.md` 里"build order: shared → server/web → desktop"的说法不准确；`turbo.json` 里也没有 shared 的 task。
2. **`shared/interface.d.ts` 是全局 ambient 文件**（全文 0 个 `export`），所以其中的 `Track`/`Album`/`KeyboardShortcutSettings` 等类型**全局可用、无需 import**。`IpcChannels.ts:116` 直接用 `KeyboardShortcutSettings` 而不 import，就是靠这个机制。

## 5. 依赖热点（改之前先看这里）

| 文件 | 行数 | 角色 | 改动风险 |
|---|---|---|---|
| `web/utils/player.ts` | 772 | 播放状态机 + 取流 + 缓存 | **最高**。几乎所有播放行为都过它，且无单测 |
| `web/pages/Lyrics/Lyrics.tsx` | 512 | 歌词页 | 高，与播放进度强耦合 |
| `web/components/CoverRowVirtual.tsx` | 510 | 虚拟滚动 | 高，性能参数敏感（viewport/overscan 有调优注释） |
| `web/pages/Search/Search.tsx` | 488 | 搜索页 | 中 |
| `desktop/main/ipcMain.ts` | 393 | IPC 分发 | 高，41 个通道的汇聚点 |
| `server/src/utils/cache.ts` | 350 | 服务端缓存 | 中，与 Prisma 生命周期相关 |
| `desktop/main/cache.ts` | 349 | 桌面缓存 | 中，涉及写盘与清理 |
| `shared/interface.d.ts` | 273 | 全局类型 | **高**：改它影响所有包，且没有编译期边界 |
| `shared/IpcChannels.ts` | 172 | IPC 契约 | **高**：三处同步，漏一处就静默失效 |

## 6. 双实现对照（改一处必须问另一处）

`desktop/main/appServer/routes/` 与 `server/src/routes/` 结构同构，但**不是共享代码**：

| 能力 | 桌面 | 独立服务端 |
|---|---|---|
| NetEase 代理 | `routes/netease/netease.ts`（动态注册 `/netease/${name}`） | `routes/netease/netease.ts` |
| 音频 / 缓存 | `routes/netease/audio.ts`（304 行，含缓存路由） | `routes/netease/audio.ts`（280 行） |
| 解锁区域限制 | `routes/netease/unblock.ts` | `routes/netease/unblock.ts` |
| Apple Music | `routes/apple_music/appleMusic.ts`（prefix `/r3playx/apple-music`） | `routes/apple-music/*` |
| 持久化 | better-sqlite3（`main/db.ts`） | Prisma 6（`prismaPlugin.ts`） |

**规则**：动了其中一个的接口形状，另一个大概率要跟着改。这是本项目最容易漏的地方。
