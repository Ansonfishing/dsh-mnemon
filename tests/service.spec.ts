import { describe, expect, it, vi } from 'vitest'
import { resolveConfig } from '../src/config.ts'
import type { ProcessRunner } from '../src/process.ts'
import { createRunner } from '../src/runner.ts'
import { MnemonService, parseMemoryGraph } from '../src/service.ts'

const VIZ_HTML = `<script>
var nodes = new vis.DataSet([{id:"m2",label:"m2: [fact] Four graph memory",title:"Four graph memory",color:"#3498db",font:{color:"white"}},
{id:"m1",label:"m1: [decision] Use SQLite",title:"Use SQLite for local-first storage.",color:"#e74c3c",font:{color:"white"}}]);
var edges = new vis.DataSet([{from:"m1",to:"m2",label:"backbone",color:{color:"#aaaaaa"},arrows:"to",font:{color:"#aaaaaa",size:10}}]);
</script>`

function fixture(): { service: MnemonService; process: ReturnType<typeof vi.fn<ProcessRunner>> } {
  const process = vi.fn<ProcessRunner>(async (_command, args) => {
    if (args.includes('--version')) return { stdout: 'mnemon version 0.1.2\n', stderr: '', exitCode: 0 }
    if (args.includes('status')) return {
      stdout: JSON.stringify({
        total_insights: 3,
        deleted_insights: 1,
        by_category: { decision: 2, fact: 1 },
        edge_count: 4,
        top_entities: [{ entity: 'SQLite', count: 2 }],
        oplog_count: 8,
        db_path: '/tmp/mnemon/data/work/mnemon.db',
        db_size_bytes: 4096,
      }),
      stderr: '',
      exitCode: 0,
    }
    if (args.includes('recall')) return {
      stdout: JSON.stringify({ results: [{ id: 'm1', content: 'SQLite is selected.', category: 'decision', score: 0.91, confidence: 'high' }] }),
      stderr: '',
      exitCode: 0,
    }
    if (args.includes('viz')) return { stdout: VIZ_HTML, stderr: '', exitCode: 0 }
    if (args.includes('remember')) return { stdout: JSON.stringify({ id: 'm2', action: 'added' }), stderr: '', exitCode: 0 }
    if (args.includes('related')) return { stdout: JSON.stringify([{ id: 'm3', content: 'Single-file deployment', depth: 1 }]), stderr: '', exitCode: 0 }
    return { stdout: '{}', stderr: '', exitCode: 0 }
  })
  const config = resolveConfig({
    cliPath: '/fake/mnemon',
    dataDir: '/tmp/mnemon',
    store: 'work',
    timeoutMs: 4321,
    defaultRecallLimit: 7,
  })
  return { service: new MnemonService(createRunner(config, process), config), process }
}

