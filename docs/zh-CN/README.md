# dsh-mnemon 文档中心

**简体中文** | [English](../en/README.md) | [返回项目首页](../../README.md)

这组文档以当前代码实现为事实源。根 README 用于快速理解；这里展开设计理由、边界、事务流程、配置和运维方式。

## 建议阅读路径

1. [项目介绍](./project-overview.md)：项目定位、Mnemon 与 DSH 的集成边界、三层模型、总体架构与适用场景。
2. [快速开始](./getting-started.md)：安装、首次配置与基本验证。
3. [架构设计](./architecture.md)：DSH Host、Web Client、控制层、子 Agent 与 Mnemon CLI 的边界。
4. [存储与三层记忆模型](./storage-model.md)：Runtime、Documents、Memory Spaces 的语义和目录结构。
5. [生命周期与核心流程](./workflows.md)：召回、写入、后台审查、容量整理和归档。
6. [配置参考](./configuration.md)：全部配置、默认值、优先级和 provider 要求。
7. [WebUI、工具、命令与 RPC](./interfaces.md)：所有用户与模型入口。
8. [运维、安全与故障排查](./operations.md)：锁、权限、备份、恢复和已知限制。
9. [开发与验证](./development.md)：模块结构、测试、构建和发布检查。
10. [Roadmap](./roadmap.md)：尚未完成的可靠性、运维和国际化工作。
11. [安全策略](../../SECURITY.md)：支持版本、漏洞私密报告渠道与范围。

## 术语

| 中文 | English | 含义 |
|---|---|---|
| 记忆体 | Memory Space | 一个 Mnemon 原生命名 Store 及其独立 `mnemon.db` |
| 运行时热记忆 | Runtime Memory / hot memory | 每轮直接注入的紧凑用户画像和工作记忆 |
| 项目档案 | Project Documents | 由插件托管的完整 Markdown 项目知识 |
| 活跃档案 | Active Document | 参与默认近场检索的档案 |
| 归档 | Archive | 已建立长期索引、不计 active 容量的原文 |
| 沉淀 | Distill / supervised writeback | 经 LLM 判断、查重和路由后的持久写入 |
| 召回 | Recall | 从已激活记忆体读取历史证据 |

品牌名、命令、工具名、配置键、RPC endpoint 和代码符号保持原样，不翻译。

## 文档边界

- 当前用户指令和仓库事实高于历史记忆。
- `state/` 目前是预留目录；后台审查水位仍只存在于 Host 进程内。
- 主要 Web 工作台已提供中文和英文；命令输出、工具卡和部分后端诊断尚未全部国际化。
- `docs/sedimentation-research.md` 是历史研究记录，不是规范或用户手册。
