# 配置参考

**简体中文** | [English](../en/configuration.md) | [文档中心](./README.md)

## 配置位置与生效方式

插件在 DSH settings 服务中注册 `mnemon` 命名空间。用户配置位于：

```text
$DSH_HOME/settings.yaml
```

默认通常是 `~/.dsh/settings.yaml`。当前全部配置标记为 `restart` 生效；保存后需要重启 DSH Host。

Web 设置卡只编辑 `storageScope` 和 `dataDir`。其他高级项需要直接修改 YAML。

## 完整示例

```yaml
mnemon:
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
| `tabEnabled` | `true` | boolean | 当前只门控 Host Mnemon 数据 RPC；客户端 Tab 仍会注册，见下方限制 |
| `writeEnabled` | `true` | boolean | 是否暴露语义写工具、写 RPC 和写命令 |
| `mnemon-ui.toolviews` | `false` | boolean | 对话内记忆工具卡（`mnemon_*` 调用的记忆风格卡片）；默认关闭（opt-in），**保存后实时生效** |
| `mnemon-ui.turnBar` | `false` | boolean | 回合尾记忆活动条；默认关闭（opt-in），**保存后实时生效** |
| `mnemon-ui.saveAction` | `false` | boolean | 已定稿助手回复旁的「存入记忆」按钮；默认关闭（opt-in），**保存后实时生效** |

`mnemon` 是重启生效的 Host/存储命名空间；`mnemon-ui` 是实时生效的浏览器呈现命名空间。旧版 `mnemon.conversationInteraction` 仍会作为迁移默认值读取，但新保存只写入 `mnemon-ui`。

## 存储范围

### `global`

```text
MNEMON_DATA_DIR when non-empty
  otherwise ~/.mnemon
```

适合希望多个工作区共享 Runtime、Documents 和 Memory Spaces 的用户。

### `workspace`

```text
resolve(process.cwd(), ".mnemon")
```

这里的 cwd 是 DSH Host 进程启动目录，不是浏览器页面当前目录，也不一定等于每个会话记录的 cwd。应从目标项目目录启动 DSH。

### `custom`

```yaml
mnemon:
  storageScope: custom
  dataDir: /absolute/path/to/mnemon-data
```

也允许 `~` 和 `~/...`。相对路径会被拒绝。

## CLI 发现优先级

```text
config.cliPath
  -> executable MNEMON_CLI_PATH
  -> each PATH directory
  -> ~/.local/bin/mnemon
  -> /opt/homebrew/bin/mnemon
  -> /usr/local/bin/mnemon
  -> /usr/bin/mnemon
```

显式 `cliPath` 会被采用；若它不可执行，实际调用会返回启动错误。

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

## `tabEnabled` 当前限制

Host 在 `tabEnabled=false` 时不注册 Mnemon read/write RPC，但 Web client 仍无条件注册 conversation view slot。因此当前效果是“Tab 入口仍可能出现但数据接口不可用”，而不是完整隐藏 Tab。这是实现缺口，不应依赖它进行 UI 卸载。

## Profile patch 覆盖

包内 `cordis.patch.yml` 提供默认 config 行。DSH profile 的同 ID 配置可能整体覆盖这行；自定义 patch 时应保留仍需启用的键，而不是假设深合并。

## 常见配置

工作区隔离：

```yaml
mnemon:
  storageScope: workspace
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
