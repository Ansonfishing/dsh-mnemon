import type { JsonValue } from '../contracts.ts'
import type {
  EdgeType,
  Insight,
  MemoryBody,
  MemoryBodyStats,
  MemoryGraphSnapshot,
  MemoryListRequest,
  RememberRequest,
  SearchRequest,
} from '../shared/contracts.ts'

export interface ProviderBodyStatus {
  healthy: boolean
  error?: string
  stats?: MemoryBodyStats
}

export interface ProviderSearchResult {
  results: Insight[]
  hint?: string
}

/**
 * Third-layer memory data plane. DSH owns routing and lifecycle; adapters own
 * only one body's persistence and retrieval semantics.
 */
export interface MemoryProviderAdapter {
  readonly id: MemoryBody['provider']['id']
  status(body: MemoryBody, signal?: AbortSignal): Promise<ProviderBodyStatus>
  search(body: MemoryBody, request: SearchRequest, signal?: AbortSignal): Promise<ProviderSearchResult>
  graph(body: MemoryBody, signal?: AbortSignal): Promise<MemoryGraphSnapshot>
  list(body: MemoryBody, request: MemoryListRequest, signal?: AbortSignal): Promise<Insight[]>
  remember(body: MemoryBody, request: RememberRequest, signal?: AbortSignal): Promise<JsonValue>
  related?(body: MemoryBody, id: string, depth: number, edge?: EdgeType, signal?: AbortSignal): Promise<Insight[]>
  link?(body: MemoryBody, sourceId: string, targetId: string, type: EdgeType, weight: number, reason?: string, signal?: AbortSignal): Promise<JsonValue>
  forget?(body: MemoryBody, id: string, signal?: AbortSignal): Promise<JsonValue>
}
