# 架构设计

**简体中文** | [English](../en/architecture.md) | [文档中心](./README.md)

## 定位

`dsh-mnemon` 是 DSH 与可替换长期记忆 Provider 之间的集成和监督层，不是新的数据库引擎：

- DSH 提供主 Agent、生命周期事件、subagent provider、工具、命令、设置和 Web 扩展点；
- 插件提供三层知识控制面、路由策略、事务屏障和 UI；
- Mnemon Native 通过本地 `mnemon` CLI 提供命名 Store、SQLite、四类图、关系和软删除，是官方优先实现；8 个三方适配器提供由 Host 控制的 HTTP、本地文件或 CLI 数据面。

## 组件图

[![dsh-mnemon 运行时架构](../assets/diagrams/zh-CN/project-architecture.svg)](../assets/diagrams/zh-CN/project-architecture.svg)

图中实线表示确定性数据或控制路径，紫色虚线表示 LLM 监督路径。Runtime Memory 和 Documents 直接使用受管文件；Memory Spaces 先经过 `MemoryProviderAdapter`，再进入选中的 Provider 数据面。现有图主要绘制默认的 Native 路径。点击图片可以查看原始 SVG。

因此跨 Agent 互操作只发生在第三层：Mnemon Native 通过对齐本地根和 Store 共享，三方引擎通过各自 Provider 作用域共享；任何 Provider 都不会自动共享 DSH 会话、Runtime 投影或 Documents。

### 第三层 Provider 契约

`MemoryProviderAdapter` 把目录、生命周期和用户操作保持在 dsh-mnemon 控制面，把 `status / search / graph projection / browse / remember / related / link / forget` 交给数据面适配器。能力声明是 UI、Agent 和服务端共同使用的硬边界，不支持的操作会被隐藏并在 Host 拒绝。完整当前矩阵见[长期记忆 Provider](./memory-providers.md)。

跨 Provider 检索并发执行，单个失败只生成带记忆体名称的 hint；异构原始分数不直接比较，而是按各 Provider 返回次序做 reciprocal-rank 融合。新适配器复用同一契约，不改变上层“记忆体”语义。

创建时的 Provider placement 与召回路由是两个独立阶段。placement 先在 Host 内按已配置状态、允许列表、数据边界和必需能力裁剪候选；只剩一个候选时确定性落定，多个候选时才把脱敏后的能力摘要、记忆体用途和用户策略交给无工具权限的 `spawn` worker。Host 会再次校验结构化结果必须来自合格候选，再实例化 Provider，并把规则、理由、置信度和 worker 审计信息写入记忆体元数据。endpoint、API Key 与身份头始终留在 Host。

## Host 组合根

`src/index.ts::apply()` 按以下顺序组装插件：

```text
settings.register("mnemon")
  -> resolveConfig
  -> createRunner
  -> MnemonService
  -> RuntimeMemoryController
  -> DocumentManager
  -> StorageScopeInspector
  -> MnemonSubagentCoordinator
  -> MnemonLifecycle
  -> tools / commands / prompt sections
  -> register RPC when a Web connection exists
```

Host 声明依赖 `tools`、`settings`、`commands`、`agents` 和 `subagents`。`workspaceRegistry` 通过 Host 服务目录可选发现，只用于 Web 的受权查看。Web client 另外依赖 slots、connection 和 DSH locale 服务。

## Web 与 Headless 边界

核心 Host 组合与 profile 无关。Web 和 Headless 都会挂载设置、运行时上下文、档案、记忆体工具、生命周期钩子和受监督 worker；Agent 操作始终根据 session cwd 解析 `workspace` 存储。

Web 额外提供 `workspaceRegistry`、客户端 slots 和 `connection`，用于跨工作区查看、RPC、Sidebar / Buildin、设置界面、本回合记忆和存入记忆。Headless 不提供这些浏览器服务；一次性 runner 把任务作为普通用户消息提交，等待 Agent idle、flush session、输出最终答案后退出。插件销毁会取消尚未执行的延迟审查，因此 Headless 依赖任务内完成的显式或模型引导写入，而不是 idle 后维护。

## 主 Agent 与 worker 的双路径

同名 `mnemon_*` 工具根据调用者是否为 subagent 分流，防止递归委派：

