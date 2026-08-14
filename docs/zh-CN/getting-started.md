# 快速开始

**简体中文** | [English](../en/getting-started.md) | [文档中心](./README.md)

## 1. 前置条件

你需要：

- 一个可以启动的 DSH Web profile；
- 本地可执行的 `mnemon` CLI；
- 可用于受限子任务的 DSH subagent provider。

provider 的准确要求如下：

```text
regular semantic operations
  -> prefer provider named "spawn"
  -> may fall back to another compatible provider

scored background review
  -> requires provider named "fork"
  -> inheritsParentContext = true

both paths require
  -> outputSchema
  -> toolFilter
  -> persona
  -> depthLimit
```

插件没有在代码中声明固定的 DSH/Mnemon 最低版本矩阵。**已验证基线**：`dsh-mnemon` 0.1.0 在 `@deepseek-ai/dsh` 0.1.0-rc.6（2026-08-13 快照）的 live web profile 上实测通过，最后验证日期 2026-08-14。升级前应先在隔离数据目录中运行本页的验证步骤。

## 2. 安装 Mnemon

macOS 推荐 Homebrew Cask：

```sh
brew install --cask mnemon-dev/tap/mnemon
```

macOS 或 Linux 也可以通过 Go 安装：

```sh
go install github.com/mnemon-dev/mnemon@latest
```

验证二进制：

```sh
mnemon --version
```

如果还要直接检查上游 Store，可以运行 `mnemon status`。该命令会打开有效 Store，可能初始化默认数据或执行迁移；不要把它当作完全无副作用的安装探测。

如果 DSH 无法从 `PATH` 找到它，可以设置 `MNEMON_CLI_PATH`，或在 `mnemon.cliPath` 中配置绝对路径。

## 3. 安装插件

安装到 Web profile：

```sh
dsh plugin --profile web add dsh-mnemon
```

未发布到 npm 的预发布版本可从 git 安装：

```sh
dsh plugin --profile web add "github:omdsh-dev/dsh-mnemon"
```

本地开发检出：

```sh
dsh plugin --profile web add "link:/absolute/path/to/dsh-mnemon"
```

插件包中的 `cordis.patch.yml` 会挂载 Host 插件；Web client bundle 会注册会话工作台和插件设置卡。

### 升级与卸载

`dsh plugin` 是 pnpm 转发器，在 profile 目录下执行：

```sh
# 升级
dsh plugin --profile web update dsh-mnemon

# 卸载（同时从 profile 移除其 bundle 注册）
dsh plugin --profile web remove dsh-mnemon
```

卸载不会删除记忆数据：`global` 范围数据留在 `~/.mnemon`，`workspace` / `custom` 范围数据留在对应目录，重新安装后继续可用。

临时停用自动读写而不卸载：在插件配置里关闭 `writebackMode` / `recallMode` / `lifecycleEnabled`（见[配置参考](./configuration.md)的“开关交互”）。注意 `tabEnabled=false` 目前只停掉 RPC 而不隐藏 Tab 入口，不应依赖它做 UI 卸载。

## 4. 选择存储范围

启动 DSH Web profile：

```sh
dsh --profile web
```

在“设置 -> 记忆系统”独立配置页选择：

| 范围 | 根目录 | 适合场景 |
|---|---|---|
| `global` | `MNEMON_DATA_DIR` 或 `~/.mnemon` | 多个工作区共享同一套记忆 |
| `workspace` | DSH Host 启动目录下的 `.mnemon` | 项目隔离 |
| `custom` | `dataDir` | 显式磁盘、挂载卷或专用数据目录 |

设置写入 `$DSH_HOME/settings.yaml`，保存后实时应用。切换范围不会搬运旧数据；需要保留时先停止写入并通过整体 ZIP 备份迁移。

## 5. 创建第一个记忆体

进入任意会话的“记忆系统”Tab：

1. 打开“记忆体”页。
2. 创建一个主题明确的记忆体，例如“项目决策”。
3. description 应说明“哪些内容属于这里，以及什么任务应召回它”。
4. 开启读取开关，或在第一次写入后让插件自动激活它。

空白记忆体默认可以保持未激活。激活只控制读取范围；写入可以选择任意已登记记忆体，写入成功后会自动激活目标。

## 6. 验证完整链路

先检查确定性状态：

```text
/mnemon status
```

再在“沉淀”页提交一条稳定、自包含、未来仍有用的内容。worker 会选择记忆体、查重并返回结构化回执。随后验证：

```text
/mnemon recall <一个能命中新内容的聚焦查询>
```

最后检查：

- “记忆体”页能看到已激活记忆体和图谱；
- “内容”能看到写入项及所属记忆体；
- “状态”中 CLI、运行时、记忆体目录和 subagent 均正常；
- 召回结果包含完整 `memoryBodyId` 和记忆 ID。

## 7. 推荐的第一次真实对话

选择一个确实依赖历史决策的问题，而不是要求模型无条件调用记忆工具。预期流程是：

```text
user asks a history-dependent question
  -> pre-step adds a short optional cue
  -> main Agent decides whether history matters
  -> recall worker selects active Memory Spaces
  -> only useful evidence returns to the main Agent
```

普通聊天不应强制召回。当前请求、现有源文件和实时工具结果应优先于历史内容。

## 8. 下一步

- 阅读[存储模型](./storage-model.md)，再决定 `storageScope`。
- 阅读[配置参考](./configuration.md)，配置只读模式或关闭生命周期提示。
- 阅读[运维指南](./operations.md)，建立备份和升级前验证流程。
