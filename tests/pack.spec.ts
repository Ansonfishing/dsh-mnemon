import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { strToU8, unzipSync, zipSync } from 'fflate'
import { resolveConfig } from '../src/config.ts'
import { DocumentController } from '../src/documents.ts'
import { MnemonPackManager, MNEMON_PACK_FORMAT, MNEMON_PACK_MIME } from '../src/pack.ts'
import { createRunner } from '../src/runner.ts'
import { RuntimeMemoryController } from '../src/runtime-memory.ts'
import type { ProcessRunner } from '../src/process.ts'

const directories: string[] = []
const now = () => new Date('2026-08-14T12:00:00.000Z')

function temporary(label: string): string {
  const directory = mkdtempSync(join(tmpdir(), `dsh-mnemon-${label}-`))
  directories.push(directory)
  return directory
}

function sqlite(seed: number): Buffer {
  const bytes = Buffer.alloc(4096)
  bytes.write('SQLite format 3\0', 0, 'binary')
  bytes[4095] = seed
  return bytes
}

function runner(root: string) {
  const config = resolveConfig({ storageScope: 'custom', dataDir: root, cliPath: '/fake/mnemon' })
  const process: ProcessRunner = async () => ({ stdout: '{}', stderr: '', exitCode: 0 })
  return { config, runner: createRunner(config, process) }
}

async function fixture(label: string, seed: number, bodyId = 'project') {
  const root = temporary(label)
  const workspace = temporary(`${label}-workspace`)
  const created = runner(root)
  const runtime = new RuntimeMemoryController(created.runner, now)
  await runtime.mutate({ action: 'add', target: 'user', content: 'Prefer concise answers', importance: 'normal' })
  const documents = new DocumentController(workspace, undefined, now, root)
  await documents.mutate({ action: 'create', title: `Design ${seed}`, content: `# Design\n\nSeed ${seed}` })
  const data = join(root, 'data')
  mkdirSync(join(data, bodyId), { recursive: true })
  writeFileSync(join(data, bodyId, 'mnemon.db'), sqlite(seed))
  writeFileSync(join(data, '.dsh-memory-bodies.json'), `${JSON.stringify({
    version: 1,
    bodies: [{ id: bodyId, name: `Space ${seed}`, description: `Seed ${seed}`, active: true, createdAt: now().toISOString(), updatedAt: now().toISOString() }],
  }, null, 2)}\n`)
  return { root, workspace, ...created, manager: new MnemonPackManager(created.runner, created.config, undefined, now) }
}

afterEach(() => {
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true })
})

