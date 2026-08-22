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

describe('default three-tier Memory View projectors', () => {
  it('projects exact Runtime plus bounded Document and Memory Space outlines without secrets', async () => {
    const workspace = temporaryDirectory('workspace')
    const dataDir = temporaryDirectory('data')
    const runtime = createRuntimeGraph(resolveConfig({ storageScope: 'custom', dataDir, cliPath: '/fake/mnemon' }), workspace)
    await runtime.runtimeMemory.mutate({ action: 'add', target: 'memory', content: 'The project uses immutable per-turn memory views.' })
    await runtime.documents.forWorkspace(workspace).mutate({
      action: 'create',
      title: 'View architecture',
      description: 'Pinned Wake, deterministic Zoom, and receipt-driven publication.',
      content: '# View architecture\n\nThe complete design remains in this managed Document.',
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
      { layerId: 'runtime', mode: 'exact' },
      { layerId: 'documents', mode: 'outline' },
      { layerId: 'memory-spaces', mode: 'outline' },
    ])
    expect(wake.text).toContain('The project uses immutable per-turn memory views.')
    expect(wake.text).toContain('View architecture')
    expect(wake.text).toContain('Architecture decisions')
    expect(wake.text).not.toContain('projection-secret')
    const spacesRoot = view.nodes.find(node => node.reference === 'memory-spaces:active')!
    expect(runtime.memoryViews.zoom(view.id, spacesRoot.id).children).toMatchObject([
      { reference: `memory-space:${body.id}`, metadata: { memoryBodyId: body.id, providerId: 'openviking' } },
    ])
    runtime.dispose()
  })

  it('keeps an already published exact Runtime projection immutable after Authority changes', async () => {
    const workspace = temporaryDirectory('immutable-workspace')
    const dataDir = temporaryDirectory('immutable-data')
    const runtime = createRuntimeGraph(resolveConfig({ storageScope: 'custom', dataDir, cliPath: '/fake/mnemon' }), workspace)
    await runtime.runtimeMemory.mutate({ action: 'add', target: 'memory', content: 'First runtime revision.' })
    const first = await runtime.memoryViews.publish({ storage: 'custom', workspaceId: workspace, sessionId: 'session-1' })
    const firstWake = runtime.memoryViews.wake(first.id)
    await runtime.runtimeMemory.mutate({ action: 'add', target: 'memory', content: 'Second runtime revision.' })
    expect(runtime.memoryViews.wake(first.id)).toEqual(firstWake)
    const second = await runtime.memoryViews.publish({ storage: 'custom', workspaceId: workspace, sessionId: 'session-2' })
    expect(second.id).not.toBe(first.id)
    expect(runtime.memoryViews.wake(second.id).text).toContain('Second runtime revision.')
    runtime.dispose()
  })
})
