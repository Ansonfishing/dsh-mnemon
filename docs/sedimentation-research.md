# 可沉淀知识研究文档(dsh-mnemon)

> [!WARNING]
> 本文是实现过程中的历史研究台账，包含特定测试环境与旧版术语，不是当前产品规范、用户手册或能力承诺。请以根 README 和 `docs/zh-CN`、`docs/en` 为准；本文不随发布包分发。

> 研究目的:梳理当前可写入 Mnemon 记忆图谱的稳定、可复用、自包含的洞察,
> 为「记忆系统」工作台的监督沉淀(supervised writeback)提供经过蒸馏的候选清单。

## 1. 沉淀准入标准

依据本仓库 README「推荐使用方式」与 Mnemon 生命周期判断,进入图谱的知识必须满足:

| 准入 | 说明 |
|---|---|
| 稳定 | 项目约定、决策及其理由、流程、非显而易见的事实 |
| 可复用 | 未来会话确实会检索并因此受益 |
| 自包含 | 脱离来源文档仍可独立解读 |
| 可复核 | 与仓库事实、当前用户指令不冲突;冲突时以当前事实为准 |

**拒绝写入**:秘密与密钥、临时进度与普通聊天、直接从仓库可读的事实、尾部截断的
残缺文本、整章文档的逐字拷贝、归属错误项目的内容、与已有记忆的未解决冲突。

## 2. 背景:两次整章候选的拒存与蒸馏

