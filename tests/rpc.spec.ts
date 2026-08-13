import { describe, expect, it, vi } from 'vitest'
import { resolveConfig } from '../src/config.ts'
import type { HostConnectionHandle } from '../src/contracts.ts'
import type { MnemonLifecycle } from '../src/lifecycle.ts'
import { createReadHandler, createWriteHandler, MNEMON_READ_CHANNEL, MNEMON_WRITE_CHANNEL, registerRpc } from '../src/rpc.ts'
import type { RuntimeMemoryController } from '../src/runtime-memory.ts'
import { MnemonService } from '../src/service.ts'

function fakeService(writeEnabled = true): MnemonService {
  return {
    config: resolveConfig({ writeEnabled }),
    status: vi.fn(async () => ({ healthy: true })),
    bodies: vi.fn(async () => ({ items: [], total: 0, activeCount: 0, directory: '/tmp/mnemon/data', generatedAt: 'now' })),
    graph: vi.fn(async () => ({ nodes: [], edges: [], generatedAt: 'now' })),
    list: vi.fn(async () => ({ items: [], total: 0, generatedAt: 'now' })),
    entities: vi.fn(async () => ({ items: [], insights: [] })),
    search: vi.fn(async request => ({ query: request.query, mode: 'smart', results: [] })),
    related: vi.fn(async () => []),
    remember: vi.fn(async () => ({ action: 'added' })),
    link: vi.fn(async () => ({ status: 'linked' })),
    forget: vi.fn(async () => ({ status: 'deleted' })),
    createBody: vi.fn(async request => ({ id: '00000000-0000-4000-8000-000000000001', name: request.name, description: request.description, active: request.active ?? false })),
    updateBody: vi.fn((id, request) => ({ id, name: request.name ?? id, description: request.description ?? '', active: request.active ?? false })),
  } as unknown as MnemonService
}

