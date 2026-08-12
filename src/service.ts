import type { JsonValue } from './contracts.ts'
import type { ResolvedConfig } from './config.ts'
import type { MnemonRunner } from './runner.ts'

export const CATEGORIES = ['preference', 'decision', 'fact', 'insight', 'context', 'general'] as const
export type Category = typeof CATEGORIES[number]
export const SOURCES = ['user', 'agent', 'external'] as const
export type Source = typeof SOURCES[number]
export const EDGE_TYPES = ['temporal', 'semantic', 'causal', 'entity'] as const
export type EdgeType = typeof EDGE_TYPES[number]
export const INTENTS = ['WHY', 'WHEN', 'ENTITY', 'GENERAL'] as const
export type Intent = typeof INTENTS[number]

export interface Insight {
  id: string
  content: string
  category?: string
  importance?: number
  tags?: string[]
  entities?: string[]
  source?: string
  score?: number
  confidence?: string
  intent?: string
  matchedVia?: string
  createdAt?: string
  depth?: number
  edgeType?: string
}

export interface SearchRequest {
  query: string
  mode?: 'smart' | 'keyword' | 'basic'
  limit?: number
  category?: Category
  source?: Source
  intent?: Intent
}

export interface RememberRequest {
  content: string
  category?: Category
  importance?: number
  tags?: string[]
  entities?: string[]
  source?: Source
}

export interface StatusView {
  healthy: boolean
  error?: string
  version?: string
  cliPath: string
  commandFound: boolean
  dataDir: string
  store: string
  writeEnabled: boolean
  timeoutMs: number
  defaultRecallLimit: number
  stats?: {
    totalInsights: number
    deletedInsights: number
    edgeCount: number
    oplogCount: number
    dbPath?: string
    dbSizeBytes: number
    byCategory: Record<string, number>
    topEntities: Array<{ entity: string; count: number }>
  }
}

export interface MemoryGraphNode extends Insight {
  color: string
}

export interface MemoryGraphEdge {
  sourceId: string
  targetId: string
  label: string
  color: string
  type?: EdgeType
}

export interface MemoryGraphSnapshot {
  nodes: MemoryGraphNode[]
  edges: MemoryGraphEdge[]
  generatedAt: string
}

export interface MemoryListRequest {
  query?: string
  category?: Category
  limit?: number
}

export interface MemoryListView {
  items: MemoryGraphNode[]
  total: number
  generatedAt: string
}

