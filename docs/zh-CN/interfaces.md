# WebUI、工具、命令与 RPC

**简体中文** | [English](../en/interfaces.md) | [文档中心](./README.md)

## Web 工作台

主要 Web 界面跟随 DSH 全局语言和明暗主题。顶部导航分为三组，组间以分隔线呈现：「状态」独立成第一组；「运行时、记忆体、档案」对应三层存储；「沉淀、检索、实体、内容」为读写工具。默认进入「状态」页。

| 页面 | 用途 | 调用边界 |
|---|---|---|
| 状态 | CLI、运行时热记忆、存储域、记忆体、Documents、生命周期和 worker 诊断 | 聚合读取 |
| 运行时 | 查看和维护 USER / MEMORY 热记忆及容量 | 普通 mutation 确定性；容量维护可启动 worker |
| 记忆体 | 记忆体目录、激活开关与元信息编辑、多空间实时图谱、节点检查 | 确定性 RPC 读取；开关与元信息编辑为写 RPC |
| 档案 | 搜索、阅读、创建、更新、归档 Documents | 搜索/编辑走控制层；归档启动 worker |
| 沉淀 | 让记忆 worker 选择范围、查重并写入；支持高级约束 | `spawn` 语义写入 |
| 检索 | smart / keyword / basic 直连召回；可选证据限定 Agent 答案 | 直接服务读取；Agent 答案使用无工具 worker |
| 实体 | 高频实体和实体相关上下文 | 直接服务读取 |
| 内容 | 无 recall 副作用地浏览已激活记忆体、复制、克隆或软删除 | 图谱读取；删除走 worker |

图谱每 15 秒同步一次，也可以手动刷新。自然布局、均匀重置、拖拽和键盘微调只影响客户端展示，不修改 Mnemon 数据。

## 模型工具

### 只读工具

| 工具 | 用途 | Root Agent 路径 |
|---|---|---|
| `mnemon_memory_bodies` | 读取 Memory Space 目录和统计 | 直接服务 |
| `mnemon_recall` | 从一个或多个 active spaces 召回 | `spawn` recall worker |
| `mnemon_related` | 从已知 ID 遍历关系 | `spawn` related worker；root 路径固定请求两跳 |
| `mnemon_status` | CLI、配置和 active spaces 聚合状态 | 直接服务 |
| `mnemon_document_search` | 确定性搜索受管 Documents | 直接 Documents 控制层 |

这里的“只读”表示不修改受管正文或长期语义内容。`mnemon_document_search` 命中后仍会更新 `lastAccessedAt` 并重写 Document index，用于 LRU 排序。

### `writeEnabled=true` 时的工具

| 工具 | 用途 | Root Agent 路径 |
|---|---|---|
| `mnemon_runtime_memory` | `add` / `replace` / `remove` 热记忆 | 确定性控制层；add 溢出时 worker |
| `mnemon_document_manage` | 创建、更新或归档 Document | 创建/更新确定性；归档 worker |
| `mnemon_remember` | 长期沉淀一条洞察 | `spawn` write worker |
| `mnemon_link` | 建立 typed relationship | `spawn` write worker |
| `mnemon_forget` | 按精确 ID 软删除 | `spawn` write worker |
| `mnemon_memory_body_create` | 创建独立 Memory Space | `spawn` write worker |
| `mnemon_memory_body_update` | 更新名称、description、active | `spawn` write worker |
| `mnemon_memory_body_merge` | 非破坏性导入合并 | `spawn` write worker |

worker 内调用同名工具时直接到服务层，不再委派。

## 工具准入建议

- 热记忆：用户明确偏好、稳定项目约定、环境事实和高频经验。
- Document：形成完整结构和理由的设计、调查、流程或交接。
- 长期 Memory Space：明确要求跨任务保留，或适合图关系和深召回的稳定洞察。
- 跳过：问题、猜测、临时进度、完成日志、原始输出、秘密、可轻易重新发现的仓库事实。

`mnemon_forget` 是破坏性语义操作，只有用户明确要求或内容已被验证错误/过时时才应执行。

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
- `status` 确定性读取，不启动模型。
- `recall`、`related`、`remember` 和 `forget` 使用命令所在 live Agent 作为 worker parent。
- 命令 recall 最多返回 10 条。
- `forget` 参数必须是一个不含空格的精确 ID。
- 当前命令帮助和结果主要为中文，尚未跟随 Web locale。

## RPC 通道

RPC 是 DSH Host 与本插件 Web client 的内部桥，不是承诺稳定的外部 HTTP API。

### 读通道

```text
channel:   /dsh-mnemon-read
authority: trusted-host
```

| Endpoint | 行为 |
|---|---|
| `runtime-memory` | Runtime 快照 |
| `status` | 服务、生命周期、Documents 和存储域聚合状态 |
| `documents` | Document 目录快照 |
| `document` | 读取一份 Document |
| `document-search` | 确定性搜索，命中会更新 LRU 元数据 |
| `graph` | 聚合 active Memory Spaces 图谱 |
| `bodies` | Memory Space 目录 |
| `list` | 内容列表 |
| `entities` | 实体统计或实体相关上下文 |
| `search` | 直接 Mnemon 检索 |
| `agent-search` | 直接检索后做证据限定回答 |
| `related` | 直接关系遍历 |

### 写通道

```text
channel:   /dsh-mnemon-write
authority: loopback
```

| Endpoint | 行为 |
|---|---|
| `runtime-memory` | 热记忆 mutation |
| `supervise` | Tab 候选交给记忆 worker |
| `document` | create / update / archive |
| `remember` | 带可选高级约束的语义写入 |
| `link` | 建立关系 |
| `forget` | 软删除 |
| `body-create` | 创建 Memory Space |
| `body-update` | 更新元数据或 active |

`writeEnabled=false` 时整个写通道不注册。

### 设置通道

```text
channel:   /dsh-mnemon-settings
authority: loopback
endpoints: get, mutate
```

mutation 使用 settings revision 防止覆盖并发编辑。

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

`dsh-mnemon/client` 用于 DSH client bundle 的 `apply` 与 `inject`。`MnemonClient` 和 RPC endpoint 当前属于内部实现，不应当作稳定公共 SDK。

## 国际化范围

Web 词典保持中文/英文键一一对应，品牌名、工具名和配置键不翻译。尚未完整国际化的表面包括：

- `/mnemon` 命令输出；
- 模型工具展示卡标题；
- 部分 Host 校验和诊断错误；
- 兼容发现旧 Store 时写入的默认名称和说明。
