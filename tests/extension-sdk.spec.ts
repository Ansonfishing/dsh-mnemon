import { describe, expect, it, vi } from 'vitest'
import { MemoryExtensionHost } from '../packages/extension-sdk/src/index.ts'
import { MemoryCatalog, MemoryKernel, MemoryTopologyManager, type MemoryStrategyRegistration } from '../packages/kernel/src/index.ts'
import { DEFAULT_THREE_TIER_TOPOLOGY, registerDefaultMemorySystem } from '../packages/strategy-default-three-tier/src/index.ts'
import { defineMemoryStrategyPlugin, replayMemoryStrategy } from '../packages/strategy-sdk/src/index.ts'

describe('Memory extension workspace SDK', () => {
  it('attaches catalog contributions and monotonic guards to each runtime generation', async () => {
    const host = new MemoryExtensionHost()
    const disposeExtension = host.register({
      descriptor: { id: 'example-extension', version: '1.0.0', label: 'Example', description: 'Test contribution.' },
      layers: [{
        descriptor: { id: 'example-layer', label: 'Example layer', description: 'External memory layer.', role: 'external-memory', order: 400, capabilities: ['recall'] },
      }],
      guards: [{
        id: 'workspace-only',
        decide: request => request.scope.storage === 'custom' ? { kind: 'deny', reason: 'custom storage denied' } : { kind: 'allow' },
      }],
    })
    const catalog = new MemoryCatalog()
    registerDefaultMemorySystem(catalog)
    const attachment = host.attach(catalog)
    expect(catalog.layer('example-layer')).toBeDefined()
    const topology = new MemoryTopologyManager(catalog, DEFAULT_THREE_TIER_TOPOLOGY)
    const kernel = new MemoryKernel(catalog, topology)
    attachment.bindKernel(kernel)

    await expect(kernel.plan({ operation: 'recall', capability: 'recall', trigger: 'manual', scope: { storage: 'custom' } }))
      .rejects.toThrow('custom storage denied')
    disposeExtension()
    expect(catalog.layer('example-layer')).toBeUndefined()
    await expect(kernel.plan({ operation: 'recall', capability: 'recall', trigger: 'manual', scope: { storage: 'global' } }))
      .resolves.toMatchObject({ strategyId: 'default-three-tier' })
    attachment.dispose()
  })

  it('releases retired graphs without mutating their pinned catalogs', () => {
    const host = new MemoryExtensionHost()
    const catalog = new MemoryCatalog()
    registerDefaultMemorySystem(catalog)
    const attachment = host.attach(catalog)
    attachment.release()
    host.register({
      descriptor: { id: 'late-extension', version: '1', label: 'Late', description: 'Registered after retirement.' },
      adapters: [{ descriptor: { id: 'late-adapter', label: 'Late', description: 'Late adapter.', locality: 'local', scopes: ['global'], capabilities: ['recall'] } }],
    })
    expect(catalog.adapter('late-adapter')).toBeUndefined()
  })

  it('defines immutable strategy packages and supports deterministic replay', async () => {
    const propose = vi.fn(() => ({ strategyId: 'generated-example', strategyVersion: '1', reason: 'fixture', steps: [] }))
    const strategy: MemoryStrategyRegistration = {
      descriptor: { id: 'generated-example', version: '1', label: 'Generated', description: 'Replay fixture.', hooks: ['retrieval-planning'], deterministic: true },
      propose,
    }
    const plugin = defineMemoryStrategyPlugin({
      manifest: {
        apiVersion: 'dsh-mnemon/v1alpha1',
        kind: 'MemoryStrategyPlugin',
        metadata: { id: 'generated-example', version: '1', label: 'Generated', description: 'Replay fixture.' },
        permissions: { layerIds: ['runtime'], adapterIds: [], capabilities: ['recall'], maxSteps: 2 },
      },
      strategy,
    })
    strategy.propose = vi.fn(() => ({ strategyId: 'generated-example', strategyVersion: '1', reason: 'mutated after replay admission', steps: [{ layerId: 'documents', capability: 'recall' as const }] }))
    const assert = vi.fn()
    await replayMemoryStrategy(plugin.strategy, [{
      request: { operation: 'test', capability: 'recall', trigger: 'manual', scope: { storage: 'global' } },
      descriptor: {
        catalog: { generation: 0, layers: [], adapters: [], strategies: [] },
        topology: { id: 'test', strategyId: 'generated-example', generation: 1, catalogGeneration: 0, createdAt: 'now', layers: [] },
      },
      assert,
    }])
    expect(Object.isFrozen(plugin.manifest)).toBe(true)
    expect(Object.isFrozen(plugin.strategy.descriptor)).toBe(true)
    expect(Object.isFrozen(plugin.strategy.descriptor.hooks)).toBe(true)
    expect(propose).toHaveBeenCalledOnce()
    expect(assert).toHaveBeenCalledWith(expect.objectContaining({ strategyId: 'generated-example' }))

    const denied = defineMemoryStrategyPlugin({
      ...plugin,
      strategy: {
        ...strategy,
        propose: () => ({ strategyId: 'generated-example', strategyVersion: '1', reason: 'escape', steps: [{ layerId: 'documents', capability: 'recall' }] }),
      },
    })
    await expect(denied.strategy.propose(
      { operation: 'test', capability: 'recall', trigger: 'manual', scope: { storage: 'global' } },
      { catalog: { generation: 0, layers: [], adapters: [], strategies: [] }, topology: { id: 'test', strategyId: 'generated-example', generation: 1, catalogGeneration: 0, createdAt: 'now', layers: [] } },
    )).rejects.toThrow('not permitted to use layer documents')
  })
})
