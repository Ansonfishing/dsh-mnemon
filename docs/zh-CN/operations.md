# 运维、安全与故障排查

**简体中文** | [English](../en/operations.md) | [文档中心](./README.md)

## 健康检查

先检查二进制，再检查插件聚合状态：

```sh
command -v mnemon
mnemon --version
```

```text
/mnemon status
```

`mnemon status` 会打开有效 Store，上游 CLI 可能初始化默认数据或执行迁移；它不是完全无副作用的只读探测。插件状态页还会检查 active Memory Spaces、Documents、生命周期和 subagent 计数。

## 安全边界

### 进程

- `spawn(command, args, { shell: false })`，不拼接 shell 命令。
- stdout + stderr 默认合计限制 2 MiB。
- 每次 CLI 调用受 `timeoutMs` 和 AbortSignal 控制。
- 超时或取消先发送 `SIGTERM`，1.5 秒后仍未退出则发送 `SIGKILL`。
- 一个 `MnemonRunner` 内的 CLI 调用串行，避免同一进程内并发迁移导致 SQLite 锁冲突。

串行队列不替代跨 DSH 进程协调；多个 Host 同时访问同一 Mnemon Store 时仍依赖 Mnemon/SQLite 自身的并发语义。

### 文件

- Runtime 和 Documents 都有进程内队列及跨实例 lock file。
- 等待锁默认最多 5 秒；锁超过 30 秒才被视为 stale。
- 写入使用临时文件和 rename。
- Runtime 用 revision 阻止过期压缩覆盖并发修改。
- Document 归档用数字 revision 阻止移动已被更新的 active 原文。
- `sourcePaths` 不能逃出发起会话工作区，也不能指向受管 Documents 目录。

### Web

- 读 RPC：`trusted-host`。
- 记忆写 RPC：`loopback`。
- 设置 RPC：`loopback`。
- WebUI 不直接读取 SQLite 或启动进程。

### 模型

- worker 使用 persona、工具白名单、结构化输出和 `maxDepth: 1`。
- 用户查询、候选内容、Document 正文和历史记忆均按不可信数据处理。
- 证据回答 worker 无 Mnemon 工具，只能使用 Host 提供的命中内容。

这些边界不等于秘密扫描器。当前还没有确定性的凭据/秘密检测；不要向热记忆、Documents 或 Memory Spaces 提交密钥、token、私钥和原始敏感日志。

### 安全问题报告

发现安全漏洞请按 [SECURITY.md](../../SECURITY.md) 的渠道私下报告（GitHub Security Advisories 或维护者邮箱），不要开公开 issue。范围内的典型问题包括：数据丢失、路径穿越、锁与 revision 检查绕过、子 Agent 隔离破坏、WebUI 对记忆内容的注入。

## 备份

三层数据共用 `storageRoot`，一致备份应覆盖整个根，而不是只复制 `mnemon.db`：

```text
<storageRoot>/runtime
<storageRoot>/documents
<storageRoot>/data
<storageRoot>/state    # when present
```

推荐过程：

1. 停止 DSH Host 和其他写入同一根的进程。
2. 记录当前插件、DSH 和 `mnemon --version`。
3. 复制整个根到新的、带时间戳的目录。
4. 对备份执行文件清单或校验和。
5. 在隔离路径中完成恢复演练后再依赖它。

项目当前没有内置一致快照、导出或恢复命令；运行中直接复制可能捕获跨文件不一致状态。

## 恢复

1. 停止所有使用目标根的 DSH/Mnemon 进程。
2. 保留现有根的第二份副本，不要直接覆盖唯一数据。
3. 把完整备份恢复到一个新目录。
4. 先用 `storageScope=custom` 指向新目录。
5. 启动并检查 Runtime 投影、Document index、Memory Space 目录和 recall。
6. 验证后再决定是否替换原根。

`USER.md` / `MEMORY.md` 损坏时，控制层可从有效的 `memories.json` 修复；损坏的 JSON、Document index 或 SQLite 不存在自动通用修复流程。

