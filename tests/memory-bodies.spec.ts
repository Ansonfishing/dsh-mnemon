import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolveConfig } from '../src/config.ts'
import { MemoryBodyRegistry } from '../src/memory-bodies.ts'
import type { ProcessRunner } from '../src/process.ts'
import { createRunner } from '../src/runner.ts'

const temporaryDirectories: string[] = []

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) rmSync(directory, { recursive: true, force: true })
})

function temporaryDirectory(): string {
  const directory = mkdtempSync(join(tmpdir(), 'dsh-mnemon-registry-'))
  temporaryDirectories.push(directory)
  return directory
}

describe('MemoryBodyRegistry', () => {
  it('keeps an empty data directory at zero memory spaces instead of creating a phantom default', () => {
    const dataDir = temporaryDirectory()
    const runner = createRunner(resolveConfig({ cliPath: '/fake/mnemon', dataDir }), vi.fn<ProcessRunner>())
    const registry = new MemoryBodyRegistry(runner, true)

    expect(registry.list()).toEqual([])
    expect(existsSync(join(dataDir, 'data', '.dsh-memory-bodies.json'))).toBe(false)
  })

  it('migrates native stores into a global memory-body catalog without moving their databases', () => {
    const dataDir = temporaryDirectory()
    mkdirSync(join(dataDir, 'data', 'project'), { recursive: true })
    writeFileSync(join(dataDir, 'data', 'project', 'mnemon.db'), 'existing database')
    const runner = createRunner(resolveConfig({ cliPath: '/fake/mnemon', dataDir, store: 'project' }), vi.fn<ProcessRunner>())
    const registry = new MemoryBodyRegistry(runner, true, () => new Date('2026-08-13T00:00:00.000Z'))

    expect(registry.list()).toEqual([
      expect.objectContaining({ id: 'project', name: 'project', active: true, dbPath: join(dataDir, 'data', 'project', 'mnemon.db') }),
    ])
    expect(readFileSync(join(dataDir, 'data', 'project', 'mnemon.db'), 'utf8')).toBe('existing database')
    expect(existsSync(join(dataDir, 'data', '.dsh-memory-bodies.json'))).toBe(true)
  })

  it('keeps a legacy default Store without presenting it as an auto-created default Memory Space', () => {
    const dataDir = temporaryDirectory()
    mkdirSync(join(dataDir, 'data', 'default'), { recursive: true })
    writeFileSync(join(dataDir, 'data', 'default', 'mnemon.db'), 'existing database')
    writeFileSync(join(dataDir, 'data', '.dsh-memory-bodies.json'), JSON.stringify({
      version: 1,
      bodies: [{
        id: 'default',
        name: '默认记忆体',
        description: '从现有 Mnemon Store 自动接入。',
        active: true,
        createdAt: '2026-05-29T00:00:00.000Z',
        updatedAt: '2026-08-13T00:00:00.000Z',
      }],
    }))
    const runner = createRunner(resolveConfig({ cliPath: '/fake/mnemon', dataDir }), vi.fn<ProcessRunner>())

    const registry = new MemoryBodyRegistry(runner, true)

    expect(registry.list()).toEqual([
      expect.objectContaining({ id: 'default', name: 'default', description: 'Existing Mnemon Store discovered on disk.', active: true }),
    ])
    expect(readFileSync(join(dataDir, 'data', 'default', 'mnemon.db'), 'utf8')).toBe('existing database')
  })

  it('persists names, descriptions, and activation independently from Mnemon data', async () => {
    const dataDir = temporaryDirectory()
    const process = vi.fn<ProcessRunner>(async () => ({ stdout: 'Created store', stderr: '', exitCode: 0 }))
    const runner = createRunner(resolveConfig({ cliPath: '/fake/mnemon', dataDir, store: 'default' }), process)
    const registry = new MemoryBodyRegistry(runner, true, () => new Date('2026-08-13T00:00:00.000Z'))

    const created = await registry.create({ name: '产品决策', description: '产品范围、取舍与稳定决策；规划或复盘产品方向时召回。' })
    expect(created.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    registry.update(created.id, { active: true, description: '稳定产品上下文；规划或复盘产品方向时召回。' })

    const reloaded = new MemoryBodyRegistry(runner, true)
    expect(reloaded.get(created.id)).toMatchObject({ name: '产品决策', description: '稳定产品上下文；规划或复盘产品方向时召回。', active: true })
    expect(process).toHaveBeenCalledWith('/fake/mnemon', expect.arrayContaining(['--store', created.id, 'store', 'create', created.id]), expect.anything())
  })

  it('requires a routing description and never derives a new id from model-authored text', async () => {
    const dataDir = temporaryDirectory()
    const process = vi.fn<ProcessRunner>(async () => ({ stdout: 'Created store', stderr: '', exitCode: 0 }))
    const runner = createRunner(resolveConfig({ cliPath: '/fake/mnemon', dataDir, store: 'default' }), process)
    const registry = new MemoryBodyRegistry(runner, true)

    await expect(registry.create({ name: '含义不足', description: '' })).rejects.toThrow('description is required')
    const created = await registry.create({ name: '发布与交付', description: '发布门禁、部署约束与回滚经验；准备发布时召回。' })
    expect(created.id).not.toContain('发布')
    expect(created.id).toMatch(/^[0-9a-f-]{36}$/)
  })
})
