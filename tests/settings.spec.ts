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
    ]
    const written = await handler('mutate', { expectedRevision: 2, ops })
    expect(mutate).toHaveBeenCalledWith('mnemon', ops, 2)
    expect(written).toEqual(expect.objectContaining({ ok: true, value: expect.objectContaining({ revision: 3, user: { store: 'settings-store', idleReviewMs: 45000 } }) }))
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
})
