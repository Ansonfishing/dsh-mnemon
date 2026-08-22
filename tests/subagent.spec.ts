import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { HostAgent, HostContextShape, HostSubagentsService, ToolDefinition } from '../src/contracts.ts'
import { DocumentManager } from '../src/documents.ts'
import type { MnemonService } from '../src/service.ts'
import { assertDshOutputSchema, MnemonSubagentCoordinator } from '../src/subagent.ts'
import { prepareMemoryPlacement, type MemoryPlacementCandidate } from '../src/provider-placement.ts'
import { registerTools } from '../src/tools.ts'
import {
  RUNTIME_ENTRY_DELIMITER,
  RuntimeMemoryCapacityError,
  RuntimeMemoryController,
  type RuntimeMemoryMaintenancePlan,
} from '../src/runtime-memory.ts'

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
      items: [{
        id: 'project', name: '项目记忆体', description: '项目决策', active: true, dbPath: '/tmp/project.db', createdAt: 'now', updatedAt: 'now', healthy: true,
        provider: { id: 'mnemon-native', label: 'mnemon', capabilities: { remember: true } },
      }],
      total: 1,
      activeCount: 1,
      directory: '/tmp',
      generatedAt: 'now',
    })),
    search: vi.fn(async request => ({ query: request.query, mode: 'smart', results: [{ id: 'm1', content: 'SQLite', memoryBodyId: 'project', memoryBodyName: '项目记忆体' }] })),
    metadataSample: vi.fn(async (memoryBodyId: string) => ({
      memoryBodyId,
      name: memoryBodyId === 'release' ? 'Release' : 'Product',
      description: memoryBodyId === 'release' ? 'Release gates and rollback notes.' : 'Product scope and decisions.',
      providerId: 'mnemon-native',
      providerLabel: 'mnemon',
      method: 'native-basic',
      evidence: [{ content: memoryBodyId === 'release' ? 'Use staged rollout and a rollback gate.' : 'The product keeps durable architecture decisions.', category: 'decision', entities: ['DSH'] }],
    })),
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

function subagents(structured: unknown, stopReason = 'completed', providers = ['spawn'], localAgent?: HostAgent, diagnostic?: string) {
  const dispose = vi.fn(async () => {})
  const start = vi.fn(async () => ({
    id: 'child-run-1',
    result: Promise.resolve({ output: [], structured, stopReason, ...(diagnostic === undefined ? {} : { diagnostic }) }),
    dispose,
    ...(localAgent === undefined ? {} : { localAgent }),
  }))
  const value = {
    list: vi.fn(() => providers),
    getProvider: vi.fn((name: string) => providers.includes(name) ? { capabilities, inheritsParentContext: name === 'fork' } : undefined),
    start,
  } as unknown as HostSubagentsService
  return { value, start, dispose }
}

function toolRegistry() {
  const definitions: ToolDefinition[] = []
  const disposers: Array<ReturnType<typeof vi.fn>> = []
  const listeners = new Map<string, Set<(...args: unknown[]) => unknown>>()
  const register = vi.fn((definition: ToolDefinition) => {
    definitions.push(definition)
    const dispose = vi.fn()
    disposers.push(dispose)
    return dispose
  })
  const on = vi.fn((name: string, listener: (...args: unknown[]) => unknown) => {
    const registered = listeners.get(name) ?? new Set()
    registered.add(listener)
    listeners.set(name, registered)
    const dispose = vi.fn(() => { registered.delete(listener) })
    disposers.push(dispose)
    return dispose
  })
  const emit = (name: string, ...args: unknown[]) => {
    for (const listener of listeners.get(name) ?? []) listener(...args)
  }
  return { value: { tools: { register }, on }, register, on, emit, definitions, disposers }
}

function createCoordinator(host: HostSubagentsService, runtime?: RuntimeMemoryController, documents?: DocumentManager, service?: MnemonService) {
  return new MnemonSubagentCoordinator(host, runtime, documents, toolRegistry().value, undefined, service)
}

function runtimeController(): RuntimeMemoryController {
  const directory = mkdtempSync(join(tmpdir(), 'dsh-mnemon-subagent-runtime-'))
  temporaryDirectories.push(directory)
  return new RuntimeMemoryController({ effectiveDataDir: () => directory }, () => new Date('2026-08-23T00:00:00.000Z'))
}

function mockedMaintenancePlan(target: 'memory' | 'user' = 'memory'): RuntimeMemoryMaintenancePlan {
  const limit = target === 'memory' ? 10_240 : 4_096
  return {
    revision: `${target}-revision`,
    action: 'add',
    target,
    entries: [
      { content: 'First committed entry.', created_at: 'now', updated_at: 'now', target, importance: 'normal' },
      { content: 'Second committed entry.', created_at: 'now', updated_at: 'now', target, importance: 'normal' },
    ],
    pending: { content: 'Pending entry.', importance: 'normal' },
    used: limit - 6,
    projected: limit + 60,
    limit,
    requiresMaintenance: true,
  }
}

function observedSubagents(
  resultTools: ReturnType<typeof toolRegistry>,
  publish: (child: HostAgent) => void | Promise<void>,
  stopReason = 'completed',
) {
  const dispose = vi.fn(async () => {})
  const child = parent('subagent')
  child.id = 'child-run-1'
  const start = vi.fn(async () => {
    await publish(child)
    return { id: child.id, result: Promise.resolve({ output: [], stopReason }), dispose, localAgent: child }
  })
  const value = {
    list: vi.fn(() => ['spawn']),
    getProvider: vi.fn(() => ({ capabilities })),
    start,
  } as unknown as HostSubagentsService
  return { value, start, dispose, child }
}

function emitSuccessfulToolResult(
  resultTools: ReturnType<typeof toolRegistry>,
  child: HostAgent,
  name: string,
  argumentsValue: unknown,
  value: unknown,
  parentToken?: symbol,
) {
  const execution = {
    name,
    arguments: argumentsValue,
    token: Symbol(name),
    ...(parentToken === undefined ? {} : { parent: parentToken }),
    agent: child,
    signal: new AbortController().signal,
  }
  resultTools.emit('tools/result', execution, { isError: false, value })
  return execution
}

