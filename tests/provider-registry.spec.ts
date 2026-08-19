import { describe, expect, it, vi } from 'vitest'
import { resolveConfig } from '../src/config.ts'
import { MemoryProviderAdapterRegistry, createBuiltinMemoryProviderAdapterRegistry } from '../src/providers/registry.ts'
import type { MemoryProviderAdapter } from '../src/providers/provider.ts'

function adapter(id: MemoryProviderAdapter['id']): MemoryProviderAdapter {
  return {
    id,
    status: vi.fn(async () => ({ healthy: true })),
    search: vi.fn(async () => ({ results: [] })),
    graph: vi.fn(async () => ({ nodes: [], edges: [], generatedAt: '2026-08-19T00:00:00.000Z' })),
    list: vi.fn(async () => []),
    remember: vi.fn(async () => null),
  }
}

describe('MemoryProviderAdapterRegistry', () => {
  it('owns factory registration lifecycle and rejects duplicates', () => {
    const registry = new MemoryProviderAdapterRegistry()
    const factory = { id: 'mnemon-native' as const, create: () => adapter('mnemon-native') }
    const dispose = registry.register(factory)
    expect(registry.ids()).toEqual(['mnemon-native'])
    expect(() => registry.register(factory)).toThrow('already registered')
    dispose()
    dispose()
    expect(registry.ids()).toEqual([])
  })

  it('contains every built-in provider behind factories', () => {
    expect(createBuiltinMemoryProviderAdapterRegistry().ids()).toEqual([
      'mnemon-native', 'openviking', 'honcho', 'mem0', 'hindsight', 'holographic', 'retaindb', 'byterover', 'supermemory',
    ])
  })

  it('rejects a factory that returns an adapter under another identity', () => {
    const registry = new MemoryProviderAdapterRegistry([{
      id: 'mnemon-native',
      create: () => adapter('openviking'),
    }])
    expect(() => registry.create({
      memoryBodies: {} as never,
      config: resolveConfig({}),
      nativeAdapter: adapter('mnemon-native'),
    })).toThrow('returned openviking')
  })
})
