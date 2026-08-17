import { describe, expect, it, vi } from 'vitest'
import type { HostSettingsService } from '../src/contracts.ts'
import { createSettingsHandler } from '../src/settings.ts'

describe('Mnemon settings bridge', () => {
  it('exposes and mutates only the Mnemon namespace through a revision fence', async () => {
    let revision = 2
    let value = { store: 'base', timeoutMs: 10000 }
    let user: Record<string, unknown> = {}
    const mutate = vi.fn(async (_namespace: string, ops: Array<{ op: string; path: string[]; value?: unknown }>, expected?: number) => {
      expect(expected).toBe(revision)
      for (const op of ops) {
        if (op.op === 'set') user[op.path[0]!] = op.value
        else delete user[op.path[0]!]
      }
      value = { ...value, ...user }
      revision += 1
    })
    const settings = {
      writable: true,
      register: vi.fn(),
      mutate,
      describe: () => [{ ns: 'mnemon', value, base: { store: 'base', timeoutMs: 10000 }, user, revision, applies: 'restart' as const }],
    } as unknown as HostSettingsService
    const handler = createSettingsHandler(settings)

    const read = await handler('get', {})
    expect(read).toEqual(expect.objectContaining({ ok: true, value: expect.objectContaining({ revision: 2, writable: true }) }))

    const ops = [
      { op: 'set', path: ['store'], value: 'settings-store' },
      { op: 'set', path: ['idleReviewMs'], value: 45000 },
      { op: 'set', path: ['displayMode'], value: 'buildin' },
      { op: 'set', path: ['taskAgentModel'], value: { mode: 'fixed', provider: 'deepseek', model: 'deepseek-chat' } },
    ]
    const written = await handler('mutate', { expectedRevision: 2, ops })
    expect(mutate).toHaveBeenCalledWith('mnemon', ops, 2)
    expect(written).toEqual(expect.objectContaining({ ok: true, value: expect.objectContaining({ revision: 3, user: { store: 'settings-store', idleReviewMs: 45000, displayMode: 'buildin', taskAgentModel: { mode: 'fixed', provider: 'deepseek', model: 'deepseek-chat' } } }) }))
  })

  it('rejects fields outside the plugin schema', async () => {
    const settings = {
      writable: true,
      register: vi.fn(),
      mutate: vi.fn(),
      describe: () => [{ ns: 'mnemon', value: {}, revision: 0, applies: 'restart' as const }],
    } as unknown as HostSettingsService
    const response = await createSettingsHandler(settings)('mutate', { ops: [{ op: 'set', path: ['other'], value: true }] })
    expect(response).toEqual(expect.objectContaining({
      ok: false,
      error: expect.objectContaining({ code: 'settings-rejected', details: { ns: 'mnemon' } }),
    }))
    expect(settings.mutate).not.toHaveBeenCalled()
  })

  it('exposes live browser interaction settings through a separate namespace', async () => {
    let revision = 4
    let value = { turnBar: false, saveAction: false }
    const mutate = vi.fn(async (_namespace: string, ops: Array<{ op: string; path: string[]; value?: unknown }>) => {
      value = { ...value, ...Object.fromEntries(ops.filter(op => op.op === 'set').map(op => [op.path[0], op.value])) }
      revision += 1
    })
    const settings = {
      writable: true,
      register: vi.fn(),
      mutate,
      describe: () => [
        { ns: 'mnemon', value: {}, revision: 1, applies: 'restart' as const },
        { ns: 'mnemon-ui', value, base: { turnBar: false, saveAction: false }, user: {}, revision, applies: 'live' as const },
      ],
    } as unknown as HostSettingsService
    const handler = createSettingsHandler(settings)

    await expect(handler('get', { namespace: 'mnemon-ui' })).resolves.toMatchObject({ ok: true, value: { applies: 'live', revision: 4 } })
    const ops = [
      { op: 'set', path: ['turnBar'], value: true },
      { op: 'set', path: ['saveAction'], value: true },
    ]
    await expect(handler('mutate', { namespace: 'mnemon-ui', expectedRevision: 4, ops })).resolves.toMatchObject({ ok: true, value: { revision: 5 } })
    expect(mutate).toHaveBeenCalledWith('mnemon-ui', ops, 4)

    await expect(handler('mutate', { namespace: 'mnemon-ui', ops: [{ op: 'set', path: ['toolviews'], value: true }] })).resolves.toMatchObject({ ok: false })
  })
})