async function emitStructuredResult(resultTools: ReturnType<typeof toolRegistry>, child: HostAgent, value: unknown) {
  const definition = resultTools.definitions.at(-1)!
  const execution = {
    name: definition.name,
    arguments: value,
    token: Symbol(definition.name),
    agent: child,
    signal: new AbortController().signal,
    concludeTurn: vi.fn(),
  }
  await definition.execute(value as never, execution)
  resultTools.emit('tools/result', execution, { isError: false, value: { recorded: true } })
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
    const resultTools = toolRegistry()
    const coordinator = new MnemonSubagentCoordinator(host.value, undefined, undefined, resultTools.value)

    await expect(coordinator.recall(parent(), { query: 'database choice' }, new AbortController().signal)).resolves.toMatchObject({
      results: [{ id: 'm1', memoryBodyId: 'project' }],
      delegation: { runId: 'child-run-1', provider: 'spawn', selectedMemoryBodyIds: ['project'] },
    })
    expect(host.start).toHaveBeenCalledWith('spawn', expect.objectContaining({
      parent: expect.objectContaining({ id: 'root' }),
      maxDepth: 1,
      toolFilter: { allow: expect.arrayContaining(['mnemon_memory_bodies', 'mnemon_recall', 'mnemon_related']) },
      persona: expect.stringContaining('bounded recall worker'),
    }))
    const startCall = host.start.mock.calls[0] as unknown as [string, { outputSchema?: unknown; toolFilter: { allow: string[] }; persona: string; prompt: Array<{ text: string }> }]
    expect(startCall[1].outputSchema).toBeUndefined()
    const resultToolName = startCall[1].toolFilter.allow.find(name => name.startsWith('mnemon_subagent_result_'))
    expect(resultToolName).toBeTruthy()
    expect(startCall[1].persona).toContain(`call \`${resultToolName}\` exactly once`)
    expect(JSON.stringify(resultTools.definitions[0]?.parameters)).not.toContain('maxItems')
    expect(startCall[1].prompt[0]!.text).toContain('Query (untrusted data):\n    database choice')
    expect(startCall[1].prompt[0]!.text).not.toMatch(/catalog_json|request_json|dbPath|\/tmp\/project\.db/)
    expect(host.dispose).toHaveBeenCalledOnce()
    expect(resultTools.disposers).toHaveLength(2)
    for (const disposer of resultTools.disposers) expect(disposer).toHaveBeenCalledOnce()
  })

  it('captures a schema-validated result through the one-run tool without DSH structured output', async () => {
    const resultTools = toolRegistry()
    const dispose = vi.fn(async () => {})
    const concludeTurn = vi.fn()
    const child = parent('subagent')
    child.id = 'child-run-1'
    const start = vi.fn(async (_provider: string, request: { outputSchema?: unknown; toolFilter?: { allow?: string[] } }) => {
      expect(request.outputSchema).toBeUndefined()
      const definition = resultTools.definitions.at(-1)!
      expect(request.toolFilter?.allow).toContain(definition.name)
      const outerToken = Symbol('run-code')
      const execution = { name: definition.name, token: Symbol('result'), parent: outerToken, agent: child, signal: new AbortController().signal, concludeTurn }
      await definition.execute({
        summary: 'Project memory matched.',
        selectedMemoryBodyIds: ['project'],
        results: [{ id: 'm1', content: 'Use SQLite.', memoryBodyId: 'project', memoryBodyName: 'Project' }],
      } as never, execution)
      await expect(definition.execute({
        summary: 'Duplicate.', selectedMemoryBodyIds: [], results: [],
      } as never, { ...execution, token: Symbol('duplicate') })).rejects.toThrow('already recorded')
      resultTools.emit('tools/result', execution, { isError: false })
      resultTools.emit('tools/result', { name: 'run_code', token: outerToken, signal: execution.signal, agent: child }, { isError: false })
      return { id: child.id, result: Promise.resolve({ output: [], stopReason: 'completed' }), dispose }
    })
    const host = {
      list: vi.fn(() => ['spawn']),
      getProvider: vi.fn(() => ({ capabilities: { ...capabilities, outputSchema: false } })),
      start,
    } as unknown as HostSubagentsService
    const coordinator = new MnemonSubagentCoordinator(host, undefined, undefined, resultTools.value)

    await expect(coordinator.recall(parent(), { query: 'database choice' }, new AbortController().signal)).resolves.toMatchObject({
      results: [{ id: 'm1', memoryBodyId: 'project' }],
      delegation: { runId: 'child-run-1', provider: 'spawn' },
    })
    expect(concludeTurn).toHaveBeenCalledOnce()
    expect(dispose).toHaveBeenCalledOnce()
    for (const disposer of resultTools.disposers) expect(disposer).toHaveBeenCalledOnce()
  })

  it('rejects a result captured from any child other than the run that owns the tool', async () => {
    const resultTools = toolRegistry()
    const intruder = parent('subagent')
    intruder.id = 'different-child'
    const host = {
      list: vi.fn(() => ['spawn']),
      getProvider: vi.fn(() => ({ capabilities })),
      start: vi.fn(async () => {
        const definition = resultTools.definitions.at(-1)!
        const execution = { name: definition.name, token: Symbol('intruder'), agent: intruder, signal: new AbortController().signal, concludeTurn: vi.fn() }
        await definition.execute({
          summary: 'Wrong child.', selectedMemoryBodyIds: [], results: [],
        } as never, execution)
        resultTools.emit('tools/result', execution, { isError: false })
        return { id: 'child-run-1', result: Promise.resolve({ output: [], stopReason: 'completed' }), dispose: vi.fn(async () => {}) }
      }),
    } as unknown as HostSubagentsService
    const coordinator = new MnemonSubagentCoordinator(host, undefined, undefined, resultTools.value)

    await expect(coordinator.recall(parent(), { query: 'x' }, new AbortController().signal)).rejects.toThrow('recorded by a different child')
    for (const disposer of resultTools.disposers) expect(disposer).toHaveBeenCalledOnce()
  })

  it('rejects malformed result-tool arguments before accepting the child result', async () => {
    const resultTools = toolRegistry()
    const child = parent('subagent')
    child.id = 'child-run-1'
    const host = {
      list: vi.fn(() => ['spawn']),
      getProvider: vi.fn(() => ({ capabilities })),
      start: vi.fn(async () => {
        await resultTools.definitions.at(-1)!.execute({ selectedMemoryBodyIds: [], results: [] } as never, {
          agent: child, signal: new AbortController().signal, concludeTurn: vi.fn(),
        })
        throw new Error('unreachable')
      }),
    } as unknown as HostSubagentsService
    const coordinator = new MnemonSubagentCoordinator(host, undefined, undefined, resultTools.value)

    await expect(coordinator.recall(parent(), { query: 'x' }, new AbortController().signal)).rejects.toThrow('result.summary is required')
    for (const disposer of resultTools.disposers) expect(disposer).toHaveBeenCalledOnce()
  })

  it('recovers recall evidence from an authoritative native tool receipt when the child omits its terminal result', async () => {
    const resultTools = toolRegistry()
    const host = observedSubagents(resultTools, child => {
      emitSuccessfulToolResult(resultTools, child, 'mnemon_recall', { query: 'database', memoryBodyIds: ['project'] }, {
        query: 'database',
        mode: 'smart',
        hint: 'Project memory matched.',
        results: [{ id: 'm1', content: 'Use SQLite.', memoryBodyId: 'project', memoryBodyName: 'Project' }],
        sources: [{ memoryBodyId: 'project' }],
      })
    })
    const coordinator = new MnemonSubagentCoordinator(host.value, undefined, undefined, resultTools.value)

    await expect(coordinator.recall(parent(), { query: 'database' }, new AbortController().signal)).resolves.toMatchObject({
      results: [{ id: 'm1', content: 'Use SQLite.', memoryBodyId: 'project' }],
      hint: 'Project memory matched.',
      delegation: { runId: 'child-run-1', selectedMemoryBodyIds: ['project'] },
    })
    expect(host.start).toHaveBeenCalledOnce()
    expect(coordinator.snapshot()).toMatchObject({ recalls: 1, failures: 0 })
  })

  it('recovers a committed write receipt without retrying the mutation', async () => {
    const resultTools = toolRegistry()
    const host = observedSubagents(resultTools, child => {
      emitSuccessfulToolResult(resultTools, child, 'mnemon_remember', { content: 'Use SQLite.', memoryBodyId: 'project' }, {
        action: 'added',
        message: 'Stored durable project memory.',
        memoryBodyId: 'project',
        memoryBodyName: 'Project',
      })
    })
    const coordinator = new MnemonSubagentCoordinator(host.value, undefined, undefined, resultTools.value)

    await expect(coordinator.remember(parent(), { content: 'Use SQLite.', memoryBodyId: 'project' }, new AbortController().signal)).resolves.toMatchObject({
      delegated: true,
      action: 'added',
      summary: 'Stored durable project memory.',
      memoryBodyIds: ['project'],
    })
    expect(host.start).toHaveBeenCalledOnce()
    expect(coordinator.snapshot()).toMatchObject({ writes: 1, failures: 0 })
  })

  it('commits a nested Code Mode receipt only after the enclosing run_code succeeds', async () => {
    const resultTools = toolRegistry()
    const host = observedSubagents(resultTools, child => {
      const outerToken = Symbol('run-code')
      emitSuccessfulToolResult(resultTools, child, 'mnemon_remember', { content: 'Use SQLite.' }, {
        action: 'added', memoryBodyId: 'project', memoryBodyName: 'Project',
      }, outerToken)
      resultTools.emit('tools/result', {
        name: 'run_code', arguments: {}, token: outerToken, agent: child, signal: new AbortController().signal,
      }, { isError: false, value: null })
    })
    const coordinator = new MnemonSubagentCoordinator(host.value, undefined, undefined, resultTools.value)

    await expect(coordinator.remember(parent(), { content: 'Use SQLite.' }, new AbortController().signal)).resolves.toMatchObject({
      action: 'added', memoryBodyIds: ['project'],
    })
  })

  it('discards a nested receipt when the enclosing Code Mode call fails', async () => {
    const resultTools = toolRegistry()
    const host = observedSubagents(resultTools, child => {
      const outerToken = Symbol('run-code')
      emitSuccessfulToolResult(resultTools, child, 'mnemon_remember', { content: 'Use SQLite.' }, {
        action: 'added', memoryBodyId: 'project', memoryBodyName: 'Project',
      }, outerToken)
      resultTools.emit('tools/result', {
        name: 'run_code', arguments: {}, token: outerToken, agent: child, signal: new AbortController().signal,
      }, { isError: true })
    })
    const coordinator = new MnemonSubagentCoordinator(host.value, undefined, undefined, resultTools.value)

    await expect(coordinator.remember(parent(), { content: 'Use SQLite.' }, new AbortController().signal)).rejects.toThrow('completed without recording its result')
  })

  it('does not recover partial or failed child runs from unrelated successful tools', async () => {
    const resultTools = toolRegistry()
    const partial = observedSubagents(resultTools, child => {
      emitSuccessfulToolResult(resultTools, child, 'mnemon_memory_body_create', { name: 'Project', description: 'Project decisions.' }, {
        id: 'project', name: 'Project', description: 'Project decisions.',
      })
    })
    const partialCoordinator = new MnemonSubagentCoordinator(partial.value, undefined, undefined, resultTools.value)
    await expect(partialCoordinator.remember(parent(), { content: 'Use SQLite.' }, new AbortController().signal)).rejects.toThrow('completed without recording its result')

    const failedTools = toolRegistry()
    const failed = observedSubagents(failedTools, child => {
      emitSuccessfulToolResult(failedTools, child, 'mnemon_remember', { content: 'Use SQLite.' }, {
        action: 'added', memoryBodyId: 'project', memoryBodyName: 'Project',
      })
    }, 'error')
    const failedCoordinator = new MnemonSubagentCoordinator(failed.value, undefined, undefined, failedTools.value)
    await expect(failedCoordinator.remember(parent(), { content: 'Use SQLite.' }, new AbortController().signal)).rejects.toThrow('stopped with error')
  })

  it('fails closed when a child completes without a terminal result or matching successful tool receipt', async () => {
    const host = subagents(undefined)
    const coordinator = createCoordinator(host.value)
    await expect(coordinator.recall(parent(), { query: 'x' }, new AbortController().signal)).rejects.toThrow('completed without recording its result')
    expect(host.dispose).toHaveBeenCalledOnce()
  })

  it('delegates writes with mutation tools and returns a compact receipt', async () => {
    const host = subagents({ summary: 'Stored in project.', action: 'stored', memoryBodyIds: ['project'] })
    const coordinator = createCoordinator(host.value)
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
    const coordinator = createCoordinator(host.value)
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
      toolFilter: { allow: [expect.stringMatching(/^mnemon_subagent_result_/)] },
      maxDepth: 1,
      persona: expect.stringContaining('host-filtered eligible list'),
    }))
    const request = (host.start.mock.calls[0] as unknown as [string, { prompt: Array<{ text: string }>; persona: string }])[1]
    expect(request.prompt[0]!.text).toContain('团队知识优先 OpenViking。')
    expect(request.persona).not.toContain('团队知识优先 OpenViking。')
    expect(request.persona).not.toMatch(/api.?key|endpoint|secret/iu)
    expect(coordinator.snapshot()).toMatchObject({ placements: 1, lastOperation: 'placement' })
  })

  it('curates metadata in a read-only child and keeps valid entries when another candidate is invalid', async () => {
    const host = subagents({
      summary: 'Updated one scope.',
      updates: [
        { memoryBodyId: 'product', title: '产品决策', description: '记录稳定的产品范围、取舍与依据，在规划和复盘产品方向时召回。' },
        { memoryBodyId: 'release', title: 'x'.repeat(49), description: '沉淀发布门禁、部署约束和回滚经验，在准备上线或处理故障时召回。' },
      ],
    })
    const memoryService = service()
    const runtime = { forAgent: vi.fn(() => ({ service: memoryService })) } as never
    const coordinator = createCoordinator(host.value, runtime)

    await expect(coordinator.maintainMetadata(parent(), ['product', 'release'], new AbortController().signal)).resolves.toMatchObject({
      delegated: true,
      runId: 'child-run-1',
      updates: [{ memoryBodyId: 'product', title: '产品决策' }],
    })
    expect(host.start).toHaveBeenCalledWith('spawn', expect.objectContaining({
      toolFilter: { allow: [expect.stringMatching(/^mnemon_subagent_result_/)] },
      agentOptions: { maxTokens: 4_096 },
      persona: expect.stringContaining('fastest bounded metadata-sampling path'),
    }))
    expect(memoryService.metadataSample).toHaveBeenCalledWith('product', expect.any(AbortSignal))
    expect(memoryService.metadataSample).toHaveBeenCalledWith('release', expect.any(AbortSignal))
    const metadataCall = (host.start.mock.calls[0] as unknown as [string, { prompt: Array<{ text: string }> }])[1]
    expect(metadataCall.prompt[0]!.text).toContain('sampling method: native-basic')
    expect(metadataCall.prompt[0]!.text).toContain('The product keeps durable architecture decisions.')
    expect(metadataCall.prompt[0]!.text).not.toMatch(/dbPath|endpoint|api.?key/iu)
    expect(coordinator.snapshot()).toMatchObject({ metadataMaintenances: 1, lastOperation: 'metadata-maintenance' })

    const incomplete = subagents({ summary: 'Only one.', updates: [{ memoryBodyId: 'product', title: '产品决策', description: '记录稳定的产品范围与取舍，在规划和复盘产品方向时召回。' }] })
    await expect(createCoordinator(incomplete.value, runtime).maintainMetadata(parent(), ['product', 'release'], new AbortController().signal)).resolves.toMatchObject({
      updates: [{ memoryBodyId: 'product' }],
    })

    const invalid = subagents({ summary: 'No valid metadata.', updates: [{ memoryBodyId: 'product', title: 'x', description: 'too short' }] })
    await expect(createCoordinator(invalid.value, runtime).maintainMetadata(parent(), ['product'], new AbortController().signal)).resolves.toMatchObject({ updates: [] })
  })

  it('reviews a completed full-context checkpoint through fork with a maintenance-only tool set', async () => {
    const host = subagents({ summary: 'No mutation needed.', action: 'skipped', memoryBodyIds: [] }, 'completed', ['spawn', 'fork'])
    const coordinator = createCoordinator(host.value)

    await expect(coordinator.review(parent(), new AbortController().signal)).resolves.toMatchObject({
      delegated: true,
      provider: 'fork',
      action: 'skipped',
    })
    expect(host.start).toHaveBeenCalledWith('fork', expect.objectContaining({
      toolFilter: { allow: expect.arrayContaining(['mnemon_memory_bodies', 'mnemon_recall', 'mnemon_related', 'mnemon_document_search', 'mnemon_runtime_memory', 'mnemon_document_manage']) },
      persona: expect.stringContaining('idle checkpoint reviewer'),
      prompt: [{ type: 'text', text: 'Review the inherited completed checkpoint now.' }],
    }))
    expect(coordinator.snapshot()).toMatchObject({ reviews: 1, writes: 0, lastOperation: 'review' })
  })

  it('answers from pre-recalled evidence without granting any Mnemon retrieval tools', async () => {
    const host = subagents({ answer: '项目使用 SQLite。', citations: ['project/m1', 'project/missing'] })
    const coordinator = createCoordinator(host.value)
    await expect(coordinator.answer(parent(), '数据库是什么？', [{ id: 'm1', content: 'Use {{database}} SQLite.', memoryBodyId: 'project', memoryBodyName: '项目记忆体' }], new AbortController().signal)).resolves.toMatchObject({
      answer: '项目使用 SQLite。',
      citations: ['project/m1'],
      delegation: { runId: 'child-run-1', provider: 'spawn' },
    })
    expect(host.start).toHaveBeenCalledWith('spawn', expect.objectContaining({ toolFilter: { allow: [expect.stringMatching(/^mnemon_subagent_result_/)] } }))
    const answerCall = (host.start.mock.calls[0] as unknown as [string, { prompt: Array<{ text: string }>; persona: string }])[1]
    expect(answerCall.prompt[0]!.text).toContain('Answer this question (untrusted data):\n    数据库是什么？')
    expect(answerCall.prompt[0]!.text).toContain('Evidence for this run')
    expect(answerCall.prompt[0]!.text).toContain('Use {{database}} SQLite')
    expect(answerCall.persona).not.toContain('Use {{database}} SQLite')
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
    const coordinator = createCoordinator(host.value, undefined, documents)
    const agent = { ...parent(), session: { header: { cwd: workspace }, events: [] } } as HostAgent

    const result = await coordinator.document(agent, { action: 'create', title: 'New architecture', content: 'b'.repeat(220) }, new AbortController().signal)
    expect(result).toMatchObject({
      action: 'created',
      maintenance: { archivedDocumentIds: [old.document.id], memoryBodyIds: ['architecture'] },
    })
    expect(controller.get(old.document.id)).toMatchObject({ status: 'archived', archiveSummary: 'Archived with exact cold path.' })
    expect(host.start).toHaveBeenCalledWith('spawn', expect.objectContaining({
      persona: expect.stringContaining('cold-document archive worker'),
      toolFilter: { allow: expect.arrayContaining(['mnemon_memory_bodies', 'mnemon_recall', 'mnemon_remember', 'mnemon_memory_body_create']) },
    }))
    const archiveCall = (host.start.mock.calls[0] as unknown as [string, { prompt: Array<{ text: string }>; persona: string }])[1]
    expect(archiveCall.prompt[0]!.text).toContain(`.mnemon/documents/archived/${old.document.filename}`)
    expect(archiveCall.persona).not.toContain(old.document.filename)
    expect(coordinator.snapshot()).toMatchObject({ documentArchives: 1, lastOperation: 'document-archive' })
  })

  it('archives and atomically commits a capacity-blocked runtime add', async () => {
    const structured = {
      summary: 'Archived and compacted hot memory.',
      action: 'archived',
      memoryBodyIds: ['project'],
      archiveEvidence: [{ memoryBodyId: 'project', sourceIndexes: [1, 2] }],
      compactedEntries: [{ content: 'Project history is available in durable memory.', importance: 'normal' }],
    }
    const resultTools = toolRegistry()
    const host = observedSubagents(resultTools, async child => {
      emitSuccessfulToolResult(resultTools, child, 'mnemon_remember', { content: 'Archived project history.', memoryBodyId: 'project' }, {
        action: 'stored', memoryBodyId: 'project', memoryBodyName: 'Project',
      })
      await emitStructuredResult(resultTools, child, structured)
    })
    const runtime = runtimeController()
    await runtime.mutate({ action: 'add', target: 'memory', content: 'a'.repeat(5_000) })
    await runtime.mutate({ action: 'add', target: 'memory', content: 'b'.repeat(5_000) })
    const content = 'New durable fact '.repeat(30)
    const coordinator = new MnemonSubagentCoordinator(host.value, runtime, undefined, resultTools.value, undefined, service())
    await expect(coordinator.runtime(parent(), { action: 'add', target: 'memory', content }, new AbortController().signal)).resolves.toMatchObject({
      added: content.trim(),
      maintenance: { kind: 'mnemon-archive', provider: 'spawn', memoryBodyIds: ['project'] },
    })
    expect(host.start).toHaveBeenCalledWith('spawn', expect.objectContaining({
      toolFilter: { allow: expect.arrayContaining(['mnemon_memory_bodies', 'mnemon_recall', 'mnemon_remember', 'mnemon_memory_body_create']) },
      agentOptions: { maxTokens: 32_768 },
    }))
    const migrationCall = (host.start.mock.calls[0] as unknown as [string, { prompt: Array<{ text: string }>; persona: string }])[1]
    const migrationPrompt = migrationCall.prompt[0]!.text
    expect(migrationPrompt).toContain('Run the MEMORY.md capacity archive now')
    expect(migrationPrompt).toContain('Pending mutation (uncommitted; excluded from archive and compaction)')
    expect(migrationPrompt).toContain('- Action: add')
    expect(migrationPrompt).toContain('New durable fact')
    expect(migrationPrompt).toContain('<runtime-memory-snapshot target="memory">')
    expect(migrationCall.persona).toContain('Do not count characters, bytes, tokens')
    expect(migrationCall.persona).toContain('Route each cluster independently')
    expect(migrationCall.persona).toContain('host generates the UUID, so never propose an id')
    expect(migrationCall.persona).toContain('USER.md preferences are outside this task and must never enter')
    expect(migrationCall.persona).not.toContain('{{package_manager}}')
    expect(migrationCall.persona).not.toContain('<runtime-memory-snapshot')
    expect(migrationPrompt).not.toMatch(/catalog_json|runtime_entries_json|pending_mutation_json|current_usage_json|created_at|markdownPath|dbPath/)
    expect(runtime.snapshot().entries.map(entry => entry.content)).toEqual(['Project history is available in durable memory.', content.trim()])
    expect(coordinator.snapshot()).toMatchObject({ migrations: 1, lastOperation: 'migration' })
  })

  it('excludes the superseded entry and atomically commits a capacity-blocked replacement', async () => {
    const structured = {
      summary: 'Archived and compacted hot memory.',
      action: 'archived',
      memoryBodyIds: ['project'],
      archiveEvidence: [{ memoryBodyId: 'project', sourceIndexes: [1, 2] }],
      compactedEntries: [{ content: 'Other project history is durably archived.', importance: 'normal' }],
    }
    const resultTools = toolRegistry()
    const host = observedSubagents(resultTools, async child => {
      emitSuccessfulToolResult(resultTools, child, 'mnemon_recall', { query: 'other project history', memoryBodyIds: ['project'] }, {
        query: 'other project history',
        mode: 'smart',
        results: [{ id: 'existing', content: 'Other project history.', memoryBodyId: 'project', memoryBodyName: 'Project' }],
      })
      await emitStructuredResult(resultTools, child, structured)
    })
    const runtime = runtimeController()
    const oldContent = `obsolete-${'o'.repeat(91)}`
    const replacement = `corrected-${'n'.repeat(490)}`
    await runtime.mutate({ action: 'add', target: 'memory', content: oldContent })
    await runtime.mutate({ action: 'add', target: 'memory', content: 'a'.repeat(5_000) })
    await runtime.mutate({ action: 'add', target: 'memory', content: 'b'.repeat(5_000) })
    const coordinator = new MnemonSubagentCoordinator(host.value, runtime, undefined, resultTools.value, undefined, service())
    await expect(coordinator.runtime(parent(), { action: 'replace', target: 'memory', oldText: 'obsolete-', content: replacement }, new AbortController().signal)).resolves.toMatchObject({
      replaced: { from: oldContent, to: replacement },
      maintenance: { kind: 'mnemon-archive', provider: 'spawn', memoryBodyIds: ['project'] },
    })
    const migrationCall = (host.start.mock.calls[0] as unknown as [string, { prompt: Array<{ text: string }> }])[1]
    expect(migrationCall.prompt[0]!.text).toContain('- Action: replace')
    expect(migrationCall.prompt[0]!.text).toContain('excluded by the host because it will be replaced')
    expect(migrationCall.prompt[0]!.text).toContain(replacement)
    expect(migrationCall.prompt[0]!.text).not.toContain(oldContent)
    expect(runtime.snapshot().entries.map(entry => entry.content)).toEqual(['Other project history is durably archived.', replacement])
    expect(coordinator.snapshot()).toMatchObject({ migrations: 1, lastOperation: 'migration' })
  })

  it('excludes and atomically removes an obsolete entry from a legacy over-capacity file', async () => {
    const structured = {
      summary: 'Archived the remaining legacy history.',
      action: 'archived',
      memoryBodyIds: ['project'],
      archiveEvidence: [{ memoryBodyId: 'project', sourceIndexes: [1, 2] }],
      compactedEntries: [{ content: 'Remaining legacy history is durably archived.', importance: 'normal' }],
    }
    const resultTools = toolRegistry()
    const host = observedSubagents(resultTools, async child => {
      emitSuccessfulToolResult(resultTools, child, 'mnemon_remember', { content: 'Remaining legacy history.', memoryBodyId: 'project' }, {
        action: 'stored', memoryBodyId: 'project', memoryBodyName: 'Project',
      })
      await emitStructuredResult(resultTools, child, structured)
    })
    const runtime = runtimeController()
    const removed = `withdrawn-${'x'.repeat(91)}`
    const now = '2026-08-23T00:00:00.000Z'
    const entries = [removed, 'a'.repeat(5_150), 'b'.repeat(5_150)].map(content => ({
      content, created_at: now, updated_at: now, target: 'memory' as const, importance: 'normal' as const,
    }))
    writeFileSync(runtime.sourcePath, `${JSON.stringify({ version: 1, entries }, null, 2)}\n`)
    writeFileSync(runtime.memoryPath, `${entries.map(entry => entry.content).join(RUNTIME_ENTRY_DELIMITER)}\n`)
    const coordinator = new MnemonSubagentCoordinator(host.value, runtime, undefined, resultTools.value, undefined, service())

    await expect(coordinator.runtime(parent(), { action: 'remove', target: 'memory', oldText: 'withdrawn-' }, new AbortController().signal)).resolves.toMatchObject({
      removed,
      maintenance: { kind: 'mnemon-archive', memoryBodyIds: ['project'] },
    })
    const migrationCall = (host.start.mock.calls[0] as unknown as [string, { prompt: Array<{ text: string }> }])[1]
    expect(migrationCall.prompt[0]!.text).toContain('- Action: remove')
    expect(migrationCall.prompt[0]!.text).toContain('excluded by the host because it will be removed')
    expect(migrationCall.prompt[0]!.text).not.toContain(removed)
    expect(runtime.snapshot().entries.map(entry => entry.content)).toEqual(['Remaining legacy history is durably archived.'])
  })

  it('rejects a runtime migration whose memory body ids are empty', async () => {
    const host = subagents({
      summary: 'Archived nothing anywhere.',
      action: 'archived',
      memoryBodyIds: [],
      archiveEvidence: [],
      compactedEntries: [{ content: 'Project uses pnpm.', importance: 'normal' }],
    })
    const plan = mockedMaintenancePlan()
    const runtime = {
      mutate: vi.fn().mockRejectedValueOnce(new RuntimeMemoryCapacityError('memory', 10_200, 10_300, 10_240)),
      planMaintenance: vi.fn(async () => plan),
      compactAndMutate: vi.fn(),
    } as unknown as RuntimeMemoryController
    const coordinator = createCoordinator(host.value, runtime, undefined, service())
    await expect(coordinator.runtime(parent(), { action: 'add', target: 'memory', content: plan.pending!.content }, new AbortController().signal)).rejects.toThrow('runtime memory migration returned no memory body ids')
    expect(runtime.compactAndMutate).not.toHaveBeenCalled()
  })

  it('rejects archive evidence that omits a committed source before local compaction', async () => {
    const host = subagents({
      summary: 'Only one source was accounted for.',
      action: 'archived',
      memoryBodyIds: ['project'],
      archiveEvidence: [{ memoryBodyId: 'project', sourceIndexes: [1] }],
      compactedEntries: [],
    })
    const plan = mockedMaintenancePlan()
    const runtime = {
      mutate: vi.fn().mockRejectedValueOnce(new RuntimeMemoryCapacityError('memory', plan.used, plan.projected, plan.limit)),
      planMaintenance: vi.fn(async () => plan),
      compactAndMutate: vi.fn(),
    } as unknown as RuntimeMemoryController
    const coordinator = createCoordinator(host.value, runtime, undefined, service())

    await expect(coordinator.runtime(parent(), { action: 'add', target: 'memory', content: plan.pending!.content }, new AbortController().signal))
      .rejects.toThrow('runtime memory migration omitted committed archive sources')
    expect(runtime.compactAndMutate).not.toHaveBeenCalled()
  })

  it('keeps local memory byte-identical when a valid destination is claimed without a successful archive receipt', async () => {
    const host = subagents({
      summary: 'Claimed an archive without using a durable tool.',
      action: 'archived',
      memoryBodyIds: ['project'],
      archiveEvidence: [{ memoryBodyId: 'project', sourceIndexes: [1, 2] }],
      compactedEntries: [{ content: 'Unverified archive pointer.', importance: 'normal' }],
    })
    const runtime = runtimeController()
    await runtime.mutate({ action: 'add', target: 'memory', content: 'a'.repeat(5_000) })
    await runtime.mutate({ action: 'add', target: 'memory', content: 'b'.repeat(5_000) })
    const paths = [runtime.sourcePath, runtime.memoryPath, runtime.userPath]
    const before = paths.map(path => readFileSync(path, 'utf8'))
    const coordinator = createCoordinator(host.value, runtime, undefined, service())

    await expect(coordinator.runtime(parent(), { action: 'add', target: 'memory', content: 'pending '.repeat(80) }, new AbortController().signal))
      .rejects.toThrow('runtime memory migration has no successful archive receipt for: project')
    expect(paths.map(path => readFileSync(path, 'utf8'))).toEqual(before)
  })

  it('does not treat a provisional provider receipt as completed archival', async () => {
    const structured = {
      summary: 'The provider only queued extraction.',
      action: 'archived',
      memoryBodyIds: ['project'],
      archiveEvidence: [{ memoryBodyId: 'project', sourceIndexes: [1, 2] }],
      compactedEntries: [],
    }
    const resultTools = toolRegistry()
    const host = observedSubagents(resultTools, async child => {
      emitSuccessfulToolResult(resultTools, child, 'mnemon_remember', { content: 'Project history.', memoryBodyId: 'project' }, {
        action: 'queued', status: 'pending', summary: 'Extraction is queued.', memoryBodyId: 'project',
      })
      await emitStructuredResult(resultTools, child, structured)
    })
    const plan = mockedMaintenancePlan()
    const runtime = {
      mutate: vi.fn().mockRejectedValueOnce(new RuntimeMemoryCapacityError('memory', plan.used, plan.projected, plan.limit)),
      planMaintenance: vi.fn(async () => plan),
      compactAndMutate: vi.fn(),
    } as unknown as RuntimeMemoryController
    const coordinator = new MnemonSubagentCoordinator(host.value, runtime, undefined, resultTools.value, undefined, service())

    await expect(coordinator.runtime(parent(), { action: 'add', target: 'memory', content: plan.pending!.content }, new AbortController().signal))
      .rejects.toThrow('runtime memory migration has no successful archive receipt for: project')
    expect(runtime.compactAndMutate).not.toHaveBeenCalled()
  })

  it('rejects unknown, inactive, disabled, and non-writable archive destinations before local compaction', async () => {
    const cases = [
      { name: 'unknown', id: 'ghost', items: [] },
      { name: 'inactive', id: 'project', items: [{ active: false, providerEnabled: true, remember: true }] },
      { name: 'disabled', id: 'project', items: [{ active: true, providerEnabled: false, remember: true }] },
      { name: 'non-writable', id: 'project', items: [{ active: true, providerEnabled: true, remember: false }] },
    ] as const
    for (const candidate of cases) {
      const host = subagents({
        summary: candidate.name,
        action: 'archived',
        memoryBodyIds: [candidate.id],
        archiveEvidence: [{ memoryBodyId: candidate.id, sourceIndexes: [1, 2] }],
        compactedEntries: [],
      })
      const plan = mockedMaintenancePlan()
      const runtime = {
        mutate: vi.fn().mockRejectedValueOnce(new RuntimeMemoryCapacityError('memory', plan.used, plan.projected, plan.limit)),
        planMaintenance: vi.fn(async () => plan),
        compactAndMutate: vi.fn(),
      } as unknown as RuntimeMemoryController
      const memoryService = {
        ...service(),
        bodies: vi.fn(async () => ({
          items: candidate.items.map(item => ({
            id: 'project', name: 'Project', description: 'Project memory', active: item.active, providerEnabled: item.providerEnabled,
            dbPath: '/tmp/project.db', createdAt: 'now', updatedAt: 'now', healthy: true,
            provider: { id: 'mnemon-native', label: 'mnemon', capabilities: { remember: item.remember } },
          })),
          total: candidate.items.length, activeCount: 0, directory: '/tmp', generatedAt: 'now',
        })),
      } as unknown as MnemonService
      const coordinator = createCoordinator(host.value, runtime, undefined, memoryService)
      await expect(coordinator.runtime(parent(), { action: 'add', target: 'memory', content: plan.pending!.content }, new AbortController().signal)).rejects.toThrow(`runtime memory migration selected an invalid memory body: ${candidate.id}`)
      expect(runtime.compactAndMutate).not.toHaveBeenCalled()
    }
  })

  it('compacts USER.md locally and atomically commits a capacity-blocked add', async () => {
    const host = subagents({
      summary: 'Merged two compatible profile preferences locally.',
      action: 'compacted',
      compactedEntries: [{
        content: 'User prefers concise Chinese release notes with blockers first.',
        importance: 'critical',
        sourceIndexes: [1, 2],
      }],
    })
    const runtime = runtimeController()
    await runtime.mutate({ action: 'add', target: 'user', content: `User prefers concise Chinese release notes. ${'a'.repeat(1_850)}`, importance: 'critical' })
    await runtime.mutate({ action: 'add', target: 'user', content: `User wants blockers listed first. ${'b'.repeat(1_850)}` })
    const coordinator = createCoordinator(host.value, runtime)

    const pending = `User prefers direct answers. ${'c'.repeat(300)}`
    await expect(coordinator.runtime(parent(), { action: 'add', target: 'user', content: pending }, new AbortController().signal)).resolves.toMatchObject({
      added: pending,
      maintenance: { kind: 'local-compaction', memoryBodyIds: [] },
    })
    expect(host.start).toHaveBeenCalledWith('spawn', expect.objectContaining({
      toolFilter: { allow: [expect.stringMatching(/^mnemon_subagent_result_/)] },
      agentOptions: { maxTokens: 8_192 },
      persona: expect.stringContaining('local USER.md compactor'),
    }))
    const compactionCall = (host.start.mock.calls[0] as unknown as [string, { prompt: Array<{ text: string }>; persona: string }])[1]
    const compactionPrompt = compactionCall.prompt[0]!.text
    expect(compactionPrompt).toContain('Run local USER.md compaction now')
    expect(compactionPrompt).toContain('- Action: add')
    expect(compactionPrompt).toContain(pending)
    expect(compactionPrompt).toContain('<runtime-memory-snapshot target="user">')
    expect(compactionCall.persona).toContain('never send user preferences to Mnemon Memory Spaces')
    expect(compactionCall.persona).toContain('every source number must appear exactly once')
    expect(compactionCall.persona).not.toContain('{{language}}')
    expect(compactionCall.persona).not.toContain('<runtime-memory-snapshot')
    expect(runtime.snapshot().entries.map(entry => entry.content)).toEqual(['User prefers concise Chinese release notes with blockers first.', pending])
    expect(coordinator.snapshot()).toMatchObject({ compactions: 1, migrations: 0, lastOperation: 'compaction' })
  })

  it('excludes an obsolete USER.md preference and atomically commits its replacement', async () => {
    const host = subagents({
      summary: 'Compacted the remaining profile.',
      action: 'compacted',
      compactedEntries: [{ content: 'User keeps release notes concise.', importance: 'normal', sourceIndexes: [1, 2] }],
    })
    const runtime = runtimeController()
    const obsolete = `obsolete-preference-${'o'.repeat(80)}`
    const replacement = `corrected-preference-${'n'.repeat(480)}`
    await runtime.mutate({ action: 'add', target: 'user', content: obsolete })
    await runtime.mutate({ action: 'add', target: 'user', content: 'a'.repeat(1_900) })
    await runtime.mutate({ action: 'add', target: 'user', content: 'b'.repeat(1_900) })
    const coordinator = createCoordinator(host.value, runtime)

    await expect(coordinator.runtime(parent(), { action: 'replace', target: 'user', oldText: 'obsolete-preference-', content: replacement }, new AbortController().signal)).resolves.toMatchObject({
      replaced: { from: obsolete, to: replacement },
      maintenance: { kind: 'local-compaction' },
    })
    const compactionCall = (host.start.mock.calls[0] as unknown as [string, { prompt: Array<{ text: string }> }])[1]
    expect(compactionCall.prompt[0]!.text).toContain('- Action: replace')
    expect(compactionCall.prompt[0]!.text).not.toContain(obsolete)
    expect(runtime.snapshot().entries.map(entry => entry.content)).toEqual(['User keeps release notes concise.', replacement])
  })

  it('rejects a USER.md compaction that omits any committed source entry', async () => {
    const host = subagents({
      summary: 'Incomplete candidate.',
      action: 'compacted',
      compactedEntries: [{ content: 'Only first preference.', importance: 'normal', sourceIndexes: [1] }],
    })
    const plan = mockedMaintenancePlan('user')
    const runtime = {
      mutate: vi.fn().mockRejectedValueOnce(new RuntimeMemoryCapacityError('user', 4_090, 4_180, 4_096)),
      planMaintenance: vi.fn(async () => plan),
      compactAndMutate: vi.fn(),
    } as unknown as RuntimeMemoryController
    const coordinator = createCoordinator(host.value, runtime)

    await expect(coordinator.runtime(parent(), { action: 'add', target: 'user', content: plan.pending!.content }, new AbortController().signal)).rejects.toThrow('omitted committed entries')
    expect(runtime.compactAndMutate).not.toHaveBeenCalled()
  })

  it('disposes failed child runs and reports a hard error instead of falling back to direct memory access', async () => {
    const failedChild = {
      ...parent('subagent'),
      session: { header: { origin: 'subagent' as const }, events: [{ type: 'turn/end', data: { reason: { kind: 'error', error: { code: 'MODEL_ROUTE', message: 'provider rejected sk-secret123456' } } } }] },
    }
    const host = subagents(undefined, 'error', ['spawn'], failedChild)
    const coordinator = createCoordinator(host.value)
    await expect(coordinator.recall(parent(), { query: 'x' }, new AbortController().signal)).rejects.toThrow('stopped with error: MODEL_ROUTE: provider rejected [redacted]')
    expect(host.dispose).toHaveBeenCalledOnce()
    expect(coordinator.snapshot().failures).toBe(1)
  })

  it('uses the rc.8 provider diagnostic for a failed remote child', async () => {
    const host = subagents(undefined, 'error', ['spawn'], undefined, 'REMOTE_GATEWAY:  rejected   sk-secret123456')
    const coordinator = createCoordinator(host.value)

    await expect(coordinator.recall(parent(), { query: 'x' }, new AbortController().signal))
      .rejects.toThrow('stopped with error: REMOTE_GATEWAY: rejected [redacted]')
    expect(host.dispose).toHaveBeenCalledOnce()
  })

  it('pins a fixed task Agent model onto the fork-based idle review delegation', async () => {
    const host = subagents({ summary: 'No mutation needed.', action: 'skipped', memoryBodyIds: [] }, 'completed', ['spawn', 'fork'])
    const resultTools = toolRegistry()
    const coordinator = new MnemonSubagentCoordinator(
      host.value,
      undefined,
      undefined,
      resultTools.value,
      () => ({ provider: 'pinned-provider', model: 'pinned-model' }),
    )

    await expect(coordinator.review(parent(), new AbortController().signal)).resolves.toMatchObject({
      delegated: true,
      provider: 'fork',
      action: 'skipped',
    })
    expect(host.start).toHaveBeenCalledWith('fork', expect.objectContaining({
      toolFilter: { allow: expect.arrayContaining(['mnemon_memory_bodies', 'mnemon_recall', 'mnemon_runtime_memory', 'mnemon_document_manage']) },
      agentOptions: { provider: 'pinned-provider', model: 'pinned-model' },
    }))
  })

  it('omits provider/model from agentOptions when the task Agent model is inherited', async () => {
    const host = subagents({ summary: 'No mutation needed.', action: 'skipped', memoryBodyIds: [] }, 'completed', ['spawn', 'fork'])
    const resultTools = toolRegistry()
    const coordinator = new MnemonSubagentCoordinator(
      host.value,
      undefined,
      undefined,
      resultTools.value,
      () => undefined,
    )

    await expect(coordinator.review(parent(), new AbortController().signal)).resolves.toMatchObject({
      delegated: true,
      provider: 'fork',
    })
    const reviewCall = (host.start.mock.calls[0] as unknown as [string, { agentOptions?: unknown }])[1]
    expect(reviewCall.agentOptions).toBeUndefined()
  })

  it('merges a fixed task Agent model with the per-op maxTokens for short-lived delegates', async () => {
    const host = subagents({
      summary: 'Merged two compatible profile preferences locally.',
      action: 'compacted',
      compactedEntries: [{
        content: 'User prefers concise Chinese release notes with blockers first.',
        importance: 'critical',
        sourceIndexes: [1, 2],
      }],
    })
    const plan = mockedMaintenancePlan('user')
    plan.pending = { content: 'User prefers direct answers.', importance: 'normal' }
    const runtime = {
      mutate: vi.fn().mockRejectedValueOnce(new RuntimeMemoryCapacityError('user', plan.used, plan.projected, plan.limit)),
      planMaintenance: vi.fn(async () => plan),
      compactAndMutate: vi.fn(async () => ({ success: true, message: 'Entry added.', target: 'user', entryCount: 2, usage: { used: 180, limit: 4_096 }, added: plan.pending!.content })),
    } as unknown as RuntimeMemoryController
    const resultTools = toolRegistry()
    const coordinator = new MnemonSubagentCoordinator(
      host.value,
      runtime,
      undefined,
      resultTools.value,
      () => ({ provider: 'pinned-provider', model: 'pinned-model' }),
    )

    await expect(coordinator.runtime(parent(), { action: 'add', target: 'user', content: 'User prefers direct answers.' }, new AbortController().signal)).resolves.toMatchObject({
      maintenance: { kind: 'local-compaction' },
    })
    expect(host.start).toHaveBeenCalledWith('spawn', expect.objectContaining({
      agentOptions: { provider: 'pinned-provider', model: 'pinned-model', maxTokens: 8_192 },
    }))
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
