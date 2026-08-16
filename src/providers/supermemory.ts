import type { JsonValue } from '../contracts.ts'
import type { MemoryBodyRegistry } from '../memory-bodies.ts'
import type { Insight, MemoryBody, MemoryListRequest, RememberRequest, SearchRequest } from '../shared/contracts.ts'
import { HttpMemoryProvider, firstArray, jsonNumber, jsonObject, jsonString, type HttpProviderOptions } from './http.ts'
import type { MemoryProviderAdapter, ProviderBodyStatus, ProviderSearchResult } from './provider.ts'

function insight(value: unknown): Insight | undefined {
  const item = jsonObject(value)
  const id = jsonString(item?.id)
  const content = jsonString(item?.memory) ?? jsonString(item?.chunk) ?? jsonString(item?.content)
  if (id === undefined || content === undefined) return undefined
  const metadata = jsonObject(item?.metadata)
  const score = jsonNumber(item?.similarity) ?? jsonNumber(item?.score)
  const createdAt = jsonString(item?.updatedAt) ?? jsonString(item?.createdAt)
  return {
    id,
    content,
    category: jsonString(metadata?.category) ?? 'general',
    source: 'external',
    ...(score === undefined ? {} : { score }),
    ...(createdAt === undefined ? {} : { createdAt }),
  }
}

export class SupermemoryProvider extends HttpMemoryProvider implements MemoryProviderAdapter {
  readonly id = 'supermemory' as const

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
    const payload = await this.request(body, '/v4/search', {
      headers: this.headers(connection),
      json: {
        q: request.query,
        containerTag: String(connection.containerTag),
        searchMode: String(connection.searchMode ?? 'hybrid'),
        limit: request.limit ?? 10,
      },
      signal,
    })
    return { results: firstArray(payload, 'results').map(insight).filter((item): item is Insight => item !== undefined) }
  }

  async list(body: MemoryBody, request: MemoryListRequest, signal?: AbortSignal): Promise<Insight[]> {
    const connection = this.connection(body)
    const payload = await this.request(body, '/v4/memories/list', {
      headers: this.headers(connection),
      json: {
        containerTags: [String(connection.containerTag)],
        limit: Math.min(Math.max(request.limit ?? 200, 1), 200),
        page: 1,
        sort: 'createdAt',
        order: 'desc',
      },
      signal,
    })
    const memories = firstArray(payload, 'memoryEntries', 'results').map(insight).filter((item): item is Insight => item !== undefined)
    if (memories.length > 0) return memories.filter(item => request.category === undefined || item.category === request.category)

    // Supermemory Lite may retain ingested documents without extracting a
    // separate memory entry. Those documents are still valid browseable
    // content, so fall back to the same document projection used by its MCP.
    const documents = await this.request(body, '/v3/documents/documents', {
      headers: this.headers(connection),
      json: {
        containerTags: [String(connection.containerTag)],
        limit: Math.min(Math.max(request.limit ?? 200, 1), 200),
        page: 1,
        sort: 'createdAt',
        order: 'desc',
      },
      signal,
    })
    return firstArray(documents, 'documents', 'memories', 'results').map(insight).filter((item): item is Insight => item !== undefined)
      .filter(item => request.category === undefined || item.category === request.category)
  }

  async remember(body: MemoryBody, request: RememberRequest, signal?: AbortSignal): Promise<JsonValue> {
    const connection = this.connection(body)
    const payload = await this.request(body, '/v3/documents', {
      headers: this.headers(connection),
      json: {
        content: request.content,
        containerTag: String(connection.containerTag),
        taskType: 'memory',
        metadata: {
          sm_source: 'dsh-mnemon',
          ...(request.category === undefined ? {} : { category: request.category }),
          ...(request.importance === undefined ? {} : { importance: request.importance }),
        },
      },
      signal,
    })
    const result = jsonObject(payload) ?? {}
    return {
      action: 'stored',
      provider: this.id,
      summary: 'Supermemory accepted the memory document for extraction.',
      ...(jsonString(result.id) === undefined ? {} : { id: jsonString(result.id)! }),
      ...(jsonString(result.status) === undefined ? {} : { status: jsonString(result.status)! }),
    }
  }

  async forget(body: MemoryBody, id: string, signal?: AbortSignal): Promise<JsonValue> {
    const connection = this.connection(body)
    try {
      const payload = await this.request(body, '/v4/memories', {
        method: 'DELETE',
        headers: this.headers(connection),
        json: { id, containerTag: String(connection.containerTag), reason: 'Deleted from dsh-mnemon' },
        signal,
      })
      return {
        action: 'deleted',
        provider: this.id,
        id,
        ...(jsonObject(payload)?.forgotten === undefined ? {} : { forgotten: jsonObject(payload)!.forgotten as JsonValue }),
      }
    } catch (error) {
      if (!(error instanceof Error) || !/HTTP 404\b/u.test(error.message)) throw error
      await this.request(body, `/v3/documents/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: this.headers(connection),
        signal,
      })
      return { action: 'deleted', provider: this.id, id, document: true }
    }
  }

  private headers(connection: Record<string, string | number | boolean>): HeadersInit {
    const token = String(connection.apiKey ?? '').replace(/^Bearer\s+/iu, '')
    return { Authorization: `Bearer ${token}`, 'x-sm-source': 'dsh-mnemon' }
  }
}
