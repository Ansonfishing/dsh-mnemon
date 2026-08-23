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
    expect(Object.isFrozen(catalog.layer('runtime'))).toBe(true)
    expect(Object.isFrozen(catalog.strategy('default-three-tier'))).toBe(true)
    expect(() => Object.assign(catalog.layer('runtime')!, { execute: vi.fn() })).toThrow()
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

  it('reconciles live Catalog additions and removals as disabled topology candidates', () => {
    const catalog = new MemoryCatalog()
    registerDefaultMemorySystem(catalog)
    const topology = new MemoryTopologyManager(catalog, DEFAULT_THREE_TIER_TOPOLOGY)
    const disposeLayer = catalog.registerLayer({
      descriptor: {
        id: 'episodic',
        label: 'Episodic',
        description: 'External event memory.',
        role: 'episodic',
        order: 400,
        capabilities: ['recall'],
      },
    })
    expect(topology.snapshot().layers.find(layer => layer.id === 'episodic')).toMatchObject({
      enabled: false,
      participation: { recall: 'manual', write: 'manual', projection: 'manual', maintenance: 'manual' },
    })
    disposeLayer()
    expect(topology.snapshot().layers.find(layer => layer.id === 'episodic')).toBeUndefined()
    topology.dispose()
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

  it('rejects a plan when the authoritative Guard set changes', async () => {
    const catalog = new MemoryCatalog()
    registerDefaultMemorySystem(catalog)
    const topology = new MemoryTopologyManager(catalog, DEFAULT_THREE_TIER_TOPOLOGY)
    const kernel = new MemoryKernel(catalog, topology)
    const plannedRequest = request({ candidateLayerIds: ['memory-spaces'] })
    const plan = await kernel.plan(plannedRequest)
    kernel.registerGuard({ id: 'late-guard', decide: () => ({ kind: 'allow' }) })
    await expect(kernel.execute(plan, plannedRequest)).rejects.toThrow('active guards')
  })

  it('binds execution to the complete Guard-approved request and never trusts a replacement request', async () => {
    const execute = vi.fn(async (_step, context) => ({ workspaceId: context.request.scope.workspaceId ?? '' }))
    const catalog = new MemoryCatalog()
    registerDefaultMemorySystem(catalog, { 'memory-spaces': { execute } })
    const topology = new MemoryTopologyManager(catalog, DEFAULT_THREE_TIER_TOPOLOGY)
    topology.configureLayer('documents', { enabled: false })
    const kernel = new MemoryKernel(catalog, topology)
    kernel.registerGuard({
      id: 'approved-workspace',
      decide: input => input.scope.workspaceId === 'allowed' ? { kind: 'allow' } : { kind: 'deny', reason: 'workspace denied' },
    })
    const approved = request({
      scope: { storage: 'workspace', workspaceId: 'allowed' },
      candidateLayerIds: ['memory-spaces'],
      input: { query: 'public' },
    })
    const plan = await kernel.plan(approved)

    await expect(kernel.execute(plan, {
      ...approved,
      scope: { storage: 'workspace', workspaceId: 'secret' },
      input: { query: 'private' },
    })).rejects.toThrow('complete execution request')
    expect(execute).not.toHaveBeenCalled()

    await expect(kernel.execute(plan, approved)).resolves.toMatchObject({ status: 'succeeded', capability: 'recall' })
    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({ capability: 'recall' }),
      expect.objectContaining({ request: expect.objectContaining({ scope: { storage: 'workspace', workspaceId: 'allowed' }, input: { query: 'public' } }) }),
    )
    const executionContext = execute.mock.calls[0]![1]
    expect(Object.isFrozen(executionContext.request)).toBe(true)
    expect(Object.isFrozen(executionContext.request.input)).toBe(true)
  })

  it('deep-freezes issued Plans and rejects altered or forged execution steps before data-plane access', async () => {
    const execute = vi.fn(async () => ({ ok: true }))
    const catalog = new MemoryCatalog()
    registerDefaultMemorySystem(catalog, { 'memory-spaces': { execute } })
    const topology = new MemoryTopologyManager(catalog, DEFAULT_THREE_TIER_TOPOLOGY)
    topology.configureLayer('documents', { enabled: false })
    const kernel = new MemoryKernel(catalog, topology)
    const plannedRequest = request({ candidateLayerIds: ['memory-spaces'], input: { query: 'safe' } })
    const plan = await kernel.plan(plannedRequest)

    expect(Object.isFrozen(plan)).toBe(true)
    expect(Object.isFrozen(plan.request)).toBe(true)
    expect(Object.isFrozen(plan.steps)).toBe(true)
    expect(Object.isFrozen(plan.steps[0]?.input)).toBe(true)
    expect(() => { plan.steps[0]!.capability = 'write' }).toThrow()

    const forged = structuredClone(plan)
    forged.steps[0]!.capability = 'write'
    forged.steps[0]!.input = { content: 'unauthorized write' }
    await expect(kernel.execute(forged, plannedRequest)).rejects.toThrow('changed after authorization')
    expect(execute).not.toHaveBeenCalled()

    const unknown = structuredClone(plan)
    unknown.id = 'not-issued'
    await expect(kernel.execute(unknown, plannedRequest)).rejects.toThrow('not issued by this Kernel')
    expect(execute).not.toHaveBeenCalled()
  })

  it('claims an issued Plan once before data-plane execution begins', async () => {
    let entered!: () => void
    let release!: () => void
    const executing = new Promise<void>(resolve => { entered = resolve })
    const gate = new Promise<void>(resolve => { release = resolve })
    const execute = vi.fn(async () => {
      entered()
      await gate
      return { committed: true }
    })
    const catalog = new MemoryCatalog()
    registerDefaultMemorySystem(catalog, { 'memory-spaces': { execute } })
    const topology = new MemoryTopologyManager(catalog, DEFAULT_THREE_TIER_TOPOLOGY)
    topology.configureLayer('documents', { enabled: false })
    const kernel = new MemoryKernel(catalog, topology)
    const plannedRequest = request({ candidateLayerIds: ['memory-spaces'] })
    const plan = await kernel.plan(plannedRequest)

    const first = kernel.execute(plan, plannedRequest)
    await executing
    await expect(kernel.execute(plan, plannedRequest)).rejects.toThrow('already claimed')
    release()
    await expect(first).resolves.toMatchObject({ status: 'succeeded' })
    await expect(kernel.execute(plan, plannedRequest)).rejects.toThrow('already claimed')
    expect(execute).toHaveBeenCalledOnce()
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

  it('captures every executor before awaiting the first step', async () => {
    let enterFirst!: () => void
    let releaseFirst!: () => void
    const firstEntered = new Promise<void>(resolve => { enterFirst = resolve })
    const firstGate = new Promise<void>(resolve => { releaseFirst = resolve })
    const firstExecute = vi.fn(async () => {
      enterFirst()
      await firstGate
      return { generation: 'original-first' }
    })
    const originalSecond = vi.fn(async () => ({ generation: 'original-second' }))
    const replacementSecond = vi.fn(async () => ({ generation: 'replacement-second' }))
    const catalog = new MemoryCatalog()
    catalog.registerLayer({
      descriptor: { id: 'first-layer', label: 'First', description: 'First async layer.', role: 'first', order: 100, capabilities: ['recall'] },
      execute: firstExecute,
    })
    const disposeSecond = catalog.registerLayer({
      descriptor: { id: 'second-layer', label: 'Second', description: 'Second replaceable layer.', role: 'second', order: 200, capabilities: ['recall'] },
      execute: originalSecond,
    })
    catalog.registerStrategy({
      descriptor: { id: 'capture-test', version: '1', label: 'Capture test', description: 'Select both layers.', hooks: ['retrieval-planning'], deterministic: true },
      propose: () => ({
        strategyId: 'capture-test', strategyVersion: '1', reason: 'Exercise two sequential executors.',
        steps: [
          { layerId: 'first-layer', capability: 'recall' },
          { layerId: 'second-layer', capability: 'recall' },
        ],
      }),
    })
    const automatic = { recall: 'automatic' as const, write: 'automatic' as const, projection: 'automatic' as const, maintenance: 'automatic' as const }
    const topology = new MemoryTopologyManager(catalog, {
      id: 'capture-test', strategyId: 'capture-test',
      layers: [
        { id: 'first-layer', enabled: true, participation: automatic, adapterIds: [] },
        { id: 'second-layer', enabled: true, participation: automatic, adapterIds: [] },
      ],
    })
    const kernel = new MemoryKernel(catalog, topology)
    const plannedRequest = request({ candidateLayerIds: ['first-layer', 'second-layer'] })
    const plan = await kernel.plan(plannedRequest)
    const executing = kernel.execute(plan, plannedRequest)
    await firstEntered

    disposeSecond()
    catalog.registerLayer({
      descriptor: { id: 'second-layer', label: 'Second v2', description: 'Replacement layer.', role: 'second', order: 200, capabilities: ['recall'] },
      execute: replacementSecond,
    })
    releaseFirst()

    await expect(executing).resolves.toMatchObject({
      status: 'succeeded',
      steps: [
        { layerId: 'first-layer', output: { generation: 'original-first' } },
        { layerId: 'second-layer', output: { generation: 'original-second' } },
      ],
    })
    expect(originalSecond).toHaveBeenCalledOnce()
    expect(replacementSecond).not.toHaveBeenCalled()
  })

  it('fans receipts out to live sinks and detaches them without replacing the constructor sink', async () => {
    const catalog = new MemoryCatalog()
    registerDefaultMemorySystem(catalog, {
      'memory-spaces': { execute: async () => ({ evidence: [] }) },
    })
    const topology = new MemoryTopologyManager(catalog, DEFAULT_THREE_TIER_TOPOLOGY)
    topology.configureLayer('documents', { enabled: false })
    const constructorSink = { append: vi.fn() }
    const liveSink = { append: vi.fn() }
    const kernel = new MemoryKernel(catalog, topology, { receiptSink: constructorSink })
    const detach = kernel.registerReceiptSink(liveSink)

    const first = await kernel.run(request())
    expect(constructorSink.append).toHaveBeenCalledWith(first.receipt)
    expect(liveSink.append).toHaveBeenCalledWith(first.receipt)
    detach()
    await kernel.run(request())
    expect(constructorSink.append).toHaveBeenCalledTimes(2)
    expect(liveSink.append).toHaveBeenCalledOnce()
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
