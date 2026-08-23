import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  RUNTIME_ENTRY_DELIMITER,
  RuntimeMemoryCapacityError,
  RuntimeMemoryController,
} from '../src/runtime-memory.ts'

const directories: string[] = []

afterEach(() => {
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true })
})

function fixture(now = new Date('2026-08-13T08:00:00.000Z')): { directory: string; controller: RuntimeMemoryController } {
  const directory = mkdtempSync(join(tmpdir(), 'dsh-mnemon-runtime-'))
  directories.push(directory)
  return {
    directory,
    controller: new RuntimeMemoryController({ effectiveDataDir: () => directory }, () => now),
  }
}

describe('RuntimeMemoryController', () => {
  it('creates the JSON source of truth and deterministic Markdown projections', async () => {
    const { directory, controller } = fixture()
    await controller.mutate({ action: 'add', target: 'user', content: '用户偏好简洁回答', importance: 'critical' })
    await controller.mutate({ action: 'add', target: 'memory', content: '项目使用 TypeScript', importance: 'normal' })

    const root = join(directory, 'runtime')
    const source = JSON.parse(readFileSync(join(root, 'memories.json'), 'utf8')) as { version: number; entries: unknown[] }
    expect(source).toEqual({
      version: 1,
      entries: [
        {
          content: '用户偏好简洁回答',
          created_at: '2026-08-13T08:00:00.000Z',
          updated_at: '2026-08-13T08:00:00.000Z',
          target: 'user',
          importance: 'critical',
        },
        {
          content: '项目使用 TypeScript',
          created_at: '2026-08-13T08:00:00.000Z',
          updated_at: '2026-08-13T08:00:00.000Z',
          target: 'memory',
          importance: 'normal',
        },
      ],
    })
    expect(readFileSync(join(root, 'USER.md'), 'utf8')).toBe('用户偏好简洁回答\n')
    expect(readFileSync(join(root, 'MEMORY.md'), 'utf8')).toBe('项目使用 TypeScript\n')
    expect(existsSync(join(root, '.memories.lock'))).toBe(false)
  })

  it('projects one-line entries separated by a standalone section sign', async () => {
    const { controller } = fixture()
    await controller.mutate({ action: 'add', target: 'memory', content: '第一条\n  测试' })
    await controller.mutate({ action: 'add', target: 'memory', content: '第二条\t测试' })

    expect(controller.snapshot().entries.map(entry => entry.content)).toEqual(['第一条 测试', '第二条 测试'])
    expect(readFileSync(controller.memoryPath, 'utf8')).toBe('第一条 测试\n§\n第二条 测试\n')
    expect(RUNTIME_ENTRY_DELIMITER).toBe('\n§\n')
    await expect(controller.mutate({ action: 'add', target: 'memory', content: '不能包含 § 分隔符' })).rejects.toThrow('reserved § entry delimiter')
  })

  it('supports unique-substring replace and remove while preserving creation time', async () => {
    const { controller } = fixture()
    await controller.mutate({ action: 'add', target: 'memory', content: 'Use TypeScript for plugin code' })
    const replaced = await controller.mutate({ action: 'replace', target: 'memory', oldText: 'TypeScript', content: 'Use Rust for plugin code', importance: 'low' })
    expect(replaced).toMatchObject({ message: 'Entry replaced.', replaced: { from: 'Use TypeScript for plugin code', to: 'Use Rust for plugin code' } })
    expect(controller.snapshot().entries).toEqual([
      expect.objectContaining({ content: 'Use Rust for plugin code', importance: 'low', created_at: '2026-08-13T08:00:00.000Z' }),
    ])

    await expect(controller.mutate({ action: 'remove', target: 'memory', oldText: 'Rust' })).resolves.toMatchObject({ removed: 'Use Rust for plugin code', entryCount: 0 })
    expect(controller.snapshot().entries).toEqual([])
  })

  it('rejects ambiguous substring mutations without changing the source', async () => {
    const { controller } = fixture()
    await controller.mutate({ action: 'add', target: 'memory', content: 'SQLite is local-first' })
    await controller.mutate({ action: 'add', target: 'memory', content: 'SQLite uses one file' })
    await expect(controller.mutate({ action: 'remove', target: 'memory', oldText: 'SQLite' })).rejects.toThrow('Multiple memory entries')
    expect(controller.snapshot().entries).toHaveLength(2)
  })

  it('serializes concurrent callers, including independent controller instances', async () => {
    const { directory, controller } = fixture()
    const other = new RuntimeMemoryController({ effectiveDataDir: () => directory })
    await Promise.all(Array.from({ length: 20 }, (_, index) => (index % 2 === 0 ? controller : other).mutate({
      action: 'add',
      target: index % 3 === 0 ? 'user' : 'memory',
      content: `concurrent-entry-${index}`,
    })))
    const snapshot = controller.snapshot()
    expect(snapshot.entries).toHaveLength(20)
    expect(new Set(snapshot.entries.map(entry => entry.content)).size).toBe(20)
    const memoryProjection = snapshot.entries.filter(entry => entry.target === 'memory').map(entry => entry.content).join(RUNTIME_ENTRY_DELIMITER)
    expect(readFileSync(controller.memoryPath, 'utf8')).toBe(`${memoryProjection}\n`)
  })

  it('uses UTF-8 bytes for capacity and leaves every file unchanged on overflow', async () => {
    const { controller } = fixture()
    await controller.mutate({ action: 'add', target: 'user', content: 'x'.repeat(4_090) })
    const beforeJson = readFileSync(controller.sourcePath, 'utf8')
    const beforeMarkdown = readFileSync(controller.userPath, 'utf8')
    await expect(controller.mutate({ action: 'add', target: 'user', content: '超出' })).rejects.toBeInstanceOf(RuntimeMemoryCapacityError)
    expect(readFileSync(controller.sourcePath, 'utf8')).toBe(beforeJson)
    expect(readFileSync(controller.userPath, 'utf8')).toBe(beforeMarkdown)
  })

  it('repairs derived files from memories.json when a controller starts', async () => {
    const { directory, controller } = fixture()
    await controller.mutate({ action: 'add', target: 'memory', content: 'source-owned value' })
    writeFileSync(controller.memoryPath, 'manual edit\n')
    new RuntimeMemoryController({ effectiveDataDir: () => directory })
    expect(readFileSync(controller.memoryPath, 'utf8')).toBe('source-owned value\n')
  })

  it('renders a bounded QoderWork-style runtime context from the committed source', async () => {
    const { controller } = fixture()
    await controller.mutate({ action: 'add', target: 'user', content: 'User prefers concise Chinese replies', importance: 'critical' })
    const context = controller.contextText()
    expect(context).toContain('MNEMON RUNTIME MEMORY PROTOCOL')
    expect(context).toContain('Manage hot memory exclusively with mnemon_runtime_memory')
    expect(context).toContain('Use action="add" only for a new independent fact')
    expect(context).toContain('Use action="replace" with a short unique old_text')
    expect(context).toContain('Use action="remove" with a short unique old_text')
    expect(context).toContain('The user\'s explicit request in the current turn wins over both files')
    expect(context).toContain('call mnemon_recall instead of inferring or filling the gap')
    expect(context).toContain('Contents of USER.md (user profile;')
    expect(context).toContain('<runtime-memory-file name="USER.md">\nUser prefers concise Chinese replies\n</runtime-memory-file>')
    expect(context).toContain('Contents of MEMORY.md (working reference; 0/10240 UTF-8 bytes)')
    expect(context).toContain('<runtime-memory-file name="MEMORY.md">\n(empty)\n</runtime-memory-file>')
    expect(context.match(/always relevant/gi)).toHaveLength(2)
    expect(context).not.toContain(controller.sourcePath)
  })

  it('assembles every prompt from the latest generated USER.md and MEMORY.md projections', async () => {
    const { controller } = fixture()
    const empty = controller.contextText()
    expect(empty).not.toContain('User prefers compact release notes')

    await controller.mutate({ action: 'add', target: 'user', content: 'User prefers compact release notes', importance: 'critical' })
    await controller.mutate({ action: 'add', target: 'memory', content: 'Release checks run with pnpm verify' })
    const populated = controller.contextText()

    expect(populated).toContain('User prefers compact release notes')
    expect(populated).toContain('Release checks run with pnpm verify')
    expect(readFileSync(controller.userPath, 'utf8')).toBe('User prefers compact release notes\n')
    expect(readFileSync(controller.memoryPath, 'utf8')).toBe('Release checks run with pnpm verify\n')
  })

  it('applies a compacted target only to the exact reviewed revision', async () => {
    const { controller } = fixture()
    await controller.mutate({ action: 'add', target: 'memory', content: 'Project uses pnpm.' })
    await controller.mutate({ action: 'add', target: 'memory', content: 'pnpm manages workspace dependencies.' })
    const reviewed = controller.snapshot()

    await controller.compactTarget(reviewed.revision, 'memory', [{ content: 'Project uses pnpm for workspace dependency management.', importance: 'normal' }])
    expect(controller.snapshot().entries).toEqual([
      expect.objectContaining({ target: 'memory', content: 'Project uses pnpm for workspace dependency management.', importance: 'normal' }),
    ])
    expect(readFileSync(controller.memoryPath, 'utf8')).toBe('Project uses pnpm for workspace dependency management.\n')
  })

  it('records validated migration lineage only in the compaction receipt checkpoint', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'dsh-mnemon-runtime-lineage-'))
    directories.push(directory)
    const commits: Array<Record<string, unknown>> = []
    const controller = new RuntimeMemoryController(
      { effectiveDataDir: () => directory },
      undefined,
      operation => {
        commits.push(operation as unknown as Record<string, unknown>)
        return {} as never
      },
    )
    await controller.mutate({ action: 'add', target: 'memory', content: 'Project uses pnpm.' })
    const reviewed = controller.snapshot()
    const lineage = [{
      source: { layerId: 'runtime', reference: `runtime:${reviewed.revision}:memory:1`, digest: 'a'.repeat(64) },
      destination: { layerId: 'memory-spaces', reference: 'memory-space:project/item:m1', digest: 'b'.repeat(64) },
    }]

    await controller.compactTarget(reviewed.revision, 'memory', [{ content: 'Project package manager is pnpm.', importance: 'normal' }], undefined, lineage)

    expect(commits.at(-1)).toMatchObject({ operation: 'runtime-compact', checkpoint: { lineage } })
    expect(readFileSync(controller.sourcePath, 'utf8')).not.toContain('memory-space:project')
  })

  it('never overwrites a concurrent mutation with an obsolete compaction plan', async () => {
    const { controller } = fixture()
    await controller.mutate({ action: 'add', target: 'user', content: 'User prefers concise replies.' })
    const reviewed = controller.snapshot()
    await controller.mutate({ action: 'add', target: 'user', content: 'User prefers Chinese.' })

    await expect(controller.compactTarget(reviewed.revision, 'user', [{ content: 'User prefers concise Chinese replies.', importance: 'critical' }])).rejects.toThrow('changed while archival')
    expect(controller.snapshot().entries.map(entry => entry.content)).toEqual(['User prefers concise replies.', 'User prefers Chinese.'])
  })

  it('packs semantic compaction candidates into an exact host-owned byte budget', async () => {
    const { controller } = fixture()
    await controller.mutate({ action: 'add', target: 'user', content: 'Original verbose preference.' })
    const reviewed = controller.snapshot()

    await controller.compactTarget(reviewed.revision, 'user', [
      { content: 'normal candidate that cannot join the critical one', importance: 'normal' },
      { content: 'critical rule', importance: 'critical' },
      { content: 'low detail', importance: 'low' },
    ], 28)

    expect(controller.snapshot().entries.map(entry => ({ content: entry.content, importance: entry.importance }))).toEqual([
      { content: 'critical rule', importance: 'critical' },
      { content: 'low detail', importance: 'low' },
    ])
  })

  it('atomically compacts surviving entries and applies a capacity-blocked replacement', async () => {
    const { controller } = fixture()
    const oldContent = `old-${'o'.repeat(96)}`
    const replacement = `new-${'n'.repeat(496)}`
    await controller.mutate({ action: 'add', target: 'memory', content: oldContent })
    await controller.mutate({ action: 'add', target: 'memory', content: 'a'.repeat(5_000) })
    await controller.mutate({ action: 'add', target: 'memory', content: 'b'.repeat(5_000) })
    const request = { action: 'replace', target: 'memory', oldText: 'old-', content: replacement } as const

    await expect(controller.mutate(request)).rejects.toBeInstanceOf(RuntimeMemoryCapacityError)
    const plan = await controller.planMaintenance(request)
    expect(plan).toMatchObject({
      action: 'replace',
      requiresMaintenance: true,
      pending: { content: replacement },
      excluded: { content: oldContent },
    })
    expect(plan.entries.map(entry => entry.content)).toEqual(['a'.repeat(5_000), 'b'.repeat(5_000)])

    const result = await controller.compactAndMutate(
      plan.revision,
      request,
      [{ content: 'Archived details remain available in project memory.', importance: 'normal' }],
      6_000,
    )
    expect(result).toMatchObject({ replaced: { from: oldContent, to: replacement } })
    expect(controller.snapshot().entries.map(entry => entry.content)).toEqual([
      'Archived details remain available in project memory.',
      replacement,
    ])
    expect(readFileSync(controller.memoryPath, 'utf8')).not.toContain(oldContent)
  })

  it('atomically commits a capacity-blocked add and records its migration lineage once', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'dsh-mnemon-runtime-atomic-lineage-'))
    directories.push(directory)
    const commits: Array<Record<string, unknown>> = []
    const controller = new RuntimeMemoryController(
      { effectiveDataDir: () => directory },
      undefined,
      operation => {
        commits.push(operation as unknown as Record<string, unknown>)
        return {} as never
      },
    )
    await controller.mutate({ action: 'add', target: 'memory', content: 'a'.repeat(5_000) })
    await controller.mutate({ action: 'add', target: 'memory', content: 'b'.repeat(5_000) })
    const request = { action: 'add', target: 'memory', content: 'new durable fact '.repeat(30) } as const
    await expect(controller.mutate(request)).rejects.toBeInstanceOf(RuntimeMemoryCapacityError)
    const plan = await controller.planMaintenance(request)
    const lineage = [{
      source: { layerId: 'runtime', reference: `runtime:${plan.revision}:memory:1`, digest: 'a'.repeat(64) },
      destination: { layerId: 'memory-spaces', reference: 'memory-space:project/item:m1', digest: 'b'.repeat(64) },
    }]

    const beforeCommitCount = commits.length
    const result = await controller.compactAndMutate(
      plan.revision,
      request,
      [{ content: 'Archived workspace history.', importance: 'normal' }],
      6_000,
      lineage,
    )

    expect(result).toMatchObject({ added: request.content.trim() })
    expect(controller.snapshot().entries.map(entry => entry.content)).toEqual([
      'Archived workspace history.',
      request.content.trim(),
    ])
    expect(commits).toHaveLength(beforeCommitCount + 1)
    expect(commits.at(-1)).toMatchObject({
      operation: 'runtime-add',
      checkpoint: { target: 'memory', maintenance: { kind: 'runtime-compaction', lineage } },
    })
  })

  it('never archives or preserves a removed entry while recovering an already-over-capacity file', async () => {
    const { controller } = fixture()
    const now = '2026-08-13T08:00:00.000Z'
    const removed = `delete-${'x'.repeat(93)}`
    const entries = [removed, 'a'.repeat(5_150), 'b'.repeat(5_150)].map(content => ({
      content,
      created_at: now,
      updated_at: now,
      target: 'memory' as const,
      importance: 'normal' as const,
    }))
    writeFileSync(controller.sourcePath, `${JSON.stringify({ version: 1, entries }, null, 2)}\n`)
    writeFileSync(controller.memoryPath, `${entries.map(entry => entry.content).join(RUNTIME_ENTRY_DELIMITER)}\n`)
    const request = { action: 'remove', target: 'memory', oldText: 'delete-' } as const

    await expect(controller.mutate(request)).rejects.toBeInstanceOf(RuntimeMemoryCapacityError)
    const plan = await controller.planMaintenance(request)
    expect(plan).toMatchObject({ action: 'remove', requiresMaintenance: true, excluded: { content: removed } })
    expect(plan.pending).toBeUndefined()
    expect(plan.entries.map(entry => entry.content)).not.toContain(removed)

    const result = await controller.compactAndMutate(
      plan.revision,
      request,
      [{ content: 'Remaining history is archived.', importance: 'normal' }],
      6_000,
    )
    expect(result).toMatchObject({ removed })
    expect(controller.snapshot().entries.map(entry => entry.content)).toEqual(['Remaining history is archived.'])
  })

  it('leaves every local file unchanged when a compacted mutation conflicts or still exceeds capacity', async () => {
    const { directory, controller } = fixture()
    const oldContent = `old-${'o'.repeat(96)}`
    await controller.mutate({ action: 'add', target: 'memory', content: oldContent })
    await controller.mutate({ action: 'add', target: 'memory', content: 'a'.repeat(5_000) })
    await controller.mutate({ action: 'add', target: 'memory', content: 'b'.repeat(5_000) })
    const request = { action: 'replace', target: 'memory', oldText: 'old-', content: 'n'.repeat(3_000) } as const
    await expect(controller.mutate(request)).rejects.toBeInstanceOf(RuntimeMemoryCapacityError)
    const obsolete = await controller.planMaintenance(request)

    const other = new RuntimeMemoryController({ effectiveDataDir: () => directory })
    await other.mutate({ action: 'replace', target: 'memory', oldText: 'old-', content: 'concurrent replacement' })
    const paths = [controller.sourcePath, controller.memoryPath, controller.userPath]
    const afterConcurrent = paths.map(path => readFileSync(path, 'utf8'))
    await expect(controller.compactAndMutate(
      obsolete.revision,
      request,
      [{ content: 'summary', importance: 'normal' }],
      6_000,
    )).rejects.toThrow('changed while archival')
    expect(paths.map(path => readFileSync(path, 'utf8'))).toEqual(afterConcurrent)

    const currentRequest = {
      action: 'replace',
      target: 'memory',
      oldText: 'concurrent replacement',
      content: 'n'.repeat(3_000),
    } as const
    await expect(controller.mutate(currentRequest)).rejects.toBeInstanceOf(RuntimeMemoryCapacityError)
    const current = await controller.planMaintenance(currentRequest)
    const beforeOverflow = paths.map(path => readFileSync(path, 'utf8'))
    await expect(controller.compactAndMutate(
      current.revision,
      currentRequest,
      [{ content: 'c'.repeat(8_000), importance: 'normal' }],
      10_240,
    )).rejects.toBeInstanceOf(RuntimeMemoryCapacityError)
    expect(paths.map(path => readFileSync(path, 'utf8'))).toEqual(beforeOverflow)
  })

  it('rejects compaction output that duplicates the pending mutation or reintroduces its excluded entry', async () => {
    const { controller } = fixture()
    const oldContent = `obsolete-${'o'.repeat(91)}`
    const replacement = `corrected-${'n'.repeat(490)}`
    await controller.mutate({ action: 'add', target: 'memory', content: oldContent })
    await controller.mutate({ action: 'add', target: 'memory', content: 'a'.repeat(5_000) })
    await controller.mutate({ action: 'add', target: 'memory', content: 'b'.repeat(5_000) })
    const request = { action: 'replace', target: 'memory', oldText: 'obsolete-', content: replacement } as const
    await expect(controller.mutate(request)).rejects.toBeInstanceOf(RuntimeMemoryCapacityError)
    const plan = await controller.planMaintenance(request)
    const paths = [controller.sourcePath, controller.memoryPath, controller.userPath]
    const before = paths.map(path => readFileSync(path, 'utf8'))

    await expect(controller.compactAndMutate(
      plan.revision,
      request,
      [{ content: replacement, importance: 'normal' }],
      6_000,
    )).rejects.toThrow('duplicates the pending mutation')
    expect(paths.map(path => readFileSync(path, 'utf8'))).toEqual(before)

    await expect(controller.compactAndMutate(
      plan.revision,
      request,
      [{ content: oldContent, importance: 'normal' }],
      6_000,
    )).rejects.toThrow('reintroduces the replaced or removed entry')
    expect(paths.map(path => readFileSync(path, 'utf8'))).toEqual(before)
  })
})
