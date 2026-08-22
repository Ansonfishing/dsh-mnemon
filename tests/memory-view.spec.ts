import { describe, expect, it, vi } from 'vitest'
import type { MemoryReceipt } from '../packages/contracts/src/index.ts'
import { MemoryReceiptBridge } from '../src/memory-receipts.ts'
import {
  DEFAULT_THREE_TIER_TOPOLOGY,
  MemoryCatalog,
  MemoryKernel,
  MemoryTopologyManager,
  MemoryViewManager,
  registerDefaultMemorySystem,
  type MemoryViewProjector,
} from '../src/memory-system/index.ts'

function harness(projectors: MemoryViewProjector[], options: ConstructorParameters<typeof MemoryViewManager>[2] = {}) {
  const catalog = new MemoryCatalog()
  registerDefaultMemorySystem(catalog)
  const topology = new MemoryTopologyManager(catalog, DEFAULT_THREE_TIER_TOPOLOGY)
  const projectedLayers = new Set(projectors.map(projector => projector.layerId))
  for (const layer of topology.snapshot().layers) {
    if (!projectedLayers.has(layer.id)) topology.configureLayer(layer.id, { participation: { projection: 'off' } })
  }
  const kernel = new MemoryKernel(catalog, topology)
  const views = new MemoryViewManager(kernel, projectors, {
    now: () => new Date('2026-08-23T00:00:00.000Z'),
    ...options,
  })
  return { catalog, topology, kernel, views }
}

function receipt(id: string, capability: MemoryReceipt['capability'] = 'write'): MemoryReceipt {
  return {
    id,
    planId: `plan-${id}`,
    topologyId: 'default-three-tier',
    topologyGeneration: 1,
    catalogGeneration: 4,
    guardGeneration: 0,
    strategyId: 'default-three-tier',
    strategyVersion: '1',
    operation: capability,
    capability,
    status: 'succeeded',
    startedAt: '2026-08-23T00:00:00.000Z',
    finishedAt: '2026-08-23T00:00:00.000Z',
    steps: [{
      stepId: `step-${id}`,
      layerId: 'runtime',
      status: 'succeeded',
      startedAt: '2026-08-23T00:00:00.000Z',
      finishedAt: '2026-08-23T00:00:00.000Z',
    }],
  }
}

