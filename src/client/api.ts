import type { ClientConnectionHandle } from '../contracts.ts'
import { MNEMON_READ_CHANNEL, MNEMON_WRITE_CHANNEL } from '../rpc.ts'
import type { Insight, RememberRequest, SearchRequest, StatusView } from '../service.ts'

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

  status(): Promise<StatusView> {
    return this.call(MNEMON_READ_CHANNEL, 'status', {})
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

  forget(id: string): Promise<Record<string, unknown>> {
    return this.call(MNEMON_WRITE_CHANNEL, 'forget', { id })
  }
}
