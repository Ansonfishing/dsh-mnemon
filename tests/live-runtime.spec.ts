import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolveConfig } from '../src/config.ts'
import type { HostAgent, HostAgentsService, HostWorkspaceRegistry } from '../src/contracts.ts'
import { createRuntimeGraph, LiveMnemonRuntime } from '../src/live-runtime.ts'
import { MemoryExtensionHost } from '../packages/extension-sdk/src/index.ts'

const directories: string[] = []

function temporaryDirectory(label: string): string {
  const directory = mkdtempSync(join(tmpdir(), `dsh-mnemon-${label}-`))
  directories.push(directory)
  return directory
}

function agent(id: string, cwd: string): HostAgent {
  return {
    id,
    status: 'idle',
    session: { header: { cwd }, events: [] },
    ctx: { on: vi.fn(), effect: vi.fn() },
    followup: vi.fn(),
    steer: vi.fn(),
    inject: vi.fn(),
  }
}

afterEach(() => {
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true })
})

describe('LiveMnemonRuntime workspace routing', () => {
  it('builds one composable memory generation beside the compatible runtime services', () => {
    const runtime = createRuntimeGraph(resolveConfig({ storageScope: 'global', cliPath: '/fake/mnemon' }))
    const descriptor = runtime.memoryKernel.descriptor()
    expect(descriptor).toMatchObject({
      topology: {
        id: 'default-three-tier',
        generation: 1,
        layers: [
          { id: 'runtime', enabled: true },
          { id: 'documents', enabled: true },
          { id: 'memory-spaces', enabled: true },
        ],
      },
      catalog: {
        layers: [{ id: 'runtime' }, { id: 'documents' }, { id: 'memory-spaces' }],
        strategies: [{ id: 'default-three-tier' }],
      },
    })
    expect(descriptor.catalog.adapters.map(adapter => adapter.id)).toEqual(expect.arrayContaining(['mnemon-native', 'openviking', 'supermemory']))
  })

  it('discovers extension layers as disabled topology candidates until explicitly configured', () => {
    const extensions = new MemoryExtensionHost()
    extensions.register({
      descriptor: { id: 'episodic-extension', version: '1', label: 'Episodic', description: 'External episodic layer.' },
      layers: [{ descriptor: { id: 'episodic', label: 'Episodic', description: 'External event memory.', role: 'episodic', order: 400, capabilities: ['recall', 'write'] } }],
    })
    const discovered = createRuntimeGraph(resolveConfig({ storageScope: 'global', cliPath: '/fake/mnemon' }), undefined, extensions)
    expect(discovered.memoryTopology.snapshot().layers.find(layer => layer.id === 'episodic')).toMatchObject({
      enabled: false,
      participation: { recall: 'manual', write: 'manual' },
    })
    discovered.dispose()

    const configured = createRuntimeGraph(resolveConfig({
      storageScope: 'global',
      cliPath: '/fake/mnemon',
      memoryTopology: { layers: { episodic: { enabled: true, participation: { recall: 'automatic' } } } },
    }), undefined, extensions)
    expect(configured.memoryTopology.snapshot().layers.find(layer => layer.id === 'episodic')).toMatchObject({ enabled: true, participation: { recall: 'automatic' } })
    configured.dispose()
  })

  it('reconciles extensions registered and unloaded after the runtime is live', () => {
    const extensions = new MemoryExtensionHost()
    const runtime = createRuntimeGraph(resolveConfig({ storageScope: 'global', cliPath: '/fake/mnemon' }), undefined, extensions)
    const dispose = extensions.register({
      descriptor: { id: 'late-extension', version: '1', label: 'Late', description: 'Late contribution.' },
      layers: [{ descriptor: { id: 'late-layer', label: 'Late', description: 'Late memory layer.', role: 'late-memory', order: 500, capabilities: ['recall'] } }],
    })
    expect(runtime.memoryTopology.snapshot().layers.find(layer => layer.id === 'late-layer')).toMatchObject({ enabled: false })
    dispose()
    expect(runtime.memoryTopology.snapshot().layers.find(layer => layer.id === 'late-layer')).toBeUndefined()
    runtime.dispose()
  })

  it('rejects automatic extension projection without a Projector and assembles contributed Projectors when present', async () => {
    const missing = new MemoryExtensionHost()
    missing.register({
      descriptor: { id: 'missing-projector', version: '1', label: 'Missing', description: 'Projection fixture.' },
      layers: [{ descriptor: { id: 'episodes', label: 'Episodes', description: 'Episodic projection.', role: 'episodes', order: 400, capabilities: ['project'] } }],
    })
    const config = resolveConfig({
      storageScope: 'global',
      cliPath: '/fake/mnemon',
      memoryTopology: { layers: { episodes: { enabled: true, participation: { projection: 'automatic' } } } },
    })
    expect(() => createRuntimeGraph(config, undefined, missing)).toThrow('no View projector: episodes')

    const extensions = new MemoryExtensionHost()
    extensions.register({
      descriptor: { id: 'episodes-projector', version: '1', label: 'Episodes', description: 'Projection fixture.' },
      layers: [{ descriptor: { id: 'episodes', label: 'Episodes', description: 'Episodic projection.', role: 'episodes', order: 400, capabilities: ['project'] } }],
      projectors: [{
        layerId: 'episodes',
        mode: 'outline',
        project: () => ({ revision: 'episodes-1', nodes: [{ key: 'episodes', kind: 'root', label: 'Episodes', summary: 'Recent bounded episodes.' }] }),
      }],
    })
    const graph = createRuntimeGraph(config, undefined, extensions)
    const turn = await graph.memoryViews.beginTurn('session:1', { storage: 'global', sessionId: 'session', agentId: 'session' })
    expect(graph.memoryViews.wake(turn.viewId).sections).toEqual(expect.arrayContaining([
      expect.objectContaining({ layerId: 'episodes', mode: 'outline' }),
    ]))
    graph.memoryViews.endTurn(turn.turnId)
    graph.dispose()
  })

  it('keeps one Agent on its pinned runtime graph across a live swap and releases it at turn end', async () => {
    const config = resolveConfig({ storageScope: 'global', cliPath: '/fake/mnemon' })
    const first = createRuntimeGraph(config)
    const runtime = new LiveMnemonRuntime(first)
    const sessionAgent = agent('session-1', temporaryDirectory('pinned-runtime'))
    const context = await first.memoryViews.beginTurn('session-1:1', { storage: 'global', sessionId: 'session-1', agentId: 'session-1' })
    const release = runtime.bindAgentRuntime(sessionAgent.id, first)
    const second = createRuntimeGraph(config)

    runtime.swap(second)
    expect(runtime.snapshot()).toBe(second)
    expect(runtime.forAgent(sessionAgent)).toBe(first)
    expect(runtime.forAgent(sessionAgent).memoryViews.activeTurn(sessionAgent.id)).toEqual(context)
    const childCwd = sessionAgent.session.header!.cwd!
    const child = agent('child-1', childCwd)
    child.session.header = { origin: 'subagent', parentSession: sessionAgent.id, cwd: childCwd }
    expect(runtime.forAgent(child)).toBe(first)

    first.memoryViews.endTurn(context.turnId)
    release()
    expect(runtime.forAgent(sessionAgent)).toBe(second)
    runtime.dispose()
    expect(() => runtime.forAgent(sessionAgent)).toThrow('disposed')
  })

  it('separates the inspected workspace from the current session execution workspace', () => {
    const workspaceOne = temporaryDirectory('workspace-one')
    const workspaceTwo = temporaryDirectory('workspace-two')
    const initialRoot = temporaryDirectory('initial')
    const workspaces = [
      { id: 'workspace-1', title: 'Workspace One', path: workspaceOne },
      { id: 'workspace-2', title: 'Workspace Two', path: workspaceTwo },
    ]
    const registry = {
      get: (id: string) => workspaces.find(workspace => workspace.id === id),
      list: () => workspaces,
    } satisfies HostWorkspaceRegistry
    const sessionAgent = agent('session-1', workspaceOne)
    const agents = {
      get: (id: string) => id === sessionAgent.id ? sessionAgent : undefined,
      roots: () => [sessionAgent],
    } satisfies HostAgentsService
    const config = resolveConfig({ storageScope: 'workspace', cliPath: '/fake/mnemon' })
    const runtime = new LiveMnemonRuntime(createRuntimeGraph(config, initialRoot), registry, agents)

    expect(runtime.forAgent(sessionAgent).runner.effectiveDataDir()).toBe(join(workspaceOne, '.mnemon'))
    expect(runtime.forWorkspaceId('workspace-2').runner.effectiveDataDir()).toBe(join(workspaceTwo, '.mnemon'))
    expect(runtime.route({ workspaceId: 'workspace-2', sessionId: 'session-1' })).toMatchObject({
      selectedRoot: join(workspaceTwo, '.mnemon'),
      effectiveRoot: join(workspaceOne, '.mnemon'),
      aligned: false,
      selectedWorkspace: { id: 'workspace-2' },
      effectiveWorkspace: { id: 'workspace-1' },
    })
    expect(runtime.route({ workspaceId: 'workspace-1', sessionId: 'session-1' }).aligned).toBe(true)
  })

  it('rejects arbitrary workspace identifiers at the Host boundary', () => {
    const workspace = temporaryDirectory('workspace')
    const config = resolveConfig({ storageScope: 'workspace', cliPath: '/fake/mnemon' })
    const registry = { get: vi.fn(), list: vi.fn(() => []) } satisfies HostWorkspaceRegistry
    const runtime = new LiveMnemonRuntime(createRuntimeGraph(config, workspace), registry, { get: vi.fn(), roots: vi.fn(() => []) })

    expect(() => runtime.forWorkspaceId('../../private')).toThrow('selected DSH workspace is unavailable')
    expect(registry.get).toHaveBeenCalledWith('../../private')
  })

  it('keeps global and custom storage on their configured singleton root', () => {
    const workspace = temporaryDirectory('workspace')
    const globalRuntime = new LiveMnemonRuntime(createRuntimeGraph(resolveConfig({ storageScope: 'global', cliPath: '/fake/mnemon' }), workspace))
    const customRoot = temporaryDirectory('custom')
    const customRuntime = new LiveMnemonRuntime(createRuntimeGraph(resolveConfig({ storageScope: 'custom', dataDir: customRoot, cliPath: '/fake/mnemon' }), workspace))
    const sessionAgent = agent('session-1', temporaryDirectory('other-workspace'))

    expect(globalRuntime.forAgent(sessionAgent)).toBe(globalRuntime.snapshot())
    expect(customRuntime.forAgent(sessionAgent)).toBe(customRuntime.snapshot())
    expect(customRuntime.route({ sessionId: 'session-1' })).toMatchObject({ selectedRoot: customRoot, effectiveRoot: customRoot, aligned: true })
  })

  it('routes Headless workspace storage by Agent cwd without a Web workspace registry', () => {
    const initialRoot = temporaryDirectory('headless-initial')
    const workspace = temporaryDirectory('headless-workspace')
    const sessionAgent = agent('headless-session', workspace)
    const agents = {
      get: (id: string) => id === sessionAgent.id ? sessionAgent : undefined,
      roots: () => [sessionAgent],
    } satisfies HostAgentsService
    const runtime = new LiveMnemonRuntime(
      createRuntimeGraph(resolveConfig({ storageScope: 'workspace', cliPath: '/fake/mnemon' }), initialRoot),
      undefined,
      agents,
    )

    expect(runtime.forAgent(sessionAgent).runner.effectiveDataDir()).toBe(join(workspace, '.mnemon'))
    expect(runtime.route({ sessionId: sessionAgent.id })).toMatchObject({
      selectedRoot: join(workspace, '.mnemon'),
      effectiveRoot: join(workspace, '.mnemon'),
      aligned: true,
    })
    expect(() => runtime.forWorkspaceId('web-only-selection')).toThrow('selected DSH workspace is unavailable')
  })
})
