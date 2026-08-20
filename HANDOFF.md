# dsh-mnemon v0.3.0 可组合记忆内核 Handoff

更新时间：2026-08-20

本文面向接手当前功能分支的维护者或 Agent。它记录本次架构落地的目标、代码位置、兼容边界、验证证据、已知技术债和建议的下一步，不替代正式用户文档。

## 1. 当前状态

| 项目 | 值 |
|---|---|
| 分支 | `codex/composable-memory-kernel` |
| 远端 | `origin/codex/composable-memory-kernel` |
| 基线 | `origin/main@8cefff7` |
| 实现收口提交 | `d40abcc` |
| 目标版本 | `0.3.0` |
| PR 入口 | <https://github.com/omdsh-dev/dsh-mnemon/pull/new/codex/composable-memory-kernel> |
| 数据迁移 | 无 |
| npm 发布 | 未执行 |

该分支已经推送并跟踪远端。实现收口时工作树干净，`origin/main` 是当前分支祖先，没有待解决冲突。

实现提交按顺序为：

1. `9809d0c feat: introduce composable memory kernel`
2. `a2c8f76 feat: enforce memory topology across surfaces`
3. `5dfde35 feat: split composable memory SDK workspaces`
4. `ae151a4 fix: reconcile live memory extension generations`
5. `d40abcc docs: prepare composable memory v0.3.0`

## 2. 目标与核心决策

本次工作的目标不是简单拆目录，而是把 dsh-mnemon 从“写死的三层产品”提升为“以三层为默认拓扑的可组合记忆控制平面”。

核心决策如下：

- 用户继续只安装一个 `dsh-mnemon`，安装、升级和回退保持原子性。
- 源码按职责拆为 private workspace，通过 `dsh-mnemon/*` 子路径公开稳定接口。
- Runtime、Documents、Memory Spaces 是默认 Layer，不再是每个入口里的硬编码特例。
- Adapter 描述具体数据面；Strategy 只提出步骤；Guard 只能拒绝；Surface 负责 DSH 工具、命令、RPC 和 WebUI。
- `default-three-tier` 表达原有三层调度行为，保证默认用户体验兼容。
- 关闭 Layer 是路由状态，不是数据操作；不会删除、迁移或隐藏控制面元数据。
- 每层分别控制 `recall`、`write`、`projection`、`maintenance`。
- `manual` 仅允许用户/控制面显式操作；模型工具、生命周期和系统调度均属于 `automatic` trigger。
- 每次操作固定 Catalog、Topology 和 Guard generation；任何一代变化都会使旧 Plan 失效。
- Cordis isolate 用于时空作用域、所有权和卸载，不被视为不可信代码沙箱。
- 模型生成 Strategy 的近期边界是 manifest、权限约束和 replay，不自动执行刚生成的代码。

## 3. 架构落点

### 3.1 Workspace 与公共导出

| Workspace | 公共入口 | 职责 |
|---|---|---|
| `packages/contracts` | `dsh-mnemon/contracts` | JSON-safe descriptor、Topology、Plan、Receipt、Guard 类型 |
| `packages/kernel` | `dsh-mnemon/kernel` | Catalog、Topology Manager、Kernel、Guard、执行与回执 |
| `packages/layer-runtime` | `dsh-mnemon/layers/runtime` | Runtime Layer 描述符与注册 helper |
| `packages/layer-documents` | `dsh-mnemon/layers/documents` | Documents Layer 描述符与注册 helper |
| `packages/layer-memory-spaces` | `dsh-mnemon/layers/memory-spaces` | Memory Spaces Layer 描述符与注册 helper |
| `packages/strategy-default-three-tier` | `dsh-mnemon/strategy-default-three-tier` | 默认拓扑与兼容 Strategy |
| `packages/strategy-sdk` | `dsh-mnemon/strategy-sdk` | Strategy 定义、manifest 权限和 replay |
| `packages/provider-sdk` | `dsh-mnemon/provider-sdk` | 通用 Adapter Factory Registry |
| `packages/extension-sdk` | `dsh-mnemon/extension-sdk` | Host 全局扩展注册和运行图 attachment |

