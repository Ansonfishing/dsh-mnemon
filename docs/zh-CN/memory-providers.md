# 长期记忆 Provider

记忆体是 dsh-mnemon 可替换的第三层：记忆体契约保持稳定，Provider 负责具体数据面。**Mnemon Native 是官方优先、默认实现**；三方 Provider 是显式选择的集成，适合已经使用其他记忆引擎，或需要不同共享、提炼与召回模型的团队。

首版多 Provider 集合参考了 [Hermes Agent](https://github.com/NousResearch/hermes-agent) 已验证的 Provider 范围与生命周期模式，并适配到 dsh-mnemon 的 Host 控制目录、DSH 工具、三层记忆与 WebUI。插件不捆绑任何三方服务端或 SDK。

## Provider 能力矩阵

| Provider | 数据面 | 召回 / 浏览 | 图谱 / 关联 | 写入 | 遗忘 |
|---|---|---|---|---|---|
| **Mnemon Native** | 官方 CLI 操作本地 `mnemon.db` | 支持 / 支持 | 完整类型图谱 / 支持 | 精确写入 | 软删除 |
| **OpenViking** | 已有 HTTP 服务与 `viking://` 记忆根 | 支持 / 支持 | 投影节点 / 不支持 | 异步提炼 | 仅允许精确用户 `.md` 资源的受控硬删除 |
| **Honcho** | v3 工作区 conclusions | 支持 / 支持 | 不支持 / 不支持 | 精确 Peer conclusion | 硬删除 |
| **Mem0** | Platform v3 或自托管 HTTP API | 支持 / 支持 | 不支持 / 不支持 | 异步提炼 | 硬删除 |
| **Hindsight** | Memory bank API 与知识图谱 | 支持 / 支持 | Provider 图谱 / 支持 | 异步 retain | invalidation（软删除） |
| **Holographic** | 本地原子结构化事实文件 | 支持 / 支持 | 实体/语义图谱 / 支持 | 精确事实 | 硬删除 |
| **RetainDB** | Project/User 作用域 HTTP API | 支持 / 支持 | 不支持 / 不支持 | 精确记忆 | 硬删除 |
| **ByteRover** | 本地 `brv` CLI 与知识目录 | 支持 / 不支持 | 不支持 / 不支持 | 异步 curate | 不支持 |
| **Supermemory** | Container 作用域 HTTP API | 支持 / 支持 | 投影节点 / 不支持 | 异步文档摄取 | Provider forget |

Host 只暴露适配器能够兑现的能力；UI 与 Agent 工具不会伪造缺失的图谱、关联、链接、浏览或删除语义。

## 连接字段

| Provider | 必填或已有默认值 | 可选 |
|---|---|---|
| OpenViking | `endpoint`、`targetUri` | `apiKey`、`account`、`user`、`actorPeerId` |
| Honcho | `endpoint`、`workspace`、`userId`、`agentId` | `apiKey` |
| Mem0 | `endpoint`、`mode`、`userId`、`agentId` | `apiKey`、`rerank` |
| Hindsight | `endpoint`、`bankId`、`budget` | `apiKey` |
| Holographic | `defaultTrust`、`minTrust` | `dataPath` |
| RetainDB | `endpoint`、`apiKey`、`project`、`userId` | — |
| ByteRover | `cliPath` | `workingDirectory`、`apiKey` |
| Supermemory | `endpoint`、`apiKey`、`containerTag`、`searchMode` | — |

连接统一在“**记忆体 → 概览**”创建和编辑。普通设置会返回 WebUI；Secret 字段保存在 `<storageRoot>/state/memory-providers.json`，权限为 `0600`，Host 只返回哪些 Secret 已配置。编辑时将已保存 Secret 留空会保持原值，显式“清除”才会移除。

## 手动与智能选择

手动模式保留原工作流：创建记忆体、选择一个引擎、完成配置，之后仍使用同一套检索、内容、实体和沉淀入口。

智能模式从用户勾选的候选建立 allowlist：

1. Host 先强制执行数据边界与必需能力；
2. 只剩一个合格 Provider 时，由规则确定性选择；
3. 有多个合格候选时，隔离的 DSH 子 Agent 结合路由说明、软偏好和用户策略 Prompt 判断；
4. Host 再验证结果属于合格集合，并保存选择来源、理由、置信度与候选 ID。

连接凭据永远不会进入 selector Prompt。`local-only` 会在模型选择前排除全部远程 Provider。Mnemon Native 始终保留为官方本地候选。

## 运维边界

- WebUI 不直接调用远程服务或本地 CLI；Provider I/O 都留在 Host，统一具备取消、超时、进程输出上限和 shell-disabled 参数执行。
- “断开”三方记忆体只删除本地目录登记，不删除底层数据。单条记忆的“遗忘”是另一项按能力开放的操作。
- Holographic 是对本地结构化事实语义的 TypeScript 适配，使用原子 JSON 存储；它不是 Hermes Python/SQLite/HRR 实现的逐字节移植。
- ByteRover 只开放聚焦的 `status`、`query` 与 `curate`；不会虚构广域知识树浏览和删除能力。
- Mnemon Pack 包含 Mnemon Native 记忆体、运行时与档案；三方连接、凭据、本地三方 Store 与远程数据都不进入 Pack。
- 外部产品的可用性、价格、隐私、保留策略和许可证由各自运营方决定。把私有记忆发送给远程 Provider 前应先评估这些边界。

来源归属与许可证边界见[第三方声明](../../THIRD_PARTY_NOTICES.md)。
