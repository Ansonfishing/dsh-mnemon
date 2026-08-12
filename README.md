# dsh-mnemon

> **LLM-supervised 4-graph persistent memory for AI agents.**

DeepSeek Harness（DSH）的 Mnemon 外置记忆插件。它把 [Mnemon](https://github.com/mnemon-dev/mnemon) 接入 DSH，并在 Mnemon 原生命名 Store 之上提供“记忆体”模型：每个记忆体都有稳定的 `id`、名称、路由说明、激活状态和独立 `.db`，DSH 记忆子 Agent 负责跨记忆体选择、召回、查重与写入。

主 Agent 不需要接收完整目录、原始检索过程或写回推理。插件在 DSH 的正式生命周期扩展点中创建有界的 `spawn` 子 Agent，只把精简证据或结构化回执交还主上下文；存储、四图索引、衰减和去重仍由本地 Mnemon CLI 确定性执行。

## 记忆体模型

一个 Mnemon `.db` 对应一个隔离的记忆体数据面，`dsh-mnemon` 为它补充可维护的目录元数据：

```text
<dataDir>/
└── data/
    ├── .dsh-memory-bodies.json       # id / name / description / active
    ├── project/
    │   └── mnemon.db                 # project 记忆体
    ├── preferences/
    │   └── mnemon.db                 # preferences 记忆体
    └── research/
        └── mnemon.db                 # research 记忆体
```

- **读边界**：语义召回只能读取已激活记忆体；子 Agent 根据名称和 description 选择一个或多个目标，也可以有意执行跨记忆体召回。
- **写边界**：写入可选择任意记忆体；向未激活记忆体写入后会自动激活。
- **新建**：只有稳定知识形成独立、反复使用且现有目录无法容纳的范围时，写入子 Agent 才应创建新记忆体。
- **合并**：子 Agent 可将来源记忆体导入目标记忆体；这是非破坏性合并，来源 `.db` 不会被删除。
- **兼容迁移**：插件会发现既有 `<dataDir>/data/<store>/mnemon.db` 并登记到目录，不移动或重建数据库。
- **人工控制**：“记忆体”总览提供激活开关和空白记忆体创建入口；开关只改变读取范围。

## DSH 原生监督架构

| 阶段 | DSH 扩展点 | 记忆子 Agent 的职责 | 主 Agent 得到什么 |
|---|---|---|---|
| 每轮开始 | `agent/pre-step` | 只注入一句按需召回提醒，不读取目录、不执行 recall | 主模型自行判断是否调用 `mnemon_recall` |
| 显式工具/命令 | `ctx.subagents.start('spawn', …)` | 在受限 Mnemon 工具集合内完成一次语义操作 | 结构化召回结果或写入回执 |
| 任务结束 | `agent/turn-stopping` | 检查当前 turn 的有界事件窗口，判断是否值得沉淀并完成副作用 | 不追加长解释，不强制主 Agent 再跑一步 |
| WebUI 沉淀 | 写 RPC → `spawn` | 选择记忆体、查重、提炼、写入，必要时创建或合并 | 可审计的 action、目标记忆体和摘要 |

`spawn` 子 Agent 使用全新的隔离上下文，并通过 persona、工具白名单、结构化输出和 `maxDepth: 1` 限制职责。根 Agent 调用 `mnemon_recall` / `mnemon_remember` 等工具时会先进入子 Agent；同名工具在记忆子 Agent 内才直接访问 MnemonService，因此不会递归委派。

Prime 只初始化路由状态；pre-step 提示保持为一句短语，不注入目录、计数或记忆内容。主模型决定需要持久上下文时才调用 `mnemon_recall`，随后根工具用隔离子 Agent 选择记忆体并返回可复核证据。当前用户指令与仓库事实始终高于历史记忆。

## 能力

### 模型工具

- `mnemon_memory_bodies`：读取全局记忆体目录、激活状态和统计；
- `mnemon_recall`：从一个或多个激活记忆体执行图增强、关键词或基础召回；
- `mnemon_related`：沿 temporal / semantic / causal / entity 边遍历关联记忆；
- `mnemon_remember`：选择记忆体并沉淀一条持久洞察；
- `mnemon_link`：在同一记忆体内建立类型化关系；
- `mnemon_forget`：按记忆体和精确 ID 软删除；
- `mnemon_memory_body_create` / `update` / `merge`：创建、维护或非破坏性合并记忆体；
- `mnemon_status`：查看 CLI、目录、聚合数据库和子 Agent 健康状态。

根 Agent 发起的语义召回和写操作全部由记忆子 Agent 处理。总览图、内容列表、状态读取和人工激活开关属于确定性管理操作，不消耗 LLM 上下文。

### 会话「记忆体」Tab

- 中文界面使用“记忆体”，英文界面使用更贴近独立持久上下文边界的 **Memory Space**；Tab 和所有功能文案跟随 DSH 全局语言设置即时切换。Mnemon 品牌名与官方 slogan 保持原文。
- 总览、检索、实体、沉淀、内容和状态采用上边缘二级导航，给实时图谱与内容列表保留完整横向空间。
- **总览**：管理全局记忆体目录和激活开关；每 15 秒聚合所有激活记忆体的四图快照；支持流畅力导向动画、节点拖拽、键盘微调、自然铺开、均匀重置和节点检查。
- **检索**：三种直连召回模式、分类过滤、跨记忆体来源标记、关联图查阅、复制 ID 和软删除确认；可选 Agent 查询先确定性召回，再由无 Mnemon 工具权限的隔离 Agent 只基于命中证据生成顶部答案。
- **实体**：列出高频实体，并由 MnemonService 直连聚合实体的跨图上下文，不启动 Recall Worker。
- **沉淀**：默认直接调度记忆子 Agent；人工高级选项可约束目标记忆体、分类、重要性、实体和标签，但不会绕过查重与监督。
- **内容**：无副作用浏览已激活记忆体，支持筛选、复制、基于旧内容新建和软删除。
- **状态**：只展示 Mnemon 引擎、记忆体目录、Recall/Write Worker、会话绑定、阶段计数和快速诊断，不在页面混入部署配置。

界面使用 DSH design token，跟随 DSH 全局明暗模式，不维护插件私有主题开关。WebUI 不直接启动进程、不接触数据库：Host 侧统一校验输入、控制超时并调用本地 `mnemon`。

### 命令与权限

`/mnemon status`、`recall`、`related`、`remember`、`forget` 注册到 DSH 命令面板。语义命令使用命令所在的 live Agent 作为记忆子 Agent 的 parent；状态读取是确定性的。

远程可信 Web 页面可读，本地记忆写 RPC 仅允许 loopback 页面。`writeEnabled: false` 会关闭模型写工具、写命令和 Web 写通道，召回、目录、状态与可视化仍可用。所有 CLI 调用都使用参数数组并禁用 shell。

## 安装

先安装 Mnemon。macOS 推荐官方 Homebrew Cask：

```sh
brew install --cask mnemon-dev/tap/mnemon
```

macOS / Linux 也可以通过 Go 安装：

```sh
go install github.com/mnemon-dev/mnemon@latest
```

确认命令可用：

```sh
mnemon --version
mnemon status
```

再安装 DSH 插件并重启 `dsh web`：

```sh
dsh plugin --profile web add "github:dsh-external/dsh-mnemon"
```

本地开发检出可使用：

```sh
dsh plugin --profile web add "link:/absolute/path/to/dsh-mnemon"
```

包内 `cordis.patch.yml` 会挂载 Host 插件、原生工具、命令、生命周期 hook、RPC 和会话「记忆体」Tab。DSH Web/base profile 需提供兼容的 `spawn` subagent provider。

## 配置

记忆体名称、description 和激活状态在「记忆体 → 总览」中维护。进程级连接与行为配置属于部署配置，可写入 `$DSH_HOME/settings.yaml` 的 `mnemon` 命名空间或 profile patch；修改后重启 DSH 生效。

```yaml
# ~/.dsh/settings.yaml
mnemon:
  cliPath: /opt/homebrew/bin/mnemon
  dataDir: ~/.mnemon
  timeoutMs: 10000
  defaultRecallLimit: 10
  routingGuidance: true
  lifecycleEnabled: true
  recallMode: guided
  writebackMode: guided
  tabEnabled: true
  writeEnabled: true
```

| 配置 | 默认值 | 说明 |
|---|---:|---|
| `cliPath` | 自动发现 | 显式配置 → `MNEMON_CLI_PATH` → `PATH` → 常见安装路径 |
| `dataDir` | Mnemon 默认 | 未设置时沿用 `MNEMON_DATA_DIR` 或 `~/.mnemon`；其 `data/` 是全局记忆体目录 |
| `store` | 未覆盖 | 仅作为首次建目录或发现旧 Store 时的兼容首选项；运行期语义操作由记忆体路由决定 |
| `timeoutMs` | `10000` | 单次 CLI 调用硬超时，范围 100–120000 ms |
| `defaultRecallLimit` | `10` | 工具和 Tab 的默认召回条数，范围 1–50 |
| `routingGuidance` | `true` | 向主 Agent 提供精简的记忆监督边界说明 |
| `lifecycleEnabled` | `true` | 启用 Prime 状态、pre-step 短提醒和 turn-stopping Write Worker |
| `recallMode` | `guided` | `guided` 注入按需召回短提醒；`off` 不注入提醒，仍保留显式工具调用 |
| `writebackMode` | `guided` | `guided` 在 turn 关闭前运行有界写回子 Agent；`off` 仅保留显式或 Tab 沉淀 |
| `tabEnabled` | `true` | 注册 Web `conversation.view`「记忆体」Tab 和 RPC |
| `writeEnabled` | `true` | 允许记忆、关系、忘记、记忆体维护与写 RPC |

profile patch 中同 ID 的 `config` 可能整体覆盖默认行；覆盖时应保留仍需启用的键。

## 推荐使用方式

1. 用清晰的 name 和 description 划分长期范围，例如“项目决策”“个人偏好”“研究资料”；不要为一次临时任务创建记忆体。
2. 只激活当前可能影响工作的记忆体，减少无关召回；跨域任务可以同时激活多个。
3. 延续旧任务、询问历史决策或排查已知坑时，让 Recall Worker 选择相关记忆体并返回证据。
4. 形成稳定决策、偏好、流程或难得经验后，让 Write Worker 查重、提炼并决定写入位置。
5. 临时进度、普通聊天和可直接从仓库读取的事实不应沉淀。
6. 需要解释关系时，从 recall 返回的完整 `memoryBodyId + id` 调用 `mnemon_related`，不要猜 ID。

## DSH 命令

```text
/mnemon status
/mnemon recall 为什么选择 SQLite
/mnemon related <完整记忆 ID>
/mnemon remember 一条稳定、可复用、自包含的记忆
/mnemon forget <完整记忆 ID>
```

`writeEnabled: false` 时仍可使用 `status` / `recall` / `related`，写入与删除命令会明确拒绝。

## 开发与验证

```sh
pnpm install
pnpm run typecheck
pnpm test
pnpm run build
# 或一次完成
pnpm run verify
```

构建产物会写入并提交到 `lib/`：

- `lib/index.js`：DSH Host 插件；
- `lib/client.js`：自包含浏览器 bundle，仅 external `react` / `react/jsx-runtime`；
- `lib/types/`：Host 与 Client 类型声明及中间 ESM。

测试覆盖记忆体目录迁移、独立 Store 路由、激活读边界、写后激活、非破坏性合并、子 Agent 工具隔离、pre-step 仅提醒 / turn-stopping 写回、WebUI 直连检索、证据限定 Agent 问答、RPC 权限、只读模式、多记忆体图谱和六区工作台。发布前还应使用隔离 `MNEMON_DATA_DIR` 和独立端口 DSH，通过真实 WebUI 对话验证模型自主决定召回、跨记忆体读取、写回副作用、简单显式边、沉淀回执、状态计数和最终 CLI recall。

## 品牌资源

WebUI 内嵌的 Mnemon 标志来自 [mnemon-dev/mnemon 的官方 logo.svg](https://github.com/mnemon-dev/mnemon/blob/main/docs/logo/logo.svg)，上游项目采用 Apache-2.0 License。标志仅用于准确说明本插件集成的上游产品。

## License

BSD-3-Clause
