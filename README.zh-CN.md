<h1 align="center">dsh-mnemon</h1>

<p align="center"><a href="./README.md">English</a> · <strong>简体中文</strong></p>

<p align="center">
  <a href="https://github.com/omdsh-dev/dsh-mnemon/blob/main/docs/zh-CN/ui-guide.md">
    <img src="https://raw.githubusercontent.com/omdsh-dev/dsh-mnemon/main/docs/assets/media/dsh-mnemon-memory-system-demo-poster.jpg" alt="dsh-mnemon Sidebar 记忆系统：记忆体目录与关系图" width="760">
  </a>
</p>

<p align="center"><strong>让 DeepSeek Harness 拥有可跨 Agent 共享、分层、可监督的长期记忆。</strong></p>

`dsh-mnemon` 把长期记忆接入 DeepSeek Harness（DSH），并将每轮需要的热记忆、需要完整阅读的项目档案和按需召回的长期记忆体组织在同一个工作台中。第三层采用可替换 Provider：Mnemon Native 是官方优先、默认完整能力实现；首个实验性适配器可以连接已有 OpenViking 服务，而不改变记忆体工作流。

- **默认本地优先**：Mnemon Native 将记忆保存在本机 SQLite、JSON 与 Markdown；OpenViking 是显式可选连接。
- **跨 Agent 共享**：Mnemon Native 通过本地 Store 共享；OpenViking 通过连接的远程服务共享。
- **三层协作**：运行时记忆、项目档案、记忆体各自保存适合自己的信息粒度。
- **受监督写入**：语义判断交给隔离的记忆子 Agent，路径、权限、容量、锁与 revision 由 Host 控制。
- **Web 与 Headless**：Web 提供完整 Sidebar 工作台；一次性 Headless 任务获得同一套 Agent 工具、记忆上下文和 cwd 路由。

当前用户指令、仓库文件与实时工具结果始终高于历史记忆。

## 实机演示

