import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { resolveConfig } from '../src/config.ts'
import { createRuntimeGraph } from '../src/live-runtime.ts'

const directories: string[] = []

function temporaryDirectory(label: string): string {
  const directory = mkdtempSync(join(tmpdir(), `dsh-mnemon-view-${label}-`))
  directories.push(directory)
  return directory
}

afterEach(() => {
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true })
})

describe('default three-tier MemorySources', () => {
  it('projects exact Runtime plus compact covers while keeping complete recall authority Host-only', async () => {
    const workspace = temporaryDirectory('workspace')
    const dataDir = temporaryDirectory('data')
    const runtime = createRuntimeGraph(resolveConfig({ storageScope: 'custom', dataDir, cliPath: '/fake/mnemon' }), workspace)
    await runtime.runtimeMemory.mutate({ action: 'add', target: 'memory', content: 'The project uses an immutable per-turn Wake.' })
    await runtime.documents.forWorkspace(workspace).mutate({
      action: 'create',
      title: 'Memory source architecture',
      description: 'Pinned Wake, Host-only source authority, and receipt-driven publication.',
      content: '# Memory source architecture\n\nThe complete design remains in this managed Document.',
    })
    runtime.service.memoryBodies.updateProviderService('openviking', { endpoint: 'http://127.0.0.1:1933', apiKey: 'projection-secret' })
    const body = await runtime.service.memoryBodies.create({
      name: 'Architecture decisions',
      description: 'Durable cross-session architecture evidence.',
      active: true,
      providerId: 'openviking',
      connection: { targetUri: 'viking://user/architecture/memories' },
    })

    const view = await runtime.memoryViews.publish({ storage: 'custom', workspaceId: workspace, sessionId: 'session-1' })
    const wake = runtime.memoryViews.wake(view.id)
    expect(view.sources).toMatchObject([
      { layerId: 'runtime', mode: 'eager' },
      { layerId: 'documents', mode: 'routed' },
      { layerId: 'memory-spaces', mode: 'routed' },
    ])
    expect(wake.text).toContain('The project uses an immutable per-turn Wake.')
    expect(wake.text).toContain('1 active project Document.')
    expect(wake.text).toContain('active of')
    expect(wake.text).not.toContain('Memory source architecture')
    expect(wake.text).not.toContain('Architecture decisions')
    expect(wake.text).not.toContain('complete design remains')
    expect(wake.text).not.toContain('projection-secret')
    expect(runtime.memoryViews.sourceState(view.id, 'memory-spaces')).toEqual({ memoryBodyIds: expect.arrayContaining([body.id]) })
    expect(runtime.memoryViews.sourceState(view.id, 'documents')).toEqual({ documentIds: [expect.any(String)] })
    expect(JSON.stringify(view)).not.toContain(body.id)
    runtime.dispose()
  })

  it('captures Authority receipts, keeps the pinned turn immutable, and coalesces the next View', async () => {
    const workspace = temporaryDirectory('immutable-workspace')
    const dataDir = temporaryDirectory('immutable-data')
    const runtime = createRuntimeGraph(resolveConfig({ storageScope: 'custom', dataDir, cliPath: '/fake/mnemon' }), workspace)
    runtime.service.memoryBodies.updateProviderService('openviking', { endpoint: 'http://127.0.0.1:1933' })
    const body = await runtime.service.memoryBodies.create({
      name: 'Receipt integration',
      description: 'Memory Space metadata used to verify receipt coalescing.',
      active: true,
      providerId: 'openviking',
      connection: { targetUri: 'viking://user/receipts/memories' },
    })
    await runtime.runtimeMemory.mutate({ action: 'add', target: 'memory', content: 'First runtime revision.' })
    const scope = { storage: 'custom' as const, workspaceId: workspace, sessionId: 'session-1', agentId: 'session-1' }
    const firstTurn = await runtime.memoryViews.beginTurn('session-1:1', scope)
    const firstWake = runtime.memoryViews.wake(firstTurn.viewId)
    expect(runtime.memoryViews.pendingReceiptCount()).toBe(0)

    await runtime.runtimeMemory.mutate({ action: 'add', target: 'memory', content: 'Second runtime revision.' })
    await runtime.runtimeMemory.mutate({ action: 'add', target: 'memory', content: 'Second runtime revision.' })
    await runtime.documents.forWorkspace(workspace).mutate({ action: 'create', title: 'Next View', content: 'Visible only after the turn boundary.' })
    runtime.service.updateBody(body.id, { description: 'Updated routing metadata for the next View.' })
    expect(runtime.memoryViews.pendingReceiptCount()).toBe(3)
    expect((await runtime.memoryViews.beginTurn('session-1:1', scope)).viewId).toBe(firstTurn.viewId)
    expect(runtime.memoryViews.wake(firstTurn.viewId)).toEqual(firstWake)

    runtime.memoryViews.endTurn('session-1:1')
    const secondTurn = await runtime.memoryViews.beginTurn('session-1:2', scope)
    expect(secondTurn.viewId).not.toBe(firstTurn.viewId)
    expect(runtime.memoryViews.pendingReceiptCount()).toBe(0)
    expect(runtime.memoryViews.wake(secondTurn.viewId).text).toContain('Second runtime revision.')
    expect(runtime.memoryViews.wake(secondTurn.viewId).text).toContain('1 active project Document.')
    expect(runtime.memoryViews.wake(secondTurn.viewId).text).not.toContain('Next View')
    expect(runtime.memoryViews.sourceState(secondTurn.viewId, 'documents')).toEqual({ documentIds: [expect.any(String)] })
    runtime.dispose()
  })
})