两次 supervised writeback 提交了上游 [mnemon-dev/mnemon](https://github.com/mnemon-dev/mnemon)
的「引擎设计哲学」章节与中文 README 全文。两者因以下原因拒存:

1. **尾部截断** —— 文本止于半句,内容残缺;
2. **非自包含** —— 依赖 `../DESIGN.md`、`../../diagrams/*.jpg` 等外部文件,
   且这些文件不在本仓库(dsh-mnemon);
3. **整章拷贝** —— 数千字文档原样入库会稀释图谱检索质量;
4. **归属错位** —— 内容描述 Mnemon 二进制项目本身,而非本插件;若需持久化,
   应进入上游项目自己的 store,或先蒸馏为洞察。

但其中确实含有稳定的设计知识与判断原则。下文将其蒸馏为适合沉淀的独立条目。

## 3. 上游设计知识蒸馏候选

### 3.1 LLM-Supervised 架构定位

- **内容**:Mnemon 采用 LLM-Supervised 模式——本地 binary 负责确定性运算
  (存储、四图索引、检索、衰减、去重),宿主 LLM 负责高价值判断(记什么、
  怎么关联、何时遗忘)。它与三种模式相对照:LLM-Embedded(Mem0、MAGMA 原始
  实现,管线内嵌小模型)、File Injection(Claude Code CLAUDE.md,静态读文件)、
  MCP Server(claude-mem 等,把记忆操作暴露为 MCP 工具)。
- **价值**:解释「为什么 Mnemon 零额外 API 成本、LLM 可替换、判断力随宿主
  LLM 升级而增强」,是后续所有 Mnemon 相关任务的背景锚点。
- **建议参数**:category `fact`,importance `4`,entities `["mnemon"]`,
  tags `["architecture", "llm-supervised"]`。

### 3.2 协议空白与三原语

- **内容**:MCP 标准化了 LLM↔Tools,ODBC/JDBC 标准化了 App↔DB,但 LLM 以
  记忆语义与数据库交互的一层没有协议。Mnemon 的 `remember` / `link` /
  `recall` 三原语是图构建范式 Extract → Candidate → Associate 的映射;
  在图存储上读写路径对称,LLM 只需一种认知模式即可处理读与写。命令名是
  语义化的(`recall` 而非 SELECT),输出是带信号透明度的结构化 JSON。
- **价值**:回答「为什么协议是这个形状」,是理解工具设计的核心洞察。
- **建议参数**:category `insight`,importance `4`,entities `["mnemon"]`,
  tags `["protocol", "primitives", "recall", "remember", "link"]`。

### 3.3 四图架构与存储退化谱系

- **内容**:单一关系视角(如向量相似度)不足以支撑记忆系统;Mnemon 维护
  temporal / entity / causal / semantic 四类边。KV、关系型、文档型、向量
  存储分别是图的退化形式,各丢失一个维度的关系语义;向量只能回答「什么像
  什么」,不能回答「什么导致什么」。
- **价值**:解释四图检索(temporal/semantic/causal/entity 意图)为何必要。
- **建议参数**:category `insight`,importance `4`,entities `["mnemon"]`,
  tags `["graph", "four-graph", "retrieval"]`。

### 3.4 理论基础溯源

- **内容**:范式取自 RLM(LLM as orchestrator,LLM 操作外部结构化环境优于直接
  处理原始数据,arXiv 2512.24601);方法论取自 MAGMA(四图架构 + intent-adaptive
  retrieval + multi-signal fusion,arXiv 2601.03236);Transformers-as-GNNs 等价性
  文献(arXiv 2506.22084 等)支撑「LLM 内部即图操作 → 外部记忆用图存储是结构
  匹配而非工程便利」。
- **价值**:为设计决策提供可查证的出处,便于后续引用与答辩。
- **建议参数**:category `fact`,importance `3`,entities `["mnemon"]`,
  tags `["theory", "rl", "references"]`。

### 3.5 生命周期四个 hook phase

- **内容**:Prime / Remind / Nudge / Compact 是提醒而非硬 workflow——Prime 让
  skill、guide 与当前 store 可见;Remind 触发 recall 判断;Nudge 触发 writeback
  判断;Compact 在上下文压缩前只保存关键连续性。本插件将其映射为 DSH 的
  Prime / Recall / Writeback 生命周期 gate。
- **价值**:dsh-mnemon 编排层的直接上游语义来源。
- **建议参数**:category `fact`,importance `4`,entities `["mnemon", "dsh-mnemon"]`,
  tags `["lifecycle", "hooks"]`。

### 3.6 分发形态

- **内容**:Mnemon 只发布一个 `mnemon` 二进制,搭配 SKILL.md(教 LLM 命令协议)
  与 guide.md(判断指引);同一二进制可被 Claude Code、Cursor、Pi、OpenCode 等
  复用,换 LLM 或 CLI 框架不改二进制。
- **价值**:dsh-mnemon 作为又一个宿主集成的存在依据。
- **建议参数**:category `fact`,importance `3`,entities `["mnemon", "dsh-mnemon"]`,
  tags `["distribution", "integration"]`。

## 4. 本仓库自身的沉淀候选

### 4.1 已沉淀(store `dsh-lifecycle-e2e`)

- **E2E 预置唯一标记 NEBULA-8B13**(id `a4143323-…`):只有通过 mnemon recall
  才能得知;importance 5。
- **回归报告顺序约定**(id `e2365f52-…`):生命周期回归报告固定按
  Recall → Supervise → Status 顺序记录验证结果;importance 4。

### 4.2 候选:文档归属原则

- **内容**:上游项目(mnemon-dev/mnemon)的文档不整章写入本插件(dsh-mnemon)
  的 store;应先蒸馏为独立洞察,或写入上游项目自己的 store。
- **价值**:本次会话实际得出的判断原则,未来遇到同类「大文档写回」请求可直接复用。
- **建议参数**:category `decision`,importance `4`,entities `["dsh-mnemon", "mnemon"]`,
  tags `["writeback", "policy", "sedimentation"]`。

### 4.3 候选:拒存清单实践

- **内容**:supervised writeback 遇到以下形态应拒存并建议蒸馏——尾部截断的
  残缺文本、整章文档逐字拷贝、依赖仓库外文件的非自包含内容、归属错误项目的
  内容、与既有记忆未解决的冲突。
- **价值**:把准入标准从 README 的原则层落到可执行的拒绝形态层。
- **建议参数**:category `insight`,importance `3`,entities `["dsh-mnemon"]`,
  tags `["writeback", "policy", "rejection"]`。

## 5. 关联建议

沉淀完成后的有价值链接(仅当两侧 ID 均已确认):

| 来源 | 目标 | 类型 | 理由 |
|---|---|---|---|
| 3.1 LLM-Supervised | 3.2 三原语 | semantic | 架构立场决定协议形状 |
| 3.2 三原语 | 3.3 四图架构 | semantic | 读写对称性建立在图存储之上 |
| 3.5 hook phase | 4.2 归属原则 | causal | 上游生命周期语义引出本插件的编排与归属约定 |
| 4.1 顺序约定 | 4.3 拒存清单 | semantic | 同属写回治理约定 |

## 6. 实施方式

1. 在 DSH Web「记忆 → 沉淀」逐条提交第 3、4 节的候选文本,由当前 DSH LLM
   查重、提炼并调用 `mnemon_remember`;
2. 写入后按第 5 节用 `mnemon_link` 建立关系(使用 recall 返回的完整 ID);
3. 本文件留在仓库作为候选来源与参数台账,本身不写入记忆(仓库可读的事实
   不沉淀,避免重复)。
