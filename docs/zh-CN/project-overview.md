# 项目介绍：面向 DSH 的本地三层记忆系统

**简体中文** | [English](../en/project-overview.md) | [文档中心](./README.md)

`dsh-mnemon` 是 DeepSeek Harness（DSH）的本地 Mnemon 记忆插件。它不试图用一个数据库解决所有上下文问题，而是把“每轮必须知道的内容”“需要完整阅读的项目知识”和“跨会话按需召回的长期历史”放在三个职责清晰的层级中，再由 DSH 提供监督、路由、生命周期和用户界面。

项目的核心目标是：让 Agent 获得长期连续性，同时保持当前任务优先、上下文紧凑、写入可审计、失败时不丢原始数据。

[![Mnemon 记忆体总览：记忆体目录、激活状态与多空间实时关系图](./assets/screenshots/overview-memory-graph.png)](./assets/screenshots/overview-memory-graph.png)

*总览把记忆体目录、激活状态、统计信息和多空间关系图放在同一工作面中；点击图片可查看原始分辨率。*

## 为什么需要它

仅依赖当前对话上下文时，Agent 很难稳定延续用户偏好、项目约定和历史决策；把全部历史直接塞入 prompt，又会造成上下文膨胀、过期信息干扰和成本增加。单一长期数据库同样无法兼顾以下需求：

| 需求 | 直接使用单一存储的问题 | dsh-mnemon 的处理方式 |
|---|---|---|
| 下一轮立即知道稳定偏好和约定 | 每次检索会增加延迟，且可能漏召回 | Runtime Memory 每轮注入紧凑投影 |
| 快速阅读完整设计、调查或流程 | 拆成碎片后会失去叙事结构 | Documents 保留可检索的 Markdown 原文 |
| 跨会话查找事实、决策和关系 | 全量加载会污染当前上下文 | Memory Spaces 按需召回图增强证据 |
| 长文不常用但仍需追溯 | 永久保留在热层会持续占用容量 | 先建立长期冷引用，再迁移原文 |
| 让模型判断价值又不把安全交给模型 | LLM 输出无法承担路径、并发和事务保证 | LLM 负责语义判断，Host 负责硬边界 |

## 项目定位

`dsh-mnemon` 是集成与监督层，不是新的记忆数据库：

- **DSH** 提供主 Agent、生命周期事件、工具、命令、设置、Web 扩展点和 subagent provider；
- **dsh-mnemon** 提供三层记忆控制面、路由提示、容量维护、并发屏障、权限边界和双语工作台；
- **Mnemon CLI** 提供本地 SQLite Store、四类关系图、确定性检索、关系遍历和长期写入。

当前用户指令、实时工具结果和仓库事实始终高于历史记忆。插件的职责是提供可复核证据，而不是让历史内容覆盖当前事实。

## 总体架构

[![dsh-mnemon 运行时架构：DSH Web、主 Agent、监督控制层与三层本地存储](./assets/project-architecture.svg)](./assets/project-architecture.svg)

架构可以理解为四个边界：

1. **交互边界**：用户通过 DSH 对话、`/mnemon` 命令、模型工具和 Web 工作台使用记忆能力。
2. **监督边界**：生命周期只提供短提示；长期召回、语义写入和维护任务在受限子 Agent 中执行。
3. **确定性控制边界**：Host 校验输入、路径、权限、revision、UTF-8 容量、锁、超时和进程参数。
4. **本地数据边界**：Runtime、Documents 和 Memory Spaces 统一位于选定的 `storageRoot`，无需远程记忆服务。

更细的模块分工、root/worker 双路径和 RPC 信任边界见[架构设计](./architecture.md)。

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

## 一次请求如何使用记忆

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

## 写入与维护如何被监督

插件把语义判断与系统保证分开：

| LLM / worker 负责 | Host 硬保证 |
|---|---|
| 判断内容是否值得长期保存 | 输入 schema 和操作权限 |
| 选择最窄的 Memory Space | 路径不能逃逸工作区边界 |
| 识别重复、冲突和语义簇 | CLI 参数数组启动且禁用 shell |
| 摘要、路由和关系理由 | 超时、取消、输出上限和进程串行 |
| 判断复杂工作是否形成项目档案 | 文件锁、临时文件、rename 和 revision fence |
| 在 persona 范围内保守维护 | UTF-8 容量计算和失败时保留原数据 |

普通长期召回与语义写入优先使用名为 `spawn` 的隔离 provider；评分后台审查严格要求名为 `fork`、且 `inheritsParentContext=true` 的 provider。两类 provider 都必须支持 `outputSchema`、`toolFilter`、`persona` 和 `depthLimit`。

后台审查只在已完成 turn 的确定性活动评分达到门槛、主 Agent 持续空闲后启动。新 turn 会取消等待或运行中的 review，并保留进程内活动水位。当前 review 只能维护热记忆和至多一份 Document，不直接使用长期 `remember` / `forget` 工具；“至多一次”是 persona 约束，不是 Host mutation counter。

召回、写入、容量维护、冷归档和评分公式详见[生命周期与核心流程](./workflows.md)。

## 端到端示例：保存一项架构决策

假设一次复杂任务确认了“所有外部 CLI 必须使用参数数组启动并禁止 shell”，同时产出完整的威胁分析和迁移说明：

