import { createHash } from 'node:crypto'
import type {
  MemoryJsonValue,
  MemoryOperationScope,
  MemoryReceipt,
  MemoryRecallSlice,
  MemoryRecallSliceNode,
  MemoryView,
  MemoryViewNode,
  MemoryViewNodeKind,
  MemoryViewProjectionMode,
  MemoryViewSource,
  MemoryWake,
  MemoryWakeSection,
  MemoryZoomResult,
  MemoryTurnContext,
} from '../../contracts/src/index.ts'
import type { MemoryKernel } from './kernel.ts'

const MUTATION_CAPABILITIES = new Set([
  'write',
  'archive',
  'link',
  'forget',
  'maintain',
  'import',
])
const PROJECTION_MODES = new Set<MemoryViewProjectionMode>(['exact', 'outline', 'query-only'])
const NODE_KINDS = new Set<MemoryViewNodeKind>(['root', 'content', 'outline', 'query'])

export interface MemoryViewProjectionNode {
  /** Projector-local stable key. It is hashed before entering the public View. */
  key: string
  parentKey?: string
  kind: MemoryViewNodeKind
  label: string
  summary?: string
  content?: string
  reference?: string
  metadata?: { [key: string]: MemoryJsonValue }
}

export interface MemoryViewProjection {
  revision: string
  nodes: MemoryViewProjectionNode[]
}

export interface MemoryViewProjectorContext {
  catalogGeneration: number
  topologyGeneration: number
  guardGeneration: number
  scope?: MemoryOperationScope
}

/** Trusted, query-independent projection source. It never receives a Strategy. */
export interface MemoryViewProjector {
  layerId: string
  mode: MemoryViewProjectionMode
  project(context: MemoryViewProjectorContext): MemoryViewProjection | Promise<MemoryViewProjection>
}

