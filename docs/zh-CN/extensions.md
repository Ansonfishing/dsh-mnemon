# 记忆扩展开发

**简体中文** | [English](../en/extensions.md) | [文档中心](./README.md)

本页面向希望为 dsh-mnemon 增加记忆语义、数据面或调度策略的插件作者。普通用户仍只安装 `dsh-mnemon`；源码中的 workspace 是职责边界，公开兼容边界是根包的子路径导出。

## 先选择扩展点

| 扩展点 | 负责什么 | 不应负责什么 |
|---|---|---|
| Layer | 一类记忆语义及其执行器，例如 episodic / procedural memory | 决定全局权限或直接改写其他 Layer |
| Adapter | 外部数据面的身份、位置、范围与能力描述 | 绕过 Layer 与 Kernel 执行任意操作 |
| Strategy | 根据请求和只读描述符提出有界步骤 | 持有数据库、网络客户端或秘密 |
| Guard | 在 Strategy 前拒绝请求，只能收紧权限 | 放宽 Host、配置或其他 Guard 已拒绝的权限 |
| Surface | 把 DSH 工具、命令、RPC 或 UI 转换为操作请求 | 自行建立第二套路由与权限规则 |

公共入口如下；不要从 `dsh-mnemon/src/*` 或仓库内的 `packages/*` 导入。

| 子路径 | 用途 |
|---|---|
| `dsh-mnemon/contracts` | 纯 JSON/wire 类型 |
| `dsh-mnemon/kernel` | Catalog、Topology、Kernel、Plan、Receipt 与 Guard |
| `dsh-mnemon/extension-sdk` | 扩展定义、注册与 Cordis 生命周期接入 |
| `dsh-mnemon/strategy-sdk` | Strategy 清单、权限封装与 replay |
| `dsh-mnemon/provider-sdk` | 通用 Adapter Factory Registry 与当前 Memory Space Provider 接口 |
| `dsh-mnemon/layers/*` | 三个内置 Layer 描述符 |
| `dsh-mnemon/strategy-default-three-tier` | 默认拓扑与兼容 Strategy |

## 最小 Layer 扩展

下面的 Layer 只展示执行边界。真实实现应在自己的执行器里处理超时、取消、输出上限和秘密隔离，并只返回 JSON 值。

```ts
import { defineMemoryExtension } from 'dsh-mnemon/extension-sdk'

export const episodicExtension = defineMemoryExtension({
  descriptor: {
    id: 'example-episodic',
    version: '1.0.0',
    label: 'Example Episodic Memory',
    description: 'A bounded event-memory Layer.',
  },
  layers: [{
    descriptor: {
      id: 'episodic',
      label: 'Episodic Memory',
      description: 'Recalls bounded event evidence.',
      role: 'episodic-memory',
      order: 400,
      capabilities: ['recall', 'write'],
    },
    async execute(step, context) {
      if (context.signal?.aborted) throw new Error('operation cancelled')
      return { layer: step.layerId, capability: step.capability, items: [] }
    },
  }],
})
```

扩展第一次出现时，运行中的 Catalog 会增加 generation，Topology 随后生成新代，并把新 Layer 加为 `enabled=false`、四个通道均为 `manual` 的候选。设置页从 `memory-system` 描述符生成卡片，不需要为新 ID 修改前端枚举。用户检查后可以保存：

```yaml
mnemon:
  memoryTopology:
    layers:
      episodic:
        enabled: true
        participation:
          recall: automatic
          write: manual
          projection: off
          maintenance: manual
        adapterIds: []
```

关闭或卸载扩展不会删除其数据。卸载会让新操作停止使用该组件，并使已生成的 Plan 因 Catalog/Topology generation 改变而失效。

## 通过 Cordis 拥有生命周期

普通 DSH 扩展应依赖 Host 发布的 `mnemonMemory` 服务，让注册和插件 fiber 同生共死：

```ts
import type { Context } from '@deepseek-ai/cordis'
import type { MemoryExtensionHost } from 'dsh-mnemon/extension-sdk'
import { episodicExtension } from './episodic.js'

declare module '@deepseek-ai/cordis' {
  interface Context {
    mnemonMemory: MemoryExtensionHost
  }
}

export const inject = ['mnemonMemory']

export function apply(ctx: Context): void {
  ctx.effect(
    () => ctx.mnemonMemory.register(episodicExtension),
    'example-episodic.register()',
  )
}
```

同一进程内、明确早于 dsh-mnemon 挂载的聚合包也可以调用 `registerMemoryExtension()` 预注册，并保存返回的 disposer。Cordis `isolate()` 提供作用域和所有权，不是安全沙箱；扩展代码仍与 Host 在同一进程，必须来自受信任包。