内部 workspace 都是 `private`。不要把 `@dsh-mnemon/*` 当成可发布依赖；第三方只能从根包子路径导入。

### 3.2 Kernel 流程

```text
Layer / Adapter / Strategy contributions
                 |
                 v
         MemoryCatalog (generation)
                 |
                 v
       MemoryTopology (generation)
                 |
request -> Guards -> Strategy proposal
                         |
                         v
              authoritative validation
                         |
                         v
                 MemoryPlan
                         |
                         v
               Layer executor(s)
                         |
                         v
                MemoryReceipt
```

关键性质：

- Strategy 没有数据面句柄，只能返回 JSON-safe proposal。
- Kernel 在 Strategy 之后重新检查 Layer、Capability、Adapter binding、参与模式和预算。
- Strategy 返回零步骤时失败关闭。
- 回执状态为 `succeeded`、`partial`、`failed` 或 `cancelled`。
- Plan 与 Receipt 都记录 Catalog、Topology、Guard generation。
- Catalog、Topology 或 Guard 集合变化后，`execute()` 会拒绝旧 Plan。

主要实现：

- `packages/kernel/src/catalog.ts`
- `packages/kernel/src/topology.ts`
- `packages/kernel/src/access.ts`
- `packages/kernel/src/kernel.ts`
- `packages/contracts/src/index.ts`

### 3.3 Extension Host 与 Cordis 生命周期

根 Host 发布：

```ts
export const provide = ['mnemonMemory']
```

服务实例为 `MemoryExtensionHost`。扩展可在 dsh-mnemon 挂载前通过全局 registry 预注册，也可以在运行中通过 Cordis 服务注册。

每个 global/workspace 运行图有独立的 Catalog、Topology 和 Kernel，但共享同一组 Host extension contributions。设置变更会先完整构造候选运行图，通过验证后才原子交换稳定代理。

热注册行为：

- 新 Layer 进入 Catalog 后，Topology 自动产生新 generation。
- 未被用户配置的新 Layer 以 `enabled=false`、四通道 `manual` 加入。
- 卸载 Layer 会将它移出当前候选拓扑。
- Adapter 卸载会过滤对应 binding。
- Strategy 缺失时不会静默切换策略；后续计划失败关闭。
- 退役运行图停止接收扩展更新，但保留固定组件，允许已经 pin 的调用结束。

主要实现：

- `packages/extension-sdk/src/index.ts`
- `src/index.ts`
- `src/live-runtime.ts`

### 3.4 Provider 解耦

`MnemonService` 不再直接构造全部 Provider，而是从 `MemoryProviderAdapterRegistry` 得到 Adapter map。内置 Provider Factory 位于 `src/providers/registry.ts`，通用 registry 位于 `packages/provider-sdk`。

需要注意：当前 Factory seam 解耦了九个内置 Provider 的构造，但完整的动态 Memory Space Provider Catalog 尚未泛化。只注册 Factory 不会自动增加 Provider 设置卡、连接 schema、凭据规则或持久 registry 类型。

任意新引擎当前可以作为独立 Layer/Adapter 接入。若要成为 Memory Spaces 页面中的一等 Provider，下一阶段需将 Provider descriptor、配置 schema、secret redaction、discovery 和 Factory 一起动态注册。

### 3.5 描述符驱动配置与 UI

新增配置根：

```yaml
mnemon:
  memoryTopology:
    id: default-three-tier
    strategyId: default-three-tier
    layers:
      runtime:
        enabled: true
        participation:
          recall: automatic
          write: automatic
          projection: automatic
          maintenance: automatic
        adapterIds: []
```

默认三层全部启用且四通道均为 `automatic`，与旧行为一致。

WebUI 通过 `/dsh-mnemon-read` 的 `memory-system` endpoint 获取实时 Catalog/Topology descriptor，按 descriptor 渲染 Layer 卡片。配置保存提交整份 topology，候选运行图验证失败时不会影响当前运行代。

模型工具使用 `automatic` gate；人工 RPC 使用 `manual` gate；Runtime prompt projection 受 `projection` gate 控制。Catalog/status 等控制面仍可观察已关闭 Layer。

主要实现：

