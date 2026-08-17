import { describe, expect, it, vi } from 'vitest'
import type { ClientConnectionHandle } from '../src/contracts.ts'
import { MnemonClient } from '../src/client/api.ts'

describe('MnemonClient turn activity batching', () => {
  it('shares one bulk projection across all turn tails until the durable cursor advances', async () => {
    let cursor = 7
    const call = vi.fn(async (_channel: string, endpoint: string) => {
      expect(endpoint).toBe('turn-activities')
      return {
        ok: true as const,
        value: {
          cursor,
          activities: [
            { turn: 1, count: 1, names: ['mnemon_recall'], recalls: 1, writes: 0, documentSearches: 0, inspections: 0, failures: 0 },
            { turn: 2, count: 1, names: ['mnemon_status'], recalls: 0, writes: 0, documentSearches: 0, inspections: 1, failures: 0 },
          ],
        },
      }
    })
    const connection = { rpc: { call } } as ClientConnectionHandle
    const client = new MnemonClient(connection, 'session-1')

    const [first, second] = await Promise.all([client.turnActivity(1, 5), client.turnActivity(2, 7)])
    expect(first?.recalls).toBe(1)
    expect(second?.inspections).toBe(1)
    expect(call).toHaveBeenCalledTimes(1)

    await client.turnActivity(1, 7)
    expect(call).toHaveBeenCalledTimes(1)

    cursor = 10
    await client.turnActivity(2, 10)
    expect(call).toHaveBeenCalledTimes(2)
  })

  it('keeps automatic placement policy scoped to the active session and workspace', async () => {
    const call = vi.fn(async () => ({
      ok: true as const,
      value: { id: 'body-1', name: 'Team memory', description: 'Shared context.', active: false },
    }))
    const client = new MnemonClient({ rpc: { call } } as ClientConnectionHandle, 'session-1', 'workspace-1')

    await client.createBody({
      name: 'Team memory',
      description: 'Shared context.',
      placement: {
        mode: 'automatic',
        prompt: 'Prefer collaboration when policy allows it.',
        rules: { preference: 'shared-first', allowedProviderIds: ['mnemon-native', 'openviking'] },
      },
    })

    expect(call).toHaveBeenCalledWith(expect.any(String), 'body-create', expect.objectContaining({
      sessionId: 'session-1',
      workspaceId: 'workspace-1',
      placement: expect.objectContaining({ mode: 'automatic', rules: expect.objectContaining({ preference: 'shared-first' }) }),
    }))
  })

  it('routes native backup operations to the selected workspace', async () => {
    const call = vi.fn(async () => ({ ok: true as const, value: { root: '/workspace/.mnemon', scope: 'workspace' } }))
    const client = new MnemonClient({ rpc: { call } } as ClientConnectionHandle, 'session-1', 'workspace-1')

    await client.packTarget()

    expect(call).toHaveBeenCalledWith(expect.any(String), 'target', { sessionId: 'session-1', workspaceId: 'workspace-1' })
  })

  it('routes provider service settings independently from Memory Spaces', async () => {
    const call = vi.fn(async () => ({ ok: true as const, value: { providerId: 'mem0', configured: true, settings: { endpoint: 'http://127.0.0.1:8888' }, configuredSecrets: [] } }))
    const client = new MnemonClient({ rpc: { call } } as ClientConnectionHandle, 'session-1', 'workspace-1')

    await client.updateProviderService({ providerId: 'mem0', settings: { endpoint: 'http://127.0.0.1:8888', mode: 'self-hosted' }, enabled: true })

    expect(call).toHaveBeenCalledWith(expect.any(String), 'provider-service-update', {
      providerId: 'mem0', settings: { endpoint: 'http://127.0.0.1:8888', mode: 'self-hosted' }, enabled: true, sessionId: 'session-1', workspaceId: 'workspace-1',
    })
  })

  it('loads the independent task Agent model catalog without a session dependency', async () => {
    const catalog = {
      effective: { provider: 'deepseek', model: 'deepseek-chat', source: 'dsh-default' as const },
      groups: [{ id: 'deepseek', name: 'DeepSeek', models: [{ id: 'deepseek-chat', name: 'DeepSeek Chat' }] }],
      failures: [],
    }
    const call = vi.fn(async () => ({ ok: true as const, value: catalog }))
    const client = new MnemonClient({ rpc: { call } } as ClientConnectionHandle)

    await expect(client.taskAgentModels()).resolves.toEqual(catalog)
    expect(call).toHaveBeenCalledWith(expect.any(String), 'task-agent-models', {})
  })

  it('routes a card-level Memory Space reconnect with the active scope', async () => {
    const call = vi.fn(async () => ({ ok: true as const, value: { id: 'mem0-body', healthy: true } }))
    const client = new MnemonClient({ rpc: { call } } as ClientConnectionHandle, 'session-1', 'workspace-1')

    await client.reconnectBody('mem0-body')

    expect(call).toHaveBeenCalledWith(expect.any(String), 'body-reconnect', {
      memoryBodyId: 'mem0-body', sessionId: 'session-1', workspaceId: 'workspace-1',
    })
  })
})
