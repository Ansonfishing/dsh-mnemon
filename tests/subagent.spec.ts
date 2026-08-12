import { describe, expect, it, vi } from 'vitest'
import type { HostAgent, HostContextShape, HostSubagentsService, ToolDefinition } from '../src/contracts.ts'
import type { MnemonService } from '../src/service.ts'
import { assertDshOutputSchema, MnemonSubagentCoordinator } from '../src/subagent.ts'
import { registerTools } from '../src/tools.ts'
import { RuntimeMemoryCapacityError, type RuntimeMemoryController } from '../src/runtime-memory.ts'

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

function subagents(structured: unknown, stopReason = 'completed', providers = ['spawn']) {
  const dispose = vi.fn(async () => {})
  const start = vi.fn(async () => ({ id: 'child-run-1', result: Promise.resolve({ output: [], structured, stopReason }), dispose }))
  const value = {
    list: vi.fn(() => providers),
    getProvider: vi.fn((name: string) => providers.includes(name) ? { capabilities, inheritsParentContext: name === 'fork' } : undefined),
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

  it('reviews a completed full-context checkpoint through fork with a maintenance-only tool set', async () => {
    const host = subagents({ summary: 'No mutation needed.', action: 'skipped', memoryBodyIds: [] }, 'completed', ['spawn', 'fork'])
    const coordinator = new MnemonSubagentCoordinator(host.value, service())

    await expect(coordinator.review(parent(), new AbortController().signal)).resolves.toMatchObject({
      delegated: true,
      provider: 'fork',
      action: 'skipped',
    })
    expect(host.start).toHaveBeenCalledWith('fork', expect.objectContaining({
      toolFilter: { allow: ['mnemon_memory_bodies', 'mnemon_recall', 'mnemon_related', 'mnemon_runtime_memory'] },
      persona: expect.stringContaining('idle checkpoint reviewer'),
      prompt: [expect.objectContaining({ text: expect.stringContaining('complete inherited parent-agent checkpoint') })],
    }))
    expect(coordinator.snapshot()).toMatchObject({ reviews: 1, writes: 0, lastOperation: 'review' })
  })

  it('answers from pre-recalled evidence without granting any Mnemon retrieval tools', async () => {
    const host = subagents({ answer: '项目使用 SQLite。', citations: ['project/m1', 'project/missing'] })
    const coordinator = new MnemonSubagentCoordinator(host.value, service())
    await expect(coordinator.answer(parent(), '数据库是什么？', [{ id: 'm1', content: 'Use SQLite.', memoryBodyId: 'project', memoryBodyName: '项目记忆体' }], new AbortController().signal)).resolves.toMatchObject({
      answer: '项目使用 SQLite。',
      citations: ['project/m1'],
      delegation: { runId: 'child-run-1', provider: 'spawn' },
    })
    expect(host.start).toHaveBeenCalledWith('spawn', expect.objectContaining({ toolFilter: { allow: [] } }))
    expect(coordinator.snapshot().answers).toBe(1)
  })

  it('archives before compacting and retrying a capacity-blocked runtime write', async () => {
    const host = subagents({
      summary: 'Archived and compacted hot memory.',
      action: 'archived',
      memoryBodyIds: ['project'],
      compactedEntries: [{ content: 'Project uses pnpm.', importance: 'normal' }],
    })
    const runtime = {
      mutate: vi.fn()
        .mockRejectedValueOnce(new RuntimeMemoryCapacityError('memory', 10_200, 10_300, 10_240))
        .mockResolvedValueOnce({ success: true, message: 'Entry added.', target: 'memory', entryCount: 2, usage: { used: 120, limit: 10_240 }, added: 'New durable fact.' }),
      snapshot: vi.fn(() => ({
        revision: 'reviewed-revision',
        entries: [{ content: 'Project uses pnpm and has a long history.', created_at: 'now', updated_at: 'now', target: 'memory', importance: 'normal' }],
        targets: { memory: { target: 'memory', entryCount: 1, used: 10_200, limit: 10_240, markdownPath: '/tmp/MEMORY.md' } },
      })),
      compactTarget: vi.fn(async () => ({})),
    } as unknown as RuntimeMemoryController
    const coordinator = new MnemonSubagentCoordinator(host.value, service(), runtime)
    await expect(coordinator.runtime(parent(), { action: 'add', target: 'memory', content: 'New durable fact.' }, new AbortController().signal)).resolves.toMatchObject({
      added: 'New durable fact.',
      maintenance: { provider: 'spawn', memoryBodyIds: ['project'] },
    })
    expect(host.start).toHaveBeenCalledWith('spawn', expect.objectContaining({
      toolFilter: { allow: ['mnemon_memory_bodies', 'mnemon_recall', 'mnemon_remember', 'mnemon_memory_body_create'] },
      prompt: [expect.objectContaining({ text: expect.stringContaining('never compact first') })],
    }))
    expect(runtime.compactTarget).toHaveBeenCalledWith('reviewed-revision', 'memory', [{ content: 'Project uses pnpm.', importance: 'normal' }])
    expect(runtime.mutate).toHaveBeenCalledTimes(2)
    expect(coordinator.snapshot()).toMatchObject({ migrations: 1, lastOperation: 'migration' })
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
      runtime: vi.fn(async () => ({ success: true, message: 'Entry added.', target: 'user', entryCount: 1, usage: { used: 20, limit: 4096 } })),
    } as unknown as MnemonSubagentCoordinator
    const runtimeMemory = { mutate: vi.fn() } as unknown as RuntimeMemoryController
    registerTools({ tools: { register: (tool: ToolDefinition) => { registered.push(tool) } } } as unknown as HostContextShape, memoryService, coordinator, runtimeMemory)
    const recall = registered.find(tool => tool.name === 'mnemon_recall')!
    const schemas = registered.flatMap(tool => [tool.parameters, tool.output?.schema]).filter(Boolean)
    for (const schema of schemas) {
      const serialized = JSON.stringify(schema)
      expect(serialized).not.toMatch(/"(?:maxItems|minItems|minimum|maximum)":/)
    }
    const signal = new AbortController().signal

    const hotMemory = registered.find(tool => tool.name === 'mnemon_runtime_memory')!
    await hotMemory.execute({ action: 'add', target: 'user', content: 'Prefers concise replies', importance: 'critical' } as never, { agent: parent(), signal })
    expect(coordinator.runtime).toHaveBeenCalledWith(parent(), { action: 'add', target: 'user', content: 'Prefers concise replies', importance: 'critical' }, signal)
    await hotMemory.execute({ action: 'add', target: 'memory', content: 'Child fact' } as never, { agent: parent('subagent'), signal })
    expect(runtimeMemory.mutate).toHaveBeenCalledWith({ action: 'add', target: 'memory', content: 'Child fact' })

    await recall.execute({ query: 'root query' } as never, { agent: parent(), signal })
    expect(coordinator.recall).toHaveBeenCalledOnce()
    expect(memoryService.search).not.toHaveBeenCalled()

    await recall.execute({ query: 'child query', memoryBodyIds: ['project'] } as never, { agent: parent('subagent'), signal })
    expect(memoryService.search).toHaveBeenCalledWith({ query: 'child query', memoryBodyIds: ['project'] }, signal)
  })
})
