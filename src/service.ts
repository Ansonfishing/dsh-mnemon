import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { JsonValue } from './contracts.ts'
import type { ResolvedConfig } from './config.ts'
import {
  MemoryBodyRegistry,
  type CreateMemoryBodyRequest,
  type MemoryBody,
  type UpdateMemoryBodyRequest,
} from './memory-bodies.ts'
import type { MnemonRunner } from './runner.ts'
import { prepareMemoryPlacement, type PreparedMemoryPlacement } from './provider-placement.ts'
import { OpenVikingProvider } from './providers/openviking.ts'
import { Mem0Provider } from './providers/mem0.ts'
import { RetainDbProvider } from './providers/retaindb.ts'
import { SupermemoryProvider } from './providers/supermemory.ts'
import { HolographicProvider } from './providers/holographic.ts'
import { ByteRoverProvider } from './providers/byterover.ts'
import { MEMORY_PROVIDER_CATALOG } from './providers/catalog.ts'
import type { MemoryProviderAdapter, ProviderBodyStatus, ProviderSearchResult } from './providers/provider.ts'
import {
  CATEGORIES,
  EDGE_TYPES,
  INTENTS,
  SOURCES,
  type Category,
  type EdgeType,
  type EntityView,
  type Insight,
  type Intent,
  type MemoryBodyCatalog,
  type MemoryBodyStats,
  type MemoryBodyView,
  type MemoryGraphEdge,
  type MemoryGraphNode,
  type MemoryGraphSnapshot,
  type MemoryListRequest,
  type MemoryListView,
  type MemoryPlacementDecision,
  type RememberRequest,
  type SearchRequest,
  type Source,
  type StatusView,
} from './shared/contracts.ts'

export { CATEGORIES, EDGE_TYPES, INTENTS, SOURCES } from './shared/contracts.ts'
export type {
  Category,
  EdgeType,
  EntityView,
  Insight,
  Intent,
  MemoryBodyCatalog,
  MemoryBodyStats,
  MemoryBodyView,
  MemoryGraphEdge,
  MemoryGraphNode,
  MemoryGraphSnapshot,
  MemoryListRequest,
  MemoryListView,
  RememberRequest,
  SearchRequest,
  Source,
  StatusView,
} from './shared/contracts.ts'

function record(value: JsonValue | undefined): Record<string, JsonValue> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, JsonValue>
    : undefined
}

function text(value: JsonValue | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function number(value: JsonValue | undefined): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function stringArray(value: JsonValue | undefined): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  return value.filter((entry): entry is string => typeof entry === 'string')
}

function normalizeInsight(value: JsonValue): Insight | undefined {
  const item = record(value)
  if (item === undefined) return undefined
  // Mnemon <=0.1.2 returns full recall rows as
  // `{ insight: { id, content, ... }, score, intent, via, signals }`; newer
  // builds default to a compact flat row. Accept both without version gates.
  const nested = record(item.insight)
  const core = nested ?? item
  const id = text(core.id)
  const content = text(core.content)
  if (id === undefined || content === undefined) return undefined
  const insight: Insight = { id, content }
  const optionalText = {
    category: text(core.category),
    source: text(core.source),
    confidence: text(item.confidence),
    intent: text(item.intent),
    matchedVia: text(item.matched_via ?? item.via ?? item.via_edge_type),
    createdAt: text(core.created_at),
    edgeType: text(item.via_edge_type),
  }
  for (const [key, value] of Object.entries(optionalText)) if (value !== undefined) Object.assign(insight, { [key]: value })
  const optionalNumbers = {
    importance: number(core.importance),
    score: number(item.score),
    depth: number(item.depth),
  }
  for (const [key, value] of Object.entries(optionalNumbers)) if (value !== undefined) Object.assign(insight, { [key]: value })
  const tags = stringArray(core.tags)
  const entities = stringArray(core.entities)
  if (tags !== undefined) insight.tags = tags
  if (entities !== undefined) insight.entities = entities
  return insight
}

