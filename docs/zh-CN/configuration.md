# 配置参考

**简体中文** | [English](../en/configuration.md) | [文档中心](./README.md)

## 配置位置与生效方式

插件在 DSH settings 服务中注册 `mnemon` 命名空间。用户配置位于：

```text
$DSH_HOME/settings.yaml
```

默认通常是 `~/.dsh/settings.yaml`。当前全部配置标记为 `live` 生效；保存后会先初始化候选运行图，再原子切换 Host 服务。

Web 设置页编辑 `displayMode`、`storageScope`、`dataDir`，以及 `mnemon-ui` 下的回合记忆条和存入记忆按钮；同页还提供当前有效目录的 ZIP 导入 / 导出。其他高级项需要直接修改 YAML。

## 完整示例

```yaml
mnemon:
  displayMode: sidebar # sidebar | buildin
  storageScope: global # global | workspace | custom
  # dataDir: ~/mnemon-data       # custom 时必填
  # cliPath: /opt/homebrew/bin/mnemon
  # store: legacy-store          # 兼容发现提示，不是常规路由目标
  timeoutMs: 10000
  defaultRecallLimit: 10
  routingGuidance: true
  lifecycleEnabled: true
  recallMode: guided
  writebackMode: guided
  idleReviewMs: 30000
  tabEnabled: true
  writeEnabled: true
```

## 选项

| 配置 | 默认值 | 范围 | 实现语义 |
|---|---:|---|---|
| `displayMode` | `sidebar` | `sidebar` / `buildin` | `sidebar` 挂载左侧栏独立工作台；`buildin` 恢复 DSH 原生对话区标签页；保存后实时切换且不会同时挂载两个入口 |
| `storageScope` | `global` | `global` / `workspace` / `custom` | 统一控制 Runtime、Documents、Memory Spaces 和预留 state 根目录 |
| `dataDir` | 未设置 | 绝对路径、`~` 或 `~/...` | `custom` 时必填；旧配置只设置它时自动解析为 `custom` |
| `cliPath` | 自动发现 | 可执行路径 | 显式指定 Mnemon CLI |
| `store` | 未设置 | `[A-Za-z0-9][A-Za-z0-9_-]*` | 用于旧 Store 的兼容发现/首选提示；语义操作由 Memory Space 路由 |
| `timeoutMs` | `10000` | 100–120000 ms | 单次 CLI 硬超时 |
| `defaultRecallLimit` | `10` | 1–50 | 服务和 UI 默认召回条数；不同入口可能再收紧 |
| `routingGuidance` | `true` | boolean | 是否注册额外的分层路由 system section |
| `lifecycleEnabled` | `true` | boolean | 是否启用 pre-step cue 和评分后台审查 |
| `recallMode` | `guided` | `guided` / `off` | 是否注入按需 recall cue；不移除显式召回 |
| `writebackMode` | `guided` | `guided` / `off` | 是否注入热记忆 cue 并启用评分后台审查；不移除显式写入 |
| `idleReviewMs` | `30000` | 5000–600000 ms | 达标后需要连续空闲的时间 |
| `tabEnabled` | `true` | boolean | 是否挂载 `displayMode` 指定的 Web 入口；关闭后 Host RPC、命令和 Agent 工具保持注册 |
| `writeEnabled` | `true` | boolean | 是否暴露语义写工具、写 RPC 和写命令 |
| `mnemon-ui.turnBar` | `true` | boolean | 回合尾记忆活动条；默认开启，**保存后实时生效** |
| `mnemon-ui.saveAction` | `true` | boolean | 已定稿助手回复旁的「存入记忆」图标与确认弹窗；默认开启，**保存后实时生效** |

`mnemon` Host/存储命名空间和 `mnemon-ui` 浏览器呈现命名空间都实时生效。存储根只会在新运行图初始化成功后原子切换；旧版 `mnemon.conversationInteraction` 仍会作为迁移默认值读取，但新保存只写入 `mnemon-ui`。

## 存储范围

### `global`

```text
MNEMON_DATA_DIR when non-empty
  otherwise ~/.mnemon
```

适合希望多个工作区共享 Runtime、Documents 和 Memory Spaces 的用户；其他 Mnemon-enabled Agent 使用相同根时，也可以共享其中的 Mnemon Memory Spaces。

### `workspace`

```text
Agent / 工具 / 生命周期：resolve(currentSession.header.cwd, ".mnemon")
Web 工作台查看：resolve(workspaceRegistry.get(selectedWorkspaceId).path, ".mnemon")
```

每个 DSH 工作区拥有独立的三层记忆根。Agent、模型工具、命令和生命周期按当前会话的 cwd 路由，不受 Web 工作台查看目标影响。工作台只能从 Host 已登记的工作区中选择，不能提交任意路径；查看目标与会话实际目录不一致时，顶部会显示两条路径并提供“一键对齐当前会话”。需要 Agent 子任务的操作在未对齐时会被 Host 拒绝，避免写入错误项目。

Headless 没有 `workspaceRegistry`；其新 session 的 cwd 就是启动 `dsh --profile headless ...` 的目录，因此 `workspace` 直接解析为 `<启动命令 cwd>/.mnemon`。

### `custom`

```yaml
mnemon:
  storageScope: custom
  dataDir: /absolute/path/to/mnemon-data
```