1. 这条高频执行约定可以作为简短事实进入 `MEMORY.md`，从下一轮开始直接可见。
2. 完整分析和迁移步骤适合进入 active Document，保留标题、章节、代码片段和来源文件。
3. 若该决策需要跨项目长期召回，受限 worker 会选择合适的 Memory Space，先查重，再写入自包含决策，并可与相关安全原则建立关系。
4. 未来询问“为什么不能拼接 shell 命令”时，Agent 先看到热层规则；需要理由时搜索 Document；需要跨会话关联时再召回 Mnemon 证据。
5. 当 Document 长期不再频繁访问且 active 容量不足时，插件先写入带摘要和哈希的冷引用，再迁移原文。未来仍可沿引用追溯完整分析。

同一知识因此可以按使用频率和叙事粒度在不同层保留互补表达，而不是把整份文档复制到每轮 prompt，或把一个短规则强行扩展成长记录。

## 实际会话中的召回与写回

用户要求回顾过去思考时，主 Agent 可以先检查记忆体目录和项目档案，再从已激活空间召回；若确需访问 inactive 空间，可在受控流程中临时激活并在读取后恢复原状态。工具轨迹让检索次序、空间选择和来源都可观察。

[![DSH 会话中的记忆召回：档案检索、多记忆体召回与状态恢复](./assets/screenshots/conversation-recall.png)](./assets/screenshots/conversation-recall.png)

当用户明确要求记住稳定内容时，主 Agent 使用结构化 Runtime Memory 工具逐条写入，Host 继续负责目标、容量和 revision 校验。最终回复会说明实际写入了什么，而不是把内部推理当作持久化结果。

[![DSH 会话中的记忆写回：结构化 Runtime Memory 工具调用与写入回执](./assets/screenshots/conversation-writeback.png)](./assets/screenshots/conversation-writeback.png)

## 用户与集成入口

### Web 工作台

会话“记忆体”Tab 提供八个页面：

| 页面 | 主要用途 |
|---|---|
| 总览 | Memory Space 目录、激活开关和多空间实时图谱 |
| 运行时 | USER / MEMORY 热记忆、容量和确定性维护 |
| 档案 | Documents 检索、阅读、编辑和冷归档 |
| 检索 | direct recall、related 和 evidence-only Agent 查询 |
| 实体 | 高频实体及其跨图上下文 |
| 沉淀 | 把候选交给受限 worker 查重、路由和写入 |
| 内容 | 浏览、复制、克隆或软删除长期记忆 |
| 状态 | CLI、存储域、生命周期和 subagent 诊断 |

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

- **本地数据**：SQLite、registry、Runtime JSON 和 Documents 都位于用户选定的根目录。
- **无 shell 执行**：Mnemon CLI 使用 `spawn(command, args, { shell: false })`。
- **有界进程**：单次调用有超时、取消和 2 MiB stdout + stderr 上限。
- **并发控制**：Runtime 和 Documents 使用进程内队列与跨实例 lock file；CLI 调用在一个 Runner 内串行。
- **原文优先保护**：revision 冲突、worker 失败或回执无效时，不用过期结果覆盖当前热记忆或移动 active Document。
- **可恢复投影**：有效 `memories.json` 可以重建 `USER.md` 和 `MEMORY.md`。
- **最小权限 worker**：每类 worker 都有固定 persona、工具白名单、结构化输出和 `maxDepth: 1`。

这些边界不等于秘密扫描器或完整备份系统。当前没有确定性凭据检测、跨系统回滚、内置一致快照或通用损坏修复工具。生产数据应建立独立备份与恢复演练，详见[运维、安全与故障排查](./operations.md)。

“本地优先”描述的是持久化位置和 CLI 执行方式，并不保证被选中的内容永远不离开设备。若 DSH 的主模型或 subagent provider 运行在远端，相关 prompt、候选内容或召回证据仍可能发送给该 provider；数据处理边界取决于实际 DSH 模型配置。

## 适用场景

`dsh-mnemon` 适合：

- 长期协作中需要稳定延续用户偏好和工作约定；
- 大型项目需要保存设计理由、调查记录和交接知识；
- 多个知识域需要隔离存储、选择性激活和跨空间召回；
- 希望数据留在本地，同时让 LLM 负责语义判断；
- 需要可查看、可编辑、可诊断的 DSH 原生记忆体验。

它不适合把秘密、原始日志、短期进度或可从仓库直接重建的普通事实批量写入长期存储，也不应被当作事实源、权限系统、备份系统或主动通知守护进程。

## 当前限制

- `writeEnabled=false` 是功能只读，不是只读文件系统保证；读取仍可能修复投影、更新 Document LRU 或触发上游 migration。
- `tabEnabled=false` 当前只停止 Host Mnemon 数据 RPC，客户端 Tab 仍可能出现。
- 后台审查水位只保存在 Host 进程内，重启后不会恢复未处理活动。
- `global` / `custom` 范围下 Documents 可能跨工作区共享，尚无独立 workspace ownership。
- 冷引用提示中的计划路径在非 workspace scope 下可能与真实绝对位置不同。
- 项目尚未发布正式的 DSH、Mnemon、Node 和数据格式兼容矩阵。
- 真实 DSH + Mnemon WebUI E2E 仍以发布前人工验证为主。

这些缺口及优先级记录在 [Roadmap](./roadmap.md)。

## 继续阅读

- 想立即运行：阅读[快速开始](./getting-started.md)。
- 想理解代码边界：阅读[架构设计](./architecture.md)。
- 想选择数据范围：阅读[存储与三层记忆模型](./storage-model.md)和[配置参考](./configuration.md)。
- 想理解事务和 review：阅读[生命周期与核心流程](./workflows.md)。
- 想部署或升级：阅读[运维、安全与故障排查](./operations.md)。
- 想参与开发：阅读[开发与验证](./development.md)。