const JS_STRING = '"(?:\\\\.|[^"\\\\])*"'
const VIZ_NODE_PATTERN = new RegExp(`\\{id:(${JS_STRING}),label:(${JS_STRING}),title:(${JS_STRING}),color:(${JS_STRING}),font:\\{color:"white"\\}\\}`, 'g')
const VIZ_EDGE_PATTERN = new RegExp(`\\{from:(${JS_STRING}),to:(${JS_STRING}),label:(${JS_STRING}),color:\\{color:(${JS_STRING})\\},arrows:"to"`, 'g')
const EDGE_COLORS: Record<string, EdgeType> = {
  '#aaaaaa': 'temporal',
  '#3498db': 'semantic',
  '#e74c3c': 'causal',
  '#2ecc71': 'entity',
}

function decodeJsString(value: string): string {
  const decoded = JSON.parse(value) as unknown
  if (typeof decoded !== 'string') throw new Error('Mnemon viz contained an invalid string')
  return decoded
}

/** Parse the official Mnemon vis.js export without executing its HTML or loading its CDN script. */
export function parseMemoryGraph(html: string, now = new Date()): MemoryGraphSnapshot {
  const nodes: MemoryGraphNode[] = []
  const edges: MemoryGraphEdge[] = []
  for (const match of html.matchAll(VIZ_NODE_PATTERN)) {
    const id = decodeJsString(match[1]!)
    const label = decodeJsString(match[2]!)
    const content = decodeJsString(match[3]!).replaceAll('\\n', '\n')
    const color = decodeJsString(match[4]!)
    const category = /\[([a-z_]+)\]/i.exec(label)?.[1] ?? 'general'
    nodes.push({ id, content, category, color })
  }
  for (const match of html.matchAll(VIZ_EDGE_PATTERN)) {
    const color = decodeJsString(match[4]!)
    const type = EDGE_COLORS[color.toLowerCase()]
    edges.push({
      sourceId: decodeJsString(match[1]!),
      targetId: decodeJsString(match[2]!),
      label: decodeJsString(match[3]!),
      color,
      ...(type === undefined ? {} : { type }),
    })
  }
  if (!html.includes('var nodes = new vis.DataSet([')) throw new Error('Mnemon viz returned an unexpected HTML payload')
  return { nodes, edges, generatedAt: now.toISOString() }
}

function boundedInteger(value: number | undefined, fallback: number, min: number, max: number): number {
  if (value === undefined) return fallback
  if (!Number.isInteger(value) || value < min || value > max) throw new Error(`value must be an integer within ${min}..${max}`)
  return value
}

function required(value: string, label: string, max: number): string {
  const normalized = value.trim()
  if (normalized === '') throw new Error(`${label} is required`)
  if (normalized.length > max) throw new Error(`${label} is too long (max ${max} characters)`)
  return normalized
}

function allowed<T extends string>(value: T | undefined, values: readonly T[], label: string): T | undefined {
  if (value !== undefined && !values.includes(value)) {
    throw new Error(`${label} must be one of: ${values.join(', ')}`)
  }
  return value
}

function commaList(values: string[] | undefined, label: string, limit: number): string | undefined {
  if (values === undefined) return undefined
  const normalized = values.map(value => value.trim()).filter(value => value !== '')
  if (normalized.length > limit) throw new Error(`${label} accepts at most ${limit} values`)
  if (normalized.some(value => value.includes(','))) throw new Error(`${label} values cannot contain commas`)
  return normalized.length === 0 ? undefined : normalized.join(',')
}

export class MnemonService {
  readonly memoryBodies: MemoryBodyRegistry
  private readonly providers: Map<MemoryBody['provider']['id'], MemoryProviderAdapter>

