# 快速开始

**简体中文** | [English](../en/getting-started.md) | [文档中心](./README.md)

本页从空白环境走到第一次可验证召回。默认采用 Sidebar 和全局存储；如果你已经安装完成，可直接跳到[首次验证](#6-完成第一次验证)。

## 1. 前置条件

你需要：

- 一个可以启动的 DSH Web profile；
- 本地可执行的 `mnemon` CLI；
- 一个可用于隔离记忆任务的 DSH subagent Provider。

普通语义任务优先使用名为 `spawn` 的 Provider，并要求 `outputSchema`、`toolFilter`、`persona` 与 `depthLimit`。可选的评分后台审查还要求名为 `fork`、且 `inheritsParentContext=true` 的 Provider。缺少 `fork` 不影响确定性页面读取和普通手动操作。

项目当前不声明固定的 DSH / Mnemon 最低版本矩阵。本文与截图以 dsh-mnemon v0.1.4 为基线；升级前先备份，并在隔离目录重复本页验证。

## 2. 安装 Mnemon

macOS 推荐 Homebrew Cask：

```sh
brew install --cask mnemon-dev/tap/mnemon
```

macOS 或 Linux 也可通过 Go 安装：

```sh
go install github.com/mnemon-dev/mnemon@latest
```

验证二进制：

```sh
mnemon --version
```

如果 DSH 无法从 `PATH` 找到它，可设置 `MNEMON_CLI_PATH`，或把绝对路径写入 `mnemon.cliPath`。`mnemon status` 会打开有效 Store，可能初始化数据或执行上游迁移，不要把它当作完全无副作用的安装探测。

## 3. 安装 dsh-mnemon

安装到 Web profile：

```sh
dsh plugin --profile web add dsh-mnemon
```

开发检出使用绝对路径：

```sh
dsh plugin --profile web add "link:/absolute/path/to/dsh-mnemon"
```

然后启动或重启 profile：

```sh
dsh --profile web
```

升级与卸载：

```sh
dsh plugin --profile web update dsh-mnemon
dsh plugin --profile web remove dsh-mnemon
```

卸载只移除插件注册，不删除全局、工作区或自定义目录中的记忆数据。

## 4. 选择入口与存储位置

打开“设置 → 记忆系统”：

[![记忆系统设置：展示形态、存储位置、对话界面与备份](../assets/screenshots/settings-memory-system.png)](../assets/screenshots/settings-memory-system.png)

### 展示形态

- **Sidebar**（默认）：从 DSH 左侧栏进入独立工作台；适合绝大多数用户。
- **Buildin**：使用原有对话区标签页，并保留既有视觉。

### 存储位置

| 范围 | 根目录 | 适合场景 |
|---|---|---|
| **全局**（默认） | `MNEMON_DATA_DIR` 或 `~/.mnemon` | 多个工作区共享同一套记忆 |
| **工作区** | `<workspace>/.mnemon` | 项目隔离，并允许在工作台切换查看其他工作区 |
| **自定义** | `dataDir` | 专用磁盘、挂载卷或明确的数据目录 |

点击保存后会先初始化新运行图，再原子切换 Host；页面自动清理旧状态并重新读取，无需刷新浏览器。切换范围不会自动迁移、合并或删除旧数据。

在工作区模式下，工作台选择器只决定“正在查看哪套数据”；Agent、工具与生命周期实际使用的目录始终跟随当前会话。两者不一致时顶部会提示并提供一键对齐。

## 5. 打开 Sidebar 工作台

点击左侧栏“记忆系统”，先查看“状态”：

[![状态页：CLI、版本、运行时、记忆体、档案与存储根](../assets/screenshots/status-overview.png)](../assets/screenshots/status-overview.png)

确认：

- 右上角显示“已连接”；
- Mnemon 与 dsh-mnemon 能显示当前版本；
- 存储根与刚才选择的范围一致；
- Runtime、Memory Spaces 和 Documents 没有错误提示。

如果 Mnemon 不可用，先运行 `command -v mnemon` 与 `mnemon --version`。更多症状见[故障排查](./operations.md#故障排查)。

## 6. 完成第一次验证

### 创建记忆体

1. 打开“记忆体 → 概览”。
2. 点击“创建记忆体”。
3. 使用主题明确的名称，例如“项目决策”。
4. 在说明中写清“哪些内容属于这里，以及什么任务应召回它”。
5. 开启读取激活开关。

### 沉淀一条测试信息

点击右上角“沉淀记忆”，填写一条稳定、自包含、未来仍有用且不含秘密的信息。默认不要展开高级选项，让记忆子 Agent 自己选择目标、查重与提炼。

只有点击“调度子 Agent 判断并沉淀”才会启动写入；取消弹窗不会改变状态。

### 验证召回

1. 打开“记忆体 → 检索”。
2. 输入一个能命中刚才内容的具体问题。
3. 先用“直接检索”检查原始证据。
4. 确认结果包含记忆体来源、分类、重要性、分数和 ID。

也可以在对话中运行：

```text
/mnemon status
/mnemon recall <聚焦查询>
```

## 7. 验证对话内记忆

在一个确实依赖历史信息的问题中，让 Agent 自主判断是否需要召回。完成后：

- 若本轮调用了记忆工具，回复下方会出现“本回合记忆”；
- 展开后可以看到具体工具名，并点击跳到对应页面；
- “存入记忆”会先打开可编辑确认弹窗，取消不会写入。

[![本回合记忆与工具跳转](../assets/screenshots/conversation-turn-memory.png)](../assets/screenshots/conversation-turn-memory.png)

普通聊天不应强制召回。当前请求、现有源文件和实时工具结果应优先于历史内容。

## 8. 下一步

- 用 [Sidebar 与对话交互指南](./ui-guide.md) 认识全部页面。
- 用[存储模型](./storage-model.md)决定信息应进入运行时、档案还是记忆体。
- 用[配置参考](./configuration.md)设置工作区范围、只读模式或生命周期开关。
- 用[运维指南](./operations.md)导出第一份 ZIP 备份并建立升级前检查流程。
