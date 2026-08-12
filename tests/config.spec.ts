import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolveConfig } from '../src/config.ts'
import type { ProcessRunner } from '../src/process.ts'
import { createRunner } from '../src/runner.ts'

afterEach(() => vi.unstubAllEnvs())

describe('Mnemon config and resolution', () => {
  it('materializes conservative defaults', () => {
    expect(resolveConfig({})).toMatchObject({
      timeoutMs: 10_000,
      defaultRecallLimit: 10,
      routingGuidance: true,
      lifecycleEnabled: true,
      recallMode: 'guided',
      writebackMode: 'guided',
      tabEnabled: true,
      writeEnabled: true,
    })
  })

  it('rejects unsafe store names', () => {
    expect(() => resolveConfig({ store: '../other' })).toThrow('store')
  })

  it('preserves Mnemon environment and active-store semantics when config is omitted', () => {
    vi.stubEnv('MNEMON_DATA_DIR', '/memory-root')
    vi.stubEnv('MNEMON_STORE', 'shared')
    const process: ProcessRunner = async () => ({ stdout: '{}', stderr: '', exitCode: 0 })
    const runner = createRunner(resolveConfig({ cliPath: '/fake/mnemon' }), process)
    expect(runner.effectiveDataDir()).toBe('/memory-root')
    expect(runner.effectiveStore()).toBe('shared')
  })

  it('serializes CLI processes so concurrent WebUI reads cannot race Mnemon migrations', async () => {
    let active = 0
    let maximumActive = 0
    const process = vi.fn<ProcessRunner>(async () => {
      active += 1
      maximumActive = Math.max(maximumActive, active)
      await Promise.resolve()
      active -= 1
      return { stdout: '{}', stderr: '', exitCode: 0 }
    })
    const runner = createRunner(resolveConfig({ cliPath: '/fake/mnemon' }), process)

    await Promise.all([
      runner.runText(['status']),
      runner.runText(['viz', '--format', 'html', '--output', '-']),
      runner.runText(['--version'], { globalFlags: false }),
    ])

    expect(process).toHaveBeenCalledTimes(3)
    expect(maximumActive).toBe(1)
  })

  it('continues the CLI queue after one command fails', async () => {
    const process = vi.fn<ProcessRunner>()
      .mockResolvedValueOnce({ stdout: '', stderr: 'locked', exitCode: 1 })
      .mockResolvedValueOnce({ stdout: 'recovered', stderr: '', exitCode: 0 })
    const runner = createRunner(resolveConfig({ cliPath: '/fake/mnemon' }), process)

    await expect(runner.runText(['status'])).rejects.toThrow('locked')
    await expect(runner.runText(['--version'], { globalFlags: false })).resolves.toBe('recovered')
  })
})
