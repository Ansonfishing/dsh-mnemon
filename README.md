# dsh-mnemon

**简体中文** | [English](./README.en.md)

> **LLM-supervised 4-graph persistent memory for AI agents.**

`dsh-mnemon` 是 DeepSeek Harness（DSH）的本地 Mnemon 记忆插件。它把每轮可见的运行时热记忆、可直接阅读的项目档案（Documents）和按需召回的长期记忆体（Memory Spaces）组织成一个受监督、可检索、可维护的三层体系。

Mnemon 继续负责本地 SQLite 存储、四类关系图和确定性检索；DSH 负责提示词接入、生命周期、子 Agent 编排、WebUI、命令与权限边界。当前用户指令和仓库事实始终高于历史记忆。

## 三层记忆

| 层级 | 适合保存 | 如何进入上下文 |
|---|---|---|
| 运行时热记忆 | 用户偏好、稳定约定、环境事实、常用经验 | `USER.md` / `MEMORY.md` 每轮注入 |
| 项目档案 | 设计、调查、流程、架构理由、交接材料 | 先对 active Documents 做确定性检索 |
| 记忆体 | 跨会话的长期事实、决策、实体与关系 | 从已激活 Memory Spaces 按需召回 |

```text
                       DSH Agent
                           |
             +-------------+-------------+
             |                           |
       every-turn context          search on demand
             |                           |
             v                           v
    +-----------------+       +---------------------+
    | Runtime Memory  | ----> | Active Documents    |
    | USER / MEMORY   |       | managed Markdown    |
    +-----------------+       +----------+----------+
                                         |
                                  deeper recall
                                         v
                              +---------------------+
                              | Mnemon Memory       |
                              | Spaces + four graphs|
                              +----------+----------+
                                         |
                                  cold reference
                                         v
                              +---------------------+
                              | Archived Documents  |
                              +---------------------+
```

## 核心能力

- 统一的 `global`、`workspace` 或 `custom` 存储范围，覆盖三层数据。
- 多记忆体目录：每个记忆体拥有稳定 ID、名称、路由说明、激活状态和独立 `mnemon.db`。
- 受限子 Agent：长期召回与语义写入使用隔离的 `spawn` worker；后台审查使用继承已完成 checkpoint 的 `fork` worker。
- 可靠容量维护：USER 热记忆在本地保守合并，MEMORY 热记忆先归档再压缩，Documents 先建立冷索引再迁移；revision 冲突时保留原数据。
- DSH 原生体验：模型工具、`/mnemon` 命令、双语 Web 工作台、全局明暗主题和诊断状态页。
- 本地优先：CLI 以参数数组启动且禁用 shell；数据库和文档不需要远程记忆服务。

## 前置条件

- 可用的 DSH Web profile。
- 本地 `mnemon` CLI。
- 支持 `outputSchema`、`toolFilter`、`persona` 和 `depthLimit` 的子 Agent provider。常规语义操作优先使用 `spawn`；默认后台审查还需要名为 `fork`、可继承父上下文的 provider。

## 快速开始

安装 Mnemon：

```sh
# macOS
brew install --cask mnemon-dev/tap/mnemon

# macOS / Linux，也可通过 Go 安装
go install github.com/mnemon-dev/mnemon@latest

mnemon --version
```

安装插件并重启 DSH Web profile：

```sh
dsh plugin --profile web add "github:dsh-external/dsh-mnemon"
dsh --profile web
```

本地开发检出使用绝对路径：

```sh
dsh plugin --profile web add "link:/absolute/path/to/dsh-mnemon"
```

打开 DSH 的“设置 -> 插件配置 -> Mnemon”选择存储范围，再进入会话的“记忆体”Tab 创建或激活记忆体。配置重启后生效；切换范围不会自动迁移、合并或删除旧数据。

## 最小配置

配置位于 `$DSH_HOME/settings.yaml`（默认通常为 `~/.dsh/settings.yaml`）：

```yaml
mnemon:
  storageScope: global # global | workspace | custom
```

- `global`：`MNEMON_DATA_DIR`，未设置时为 `~/.mnemon`。
- `workspace`：启动 DSH Host 时工作目录下的 `.mnemon`。
- `custom`：`dataDir` 指定的绝对路径或 `~/...` 路径。

完整配置、覆盖优先级和只读模式见[配置参考](./docs/zh-CN/configuration.md)。

## 使用入口

Web 工作台提供总览、运行时、档案、检索、实体、沉淀、内容和状态八个页面，主要界面随 DSH 全局语言在中文与英文间切换。

常用命令：

```text
/mnemon status
/mnemon recall <查询>
/mnemon related <完整记忆 ID>
/mnemon remember <稳定、自包含的长期洞察>
/mnemon forget <完整记忆 ID>
```

推荐的查询顺序是：热记忆 -> active Documents -> 已激活记忆体 -> 命中记录指向的冷归档原文。不要把临时进度、原始日志、秘密或可直接从仓库重新获得的普通事实写入长期记忆。

## 文档

- [文档中心](./docs/zh-CN/README.md)
- [快速开始](./docs/zh-CN/getting-started.md)
- [架构设计](./docs/zh-CN/architecture.md)
- [存储与三层记忆模型](./docs/zh-CN/storage-model.md)
- [生命周期与核心流程](./docs/zh-CN/workflows.md)
- [配置参考](./docs/zh-CN/configuration.md)
- [WebUI、工具、命令与 RPC](./docs/zh-CN/interfaces.md)
- [运维、安全与故障排查](./docs/zh-CN/operations.md)
- [开发与验证](./docs/zh-CN/development.md)
- [Roadmap](./docs/zh-CN/roadmap.md)

## 开发

```sh
pnpm install
pnpm run verify
```

`verify` 依次运行 TypeScript 检查、Vitest 测试和生产构建。构建产物写入并提交到 `lib/`；详细发布与真实 WebUI 验证流程见[开发文档](./docs/zh-CN/development.md)。

## License

BSD-3-Clause。Mnemon 品牌与标志归上游项目所有；本项目仅用于说明集成关系。
