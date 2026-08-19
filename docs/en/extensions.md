# Building Memory Extensions

[简体中文](../zh-CN/extensions.md) | **English** | [Documentation Center](./README.md)

This page is for plugin authors adding memory semantics, data planes, or scheduling policies to dsh-mnemon. Users still install only `dsh-mnemon`. Source workspaces define responsibilities; the compatibility boundary is the root package's public subpath exports.

## Choose an extension point first

| Extension point | Owns | Must not own |
|---|---|---|
| Layer | One memory semantic and its executor, such as episodic or procedural memory | Global authority or mutation of another Layer |
| Adapter | Identity, locality, scope, and capabilities of an external data plane | A path around Layer and Kernel validation |
| Strategy | Bounded step proposals from a request and read-only descriptors | Databases, network clients, or secrets |
| Guard | Denial before Strategy planning; it may only narrow authority | Permission broader than the Host, configuration, or another Guard allows |
| Surface | Translation from DSH tools, commands, RPC, or UI into operation requests | A second routing or authorization system |

Use these public entry points. Do not import from `dsh-mnemon/src/*` or repository-internal `packages/*` paths.

| Subpath | Purpose |
|---|---|
| `dsh-mnemon/contracts` | Pure JSON/wire types |
| `dsh-mnemon/kernel` | Catalog, Topology, Kernel, Plan, Receipt, and Guards |
| `dsh-mnemon/extension-sdk` | Extension definition, registration, and Cordis lifecycle integration |
| `dsh-mnemon/strategy-sdk` | Strategy manifests, permission wrapping, and replay |
| `dsh-mnemon/provider-sdk` | Generic Adapter Factory Registry and current Memory Space Provider interfaces |
| `dsh-mnemon/layers/*` | The three built-in Layer descriptors |
| `dsh-mnemon/strategy-default-three-tier` | Default topology and compatibility Strategy |

## Minimal Layer extension

This Layer illustrates the execution boundary. A real implementation must bound time, cancellation, output, and secret exposure inside its executor and return JSON values only.

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

When the extension first appears, the live Catalog advances its generation. Topology follows with a new generation and adds the Layer as an `enabled=false`, manual-only candidate. Settings cards come from the `memory-system` descriptor, so a new ID needs no frontend enum change. After review, a user can save:

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

Disabling or unloading an extension never deletes its data. Unloading stops new operations from selecting the component and invalidates existing Plans through Catalog/Topology generation changes.

## Let Cordis own the lifecycle

A normal DSH extension should depend on the Host's `mnemonMemory` service so registration follows the plugin fiber:

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

An aggregate bundle that is guaranteed to execute before dsh-mnemon mounts may instead call `registerMemoryExtension()` and retain its disposer. Cordis `isolate()` supplies scope and ownership, not a security sandbox. Extension code still runs in the Host process and must come from a trusted package.

## Strategy plugins and replay

A Strategy receives only the request and read-only Catalog/Topology snapshots and returns proposed steps. `defineMemoryStrategyPlugin()` further limits its Layers, Adapters, Capabilities, and maximum step count. The Kernel then revalidates topology, participation, bindings, budgets, and Guards.

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

Place `focusedRecall.strategy` in an extension's `strategies` before selecting `focused-recall` as `memoryTopology.strategyId`. A zero-step, over-permission, or over-budget proposal fails closed. Use `replayMemoryStrategy()` with fixed requests and descriptors. Cover normal routing, disabled Layers, manual/automatic boundaries, missing Adapters, budget ceilings, and adversarial escape proposals.

## Adapter versus Memory Space Provider

`extension.adapters` registers arbitrary Adapter descriptors and lets Topology bind an `adapterId` to a Layer. In v1alpha1, a generic Adapter contribution is a control-plane description; the corresponding Layer executor owns actual data-plane calls.

`dsh-mnemon/provider-sdk` also exposes `MemoryAdapterFactoryRegistry` and decouples construction of the nine built-in Memory Space Providers from `MnemonService`. The Memory Space settings cards, connection fields, credential redaction, and persistent registry are still defined by the built-in Provider Catalog. Registering a factory alone does not create a new Provider UI. A third party can integrate a new engine today as its own Layer/Adapter; fully dynamic Provider descriptor and configuration-schema registration is the next compatibility surface.

## Safe pipeline for model-generated Strategies

This release supplies a generatable and verifiable artifact boundary, but it **does not execute arbitrary code immediately after a model writes it**. The recommended pipeline is:

```text
generate source + manifest
  -> format/schema/type checks
  -> permission-manifest wrapping
  -> golden replay + escape tests
  -> shadow comparison with the active Strategy
  -> human approval or signed artifact
  -> small canary
  -> promote / automatic rollback
```

Evaluation should use redacted, reproducible operation descriptors and expected Plans. Never give Provider credentials or raw private memories to the generating model. Receipts need Strategy ID/version, Catalog/Topology/Guard generations, and failure status so iterations remain comparable and reversible.

## Compatibility checklist

- Use lowercase kebab-case IDs and never reuse a published ID for different semantics.
- Keep descriptors and cross-package inputs JSON-safe; do not pass classes, closures, clients, databases, or secrets.
- Pin one generation per operation. Re-plan after a stale-plan error; never replay old steps.
- `manual` does not mean “the model explicitly called a tool.” Model, lifecycle, and system automation are `automatic` triggers.
- Guards return allow/deny without data-plane side effects. A Guard-set change invalidates existing Plans.
- Executors must honor `AbortSignal` and let the Kernel represent partial failure as a `partial` Receipt.
- Test registration, live unload, duplicate IDs, over-permission Strategies, cancellation, and Receipt states.
