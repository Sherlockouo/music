# 隐性约定 — R3PLAYX (music)

> 生成：2026-11-25，只读测绘。每条尽量给真实文件作为例证；带「推断」的条目未经运行验证。

## 1. 类型与契约

| 约定 | 说明 | 例证 |
|---|---|---|
| **IPC 契约三处同步** | 新增通道必须同时改 `IpcChannels` 枚举、`IpcChannelsParams`（入参）、`IpcChannelsReturns`（返回）。少一处不报错，但运行时不工作 | `packages/shared/IpcChannels.ts:5-46 / :49-118 / :121-172` |
| **`interface.d.ts` 是全局 ambient** | 该文件 0 个 `export`，其中类型全局可见，禁止加 `export`（会把整个项目类型体系打断） | `packages/shared/interface.d.ts:267 declare interface KeyboardShortcutSettings` |
| **`@/xxx` 指向 `packages/`** | `@/shared/x` = `packages/shared/x`，`@/web/x` = `packages/web/x`。不是 npm 包，别写 `import from 'shared'` | `packages/web/tsconfig.json` paths + `vite.config.ts:29-32` |
| **`const enum`** | `IpcChannels` 用 `const enum`，而 web 的 tsconfig 开了 `isolatedModules`。「推断」跨包内联行为依赖打包器（swc/esbuild），改构建工具时要留意 | `IpcChannels.ts:5` + `web/tsconfig.json` |

## 2. 网络与端口

| 约定 | 说明 | 例证 |
|---|---|---|
| **前端只用相对路径 `/netease`** | 从不写绝对主机，桌面/Web/开发三种形态靠同源或反代区分 | `web/utils/request.ts:13-15` |
| **端口分配** | 桌面本地服务 `42710`、开发态 NetEase API `30001`、独立 server `35530` | `.env.example`、`desktop/main/appServer/appServer.ts:37` |
| **开发态代理会 rewrite** | 非 Electron 模式去掉 `/netease` 前缀，Electron 模式保留——改代理前必须看清这条分支 | `web/vite.config.ts:104-113`（尤其 `:108`） |
| **axios 默认 50s 超时** | 单个请求可用 `{ timeout }` 覆盖；`signal` 会透传给 axios | `web/utils/request.ts:17-21`、注释 `:43-46` |

## 3. 状态管理

| 约定 | 说明 | 例证 |
|---|---|---|
| **服务端状态归 React Query，客户端状态归 Valtio** | 不要在 Valtio 里存接口返回的列表；也不要用 query 缓存存 UI 开关 | `web/states/` 6 个文件；`web/api/hooks/` 24 个 hook |
| **需要跨刷新保留的状态放 `persisted*`** | `player.ts`、`settings.ts`、`persistedUiStates.ts`、`scrollPositions.ts` 会落 localStorage；`uiStates.ts`、`contextMenus.ts` 不落盘 | `web/states/` |
| **播放状态是单一真源** | 任何组件读播放状态都走 `web/states/player.ts`，不要各自维护进度 | `player.ts`（772 行） |

## 4. 依赖与构建（改依赖前必读）

`pnpm-workspace.yaml` 里有三条硬约束，全部带注释说明，**动依赖前先读它**：

| 约束 | 原因 |
|---|---|
| `nodeLinker: hoisted` | electron-builder 打包时从根 `node_modules` 收集 production 依赖，符号链接布局会漏包 |
| `neverBuiltDependencies: better-sqlite3` | 禁止安装期构建。桌面端由 `scripts/build.sqlite3.ts` 产出 Electron ABI 二进制到 `tmp/bin`；server 端由 `packages/server/scripts/install-sqlite3.js` 取 Node ABI 绑定 |
| `onlyBuiltDependencies` 白名单 | pnpm 新版本要求显式允许安装脚本；`pnpm approve-builds` 是交互式的，CI 里跑不了，所以写死在这里 |

其他：

- `engines.node >= 22.12`，`packageManager: pnpm@8.6.12`（根 `package.json`）。**当前机器 Node v22.22.2、pnpm 8.6.12，匹配**。
- Turborepo 2.x，`turbo.json` 里几乎所有 task 都 `cache: false`——别指望缓存加速。
- **两套锁文件并存**：`pnpm-lock.yaml`（在用）+ `package-lock.json`（96KB，疑似遗留）。改依赖时只更新 pnpm 那份。

## 5. 测试

| 约定 | 说明 |
|---|---|
| 测试框架 **Vitest**，但版本跨包不一致 | `web` 用 `vitest ^4.1.10`，`desktop` 用 `vitest ^0.26.3`（差 4 个大版本，见 backlog 第 3 条） |
| 测试文件位置 | 各包 `test/` 目录，命名 `*.test.ts` |
| `server` 包**没有 test 脚本** | 不要在 server 里假设 `pnpm test` 可用 |
| 类型检查命令 | `pnpm test:types --filter <包名>`（web / desktop 都有） |
| 现有守护性测试 | `desktop/test/loopbackHostCheck.test.ts`、`web/test/utils/sanitizeHtml.test.ts` —— 对应近期安全修复，改相关逻辑必须让它们保持绿 |

## 6. 代码风格

- ESLint 根配置（`@typescript-eslint` 6.x + react 插件），Prettier 3.x + `prettier-plugin-tailwindcss`。
- TypeScript 5.9，web 包 `strict: true`。
- 路径别名 `@/` 优先，不写长串相对路径（`../../..`）。
- 组件目录 47 个，页面按域分目录（`pages/<域>/`），路由集中在 `web/components/Router.tsx`。
- **「推断」路由库已升级到 `react-router-dom ^7`**，但 `CLAUDE.md` 仍写 HashRouter 时代的描述，涉及 v7 API 变更时以实际类型为准。

## 7. 文档

- 根 `CLAUDE.md` 是给 agent 的常驻上下文，但**版本信息已全线过时**（见 backlog 第 1 条）。改完代码顺手更新它，否则它会持续误导。
- `.zread/wiki/` 是旧工具快照，**事实不可信**，只可参考目录结构。
- `.qoder/repowiki/wiki_plan.yaml` 里的 `notes` 明确写了"技术栈事实以各 `packages/*/package.json` 为准"，这条要遵守。