  constructor(readonly runner: MnemonRunner, readonly config: ResolvedConfig, memoryBodies?: MemoryBodyRegistry) {
    this.memoryBodies = memoryBodies ?? new MemoryBodyRegistry(runner)
    const nativeProvider: MemoryProviderAdapter = {
      id: 'mnemon-native',
      status: (body, signal) => this.nativeBodyStatus(body, signal),
      search: (body, request, signal) => this.nativeSearch(body, request, signal),
      graph: (body, signal) => this.nativeGraph(body, signal),
      list: (body, _request, signal) => this.allNativeInsights(body, signal, true),
      remember: (body, request, signal) => this.nativeRemember(body, request, signal),
      related: (body, id, depth, edge, signal) => this.nativeRelated(body, id, depth, edge, signal),
      link: (body, sourceId, targetId, type, weight, reason, signal) => this.nativeLink(body, sourceId, targetId, type, weight, reason, signal),
      forget: (body, id, signal) => this.nativeForget(body, id, signal),
    }
    const openVikingProvider = new OpenVikingProvider(this.memoryBodies, { requestTimeoutMs: this.config.timeoutMs })
    const mem0Provider = new Mem0Provider(this.memoryBodies, { requestTimeoutMs: this.config.timeoutMs })
    const retainDbProvider = new RetainDbProvider(this.memoryBodies, { requestTimeoutMs: this.config.timeoutMs })
    const supermemoryProvider = new SupermemoryProvider(this.memoryBodies, { requestTimeoutMs: this.config.timeoutMs })
    const holographicProvider = new HolographicProvider(this.memoryBodies)
    const byteRoverProvider = new ByteRoverProvider(this.memoryBodies, { queryTimeoutMs: this.config.timeoutMs })
    this.providers = new Map([
      [nativeProvider.id, nativeProvider],
      [openVikingProvider.id, openVikingProvider],
      [mem0Provider.id, mem0Provider],
      [retainDbProvider.id, retainDbProvider],
      [supermemoryProvider.id, supermemoryProvider],
      [holographicProvider.id, holographicProvider],
      [byteRoverProvider.id, byteRoverProvider],
    ])
  }

  async bodies(signal?: AbortSignal): Promise<MemoryBodyCatalog> {
    const mnemonDefaultStore = this.runner.persistedStore()
    const items: MemoryBodyView[] = await Promise.all(this.memoryBodies.list().map(async body => {
      let status: ProviderBodyStatus
      try { status = await this.providerFor(body).status(body, signal) } catch (error) {
        status = { healthy: false, error: error instanceof Error ? error.message : String(error) }
      }
      return { ...body, mnemonDefault: body.provider.id === 'mnemon-native' && body.id === mnemonDefaultStore, ...status }
    }))
    return {
      items,
      providers: [...MEMORY_PROVIDER_CATALOG],
      total: items.length,
      activeCount: items.filter(body => body.active).length,
      directory: this.memoryBodies.directory,
      generatedAt: new Date().toISOString(),
    }
  }

  async status(signal?: AbortSignal): Promise<StatusView> {
    const catalog = await this.bodies(signal)
    const active = catalog.items.filter(body => body.active)
    const dshActiveStores = active.map(body => body.id)
    const base = {
      cliPath: this.runner.command,
      commandFound: this.runner.commandFound,
      dataDir: this.runner.effectiveDataDir(),
      store: dshActiveStores.join(', ') || 'none',
      mnemonDefaultStore: this.runner.persistedStore(),
      dshActiveStores,
      writeEnabled: this.config.writeEnabled,
      timeoutMs: this.config.timeoutMs,
      defaultRecallLimit: this.config.defaultRecallLimit,
      memoryBodyDirectory: catalog.directory,
      memoryBodies: catalog.items,
    }
    try {
      const hasNativeBody = catalog.items.some(body => body.provider.id === 'mnemon-native')
      const rawVersion = hasNativeBody
        ? await this.runner.runText(['--version'], signal === undefined ? { globalFlags: false } : { signal, globalFlags: false })
        : undefined
      const healthyBodies = active.filter(body => body.healthy && body.stats !== undefined)
      const topEntities = new Map<string, number>()
      const byCategory: Record<string, number> = {}
      for (const body of healthyBodies) {
        for (const [category, count] of Object.entries(body.stats!.byCategory)) byCategory[category] = (byCategory[category] ?? 0) + count
        for (const entity of body.stats!.topEntities) topEntities.set(entity.entity, (topEntities.get(entity.entity) ?? 0) + entity.count)
      }
      const stats: StatusView['stats'] = {
        totalInsights: healthyBodies.reduce((total, body) => total + body.stats!.totalInsights, 0),
        deletedInsights: healthyBodies.reduce((total, body) => total + body.stats!.deletedInsights, 0),
        edgeCount: healthyBodies.reduce((total, body) => total + body.stats!.edgeCount, 0),
        oplogCount: healthyBodies.reduce((total, body) => total + body.stats!.oplogCount, 0),
        dbSizeBytes: healthyBodies.reduce((total, body) => total + body.stats!.dbSizeBytes, 0),
        byCategory,
        topEntities: [...topEntities].map(([entity, count]) => ({ entity, count })).sort((left, right) => right.count - left.count),
        ...(active.length === 1 ? { dbPath: active[0]!.dbPath } : {}),
      }
      const failed = active.filter(body => !body.healthy)
      return {
        healthy: failed.length === 0,
        ...base,
        ...(rawVersion === undefined ? {} : { version: rawVersion.trim().replace(/^mnemon version\s+/i, '') }),
        stats,
        ...(failed.length === 0 ? {} : { error: failed.map(body => `${body.name}: ${body.error ?? 'unavailable'}`).join('; ') }),
      }
    } catch (error) {
      return { healthy: false, ...base, error: error instanceof Error ? error.message : String(error) }
    }
  }