![dsh-mnemon Sidebar 记忆系统与对话内交互演示](https://raw.githubusercontent.com/omdsh-dev/dsh-mnemon/main/docs/assets/media/dsh-mnemon-memory-system-demo.gif)

完整逐页说明见 [Sidebar 与对话交互指南](./docs/zh-CN/ui-guide.md)。

## 5 分钟开始使用

### 1. 安装 Mnemon

```sh
# macOS
brew install --cask mnemon-dev/tap/mnemon

# macOS / Linux，也可以通过 Go 安装
go install github.com/mnemon-dev/mnemon@latest

mnemon --version
```

Windows 推荐安装 v0.2.3 或更高版本的官方 ZIP；解压到以下目录后无需修改 `PATH` 即可自动发现。checksum 校验步骤见[入门指南](./docs/zh-CN/getting-started.md#2-安装-mnemon)：

```powershell
$version = '0.2.3'
$arch = if ([System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture -eq 'Arm64') { 'arm64' } else { 'amd64' }
$archiveName = "mnemon_${version}_windows_${arch}.zip"
$archive = Join-Path $env:TEMP $archiveName
Invoke-WebRequest "https://github.com/mnemon-dev/mnemon/releases/download/v${version}/${archiveName}" -OutFile $archive
$installDir = Join-Path $env:LOCALAPPDATA 'Programs\mnemon'
New-Item -ItemType Directory -Force -Path $installDir | Out-Null
Expand-Archive -Path $archive -DestinationPath $installDir -Force
& (Join-Path $installDir 'mnemon.exe') --version
```

### 2. 安装插件

完整 Web 工作台：

```sh
dsh plugin --profile web add dsh-mnemon
dsh --profile web
```

DSH 各 profile 的插件清单彼此独立；一次性 Headless 任务需要单独安装：

```sh
dsh plugin --profile headless add dsh-mnemon
dsh --profile headless "回答前先检查持久化的项目上下文。"
```

本地开发检出使用绝对路径：

```sh
dsh plugin --profile web add "link:/absolute/path/to/dsh-mnemon"
dsh plugin --profile headless add "link:/absolute/path/to/dsh-mnemon"
```

### 3. 打开记忆系统

安装后默认使用 `sidebar`：点击 DSH 左侧栏的“记忆系统”即可进入。第一次使用建议按以下顺序：

1. 在“状态”确认 Mnemon CLI、运行时、记忆体与档案均正常；
2. 在“记忆体 → 概览”创建一个边界明确的记忆体；
3. 用“沉淀记忆”提交一条稳定、未来仍有用的信息；
4. 在“检索”用一个聚焦问题验证召回；
5. 回到对话，展开回复下方的“本回合记忆”查看工具轨迹。

更完整的安装、Provider 要求与验证步骤见[快速开始](./docs/zh-CN/getting-started.md)。

Headless 没有工作台和对话按钮，但仍会挂载运行时上下文、档案、记忆体工具、生命周期提示和受监督写入。`storageScope=workspace` 时，记忆根跟随启动命令所在目录。一次性 Agent 进入 idle 后进程立即退出，因此延迟后台审查会在关闭时取消；任务内已经完成的显式或模型引导写入仍会持久化。

## 一个工作台，三层记忆

| 层级 | 适合保存 | 如何进入上下文 |
|---|---|---|
| **运行时** | 用户偏好、协作要求、项目约定、环境事实 | `USER.md` / `MEMORY.md` 每轮紧凑注入 |
| **档案** | 设计、调查、流程、复盘、交接材料 | 先确定性检索 active Documents，再按需阅读全文 |
| **记忆体** | 跨会话事实、决策、实体与关系 | 只从已激活 Memory Spaces 按需召回有界证据 |

三层不是同一内容的简单复制：信息会按使用频率、叙事长度和召回方式进入最合适的层级。完整规则见[存储与三层记忆模型](./docs/zh-CN/storage-model.md)。

### 与其他 Agent 共享长期记忆

跨 Agent 共享发生在第三层**记忆体**：Mnemon Native 通过相同 `storageRoot` 和 Store 互操作，OpenViking 通过相同远程服务、目标 URI 与身份互操作。DSH 专有的运行时记忆和项目档案不会因此自动暴露给其他 Agent。

默认 `global` 模式使用 `~/.mnemon`，最适合作为本机 Agent 之间的共享记忆根；`custom` 和 `workspace` 也可以共享，但所有参与方必须显式对齐目录。共享同一目录意味着共享同一份数据，请先确认信任边界，并避免并发执行不兼容的离线迁移或目录操作。

## Sidebar 工作台

| 页面 | 主要用途 |
|---|---|
| **状态** | 检查连接、存储根、三层数据摘要，以及 Mnemon / dsh-mnemon 版本 |
| **运行时** | 查看 USER / MEMORY 容量，筛选、添加、编辑或移除热记忆 |
| **记忆体** | 管理激活边界；在概览、检索、内容、实体之间切换；打开“沉淀记忆” |
| **档案** | 搜索、阅读、新建、编辑与归档受管 Markdown 文档 |

添加与编辑使用统一弹窗；危险操作需要二次确认；长列表采用筛选、计数与“加载更多”，档案正文使用独立阅读区域。

### 对话内记忆

| 本回合记忆 | 存入记忆 |
|---|---|
| [![展开本回合记忆并查看工具入口](https://raw.githubusercontent.com/omdsh-dev/dsh-mnemon/main/docs/assets/screenshots/conversation-turn-memory.png)](https://github.com/omdsh-dev/dsh-mnemon/blob/main/docs/assets/screenshots/conversation-turn-memory.png) | [![确认存入记忆弹窗](https://raw.githubusercontent.com/omdsh-dev/dsh-mnemon/main/docs/assets/screenshots/conversation-save-dialog.png)](https://github.com/omdsh-dev/dsh-mnemon/blob/main/docs/assets/screenshots/conversation-save-dialog.png) |

- **本回合记忆**汇总本轮的召回、沉淀与档案检索；展开后可以跳到对应页面。
- **存入记忆**先加载可编辑候选，只有确认后才交给记忆子 Agent 判断、查重、提炼并写入。

这两个入口默认开启，可在“设置 → 记忆系统 → 对话界面”中分别关闭，保存后实时生效。

## 展示与存储

配置位于 `$DSH_HOME/settings.yaml`（通常为 `~/.dsh/settings.yaml`）：

```yaml
mnemon:
  displayMode: sidebar # sidebar | buildin；默认 sidebar
  storageScope: global # global | workspace | custom
```

| 选择 | 行为 |
|---|---|
| `sidebar` | 默认；左侧栏独立工作台，采用与 DSH 官方面板一致的极简外观 |
| `buildin` | 保留原有对话区内嵌形态及其既有视觉 |
| `global` | 多个工作区共享 `~/.mnemon`（或 `MNEMON_DATA_DIR`） |
| `workspace` | 每个工作区使用自己的 `<workspace>/.mnemon`；工作台可查看其他工作区，Agent 仍跟随当前会话 |
| `custom` | 使用 `dataDir` 指定的绝对路径或 `~/...` |

设置保存后实时生效，无需手动刷新。切换存储范围不会自动迁移、合并或删除旧数据；工作区查看目标与会话实际目录不一致时，顶部会提示并提供一键对齐。

## 常用命令

```text
/mnemon status
/mnemon recall <查询>
/mnemon related <完整记忆 ID>
/mnemon remember <稳定、自包含的长期洞察>
/mnemon forget <完整记忆 ID>
```

推荐查询顺序：运行时热记忆 → active Documents → 已激活记忆体 → 命中记录指向的归档原文。

## 数据与安全边界

- Mnemon Native 通过本地 `mnemon` CLI 访问；OpenViking 通过 Host HTTP API 访问。WebUI 不直接读取 SQLite、启动进程或调用远程 Provider。
- CLI 使用参数数组且禁用 shell；输出、超时和取消均有边界。
- 可选 OpenViking API Key 以 `0600` 权限保存在 `<storageRoot>/state/memory-providers.json`，不会返回浏览器，也不会进入 Mnemon Pack；子 Agent 推理仍复用 DSH 已配置的模型 Provider。
- 当前没有确定性的秘密扫描器。不要把密钥、token、私钥或原始敏感日志写入任何记忆层。
- 卸载插件不会删除 `~/.mnemon`、工作区 `.mnemon` 或自定义目录中的数据。

完整边界、备份恢复与故障排查见[运维指南](./docs/zh-CN/operations.md)。

## 文档

| 我想要…… | 从这里开始 |
|---|---|
| 安装并完成第一次验证 | [快速开始](./docs/zh-CN/getting-started.md) |
| 认识每个页面与对话内入口 | [Sidebar 与对话交互指南](./docs/zh-CN/ui-guide.md) |
| 理解三层模型和完整流转 | [项目介绍](./docs/zh-CN/project-overview.md) · [生命周期与核心流程](./docs/zh-CN/workflows.md) |
| 选择存储范围或高级开关 | [配置参考](./docs/zh-CN/configuration.md) |
| 备份、更新或排查问题 | [运维、安全与故障排查](./docs/zh-CN/operations.md) |
| 集成工具、命令或 RPC | [接口参考](./docs/zh-CN/interfaces.md) |
| 开发、测试或发布 | [开发与验证](./docs/zh-CN/development.md) |

完整目录见[文档中心](./docs/zh-CN/README.md)。

## 开发

```sh
pnpm install
pnpm run verify
```

`verify` 依次运行 TypeScript 检查、Vitest、两次可复现构建、隔离的真实 Headless profile 激活检查和发布包校验。`lib/` 是生成目录，不再提交到仓库。

## License

MIT。安全问题请按 [SECURITY.md](./SECURITY.md) 私下报告，不要直接创建公开 issue。
