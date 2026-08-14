import { describe, expect, it, vi } from 'vitest'
import type { InteractionConfig } from '../src/config.ts'
import type { ClientConnectionHandle } from '../src/contracts.ts'
import { MnemonSettingsScope } from '../src/client/settings.ts'

describe('MnemonSettingsScope', () => {
  it('commits a multi-field edit through one namespaced revision fence', async () => {
    const call = vi.fn(async (_channel: string, endpoint: string, payload: unknown) => {
      if (endpoint === 'get') return { ok: true as const, value: { status: 'ready', value: { toolviews: false }, revision: 3, writable: true, mode: 'host' } }
      return { ok: true as const, value: { status: 'ready', value: { toolviews: true, turnBar: true }, revision: 4, writable: true, mode: 'host' } }
    })
    const scope = new MnemonSettingsScope<InteractionConfig>({ rpc: { call } } as ClientConnectionHandle, 'mnemon-ui')
    await vi.waitFor(() => expect(scope.getSnapshot().revision).toBe(3))

    const ops = [
      { op: 'set' as const, path: ['toolviews'], value: true },
      { op: 'set' as const, path: ['turnBar'], value: true },
    ]
    await scope.mutate(ops)

    expect(call).toHaveBeenLastCalledWith('/dsh-mnemon-settings', 'mutate', { namespace: 'mnemon-ui', expectedRevision: 3, ops })
    expect(scope.getSnapshot()).toMatchObject({ revision: 4, value: { toolviews: true, turnBar: true } })
  })

  it('reloads the authoritative snapshot after a rejected revision', async () => {
    let reads = 0
    const call = vi.fn(async (_channel: string, endpoint: string) => {
      if (endpoint === 'get') {
        reads += 1
        return { ok: true as const, value: { status: 'ready', value: { toolviews: reads > 1 }, revision: reads, writable: true, mode: 'host' } }
      }
      return { ok: false as const, error: { code: 'settings-rejected' as const, message: 'settings changed concurrently', details: { ns: 'mnemon-ui' } } }
    })
    const scope = new MnemonSettingsScope<InteractionConfig>({ rpc: { call } } as ClientConnectionHandle, 'mnemon-ui')
    await vi.waitFor(() => expect(scope.getSnapshot().revision).toBe(1))

    await expect(scope.mutate([{ op: 'set', path: ['toolviews'], value: true }])).rejects.toThrow('concurrently')
    expect(scope.getSnapshot()).toMatchObject({ revision: 2, value: { toolviews: true } })
  })
})
