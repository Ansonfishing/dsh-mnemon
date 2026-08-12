import { describe, expect, it, vi } from 'vitest'
import { resolveConfig } from '../src/config.ts'
import type { HostConnectionHandle } from '../src/contracts.ts'
import { createReadHandler, createWriteHandler, MNEMON_READ_CHANNEL, MNEMON_WRITE_CHANNEL, registerRpc } from '../src/rpc.ts'
import { MnemonService } from '../src/service.ts'

function fakeService(writeEnabled = true): MnemonService {
  return {
    config: resolveConfig({ writeEnabled }),
    status: vi.fn(async () => ({ healthy: true })),
    search: vi.fn(async request => ({ query: request.query, mode: 'smart', results: [] })),
    related: vi.fn(async () => []),
    remember: vi.fn(async () => ({ action: 'added' })),
    link: vi.fn(async () => ({ status: 'linked' })),
    forget: vi.fn(async () => ({ status: 'deleted' })),
  } as unknown as MnemonService
}

describe('Mnemon RPC', () => {
  it('dispatches read operations and rejects unknown endpoints', async () => {
    const service = fakeService()
    await expect(createReadHandler(service)('search', { query: 'SQLite' })).resolves.toMatchObject({ ok: true, value: { query: 'SQLite' } })
    await expect(createReadHandler(service)('nope', {})).resolves.toMatchObject({ ok: false, error: { code: 'not-found' } })
  })

  it('rejects malformed enum values at the service boundary', async () => {
    const config = resolveConfig({ cliPath: '/fake/mnemon' })
    const service = Object.create(MnemonService.prototype) as MnemonService
    Object.assign(service, {
      config,
      runner: { runJson: vi.fn(), effectiveDataDir: () => '/tmp', effectiveStore: () => 'default' },
    })
    await expect(createReadHandler(service)('search', { query: 'x', mode: 'anything' })).resolves.toMatchObject({
      ok: false,
      error: { code: 'mnemon-error' },
    })
  })

  it('forces human Tab writes to user provenance', async () => {
    const service = fakeService()
    await createWriteHandler(service)('remember', { content: 'A durable preference' })
    expect(service.remember).toHaveBeenCalledWith(expect.objectContaining({ source: 'user' }))
  })

  it('fences read and write channels with different authorities', () => {
    const handle = vi.fn()
    const connection = { rpc: { handle } } as unknown as HostConnectionHandle
    registerRpc(connection, fakeService())
    expect(handle).toHaveBeenCalledWith(MNEMON_READ_CHANNEL, expect.any(Function), { authority: 'trusted-host' })
    expect(handle).toHaveBeenCalledWith(MNEMON_WRITE_CHANNEL, expect.any(Function), { authority: 'loopback' })
  })

  it('does not expose a write channel in read-only mode', () => {
    const handle = vi.fn()
    registerRpc({ rpc: { handle } } as unknown as HostConnectionHandle, fakeService(false))
    expect(handle).toHaveBeenCalledTimes(1)
  })
})
