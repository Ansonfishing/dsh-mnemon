# WebUI、工具、命令与 RPC

**简体中文** | [English](../en/interfaces.md) | [文档中心](./README.md)

## Web 工作台

`displayMode=sidebar`（默认）通过左侧栏打开独立工作台，`displayMode=buildin` 通过原有 DSH `conversation.view` 内嵌标签页打开同一功能界面。两种形态由设置页实时切换且不会同时挂载；它们共享全部功能、数据请求和工作区状态，但使用互相隔离的外观定义。侧栏入口、工作台标题、功能文案和时间格式订阅 DSH 全局语言并即时更新，界面同时跟随全局明暗主题。

Sidebar 使用贴近 DSH 官方面板的极简皮肤：标题为“记忆系统”，不展示 Mnemon Logo、顶部统计或导航装饰。标题后从首帧起依次展示存储位置模式、工作区模式下的查看工作区选择器，以及仅在查看目标与对话实际工作区不同时出现的一键对齐模块；右侧状态只显示“已连接”，窄宽度也不隐藏文字。一级标签收敛为「状态、运行时、记忆体、档案」；记忆体保留标题与用途说明，其下提供「概览、检索、内容、实体」二级标签，并把「沉淀记忆」放在标题右侧作为主操作。运行时、记忆体和档案都采用“标题区右侧添加、下方查看/检索”的结构，添加和编辑统一打开 DSH 风格弹窗；弹窗将键盘焦点限制在内部，关闭后返回触发按钮。目录卡片的激活开关固定在右上角，编辑和删除位于稳定的底部操作区，物理删除另开危险确认弹窗。沉淀弹窗默认只显示候选内容，高级约束可选展开。「状态、运行时、记忆体、档案」一级页头固定在画布顶点，滚动前后坐标不变；记忆体内「概览、检索、内容、实体」的二级内容标题不锁定并随内容滚动。检索、关联结果、实体入口、实体记忆和内容列表都按批次挂载，并显示“当前数量 / 总数”和“再显示”；运行时在 Sidebar 合并为带明确胶囊外形的 USER / MEMORY 标签、范围筛选和内容查询的单列；档案目录分批展示，桌面端正文在独立阅读区滚动并在切换档案时回到顶部，移动端仍使用自然页面滚动。切换查看工作区或保存核心配置时，旧页面子树会在新请求开始前卸载，清除卡片、筛选、弹窗和滚动状态，然后自动读取当前页，无需手动刷新。主操作使用蓝色实心按钮，编辑使用蓝色描边，移除、删除、归档使用红色层级，查看、关联、复制等使用中性按钮，最终危险确认使用红色实心按钮。字体、按钮、下拉框和表单沿用任务看板与 SSH 面板的可读密度；字段内容与选项保持正常字重，只在必要标题和标签上强调。页面切换在浏览器绘制前复位工作区滚动位置，避免旧页面偏移闪现。Buildin 保持原有 Mnemon 品牌头部、状态摘要、八页分组导航、内联表单和既有视觉不变。默认进入「状态」页。

| 页面 / 操作 | 用途 | 调用边界 |
|---|---|---|
| 状态 | CLI、运行时热记忆、存储域、记忆体和 Documents 健康状态 | 聚合读取 |
| 运行时 | 查看容量，并在统一列表中按 USER / MEMORY 或内容筛选、分批维护热记忆 | 普通 mutation 确定性；容量维护可启动 worker |
| 记忆体 | 记忆体目录、激活开关、弹窗编辑、确认删除、多空间实时图谱、节点检查 | 确定性 RPC 读取；开关与编辑走写 RPC；确认后调用 Mnemon 原生 `store remove` 物理删除 |
| 档案 | 分批浏览目录，在独立阅读区搜索、阅读、创建、更新、归档 Documents | 搜索/编辑走控制层；归档启动 worker |
| 沉淀（Sidebar 主操作 / Buildin 页面） | 让记忆 worker 选择范围、查重并写入；支持可选展开的高级约束 | `spawn` 语义写入 |
| 检索 | smart / keyword / basic 直连召回；可选证据限定 Agent 答案 | 直接服务读取；Agent 答案使用无工具 worker |
| 实体 | 高频实体和实体相关上下文 | 直接服务读取 |
| 内容 | 无 recall 副作用地浏览已激活记忆体、复制、克隆或软删除 | 图谱读取；删除走 worker |

图谱每 15 秒同步一次，也可以手动刷新。自然布局、均匀重置、拖拽和键盘微调只影响客户端展示，不修改 Mnemon 数据。

### 对话内交互

记忆系统在对话流内以两个 DSH 原生槽位呈现，全部为纯增量注册，不替换任何官方渲染：

| 槽位 | 呈现 | 数据与交互 |
|---|---|---|
| `conversation.chat.turnTail`（chain） | 回合尾动作行上方一行「本回合记忆 · 召回 N · 沉淀 M · 档案检索 K」；展开列出可点击的具体工具名 | 通过只读 RPC `turn-activity` 从宿主持久会话日志按 turn 统计 `mnemon_*` 调用；chain `select` 拒绝未完成回合，无记忆活动的回合不渲染任何内容；工具名经 `mnemon:anchor` 打开对应的记忆页面 |
| `conversation.chat.assistant-actions`（list，id `mnemon-save`） | 已定稿助手回复动作区（反馈按钮旁）的单图标「存入记忆」操作；悬停显示简短说明，点击打开居中确认窗口 | 复用 DSH 原生 Tooltip、Modal 与 16px 数据图标；模态窗口经只读 RPC `assistant-message` 按 messageId 提取消息文本为可编辑候选，提供独立滚动区域和取消/确认操作；仅确认提交后才走既有写 RPC `supervise`（受监督写回：记忆子 Agent 判断、查重、选择记忆体），显示子 Agent 回执；只读部署提前禁用并提示 |

`turn-activity`、`assistant-message` 为新增只读端点，与既有端点共用同一 Host 通道与错误语义。对话内交互的渲染扩展面契约与后续「正文内联记忆高亮」方案见 Mnemon 档案「dsh-mnemon 对话内记忆交互侦察」。

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

工作台数据请求会携带 `sessionId` 和可选的 `workspaceId`。Host 只接受 `workspaceRegistry` 中已登记的工作区 ID：确定性读取与人工维护路由到 `workspaceId` 指向的查看根，而 Agent、工具和生命周期继续按 `sessionId` 对应 Agent 的 cwd 路由。`status.workspaceContext` 返回两条根目录和 `aligned` 状态；需要 Agent 写入的操作在未对齐时被拒绝。

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
| `supervise` | 工作台候选交给记忆 worker |
| `document` | create / update / archive |
| `remember` | 带可选高级约束的语义写入 |
| `link` | 建立关系 |
| `forget` | 软删除 |
| `body-create` | 创建 Memory Space |
| `body-update` | 更新元数据或 active |

`writeEnabled=false` 时写通道保持稳定注册，但所有 mutation 都会在 Host 边界拒绝。

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