  async search(request: SearchRequest, signal?: AbortSignal): Promise<{ query: string; mode: string; results: Insight[]; hint?: string }> {
    const query = required(request.query, 'query', 2000)
    const limit = boundedInteger(request.limit, this.config.defaultRecallLimit, 1, 50)
    const mode = allowed(request.mode, ['smart', 'keyword', 'basic'] as const, 'mode') ?? 'smart'
    const category = allowed(request.category, CATEGORIES, 'category')
    const source = allowed(request.source, SOURCES, 'source')
    const intent = allowed(request.intent, INTENTS, 'intent')
    const bodies = this.readBodies(request.memoryBodyIds)
    const normalizedRequest: SearchRequest = {
      query,
      mode,
      limit,
      ...(category === undefined ? {} : { category }),
      ...(source === undefined ? {} : { source }),
      ...(intent === undefined ? {} : { intent }),
    }
    const batches = await Promise.all(bodies.map(async body => {
      try {
        const result = await this.providerFor(body).search(body, normalizedRequest, signal)
        return { body, result }
      } catch (error) {
        return { body, result: { results: [], hint: `unavailable: ${error instanceof Error ? error.message : String(error)}` } satisfies ProviderSearchResult }
      }
    }))
    const results: Array<Insight & { providerRank: number; bodyOrder: number }> = []
    const hints: string[] = []
    for (const [bodyOrder, { body, result }] of batches.entries()) {
      results.push(...result.results.map((entry, index) => ({ ...this.annotate(entry, body), providerRank: index + 1, bodyOrder })))
      if (result.hint !== undefined) hints.push(`${body.name}: ${result.hint}`)
    }
    const heterogeneous = new Set(bodies.map(body => body.provider.id)).size > 1
    if (heterogeneous) for (const result of results) result.federatedScore = 1 / (60 + result.providerRank)
    results.sort((left, right) => heterogeneous
      ? (right.federatedScore ?? 0) - (left.federatedScore ?? 0) || left.bodyOrder - right.bodyOrder
      : (right.score ?? 0) - (left.score ?? 0))
    return {
      query,
      mode,
      results: results.slice(0, limit).map(({ providerRank: _providerRank, bodyOrder: _bodyOrder, ...entry }) => entry),
      ...(hints.length === 0 ? {} : { hint: hints.join('\n') }),
    }
  }

  async graph(signal?: AbortSignal, memoryBodyIds?: string[]): Promise<MemoryGraphSnapshot> {
    const bodies = this.readBodies(memoryBodyIds)
    const nodes: MemoryGraphNode[] = []
    const edges: MemoryGraphEdge[] = []
    const snapshots = await Promise.all(bodies.map(async body => {
      try { return { body, snapshot: await this.providerFor(body).graph(body, signal) } } catch { return undefined }
    }))
    for (const item of snapshots) {
      if (item === undefined) continue
      const { body, snapshot } = item
      const graphId = (id: string): string => `${body.id}:${id}`
      nodes.push(...snapshot.nodes.map(node => ({ ...this.annotate(node, body), color: node.color, graphId: graphId(node.id) })))
      edges.push(...snapshot.edges.map(edge => ({ ...edge, sourceId: graphId(edge.sourceId), targetId: graphId(edge.targetId) })))
    }
    return {
      nodes,
      edges,
      generatedAt: new Date().toISOString(),
      memoryBodies: bodies.map(({ id, name, active }) => ({ id, name, active })),
    }
  }

