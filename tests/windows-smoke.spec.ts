import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { delimiter, dirname, join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { resolveConfig } from '../src/config.ts'
import { createRunner, findMnemonCommand } from '../src/runner.ts'

const enabled = process.platform === 'win32' && process.env.RUN_WINDOWS_MNEMON_SMOKE === '1'
const temporaryDirectories: string[] = []

afterAll(() => {
  for (const directory of temporaryDirectories.splice(0)) rmSync(directory, { recursive: true, force: true })
})

describe.skipIf(!enabled)('Windows Mnemon integration', () => {
  it('discovers the default Go binary outside PATH and runs status', async () => {
    const expected = join(homedir(), 'go', 'bin', 'mnemon.exe')
    expect(existsSync(expected)).toBe(true)
    expect((process.env.PATH ?? '').split(delimiter).some(directory => directory.toLowerCase() === dirname(expected).toLowerCase())).toBe(false)

    const command = findMnemonCommand({})
    expect(command?.toLowerCase()).toBe(expected.toLowerCase())

    const dataDir = mkdtempSync(join(tmpdir(), 'dsh-mnemon-windows-smoke-'))
    temporaryDirectories.push(dataDir)
    const runner = createRunner(resolveConfig({ storageScope: 'custom', dataDir }))
    expect(runner.commandFound).toBe(true)
    await expect(runner.runText(['--version'], { globalFlags: false })).resolves.toContain('mnemon version')
    await expect(runner.runJson(['status'])).resolves.toMatchObject({ total_insights: 0 })
  })
})
