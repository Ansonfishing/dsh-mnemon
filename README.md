# dsh-mnemon

把 [Mnemon](https://github.com/mnemon-dev/mnemon) 作为 **DeepSeek Harness（DSH）的外置记忆层**：模型通过 DSH 原生工具按需召回与沉淀，用户通过会话页顶部的「记忆」Tab 检索、查看关联、写入和诊断本地记忆库。

设计遵循 Mnemon 的 **LLM-led / protocol-constrained** 原则：插件提供记忆能力和轻量路由指引，但不会在每轮自动召回，也不会把整个记忆库塞进模型上下文。当前指令和仓库证据始终高于可能过时的记忆。

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
  - 「检索」：三种检索模式、分类过滤、结果卡片、关联图遍历、复制 ID、软删除；
  - 「记住」：内容、分类、重要性和标签表单；
  - 「配置」：真实 CLI 版本、命名 store、数据目录、库统计、当前开关与配置示例。
- **命名 store 与数据隔离**：支持 Mnemon 的 `--store` / `MNEMON_STORE` / active store 优先级。
- **安全边界**：所有 CLI 调用使用参数数组并禁用 shell；远程可信 Web 页面可读，本地记忆写入 RPC 仅允许 loopback 页面；`writeEnabled: false` 可整体切成只读。
- **版本兼容**：同时解析 Mnemon 0.1.2 的嵌套 recall 结果和当前上游的紧凑结果。

## 架构

```text
DSH agent ── native tools ─┐
                           ├── dsh-mnemon host ── mnemon CLI ── ~/.mnemon/data/<store>/
DSH Web ── 「记忆」Tab ───┘                  remember / recall / related / link / forget
```

浏览器不直接启动进程、不接触数据库，也不保存任何密钥或特殊权限。Host 半区统一解析配置、校验输入、设置超时并调用本地 `mnemon` 可执行文件。

## 前置条件

先安装 Mnemon，并确认命令可用：

```sh
mnemon --version
mnemon status
```

Mnemon 是 local-first 单二进制记忆图谱；嵌入向量可选，未安装 Ollama 时核心 remember / recall / graph 能力仍可工作。详细安装方式见 [Mnemon 官方仓库](https://github.com/mnemon-dev/mnemon)。

## 安装到 DSH

```sh
dsh plugin --profile web add "github:dsh-external/dsh-mnemon"
```

安装后重启 `dsh web`，再刷新浏览器。包内的 `cordis.patch.yml` 会自动挂载插件并启用「记忆」Tab。

本地开发检出可使用：

```sh
dsh plugin --profile web add "link:/absolute/path/to/dsh-mnemon"
```

## 配置

推荐在 DSH Web 的 **设置 → 插件配置 → Mnemon 外置记忆** 中修改。设置会写入 `$DSH_HOME/settings.yaml` 的 `mnemon` namespace，并在重启 DSH 后生效；profile 的插件配置作为 base，`settings.yaml` 中的用户值拥有更高优先级。

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

测试覆盖配置解析、CLI 参数/超时边界、0.1.2 与当前 recall 数据形态、只读模式、RPC 权限划分、Tab 首屏渲染。另已使用真实 Mnemon 0.1.2 的隔离临时 store 验证 `status → remember → recall → related → forget → status` 全链路。

## License

BSD-3-Clause
