import type { MemoryCatalog, MemoryLayerRegistration, MemoryStrategyRegistration } from './catalog.ts'
import type {
  MemoryCapability,
  MemoryLayerDescriptor,
  MemoryParticipationChannel,
  MemoryPlanRequest,
  MemoryPlanStepProposal,
  MemoryTopologyLayer,
} from './contracts.ts'

const runtimeMemoryLayer: MemoryLayerDescriptor = {
  id: 'runtime',
  label: 'Runtime Memory',
  description: 'Bounded, deterministic memory projected into every eligible turn.',
  role: 'working-context',
  order: 100,
  capabilities: ['status', 'project', 'read', 'write', 'maintain', 'export', 'import'],
}
export const RUNTIME_MEMORY_LAYER: Readonly<MemoryLayerDescriptor> = Object.freeze(runtimeMemoryLayer)

const documentsMemoryLayer: MemoryLayerDescriptor = {
  id: 'documents',
  label: 'Documents',
  description: 'Versioned narrative documents searched first and read in full on demand.',
  role: 'narrative',
  order: 200,
  capabilities: ['status', 'recall', 'search', 'read', 'browse', 'write', 'archive', 'maintain', 'export', 'import'],
}
export const DOCUMENTS_MEMORY_LAYER: Readonly<MemoryLayerDescriptor> = Object.freeze(documentsMemoryLayer)

const memorySpacesLayer: MemoryLayerDescriptor = {
  id: 'memory-spaces',
  label: 'Memory Spaces',
  description: 'Provider-backed durable evidence recalled across tasks and sessions.',
  role: 'durable-evidence',
  order: 300,
  capabilities: ['status', 'recall', 'search', 'read', 'browse', 'write', 'graph', 'related', 'link', 'forget', 'maintain', 'export', 'import'],
}
export const MEMORY_SPACES_LAYER: Readonly<MemoryLayerDescriptor> = Object.freeze(memorySpacesLayer)

export const BUILTIN_MEMORY_LAYERS = [RUNTIME_MEMORY_LAYER, DOCUMENTS_MEMORY_LAYER, MEMORY_SPACES_LAYER] as const

export function participationChannel(capability: MemoryCapability): MemoryParticipationChannel {
  if (capability === 'project') return 'projection'
  if (['write', 'archive', 'link', 'forget', 'import'].includes(capability)) return 'write'
  if (['maintain', 'export', 'status'].includes(capability)) return 'maintenance'
  return 'recall'
}

function accepts(layer: MemoryTopologyLayer, request: MemoryPlanRequest): boolean {
  if (!layer.enabled) return false
  const mode = layer.participation[participationChannel(request.capability)]
  if (mode === 'off') return false
  if (request.trigger !== 'manual' && mode !== 'automatic') return false
  return true
}

export const DEFAULT_THREE_TIER_STRATEGY: MemoryStrategyRegistration = {
  descriptor: {
    id: 'default-three-tier',
    version: '1',
    label: 'Default three-tier strategy',
    description: 'Routes explicit operations to compatible enabled layers in stable topology order.',
    hooks: ['placement', 'retrieval-planning', 'projection', 'maintenance'],
    deterministic: true,
  },
  propose(request, context) {
    const candidates = request.candidateLayerIds === undefined ? undefined : new Set(request.candidateLayerIds)
    const adapters = request.adapterIds === undefined ? undefined : new Set(request.adapterIds)
    const descriptors = new Map(context.catalog.layers.map(layer => [layer.id, layer]))
    const steps: MemoryPlanStepProposal[] = []
    for (const layer of context.topology.layers) {
      const descriptor = descriptors.get(layer.id)
      if (descriptor === undefined || !descriptor.capabilities.includes(request.capability)) continue
      if (candidates !== undefined && !candidates.has(layer.id)) continue
      if (!accepts(layer, request)) continue
      const selectedAdapters = adapters === undefined ? layer.adapterIds : layer.adapterIds.filter(id => adapters.has(id))
      if (selectedAdapters.length === 0) {
        steps.push({ layerId: layer.id, capability: request.capability, ...(request.input === undefined ? {} : { input: request.input }) })
      } else {
        steps.push(...selectedAdapters.map(adapterId => ({
          layerId: layer.id,
          adapterId,
          capability: request.capability,
          ...(request.input === undefined ? {} : { input: request.input }),
        })))
      }
    }
    return {
      strategyId: this.descriptor.id,
      strategyVersion: this.descriptor.version,
      reason: steps.length === 0
        ? `No enabled layer accepts ${request.capability} for a ${request.trigger} operation.`
        : `Selected ${steps.length} compatible step${steps.length === 1 ? '' : 's'} from the active three-tier topology.`,
      steps,
    }
  },
}

export function registerDefaultMemorySystem(catalog: MemoryCatalog, layers: Partial<Record<string, Omit<MemoryLayerRegistration, 'descriptor'>>> = {}): () => void {
  const disposers = [
    ...BUILTIN_MEMORY_LAYERS.map(descriptor => catalog.registerLayer({ descriptor: { ...descriptor, capabilities: [...descriptor.capabilities] }, ...layers[descriptor.id] })),
    catalog.registerStrategy(DEFAULT_THREE_TIER_STRATEGY),
  ]
  return () => {
    for (const dispose of disposers.reverse()) dispose()
  }
}
