import type {
  MemoryAdapterDescriptor,
  MemoryCatalogSnapshot,
  MemoryJsonValue,
  MemoryLayerDescriptor,
  MemoryPlanRequest,
  MemoryPlanProposal,
  MemoryPlanStep,
  MemoryStrategyDescriptor,
  MemoryTopologySnapshot,
} from '../../contracts/src/index.ts'

const COMPONENT_ID = /^[a-z][a-z0-9-]{0,127}$/u

export interface MemoryLayerExecutionContext {
  planId: string
  topology: MemoryTopologySnapshot
  request: MemoryPlanRequest
  signal?: AbortSignal
}

export interface MemoryLayerRegistration {
  descriptor: MemoryLayerDescriptor
  execute?(step: MemoryPlanStep, context: MemoryLayerExecutionContext): Promise<MemoryJsonValue>
}

export interface MemoryAdapterRegistration {
  descriptor: MemoryAdapterDescriptor
}

export interface MemoryStrategyContext {
  catalog: MemoryCatalogSnapshot
  topology: MemoryTopologySnapshot
}

export interface MemoryStrategyRegistration {
  descriptor: MemoryStrategyDescriptor
  propose(request: MemoryPlanRequest, context: MemoryStrategyContext): MemoryPlanProposal | Promise<MemoryPlanProposal>
}

export type MemoryCatalogListener = (snapshot: MemoryCatalogSnapshot) => void

function componentId(value: string, label: string): string {
  const normalized = value.trim()
  if (!COMPONENT_ID.test(normalized)) throw new Error(`${label} must match [a-z][a-z0-9-]{0,127}`)
  return normalized
}

function nonEmpty(value: string, label: string, max = 500): string {
  const normalized = value.trim()
  if (normalized === '') throw new Error(`${label} is required`)
  if (normalized.length > max) throw new Error(`${label} is too long (max ${max} characters)`)
  return normalized
}

function cloneLayer(descriptor: MemoryLayerDescriptor): MemoryLayerDescriptor {
  if (!Number.isFinite(descriptor.order)) throw new Error('memory layer order must be finite')
  const capabilities = [...new Set(descriptor.capabilities)]
  if (capabilities.length === 0) throw new Error('memory layer must declare at least one capability')
  return Object.freeze({
    id: componentId(descriptor.id, 'memory layer id'),
    label: nonEmpty(descriptor.label, 'memory layer label', 100),
    description: nonEmpty(descriptor.description, 'memory layer description'),
    role: componentId(descriptor.role, 'memory layer role'),
    order: descriptor.order,
    capabilities: Object.freeze(capabilities) as unknown as MemoryLayerDescriptor['capabilities'],
  })
}

function cloneAdapter(descriptor: MemoryAdapterDescriptor): MemoryAdapterDescriptor {
  return Object.freeze({
    id: componentId(descriptor.id, 'memory adapter id'),
    label: nonEmpty(descriptor.label, 'memory adapter label', 100),
    description: nonEmpty(descriptor.description, 'memory adapter description'),
    locality: descriptor.locality,
    scopes: Object.freeze([...new Set(descriptor.scopes)]) as unknown as MemoryAdapterDescriptor['scopes'],
    capabilities: Object.freeze([...new Set(descriptor.capabilities)]) as unknown as MemoryAdapterDescriptor['capabilities'],
    ...(descriptor.configNamespace === undefined ? {} : { configNamespace: componentId(descriptor.configNamespace, 'memory adapter config namespace') }),
  })
}

function cloneStrategy(descriptor: MemoryStrategyDescriptor): MemoryStrategyDescriptor {
  return Object.freeze({
    id: componentId(descriptor.id, 'memory strategy id'),
    version: nonEmpty(descriptor.version, 'memory strategy version', 100),
    label: nonEmpty(descriptor.label, 'memory strategy label', 100),
    description: nonEmpty(descriptor.description, 'memory strategy description'),
    hooks: Object.freeze([...new Set(descriptor.hooks)]) as unknown as MemoryStrategyDescriptor['hooks'],
    deterministic: descriptor.deterministic,
  })
}

/** Host-global contribution directory. Registrations are owned by their caller's lifecycle. */
export class MemoryCatalog {
  private readonly layers = new Map<string, MemoryLayerRegistration>()
  private readonly adapters = new Map<string, MemoryAdapterRegistration>()
  private readonly strategies = new Map<string, MemoryStrategyRegistration>()
  private readonly listeners = new Set<MemoryCatalogListener>()
  private currentGeneration = 0

  get generation(): number {
    return this.currentGeneration
  }

  registerLayer(registration: MemoryLayerRegistration): () => void {
    const descriptor = cloneLayer(registration.descriptor)
    return this.register(this.layers, descriptor.id, { ...registration, descriptor })
  }

  registerAdapter(registration: MemoryAdapterRegistration): () => void {
    const descriptor = cloneAdapter(registration.descriptor)
    return this.register(this.adapters, descriptor.id, { ...registration, descriptor })
  }

  registerStrategy(registration: MemoryStrategyRegistration): () => void {
    const descriptor = cloneStrategy(registration.descriptor)
    return this.register(this.strategies, descriptor.id, { ...registration, descriptor })
  }

  layer(id: string): MemoryLayerRegistration | undefined {
    return this.layers.get(id)
  }

  adapter(id: string): MemoryAdapterRegistration | undefined {
    return this.adapters.get(id)
  }

  strategy(id: string): MemoryStrategyRegistration | undefined {
    return this.strategies.get(id)
  }

  snapshot(): MemoryCatalogSnapshot {
    return {
      generation: this.currentGeneration,
      layers: [...this.layers.values()].map(item => ({ ...item.descriptor, capabilities: [...item.descriptor.capabilities] }))
        .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id)),
      adapters: [...this.adapters.values()].map(item => ({
        ...item.descriptor,
        scopes: [...item.descriptor.scopes],
        capabilities: [...item.descriptor.capabilities],
      })).sort((left, right) => left.id.localeCompare(right.id)),
      strategies: [...this.strategies.values()].map(item => ({ ...item.descriptor, hooks: [...item.descriptor.hooks] }))
        .sort((left, right) => left.id.localeCompare(right.id)),
    }
  }

  subscribe(listener: MemoryCatalogListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private register<T>(registry: Map<string, T>, id: string, value: T): () => void {
    if (registry.has(id)) throw new Error(`memory catalog component is already registered: ${id}`)
    registry.set(id, value)
    this.changed()
    let active = true
    return () => {
      if (!active) return
      active = false
      if (registry.get(id) !== value) return
      registry.delete(id)
      this.changed()
    }
  }

  private changed(): void {
    this.currentGeneration += 1
    const snapshot = this.snapshot()
    for (const listener of this.listeners) listener(snapshot)
  }
}
