import { describe, expect, it, vi } from 'vitest'
import type { HostAgent, HostContextShape, HostSubagentsService, ToolDefinition } from '../src/contracts.ts'
import type { MnemonService } from '../src/service.ts'
import { assertDshOutputSchema, MnemonSubagentCoordinator } from '../src/subagent.ts'
import { registerTools } from '../src/tools.ts'

const capabilities = { outputSchema: true, depthLimit: true, toolFilter: true, persona: true }

function parent(origin?: 'subagent'): HostAgent {
  return {
    id: origin === undefined ? 'root' : 'child',
    status: 'idle',
    session: { header: { ...(origin === undefined ? {} : { origin }) }, events: [] },
  } as unknown as HostAgent
}

function service(): MnemonService {
  return {
    config: { writeEnabled: true },
    bodies: vi.fn(async () => ({
      items: [{ id: 'project', name: '项目记忆体', description: '项目决策', active: true, dbPath: '/tmp/project.db', createdAt: 'now', updatedAt: 'now', healthy: true }],
      total: 1,
      activeCount: 1,
      directory: '/tmp',
      generatedAt: 'now',
    })),
    search: vi.fn(async request => ({ query: request.query, mode: 'smart', results: [{ id: 'm1', content: 'SQLite', memoryBodyId: 'project', memoryBodyName: '项目记忆体' }] })),
    related: vi.fn(async () => []),
    status: vi.fn(async () => ({ healthy: true })),
    remember: vi.fn(async () => ({ action: 'added' })),
    link: vi.fn(async () => ({ action: 'linked' })),
    forget: vi.fn(async () => ({ action: 'forgotten' })),
    createBody: vi.fn(async () => ({ id: 'new-body' })),
    updateBody: vi.fn(() => ({ id: 'project' })),
    mergeBodies: vi.fn(async () => ({ imported: 1 })),
  } as unknown as MnemonService
}

function subagents(structured: unknown, stopReason = 'completed') {
  const dispose = vi.fn(async () => {})
  const start = vi.fn(async () => ({ id: 'child-run-1', result: Promise.resolve({ output: [], structured, stopReason }), dispose }))
  const value = {
    list: vi.fn(() => ['spawn']),
    getProvider: vi.fn(() => ({ capabilities })),
    start,
  } as unknown as HostSubagentsService
  return { value, start, dispose }
}

describe('Mnemon memory subagent coordinator', () => {
  it('rejects structured-output keywords outside the DSH schema subset', () => {
    expect(() => assertDshOutputSchema({
      type: 'object',
      properties: { results: { type: 'array', items: { type: 'string' }, maxItems: 12 } },
      required: ['results'],
    })).toThrow('schema.properties.results.maxItems')
    expect(() => assertDshOutputSchema({
      type: 'object',
      properties: { results: { type: 'array', items: { type: 'string' } } },
      required: ['results'],
    })).not.toThrow()
  })

  it('selects memory bodies in a fresh tool-scoped child and returns only structured recall evidence', async () => {
    const host = subagents({
      summary: 'Project memory matched.',
      selectedMemoryBodyIds: ['project'],
      results: [{ id: 'm1', content: 'Use SQLite.', memoryBodyId: 'project', memoryBodyName: '项目记忆体', score: 0.9 }],
    })
    const coordinator = new MnemonSubagentCoordinator(host.value, service())

    await expect(coordinator.recall(parent(), { query: 'database choice' }, new AbortController().signal)).resolves.toMatchObject({
      results: [{ id: 'm1', memoryBodyId: 'project' }],
      delegation: { runId: 'child-run-1', provider: 'spawn', selectedMemoryBodyIds: ['project'] },
    })
    expect(host.start).toHaveBeenCalledWith('spawn', expect.objectContaining({
      parent: expect.objectContaining({ id: 'root' }),
      maxDepth: 1,
      toolFilter: { allow: ['mnemon_memory_bodies', 'mnemon_recall', 'mnemon_related'] },
      outputSchema: expect.objectContaining({ type: 'object' }),
      persona: expect.stringContaining('bounded memory worker'),
    }))
    const startCall = host.start.mock.calls[0] as unknown as [string, { outputSchema: unknown }]
    expect(JSON.stringify(startCall[1].outputSchema)).not.toContain('maxItems')
    expect(host.dispose).toHaveBeenCalledOnce()
  })

  it('delegates writes with mutation tools and returns a compact receipt', async () => {
    const host = subagents({ summary: 'Stored in project.', action: 'stored', memoryBodyIds: ['project'] })
    const coordinator = new MnemonSubagentCoordinator(host.value, service())
    await expect(coordinator.remember(parent(), { content: 'Durable choice' }, new AbortController().signal)).resolves.toMatchObject({
      delegated: true,
      action: 'stored',
      memoryBodyIds: ['project'],
    })
    expect(host.start).toHaveBeenCalledWith('spawn', expect.objectContaining({
      toolFilter: { allow: expect.arrayContaining(['mnemon_recall', 'mnemon_remember', 'mnemon_memory_body_create', 'mnemon_memory_body_merge']) },
    }))
  })

  it('disposes failed child runs and reports a hard error instead of falling back to direct memory access', async () => {
    const host = subagents(undefined, 'error')
    const coordinator = new MnemonSubagentCoordinator(host.value, service())
    await expect(coordinator.recall(parent(), { query: 'x' }, new AbortController().signal)).rejects.toThrow('stopped with error')
    expect(host.dispose).toHaveBeenCalledOnce()
    expect(coordinator.snapshot().failures).toBe(1)
  })
})

describe('Mnemon root/child tool split', () => {
  it('delegates a root recall while allowing the bounded memory child to execute the deterministic service', async () => {
    const registered: ToolDefinition[] = []
    const memoryService = service()
    const coordinator = {
      recall: vi.fn(async () => ({ query: 'x', mode: 'smart', results: [], delegation: { runId: 'child', provider: 'spawn', summary: '', selectedMemoryBodyIds: [] } })),
    } as unknown as MnemonSubagentCoordinator
    registerTools({ tools: { register: (tool: ToolDefinition) => { registered.push(tool) } } } as unknown as HostContextShape, memoryService, coordinator)
    const recall = registered.find(tool => tool.name === 'mnemon_recall')!
    const signal = new AbortController().signal

    await recall.execute({ query: 'root query' } as never, { agent: parent(), signal })
    expect(coordinator.recall).toHaveBeenCalledOnce()
    expect(memoryService.search).not.toHaveBeenCalled()

    await recall.execute({ query: 'child query', memoryBodyIds: ['project'] } as never, { agent: parent('subagent'), signal })
    expect(memoryService.search).toHaveBeenCalledWith({ query: 'child query', memoryBodyIds: ['project'] }, signal)
  })
})
