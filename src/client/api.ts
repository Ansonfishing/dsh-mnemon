import type { ClientConnectionHandle } from '../contracts.ts'
import { MNEMON_READ_CHANNEL, MNEMON_WRITE_CHANNEL } from '../rpc.ts'
import type { EntityView, Insight, MemoryGraphSnapshot, MemoryListRequest, MemoryListView, RememberRequest, SearchRequest, StatusView } from '../service.ts'

export interface SearchResponse {
  query: string
  mode: string
  results: Insight[]
  hint?: string
}

export class MnemonClient {
  constructor(private readonly connection: ClientConnectionHandle) {}

  private async call<T>(channel: string, endpoint: string, payload: unknown): Promise<T> {
    const response = await this.connection.rpc.call(channel, endpoint, payload)
    if (!response.ok) throw new Error(response.error.message)
    return response.value as T
  }

  status(sessionId?: string): Promise<StatusView> {
    return this.call(MNEMON_READ_CHANNEL, 'status', sessionId === undefined ? {} : { sessionId })
  }

  graph(): Promise<MemoryGraphSnapshot> {
    return this.call(MNEMON_READ_CHANNEL, 'graph', {})
  }

  list(request: MemoryListRequest = {}): Promise<MemoryListView> {
    return this.call(MNEMON_READ_CHANNEL, 'list', request)
  }

  entities(entity?: string, limit?: number): Promise<EntityView> {
    return this.call(MNEMON_READ_CHANNEL, 'entities', {
      ...(entity === undefined ? {} : { entity }),
      ...(limit === undefined ? {} : { limit }),
    })
  }

  search(request: SearchRequest): Promise<SearchResponse> {
    return this.call(MNEMON_READ_CHANNEL, 'search', request)
  }

  related(id: string): Promise<Insight[]> {
    return this.call(MNEMON_READ_CHANNEL, 'related', { id, depth: 2 })
  }

  remember(request: RememberRequest): Promise<Record<string, unknown>> {
    return this.call(MNEMON_WRITE_CHANNEL, 'remember', request)
  }

  supervise(sessionId: string, content: string): Promise<{ queued: true; sessionId: string; messageId: string; agentStatus: 'idle' | 'running' }> {
    return this.call(MNEMON_WRITE_CHANNEL, 'supervise', { sessionId, content })
  }

  forget(id: string): Promise<Record<string, unknown>> {
    return this.call(MNEMON_WRITE_CHANNEL, 'forget', { id })
  }
}
