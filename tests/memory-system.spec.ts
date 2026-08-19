import { describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_THREE_TIER_TOPOLOGY,
  MemoryCatalog,
  MemoryKernel,
  MemoryTopologyManager,
  registerDefaultMemorySystem,
  type MemoryPlanRequest,
} from '../src/memory-system/index.ts'

function request(overrides: Partial<MemoryPlanRequest> = {}): MemoryPlanRequest {
  return {
    operation: 'recall',
    capability: 'recall',
    trigger: 'manual',
    scope: { storage: 'workspace', workspaceId: 'example' },
    ...overrides,
  }
}

function sequence(prefix = 'id'): () => string {
  let value = 0
  return () => `${prefix}-${++value}`
}

describe('composable memory system', () => {
  it('registers and disposes catalog contributions with monotonic generations', () => {
    const catalog = new MemoryCatalog()
    const changes = vi.fn()
    catalog.subscribe(changes)
    const dispose = registerDefaultMemorySystem(catalog)
    expect(catalog.snapshot()).toMatchObject({
      generation: 4,
      layers: [{ id: 'runtime' }, { id: 'documents' }, { id: 'memory-spaces' }],
      strategies: [{ id: 'default-three-tier', version: '1' }],
    })
    dispose()
    expect(catalog.snapshot()).toEqual({ generation: 8, layers: [], adapters: [], strategies: [] })
    expect(changes).toHaveBeenCalledTimes(8)
  })

  it('creates atomic topology generations and preserves disabled layer data bindings', () => {
    const catalog = new MemoryCatalog()
    registerDefaultMemorySystem(catalog)
    const topology = new MemoryTopologyManager(catalog, DEFAULT_THREE_TIER_TOPOLOGY, () => new Date('2026-08-19T00:00:00.000Z'))
    const initial = topology.snapshot()
    const disabled = topology.configureLayer('documents', { enabled: false })
    expect(initial.generation).toBe(1)
    expect(disabled.generation).toBe(2)
    expect(disabled.layers.find(layer => layer.id === 'documents')).toMatchObject({ enabled: false, adapterIds: [] })
    expect(initial.layers.find(layer => layer.id === 'documents')).toMatchObject({ enabled: true })
  })

  it('plans only compatible enabled layers and enforces automatic participation', async () => {
    const catalog = new MemoryCatalog()
    registerDefaultMemorySystem(catalog)
    const topology = new MemoryTopologyManager(catalog, DEFAULT_THREE_TIER_TOPOLOGY)
    topology.configureLayer('documents', { participation: { recall: 'manual' } })
    const kernel = new MemoryKernel(catalog, topology, { id: sequence(), now: () => new Date('2026-08-19T00:00:00.000Z') })
    const manual = await kernel.plan(request())
    const automatic = await kernel.plan(request({ trigger: 'automatic' }))
    expect(manual.steps.map(step => step.layerId)).toEqual(['documents', 'memory-spaces'])
    expect(automatic.steps.map(step => step.layerId)).toEqual(['memory-spaces'])
    expect(kernel.allows('documents', 'recall', 'manual')).toBe(true)
    expect(kernel.allows('documents', 'recall', 'automatic')).toBe(false)
    expect(() => kernel.assertParticipation('documents', 'recall', 'automatic')).toThrow('only for manual operations')
  })

  it('applies monotonic guards before invoking a strategy', async () => {
    const catalog = new MemoryCatalog()
    registerDefaultMemorySystem(catalog)
    const topology = new MemoryTopologyManager(catalog, DEFAULT_THREE_TIER_TOPOLOGY)
    const kernel = new MemoryKernel(catalog, topology)
    kernel.registerGuard({
      id: 'local-only',
      decide: input => input.scope.storage === 'custom' ? { kind: 'deny', reason: 'custom roots are denied in this test' } : { kind: 'allow' },
    })
    await expect(kernel.plan(request({ scope: { storage: 'custom' } }))).rejects.toThrow('memory operation denied by local-only')
  })

  it('rejects stale plans after a topology change', async () => {
    const catalog = new MemoryCatalog()
    registerDefaultMemorySystem(catalog)
    const topology = new MemoryTopologyManager(catalog, DEFAULT_THREE_TIER_TOPOLOGY)
    const kernel = new MemoryKernel(catalog, topology)
    const plannedRequest = request({ candidateLayerIds: ['memory-spaces'] })
    const plan = await kernel.plan(plannedRequest)
    topology.configureLayer('documents', { enabled: false })
    await expect(kernel.execute(plan, plannedRequest)).rejects.toThrow('memory plan is stale')
  })

  it('executes bounded steps and records a partial receipt', async () => {
    const catalog = new MemoryCatalog()
    registerDefaultMemorySystem(catalog, {
      documents: { execute: async () => ({ evidence: ['document'] }) },
      'memory-spaces': { execute: async () => { throw new Error('provider unavailable') } },
    })
    const topology = new MemoryTopologyManager(catalog, DEFAULT_THREE_TIER_TOPOLOGY)
    const receipts: unknown[] = []
    const kernel = new MemoryKernel(catalog, topology, {
      id: sequence(),
      now: () => new Date('2026-08-19T00:00:00.000Z'),
      receiptSink: { append: receipt => { receipts.push(receipt) } },
    })
    const result = await kernel.run(request())
    expect(result.receipt.status).toBe('partial')
    expect(result.receipt.steps).toMatchObject([
      { layerId: 'documents', status: 'succeeded', output: { evidence: ['document'] } },
      { layerId: 'memory-spaces', status: 'failed', error: 'provider unavailable' },
    ])
    expect(receipts).toEqual([result.receipt])
  })

  it('rejects strategy fan-out beyond the request budget', async () => {
    const catalog = new MemoryCatalog()
    registerDefaultMemorySystem(catalog)
    const topology = new MemoryTopologyManager(catalog, DEFAULT_THREE_TIER_TOPOLOGY)
    const kernel = new MemoryKernel(catalog, topology)
    await expect(kernel.plan(request({ budget: { maxSteps: 1 } }))).rejects.toThrow('budget allows 1')
  })

  it('fails closed when no configured layer accepts an operation', async () => {
    const catalog = new MemoryCatalog()
    registerDefaultMemorySystem(catalog)
    const topology = new MemoryTopologyManager(catalog, DEFAULT_THREE_TIER_TOPOLOGY)
    topology.configureLayer('documents', { enabled: false })
    topology.configureLayer('memory-spaces', { enabled: false })
    const kernel = new MemoryKernel(catalog, topology)
    await expect(kernel.plan(request())).rejects.toThrow('no executable steps')
  })
})