- `src/config.ts`
- `src/shared/contracts.ts`
- `src/rpc.ts`
- `src/tools.ts`
- `src/guidance.ts`
- `src/lifecycle.ts`
- `src/client/MnemonSettingsCard.tsx`
- `src/client/api.ts`

## 4. 兼容性与数据安全

从 v0.2.13 升级到该分支不需要数据迁移。以下格式均未改变：

- Runtime JSON 与 Markdown projection
- Documents index 与正文
- Memory Space registry
- Provider service registry
- Mnemon Native Store / SQLite
- 远程 Provider 数据

没有 `memoryTopology` 配置时会得到默认三层拓扑。`enabled=false` 不触碰已有数据，重新启用继续使用原位置。

回退到 v0.2.13 前建议备份，并从 YAML 移除扩展专用 Layer/Strategy 配置。由于持久数据格式未改变，不需要反向数据迁移。

安全边界：

- Provider secret 不应进入 descriptor、Strategy 或模型上下文。
- Contracts 边界只允许 JSON-safe 值。
- Strategy permission manifest 不是沙箱；恶意同进程 JavaScript 仍然拥有插件进程权限。
- Guard 应保持无副作用，只做 allow/deny。
- 扩展只能来自受信任来源。
- 当前没有确定性 secret scanner。

## 5. 验证证据

实现收口时已完成：

| 检查 | 结果 |
|---|---|
| TypeScript | 通过 |
| Vitest | 42 个文件通过、1 个 Windows 文件跳过；394 项通过、1 项跳过 |
| 确定性构建 | 98 个生成文件两次 hash 一致 |
| 公共入口 | 10 个 Node-compatible 子路径导入通过；Client 按浏览器 wrapper 验证 |
| Headless | 隔离 profile 激活成功；模型请求看到 35 个工具和 5 个代表性 Mnemon 工具 |
| 发布包 | 105 个文件，约 1.53 MB unpacked |
| 包规范 | `publint --strict` 与 attw ESM profile 通过 |
| 文档 | 62 个 Markdown 文件本地链接通过，29 对双语文件镜像一致 |

重跑命令：

```sh
./node_modules/.bin/tsc -p tsconfig.json --noEmit
./node_modules/.bin/vitest run
npm run verify:build
node scripts/verify-headless-profile.mjs
node scripts/verify-package-contents.mjs
./node_modules/.bin/publint --strict
./node_modules/.bin/attw --pack . --profile esm-only --quiet
```

已知验证环境说明：

- DSH rc.8 UI primitives 缺失 `index.js.map`，Vitest/Vite 会打印开发期 source-map 警告，但测试、类型、构建和运行不受影响。
- 当前机器的 `pnpm` 是 `npx --yes pnpm@11` wrapper。统一 `pnpm verify` 曾被 pnpm 11 `minimumReleaseAge` 供应链策略阻挡，因为 DSH rc.8 包发布时间过新；上表各阶段已使用本地 binary / npm script 分别执行。

## 6. 重要测试

- `tests/memory-system.spec.ts`：Catalog/Topology generation、参与模式、Guard、Plan/Receipt、stale plan。
- `tests/extension-sdk.spec.ts`：扩展 attachment/disposal、Guard 生命周期、Strategy manifest/replay。
- `tests/live-runtime.spec.ts`：运行图组合、扩展发现、热注册/卸载、workspace 路由。
- `tests/provider-registry.spec.ts`：Factory 注册、重复 ID 和 Provider 构造。
- `tests/rpc.spec.ts`：`memory-system` descriptor 与手动 gate。
- `tests/client-settings.spec.tsx`：描述符驱动 Layer UI 和原子设置保存。
- `tests/guidance.spec.ts`、`tests/subagent.spec.ts`：projection 与模型工具 automatic gate。

## 7. 已知边界与技术债

以下不是本次回归，而是需要下一阶段明确处理的边界：

### 7.1 兼容 controller 尚未全部进入 Kernel Execute

现有工具/RPC/controller 数据面已经受 Layer participation gate 控制，但并非每条旧路径都通过 `MemoryKernel.run()` 生成持久 Plan/Receipt。因此：

