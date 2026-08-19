import type { MemoryLayerDescriptor } from '../../contracts/src/index.ts'
import type { MemoryCatalog, MemoryLayerRegistration } from '../../kernel/src/index.ts'

const descriptor: MemoryLayerDescriptor = {
  id: 'memory-spaces',
  label: 'Memory Spaces',
  description: 'Provider-backed durable evidence recalled across tasks and sessions.',
  role: 'durable-evidence',
  order: 300,
  capabilities: ['status', 'recall', 'search', 'read', 'browse', 'write', 'graph', 'related', 'link', 'forget', 'maintain', 'export', 'import'],
}

export const MEMORY_SPACES_LAYER: Readonly<MemoryLayerDescriptor> = Object.freeze(descriptor)

export function registerMemorySpacesLayer(catalog: MemoryCatalog, registration: Omit<MemoryLayerRegistration, 'descriptor'> = {}): () => void {
  return catalog.registerLayer({ descriptor: { ...MEMORY_SPACES_LAYER, capabilities: [...MEMORY_SPACES_LAYER.capabilities] }, ...registration })
}