describe('Mnemon Pack', () => {
  it('exports one native, checksummed Pack without leaking the host root', async () => {
    const source = await fixture('pack-export', 1)
    const exported = await source.manager.exportPack('full')
    const archive = Buffer.from(exported.base64, 'base64')
    const files = unzipSync(archive)
    const manifest = JSON.parse(Buffer.from(files['manifest.json']!).toString('utf8'))

    expect(exported).toMatchObject({ mimeType: MNEMON_PACK_MIME, targetRoot: source.root })
    expect(exported.fileName).toMatch(/^mnemon-full-.*\.mnemonpack$/u)
    expect(manifest).toMatchObject({ format: MNEMON_PACK_FORMAT, version: 1, scope: 'full', components: ['runtime', 'documents', 'memory-spaces'] })
    expect(Object.keys(files)).toEqual(expect.arrayContaining([
      'payload/runtime/memories.json',
      'payload/documents/index.json',
      'payload/data/.dsh-memory-bodies.json',
      'payload/data/project/mnemon.db',
    ]))
    expect(archive.includes(Buffer.from(source.root))).toBe(false)
    expect(source.manager.inspectPack(exported.base64, '../unsafe name.mnemonpack')).toMatchObject({
      fileName: 'unsafe-name.mnemonpack', targetRoot: source.root, archiveBytes: archive.length,
      occupied: { runtime: true, documents: true, 'memory-spaces': true },
    })
  })

  it('exports each component independently with the same Pack envelope', async () => {
    const source = await fixture('pack-parts', 2)
    for (const scope of ['runtime', 'documents', 'memory-spaces'] as const) {
      const exported = await source.manager.exportPack(scope)
      const files = unzipSync(Buffer.from(exported.base64, 'base64'))
      expect(exported.manifest).toMatchObject({ scope, components: [scope] })
      expect(Object.keys(files).filter(path => path.startsWith('payload/')).every(path => path.startsWith(`payload/${scope === 'memory-spaces' ? 'data' : scope}/`))).toBe(true)
    }
  })

  it('rejects checksum tampering, unsafe paths, and malformed transport data', async () => {
    const source = await fixture('pack-tamper', 3)
    const exported = await source.manager.exportPack('runtime')
    const files = unzipSync(Buffer.from(exported.base64, 'base64'))
    const runtimeSource = files['payload/runtime/memories.json']!
    runtimeSource[0] = runtimeSource[0]! ^ 1
    const tampered = Buffer.from(zipSync(files)).toString('base64')
    expect(() => source.manager.inspectPack(tampered)).toThrow('checksum mismatch')

    const unsafe = Buffer.from(zipSync({ '../escape': strToU8('x') })).toString('base64')
    expect(() => source.manager.inspectPack(unsafe)).toThrow('unsafe Pack entry path')
    expect(() => source.manager.inspectPack('not-base64')).toThrow('base64')
  })

  it('replaces a complete target atomically and refreshes the Memory Space catalog callback', async () => {
    const source = await fixture('pack-replace-source', 4, 'source')
    const target = await fixture('pack-replace-target', 5, 'target')
    const exported = await source.manager.exportPack('full')
    const refreshed = vi.fn()
    const manager = new MnemonPackManager(target.runner, target.config, refreshed, now)

    await expect(manager.importPack(exported.base64, { mode: 'replace' })).resolves.toMatchObject({ imported: true, components: ['runtime', 'documents', 'memory-spaces'] })

    expect(readdirSync(join(target.root, 'data')).filter(name => !name.startsWith('.'))).toEqual(['source'])
    expect(readFileSync(join(target.root, 'data', 'source', 'mnemon.db'))).toEqual(sqlite(4))
    expect(refreshed).toHaveBeenCalledWith(['runtime', 'documents', 'memory-spaces'])
    expect(readdirSync(target.root).some(name => name.startsWith('.dsh-pack-stage-') || name.startsWith('.dsh-pack-backup-'))).toBe(false)
  })

  it('merges components without overwriting a divergent Memory Space id', async () => {
    const source = await fixture('pack-merge-source', 6, 'shared')
    const target = await fixture('pack-merge-target', 7, 'shared')
    const exported = await source.manager.exportPack('full')

    await target.manager.importPack(exported.base64, { mode: 'merge' })

    const registry = JSON.parse(readFileSync(join(target.root, 'data', '.dsh-memory-bodies.json'), 'utf8')) as { bodies: Array<{ id: string }> }
    expect(registry.bodies).toHaveLength(2)
    expect(new Set(registry.bodies.map(body => body.id)).size).toBe(2)
    expect(readdirSync(join(target.root, 'data')).filter(name => !name.startsWith('.'))).toHaveLength(2)
    const runtime = JSON.parse(readFileSync(join(target.root, 'runtime', 'memories.json'), 'utf8')) as { entries: unknown[] }
    expect(runtime.entries).toHaveLength(1)
    const documents = JSON.parse(readFileSync(join(target.root, 'documents', 'index.json'), 'utf8')) as { documents: unknown[] }
    expect(documents.documents).toHaveLength(2)
  })

  it('imports only the requested component from a complete Pack', async () => {
    const source = await fixture('pack-partial-source', 8, 'source')
    const target = await fixture('pack-partial-target', 9, 'target')
    const beforeDatabase = readFileSync(join(target.root, 'data', 'target', 'mnemon.db'))
    const exported = await source.manager.exportPack('full')

    await target.manager.importPack(exported.base64, { mode: 'replace', components: ['runtime'] })

    expect(readFileSync(join(target.root, 'data', 'target', 'mnemon.db'))).toEqual(beforeDatabase)
    expect(readdirSync(join(target.root, 'data')).filter(name => !name.startsWith('.'))).toEqual(['target'])
  })

  it('leaves the target untouched when staging a merge fails', async () => {
    const source = await fixture('pack-rollback-source', 10)
    const target = await fixture('pack-rollback-target', 11)
    const exported = await source.manager.exportPack('full')
    const runtimeBefore = readFileSync(join(target.root, 'runtime', 'memories.json'))
    writeFileSync(join(target.root, 'documents', 'index.json'), '{ broken')

    await expect(target.manager.importPack(exported.base64, { mode: 'merge' })).rejects.toThrow()

    expect(readFileSync(join(target.root, 'runtime', 'memories.json'))).toEqual(runtimeBefore)
    expect(readdirSync(target.root).some(name => name.startsWith('.dsh-pack-stage-') || name.startsWith('.dsh-pack-backup-'))).toBe(false)
  })

  it('refuses to copy a live WAL database as an inconsistent snapshot', async () => {
    const source = await fixture('pack-wal', 12)
    writeFileSync(join(source.root, 'data', 'project', 'mnemon.db-wal'), 'pending')
    await expect(source.manager.exportPack('memory-spaces')).rejects.toThrow('not checkpointed')
  })
})
