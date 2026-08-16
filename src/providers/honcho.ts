import type { JsonValue } from '../contracts.ts'
import type { MemoryBodyRegistry } from '../memory-bodies.ts'
import type { Insight, MemoryBody, MemoryListRequest, RememberRequest, SearchRequest } from '../shared/contracts.ts'
import { HttpMemoryProvider, firstArray, jsonObject, jsonString, type HttpProviderOptions } from './http.ts'
import type { MemoryProviderAdapter, ProviderBodyStatus, ProviderSearchResult } from './provider.ts'

function insight(value: unknown): Insight | undefined {
  const item = jsonObject(value)
  const id = jsonString(item?.id)
  const content = jsonString(item?.content)
  if (id === undefined || content === undefined) return undefined
  const observer = jsonString(item?.observer_id) ?? jsonString(item?.observer)
  const observed = jsonString(item?.observed_id) ?? jsonString(item?.observed)
  const createdAt = jsonString(item?.created_at) ?? jsonString(item?.createdAt)
  const entities = [observer, observed].filter((entry): entry is string => entry !== undefined)
  return {
    id,
    content,
    category: jsonString(item?.level) ?? 'insight',
    source: 'external',
    ...(createdAt === undefined ? {} : { createdAt }),
    ...(entities.length === 0 ? {} : { entities }),
  }
}

export class HonchoProvider extends HttpMemoryProvider implements MemoryProviderAdapter {
  readonly id = 'honcho' as const

  constructor(memoryBodies: MemoryBodyRegistry, options: HttpProviderOptions = {}) {
    super(memoryBodies, options)
  }

  async status(body: MemoryBody, signal?: AbortSignal): Promise<ProviderBodyStatus> {
    try {
      await this.list(body, { limit: 1 }, signal)
      return { healthy: true }
    } catch (error) {
      return { healthy: false, error: error instanceof Error ? error.message : String(error) }
    }
  }

  async search(body: MemoryBody, request: SearchRequest, signal?: AbortSignal): Promise<ProviderSearchResult> {
    const connection = this.connection(body)
    const payload = await this.request(body, `${this.basePath(connection)}/conclusions/query`, {
      headers: this.headers(connection),
      json: {
        query: request.query,
        top_k: Math.min(request.limit ?? 10, 100),
        filters: this.scope(connection),
      },
      signal,
    })
    return { results: firstArray(payload, 'items', 'results').map(insight).filter((item): item is Insight => item !== undefined) }
  }

  async list(body: MemoryBody, request: MemoryListRequest, signal?: AbortSignal): Promise<Insight[]> {
    const connection = this.connection(body)
    const limit = Math.min(Math.max(request.limit ?? 200, 1), 100)
    const payload = await this.request(body, `${this.basePath(connection)}/conclusions/list?page=1&size=${limit}`, {
      headers: this.headers(connection),
      json: {
        filters: {
          ...this.scope(connection),
          ...(request.category === undefined ? {} : { level: request.category }),
        },
      },
      signal,
    })
    return firstArray(payload, 'items', 'results').map(insight).filter((item): item is Insight => item !== undefined)
  }

  async remember(body: MemoryBody, request: RememberRequest, signal?: AbortSignal): Promise<JsonValue> {
    const connection = this.connection(body)
    const payload = await this.request(body, `${this.basePath(connection)}/conclusions`, {
      headers: this.headers(connection),
      json: {
        conclusions: [{
          content: request.content,
          observer_id: String(connection.agentId),
          observed_id: String(connection.userId),
          session_id: null,
        }],
      },
      signal,
    })
    const created = firstArray(payload, 'items', 'results').map(jsonObject).find(item => item !== undefined)
    return {
      action: 'stored',
      provider: this.id,
      summary: 'Honcho stored an explicit peer conclusion.',
      ...(jsonString(created?.id) === undefined ? {} : { id: jsonString(created?.id)! }),
    }
  }

  async forget(body: MemoryBody, id: string, signal?: AbortSignal): Promise<JsonValue> {
    const connection = this.connection(body)
    await this.request(body, `${this.basePath(connection)}/conclusions/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: this.headers(connection),
      signal,
    })
    return { action: 'deleted', provider: this.id, id }
  }

  private basePath(connection: Record<string, string | number | boolean>): string {
    return `/v3/workspaces/${encodeURIComponent(String(connection.workspace))}`
  }

  private scope(connection: Record<string, string | number | boolean>): Record<string, JsonValue> {
    return { observer_id: String(connection.agentId), observed_id: String(connection.userId) }
  }

  private headers(connection: Record<string, string | number | boolean>): HeadersInit {
    const token = String(connection.apiKey ?? '').replace(/^Bearer\s+/iu, '')
    return token === '' ? {} : { Authorization: `Bearer ${token}` }
  }
}