describe('Mnemon RPC', () => {
  it('exposes runtime snapshots and routes hot-memory writes through its controller', async () => {
    const runtimeMemory = {
      snapshot: vi.fn(() => ({ entries: [], targets: {} })),
      mutate: vi.fn(async () => ({ success: true, message: 'Entry added.', target: 'user', entryCount: 1, usage: { used: 5, limit: 4096 }, added: 'hello' })),
    } as unknown as RuntimeMemoryController
    await expect(createReadHandler(fakeService(), undefined, runtimeMemory)('runtime-memory', {})).resolves.toMatchObject({ ok: true, value: { entries: [] } })
    await expect(createWriteHandler(fakeService(), undefined, runtimeMemory)('runtime-memory', { action: 'add', target: 'user', content: 'hello', importance: 'normal' })).resolves.toMatchObject({ ok: true, value: { added: 'hello' } })
    expect(runtimeMemory.mutate).toHaveBeenCalledWith({ action: 'add', target: 'user', content: 'hello', importance: 'normal' })

    const lifecycle = { runtime: vi.fn(async () => ({ success: true, message: 'Entry added after archival.', target: 'memory', entryCount: 2, usage: { used: 20, limit: 10240 }, added: 'world' })) } as unknown as MnemonLifecycle
    await expect(createWriteHandler(fakeService(), lifecycle, runtimeMemory)('runtime-memory', { sessionId: 'session-1', action: 'add', target: 'memory', content: 'world' })).resolves.toMatchObject({ ok: true, value: { added: 'world' } })
    expect(lifecycle.runtime).toHaveBeenCalledWith('session-1', { action: 'add', target: 'memory', content: 'world' })
  })

  it('dispatches read operations and rejects unknown endpoints', async () => {
    const service = fakeService()
    await expect(createReadHandler(service)('search', { query: 'SQLite' })).resolves.toMatchObject({ ok: true, value: { query: 'SQLite' } })
    await expect(createReadHandler(service)('graph', {})).resolves.toMatchObject({ ok: true, value: { nodes: [] } })
    await expect(createReadHandler(service)('bodies', {})).resolves.toMatchObject({ ok: true, value: { items: [], total: 0 } })
    await expect(createReadHandler(service)('list', { category: 'decision' })).resolves.toMatchObject({ ok: true, value: { total: 0 } })
    await expect(createReadHandler(service)('entities', { entity: 'SQLite' })).resolves.toMatchObject({ ok: true, value: { insights: [] } })
    await expect(createReadHandler(service)('nope', {})).resolves.toEqual({
      ok: false,
      error: { code: 'bad-request', message: 'unknown read endpoint: nope', details: { issues: [] } },
    })
  })

  it('rejects malformed enum values at the service boundary', async () => {
    const config = resolveConfig({ cliPath: '/fake/mnemon' })
    const service = Object.create(MnemonService.prototype) as MnemonService
    Object.assign(service, {
      config,
      runner: { runJson: vi.fn(), effectiveDataDir: () => '/tmp', effectiveStore: () => 'default' },
    })
    await expect(createReadHandler(service)('search', { query: 'x', mode: 'anything' })).resolves.toMatchObject({
      ok: false,
      error: { code: 'internal', details: {} },
    })
  })

  it('forces human Tab writes to user provenance', async () => {
    const service = fakeService()
    await createWriteHandler(service)('remember', { content: 'A durable preference' })
    expect(service.remember).toHaveBeenCalledWith(expect.objectContaining({ source: 'user' }))
  })

  it('routes supervised Tab writeback through an isolated memory subagent', async () => {
    const service = fakeService()
    const lifecycle = {
      supervise: vi.fn(async () => ({ delegated: true, sessionId: 'session-1', runId: 'child-1', provider: 'spawn', summary: 'stored', action: 'stored', memoryBodyIds: ['project'] })),
    } as unknown as MnemonLifecycle
    await expect(createWriteHandler(service, lifecycle)('supervise', { sessionId: 'session-1', content: 'A candidate' })).resolves.toMatchObject({ ok: true, value: { delegated: true, runId: 'child-1' } })
    expect(lifecycle.supervise).toHaveBeenCalledWith('session-1', 'A candidate')
    expect(service.remember).not.toHaveBeenCalled()
  })

  it('routes project Documents reads and controlled mutations through the bound session', async () => {
    const service = fakeService()
    const lifecycle = {
      documents: vi.fn(() => ({ activeCount: 1, archivedCount: 0, documents: [] })),
      document: vi.fn(() => ({ id: 'doc-1', content: '# Design' })),
      searchDocuments: vi.fn(async () => ({ query: 'design', results: [] })),
      mutateDocument: vi.fn(async () => ({ success: true, action: 'created', document: { id: 'doc-2' } })),
      archiveDocument: vi.fn(async () => ({ success: true, action: 'archived', document: { id: 'doc-1' } })),
    } as unknown as MnemonLifecycle

    await expect(createReadHandler(service, lifecycle)('documents', { sessionId: 'session-1' })).resolves.toMatchObject({ ok: true, value: { activeCount: 1 } })
    await expect(createReadHandler(service, lifecycle)('document', { sessionId: 'session-1', id: 'doc-1' })).resolves.toMatchObject({ ok: true, value: { content: '# Design' } })
    await expect(createReadHandler(service, lifecycle)('document-search', { sessionId: 'session-1', query: 'design', includeArchived: true })).resolves.toMatchObject({ ok: true, value: { query: 'design' } })
    await expect(createWriteHandler(service, lifecycle)('document', { sessionId: 'session-1', action: 'create', title: 'Design', content: '# Design', sourcePaths: ['src/index.ts'] })).resolves.toMatchObject({ ok: true, value: { action: 'created' } })
    await expect(createWriteHandler(service, lifecycle)('document', { sessionId: 'session-1', action: 'archive', id: 'doc-1' })).resolves.toMatchObject({ ok: true, value: { action: 'archived' } })

    expect(lifecycle.searchDocuments).toHaveBeenCalledWith('session-1', 'design', true, undefined)
    expect(lifecycle.mutateDocument).toHaveBeenCalledWith('session-1', { action: 'create', title: 'Design', content: '# Design', sourcePaths: ['src/index.ts'], sessionIds: ['session-1'] })
    expect(lifecycle.archiveDocument).toHaveBeenCalledWith('session-1', 'doc-1')
  })

  it('keeps Tab reads deterministic while delegating semantic writes', async () => {
    const service = fakeService()
    const lifecycle = {
      recall: vi.fn(),
      related: vi.fn(),
      remember: vi.fn(async () => ({ delegated: true, runId: 'write-1', provider: 'spawn', summary: 'stored', action: 'stored', memoryBodyIds: ['project'] })),
    } as unknown as MnemonLifecycle

    await expect(createReadHandler(service, lifecycle)('search', { sessionId: 'session-1', query: 'SQLite' })).resolves.toMatchObject({ ok: true, value: { query: 'SQLite', results: [] } })
    await expect(createReadHandler(service, lifecycle)('entities', { sessionId: 'session-1', entity: 'SQLite' })).resolves.toMatchObject({ ok: true, value: { insights: [] } })
    await expect(createReadHandler(service, lifecycle)('related', { sessionId: 'session-1', id: 'm1', memoryBodyId: 'project' })).resolves.toMatchObject({ ok: true, value: [] })
    await expect(createWriteHandler(service, lifecycle)('remember', { sessionId: 'session-1', content: 'Use SQLite', memoryBodyId: 'project' })).resolves.toMatchObject({ ok: true, value: { runId: 'write-1' } })
    expect(service.search).toHaveBeenCalledWith(expect.objectContaining({ query: 'SQLite' }))
    expect(service.entities).toHaveBeenCalledWith('SQLite', undefined)
    expect(service.related).toHaveBeenCalledWith('m1', 2, undefined, undefined, 'project')
    expect(lifecycle.recall).not.toHaveBeenCalled()
    expect(lifecycle.related).not.toHaveBeenCalled()
    expect(lifecycle.remember).toHaveBeenCalledWith('session-1', expect.objectContaining({ content: 'Use SQLite', memoryBodyId: 'project', source: 'user' }))
    expect(service.remember).not.toHaveBeenCalled()
  })

  it('performs Agent query synthesis only after a deterministic direct search', async () => {
    const service = fakeService()
    const lifecycle = {
      answer: vi.fn(async () => ({ answer: 'SQLite.', citations: [], delegation: { runId: 'answer-1', provider: 'spawn' } })),
    } as unknown as MnemonLifecycle

    await expect(createReadHandler(service, lifecycle)('agent-search', { sessionId: 'session-1', query: 'database' })).resolves.toMatchObject({
      ok: true,
      value: { query: 'database', answer: 'SQLite.', delegation: { runId: 'answer-1' }, results: [] },
    })
    expect(service.search).toHaveBeenCalledWith(expect.objectContaining({ query: 'database' }))
    expect(lifecycle.answer).toHaveBeenCalledWith('session-1', 'database', [])
  })

  it('adds lifecycle diagnostics to status without changing Mnemon runtime status', async () => {
    const service = fakeService()
    const lifecycle = {
      snapshot: vi.fn(() => ({ enabled: true, activeAgents: 1, sessionAvailable: true })),
    } as unknown as MnemonLifecycle
    await expect(createReadHandler(service, lifecycle)('status', { sessionId: 'session-1' })).resolves.toMatchObject({
      ok: true,
      value: { healthy: true, lifecycle: { enabled: true, activeAgents: 1, sessionAvailable: true } },
    })
    expect(lifecycle.snapshot).toHaveBeenCalledWith('session-1')
  })

  it('fences read and write channels with different authorities', () => {
    const handle = vi.fn()
    const connection = { rpc: { handle } } as unknown as HostConnectionHandle
    registerRpc(connection, fakeService())
    expect(handle).toHaveBeenCalledWith(MNEMON_READ_CHANNEL, expect.any(Function), { authority: 'trusted-host' })
    expect(handle).toHaveBeenCalledWith(MNEMON_WRITE_CHANNEL, expect.any(Function), { authority: 'loopback' })
  })

  it('does not expose a write channel in read-only mode', () => {
    const handle = vi.fn()
    registerRpc({ rpc: { handle } } as unknown as HostConnectionHandle, fakeService(false))
    expect(handle).toHaveBeenCalledTimes(1)
  })
})
