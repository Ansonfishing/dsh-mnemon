import type { ResolvedConfig } from '../config.ts'
import type { MemoryBodyRegistry } from '../memory-bodies.ts'
import { ByteRoverProvider } from './byterover.ts'
import { HindsightProvider } from './hindsight.ts'
import { HolographicProvider } from './holographic.ts'
import { HonchoProvider } from './honcho.ts'
import { Mem0Provider } from './mem0.ts'
import { OpenVikingProvider } from './openviking.ts'
import type { MemoryProviderAdapter } from './provider.ts'
import { RetainDbProvider } from './retaindb.ts'
import { SupermemoryProvider } from './supermemory.ts'

export interface MemoryProviderAdapterFactoryContext {
  memoryBodies: MemoryBodyRegistry
  config: Pick<ResolvedConfig, 'timeoutMs'>
  nativeAdapter: MemoryProviderAdapter
}

export interface MemoryProviderAdapterFactory {
  readonly id: MemoryProviderAdapter['id']
  create(context: MemoryProviderAdapterFactoryContext): MemoryProviderAdapter
}

/**
 * Runtime adapter factory seam. The control plane owns registration and
 * provider implementations own construction; MnemonService depends only on
 * the resulting adapter contract.
 */
export class MemoryProviderAdapterRegistry {
  private readonly factories = new Map<MemoryProviderAdapter['id'], MemoryProviderAdapterFactory>()

  constructor(factories: readonly MemoryProviderAdapterFactory[] = []) {
    for (const factory of factories) this.register(factory)
  }

  register(factory: MemoryProviderAdapterFactory): () => void {
    if (this.factories.has(factory.id)) throw new Error(`memory provider adapter factory is already registered: ${factory.id}`)
    this.factories.set(factory.id, factory)
    let active = true
    return () => {
      if (!active) return
      active = false
      if (this.factories.get(factory.id) === factory) this.factories.delete(factory.id)
    }
  }

  create(context: MemoryProviderAdapterFactoryContext): Map<MemoryProviderAdapter['id'], MemoryProviderAdapter> {
    const adapters = new Map<MemoryProviderAdapter['id'], MemoryProviderAdapter>()
    for (const factory of this.factories.values()) {
      const adapter = factory.create(context)
      if (adapter.id !== factory.id) throw new Error(`memory provider adapter factory ${factory.id} returned ${adapter.id}`)
      if (adapters.has(adapter.id)) throw new Error(`memory provider adapter is already created: ${adapter.id}`)
      adapters.set(adapter.id, adapter)
    }
    return adapters
  }

  ids(): MemoryProviderAdapter['id'][] {
    return [...this.factories.keys()]
  }
}

export const BUILTIN_MEMORY_PROVIDER_ADAPTER_FACTORIES: readonly MemoryProviderAdapterFactory[] = [
  { id: 'mnemon-native', create: context => context.nativeAdapter },
  {
    id: 'openviking',
    create: context => new OpenVikingProvider(context.memoryBodies, {
      requestTimeoutMs: context.config.timeoutMs,
      settlementTimeoutMs: context.config.timeoutMs,
    }),
  },
  { id: 'honcho', create: context => new HonchoProvider(context.memoryBodies, { requestTimeoutMs: context.config.timeoutMs }) },
  { id: 'mem0', create: context => new Mem0Provider(context.memoryBodies, { requestTimeoutMs: context.config.timeoutMs }) },
  { id: 'hindsight', create: context => new HindsightProvider(context.memoryBodies, { requestTimeoutMs: context.config.timeoutMs }) },
  { id: 'holographic', create: context => new HolographicProvider(context.memoryBodies) },
  { id: 'retaindb', create: context => new RetainDbProvider(context.memoryBodies, { requestTimeoutMs: context.config.timeoutMs }) },
  { id: 'byterover', create: context => new ByteRoverProvider(context.memoryBodies, { queryTimeoutMs: context.config.timeoutMs }) },
  { id: 'supermemory', create: context => new SupermemoryProvider(context.memoryBodies, { requestTimeoutMs: context.config.timeoutMs }) },
]

export function createBuiltinMemoryProviderAdapterRegistry(): MemoryProviderAdapterRegistry {
  return new MemoryProviderAdapterRegistry(BUILTIN_MEMORY_PROVIDER_ADAPTER_FACTORIES)
}

/** Global extension registry sampled when a runtime generation is constructed. */
export const memoryProviderAdapterFactories = createBuiltinMemoryProviderAdapterRegistry()

export function registerMemoryProviderAdapterFactory(factory: MemoryProviderAdapterFactory): () => void {
  return memoryProviderAdapterFactories.register(factory)
}
