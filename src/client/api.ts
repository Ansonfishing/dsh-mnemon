import type { ClientConnectionHandle } from '../contracts.ts'
import { MNEMON_READ_CHANNEL, MNEMON_WRITE_CHANNEL } from '../rpc.ts'
import type { MemoryBody } from '../memory-bodies.ts'
import type { RuntimeMemoryImportance, RuntimeMemoryMutationResult, RuntimeMemorySnapshot, RuntimeMemoryTarget } from '../runtime-memory.ts'
import type { EntityView, Insight, MemoryBodyCatalog, MemoryGraphSnapshot, MemoryListRequest, MemoryListView, RememberRequest, SearchRequest, StatusView } from '../service.ts'

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

  remember(request: RememberRequest): Promise<Record<string, unknown>> {
    return this.call(MNEMON_WRITE_CHANNEL, 'remember', { ...request, sessionId: this.sessionId })
  }

  supervise(content: string): Promise<{ delegated: true; sessionId: string; runId: string; provider: string; summary: string; action: string; memoryBodyIds: string[] }> {
    return this.call(MNEMON_WRITE_CHANNEL, 'supervise', { sessionId: this.sessionId, content })
  }

  forget(id: string, memoryBodyId?: string): Promise<Record<string, unknown>> {
    return this.call(MNEMON_WRITE_CHANNEL, 'forget', { id, sessionId: this.sessionId, ...(memoryBodyId === undefined ? {} : { memoryBodyId }) })
  }

  createBody(request: { id?: string; name: string; description?: string; active?: boolean }): Promise<MemoryBody> {
    return this.call(MNEMON_WRITE_CHANNEL, 'body-create', request)
  }

  updateBody(memoryBodyId: string, request: { name?: string; description?: string; active?: boolean }): Promise<MemoryBody> {
    return this.call(MNEMON_WRITE_CHANNEL, 'body-update', { memoryBodyId, ...request })
  }
}