  async list(request: MemoryListRequest = {}, signal?: AbortSignal): Promise<MemoryListView> {
    const query = request.query?.trim().toLocaleLowerCase() ?? ''
    if (query.length > 500) throw new Error('query is too long (max 500 characters)')
    const category = allowed(request.category, CATEGORIES, 'category')
    const limit = boundedInteger(request.limit, 200, 1, 1000)
    const graph = await this.graph(signal, request.memoryBodyIds)
    const matches = graph.nodes.filter(node =>
      (category === undefined || node.category === category)
      && (query === '' || node.content.toLocaleLowerCase().includes(query) || node.id.toLocaleLowerCase().includes(query)),
    )
    return { items: matches.slice(0, limit), total: matches.length, generatedAt: graph.generatedAt }
  }

  async entities(entity?: string, limit?: number, signal?: AbortSignal): Promise<EntityView> {
    const status = await this.status(signal)
    const items = status.stats?.topEntities ?? []
    const selected = entity?.trim() ?? ''
    if (selected === '') return { items, insights: [] }
    if (selected.length > 200) throw new Error('entity is too long (max 200 characters)')
    const response = await this.search({ query: selected, intent: 'ENTITY', limit: boundedInteger(limit, 20, 1, 50) }, signal)
    return { items, selected, insights: response.results }
  }

  async remember(request: RememberRequest, signal?: AbortSignal): Promise<JsonValue> {
    this.assertWritable()
    const body = this.writeBody(request.memoryBodyId)
    const content = required(request.content, 'content', 8000)
    const importance = boundedInteger(request.importance, 3, 1, 5)
    const category = allowed(request.category, CATEGORIES, 'category') ?? 'general'
    const source = allowed(request.source, SOURCES, 'source') ?? 'user'
    const tags = commaList(request.tags, 'tags', 20)?.split(',')
    const entities = commaList(request.entities, 'entities', 50)?.split(',')
    const result = await this.providerFor(body).remember(body, {
      content,
      importance,
      category,
      source,
      ...(tags === undefined ? {} : { tags }),
      ...(entities === undefined ? {} : { entities }),
    }, signal)
    this.activateAfterWrite(body)
    return this.annotateResult(result, body)
  }

  async related(id: string, depth = 2, edge?: EdgeType, signal?: AbortSignal, memoryBodyId?: string): Promise<Insight[]> {
    const body = this.readBody(memoryBodyId)
    const selectedEdge = allowed(edge, EDGE_TYPES, 'edge')
    const provider = this.providerFor(body)
    if (provider.related === undefined || !body.provider.capabilities.related) throw new Error(`${body.provider.label} does not support related-memory traversal`)
    const results = await provider.related(body, required(id, 'id', 2000), boundedInteger(depth, 2, 1, 5), selectedEdge, signal)
    return results.map(entry => this.annotate(entry, body))
  }

  async link(sourceId: string, targetId: string, type: EdgeType = 'semantic', weight = 0.5, reason?: string, signal?: AbortSignal, memoryBodyId?: string): Promise<JsonValue> {
    this.assertWritable()
    const body = this.writeBody(memoryBodyId)
    if (!Number.isFinite(weight) || weight < 0 || weight > 1) throw new Error('weight must be within 0..1')
    const selectedType = allowed(type, EDGE_TYPES, 'type') ?? 'semantic'
    const provider = this.providerFor(body)
    if (provider.link === undefined || !body.provider.capabilities.link) throw new Error(`${body.provider.label} does not support explicit memory links`)
    const result = await provider.link(
      body,
      required(sourceId, 'sourceId', 2000),
      required(targetId, 'targetId', 2000),
      selectedType,
      weight,
      reason === undefined || reason.trim() === '' ? undefined : required(reason, 'reason', 1000),
      signal,
    )
    this.activateAfterWrite(body)
    return this.annotateResult(result, body)
  }

