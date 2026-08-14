# 存储与三层记忆模型

**简体中文** | [English](../en/storage-model.md) | [文档中心](./README.md)

## 为什么是三层

一种存储形态无法同时满足“每轮都可见”“保留完整叙事”和“长期图增强召回”：

| 问题 | 对应层 | 原因 |
|---|---|---|
| 下一轮必须直接知道什么？ | Runtime Memory | 极小、直接进入 prompt |
| 哪份设计或流程需要快速完整阅读？ | active Documents | 保留 Markdown 结构，不必做深召回 |
| 哪些历史事实和关系应跨会话存在？ | Memory Spaces | 独立数据库、图关系、按需召回 |
| 长文已不常用但仍需追溯怎么办？ | archived Documents | Mnemon 留索引，冷层保留原文 |

推荐查询梯度：

```text
current request and repository facts
             |
             v
Runtime Memory already in prompt
             |
             v
search active Documents
             |
             v
recall active Memory Spaces
             |
             v
follow an exact cold reference when full text is required
```

## 统一根目录

```text
<storageRoot>/
+-- runtime/
|   +-- memories.json
|   +-- USER.md
|   +-- MEMORY.md
+-- documents/
|   +-- index.json
|   +-- active/
|   +-- archived/
+-- data/
|   +-- .dsh-memory-bodies.json
|   +-- <memory-space-id>/
|       +-- mnemon.db
+-- state/                         # reserved; no persistent reviewer yet
```

`storageScope` 决定整个根，而不只是 Mnemon 数据库。`workspace` 范围会为每个已登记 DSH 工作区解析独立的 `<workspace>/.mnemon`；Web 查看目标与当前会话执行目标彼此独立，只有后者会驱动 Agent、工具和生命周期。`state/` 当前只会被状态盘点器识别；评分水位仍保存在运行中 Host 的内存中。

## Runtime Memory

### 语义

- `target=user`：身份、角色、长期偏好、习惯、沟通风格和明确协作要求。
- `target=memory`：项目、环境、决策、约定、工具特性和可复用经验。
- `importance=critical|normal|low`：用于整理时的保留优先级。

当前不实现 `daily` target。

### 事实源和投影

`runtime/memories.json` 是唯一事实源。每条记录包含：

```text
content
created_at
updated_at
target
importance
```

`USER.md` 和 `MEMORY.md` 是确定性派生文件。每个条目被归一成单行，条目之间使用单独一行的 `§` 分隔；`§` 是保留字符。启动和 prompt 组装时，控制层会从 JSON 修复缺失或被手工修改的投影。

### 操作

- `add` 写入独立新事实，完全相同的内容不会重复添加。
- `replace` 用 `old_text` 的唯一子串定位并替换整个条目。
- `remove` 用唯一子串移除整个条目。
- 零命中或多命中都拒绝，不执行模糊修改。

### 容量

| 目标 | 上限 | 维护方式 |
|---|---:|---|
| `USER.md` | 4 KiB | 本地、无工具 worker 保守合并，不进入 Memory Space |
| `MEMORY.md` | 10 KiB | worker 先归档已提交内容，再返回压缩候选 |

容量按投影正文的实际 UTF-8 字节计算。单条内容最大 8 KiB。自动容量维护只由溢出的 `add` 触发；导致溢出的 `replace` 会直接报错，调用方应先显式整理。

## Project Documents

### 用途

Documents 保存比单条记忆更完整、又希望快速阅读的项目知识，例如：

- 架构设计和理由；
- 有证据的调查结论；
- 操作流程、发布清单和故障复盘；
- 实现交接与长期维护说明。

用户画像、普通聊天、临时进度、原始大日志和秘密不应进入 Documents。

### 控制面

`documents/index.json` 是元数据事实源，管理 ID、标题、description、状态、文件名、来源路径、session、时间、revision、SHA-256、大小和 Memory Space 引用。Markdown 托管副本带有生成的 frontmatter。

`sourcePaths`：

- 只能指向当前会话工作区内部；
- 只作为来源引用，不会被插件修改；
- 当前实现不要求路径实际存在；
- 不允许指向受管 `documents/` 目录自身。

### 范围

Documents 的物理共享范围由 `storageScope` 决定：

- `workspace`：通常随项目隔离；
- `global` / `custom`：多个工作区可能共享同一个 `documents/index.json`。

因此“项目档案”表示内容类型，不保证天然按工作区物理隔离。当前会话工作区只约束新写入的 `sourcePaths`。

### 容量与冷热分层

| 项目 | 限制 |
|---|---:|
| 单份正文 | 最大 2 MiB |
| active 总量 | 最大 10 MiB，包含生成后的 frontmatter |
| archived 总量 | 不计 active 上限 |

创建或更新前会计算真实投影大小。空间不足时按 `lastAccessedAt`、再按 `updatedAt` 选择最久未访问的 active 文档；先写入/验证 Mnemon 冷引用，再在 revision 未变化时迁移原文。

默认搜索只覆盖 active。搜索会更新命中文档的 `lastAccessedAt`，因此它对正文只读，但会写索引元数据。

## Memory Spaces

每个记忆体是一个 Mnemon 原生命名 Store，并在 `.dsh-memory-bodies.json` 中增加可维护元数据：

```text
id            Host 生成的稳定 UUID 或已发现的兼容 Store 名
name          人类可读名称
description   路由边界：什么属于这里、何时召回
active        是否参与读取
mnemon.db     独立数据面
```

### 读写边界

- 召回、图谱、内容和实体读取只使用已激活记忆体。
- 指定未激活记忆体进行读取会被拒绝。
- 写入可以选择已登记的任意记忆体。
- 对未激活目标写入成功后，插件自动激活它。
- 没有显式目标且激活数量不是 1 时，确定性服务要求调用方先选择目标。

### 创建、发现和合并

- 创建时模型提供 name 和 description，Host 生成 ID。
- 既有 `<storageRoot>/data/<store>/mnemon.db` 会被发现并登记，不移动数据库。
- 合并通过 Mnemon import 把来源内容导入目标；来源数据库保留，默认只将来源设为未激活。
- `forget` 是按精确 ID 的软删除，不等于删除数据库文件。

## 四类关系

Mnemon 长期层保留 `temporal`、`semantic`、`causal` 和 `entity` 关系。插件不会要求每条记忆都手工创建关系；关系应在确实能改善未来召回时建立。记忆体页可以聚合多个已激活记忆体的记忆、实体、关系和空间归属。

## 数据权威表

| 数据 | 权威源 | 派生/缓存 |
|---|---|---|
| 热记忆 | `runtime/memories.json` | `USER.md`、`MEMORY.md` |
| Documents | `documents/index.json` + 托管 Markdown | excerpt、搜索排序、状态聚合 |
| Memory Space 目录 | `data/.dsh-memory-bodies.json` + 磁盘 Store | Web 状态聚合 |
| 长期记忆 | 各 Store 的 `mnemon.db` | HTML/DOT 图谱解析结果 |
| 审查水位 | Host 进程内存 | 状态页快照；尚未持久化 |
