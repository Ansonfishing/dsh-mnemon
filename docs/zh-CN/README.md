# dsh-mnemon 文档中心

**简体中文** | [English](../en/README.md) | [项目首页](../../README.md)

这里按“你现在要完成什么”组织文档。第一次使用从快速开始进入；需要理解页面时看 UI 指南；只有在部署、集成或开发时才需要进入参考文档。

## 新用户路径

1. [快速开始](./getting-started.md)：安装 Mnemon 与插件，选择存储范围，完成第一次验证。
2. [Sidebar 与对话交互指南](./ui-guide.md)：认识状态、运行时、记忆体、档案和对话内入口。
3. [项目介绍](./project-overview.md)：理解三层模型、读写边界与完整流转。

## 按任务查找

| 我想要…… | 文档 |
|---|---|
| 决定一条信息应放在哪一层 | [存储与三层记忆模型](./storage-model.md) |
| 了解每轮注入、召回、沉淀和归档何时发生 | [生命周期与核心流程](./workflows.md) |
| 切换 Sidebar / Buildin、全局 / 工作区 / 自定义目录 | [配置参考](./configuration.md) |
| 理解工作区“查看目录”与 Agent“实际生效目录” | [UI 指南：工作区模式](./ui-guide.md#工作区模式查看与执行分离) |
| 检查或更新 Mnemon 与 dsh-mnemon | [运维指南：版本检查与更新](./operations.md#版本检查与更新) |
| 备份、恢复或迁移完整记忆目录 | [运维指南：备份与恢复](./operations.md#备份与恢复) |
| 排查召回为空、目录未对齐、CLI 或 Provider 问题 | [运维、安全与故障排查](./operations.md#故障排查) |
| 使用模型工具、`/mnemon` 命令或内部 RPC | [接口参考](./interfaces.md) |
| 理解 Host、worker、控制面与数据面 | [架构设计](./architecture.md) |
| 修改代码、截图、测试或发布 | [开发与验证](./development.md) |
| 查看下一阶段计划 | [Roadmap](./roadmap.md) |

## 核心术语

| 中文 | 英文 / 代码名 | 含义 |
|---|---|---|
| 记忆系统 | Memory System | dsh-mnemon 在 DSH 中的完整入口 |
| 运行时记忆 | Runtime Memory | 每轮注入的 USER / MEMORY 热记忆 |
| 档案 | Project Documents | 受管、可检索、保留完整 Markdown 叙事的项目知识 |
| 记忆体 | Memory Space | 独立、可激活、按需召回的长期 Mnemon Store |
| 沉淀 | Remember / Distill | 把候选交给受监督子 Agent 判断、查重与写入 |
| 召回 | Recall | 从已激活记忆体按需取回有界证据 |
| 归档 | Archive | 先建立冷引用，再把不常用档案迁出 active 层 |

## 文档边界

- 用户文档以 v0.1.3 的 Sidebar 默认体验为主，同时说明 Buildin 兼容形态。
- 架构图表达稳定执行边界，不是实时监控面板；实时数量与版本以“状态”页为准。
- RPC 是 Host 与插件客户端之间的内部协议，不承诺稳定外部 API。
- 当前没有正式固定的 DSH / Mnemon 版本矩阵；升级前应备份并在隔离目录验证。