  async forget(id: string, signal?: AbortSignal, memoryBodyId?: string): Promise<JsonValue> {
    this.assertWritable()
    const body = this.writeBody(memoryBodyId)
    const provider = this.providerFor(body)
    if (provider.forget === undefined || !body.provider.capabilities.forget) throw new Error(`${body.provider.label} does not expose safe forget semantics in this integration`)
    const result = await provider.forget(body, required(id, 'id', 2000), signal)
    this.activateAfterWrite(body)
    return this.annotateResult(result, body)
  }

  prepareBodyPlacement(request: CreateMemoryBodyRequest): PreparedMemoryPlacement {
    if (request.placement === undefined) throw new Error('automatic provider placement request is required')
    if (request.providerId !== undefined) throw new Error('automatic provider placement cannot include a fixed providerId')
    return prepareMemoryPlacement(request.placement, this.memoryBodies.placementCandidates(request))
  }

  async createBody(request: CreateMemoryBodyRequest, signal?: AbortSignal, placement?: MemoryPlacementDecision): Promise<MemoryBody> {
    this.assertWritable()
    return this.memoryBodies.create(request, signal, placement)
  }

  updateBody(id: string, request: UpdateMemoryBodyRequest): MemoryBody {
    this.assertWritable()
    return this.memoryBodies.update(id, request)
  }

  async deleteBody(id: string, signal?: AbortSignal): Promise<MemoryBody> {
    this.assertWritable()
    return this.memoryBodies.remove(id, signal)
  }

  async mergeBodies(targetBodyId: string, sourceBodyIds: string[], deactivateSources = true, signal?: AbortSignal): Promise<JsonValue> {
    this.assertWritable()
    const target = this.memoryBodies.get(targetBodyId)
    if (target.provider.id !== 'mnemon-native') throw new Error('memory-body merge currently requires a Mnemon Native target')
    const sourceIds = [...new Set(sourceBodyIds.map(id => id.trim()).filter(id => id !== ''))]
    if (sourceIds.length === 0) throw new Error('sourceMemoryBodyIds requires at least one memory body')
    if (sourceIds.includes(target.id)) throw new Error('target memory body cannot also be a merge source')
    const sources = sourceIds.map(id => this.memoryBodies.get(id))
    if (sources.some(source => source.provider.id !== 'mnemon-native')) throw new Error('memory-body merge currently supports Mnemon Native sources only')
    const insights: Array<Record<string, JsonValue>> = []
    const edges: Array<Record<string, JsonValue>> = []
    for (const source of sources) {
      const offset = insights.length
      const sourceInsights = await this.allNativeInsights(source, signal)
      const indexById = new Map(sourceInsights.map((insight, index) => [insight.id, offset + index]))
      for (const insight of sourceInsights) {
        insights.push({
          content: insight.content,
          ...(insight.category === undefined ? {} : { category: insight.category }),
          ...(insight.importance === undefined ? {} : { importance: insight.importance }),
          ...(insight.tags === undefined ? {} : { tags: insight.tags }),
          ...(insight.entities === undefined ? {} : { entities: insight.entities }),
          ...(insight.source === undefined ? {} : { source: insight.source }),
          ...(insight.createdAt === undefined ? {} : { created_at: insight.createdAt }),
        })
      }
      const graph = await this.nativeGraph(source, signal)
      for (const edge of graph.edges) {
        const sourceIndex = indexById.get(edge.sourceId)
        const targetIndex = indexById.get(edge.targetId)
        if (sourceIndex === undefined || targetIndex === undefined || edge.type === undefined) continue
        edges.push({ source_index: sourceIndex, target_index: targetIndex, edge_type: edge.type, weight: 0.5, reason: edge.label })
      }
    }
    if (insights.length === 0) {
      this.activateAfterWrite(target)
      if (deactivateSources) for (const source of sources) this.memoryBodies.setActive(source.id, false)
      return { imported: 0, updated: 0, skipped: 0, edges_inserted: 0, targetMemoryBodyId: target.id }
    }
    const temporary = mkdtempSync(join(tmpdir(), 'dsh-mnemon-merge-'))
    const draftPath = join(temporary, 'memory-draft.json')
    try {
      writeFileSync(draftPath, JSON.stringify({ schema_version: '1', source: 'dsh-mnemon-merge', insights, edges }), { encoding: 'utf8', mode: 0o600 })
      const result = await this.runner.runJson(['import', draftPath], { ...(signal === undefined ? {} : { signal }), store: target.id })
      this.activateAfterWrite(target)
      if (deactivateSources) for (const source of sources) this.memoryBodies.setActive(source.id, false)
      return this.annotateResult(result, target)
    } finally {
      rmSync(temporary, { recursive: true, force: true })
    }
  }