describe('MnemonService', () => {
  it('projects status and reports the effective configuration', async () => {
    const { service, process } = fixture()
    const status = await service.status()
    expect(status).toMatchObject({
      healthy: true,
      version: '0.1.2',
      store: 'work',
      dataDir: '/tmp/mnemon',
      timeoutMs: 4321,
      stats: { totalInsights: 3, edgeCount: 4, byCategory: { decision: 2 } },
    })
    expect(process).toHaveBeenCalledWith('/fake/mnemon', ['--data-dir', '/tmp/mnemon', '--store', 'work', 'status'], expect.anything())
    expect(process).toHaveBeenCalledWith('/fake/mnemon', ['--version'], expect.anything())
  })

  it('uses graph recall by default and normalizes compact results', async () => {
    const { service, process } = fixture()
    const result = await service.search({ query: ' database choice ' })
    expect(result.results).toEqual([expect.objectContaining({ id: 'm1', score: 0.91, confidence: 'high' })])
    expect(process).toHaveBeenCalledWith(
      '/fake/mnemon',
      ['--data-dir', '/tmp/mnemon', '--store', 'work', 'recall', 'database choice', '--limit', '7'],
      expect.anything(),
    )
  })

  it('parses the official Mnemon visualization into a safe graph snapshot', async () => {
    const { service, process } = fixture()
    const graph = await service.graph()
    expect(graph.nodes).toEqual([
      expect.objectContaining({ id: 'm2', category: 'fact', content: 'Four graph memory' }),
      expect.objectContaining({ id: 'm1', category: 'decision' }),
    ])
    expect(graph.edges).toEqual([expect.objectContaining({ sourceId: 'm1', targetId: 'm2', type: 'temporal', label: 'backbone' })])
    expect(process).toHaveBeenCalledWith('/fake/mnemon', expect.arrayContaining(['viz', '--format', 'html']), expect.anything())
  })

  it('lists active memories without issuing a recall and filters locally', async () => {
    const { service, process } = fixture()
    await expect(service.list({ query: 'sqlite', category: 'decision' })).resolves.toMatchObject({
      total: 1,
      items: [{ id: 'm1', content: 'Use SQLite for local-first storage.', category: 'decision', color: '#e74c3c' }],
    })
    expect(process.mock.calls.some(([, args]) => args.includes('recall'))).toBe(false)
  })

  it('exposes top entities and recalls one entity on demand', async () => {
    const { service, process } = fixture()
    await expect(service.entities()).resolves.toMatchObject({ items: [{ entity: 'SQLite', count: 2 }], insights: [] })
    await expect(service.entities('SQLite', 5)).resolves.toMatchObject({ selected: 'SQLite', insights: [{ id: 'm1' }] })
    expect(process).toHaveBeenCalledWith('/fake/mnemon', expect.arrayContaining(['--intent', 'ENTITY', '--limit', '5']), expect.anything())
  })

  it('rejects malformed visualization output', () => {
    expect(() => parseMemoryGraph('<html />')).toThrow('unexpected HTML')
  })

  it('normalizes the nested recall rows returned by Mnemon 0.1.2', async () => {
    const process = vi.fn<ProcessRunner>(async () => ({
      stdout: JSON.stringify({
        results: [{
          insight: { id: 'legacy-1', content: 'Nested payload', category: 'fact', importance: 4, tags: ['legacy'] },
          score: 0.72,
          intent: 'GENERAL',
          via: 'hybrid',
        }],
      }),
      stderr: '',
      exitCode: 0,
    }))
    const config = resolveConfig({ cliPath: '/fake/mnemon' })
    const service = new MnemonService(createRunner(config, process), config)
    await expect(service.search({ query: 'nested' })).resolves.toMatchObject({
      results: [{ id: 'legacy-1', content: 'Nested payload', category: 'fact', importance: 4, score: 0.72, matchedVia: 'hybrid' }],
    })
  })

  it('validates and forwards durable write metadata without a shell', async () => {
    const { service, process } = fixture()
    await service.remember({ content: 'Use SQLite for local-first storage.', category: 'decision', importance: 5, tags: ['storage', 'local'] })
    expect(process).toHaveBeenCalledWith(
      '/fake/mnemon',
      expect.arrayContaining(['remember', 'Use SQLite for local-first storage.', '--cat', 'decision', '--imp', '5', '--tags', 'storage,local']),
      expect.anything(),
    )
  })

  it('refuses mutations in read-only plugin mode', async () => {
    const config = resolveConfig({ cliPath: '/fake/mnemon', writeEnabled: false })
    const process = vi.fn<ProcessRunner>()
    const service = new MnemonService(createRunner(config, process), config)
    await expect(service.remember({ content: 'secret' })).rejects.toThrow('read-only')
    expect(process).not.toHaveBeenCalled()
  })

  it('traverses related nodes with a bounded depth', async () => {
    const { service } = fixture()
    await expect(service.related('m1', 2)).resolves.toEqual([
      expect.objectContaining({ id: 'm3', depth: 1 }),
    ])
    await expect(service.related('m1', 9)).rejects.toThrow('1..5')
  })
})