```text
root Agent calls mnemon_recall
  -> coordinator starts a bounded recall worker
  -> worker calls mnemon_memory_bodies and mnemon_recall
  -> tool sees origin=subagent
  -> call reaches MnemonService directly
  -> structured evidence returns to root Agent
```

长期语义写入、关系、删除以及记忆体创建/更新采用相同监督模式，但确定性服务会先校验目标 Provider 的能力。Mnemon Native 仍是完整参考实现；三方适配器只开放各自能兑现的精确/异步写入、图谱、浏览、关联与删除语义。运行时记忆和 Documents 的普通变更仍由确定性控制层提交。

记忆体目录的移除是独立危险操作：Mnemon Native 经确认后调用 `store remove`，成功才移除登记；所有三方 Provider 都使用“断开”语义，只删除本地连接元数据，绝不删除 Provider 记忆。

## 两类子 Agent

### `spawn`

`spawn` 使用新的隔离上下文。插件为每类任务提供：

- 固定 persona；
- 最小工具白名单；
- DSH 支持子集内的结构化输出 schema；
- `maxDepth: 1`；
- 可取消的 signal 和有界 token 预算。

它用于召回、长期语义写入、证据限定问答、热记忆整理和 Document 归档。

### `fork`

评分后台审查必须使用名为 `fork` 且 `inheritsParentContext=true` 的 provider。它只继承已经完成的父 checkpoint，用于判断是否需要维护热记忆或最多一份项目档案。它不是用户任务的延续，也不会把审查推理注入主对话。

当前审查白名单不包含 `mnemon_remember`、`mnemon_forget` 或记忆体维护工具，因此后台审查不会直接修改长期记忆体。

## 控制面与数据面

```text
LLM-owned judgment                  Host-owned guarantees
------------------                  ---------------------
what is worth keeping               input validation
which Memory Space fits             path boundary
whether two items are duplicates    process timeout/cancel
how to summarize a Document         file lock + atomic rename
whether a reusable artifact exists  UTF-8 capacity accounting
                                     revision conflict rejection
                                     read/write RPC authority
```

必须区分“persona 约束”和“Host 硬保证”。例如 MEMORY 归档 worker 被要求覆盖每条已提交热记忆，但 Host 只能硬校验结构化 action、revision 和字节预算；USER 压缩的 source coverage 则由 Host 逐项验证。

## Web RPC 边界

WebUI 不启动系统进程，也不直接打开 SQLite：

```text
browser component
  -> typed client wrapper
  -> DSH RPC authority check
  -> Host validation
  -> controller / service / bounded worker
  -> local CLI or managed files
```

读通道要求 `trusted-host`，记忆写通道和设置通道要求 `loopback`。`writeEnabled=false` 时 Host 不注册记忆写通道。

## 国际化

`src/client/locales.ts` 以中文键集定义 `MnemonKey`，英文词典必须满足同一键集合；`src/client/index.ts` 把两套词典注册到 DSH locale。主要 Web 页面和设置卡随 DSH 全局语言即时切换，并复用全局明暗主题。

当前命令输出、工具卡标题、持久化的兼容默认记忆体名称和部分后端错误仍是单语，这是 Roadmap 中的已知缺口。

## 关键模块

| 模块 | 职责 |
|---|---|
| `src/index.ts` | Host 组合与注册 |
| `src/config.ts` | 配置 schema、默认值和解析 |
| `src/process.ts` | 无 shell 的有界进程执行 |
| `src/runner.ts` | CLI 发现、参数、序列化和 JSON 解析 |
| `src/service.ts` | 长期记忆应用门面 |
| `src/memory-bodies.ts` | Memory Space 目录元数据 |
| `src/providers/*` | 第三层 Provider 契约、目录、原生路由与三方适配器 |
| `src/runtime-memory.ts` | 热记忆事实源与投影 |
| `src/documents.ts` | Documents 控制面 |
| `src/subagent.ts` | worker 编排与容量事务 |
| `src/lifecycle.ts` | per-root-Agent 生命周期 |
| `src/review-activity.ts` | 确定性审查评分 |
| `src/tools.ts` | 模型工具及 root/worker 分流 |
| `src/rpc.ts` | Web 读写通道 |
| `src/storage-scope.ts` | 三种存储范围的只读盘点 |
| `src/client/*` | Web 工作台、设置和 locale |