  private async nativeBodyStatus(body: MemoryBody, signal?: AbortSignal): Promise<ProviderBodyStatus> {
    try {
      const raw = await this.runner.runJson(['status'], { ...(signal === undefined ? {} : { signal }), store: body.id })
      const status = record(raw)
      if (status === undefined) throw new Error('mnemon status returned an unexpected payload')
      return { healthy: true, stats: this.parseStats(status) }
    } catch (error) {
      return { healthy: false, error: error instanceof Error ? error.message : String(error) }
    }
  }

  private parseStats(status: Record<string, JsonValue>): MemoryBodyStats {
    const byCategoryRecord = record(status.by_category) ?? {}
    const byCategory: Record<string, number> = {}
    for (const [category, count] of Object.entries(byCategoryRecord)) if (typeof count === 'number') byCategory[category] = count
    const topEntities = Array.isArray(status.top_entities)
      ? status.top_entities.flatMap((entry) => {
          const entity = record(entry)
          const name = text(entity?.entity)
          const count = number(entity?.count)
          return name === undefined || count === undefined ? [] : [{ entity: name, count }]
        })
      : []
    return {
      totalInsights: number(status.total_insights) ?? 0,
      deletedInsights: number(status.deleted_insights) ?? 0,
      edgeCount: number(status.edge_count) ?? 0,
      oplogCount: number(status.oplog_count) ?? 0,
      dbSizeBytes: number(status.db_size_bytes) ?? 0,
      byCategory,
      topEntities,
    }
  }

  private async nativeGraph(body: MemoryBody, signal?: AbortSignal): Promise<MemoryGraphSnapshot> {
    const [html, insights] = await Promise.all([
      this.runner.runText(['viz', '--format', 'html', '--output', '-'], { ...(signal === undefined ? {} : { signal }), store: body.id }),
      // Mnemon's HTML visualization omits tags and entities. A readonly recall
      // supplies that metadata without incrementing access counters.
      this.allNativeInsights(body, signal, true),
    ])
    const snapshot = parseMemoryGraph(html)
    const metadata = new Map(insights.map(insight => [insight.id, insight]))
    return {
      ...snapshot,
      nodes: snapshot.nodes.map(node => {
        const insight = metadata.get(node.id)
        return insight === undefined
          ? node
          : { ...node, ...insight, id: node.id, content: node.content, color: node.color }
      }),
    }
  }

  private async allNativeInsights(body: MemoryBody, signal?: AbortSignal, readonly = false): Promise<Insight[]> {
    const payload = await this.runner.runJson([
      ...(readonly ? ['--readonly'] : []),
      'recall', '', '--basic', '--limit', '100000',
    ], { ...(signal === undefined ? {} : { signal }), store: body.id })
    const values = Array.isArray(payload) ? payload : Array.isArray(record(payload)?.results) ? record(payload)!.results as JsonValue[] : []
    return values.map(normalizeInsight).filter((entry): entry is Insight => entry !== undefined)
  }

  private async nativeSearch(body: MemoryBody, request: SearchRequest, signal?: AbortSignal): Promise<ProviderSearchResult> {
    const mode = request.mode ?? 'smart'
    const args = mode === 'keyword'
      ? ['search', request.query, '--limit', String(request.limit ?? this.config.defaultRecallLimit)]
      : ['recall', request.query, '--limit', String(request.limit ?? this.config.defaultRecallLimit)]
    if (mode === 'basic') args.push('--basic')
    if (mode !== 'keyword') {
      if (request.category !== undefined) args.push('--cat', request.category)
      if (request.source !== undefined) args.push('--source', request.source)
      if (request.intent !== undefined) args.push('--intent', request.intent)
    }
    const payload = await this.runner.runJson(args, { ...(signal === undefined ? {} : { signal }), store: body.id })
    const wrapper = record(payload)
    const values = Array.isArray(payload) ? payload : Array.isArray(wrapper?.results) ? wrapper.results : []
    const hint = text(wrapper?.hint)
    return {
      results: values.map(normalizeInsight).filter((entry): entry is Insight => entry !== undefined),
      ...(hint === undefined ? {} : { hint }),
    }
  }