## 切换存储范围

插件不会自动迁移数据：

```text
old scope -- change setting + restart --> new empty or existing scope

no implicit copy
no implicit merge
no implicit delete
```

需要迁移时，停止写入后复制完整根。合并两套根不能靠目录覆盖，因为 JSON index、registry 和多个数据库都可能冲突；应在备份上设计显式合并方案。

## 故障排查

| 现象 | 检查与处理 |
|---|---|
| Mnemon 不可用 | 运行 `command -v mnemon`、`mnemon --version`；设置 `MNEMON_CLI_PATH` 或 `cliPath` 后重启 |
| 状态正常但召回为空 | 检查是否有 active Memory Space、当前 `storageScope`、DSH 启动 cwd 和查询是否足够聚焦 |
| `memoryBodyId is required...` | active 数量不是恰好 1；让 worker 或调用方显式选择目标 |
| `memory body is not active for reading` | 在记忆体页激活目标；写入 inactive 可以，但读取不行 |
| subagent provider 错误 | 普通任务需要完整隔离能力；后台审查另需 `fork + inheritsParentContext` |
| 设置保存后无变化 | 所有选项重启后生效 |
| custom 目录被拒绝 | 使用绝对路径、`~` 或 `~/...` |
| Document 无 workspace | 会话必须对应 live root Agent，并在 session header 中带 cwd |
| source path 被拒绝 | 路径必须留在会话工作区内，且不能引用托管 Documents 目录 |
| Runtime replace 超容量 | 缩短 replacement 或先显式整理；当前自动维护只处理 add 溢出 |
| CLI timeout | 增大 `timeoutMs`；大 Store 的状态和图谱导出可能超过 10 秒 |
| lock timeout | 检查是否有另一个实例正在写；不要删除仍属于活跃进程的 lock |
| invalid JSON / unexpected viz | CLI 输出协议可能不兼容；在隔离根中验证版本，不要继续写生产数据 |
| 远程页面可以读但不能写 | 写 RPC 强制 loopback，这是权限设计 |
| `tabEnabled=false` 仍显示 Tab | 当前开关只停 Host 数据 RPC，不会移除客户端 slot |
| 本地 link 不反映源码 | 先运行 `pnpm run build`，再重启 DSH profile |

## 已知限制

### 功能只读不等于磁盘只读

`writeEnabled=false` 禁用语义 mutation，但启动时仍可能创建/修复 Runtime 文件，Document 搜索会更新 `lastAccessedAt`，Mnemon 读取也可能触发上游 migration。不要在真正只读文件系统上假设它能无写运行。

### Documents 的共享范围

`global` 和 `custom` 可能让多个工作区共享同一 Document index；记录没有独立 workspace ownership 字段。`sourcePaths` 仅在写入时相对发起会话 cwd 校验。

### 冷引用路径

当前 archive worker 的提示使用 `.mnemon/documents/archived/<filename>` 作为计划引用；在 global/custom scope 中实际文件位于 `<storageRoot>/documents/archived/<filename>`。定位原文时应以 `documents/index.json` 或 UI 展示的 `relativePath` 为准。这是待修复的路径表达差异。

### 跨系统事务

“先索引、后移动”保护 active 原文，但不是跨 Mnemon SQLite 与文件系统的可回滚分布式事务。索引成功后若 revision 冲突，索引可能保留为重复引用；插件选择保留数据而不是回滚已完成的长期写入。

### 后台水位

评分、最近 checkpoint 和重试状态没有持久化。Host 重启会清空尚未处理的活动；失败退避、熔断和人工重试入口也尚未实现。

### 版本矩阵

项目尚未声明正式的 DSH/Mnemon 支持矩阵和 schema migration 策略。升级必须先备份并在隔离根中验证。

### 国际化

主要 Web 工作台为中英文双语，但命令、工具卡、兼容默认元数据和部分错误信息尚未完整国际化。
