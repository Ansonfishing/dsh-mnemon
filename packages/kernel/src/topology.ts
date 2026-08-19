import type { MemoryCatalog } from './catalog.ts'
import type {
  MemoryCatalogSnapshot,
  MemoryLayerParticipation,
  MemoryParticipationMode,
  MemoryTopologyDefinition,
  MemoryTopologyLayer,
  MemoryTopologySnapshot,
} from '../../contracts/src/index.ts'

const TOPOLOGY_ID = /^[a-z][a-z0-9-]{0,127}$/u
const PARTICIPATION_MODES = new Set<MemoryParticipationMode>(['off', 'manual', 'automatic'])
const DISCOVERED_LAYER_PARTICIPATION: MemoryLayerParticipation = {
  recall: 'manual',
  write: 'manual',
  projection: 'manual',
  maintenance: 'manual',
}

function cloneLayer(value: MemoryTopologyLayer): MemoryTopologyLayer {
  for (const [channel, mode] of Object.entries(value.participation)) {
    if (!PARTICIPATION_MODES.has(mode)) throw new Error(`unsupported ${channel} participation mode: ${String(mode)}`)
  }
  return {
    id: value.id,
    enabled: value.enabled,
    participation: { ...value.participation },
    adapterIds: [...new Set(value.adapterIds)],
  }
}

function cloneDefinition(value: MemoryTopologyDefinition): MemoryTopologyDefinition {
  const id = value.id.trim()
  const strategyId = value.strategyId.trim()
  if (!TOPOLOGY_ID.test(id)) throw new Error('memory topology id must match [a-z][a-z0-9-]{0,127}')
  if (!TOPOLOGY_ID.test(strategyId)) throw new Error('memory topology strategy id must match [a-z][a-z0-9-]{0,127}')
  const layers = value.layers.map(cloneLayer)
  if (new Set(layers.map(item => item.id)).size !== layers.length) throw new Error('memory topology contains duplicate layers')
  return { id, strategyId, layers }
}

export type MemoryTopologyListener = (next: MemoryTopologySnapshot, previous: MemoryTopologySnapshot | undefined) => void

/** Atomic, versioned topology state. Per-operation callers pin one returned snapshot. */
export class MemoryTopologyManager {
  private current?: MemoryTopologySnapshot
  private currentGeneration = 0
  private readonly listeners = new Set<MemoryTopologyListener>()
  private readonly unsubscribeCatalog: () => void

  constructor(
    private readonly catalog: MemoryCatalog,
    initial: MemoryTopologyDefinition,
    private readonly now: () => Date = () => new Date(),
  ) {
    this.replace(initial)
    this.unsubscribeCatalog = catalog.subscribe(snapshot => this.reconcileCatalog(snapshot))
  }

  snapshot(): MemoryTopologySnapshot {
    if (this.current === undefined) throw new Error('memory topology is unavailable')
    return {
      ...this.current,
      layers: this.current.layers.map(cloneLayer),
    }
  }

  replace(definition: MemoryTopologyDefinition): MemoryTopologySnapshot {
    const candidate = cloneDefinition(definition)
    this.validate(candidate)
    const previous = this.current
    this.currentGeneration += 1
    this.current = {
      ...candidate,
      generation: this.currentGeneration,
      catalogGeneration: this.catalog.generation,
      createdAt: this.now().toISOString(),
    }
    const snapshot = this.snapshot()
    for (const listener of this.listeners) listener(snapshot, previous)
    return snapshot
  }

  configureLayer(id: string, patch: { enabled?: boolean; participation?: Partial<MemoryLayerParticipation>; adapterIds?: string[] }): MemoryTopologySnapshot {
    const current = this.snapshot()
    const target = current.layers.find(item => item.id === id)
    if (target === undefined) throw new Error(`memory topology layer is not configured: ${id}`)
    return this.replace({
      id: current.id,
      strategyId: current.strategyId,
      layers: current.layers.map(item => item.id !== id ? item : {
        ...item,
        enabled: patch.enabled ?? item.enabled,
        participation: { ...item.participation, ...patch.participation },
        adapterIds: patch.adapterIds ?? item.adapterIds,
      }),
    })
  }

  subscribe(listener: MemoryTopologyListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /** Stop following Catalog changes while preserving this generation for pinned operations. */
  dispose(): void {
    this.unsubscribeCatalog()
    this.listeners.clear()
  }

  private reconcileCatalog(catalog: MemoryCatalogSnapshot): void {
    if (this.current === undefined) return
    const availableLayers = new Set(catalog.layers.map(layer => layer.id))
    const availableAdapters = new Set(catalog.adapters.map(adapter => adapter.id))
    const layers = this.current.layers
      .filter(layer => availableLayers.has(layer.id))
      .map(layer => ({
        ...layer,
        participation: { ...layer.participation },
        adapterIds: layer.adapterIds.filter(id => availableAdapters.has(id)),
      }))
    const configured = new Set(layers.map(layer => layer.id))
    for (const descriptor of catalog.layers) {
      if (configured.has(descriptor.id)) continue
      layers.push({
        id: descriptor.id,
        enabled: false,
        participation: { ...DISCOVERED_LAYER_PARTICIPATION },
        adapterIds: [],
      })
    }
    const previous = this.current
    this.currentGeneration += 1
    this.current = {
      id: previous.id,
      strategyId: previous.strategyId,
      layers,
      generation: this.currentGeneration,
      catalogGeneration: catalog.generation,
      createdAt: this.now().toISOString(),
    }
    const snapshot = this.snapshot()
    for (const listener of this.listeners) listener(snapshot, previous)
  }

  private validate(definition: MemoryTopologyDefinition): void {
    if (this.catalog.strategy(definition.strategyId) === undefined) {
      throw new Error(`memory topology references an unavailable strategy: ${definition.strategyId}`)
    }
    for (const item of definition.layers) {
      if (this.catalog.layer(item.id) === undefined) throw new Error(`memory topology references an unavailable layer: ${item.id}`)
      for (const adapterId of item.adapterIds) {
        if (this.catalog.adapter(adapterId) === undefined) throw new Error(`memory topology references an unavailable adapter: ${adapterId}`)
      }
    }
  }
}