  private async nativeRemember(body: MemoryBody, request: RememberRequest, signal?: AbortSignal): Promise<JsonValue> {
    const args = ['remember', request.content, '--cat', request.category ?? 'general', '--imp', String(request.importance ?? 3), '--source', request.source ?? 'user']
    const tags = commaList(request.tags, 'tags', 20)
    const entities = commaList(request.entities, 'entities', 50)
    if (tags !== undefined) args.push('--tags', tags)
    if (entities !== undefined) args.push('--entities', entities)
    return this.runner.runJson(args, { ...(signal === undefined ? {} : { signal }), store: body.id })
  }

  private async nativeRelated(body: MemoryBody, id: string, depth: number, edge?: EdgeType, signal?: AbortSignal): Promise<Insight[]> {
    const args = ['related', id, '--depth', String(depth)]
    if (edge !== undefined) args.push('--edge', edge)
    const payload = await this.runner.runJson(args, { ...(signal === undefined ? {} : { signal }), store: body.id })
    return Array.isArray(payload) ? payload.map(normalizeInsight).filter((entry): entry is Insight => entry !== undefined) : []
  }

  private async nativeLink(body: MemoryBody, sourceId: string, targetId: string, type: EdgeType, weight: number, reason?: string, signal?: AbortSignal): Promise<JsonValue> {
    const args = ['link', sourceId, targetId, '--type', type, '--weight', String(weight)]
    if (reason !== undefined) args.push('--meta', JSON.stringify({ reason }))
    return this.runner.runJson(args, { ...(signal === undefined ? {} : { signal }), store: body.id })
  }

  private nativeForget(body: MemoryBody, id: string, signal?: AbortSignal): Promise<JsonValue> {
    return this.runner.runJson(['forget', id], { ...(signal === undefined ? {} : { signal }), store: body.id })
  }

  private providerFor(body: MemoryBody): MemoryProviderAdapter {
    const provider = this.providers.get(body.provider.id)
    if (provider === undefined) throw new Error(`unsupported memory provider: ${body.provider.id}`)
    return provider
  }

  private readBodies(ids?: string[]): MemoryBody[] {
    const active = this.memoryBodies.active()
    if (ids === undefined || ids.length === 0) return active
    const requested = [...new Set(ids.map(id => id.trim()).filter(id => id !== ''))]
    return requested.map(id => {
      const body = this.memoryBodies.get(id)
      if (!body.active) throw new Error(`memory body is not active for reading: ${id}`)
      return body
    })
  }

  private readBody(id?: string): MemoryBody {
    if (id !== undefined && id.trim() !== '') {
      const body = this.memoryBodies.get(id)
      if (!body.active) throw new Error(`memory body is not active for reading: ${body.id}`)
      return body
    }
    const active = this.memoryBodies.active()
    if (active.length !== 1) throw new Error('memoryBodyId is required when the number of active memory bodies is not exactly one')
    return active[0]!
  }

  private writeBody(id?: string): MemoryBody {
    if (id !== undefined && id.trim() !== '') return this.memoryBodies.get(id)
    const active = this.memoryBodies.active()
    if (active.length !== 1) throw new Error('memoryBodyId is required when the number of active memory bodies is not exactly one')
    return active[0]!
  }

  private annotate<T extends Insight>(insight: T, body: MemoryBody): T {
    return { ...insight, memoryBodyId: body.id, memoryBodyName: body.name, memoryProviderId: body.provider.id }
  }

  private annotateResult(result: JsonValue, body: MemoryBody): JsonValue {
    const value = record(result)
    return value === undefined ? result : { ...value, memoryBodyId: body.id, memoryBodyName: body.name, memoryProviderId: body.provider.id }
  }

  private activateAfterWrite(body: MemoryBody): void {
    if (!body.active) this.memoryBodies.setActive(body.id, true)
  }

  private assertWritable(): void {
    if (!this.config.writeEnabled) throw new Error('dsh-mnemon is configured read-only (writeEnabled: false)')
  }
}