export interface MemoryViewManagerOptions {
  now?: () => Date
  maxViews?: number
  maxNodes?: number
  maxWakeCharacters?: number
}

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function canonical(value: unknown): string {
  if (value === null || typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
  if (typeof value !== 'object' || value === null) throw new Error('memory view contains a non-JSON value')
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, item]) => item !== undefined)
    .sort(([left], [right]) => left.localeCompare(right))
  return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(',')}}`
}

function deepFreeze<T>(value: T): T {
  if (typeof value !== 'object' || value === null || Object.isFrozen(value)) return value
  for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child)
  return Object.freeze(value)
}

function text(value: string, label: string, maximum: number): string {
  const normalized = value.trim()
  if (normalized === '') throw new Error(`${label} is required`)
  if (normalized.length > maximum) throw new Error(`${label} is too long (max ${maximum} characters)`)
  return normalized
}

function optionalText(value: string | undefined, label: string, maximum: number): string | undefined {
  if (value === undefined) return undefined
  const normalized = value.trim()
  if (normalized === '') return undefined
  if (normalized.length > maximum) throw new Error(`${label} is too long (max ${maximum} characters)`)
  return normalized
}

function optionalContent(value: string | undefined, label: string, maximum: number): string | undefined {
  if (value === undefined) return undefined
  if (value.trim() === '') return undefined
  if (value.length > maximum) throw new Error(`${label} is too long (max ${maximum} characters)`)
  return value
}

function jsonValue(value: unknown, label: string, depth = 0): asserts value is MemoryJsonValue {
  if (depth > 32) throw new Error(`${label} is nested too deeply`)
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error(`${label} contains a non-finite number`)
    return
  }
  if (Array.isArray(value)) {
    for (const item of value) jsonValue(item, label, depth + 1)
    return
  }
  if (typeof value !== 'object') throw new Error(`${label} contains a non-JSON value`)
  for (const [key, item] of Object.entries(value)) {
    if (key.length > 200) throw new Error(`${label} contains an oversized key`)
    jsonValue(item, label, depth + 1)
  }
}

function cloneMetadata(value: MemoryViewProjectionNode['metadata']): MemoryViewNode['metadata'] {
  if (value === undefined) return undefined
  jsonValue(value, 'memory view node metadata')
  return structuredClone(value)
}

function scopeCopy(scope: MemoryOperationScope): MemoryOperationScope {
  return { ...scope }
}

function sameScope(left: MemoryOperationScope, right: MemoryOperationScope): boolean {
  return canonical(left) === canonical(right)
}

/**
 * Owns immutable Memory Views and turn pins. Projectors read Authorities, while
 * this manager alone validates and atomically publishes their derived result.
 */
export class MemoryViewManager {
  private readonly projectors = new Map<string, MemoryViewProjector>()
  private projectorGeneration = 0
  private readonly views = new Map<string, MemoryView>()
  private readonly turns = new Map<string, MemoryTurnContext>()
  private readonly pendingReceipts = new Map<string, MemoryReceipt>()
  private current: MemoryView | undefined
  private readonly publishing = new Map<string, Promise<MemoryView>>()
  private failure: string | undefined
  private readonly now: () => Date
  private readonly maxViews: number
  private readonly maxNodes: number
  private readonly maxWakeCharacters: number

  constructor(
    readonly kernel: Pick<MemoryKernel, 'descriptor' | 'guardGeneration'>,
    projectors: Iterable<MemoryViewProjector> = [],
    options: MemoryViewManagerOptions = {},
  ) {
    this.now = options.now ?? (() => new Date())
    this.maxViews = options.maxViews ?? 32
    this.maxNodes = options.maxNodes ?? 5_000
    this.maxWakeCharacters = options.maxWakeCharacters ?? 64 * 1024
    if (!Number.isInteger(this.maxViews) || this.maxViews < 2 || this.maxViews > 10_000) throw new Error('maxViews must be an integer within 2..10000')
    if (!Number.isInteger(this.maxNodes) || this.maxNodes < 1 || this.maxNodes > 100_000) throw new Error('maxNodes must be an integer within 1..100000')
    if (!Number.isInteger(this.maxWakeCharacters) || this.maxWakeCharacters < 1 || this.maxWakeCharacters > 10_000_000) throw new Error('maxWakeCharacters must be an integer within 1..10000000')
    for (const projector of projectors) this.registerProjector(projector)
  }

  registerProjector(projector: MemoryViewProjector): () => void {
    const layerId = text(projector.layerId, 'memory view projector layerId', 128)
    if (!PROJECTION_MODES.has(projector.mode)) throw new Error(`unsupported memory view projection mode: ${String(projector.mode)}`)
    if (this.projectors.has(layerId)) throw new Error(`memory view projector is already registered: ${layerId}`)
    const registration = { ...projector, layerId }
    this.projectors.set(layerId, registration)
    this.projectorGeneration += 1
    let active = true
    return () => {
      if (!active) return
      active = false
      if (this.projectors.get(layerId) !== registration) return
      this.projectors.delete(layerId)
      this.projectorGeneration += 1
    }
  }

  latest(): MemoryView | undefined {
    return this.current
  }

  get(viewId: string): MemoryView | undefined {
    return this.views.get(viewId)
  }

  lastFailure(): string | undefined {
    return this.failure
  }

  pendingReceiptCount(): number {
    return this.pendingReceipts.size
  }

  apply(receipt: MemoryReceipt): boolean {
    if (!MUTATION_CAPABILITIES.has(receipt.capability)) return false
    if (!receipt.steps.some(step => step.status === 'succeeded')) return false
    if (this.pendingReceipts.has(receipt.id)) return false
    this.pendingReceipts.set(receipt.id, deepFreeze(structuredClone(receipt)))
    return true
  }

  async beginTurn(turnId: string, scope: MemoryOperationScope): Promise<MemoryTurnContext> {
    const id = text(turnId, 'memory turn id', 300)
    const existing = this.turns.get(id)
    if (existing !== undefined) {
      if (!sameScope(existing.scope, scope)) throw new Error(`memory turn scope changed while pinned: ${id}`)
      return existing
    }
    const view = await this.reconcile(scope)
    const context = deepFreeze({
      turnId: id,
      viewId: view.id,
      viewDigest: view.digest,
      scope: scopeCopy(scope),
      startedAt: this.now().toISOString(),
    } satisfies MemoryTurnContext)
    this.turns.set(id, context)
    return context
  }

  turn(turnId: string): MemoryTurnContext | undefined {
    return this.turns.get(turnId)
  }

  activeTurn(agentId: string): MemoryTurnContext | undefined {
    const id = text(agentId, 'memory agent id', 300)
    return [...this.turns.values()].findLast(turn => turn.scope.agentId === id)
  }

  endTurn(turnId: string): boolean {
    const deleted = this.turns.delete(turnId)
    if (deleted) this.collect()
    return deleted
  }

  wake(viewId: string): MemoryWake {
    const view = this.requireView(viewId)
    return this.renderWake(view)
  }

  zoom(viewId: string, nodeId: string): MemoryZoomResult {
    const view = this.requireView(viewId)
    const nodes = new Map(view.nodes.map(node => [node.id, node]))
    const node = nodes.get(nodeId)
    if (node === undefined) throw new Error(`memory view node is unavailable in ${viewId}: ${nodeId}`)
    return deepFreeze({
      viewId: view.id,
      viewDigest: view.digest,
      node,
      children: node.childIds.map(id => nodes.get(id)!),
    })
  }

  /** Build the smallest provider-safe slice that can authorize one Recall worker. */
  recallSlice(viewId: string, nodeId?: string, requestedMemoryBodyIds: readonly string[] = []): MemoryRecallSlice {
    const view = this.requireView(viewId)
    const nodes = new Map(view.nodes.map(node => [node.id, node]))
    const requested = [...new Set(requestedMemoryBodyIds.map(id => id.trim()).filter(Boolean))]
    const bodyId = (node: MemoryViewNode): string | undefined => {
      const value = node.metadata?.memoryBodyId
      return typeof value === 'string' && value.trim() !== '' ? value : undefined
    }
    const providerId = (node: MemoryViewNode): string | undefined => {
      const value = node.metadata?.providerId
      return typeof value === 'string' && value.trim() !== '' ? value : undefined
    }
    const memoryNodes = view.nodes.filter(node => node.layerId === 'memory-spaces')
    let selected: MemoryViewNode[]
    if (nodeId !== undefined && nodeId.trim() !== '') {
      const node = nodes.get(nodeId.trim())
      if (node === undefined) throw new Error(`memory view node is unavailable in ${view.id}: ${nodeId.trim()}`)
      if (node.layerId !== 'memory-spaces') throw new Error('Recall View scope must select a Memory Spaces node')
      const children = node.childIds.map(id => nodes.get(id)!).filter(Boolean)
      selected = requested.length === 0
        ? [node, ...children]
        : [node, ...children.filter(child => {
            const id = bodyId(child)
            return id !== undefined && requested.includes(id)
          })]
    } else if (requested.length > 0) {
      const byBodyId = new Map(memoryNodes.flatMap(node => {
        const id = bodyId(node)
        return id === undefined ? [] : [[id, node] as const]
      }))
      const missing = requested.filter(id => !byBodyId.has(id))
      if (missing.length > 0) throw new Error(`Memory Space is outside the parent View: ${missing.join(', ')}`)
      selected = requested.map(id => byBodyId.get(id)!)
    } else {
      const roots = view.sources.find(source => source.layerId === 'memory-spaces')?.nodeIds.map(id => nodes.get(id)!).filter(Boolean) ?? []
      selected = roots.flatMap(node => [node, ...node.childIds.map(id => nodes.get(id)!).filter(Boolean)])
    }
    const selectedBodyIds = [...new Set(selected.flatMap(node => {
      const id = bodyId(node)
      return id === undefined ? [] : [id]
    }))]
    if (requested.length > 0 && requested.some(id => !selectedBodyIds.includes(id))) throw new Error('requested Memory Space is outside the selected View node')
    const sliceNodes: MemoryRecallSliceNode[] = selected.map(node => ({
      id: node.id,
      layerId: node.layerId,
      kind: node.kind,
      label: node.label,
      ...(node.summary === undefined ? {} : { summary: node.summary }),
      ...(node.reference === undefined ? {} : { reference: node.reference }),
      ...(bodyId(node) === undefined ? {} : { memoryBodyId: bodyId(node)! }),
      ...(providerId(node) === undefined ? {} : { providerId: providerId(node)! }),
    }))
    return deepFreeze({
      parentViewId: view.id,
      viewDigest: view.digest,
      nodeIds: sliceNodes.map(node => node.id),
      nodes: sliceNodes,
      memoryBodyIds: requested.length === 0 ? selectedBodyIds : requested,
    })
  }

  /** Compile and publish a candidate. On failure, preserve and return the last valid View. */
  async reconcile(scope?: MemoryOperationScope): Promise<MemoryView> {
    try {
      return await this.publish(scope)
    } catch (error) {
      this.failure = error instanceof Error ? error.message : String(error)
      if (this.current !== undefined) return this.current
      throw error
    }
  }

  /** Strict publication API used by tests, diagnostics, and initial startup. */
  async publish(scope?: MemoryOperationScope): Promise<MemoryView> {
    const publicationKey = scope === undefined ? '' : canonical(scope)
    const inFlight = this.publishing.get(publicationKey)
    if (inFlight !== undefined) return inFlight
    const receiptIds = [...this.pendingReceipts.keys()]
    const publication = this.buildCandidate(scope).then(candidate => {
      const current = this.current
      if (current !== undefined && current.digest === candidate.digest) {
        for (const id of receiptIds) this.pendingReceipts.delete(id)
        this.failure = undefined
        return current
      }
      this.views.set(candidate.id, candidate)
      this.current = candidate
      for (const id of receiptIds) this.pendingReceipts.delete(id)
      this.failure = undefined
      this.collect()
      return candidate
    })
    this.publishing.set(publicationKey, publication)
    try {
      return await publication
    } finally {
      if (this.publishing.get(publicationKey) === publication) this.publishing.delete(publicationKey)
    }
  }

  private async buildCandidate(scope?: MemoryOperationScope): Promise<MemoryView> {
    const descriptor = this.kernel.descriptor()
    const guardGeneration = this.kernel.guardGeneration
    const projectorGeneration = this.projectorGeneration
    const catalogLayers = new Map(descriptor.catalog.layers.map(layer => [layer.id, layer]))
    const layers = descriptor.topology.layers.filter(layer => {
      if (!layer.enabled || layer.participation.projection !== 'automatic') return false
      return catalogLayers.get(layer.id)?.capabilities.includes('project') === true
    })
    const projected = await Promise.all(layers.map(async layer => {
      const projector = this.projectors.get(layer.id)
      if (projector === undefined) throw new Error(`enabled memory layer has no View projector: ${layer.id}`)
      const projection = await projector.project({
        catalogGeneration: descriptor.catalog.generation,
        topologyGeneration: descriptor.topology.generation,
        guardGeneration,
        ...(scope === undefined ? {} : { scope: scopeCopy(scope) }),
      })
      return this.normalizeProjection(layer.id, projector.mode, projection)
    }))
    const current = this.kernel.descriptor()
    if (current.catalog.generation !== descriptor.catalog.generation
      || current.topology.generation !== descriptor.topology.generation
      || this.kernel.guardGeneration !== guardGeneration
      || this.projectorGeneration !== projectorGeneration) {
      throw new Error('memory View inputs changed during compilation')
    }

    const sources: MemoryViewSource[] = []
    const nodes: MemoryViewNode[] = []
    for (const projection of projected) {
      sources.push(projection.source)
      nodes.push(...projection.nodes)
    }
    if (nodes.length > this.maxNodes) throw new Error(`memory View contains ${nodes.length} nodes; limit is ${this.maxNodes}`)
    const payload = {
      topologyId: descriptor.topology.id,
      catalogGeneration: descriptor.catalog.generation,
      topologyGeneration: descriptor.topology.generation,
      guardGeneration,
      sources,
      nodes,
    }
    const digest = hash(canonical(payload))
    const view = deepFreeze({
      id: `view-${digest.slice(0, 24)}`,
      createdAt: this.now().toISOString(),
      ...payload,
      digest,
    } satisfies MemoryView)
    this.renderWake(view)
    return view
  }

  private normalizeProjection(layerId: string, mode: MemoryViewProjectionMode, projection: MemoryViewProjection): { source: MemoryViewSource; nodes: MemoryViewNode[] } {
    const revision = text(projection.revision, `memory View revision for ${layerId}`, 500)
    if (!Array.isArray(projection.nodes)) throw new Error(`memory View projector returned invalid nodes: ${layerId}`)
    const keys = new Set<string>()
    const ids = new Map<string, string>()
    for (const candidate of projection.nodes) {
      const key = text(candidate.key, `memory View node key for ${layerId}`, 500)
      if (keys.has(key)) throw new Error(`memory View projector returned a duplicate key for ${layerId}: ${key}`)
      keys.add(key)
      ids.set(key, `node-${hash(`${layerId}\0${key}`).slice(0, 24)}`)
    }
    const parentKeys = new Map<string, string | undefined>()
    const nodes = projection.nodes.map(candidate => {
      const key = candidate.key.trim()
      const parentKey = optionalText(candidate.parentKey, `memory View parent key for ${layerId}`, 500)
      if (parentKey !== undefined && !keys.has(parentKey)) throw new Error(`memory View node parent is unavailable for ${layerId}: ${parentKey}`)
      if (parentKey === key) throw new Error(`memory View node cannot parent itself for ${layerId}: ${key}`)
      if (!NODE_KINDS.has(candidate.kind)) throw new Error(`unsupported memory View node kind: ${String(candidate.kind)}`)
      parentKeys.set(key, parentKey)
      const summary = optionalText(candidate.summary, `memory View node summary for ${layerId}`, 4_000)
      const content = optionalContent(candidate.content, `memory View node content for ${layerId}`, 1_000_000)
      const reference = optionalText(candidate.reference, `memory View node reference for ${layerId}`, 2_000)
      const metadata = cloneMetadata(candidate.metadata)
      return {
        id: ids.get(key)!,
        layerId,
        kind: candidate.kind,
        label: text(candidate.label, `memory View node label for ${layerId}`, 300),
        childIds: [] as string[],
        ...(parentKey === undefined ? {} : { parentId: ids.get(parentKey)! }),
        ...(summary === undefined ? {} : { summary }),
        ...(content === undefined ? {} : { content }),
        ...(reference === undefined ? {} : { reference }),
        ...(metadata === undefined ? {} : { metadata }),
      } satisfies MemoryViewNode
    })
    for (const key of keys) {
      const seen = new Set<string>()
      let cursor: string | undefined = key
      while (cursor !== undefined) {
        if (seen.has(cursor)) throw new Error(`memory View projection contains a cycle for ${layerId}: ${key}`)
        seen.add(cursor)
        cursor = parentKeys.get(cursor)
      }
    }
    const byId = new Map(nodes.map(node => [node.id, node]))
    for (const node of nodes) {
      if (node.parentId !== undefined) byId.get(node.parentId)!.childIds.push(node.id)
    }
    const frozenNodes = nodes.map(node => deepFreeze(node))
    const nodeIds = frozenNodes.filter(node => node.parentId === undefined).map(node => node.id)
    const sourcePayload = { layerId, revision, mode, nodeIds, nodes: frozenNodes }
    const source = deepFreeze({
      layerId,
      revision,
      mode,
      digest: hash(canonical(sourcePayload)),
      nodeIds,
    } satisfies MemoryViewSource)
    return { source, nodes: frozenNodes }
  }

  private renderWake(view: MemoryView): MemoryWake {
    const nodes = new Map(view.nodes.map(node => [node.id, node]))
    const sections: MemoryWakeSection[] = view.sources.map(source => {
      const roots = source.nodeIds.map(id => nodes.get(id)!).filter(Boolean)
      const sectionText = source.mode === 'exact'
        ? roots.map(node => node.content ?? node.summary ?? node.label).join('\n\n')
        : roots.flatMap(node => [
            `- [${node.id}] ${node.label}${node.summary === undefined ? '' : ` — ${node.summary}`}`,
            ...node.childIds.map(id => nodes.get(id)!).filter(Boolean).map(child => (
              `  - [${child.id}] ${child.label}${child.summary === undefined ? '' : ` — ${child.summary}`}`
            )),
          ]).join('\n')
      return {
        layerId: source.layerId,
        mode: source.mode,
        nodeIds: [...source.nodeIds],
        text: sectionText,
      }
    })
    const exact = sections.filter(section => section.mode === 'exact' && section.text !== '').map(section => section.text)
    const mapped = sections.filter(section => section.mode !== 'exact' && section.text !== '')
    const memoryMap = mapped.length === 0 ? '' : [
      `MNEMON MEMORY MAP (${view.id})`,
      ...mapped.flatMap(section => [`${section.layerId}:`, section.text]),
      `Use mnemon_memory_zoom with this viewId and a listed nodeId to expand one branch. Use mnemon_recall only when query-dependent durable evidence is needed.`,
      `For mnemon_recall, pass parentViewId=${view.id} and the most relevant Memory Spaces node as viewNodeId; the Host will enforce this pinned View even if those fields are omitted.`,
    ].join('\n')
    const rendered = [...exact, memoryMap].filter(Boolean).join('\n\n')
    if (rendered.length > this.maxWakeCharacters) throw new Error(`memory View Wake is ${rendered.length} characters; limit is ${this.maxWakeCharacters}`)
    return deepFreeze({
      viewId: view.id,
      viewDigest: view.digest,
      text: rendered,
      sections,
    })
  }

  private requireView(viewId: string): MemoryView {
    const id = text(viewId, 'memory view id', 300)
    const view = this.views.get(id)
    if (view === undefined) throw new Error(`memory View is unavailable: ${id}`)
    return view
  }

  private collect(): void {
    if (this.views.size <= this.maxViews) return
    const pinned = new Set([...this.turns.values()].map(turn => turn.viewId))
    if (this.current !== undefined) pinned.add(this.current.id)
    for (const id of this.views.keys()) {
      if (this.views.size <= this.maxViews) break
      if (!pinned.has(id)) this.views.delete(id)
    }
  }
}
