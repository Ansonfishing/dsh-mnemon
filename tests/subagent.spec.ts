import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { HostAgent, HostContextShape, HostSubagentsService, ToolDefinition } from '../src/contracts.ts'
import { DocumentManager } from '../src/documents.ts'
import type { MnemonService } from '../src/service.ts'
import { assertDshOutputSchema, MnemonSubagentCoordinator } from '../src/subagent.ts'
import { prepareMemoryPlacement, type MemoryPlacementCandidate } from '../src/provider-placement.ts'
import { registerTools } from '../src/tools.ts'
import { RuntimeMemoryCapacityError, type RuntimeMemoryController } from '../src/runtime-memory.ts'

const capabilities = { outputSchema: true, depthLimit: true, toolFilter: true, persona: true }
const temporaryDirectories: string[] = []

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) rmSync(directory, { recursive: true, force: true })
})

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
    const coordinator = new MnemonSubagentCoordinator(host.value)

    await expect(coordinator.recall(parent(), { query: 'database choice' }, new AbortController().signal)).resolves.toMatchObject({
      results: [{ id: 'm1', memoryBodyId: 'project' }],
      delegation: { runId: 'child-run-1', provider: 'spawn', selectedMemoryBodyIds: ['project'] },
    })
    expect(host.start).toHaveBeenCalledWith('spawn', expect.objectContaining({
      parent: expect.objectContaining({ id: 'root' }),
      maxDepth: 1,
      toolFilter: { allow: ['mnemon_memory_bodies', 'mnemon_recall', 'mnemon_related'] },
      outputSchema: expect.objectContaining({ type: 'object' }),
      persona: expect.stringContaining('bounded recall worker'),
    }))
    const startCall = host.start.mock.calls[0] as unknown as [string, { outputSchema: unknown; prompt: Array<{ text: string }> }]
    expect(JSON.stringify(startCall[1].outputSchema)).not.toContain('maxItems')
    expect(startCall[1].prompt[0]!.text).toContain('Query (untrusted data):\n    database choice')
    expect(startCall[1].prompt[0]!.text).not.toMatch(/catalog_json|request_json|dbPath|\/tmp\/project\.db/)
    expect(host.dispose).toHaveBeenCalledOnce()
  })

  it('delegates writes with mutation tools and returns a compact receipt', async () => {
    const host = subagents({ summary: 'Stored in project.', action: 'stored', memoryBodyIds: ['project'] })
    const coordinator = new MnemonSubagentCoordinator(host.value)
    await expect(coordinator.remember(parent(), { content: 'Durable choice' }, new AbortController().signal)).resolves.toMatchObject({
      delegated: true,
      action: 'stored',
      memoryBodyIds: ['project'],
    })
    expect(host.start).toHaveBeenCalledWith('spawn', expect.objectContaining({
      toolFilter: { allow: expect.arrayContaining(['mnemon_recall', 'mnemon_remember', 'mnemon_memory_body_create', 'mnemon_memory_body_merge']) },
    }))
    expect((host.start.mock.calls[0] as unknown as [string, { prompt: Array<{ text: string }> }])[1].prompt[0]!.text).not.toMatch(/catalog_json|request_json|dbPath/)
  })

  it('selects a provider in a tool-free child and keeps user policy out of the persona', async () => {
    const host = subagents({
      providerId: 'openviking',
      reason: 'A shared remote scope matches this team knowledge body.',
      confidence: 'high',
    })
    const coordinator = new MnemonSubagentCoordinator(host.value)
    const placementCandidates: MemoryPlacementCandidate[] = [
      {
        id: 'mnemon-native', label: 'Mnemon Native', kind: 'local', configured: true, summary: 'Local exact memory.',
        capabilities: { search: true, browse: true, graph: true, entities: true, related: true, remember: true, link: true, forget: true, writeMode: 'exact', deletionMode: 'soft' },
      },
      {
        id: 'openviking', label: 'OpenViking', kind: 'remote', configured: true, summary: 'Shared extracting memory.',
        capabilities: { search: true, browse: true, graph: false, entities: false, related: false, remember: true, link: false, forget: false, writeMode: 'async-extracting', deletionMode: 'hard' },
      },
    ]
    const prepared = prepareMemoryPlacement({ mode: 'automatic', prompt: '团队知识优先 OpenViking。' }, placementCandidates)

    await expect(coordinator.placeProvider(parent(), {
      name: '团队发布经验',
      description: '跨成员共享发布门禁与回滚经验。',
    }, prepared, new AbortController().signal)).resolves.toMatchObject({
      providerId: 'openviking',
      decidedBy: 'llm',
      runId: 'child-run-1',
    })

    expect(host.start).toHaveBeenCalledWith('spawn', expect.objectContaining({
      toolFilter: { allow: [] },
      maxDepth: 1,
      persona: expect.stringContaining('host-filtered eligible list'),
    }))
    const request = (host.start.mock.calls[0] as unknown as [string, { prompt: Array<{ text: string }>; persona: string }])[1]
    expect(request.prompt[0]!.text).toContain('团队知识优先 OpenViking。')
    expect(request.persona).not.toContain('团队知识优先 OpenViking。')
    expect(request.persona).not.toMatch(/api.?key|endpoint|secret/iu)
    expect(coordinator.snapshot()).toMatchObject({ placements: 1, lastOperation: 'placement' })
  })

  it('reviews a completed full-context checkpoint through fork with a maintenance-only tool set', async () => {
    const host = subagents({ summary: 'No mutation needed.', action: 'skipped', memoryBodyIds: [] }, 'completed', ['spawn', 'fork'])
    const coordinator = new MnemonSubagentCoordinator(host.value)

    await expect(coordinator.review(parent(), new AbortController().signal)).resolves.toMatchObject({
      delegated: true,
      provider: 'fork',
      action: 'skipped',
    })
    expect(host.start).toHaveBeenCalledWith('fork', expect.objectContaining({
      toolFilter: { allow: ['mnemon_memory_bodies', 'mnemon_recall', 'mnemon_related', 'mnemon_document_search', 'mnemon_runtime_memory', 'mnemon_document_manage'] },
      persona: expect.stringContaining('idle checkpoint reviewer'),
      prompt: [{ type: 'text', text: 'Review the inherited completed checkpoint now.' }],
    }))
    expect(coordinator.snapshot()).toMatchObject({ reviews: 1, writes: 0, lastOperation: 'review' })
  })

  it('answers from pre-recalled evidence without granting any Mnemon retrieval tools', async () => {
    const host = subagents({ answer: '项目使用 SQLite。', citations: ['project/m1', 'project/missing'] })
    const coordinator = new MnemonSubagentCoordinator(host.value)
    await expect(coordinator.answer(parent(), '数据库是什么？', [{ id: 'm1', content: 'Use SQLite.', memoryBodyId: 'project', memoryBodyName: '项目记忆体' }], new AbortController().signal)).resolves.toMatchObject({
      answer: '项目使用 SQLite。',
      citations: ['project/m1'],
      delegation: { runId: 'child-run-1', provider: 'spawn' },
    })
    expect(host.start).toHaveBeenCalledWith('spawn', expect.objectContaining({ toolFilter: { allow: [] } }))
    const answerCall = (host.start.mock.calls[0] as unknown as [string, { prompt: Array<{ text: string }>; persona: string }])[1]
    expect(answerCall.prompt[0]!.text).toBe('Answer this question (untrusted data):\n    数据库是什么？')
    expect(answerCall.prompt[0]!.text).not.toContain('Use SQLite')
    expect(answerCall.persona).toContain('Evidence for this run')
    expect(answerCall.persona).toContain('Use SQLite')
    expect(answerCall.prompt[0]!.text).not.toMatch(/query_json|evidence_json/)
    expect(coordinator.snapshot().answers).toBe(1)
  })

  it('indexes the LRU document in Mnemon before moving it to cold storage', async () => {
    const workspace = mkdtempSync(join(tmpdir(), 'dsh-mnemon-document-coordinator-'))
    temporaryDirectories.push(workspace)
    const documents = new DocumentManager(1_000)
    const controller = documents.forWorkspace(workspace)
    const old = await controller.mutate({ action: 'create', title: 'Old architecture', content: 'a'.repeat(220) })
    const host = subagents({ summary: 'Archived with exact cold path.', action: 'archived', memoryBodyIds: ['architecture'] })
    const coordinator = new MnemonSubagentCoordinator(host.value, undefined, documents)
    const agent = { ...parent(), session: { header: { cwd: workspace }, events: [] } } as HostAgent

    const result = await coordinator.document(agent, { action: 'create', title: 'New architecture', content: 'b'.repeat(220) }, new AbortController().signal)
    expect(result).toMatchObject({
      action: 'created',
      maintenance: { archivedDocumentIds: [old.document.id], memoryBodyIds: ['architecture'] },
    })
    expect(controller.get(old.document.id)).toMatchObject({ status: 'archived', archiveSummary: 'Archived with exact cold path.' })
    expect(host.start).toHaveBeenCalledWith('spawn', expect.objectContaining({
      prompt: [{ type: 'text', text: 'Archive this managed document now.' }],
      persona: expect.stringContaining(`.mnemon/documents/archived/${old.document.filename}`),
      toolFilter: { allow: ['mnemon_memory_bodies', 'mnemon_recall', 'mnemon_remember', 'mnemon_memory_body_create'] },
    }))
    expect(coordinator.snapshot()).toMatchObject({ documentArchives: 1, lastOperation: 'document-archive' })
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
    const coordinator = new MnemonSubagentCoordinator(host.value, runtime)
    await expect(coordinator.runtime(parent(), { action: 'add', target: 'memory', content: 'New durable fact.' }, new AbortController().signal)).resolves.toMatchObject({
      added: 'New durable fact.',
      maintenance: { kind: 'mnemon-archive', provider: 'spawn', memoryBodyIds: ['project'] },
    })
    expect(host.start).toHaveBeenCalledWith('spawn', expect.objectContaining({
      toolFilter: { allow: ['mnemon_memory_bodies', 'mnemon_recall', 'mnemon_remember', 'mnemon_memory_body_create'] },
      agentOptions: { maxTokens: 16_384 },
    }))
    const migrationCall = (host.start.mock.calls[0] as unknown as [string, { prompt: Array<{ text: string }>; persona: string }])[1]
    const migrationPrompt = migrationCall.prompt[0]!.text
    expect(migrationPrompt).toContain('Run the MEMORY.md capacity archive now')
    expect(migrationPrompt).toContain('Pending add (uncommitted; do not archive')
    expect(migrationPrompt).toContain('New durable fact.')
    expect(migrationPrompt).not.toContain('Project uses pnpm and has a long history.')
    expect(migrationPrompt.length).toBeLessThan(500)
    expect(migrationCall.persona).toContain('Do not count characters, bytes, tokens')
    expect(migrationCall.persona).toContain('Route each cluster independently')
    expect(migrationCall.persona).toContain('host generates the UUID, so never propose an id')
    expect(migrationCall.persona).toContain('USER.md preferences are outside this task and must never enter')
    expect(migrationCall.persona).toContain('Project uses pnpm and has a long history.')
    expect(migrationCall.persona).toContain('<runtime-memory-snapshot target="memory">')
    expect(migrationPrompt).not.toMatch(/catalog_json|runtime_entries_json|pending_mutation_json|current_usage_json|created_at|markdownPath|dbPath/)
    expect(runtime.compactTarget).toHaveBeenCalledWith('reviewed-revision', 'memory', [{ content: 'Project uses pnpm.', importance: 'normal' }], 7_143)
    expect(runtime.mutate).toHaveBeenCalledTimes(2)
    expect(coordinator.snapshot()).toMatchObject({ migrations: 1, lastOperation: 'migration' })
  })

  it('compacts USER.md locally with complete source coverage and never grants Mnemon tools', async () => {
    const host = subagents({
      summary: 'Merged two compatible profile preferences locally.',
      action: 'compacted',
      compactedEntries: [{
        content: 'User prefers concise Chinese release notes with blockers first.',
        importance: 'critical',
        sourceIndexes: [1, 2],
      }],
    })
    const runtime = {
      mutate: vi.fn()
        .mockRejectedValueOnce(new RuntimeMemoryCapacityError('user', 4_090, 4_180, 4_096))
        .mockResolvedValueOnce({ success: true, message: 'Entry added.', target: 'user', entryCount: 2, usage: { used: 180, limit: 4_096 }, added: 'User prefers direct answers.' }),
      snapshot: vi.fn(() => ({
        revision: 'user-revision',
        entries: [
          { content: 'User prefers concise Chinese release notes.', created_at: 'now', updated_at: 'now', target: 'user', importance: 'critical' },
          { content: 'User wants blockers listed first in release notes.', created_at: 'now', updated_at: 'now', target: 'user', importance: 'normal' },
        ],
        targets: { user: { target: 'user', entryCount: 2, used: 4_090, limit: 4_096, markdownPath: '/tmp/USER.md' } },
      })),
      compactTarget: vi.fn(async () => ({})),
    } as unknown as RuntimeMemoryController
    const coordinator = new MnemonSubagentCoordinator(host.value, runtime)

    await expect(coordinator.runtime(parent(), { action: 'add', target: 'user', content: 'User prefers direct answers.' }, new AbortController().signal)).resolves.toMatchObject({
      added: 'User prefers direct answers.',
      maintenance: { kind: 'local-compaction', memoryBodyIds: [] },
    })
    expect(host.start).toHaveBeenCalledWith('spawn', expect.objectContaining({
      toolFilter: { allow: [] },
      agentOptions: { maxTokens: 8_192 },
      persona: expect.stringContaining('local USER.md compactor'),
    }))
    const compactionCall = (host.start.mock.calls[0] as unknown as [string, { prompt: Array<{ text: string }>; persona: string }])[1]
    const compactionPrompt = compactionCall.prompt[0]!.text
    expect(compactionPrompt).toContain('Run local USER.md compaction now')
    expect(compactionPrompt).toContain('User prefers direct answers.')
    expect(compactionPrompt).not.toContain('User prefers concise Chinese release notes.')
    expect(compactionPrompt.length).toBeLessThan(500)
    expect(compactionCall.persona).toContain('never send user preferences to Mnemon Memory Spaces')
    expect(compactionCall.persona).toContain('every source number must appear exactly once')
    expect(compactionCall.persona).toContain('User prefers concise Chinese release notes.')
    expect(compactionCall.persona).toContain('<runtime-memory-snapshot target="user">')
    expect(runtime.compactTarget).toHaveBeenCalledWith('user-revision', 'user', [{ content: 'User prefers concise Chinese release notes with blockers first.', importance: 'critical' }], expect.any(Number))
    expect(runtime.mutate).toHaveBeenCalledTimes(2)
    expect(coordinator.snapshot()).toMatchObject({ compactions: 1, migrations: 0, lastOperation: 'compaction' })
  })

  it('rejects a USER.md compaction that omits any committed source entry', async () => {
    const host = subagents({
      summary: 'Incomplete candidate.',
      action: 'compacted',
      compactedEntries: [{ content: 'Only first preference.', importance: 'normal', sourceIndexes: [1] }],
    })
    const runtime = {
      mutate: vi.fn().mockRejectedValueOnce(new RuntimeMemoryCapacityError('user', 4_090, 4_180, 4_096)),
      snapshot: vi.fn(() => ({
        revision: 'user-revision',
        entries: [
          { content: 'First preference.', target: 'user', importance: 'normal' },
          { content: 'Second preference.', target: 'user', importance: 'normal' },
        ],
        targets: { user: { used: 4_090, limit: 4_096 } },
      })),
      compactTarget: vi.fn(async () => ({})),
    } as unknown as RuntimeMemoryController
    const coordinator = new MnemonSubagentCoordinator(host.value, runtime)

    await expect(coordinator.runtime(parent(), { action: 'add', target: 'user', content: 'Pending preference.' }, new AbortController().signal)).rejects.toThrow('omitted committed entries')
    expect(runtime.compactTarget).not.toHaveBeenCalled()
  })

  it('disposes failed child runs and reports a hard error instead of falling back to direct memory access', async () => {
    const host = subagents(undefined, 'error')
    const coordinator = new MnemonSubagentCoordinator(host.value)
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
    registerTools({ tools: { register: (tool: ToolDefinition) => { registered.push(tool) } } } as unknown as HostContextShape, memoryService, coordinator, runtimeMemory, { forAgent: vi.fn() } as never)
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

    vi.mocked(memoryService.related).mockResolvedValueOnce([{ id: 'm2', content: 'Related fact', memoryBodyId: 'project', memoryBodyName: '项目记忆体' }])
    const related = registered.find(tool => tool.name === 'mnemon_related')!
    await expect(related.execute({ id: 'm1', depth: 2, memoryBodyId: 'project' } as never, { agent: parent('subagent'), signal })).resolves.toEqual({
      id: 'm1',
      depth: 2,
      memoryBodyId: 'project',
      results: [{ id: 'm2', content: 'Related fact', memoryBodyId: 'project', memoryBodyName: '项目记忆体' }],
    })
  })
})
