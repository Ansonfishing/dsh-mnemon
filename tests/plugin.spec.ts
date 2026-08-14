import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { apply, inject } from '../src/index.ts'

const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
  dsh: { client: { inject: string[]; platform: string } }
}

const directories: string[] = []

afterEach(() => {
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true })
})

function dataDir(): string {
  const directory = mkdtempSync(join(tmpdir(), 'dsh-mnemon-plugin-'))
  directories.push(directory)
  return directory
}

function context() {
  const tools: unknown[] = []
  const sections: unknown[] = []
  const channels: unknown[] = []
  const connection = {
    rpc: {
      handle: vi.fn((...args: unknown[]) => { channels.push(args) }),
    },
  }
  const registrations: unknown[] = []
  const commands: unknown[] = []
  const listeners: unknown[] = []
  const ctx = {
    tools: { register: vi.fn((tool: unknown) => { tools.push(tool) }) },
    commands: { register: vi.fn((command: unknown) => { commands.push(command) }) },
    settings: {
      register: vi.fn((...args: unknown[]) => {
        registrations.push(args)
        return { get: () => (args[2] as { base?: object } | undefined)?.base ?? {} }
      }),
    },
    connection,
    agents: { get: vi.fn(), roots: vi.fn(() => []) },
    workspaceRegistry: { get: vi.fn(), list: vi.fn(() => []) },
    subagents: {
      list: vi.fn(() => ['spawn']),
      getProvider: vi.fn(() => ({ capabilities: { outputSchema: true, depthLimit: true, toolFilter: true, persona: true } })),
      start: vi.fn(),
    },
    get: vi.fn((name: string) => name === 'systemPrompt'
      ? { section: (section: unknown) => { sections.push(section) } }
      : undefined),
    inject: vi.fn((_services: string[], callback: (value: unknown) => void) => { callback(ctx) }),
    on: vi.fn((...args: unknown[]) => { listeners.push(args); return () => {} }),
    effect: vi.fn((callback: () => unknown) => { callback(); return () => {} }),
  }
  return { ctx, tools, sections, channels, registrations, commands, listeners }
}