describe('MemoryViewManager', () => {
  it('normalizes committed compatibility operations into the existing MemoryReceipt contract', async () => {
    const { kernel, views } = harness([{
      layerId: 'runtime',
      mode: 'exact',
      project: () => ({ revision: 'runtime-1', nodes: [{ key: 'runtime', kind: 'content', label: 'Runtime', content: 'runtime' }] }),
    }])
    const bridge = new MemoryReceiptBridge(
      kernel,
      views,
      () => new Date('2026-08-23T00:00:00.000Z'),
      () => 'authority-1',
    )

    const committed = bridge.record({
      layerId: 'runtime',
      capability: 'write',
      operation: 'runtime-add',
      checkpoint: { afterRevision: 'runtime-1' },
    })
    expect(committed).toMatchObject({
      id: 'authority-1',
      planId: 'committed-authority-1',
      strategyId: 'host-authority-bridge',
      operation: 'runtime-add',
      capability: 'write',
      status: 'succeeded',
      steps: [{ layerId: 'runtime', status: 'succeeded', output: { afterRevision: 'runtime-1' } }],
    })
    expect(views.pendingReceiptCount()).toBe(1)
    await views.publish()
    expect(views.pendingReceiptCount()).toBe(0)
  })

  it('publishes an immutable deterministic View and renders exact Wake plus a bounded map', async () => {
    const { views } = harness([
      {
        layerId: 'runtime',
        mode: 'exact',
        project: () => ({ revision: 'runtime-1', nodes: [{ key: 'root', kind: 'content', label: 'Runtime', content: 'exact runtime context' }] }),
      },
    ])
    const first = await views.publish()
    const second = await views.publish()
    expect(second).toBe(first)
    expect(first).toMatchObject({ id: expect.stringMatching(/^view-[a-f0-9]{24}$/u), sources: [{ layerId: 'runtime', mode: 'exact', revision: 'runtime-1' }] })
    expect(views.wake(first.id).text).toBe('exact runtime context')
    expect(Object.isFrozen(first)).toBe(true)
    expect(Object.isFrozen(first.nodes)).toBe(true)
  })

  it('pins one View for a turn while coalesced receipts advance the next turn once', async () => {
    let revision = 1
    const project = vi.fn(() => ({
      revision: `runtime-${revision}`,
      nodes: [{ key: 'runtime', kind: 'content' as const, label: 'Runtime', content: `runtime ${revision}` }],
    }))
    const { views } = harness([{ layerId: 'runtime', mode: 'exact', project }])
    const turnOne = await views.beginTurn('session:1', { storage: 'workspace', sessionId: 'session' })
    const firstWake = views.wake(turnOne.viewId)
    revision = 2
    expect(views.apply(receipt('one'))).toBe(true)
    expect(views.apply(receipt('two'))).toBe(true)
    expect(views.apply(receipt('read', 'recall'))).toBe(false)
    expect((await views.beginTurn('session:1', { storage: 'workspace', sessionId: 'session' })).viewId).toBe(turnOne.viewId)
    expect(views.wake(turnOne.viewId)).toEqual(firstWake)
    views.endTurn('session:1')
    const turnTwo = await views.beginTurn('session:2', { storage: 'workspace', sessionId: 'session' })
    expect(turnTwo.viewId).not.toBe(turnOne.viewId)
    expect(views.wake(turnTwo.viewId).text).toBe('runtime 2')
    expect(views.pendingReceiptCount()).toBe(0)
    expect(project).toHaveBeenCalledTimes(2)
  })

  it('does not coalesce concurrent publications from different workspace scopes', async () => {
    const releases = new Map<string, () => void>()
    const { views } = harness([{
      layerId: 'runtime',
      mode: 'exact',
      project: async context => {
        const workspaceId = context.scope?.workspaceId ?? 'unknown'
        await new Promise<void>(resolve => { releases.set(workspaceId, resolve) })
        return {
          revision: workspaceId,
          nodes: [{ key: 'runtime', kind: 'content', label: 'Runtime', content: `runtime for ${workspaceId}` }],
        }
      },
    }])

    const alpha = views.beginTurn('alpha:1', { storage: 'global', workspaceId: '/workspace/alpha', sessionId: 'alpha' })
    const beta = views.beginTurn('beta:1', { storage: 'global', workspaceId: '/workspace/beta', sessionId: 'beta' })
    await vi.waitFor(() => expect(releases.size).toBe(2))
    releases.get('/workspace/beta')?.()
    releases.get('/workspace/alpha')?.()

    const [alphaTurn, betaTurn] = await Promise.all([alpha, beta])
    expect(views.wake(alphaTurn.viewId).text).toBe('runtime for /workspace/alpha')
    expect(views.wake(betaTurn.viewId).text).toBe('runtime for /workspace/beta')
    expect(alphaTurn.viewId).not.toBe(betaTurn.viewId)
  })

  it('zooms only through sealed nodes from the requested View', async () => {
    const { views } = harness([{
      layerId: 'runtime',
      mode: 'exact',
      project: () => ({ revision: 'runtime', nodes: [{ key: 'runtime', kind: 'content', label: 'Runtime', content: 'runtime' }] }),
    }, {
      layerId: 'documents',
      mode: 'outline',
      project: () => ({ revision: 'documents-1', nodes: [
        { key: 'documents', kind: 'root', label: 'Documents', summary: 'Managed project knowledge.' },
        { key: 'design', parentKey: 'documents', kind: 'outline', label: 'Design', summary: 'Architecture notes.', reference: 'document:design' },
      ] }),
    }])
    const view = await views.publish()
    const root = view.nodes.find(node => node.label === 'Documents')!
    const result = views.zoom(view.id, root.id)
    expect(result.children).toMatchObject([{ label: 'Design', reference: 'document:design' }])
    expect(views.wake(view.id).text).toContain(`[${root.id}] Documents`)
  })

  it('keeps the last valid View when a later projection fails validation', async () => {
    let invalid = false
    const { views } = harness([{
      layerId: 'runtime',
      mode: 'exact',
      project: () => invalid
        ? { revision: 'runtime-2', nodes: [{ key: 'child', parentKey: 'missing', kind: 'content', label: 'Broken', content: 'broken' }] }
        : { revision: 'runtime-1', nodes: [{ key: 'root', kind: 'content', label: 'Runtime', content: 'valid' }] },
    }])
    const first = await views.publish()
    invalid = true
    const retained = await views.reconcile()
    expect(retained).toBe(first)
    expect(views.latest()).toBe(first)
    expect(views.lastFailure()).toContain('parent is unavailable')
  })

  it('fails closed when an automatically projected Layer has no projector', async () => {
    const { topology, views } = harness([{
      layerId: 'runtime',
      mode: 'exact',
      project: () => ({ revision: 'runtime', nodes: [{ key: 'root', kind: 'content', label: 'Runtime', content: 'runtime' }] }),
    }])
    topology.configureLayer('documents', { enabled: true, participation: { projection: 'automatic' } })
    await expect(views.publish()).rejects.toThrow('no View projector: documents')
  })

  it('rejects candidates when Kernel generations change during projection', async () => {
    let release!: () => void
    const gate = new Promise<void>(resolve => { release = resolve })
    const { kernel, views } = harness([{
      layerId: 'runtime',
      mode: 'exact',
      project: async () => {
        await gate
        return { revision: 'runtime', nodes: [{ key: 'root', kind: 'content', label: 'Runtime', content: 'runtime' }] }
      },
    }])
    const pending = views.publish()
    kernel.registerGuard({ id: 'late-guard', decide: () => ({ kind: 'allow' }) })
    release()
    await expect(pending).rejects.toThrow('inputs changed during compilation')
  })
})
