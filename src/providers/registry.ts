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
import { MemoryAdapterFactoryRegistry, type MemoryAdapterFactory } from '../../packages/provider-sdk/src/index.ts'

export interface MemoryProviderAdapterFactoryContext {
  memoryBodies: MemoryBodyRegistry
  config: Pick<ResolvedConfig, 'timeoutMs'>
  nativeAdapter: MemoryProviderAdapter
}

export interface MemoryProviderAdapterFactory extends MemoryAdapterFactory<MemoryProviderAdapter['id'], MemoryProviderAdapterFactoryContext, MemoryProviderAdapter> {}

/**
 * Runtime adapter factory seam. The control plane owns registration and
 * provider implementations own construction; MnemonService depends only on
 * the resulting adapter contract.
 */
export class MemoryProviderAdapterRegistry extends MemoryAdapterFactoryRegistry<MemoryProviderAdapter['id'], MemoryProviderAdapterFactoryContext, MemoryProviderAdapter> {}

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