describe('dsh-mnemon plugin composition', () => {
  it('requests the Host workspace registry for authorized per-workspace routing', () => {
    expect(inject).toEqual(['tools', 'settings', 'commands', 'agents', 'subagents', 'workspaceRegistry'])
  })

  it('exports a DSH Web client with its ordering dependencies', () => {
    expect(manifest.dsh.client).toEqual({
      inject: [
        '@deepseek-ai/dsh-client-runtime',
        '@deepseek-ai/dsh-client-connection',
        '@deepseek-ai/dsh-client-ui-conversation',
        '@deepseek-ai/dsh-client-ui-settings',
        '@deepseek-ai/dsh-client-locale',
      ],
      platform: 'web',
    })
  })

  it('registers the full tool surface, guidance, and split RPC channels', () => {
    const fixture = context()
    apply(fixture.ctx as never, { cliPath: '/fake/mnemon', dataDir: dataDir() })
    expect(fixture.tools.map(tool => (tool as { name: string }).name)).toEqual([
      'mnemon_memory_bodies',
      'mnemon_recall',
      'mnemon_related',
      'mnemon_status',
      'mnemon_document_search',
      'mnemon_document_manage',
      'mnemon_runtime_memory',
      'mnemon_remember',
      'mnemon_link',
      'mnemon_forget',
      'mnemon_memory_body_create',
      'mnemon_memory_body_update',
      'mnemon_memory_body_merge',
    ])
    expect(fixture.tools).toEqual(expect.arrayContaining([
      expect.objectContaining({ output: expect.objectContaining({ schema: { type: 'object', additionalProperties: true } }) }),
    ]))
    expect(fixture.tools.every(tool => (tool as { output: { schema: { type: string } } }).output.schema.type !== 'json')).toBe(true)
    expect(fixture.sections).toEqual([
      expect.objectContaining({ name: 'mnemon:routing' }),
      expect.objectContaining({ name: 'mnemon:runtime-memory', text: expect.any(Function) }),
    ])
    const guidance = (fixture.sections[0] as { text: () => string }).text()
    expect(guidance).toContain('Call mnemon_recall')
    expect(guidance).toContain('never infer a missing historical rule')
    expect(guidance.length).toBeLessThan(360)
    expect(guidance).not.toContain('RECALL RESULT')
    expect(fixture.commands).toEqual([expect.objectContaining({ name: 'mnemon' })])
    expect(fixture.channels).toHaveLength(4)
    expect(fixture.channels).toEqual(expect.arrayContaining([
      expect.arrayContaining(['/dsh-mnemon-pack', expect.anything(), { authority: 'loopback' }]),
    ]))
    expect(fixture.registrations).toEqual([
      expect.arrayContaining(['mnemon', expect.anything(), expect.objectContaining({ applies: 'live' })]),
      expect.arrayContaining(['mnemon-ui', expect.anything(), expect.objectContaining({ applies: 'live', base: { toolviews: false, turnBar: false, saveAction: false } })]),
    ])
  })

  it('keeps stable live surfaces while fencing every mutation in read-only mode', async () => {
    const fixture = context()
    apply(fixture.ctx as never, { cliPath: '/fake/mnemon', dataDir: dataDir(), writeEnabled: false })
    expect(fixture.tools).toHaveLength(13)
    const runtimeTool = fixture.tools.find(tool => (tool as { name: string }).name === 'mnemon_runtime_memory') as {
      execute: (args: unknown, execution: unknown) => Promise<unknown>
    }
    expect(() => runtimeTool.execute({ action: 'add', target: 'memory', content: 'blocked' }, { signal: new AbortController().signal })).toThrow('read-only')
    expect(fixture.channels).toHaveLength(4)
    expect(fixture.channels).toEqual(expect.arrayContaining([
      expect.arrayContaining(['/dsh-mnemon-pack', expect.anything(), { authority: 'loopback' }]),
    ]))
    expect(fixture.sections).toEqual(expect.arrayContaining([expect.objectContaining({ name: 'mnemon:runtime-memory' })]))
  })

  it('offers compact recent-document suggestions when a cross-language query has no exact match', async () => {
    const fixture = context()
    const workspace = dataDir()
    apply(fixture.ctx as never, { cliPath: '/fake/mnemon', dataDir: dataDir() })
    const tools = fixture.tools as Array<{
      name: string
      execute: (args: unknown, execution: unknown) => Promise<unknown>
    }>
    const agent = {
      id: 'document-worker',
      options: {},
      session: { header: { origin: 'subagent', cwd: workspace }, events: [] },
    }
    const execution = { agent, signal: new AbortController().signal }
    await tools.find(tool => tool.name === 'mnemon_document_manage')!.execute({
      action: 'create',
      title: 'Cold Archive Transaction Contract',
      description: 'Write-ahead archival ordering and recovery invariants.',
      content: 'Land the durable cold reference before moving the managed original.',
    }, execution)

    const result = await tools.find(tool => tool.name === 'mnemon_document_search')!.execute({
      query: '冷归档不变量',
    }, execution) as { total: number; results: unknown[]; suggestions: Array<{ title: string }>; suggestionHint: string }

    expect(result.total).toBe(0)
    expect(result.results).toEqual([])
    expect(result.suggestions).toEqual([expect.objectContaining({ title: 'Cold Archive Transaction Contract' })])
    expect(result.suggestionHint).toContain('Retry')
  })

  it('keeps guidance and Web RPC registrations stable while their live values are disabled', () => {
    const fixture = context()
    apply(fixture.ctx as never, { cliPath: '/fake/mnemon', dataDir: dataDir(), routingGuidance: false, tabEnabled: false })
    expect(fixture.sections).toEqual([
      expect.objectContaining({ name: 'mnemon:routing', text: expect.any(Function) }),
      expect.objectContaining({ name: 'mnemon:runtime-memory' }),
    ])
    expect((fixture.sections[0] as { text: () => string }).text()).toBe('')
    expect(fixture.channels).toHaveLength(4)
  })

  it('atomically switches the same live RPC faces after settings validation', async () => {
    const fixture = context()
    const initialRoot = dataDir()
    const nextRoot = dataDir()
    apply(fixture.ctx as never, { cliPath: '/fake/mnemon', storageScope: 'custom', dataDir: initialRoot })
    const packRegistration = fixture.channels.find(channel => (channel as unknown[])[0] === '/dsh-mnemon-pack') as [string, (endpoint: string, payload: unknown) => Promise<{ ok: boolean; value?: { root: string } }>]
    await expect(packRegistration[1]('target', {})).resolves.toMatchObject({ ok: true, value: { root: initialRoot } })

    const coreRegistration = fixture.registrations.find(registration => (registration as unknown[])[0] === 'mnemon') as [string, unknown, { validate: (value: object) => void }]
    const next = { cliPath: '/fake/mnemon', storageScope: 'custom' as const, dataDir: nextRoot }
    coreRegistration[2].validate(next)
    const settingsUpdated = fixture.listeners.find(listener => (listener as unknown[])[0] === 'settings/updated') as [string, (namespace: string, value: object) => void]
    settingsUpdated[1]('mnemon', next)

    await expect(packRegistration[1]('target', {})).resolves.toMatchObject({ ok: true, value: { root: nextRoot } })
  })

  it('rejects an uninitializable live root before the active graph can move', async () => {
    const fixture = context()
    const initialRoot = dataDir()
    const invalidRoot = join(dataDir(), 'not-a-directory')
    writeFileSync(invalidRoot, 'occupied')
    apply(fixture.ctx as never, { cliPath: '/fake/mnemon', storageScope: 'custom', dataDir: initialRoot })
    const packRegistration = fixture.channels.find(channel => (channel as unknown[])[0] === '/dsh-mnemon-pack') as [string, (endpoint: string, payload: unknown) => Promise<{ ok: boolean; value?: { root: string } }>]
    const coreRegistration = fixture.registrations.find(registration => (registration as unknown[])[0] === 'mnemon') as [string, unknown, { validate: (value: object) => void }]

    expect(() => coreRegistration[2].validate({ cliPath: '/fake/mnemon', storageScope: 'custom', dataDir: invalidRoot })).toThrow()
    await expect(packRegistration[1]('target', {})).resolves.toMatchObject({ ok: true, value: { root: initialRoot } })
  })
})