export interface EntityView {
  items: Array<{ entity: string; count: number }>
  insights: Insight[]
  selected?: string
}

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
  constructor(readonly runner: MnemonRunner, readonly config: ResolvedConfig) {}

  async status(signal?: AbortSignal): Promise<StatusView> {
    const base = {
      cliPath: this.runner.command,
      commandFound: this.runner.commandFound,
      dataDir: this.runner.effectiveDataDir(),
      store: this.runner.effectiveStore(),
      writeEnabled: this.config.writeEnabled,
      timeoutMs: this.config.timeoutMs,
      defaultRecallLimit: this.config.defaultRecallLimit,
    }
    try {
      const [rawStatus, rawVersion] = await Promise.all([
        this.runner.runJson(['status'], signal === undefined ? {} : { signal }),
        this.runner.runText(['--version'], signal === undefined ? { globalFlags: false } : { signal, globalFlags: false }),
      ])
      const status = record(rawStatus)
      if (status === undefined) throw new Error('mnemon status returned an unexpected payload')
      const byCategoryRecord = record(status.by_category) ?? {}
      const byCategory: Record<string, number> = {}
      for (const [category, count] of Object.entries(byCategoryRecord)) {
        if (typeof count === 'number') byCategory[category] = count
      }
      const topEntities = Array.isArray(status.top_entities)
        ? status.top_entities.flatMap((entry) => {
            const entity = record(entry)
            const name = text(entity?.entity)
            const count = number(entity?.count)
            return name === undefined || count === undefined ? [] : [{ entity: name, count }]
          })
        : []
      return {
        healthy: true,
        ...base,
        version: rawVersion.trim().replace(/^mnemon version\s+/i, ''),
        stats: {
          totalInsights: number(status.total_insights) ?? 0,
          deletedInsights: number(status.deleted_insights) ?? 0,
          edgeCount: number(status.edge_count) ?? 0,
          oplogCount: number(status.oplog_count) ?? 0,
          ...(text(status.db_path) === undefined ? {} : { dbPath: text(status.db_path)! }),
          dbSizeBytes: number(status.db_size_bytes) ?? 0,
          byCategory,
          topEntities,
        },
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
    const args = mode === 'keyword'
      ? ['search', query, '--limit', String(limit)]
      : ['recall', query, '--limit', String(limit)]
    if (mode === 'basic') args.push('--basic')
    if (mode !== 'keyword') {
      if (category !== undefined) args.push('--cat', category)
      if (source !== undefined) args.push('--source', source)
      if (intent !== undefined) args.push('--intent', intent)
    }
    const payload = await this.runner.runJson(args, signal === undefined ? {} : { signal })
    const wrapper = record(payload)
    const values = Array.isArray(payload)
      ? payload
      : Array.isArray(wrapper?.results) ? wrapper.results : []
    const results = values.map(normalizeInsight).filter((entry): entry is Insight => entry !== undefined)
    const hint = text(wrapper?.hint)
    return { query, mode, results, ...(hint === undefined ? {} : { hint }) }
  }

  async graph(signal?: AbortSignal): Promise<MemoryGraphSnapshot> {
    const html = await this.runner.runText(['viz', '--format', 'html', '--output', '-'], signal === undefined ? {} : { signal })
    return parseMemoryGraph(html)
  }

  async list(request: MemoryListRequest = {}, signal?: AbortSignal): Promise<MemoryListView> {
    const query = request.query?.trim().toLocaleLowerCase() ?? ''
    if (query.length > 500) throw new Error('query is too long (max 500 characters)')
    const category = allowed(request.category, CATEGORIES, 'category')
    const limit = boundedInteger(request.limit, 200, 1, 1000)
    const graph = await this.graph(signal)
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
    const content = required(request.content, 'content', 8000)
    const importance = boundedInteger(request.importance, 3, 1, 5)
    const category = allowed(request.category, CATEGORIES, 'category') ?? 'general'
    const source = allowed(request.source, SOURCES, 'source') ?? 'user'
    const args = [
      'remember', content,
      '--cat', category,
      '--imp', String(importance),
      '--source', source,
    ]
    const tags = commaList(request.tags, 'tags', 20)
    const entities = commaList(request.entities, 'entities', 50)
    if (tags !== undefined) args.push('--tags', tags)
    if (entities !== undefined) args.push('--entities', entities)
    return this.runner.runJson(args, signal === undefined ? {} : { signal })
  }

  async related(id: string, depth = 2, edge?: EdgeType, signal?: AbortSignal): Promise<Insight[]> {
    const args = ['related', required(id, 'id', 200), '--depth', String(boundedInteger(depth, 2, 1, 5))]
    const selectedEdge = allowed(edge, EDGE_TYPES, 'edge')
    if (selectedEdge !== undefined) args.push('--edge', selectedEdge)
    const payload = await this.runner.runJson(args, signal === undefined ? {} : { signal })
    if (!Array.isArray(payload)) return []
    return payload.map(normalizeInsight).filter((entry): entry is Insight => entry !== undefined)
  }

  async link(sourceId: string, targetId: string, type: EdgeType = 'semantic', weight = 0.5, reason?: string, signal?: AbortSignal): Promise<JsonValue> {
    this.assertWritable()
    if (!Number.isFinite(weight) || weight < 0 || weight > 1) throw new Error('weight must be within 0..1')
    const selectedType = allowed(type, EDGE_TYPES, 'type') ?? 'semantic'
    const args = ['link', required(sourceId, 'sourceId', 200), required(targetId, 'targetId', 200), '--type', selectedType, '--weight', String(weight)]
    if (reason !== undefined && reason.trim() !== '') args.push('--meta', JSON.stringify({ reason: required(reason, 'reason', 1000) }))
    return this.runner.runJson(args, signal === undefined ? {} : { signal })
  }

  async forget(id: string, signal?: AbortSignal): Promise<JsonValue> {
    this.assertWritable()
    return this.runner.runJson(['forget', required(id, 'id', 200)], signal === undefined ? {} : { signal })
  }

  private assertWritable(): void {
    if (!this.config.writeEnabled) throw new Error('dsh-mnemon is configured read-only (writeEnabled: false)')
  }
}
