# WebUI、工具、命令与 RPC

**简体中文** | [English](../en/interfaces.md) | [文档中心](./README.md)

本页是集成参考。日常使用请先看 [Sidebar 与对话交互指南](./ui-guide.md)。

## 用户界面入口

| 入口 | 默认 | 说明 |
|---|---:|---|
| Sidebar | 是 | 左侧栏独立“记忆系统”工作台；状态、运行时、记忆体、档案四个一级标签 |
| Buildin | 否 | 原有 `conversation.view` 内嵌标签页，保留既有视觉 |
| 本回合记忆 | 是 | 已完成回合的记忆工具摘要；展开后按工具名跳到对应页面 |
| 存入记忆 | 是 | 已定稿助手回复旁的操作；确认后调用监督写入 |
| `/mnemon` | — | 对话命令入口 |
| 模型工具 | — | Root Agent 的结构化读写入口 |

Sidebar 与 Buildin 实时互斥挂载，共享功能、数据和 Host 服务。对话内两个入口可在 `mnemon-ui` 设置中分别关闭。

## 模型工具

### 只读工具

| 工具 | 用途 | Root Agent 路径 |
|---|---|---|
| `mnemon_status` | CLI、配置、存储与目录聚合状态 | 直接服务 |
| `mnemon_memory_bodies` | 读取记忆体目录与统计 | 直接服务 |
| `mnemon_recall` | 从一个或多个 active 记忆体召回 | `spawn` recall worker |
| `mnemon_related` | 从已知 ID 遍历关系 | `spawn` related worker；Root 默认两跳 |
| `mnemon_document_search` | 确定性搜索受管档案 | Documents 控制层 |

“只读”表示不修改受管正文或长期语义内容。`mnemon_document_search` 命中后仍会更新 `lastAccessedAt`，用于 LRU 排序，因此功能只读不等于磁盘只读。

### `writeEnabled=true` 时的工具

| 工具 | 用途 | Root Agent 路径 |
|---|---|---|
| `mnemon_runtime_memory` | `add` / `replace` / `remove` 热记忆 | 确定性控制；add 溢出时可能启动 worker |
| `mnemon_document_manage` | 创建、更新或归档档案 | 创建/更新确定性；归档使用 worker |
| `mnemon_remember` | 沉淀一条长期洞察 | `spawn` write worker |
| `mnemon_link` | 建立 typed relationship | `spawn` write worker |
| `mnemon_forget` | 按精确 ID 软删除 | `spawn` write worker |
| `mnemon_memory_body_create` | 创建独立记忆体 | `spawn` write worker |
| `mnemon_memory_body_update` | 更新名称、说明或 active | `spawn` write worker |
| `mnemon_memory_body_merge` | 非破坏性导入合并 | `spawn` write worker |

worker 内调用同名工具时直接进入服务层，不再递归委派。

## 工具准入建议

- **运行时**：明确偏好、稳定项目约定、环境事实和高频经验。
- **档案**：具有完整结构和理由的设计、调查、流程、复盘或交接。
- **记忆体**：需要跨任务保留，或适合图关系与深召回的稳定事实、决策和洞察。
- **跳过**：问题、猜测、临时进度、完成日志、原始输出、秘密和可轻易从仓库重新发现的普通事实。

`mnemon_forget` 是破坏性语义操作；只有用户明确要求，或内容已确认错误 / 过时时才应执行。

## `/mnemon` 命令

```text
/mnemon
/mnemon status
/mnemon recall <查询>
/mnemon related <完整记忆 ID>
/mnemon remember <内容>
/mnemon forget <精确 ID>
```

- 空 `/mnemon` 等价于 `status`。
- `status` 是确定性读取，不启动模型。
- `recall`、`related`、`remember`、`forget` 使用命令所在 live Agent 作为 worker parent。
- 命令 recall 最多返回 10 条。
- `forget` 必须接收一个不含空格的精确 ID。

## 对话内交互契约

