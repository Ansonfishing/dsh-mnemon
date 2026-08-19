import type { MemoryLayerDescriptor } from '../../contracts/src/index.ts'
import type { MemoryCatalog, MemoryLayerRegistration } from '../../kernel/src/index.ts'

const descriptor: MemoryLayerDescriptor = {
  id: 'runtime',
  label: 'Runtime Memory',
  description: 'Bounded, deterministic memory projected into every eligible turn.',
  role: 'working-context',
  order: 100,
  capabilities: ['status', 'project', 'read', 'write', 'maintain', 'export', 'import'],
}

export const RUNTIME_MEMORY_LAYER: Readonly<MemoryLayerDescriptor> = Object.freeze(descriptor)

export function registerRuntimeMemoryLayer(catalog: MemoryCatalog, registration: Omit<MemoryLayerRegistration, 'descriptor'> = {}): () => void {
  return catalog.registerLayer({ descriptor: { ...RUNTIME_MEMORY_LAYER, capabilities: [...RUNTIME_MEMORY_LAYER.capabilities] }, ...registration })
}
