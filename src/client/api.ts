import type { ClientConnectionHandle } from '../contracts.ts'
import { MNEMON_PACK_CHANNEL, MNEMON_READ_CHANNEL, MNEMON_WRITE_CHANNEL } from '../rpc.ts'
import type { MemoryBody } from '../memory-bodies.ts'
import type { DocumentMutation, DocumentMutationResult, DocumentSearchResult, DocumentSnapshot, DocumentView } from '../documents.ts'
import type { RuntimeMemoryImportance, RuntimeMemoryMutationResult, RuntimeMemorySnapshot, RuntimeMemoryTarget } from '../runtime-memory.ts'
import type { EntityView, Insight, MemoryBodyCatalog, MemoryGraphSnapshot, MemoryListRequest, MemoryListView, RememberRequest, SearchRequest, StatusView } from '../service.ts'
import type { AssistantMessageText, TurnMemoryActivity, TurnMemoryActivitySnapshot } from '../lifecycle.ts'
import type { MnemonPackComponent, MnemonPackExport, MnemonPackImportMode, MnemonPackImportResult, MnemonPackPreview, MnemonPackScope } from '../pack.ts'

interface TurnActivityCacheEntry {
  cursor: number
  activities: Map<number, TurnMemoryActivity>
  inFlight?: Promise<TurnMemoryActivitySnapshot>
}

const turnActivityCache = new WeakMap<ClientConnectionHandle, Map<string, TurnActivityCacheEntry>>()

async function loadTurnActivities(connection: ClientConnectionHandle, sessionId: string | undefined, requiredCursor: number): Promise<TurnMemoryActivitySnapshot> {
  let sessions = turnActivityCache.get(connection)
  if (sessions === undefined) {
    sessions = new Map()
    turnActivityCache.set(connection, sessions)
  }
  const key = sessionId ?? ''
  let entry = sessions.get(key)
  if (entry === undefined) {
    entry = { cursor: -1, activities: new Map() }
    sessions.set(key, entry)
  }
  if (entry.cursor >= requiredCursor) return { cursor: entry.cursor, activities: [...entry.activities.values()] }
  if (entry.inFlight !== undefined) {
    const snapshot = await entry.inFlight
    return snapshot.cursor >= requiredCursor ? snapshot : loadTurnActivities(connection, sessionId, requiredCursor)
  }

  const request = connection.rpc.call(MNEMON_READ_CHANNEL, 'turn-activities', sessionId === undefined ? {} : { sessionId })
    .then(response => {
      if (!response.ok) throw new Error(response.error.message)
      const snapshot = response.value as TurnMemoryActivitySnapshot
      entry!.cursor = snapshot.cursor
      entry!.activities = new Map(snapshot.activities.map(activity => [activity.turn, activity]))
      return snapshot
    })
    .finally(() => { delete entry!.inFlight })
  entry.inFlight = request
  return request
}

export interface SearchResponse {
  query: string
  mode: string
  results: Insight[]
  hint?: string
}

export interface AgentSearchResponse extends SearchResponse {
  answer: string
  citations: string[]
  delegation: { runId: string; provider: string }
}

export class MnemonClient {
  constructor(private readonly connection: ClientConnectionHandle, private readonly sessionId?: string) {}

  private async call<T>(channel: string, endpoint: string, payload: unknown): Promise<T> {
    const response = await this.connection.rpc.call(channel, endpoint, payload)
    if (!response.ok) throw new Error(response.error.message)
    return response.value as T
  }

  status(): Promise<StatusView> {
    return this.call(MNEMON_READ_CHANNEL, 'status', this.sessionId === undefined ? {} : { sessionId: this.sessionId })
  }

  runtimeMemory(): Promise<RuntimeMemorySnapshot> {
    return this.call(MNEMON_READ_CHANNEL, 'runtime-memory', {})
  }

  mutateRuntimeMemory(request: {
    action: 'add' | 'replace' | 'remove'
    target: RuntimeMemoryTarget
    content?: string
    old_text?: string
    importance?: RuntimeMemoryImportance
  }): Promise<RuntimeMemoryMutationResult> {
    return this.call(MNEMON_WRITE_CHANNEL, 'runtime-memory', { ...request, sessionId: this.sessionId })
  }

  documents(): Promise<DocumentSnapshot> {
    return this.call(MNEMON_READ_CHANNEL, 'documents', { sessionId: this.sessionId })
  }

  document(id: string): Promise<DocumentView> {
    return this.call(MNEMON_READ_CHANNEL, 'document', { sessionId: this.sessionId, id })
  }

  searchDocuments(query: string, includeArchived = false, limit = 50): Promise<DocumentSearchResult> {
    return this.call(MNEMON_READ_CHANNEL, 'document-search', { sessionId: this.sessionId, query, includeArchived, limit })
  }