也允许 `~` 和 `~/...`。相对路径会被拒绝。

### 选择跨 Agent 共享范围

| 目标 | 推荐范围 | 说明 |
|---|---|---|
| 本机多个 Agent 共享长期记忆 | `global` | 各方统一使用 `~/.mnemon` 或同一个 `MNEMON_DATA_DIR` |
| 多个 Agent 共享指定数据根 | `custom` | 各方显式配置同一个绝对目录，便于隔离和备份 |
| 只在一个项目内共享 | `workspace` | 各方都需要把 Mnemon 根对齐到该项目的 `<workspace>/.mnemon` |

Mnemon Native 通过 `data/<store>/mnemon.db` 与其他 Mnemon-enabled Agent 原生互操作；OpenViking 通过配置的远程服务、目标 URI 与身份互操作。Runtime、Documents、DSH 激活状态和 UI 元数据仍属于 dsh-mnemon 管理范围。

## CLI 发现优先级

```text
config.cliPath
  -> executable MNEMON_CLI_PATH
  -> each PATH directory
  -> Windows: GOBIN/mnemon.exe
              first GOPATH/bin/mnemon.exe, or ~/go/bin/mnemon.exe
              %LOCALAPPDATA%/Programs/mnemon/mnemon.exe
              %ProgramFiles%/mnemon/mnemon.exe
  -> Unix: ~/.local/bin/mnemon
           /opt/homebrew/bin/mnemon
           /usr/local/bin/mnemon
           /usr/bin/mnemon
```

显式 `cliPath` 会被采用；若它不可执行，实际调用会返回启动错误。Windows 自动发现只接受普通 `.exe` 文件；进程执行不使用 shell，因此有意排除 `.cmd` 与 `.bat` wrapper。

## 兼容 Store 提示优先级

```text
config.store
  -> MNEMON_STORE
  -> <storageRoot>/active
  -> default
```

Memory Space 目录建立后，长期语义操作使用明确的记忆体 ID，不依赖全局 active Store 进行路由。

## Provider 要求

普通 worker 会优先选择 `spawn`；如果没有该名称，可以选择另一个具备全部能力的 provider：

```text
outputSchema = true
toolFilter   = true
persona      = true
depthLimit   = true
```

后台审查没有回退：必须存在名为 `fork` 的兼容 provider，并且：

```text
inheritsParentContext = true
```

缺少 `fork` 不会阻止确定性状态或普通 UI 读取，但达到审查门槛时会记录 subagent 失败。

## 只读配置

```yaml
mnemon:
  writeEnabled: false
```

效果：

- 不注册模型写工具；
- 不注册 `/dsh-mnemon-write` RPC；
- `/mnemon remember` 和 `/mnemon forget` 拒绝；
- `MnemonService` 的语义 mutation 拒绝。

它是“功能只读”，不是文件系统只读模式：Runtime 控制器仍可能初始化或修复投影，Document 搜索会更新 LRU 访问时间，Mnemon 读命令也可能触发上游数据库迁移。不要把 `writeEnabled=false` 用作只读挂载的安全承诺。

## 开关交互

```text
writeEnabled=false
  -> overrides all explicit semantic writes

writebackMode=off
  -> no write cue, no scored review
  -> explicit writes remain when writeEnabled=true

recallMode=off
  -> no recall cue
  -> explicit recall remains

lifecycleEnabled=false
  -> no lifecycle cues or review
  -> UI, commands, and explicit tools remain

routingGuidance=false
  -> removes only mnemon:routing
  -> runtime-memory prompt section remains
```

## 展示形态与 `tabEnabled` 界面开关

`displayMode=sidebar`（默认）会挂载“记忆系统”侧边栏入口和独立主内容区工作台，并使用无 Mnemon Logo 的 DSH 官方风格极简皮肤；`displayMode=buildin` 会改为注册原有的 DSH `conversation.view` 内嵌标签页并保持既有视觉。两者共享功能工作台，但外观定义隔离。设置页保存后会先卸载当前入口再挂载目标入口，因此两种形态不会同时出现。

`tabEnabled=false` 会实时移除当前形态的 Web 入口。为避免运行中的 Agent 或命令因界面设置变化而失效，Host RPC、命令和工具不会随展示形态或总开关卸载。

## Profile patch 覆盖

包内 `cordis.patch.yml` 提供默认 config 行。DSH profile 的同 ID 配置可能整体覆盖这行。不要在 profile 的最终 patch 中只增加 `cliPath`；请改用 `MNEMON_CLI_PATH` 或用户设置 `mnemon.cliPath`。确因其他原因需要自定义 profile patch 时，应保留仍需启用的全部键，而不是假设深合并。

## 常见配置

工作区隔离：

```yaml
mnemon:
  storageScope: workspace
```

显式指定 Windows CLI 路径：

```yaml
mnemon:
  cliPath: 'C:\Users\alice\AppData\Local\Programs\mnemon\mnemon.exe'
```

自定义数据盘和较长 CLI 超时：

```yaml
mnemon:
  storageScope: custom
  dataDir: /Volumes/AgentData/mnemon
  timeoutMs: 30000
```

保留显式工具、关闭生命周期行为：

```yaml
mnemon:
  lifecycleEnabled: false
```

仅关闭后台写回判断：

```yaml
mnemon:
  writebackMode: off
```