| DSH 槽位 | 注册 | 行为 |
|---|---|---|
| `conversation.chat.turnTail` | chain | 通过 `turn-activity` 汇总完成回合中的 `mnemon_*` 调用；无活动或未完成回合不渲染 |
| `conversation.chat.assistant-actions` | list，`id=mnemon-save` | 通过 `assistant-message` 读取已定稿文本；只在用户确认后调用 `supervise` |

两者都是增量注册，不替换 DSH 官方渲染。`assistant-message` 读取的候选可编辑，长回复会按界面上限截取；写入结果以记忆子 Agent 回执为准。

## 工作区路由

工作台请求携带 `sessionId` 和可选 `workspaceId`。Host 只接受 `workspaceRegistry` 已登记的 ID：

- 确定性读取与人工维护可以路由到 `workspaceId` 选择的查看根；
- Agent、工具、命令和生命周期仍按 `sessionId` 对应 Agent cwd 路由；
- `status.workspaceContext` 返回 selected / effective roots 与 `aligned`；
- 需要 Agent 的操作在未对齐时拒绝。

## RPC 通道

RPC 是 DSH Host 与插件客户端之间的内部桥，不是稳定外部 HTTP API。

### 读通道

```text
channel:   /dsh-mnemon-read
authority: trusted-host
```

| Endpoint | 行为 |
|---|---|
| `status` | 服务、版本、生命周期、档案与存储上下文聚合状态 |
| `versions` | 检查 Mnemon 与 dsh-mnemon 当前 / 最新版本和安装来源 |
| `runtime-memory` | 运行时快照 |
| `documents` / `document` / `document-search` | 档案目录、正文与确定性搜索 |
| `graph` / `bodies` | active 多空间图谱与记忆体目录 |
| `list` / `entities` | 内容列表与实体聚合 |
| `search` / `agent-search` / `related` | 直接检索、证据回答与关系遍历 |
| `turn-activities` / `turn-activity` | 会话或单回合的记忆工具活动 |
| `assistant-message` | 按 messageId 读取已定稿助手文本 |

### 写通道

```text
channel:   /dsh-mnemon-write
authority: loopback
```

| Endpoint | 行为 |
|---|---|
| `runtime-memory` | 热记忆 mutation |
| `supervise` | 把候选交给记忆 worker |
| `document` | create / update / archive |
| `remember` / `link` / `forget` | 长期语义写入、关系与软删除 |
| `body-create` / `body-update` / `body-delete` | 记忆体创建、编辑与确认后的物理删除 |
| `version-update` | 更新明确组件；Host 固定命令与参数 |

`writeEnabled=false` 时通道仍稳定注册，但所有 mutation 在 Host 边界拒绝。

### 备份通道

```text
channel:   /dsh-mnemon-pack
authority: loopback
```

| Endpoint | 行为 |
|---|---|
| `target` | 当前有效根与范围 |
| `export` | 导出完整、带 manifest 与 SHA-256 校验的 ZIP |
| `inspect` | 解析并校验待导入 ZIP，返回组件与占用预览 |
| `import` | 把 ZIP 安全合并到当前有效根；只读模式拒绝 |

备份包含私有记忆，因此整个通道保持 loopback-only。

### 设置通道

```text
channel:   /dsh-mnemon-settings
authority: loopback
namespaces: mnemon, mnemon-ui
endpoints: get, mutate
```

mutation 使用 settings revision 防止覆盖并发编辑。`mnemon` 管理 Host / 存储设置；`mnemon-ui` 管理 `turnBar` 与 `saveAction`。

## npm 导出

根包公开 Host 侧组合与核心类：

```text
apply
Config / resolveConfig
createRunner
MnemonService
RuntimeMemoryController
DocumentManager
StorageScopeInspector
MnemonSubagentCoordinator
MnemonLifecycle
```

`dsh-mnemon/client` 导出 DSH client bundle 的 `apply` 与 `inject`。客户端实现类与 RPC endpoint 目前均属于内部实现，不应当作稳定公共 SDK。

## 国际化范围

主要 Sidebar / Buildin 工作台、设置与对话内入口支持中文和英文，并跟随 DSH locale 实时切换。品牌名、工具名和配置键不翻译。`/mnemon` 命令、模型工具卡、部分 Host 错误与兼容元数据尚未完全国际化。
