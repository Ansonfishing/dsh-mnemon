# dsh-mnemon

> **LLM-supervised 4-graph persistent memory for AI agents.**

DeepSeek Harness（DSH）的 Mnemon 外置记忆插件。它把 [Mnemon](https://github.com/mnemon-dev/mnemon) 接入 DSH：Agent 通过原生工具按需召回和沉淀跨会话知识，用户通过 `/mnemon` 命令和会话「记忆」Tab 管理本地记忆图谱。

Mnemon 采用 **LLM-supervised** 模式：宿主 LLM 判断何时召回、什么值得记住以及何时遗忘；本地单一二进制负责存储、四图索引、检索、衰减和去重。`dsh-mnemon` 将这一分工映射到 DSH 原生扩展点，不引入第二个 LLM、不要求额外 API Key，也不会在每轮机械召回或把整库塞入上下文。

## 定位

| 层 | 职责 |
|---|---|
| DSH Agent | 根据任务与路由指引决定是否 `recall / remember / link / forget` |
| `dsh-mnemon` | 注册工具、命令、设置、WebUI，校验输入并控制权限与超时 |
| Mnemon CLI | 执行确定性的 SQLite 存储、四图索引、意图感知召回、衰减与去重 |
| DSH 用户 | 在「记忆」Tab 总览、检索、审阅与维护，并在「状态」页选择 Store 与读写策略 |

当前用户指令与仓库事实始终高于可能过时的历史记忆。记忆是可复核的辅助证据，不是自动覆盖当前事实的真相源。

## 功能

- **DSH 原生工具**
  - `mnemon_recall`：图增强召回、关键词检索或基础匹配；
  - `mnemon_related`：沿 temporal / semantic / causal / entity 边遍历关联记忆；
  - `mnemon_remember`：写入一条持久洞察，保留 Mnemon 自带的重复/冲突判断；
  - `mnemon_link`：在两条已确认的记忆之间建立类型化关系；
  - `mnemon_forget`：按精确 ID 软删除；
  - `mnemon_status`：查看 CLI、store 和数据库健康状态。
- **轻量系统指引**：任务开始先判断是否值得 recall，任务结束再判断是否有 durable writeback；不做机械调用。
- **DSH 原生命令**：`/mnemon status`、`recall`、`related`、`remember`、`forget` 直接通过命令面板执行，不经过模型。
- **会话「记忆」Tab**
  - 「总览」：每 15 秒从 Mnemon active graph 同步一次实时节点和 temporal / semantic / causal / entity 关系，支持节点检查；
  - 「检索」：三种检索模式、分类过滤、结果卡片、关联图检查器、复制 ID、卡片内软删除确认；
  - 「实体」：列出高频实体，并通过 ENTITY intent 聚合其跨图上下文；
  - 「沉淀」：耐久性判断提示，以及内容、分类、重要性、实体和标签表单；
  - 「记忆库」：无副作用枚举 active memory，支持筛选、查阅、复制、基于旧内容新建和软删除；
  - 「状态」：CLI 与数据库诊断、原生命令入口，以及连接、Store、召回和读写配置。
- **Tab 内原生配置**：在「记忆 → 状态」编辑配置，写入 `.dsh/settings.yaml` 并在重启后生效；无需前往 DSH 的「设置 → 插件配置」。
- **全局主题联动**：界面只使用 DSH design token，跟随 DSH 全局明暗模式，不维护插件私有主题开关。
- **命名 store 与数据隔离**：支持 Mnemon 的 `--store` / `MNEMON_STORE` / active store 优先级。
- **安全边界**：所有 CLI 调用使用参数数组并禁用 shell；远程可信 Web 页面可读，本地记忆写入 RPC 仅允许 loopback 页面；`writeEnabled: false` 可整体切成只读。
- **版本兼容**：同时解析 Mnemon 0.1.2 的嵌套 recall 结果和当前上游的紧凑结果。

## 架构

```text
DSH Agent ── native tools ─────┐
DSH Chat  ── /mnemon command ──┼── dsh-mnemon host ── mnemon CLI ── ~/.mnemon/data/<store>/
DSH Web   ── 「记忆」Tab ──────┤                  remember / link / recall / forget
             状态与配置 ───────┘                  ~/.dsh/settings.yaml
```

浏览器不直接启动进程、不接触数据库，也不保存任何密钥或特殊权限。Host 半区统一解析配置、校验输入、设置超时并调用本地 `mnemon` 可执行文件。

## 前置条件

先安装 Mnemon。macOS 推荐使用官方 Homebrew Cask：

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

Mnemon 是 local-first 单二进制持久记忆图谱，核心协议是 `remember / link / recall`。它同时维护 temporal、entity、causal、semantic 四类关系；本地嵌入是可选增强，未安装 Ollama 时核心记忆与图召回能力仍可工作。详细安装和设计说明见 [Mnemon 官方仓库](https://github.com/mnemon-dev/mnemon)。

## 安装到 DSH

```sh
dsh plugin --profile web add "github:dsh-external/dsh-mnemon"
```

安装后重启 `dsh web`，再刷新浏览器。包内的 `cordis.patch.yml` 会自动挂载插件、注册 Agent 工具与 `/mnemon` 命令，并启用「记忆」Tab。

本地开发检出可使用：

```sh
dsh plugin --profile web add "link:/absolute/path/to/dsh-mnemon"
```

## 配置

推荐在 DSH Web 的 **记忆 → 状态 → 连接与行为** 中修改。设置会写入 `$DSH_HOME/settings.yaml` 的 `mnemon` 命名空间，并在重启 DSH 后生效；profile 的插件配置作为 base，`settings.yaml` 中的用户值拥有更高优先级。

```yaml
# ~/.dsh/settings.yaml
mnemon:
  cliPath: /opt/homebrew/bin/mnemon
  dataDir: ~/.mnemon
  store: project-alpha
  timeoutMs: 10000
  defaultRecallLimit: 10
  routingGuidance: true
  tabEnabled: true
  writeEnabled: true
```

也可以在 profile patch 中提供部署级默认值：

包内默认层：

```yaml
- insert:
    - id: mnemon
      name: dsh-mnemon
      config:
        routingGuidance: true
        tabEnabled: true
        writeEnabled: true
        timeoutMs: 10000
        defaultRecallLimit: 10
```

需要固定 CLI、数据目录或命名 store 时，在 profile 的最终 `cordis.patch.yml` 覆盖：

```yaml
- id: mnemon
  config:
    cliPath: /opt/homebrew/bin/mnemon
    dataDir: ~/.mnemon
    store: project-alpha
    routingGuidance: true
    tabEnabled: true
    writeEnabled: true
    timeoutMs: 10000
    defaultRecallLimit: 10
```

> DSH 的同 ID 配置覆盖通常会替换整行 `config`，建议把仍需保留的键全部重写。

| 配置 | 默认值 | 说明 |
|---|---:|---|
| `cliPath` | 自动发现 | 解析顺序：显式配置 → `MNEMON_CLI_PATH` → `PATH` → 常见安装路径 |
| `dataDir` | 未覆盖 | 未设置时沿用 `MNEMON_DATA_DIR` 或 Mnemon 默认 `~/.mnemon` |
| `store` | 未覆盖 | 未设置时沿用 `MNEMON_STORE`、active 文件、最后回退 `default` |
| `timeoutMs` | `10000` | 单次 CLI 调用硬超时，范围 100–120000 ms |
| `defaultRecallLimit` | `10` | 模型工具和 Tab 的默认召回条数，范围 1–50 |
| `routingGuidance` | `true` | 注入克制的 recall / writeback 决策指引 |
| `tabEnabled` | `true` | 注册 Web `conversation.view`「记忆」Tab 和 RPC |
| `writeEnabled` | `true` | 注册模型写工具与本地 Web 写通道；关闭后 recall/status 仍可用 |

如果多个 agent 应共享同一记忆池，不设置 `store` 即可使用 Mnemon 当前 active store；如果需要按项目或角色隔离，为各 profile 设置不同的命名 store。

## 推荐使用方式

1. 延续旧任务、询问历史决策、排查已知坑时，让模型做一次聚焦 recall。
2. 召回内容只作证据：发现它与当前代码或用户指令冲突时，以当前事实为准。
3. 形成稳定决策、偏好、流程或难得经验后，沉淀一条自包含记忆。
4. 临时进度、普通聊天、可直接从仓库读出的事实不写入。
5. 需要解释关系时，从 recall 返回的完整 ID 调用 `mnemon_related`；不要猜 ID。

这对应 Mnemon 的生命周期判断：任务到来时只问“召回是否可能改变结果”，任务结束时只问“是否产生了稳定、可复用、未来值得检索的知识”。插件提供提醒和能力，最终判断仍由 DSH Agent 完成。

## DSH 命令

在会话输入框的“命令”菜单中选择 `/mnemon`，或直接输入：

```text
/mnemon status
/mnemon recall 为什么选择 SQLite
/mnemon related <完整记忆 ID>
/mnemon remember 一条稳定、可复用、自包含的记忆
/mnemon forget <完整记忆 ID>
```

命令由 DSH command registry 执行并记录 command 生命周期，不会发送给模型。`writeEnabled: false` 时仍可使用 `status` / `recall` / `related`，写入与删除命令会明确拒绝。

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
- `lib/types/`：Host 与 Client 类型声明和中间 ESM。

测试覆盖配置解析、CLI 参数/超时边界、0.1.2 与当前 recall 数据形态、图谱安全解析、无副作用 List、实体查阅、只读模式、RPC 权限划分、Tab 内设置和六区工作台交互。另使用真实 Mnemon 与独立端口 DSH 验证配置重启、全局明暗主题、Overview / recall / entity / remember / list / forget 和 WebUI 全链路。

## 品牌资源

WebUI 内嵌的 Mnemon 标志来自 [mnemon-dev/mnemon 的官方 logo.svg](https://github.com/mnemon-dev/mnemon/blob/main/docs/logo/logo.svg)，上游项目采用 Apache-2.0 License。标志仅用于准确说明本插件集成的上游产品。

## License

BSD-3-Clause