  mutateDocument(request: DocumentMutation): Promise<DocumentMutationResult> {
    return this.call(MNEMON_WRITE_CHANNEL, 'document', { ...request, sessionId: this.sessionId })
  }

  archiveDocument(id: string): Promise<DocumentMutationResult> {
    return this.call(MNEMON_WRITE_CHANNEL, 'document', { action: 'archive', id, sessionId: this.sessionId })
  }

  bodies(): Promise<MemoryBodyCatalog> {
    return this.call(MNEMON_READ_CHANNEL, 'bodies', {})
  }

  graph(memoryBodyIds?: string[]): Promise<MemoryGraphSnapshot> {
    return this.call(MNEMON_READ_CHANNEL, 'graph', memoryBodyIds === undefined ? {} : { memoryBodyIds })
  }

  list(request: MemoryListRequest = {}): Promise<MemoryListView> {
    return this.call(MNEMON_READ_CHANNEL, 'list', request)
  }

  entities(entity?: string, limit?: number): Promise<EntityView> {
    return this.call(MNEMON_READ_CHANNEL, 'entities', {
      sessionId: this.sessionId,
      ...(entity === undefined ? {} : { entity }),
      ...(limit === undefined ? {} : { limit }),
    })
  }

  search(request: SearchRequest): Promise<SearchResponse> {
    return this.call(MNEMON_READ_CHANNEL, 'search', { ...request, sessionId: this.sessionId })
  }

  agentSearch(request: SearchRequest): Promise<AgentSearchResponse> {
    return this.call(MNEMON_READ_CHANNEL, 'agent-search', { ...request, sessionId: this.sessionId })
  }

  related(id: string, memoryBodyId?: string): Promise<Insight[]> {
    return this.call(MNEMON_READ_CHANNEL, 'related', { id, depth: 2, sessionId: this.sessionId, ...(memoryBodyId === undefined ? {} : { memoryBodyId }) })
  }

  /** Settled memory-tool activity of one turn, shared across all mounted tails. */
  async turnActivity(turn: number, cursor = 0): Promise<TurnMemoryActivity | null> {
    const snapshot = await loadTurnActivities(this.connection, this.sessionId, cursor)
    return snapshot.activities.find(activity => activity.turn === turn) ?? null
  }

  /** Plain text of one finalized assistant message; null when absent or empty. */
  assistantMessageText(messageId: string): Promise<AssistantMessageText | null> {
    return this.call(MNEMON_READ_CHANNEL, 'assistant-message', { sessionId: this.sessionId, messageId })
  }

  remember(request: RememberRequest): Promise<Record<string, unknown>> {
    return this.call(MNEMON_WRITE_CHANNEL, 'remember', { ...request, sessionId: this.sessionId })
  }

  supervise(content: string, idempotencyKey?: string): Promise<{ delegated: true; sessionId: string; runId: string; provider: string; summary: string; action: string; memoryBodyIds: string[] }> {
    return this.call(MNEMON_WRITE_CHANNEL, 'supervise', { sessionId: this.sessionId, content, ...(idempotencyKey === undefined ? {} : { idempotencyKey }) })
  }

  forget(id: string, memoryBodyId?: string): Promise<Record<string, unknown>> {
    return this.call(MNEMON_WRITE_CHANNEL, 'forget', { id, sessionId: this.sessionId, ...(memoryBodyId === undefined ? {} : { memoryBodyId }) })
  }

  createBody(request: { name: string; description: string; active?: boolean }): Promise<MemoryBody> {
    return this.call(MNEMON_WRITE_CHANNEL, 'body-create', request)
  }

  updateBody(memoryBodyId: string, request: { name?: string; description?: string; active?: boolean }): Promise<MemoryBody> {
    return this.call(MNEMON_WRITE_CHANNEL, 'body-update', { memoryBodyId, ...request })
  }

  packTarget(): Promise<{ root: string; scope: 'global' | 'workspace' | 'custom'; customPackId?: string }> {
    return this.call(MNEMON_PACK_CHANNEL, 'target', {})
  }

  exportPack(scope: MnemonPackScope): Promise<MnemonPackExport> {
    return this.call(MNEMON_PACK_CHANNEL, 'export', { scope })
  }

  inspectPack(base64: string, fileName?: string): Promise<MnemonPackPreview> {
    return this.call(MNEMON_PACK_CHANNEL, 'inspect', { base64, ...(fileName === undefined ? {} : { fileName }) })
  }

  importPack(base64: string, mode: MnemonPackImportMode, components?: MnemonPackComponent[]): Promise<MnemonPackImportResult> {
    return this.call(MNEMON_PACK_CHANNEL, 'import', { base64, mode, ...(components === undefined ? {} : { components }) })
  }
}
