# 项目介绍：面向 DSH 的本地三层记忆系统

**简体中文** | [English](../en/project-overview.md) | [文档中心](./README.md)

> **`dsh-mnemon` 是 [Mnemon](https://github.com/mnemon-dev/mnemon) 与 DSH 的深度集成插件，为 DSH 提供完备的记忆体能力。**

它把“每轮必须知道的内容”“需要完整阅读的项目知识”和“跨会话按需召回的长期历史”分别放在三个职责清晰的层级中，再由 DSH 提供路由、生命周期、受限子 Agent 和用户界面。

项目的核心目标是：让 Agent 获得长期连续性，同时保持当前任务优先、上下文紧凑、写入可审计、失败时不丢原始数据。

[![Mnemon 记忆体页：记忆体目录、激活状态与多空间实时关系图](./assets/screenshots/overview-memory-graph.png)](./assets/screenshots/overview-memory-graph.png)

*记忆体页把记忆体目录、激活状态、统计信息和多空间关系图放在同一工作面中；点击图片可查看原始分辨率。*

## 为什么需要它

仅依赖当前对话上下文时，Agent 很难稳定延续用户偏好、项目约定和历史决策；把全部历史直接塞入 prompt，又会造成上下文膨胀、过期信息干扰和成本增加。单一记忆层级同样无法兼顾以下需求：

| 需求 | 单一记忆层级的局限 | dsh-mnemon 的处理方式 |
|---|---|---|
| 下一轮立即知道稳定偏好和约定 | 每次检索会增加延迟，且可能漏召回 | Runtime Memory 每轮注入紧凑投影 |
| 快速阅读完整设计、调查或流程 | 拆成碎片后会失去叙事结构 | Documents 保留可检索的 Markdown 原文 |
| 跨会话查找事实、决策和关系 | 全量加载会污染当前上下文 | Memory Spaces 按需召回图增强证据 |
| 长文不常用但仍需追溯 | 永久保留在热层会持续占用容量 | 先建立长期冷引用，再迁移原文 |
| 让模型判断价值又不把安全交给模型 | LLM 输出无法承担路径、并发和事务保证 | LLM 负责语义判断，Host 负责硬边界 |

无论命中哪一层，当前用户指令、实时工具结果和仓库事实始终高于历史记忆。插件提供的是可复核证据与连续性，不允许旧内容覆盖当前事实。

为同时满足即时可见、完整阅读与长期召回三类需求，插件在 DSH 与本地存储之间建立了一套分层、受监督的记忆架构。

## 总体架构

DSH 提供主 Agent 与扩展入口，`dsh-mnemon` 负责三层控制、路由和安全边界，[Mnemon](https://github.com/mnemon-dev/mnemon) 则为长期 Memory Spaces 提供记忆体能力。Runtime 投影与 Documents 原文由插件管理；长期记忆体和归档冷引用通过 Mnemon 保存和检索。

[![dsh-mnemon 运行时架构：DSH Web、主 Agent、监督控制层与三层本地存储](./assets/project-architecture.svg)](./assets/project-architecture.svg)

架构可以理解为四个边界：

1. **交互边界**：用户通过 DSH 对话、`/mnemon` 命令、模型工具和 Web 工作台使用记忆能力。
2. **监督边界**：生命周期只提供短提示；长期召回、语义写入和维护任务在受限子 Agent 中执行。
3. **确定性控制边界**：Host 校验输入、路径、权限、revision、UTF-8 容量、锁、超时和进程参数。
4. **本地数据边界**：Runtime、Documents 和 Memory Spaces 统一位于选定的 `storageRoot`；记忆持久化不依赖远程记忆服务。

### 记忆系统流转

下面的流转图描述稳定的执行边界，而不是实时监控面板。实线表示确定性 Host 路径，虚线表示需要 LLM 判断的受监督 worker 路径；节点不携带当前数量、最近活动或健康状态。

```mermaid
flowchart TB
  subgraph CONTEXT["01 · 每轮上下文"]
    direction LR
    C1["运行时记忆<br/>USER.md + MEMORY.md"] -->|"每轮 prompt assembly"| C2["Root Agent<br/>路由工具调用，不直接访问 SQLite"]
    C2 <--> C3["用户 / 当前任务<br/>当前轮输入与工具轨迹"]
    C2 -->|"按需，不注入全文"| C4["Document 确定性检索"]
    C4 --> C5["项目档案<br/>active Documents"]
    C5 --> C6["证据 / 回执<br/>带来源返回 Root Agent"]
    C6 --> C2
  end

  subgraph SEMANTIC["02 · 按需语义操作"]
    direction LR
    S1["Root Agent<br/>recall · write · related"] -.-> S2["spawn 隔离 worker<br/>语义判断 · 最小工具白名单"]
    S2 -.-> S3["Mnemon Host Bridge<br/>Service → Runner → 本地 CLI"]
    S3 <--> S4["Memory Spaces<br/>长期记忆与关系图"]
    S4 --> S5["证据 / 回执<br/>带来源返回 Root Agent"]
    S5 --> S1
  end

  subgraph MAINTENANCE["03 · 空闲维护与归档"]
    direction TB
    M1["普通 Runtime 与 Document 变更<br/>add / replace / remove · create / update"] --> M2["Host 确定性控制层<br/>锁 · 原子写 · revision · 容量"] --> M3["运行时记忆 / active Documents"]
    M4["活动评分与空闲门控"] -.-> M5["fork 完成检查点<br/>只维护 Runtime / Document"] --> M6["Runtime / active Document<br/>保守维护 · 新轮次取消审查"] --> M7["证据 / 回执"]
    M8["项目档案"] -.-> M9["spawn 归档 worker<br/>容量维护 / 人工归档"] -.-> M10["Mnemon Host Bridge"] --> M11["1 · 写入并验证 Mnemon 冷索引"] --> M12["2 · revision fence 后迁移原文<br/>失败或冲突保留 active"]
  end

  classDef host fill:#eef5ff,stroke:#4b77be,color:#17233a
  classDef worker fill:#f7f3ff,stroke:#8b6ce7,stroke-dasharray:5 3,color:#28203d
  classDef store fill:#f1faf4,stroke:#55a36f,color:#173321
  classDef task fill:#fafafa,stroke:#8a8a8a,color:#222
  class C2,C4,S3,M2,M10 host
  class S2,M5,M9 worker
  class C1,C5,S4,M3,M6,M8,M11,M12 store
  class C3,C6,S1,S5,M1,M4,M7 task
```

[![记忆系统流转原始中文界面：每轮上下文、按需语义操作、空闲维护与归档](./assets/architecture/memory-system-flow.zh-CN.png)](./assets/architecture/memory-system-flow.zh-CN.png)

*中文原始界面截图保留了迁移前的完整布局，用作架构图的视觉与实现参考。*

这三条链路分别回答：每轮上下文从哪里来、语义操作如何隔离执行，以及普通写入、空闲审查和冷归档如何保护原始数据。具体触发门槛、工具权限和失败语义见[生命周期与核心流程](./workflows.md)。

更细的模块分工、root/worker 双路径和 RPC 信任边界见[架构设计](./architecture.md)。

架构边界决定谁可以执行操作，内置 Prompt 决定 LLM 何时主动使用能力，三层模型则决定信息以什么粒度保存、何时进入上下文。

## 内置 Prompt 与主动记忆

插件通过系统 Prompt、动态注入的最新 `USER.md` / `MEMORY.md`、生命周期提示与工具说明，把 Runtime Memory、Documents、Memory Spaces、关系和目录维护等全部读写能力呈现给 LLM，启发它在当前任务可能受益时主动调用相应能力，而不是等待用户逐个指定工具。

“主动”不等于每轮无条件读写：当前任务始终优先；无需记忆时继续工作；任何写入都必须以有效工具回执为完成依据。当用户明确表达意图时，LLM 会按信息的粒度和目标选择不同路径：

| 用户意图或任务信号 | 优先调用的能力 |
|---|---|
| 回顾过去、寻找历史依据、补齐精确旧细节 | 先检索 active Documents，再按需 `mnemon_recall` / `mnemon_related` |
| 记住偏好、稳定约定或纠正旧信息 | `mnemon_runtime_memory` 的 `add` / `replace` / `remove` |
| 保存完整设计、调查、流程或交接材料 | `mnemon_document_search` 后创建或更新受管 Document，必要时执行归档 |
| 长期沉淀事实或决策、建立关系、忘记内容、调整记忆体 | 由受限 worker 查重和路由后调用 Memory Space 写入与维护能力 |

即使用户没有逐字要求“记住”，明确且可复用的新事实也可以触发主动热记忆写入；当已完成工作达到活动评分门槛且主 Agent 保持空闲时，`fork` 后台审查还会保守检查热记忆与项目档案。完整提示策略、生命周期门槛和工具权限见[生命周期与核心流程](./workflows.md)与[接口参考](./interfaces.md)。

## 三层记忆模型

### 1. Runtime Memory：每轮可见的热记忆

Runtime Memory 保存高频且紧凑的稳定信息：

- `target=user`：身份、角色、长期偏好、习惯、沟通风格和明确协作要求；
- `target=memory`：项目约定、环境事实、决策、工具特性和可复用经验。

`runtime/memories.json` 是唯一事实源，`USER.md` 和 `MEMORY.md` 是每轮注入 prompt 的确定性投影。USER 上限为 4 KiB，MEMORY 上限为 10 KiB，单条内容最大 8 KiB，均按 UTF-8 字节计算。

普通 `add`、`replace` 和 `remove` 由确定性控制层完成。只有 `add` 造成容量溢出时才触发维护：USER 在本地由无工具 worker 保守合并；MEMORY 先由受限 worker 归档长期语义，再压缩热层候选。导致溢出的 `replace` 会直接拒绝，不会自动整理。

[![运行时记忆页面：USER 与 MEMORY 热记忆、容量和编辑操作](./assets/screenshots/runtime-memory.png)](./assets/screenshots/runtime-memory.png)

*运行时页面并列展示 USER 与 MEMORY 两个投影的容量、重要度、分类和逐条编辑入口。*

### 2. Project Documents：保留完整叙事的项目档案

Documents 保存比单条记忆更完整、又需要快速阅读的知识，例如架构理由、调查结论、操作流程、故障复盘和实现交接。正文保持 Markdown 结构，并通过标题、description 和正文做确定性检索。

单份正文最大 2 MiB，active Documents 渲染后总量最大 10 MiB。容量不足或人工归档时，插件先让受限 worker 在 Mnemon 中建立带摘要和 SHA-256 的冷引用，再在 Document revision 未变化时把原文移入 `archived/`。这一顺序优先保护 active 原文，但不是跨 SQLite 与文件系统的可回滚分布式事务。

Documents 的共享范围跟随 `storageScope`。在 `global` 或 `custom` 下，多个工作区可能共享同一个 Document index；当前会话工作区只约束新写入的 `sourcePaths`，不构成独立 ownership。

[![项目档案页面：Document 列表、元数据与 Markdown 原文渲染](./assets/screenshots/documents-markdown.png)](./assets/screenshots/documents-markdown.png)

*档案页面保留 Document 元数据与 Markdown 结构，列表选择、检索和正文阅读在同一页面完成。*

### 3. Memory Spaces：长期、隔离、按需召回

每个 Memory Space（记忆体）对应一个 Mnemon 原生命名 Store 和独立的 `mnemon.db`。插件为它补充稳定 ID、名称、路由 description 和 active 状态。

- 读取只覆盖已激活记忆体；
- 写入可以指定任意已登记记忆体；
- 向 inactive 目标写入成功后会自动激活；
- 新建记忆体时，模型提供语义名称和边界，Host 生成稳定 ID；
- 合并通过非破坏性 import 完成，默认停用来源但不删除来源数据库。

Mnemon 长期层保留 `temporal`、`semantic`、`causal` 和 `entity` 四类关系。召回结果携带 Memory Space 来源和记忆 ID，主 Agent 可以继续沿关系图获取上下文。

完整目录、容量和权威源说明见[存储与三层记忆模型](./storage-model.md)。

三层并非彼此孤立的仓库，而是组成了一条由近到远、按需扩展的查询路径；信息也可以在明确写入或受控维护时，以适合其频率和粒度的形式沉淀下来。

## 从当前请求到长期沉淀

### 读取：由近到远，按需升级

插件遵循由近到远的查询梯度：

1. 当前请求、实时工具结果和仓库事实优先；
2. 主 Agent 已能看到每轮注入的 Runtime Memory；
3. 需要完整项目知识时，先确定性搜索 active Documents；
4. 需要历史决策、跨会话事实或关系时，再调用监督召回；
5. 命中冷引用且确需全文时，最后读取 archived Document 原文。

主 Agent 调用 `mnemon_recall` 后，coordinator 启动一个隔离 worker。worker 只能查看记忆体目录、执行 recall 和遍历 related；它根据名称与 description 选择 active Memory Spaces，返回有上限的结构化证据。原始路由推理和完整目录不会被灌入主对话。

Web 的直接检索走确定性服务；“Agent 查询”则先完成相同检索，再启动一个无 Mnemon 工具的 evidence-only worker，只根据命中内容组织答案并返回有效 citation。

[![检索页面：Agent 查询答案、来源记忆 ID 与原始召回结果](./assets/screenshots/recall-agent-answer.png)](./assets/screenshots/recall-agent-answer.png)

*“Agent 查询”把证据限定在本次命中范围内，同时保留来源记忆 ID 和原始召回条目，方便核验答案。*

真实会话中，主 Agent 可以先检查记忆体目录和项目档案，再从已激活空间召回；若当前任务确需访问 inactive 空间，也可以在受控流程中临时激活，并在读取后恢复原状态。工具轨迹让检索次序、空间选择和来源都可观察。

[![DSH 会话中的记忆召回：档案检索、多记忆体召回与状态恢复](./assets/screenshots/conversation-recall.png)](./assets/screenshots/conversation-recall.png)

### 写入：语义判断与系统保证分离

读取路径解决何时使用记忆；写入路径还需要约束谁来判断、谁来落盘，以及失败时如何保护原始数据。

插件把语义判断与系统保证分开：

| LLM / worker 负责 | Host 硬保证 |
|---|---|
| 判断内容是否值得长期保存 | 输入 schema 和操作权限 |
| 选择最窄的 Memory Space | 路径不能逃逸工作区边界 |
| 识别重复、冲突和语义簇 | CLI 参数数组启动且禁用 shell |
| 摘要、路由和关系理由 | 超时、取消、输出上限和进程串行 |
| 判断复杂工作是否形成项目档案 | 文件锁、临时文件、rename 和 revision fence |
| 在 persona 范围内保守维护 | UTF-8 容量计算和失败时保留原数据 |

长期召回、语义写入与容量维护使用隔离的 `spawn` worker；后台审查只在已完成 turn 达到活动评分门槛、主 Agent 持续空闲后使用继承 checkpoint 的 `fork` worker。新 turn 会取消等待或运行中的审查。worker 的上下文、工具和输出均受限，Host 继续负责确定性校验；完整 provider 要求和审查边界见工作流文档。

召回、写入、容量维护、归档和评分公式详见[生命周期与核心流程](./workflows.md)。

当用户明确要求记住稳定内容时，主 Agent 会根据内容类型使用结构化工具逐条写入，Host 继续负责目标、容量和 revision 校验。最终回复说明真正写入的内容，而不是把内部推理当作持久化结果。

[![DSH 会话中的记忆写回：结构化 Runtime Memory 工具调用与写入回执](./assets/screenshots/conversation-writeback.png)](./assets/screenshots/conversation-writeback.png)

### 三层协同示例：保存一项架构决策

假设一次复杂任务确认了“所有外部 CLI 必须使用参数数组启动并禁止 shell”，同时产出完整的威胁分析和迁移说明：

1. 这条高频执行约定可以作为简短事实进入 `MEMORY.md`，从下一轮开始直接可见。
2. 完整分析和迁移步骤适合进入 active Document，保留标题、章节、代码片段和来源文件。
3. 若该决策需要跨项目长期召回，受限 worker 会选择合适的 Memory Space，先查重，再写入自包含决策，并可与相关安全原则建立关系。
4. 未来询问“为什么不能拼接 shell 命令”时，Agent 先看到热层规则；需要理由时搜索 Document；需要跨会话关联时再召回 Mnemon 证据。
5. 当 Document 长期不再频繁访问且 active 容量不足时，插件先写入带摘要和哈希的冷引用，再迁移原文。未来仍可沿引用追溯完整分析。

同一知识因此可以按使用频率和叙事粒度在不同层保留互补表达，而不是把整份文档复制到每轮 prompt，或把一个短规则强行扩展成长记录。

这些流程既能由 Agent 工具主动完成，也可以在 DSH 的记忆系统工作台中查看、核验和维护。

## 用户与集成入口

### Web 工作台

默认 `sidebar` 形态由左侧栏“记忆系统”入口打开独立主内容区工作台，并采用无 Mnemon Logo 的 DSH 官方风格极简皮肤；可在设置中切换为 `buildin`，恢复原有对话区内嵌标签页及其既有视觉。两种形态复用同一功能工作台、隔离外观定义并实时互斥挂载。Sidebar 以「状态、运行时、记忆体、档案」作为一级标签，记忆体下提供「概览、检索、内容、实体」二级标签，「沉淀记忆」改为右侧主操作；三类记忆的添加都从标题区右侧进入弹窗。Buildin 仍使用原有八页分组导航和内联表单：

`workspace` 存储范围下，顶部选择器是独立的“查看上下文”：可以留在当前对话不变的情况下查看和维护另一个已登记 DSH 工作区。Agent、工具和生命周期使用的是“执行上下文”，始终跟随当前会话 cwd。查看与执行目录不一致时，整个工作台都会显示路径差异和一键对齐入口；需要启动 Agent 的操作在未对齐时不会执行。

| 页面 / 操作 | 主要用途 |
|---|---|
| 状态 | CLI、运行时热记忆、存储域、记忆体和 Documents 健康状态 |
| 运行时 | USER / MEMORY 热记忆、容量和确定性维护 |
| 记忆体 | Memory Space 目录、激活开关、元信息编辑和多空间实时图谱 |
| 档案 | Documents 检索、阅读、编辑和归档 |
| 沉淀（Sidebar 主操作 / Buildin 页面） | 把候选交给受限 worker 查重、路由和写入；高级约束可选展开 |
| 检索 | direct recall、related 和 evidence-only Agent 查询 |
| 实体 | 高频实体及其跨图上下文 |
| 内容 | 浏览、复制、克隆或软删除长期记忆 |

主要 Web 界面与设置卡支持中文和英文，并跟随 DSH 全局明暗主题。命令输出、工具卡和部分后端诊断仍未完全国际化。

[![实体页面：高频实体、命中数量与实体相关上下文](./assets/screenshots/entities-context.png)](./assets/screenshots/entities-context.png)

*实体页面按命中数量聚合名称，并在右侧保留相关记忆、类别、重要度、分数和记忆体来源。*

[![内容页面：长期记忆筛选、标签、关系与维护操作](./assets/screenshots/memory-content.png)](./assets/screenshots/memory-content.png)

*内容页面用于筛选和检查长期记忆，并提供查看关系、基于当前条目新建、复制 ID 与软删除操作。*

### 模型工具与命令

插件注册只读和写入两组 `mnemon_*` 模型工具，并提供：

```text
/mnemon status
/mnemon recall <查询>
/mnemon related <完整记忆 ID>
/mnemon remember <稳定、自包含的长期洞察>
/mnemon forget <完整记忆 ID>
```

Web RPC 是 DSH Host 与插件客户端之间的内部桥：读通道要求 `trusted-host`，记忆写通道和设置通道要求 `loopback`。它们不是稳定的外部 HTTP SDK。完整工具和 RPC 表见[WebUI、工具、命令与 RPC](./interfaces.md)。

## 本地优先与可靠性设计

在可见性之外，插件还通过确定性边界约束路径、容量、并发与失败恢复。

- **本地数据**：SQLite、registry、Runtime JSON 和 Documents 都位于用户选定的根目录。
- **无 shell 执行**：Mnemon CLI 使用 `spawn(command, args, { shell: false })`。
- **有界进程**：单次调用有超时、取消和 2 MiB stdout + stderr 上限。
- **并发控制**：Runtime 和 Documents 使用进程内队列与跨实例 lock file；CLI 调用在一个 Runner 内串行。
- **原文优先保护**：revision 冲突、worker 失败或回执无效时，不用过期结果覆盖当前热记忆或移动 active Document。
- **可恢复投影**：有效 `memories.json` 可以重建 `USER.md` 和 `MEMORY.md`。
- **最小权限 worker**：每类 worker 都有固定 persona、工具白名单、结构化输出和 `maxDepth: 1`。

这些边界不等于秘密扫描器或完整备份系统。当前没有确定性凭据检测、跨系统回滚、内置一致快照或通用损坏修复工具。生产数据应建立独立备份与恢复演练，详见[运维、安全与故障排查](./operations.md)。

“本地优先”描述的是持久化位置和 CLI 执行方式，并不保证被选中的内容永远不离开设备。若 DSH 的主模型或 subagent provider 运行在远端，相关 prompt、候选内容或召回证据仍可能发送给该 provider；数据处理边界取决于实际 DSH 模型配置。

## 适用范围与版本状态

`dsh-mnemon` 适合：

- 长期协作中需要稳定延续用户偏好和工作约定；
- 大型项目需要保存设计理由、调查记录和交接知识；
- 多个知识域需要隔离存储、选择性激活和跨空间召回；
- 希望数据留在本地，同时让 LLM 负责语义判断；
- 需要可查看、可编辑、可诊断的 DSH 原生记忆体验。

它不适合把秘密、原始日志、短期进度或可从仓库直接重建的普通事实批量写入长期存储，也不应被当作事实源、权限系统、备份系统或主动通知守护进程。

当前版本处于早期 Beta 阶段，仍在持续优化和迭代中；部分后续能力与演进计划见 [Roadmap](./roadmap.md)。

## 继续阅读

- 想立即运行：阅读[快速开始](./getting-started.md)。
- 想理解代码边界：阅读[架构设计](./architecture.md)。
- 想选择数据范围：阅读[存储与三层记忆模型](./storage-model.md)和[配置参考](./configuration.md)。
- 想理解事务和 review：阅读[生命周期与核心流程](./workflows.md)。
- 想部署或升级：阅读[运维、安全与故障排查](./operations.md)。
- 想参与开发：阅读[开发与验证](./development.md)。