- 新 SDK executor 路径具备完整 Plan/Receipt/Guard 语义；
- 兼容路径主要使用 `assertParticipation()`；
- extension Guard 不应被误认为已经覆盖所有旧 controller 内部调用；
- 下一步应逐操作迁移到统一 authorize/plan/execute/receipt，并配置持久 `MemoryReceiptSink`。

这是合并前最值得进行架构评审的点。如果产品要求“所有既有数据面操作都必须留下 Receipt”，需在发布 v0.3.0 前继续迁移，而不是只改文档表述。

### 7.2 动态 Provider Catalog 尚未完成

Provider Factory 已解耦，但 `MemoryProviderId`、设置字段、持久 registry 和 WebUI 仍以九个内置 Provider Catalog 为事实源。建议下一阶段设计一个 wire-safe Provider plugin descriptor，并考虑 schema 版本、secret field、连接迁移和 UI renderer 白名单。

### 7.3 模型生成 Strategy 只有安全原语

当前已提供：

- `MemoryStrategyPlugin` manifest
- Layer/Adapter/Capability/maxSteps 权限
- immutable wrapper
- deterministic replay helper
- Kernel 二次校验

尚未提供：

- 生成制品存储
- 静态扫描/签名
- shadow 对比
- canary 流量
- 指标评估
- 自动晋级/回滚

不要在补齐这些环节前自动 `import()` 模型刚生成的源码。

### 7.4 UI 视觉素材仍主要来自 v0.2.0

文字文档已更新 Layer 拓扑行为，但 README/UI guide 中的实机截图与演示素材仍主要是 v0.2.0 画面。发布 v0.3.0 前建议在隔离 Web profile 重新拍摄设置页和状态页，确认没有凭据或私有数据后替换对应素材。

## 8. 建议下一步

### 合并前

1. 由维护者确认 `0.3.0` 版本号和新增公共子路径命名。
2. 重点评审 contracts 的 semver 承诺、Strategy manifest 的 `v1alpha1` 定位和 Guard 覆盖范围。
3. 在真实 DSH Web profile 验证 Layer 开关、四个参与模式、设置热切换和扩展热卸载。
4. 决定是否要求所有兼容 controller 在 v0.3.0 前进入持久 Plan/Receipt。
5. 更新 v0.3.0 设置页/状态页截图。
6. 创建 PR，并把本文“已知边界”转成 review checklist 或 issue。

### 合并后、发布前

1. 重新同步 `main`，解决冲突后运行完整验证矩阵。
2. 使用干净 checkout 执行 frozen install；如果 `minimumReleaseAge` 仍阻挡，等待策略窗口，不要降低供应链策略。
3. 打包后再次运行 publint、attw 和隔离安装。
4. 在临时 global/workspace/custom root 做升级与回退演练。
5. 确认 npm tarball 只包含 `package.json#files` 声明内容。
6. 只有在 tag、`package.json` 和发布说明一致后才发布。

### 后续架构优先级

1. 全路径 Kernel 化和持久 Receipt journal。
2. 动态 Provider descriptor/config schema registry。
3. Strategy shadow/canary/signing/rollback pipeline。
4. 真实 WebUI E2E 与 Cordis 热装卸契约测试。
5. 可恢复调度、幂等 checkpoint 和 secret scanner。

## 9. 正式文档入口

- 中文架构：`docs/zh-CN/architecture.md`
- 中文扩展指南：`docs/zh-CN/extensions.md`
- 中文配置：`docs/zh-CN/configuration.md`
- 中文接口：`docs/zh-CN/interfaces.md`
- 中文发布说明：`docs/zh-CN/releases/v0.3.0.md`
- English architecture: `docs/en/architecture.md`
- English extension guide: `docs/en/extensions.md`
- English release notes: `docs/en/releases/v0.3.0.md`

## 10. 接手者快速检查

```sh
git switch codex/composable-memory-kernel
git fetch origin main
git status --short --branch
git log --oneline origin/main..HEAD
git diff --stat origin/main...HEAD
./node_modules/.bin/tsc -p tsconfig.json --noEmit
./node_modules/.bin/vitest run tests/memory-system.spec.ts tests/extension-sdk.spec.ts tests/live-runtime.spec.ts
```

如果这些检查通过，先阅读第 7 节再决定继续迁移 controller、开 PR，或进入真实 WebUI 验证。