## Strategy 插件与 replay

Strategy 只接收请求以及 Catalog/Topology 的只读快照，输出候选步骤。`defineMemoryStrategyPlugin()` 再用清单限制可访问的 Layer、Adapter、Capability 与最大步骤数；Kernel 会在其后重新校验拓扑、参与模式、绑定、预算和 Guard。

```ts
import {
  MEMORY_STRATEGY_PLUGIN_API_VERSION,
  defineMemoryStrategy,
  defineMemoryStrategyPlugin,
} from 'dsh-mnemon/strategy-sdk'

export const focusedRecall = defineMemoryStrategyPlugin({
  manifest: {
    apiVersion: MEMORY_STRATEGY_PLUGIN_API_VERSION,
    kind: 'MemoryStrategyPlugin',
    metadata: {
      id: 'focused-recall',
      version: '1.0.0',
      label: 'Focused Recall',
      description: 'Routes recall only to Memory Spaces.',
    },
    permissions: {
      layerIds: ['memory-spaces'],
      adapterIds: [],
      capabilities: ['recall'],
      maxSteps: 1,
    },
  },
  strategy: defineMemoryStrategy({
    descriptor: {
      id: 'focused-recall',
      version: '1.0.0',
      label: 'Focused Recall',
      description: 'Routes recall only to Memory Spaces.',
      hooks: ['retrieval-planning'],
      deterministic: true,
    },
    propose(request) {
      return {
        strategyId: 'focused-recall',
        strategyVersion: '1.0.0',
        reason: 'Use the durable evidence layer.',
        steps: [{ layerId: 'memory-spaces', capability: request.capability }],
      }
    },
  }),
})
```

把 `focusedRecall.strategy` 放入扩展的 `strategies` 后，用户才能把 `memoryTopology.strategyId` 切到 `focused-recall`。Strategy 返回零步骤、越权步骤或超过预算时，Kernel 都会失败关闭。用 `replayMemoryStrategy()` 对固定请求和描述符运行 golden cases；至少覆盖正常路由、禁用 Layer、手动/自动边界、缺失 Adapter、预算上限和恶意越权提案。

## Adapter 与 Memory Space Provider 的边界

`extension.adapters` 注册任意 Adapter 描述符，并允许 Topology 把 `adapterId` 绑定到 Layer。v1alpha1 中，通用 Adapter contribution 是控制面描述；真正的数据面调用由对应 Layer executor 完成。

`dsh-mnemon/provider-sdk` 还公开 `MemoryAdapterFactoryRegistry`，并把九个内置 Memory Space Provider 的构造从 `MnemonService` 解耦。当前 Memory Space 设置卡、连接字段、凭据脱敏和持久 registry 仍由内置 Provider Catalog 定义；只注册一个 factory 不会自动生成全新的 Provider UI。第三方若要接入任意新引擎，今天可以提供独立 Layer/Adapter；完整的动态 Provider 描述符与配置 schema 注册是下一阶段兼容面。

## 面向模型生成 Strategy 的安全流水线

当前版本提供可生成、可验证的制品边界，但**不会执行模型刚写出的任意代码**。推荐流水线是：

```text
生成 source + manifest
  -> 格式/schema/类型检查
  -> 权限清单封装
  -> golden replay + 越权测试
  -> shadow 对比现行 Strategy
  -> 人工批准或签名制品
  -> 小流量 canary
  -> 提升 / 自动回滚
```

评估输入应使用脱敏、可复现的操作描述符和预期 Plan，不应把 Provider 凭据或原始私有记忆交给生成模型。回执应保留 Strategy ID/version、Catalog/Topology/Guard generation 和失败状态，才能比较迭代并安全回退。

## 兼容性清单

- ID 使用小写字母开头的 kebab-case，发布后不要复用成不同语义。
- 描述符和跨包输入只放 JSON-safe 数据，不传 class、闭包、Client、数据库或 secret。
- 每次操作必须固定一个 generation；收到 stale plan 后重新规划，不要重放旧步骤。
- `manual` 不等于“模型主动调用工具”：模型、生命周期和系统自动化都属于 `automatic` trigger。
- Guard 只能返回 allow/deny，不能执行数据面副作用；Guard 集合变化会使旧 Plan 失效。
- executor 必须尊重 `AbortSignal`，并把部分失败交给 Kernel 形成 `partial` 回执。
- 为注册、热卸载、重复 ID、越权 Strategy、取消和回执状态编写测试。
