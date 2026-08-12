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

  it('persists names, descriptions, and activation independently from Mnemon data', async () => {
    const dataDir = temporaryDirectory()
    const process = vi.fn<ProcessRunner>(async () => ({ stdout: 'Created store', stderr: '', exitCode: 0 }))
    const runner = createRunner(resolveConfig({ cliPath: '/fake/mnemon', dataDir, store: 'default' }), process)
    const registry = new MemoryBodyRegistry(runner, true, () => new Date('2026-08-13T00:00:00.000Z'))

    await registry.create({ id: 'product', name: '产品记忆体', description: '产品决策与用户偏好' })
    registry.update('product', { active: true, description: '稳定产品上下文' })

    const reloaded = new MemoryBodyRegistry(runner, true)
    expect(reloaded.get('product')).toMatchObject({ name: '产品记忆体', description: '稳定产品上下文', active: true })
    expect(process).toHaveBeenCalledWith('/fake/mnemon', expect.arrayContaining(['--store', 'product', 'store', 'create', 'product']), expect.anything())
  })
})
