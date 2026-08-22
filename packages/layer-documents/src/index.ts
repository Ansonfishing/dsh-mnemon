import type { MemoryLayerDescriptor } from '../../contracts/src/index.ts'
import type { MemoryCatalog, MemoryLayerRegistration } from '../../kernel/src/index.ts'

const descriptor: MemoryLayerDescriptor = {
  id: 'documents',
  label: 'Documents',
  description: 'Versioned narrative documents searched first and read in full on demand.',
  role: 'narrative',
  order: 200,
  capabilities: ['status', 'project', 'recall', 'search', 'read', 'browse', 'write', 'archive', 'maintain', 'export', 'import'],
}

export const DOCUMENTS_MEMORY_LAYER: Readonly<MemoryLayerDescriptor> = Object.freeze(descriptor)

export function registerDocumentsMemoryLayer(catalog: MemoryCatalog, registration: Omit<MemoryLayerRegistration, 'descriptor'> = {}): () => void {
  return catalog.registerLayer({ descriptor: { ...DOCUMENTS_MEMORY_LAYER, capabilities: [...DOCUMENTS_MEMORY_LAYER.capabilities] }, ...registration })
}
