import { describe, expect, it } from 'vitest'
import {
  MEMORY_PROVIDER_CATALOG,
  MEMORY_PROVIDER_IDS,
  memoryProviderDescriptor,
  normalizeProviderConnection,
  publicProviderConnection,
} from '../src/providers/catalog.ts'

describe('memory provider catalog', () => {
  it('exposes Mnemon Native plus every supported third-party provider', () => {
    expect(MEMORY_PROVIDER_IDS).toEqual([
      'mnemon-native',
      'openviking',
      'honcho',
      'mem0',
      'hindsight',
      'holographic',
      'retaindb',
      'byterover',
      'supermemory',
    ])
    expect(MEMORY_PROVIDER_CATALOG).toHaveLength(9)
    expect(MEMORY_PROVIDER_CATALOG.filter(provider => provider.origin === 'third-party')).toHaveLength(8)
    expect(MEMORY_PROVIDER_CATALOG.filter(provider => provider.capabilities.entities).map(provider => provider.id)).toEqual([
      'mnemon-native',
      'hindsight',
      'holographic',
    ])
    expect(memoryProviderDescriptor('byterover').capabilities).toMatchObject({ search: true, browse: false, graph: false, entities: false })
  })

  it('normalizes provider defaults without exposing secrets to clients', () => {
    const connection = normalizeProviderConnection('supermemory', {
      endpoint: 'https://api.supermemory.ai/',
      apiKey: 'secret',
      containerTag: 'team',
      searchMode: 'hybrid',
    })
    expect(connection.endpoint).toBe('https://api.supermemory.ai')
    expect(publicProviderConnection('supermemory', connection)).toEqual({
      settings: {
        endpoint: 'https://api.supermemory.ai',
        containerTag: 'team',
        searchMode: 'hybrid',
      },
      configuredSecrets: ['apiKey'],
    })
  })

  it('preserves an existing secret when editing non-secret settings and clears it explicitly', () => {
    const previous = normalizeProviderConnection('mem0', {
      endpoint: 'https://api.mem0.ai',
      apiKey: 'secret',
      mode: 'platform',
      userId: 'alice',
      agentId: 'dsh',
    })
    const edited = normalizeProviderConnection('mem0', { userId: 'bob' }, previous)
    expect(edited.apiKey).toBe('secret')
    expect(edited.userId).toBe('bob')
    expect(normalizeProviderConnection('mem0', {}, edited, ['apiKey']).apiKey).toBe('')

    const supermemory = normalizeProviderConnection('supermemory', { apiKey: 'required-secret' })
    expect(normalizeProviderConnection('supermemory', {}, supermemory, ['apiKey']).apiKey).toBe('')
  })

  it('rejects unsupported provider settings and invalid select values', () => {
    expect(() => normalizeProviderConnection('retaindb', { unexpected: 'value' })).toThrow(/unsupported RetainDB setting/u)
    expect(() => normalizeProviderConnection('mem0', { mode: 'mystery' })).toThrow(/unsupported value/u)
    expect(() => normalizeProviderConnection('holographic', { defaultTrust: 2 })).toThrow(/within 0\.\.1/u)
    expect(() => normalizeProviderConnection('supermemory', { apiKey: 'secret', containerTag: 'invalid tag' })).toThrow(/container tag/u)
    expect(memoryProviderDescriptor('holographic').kind).toBe('local')
  })
})
