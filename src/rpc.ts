import type { HostConnectionHandle, HostRpcHandler, RpcResult } from './contracts.ts'
import type { MnemonLifecycle } from './lifecycle.ts'
import type { RuntimeMemoryController, RuntimeMemoryImportance, RuntimeMemoryTarget } from './runtime-memory.ts'
import type { Category, EdgeType, Intent, MnemonService, SearchRequest, Source } from './service.ts'

export const MNEMON_READ_CHANNEL = '/dsh-mnemon-read'
export const MNEMON_WRITE_CHANNEL = '/dsh-mnemon-write'

function object(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error('payload must be an object')
  return value as Record<string, unknown>
}

function success(value: unknown): RpcResult<unknown> {
  return { ok: true, value }
}

function failure(error: unknown): RpcResult<unknown> {
  return {
    ok: false,
    error: {
      code: 'internal',
      message: error instanceof Error ? error.message : String(error),
      details: {},
    },
  }
}

function badRequest(message: string): RpcResult<unknown> {
  return { ok: false, error: { code: 'bad-request', message, details: { issues: [] } } }
}

export function createReadHandler(service: MnemonService, lifecycle?: MnemonLifecycle, runtimeMemory?: RuntimeMemoryController): HostRpcHandler {
  return async (endpoint, rawPayload) => {
    try {
      const payload = object(rawPayload)
      switch (endpoint) {
        case 'runtime-memory':
          if (runtimeMemory === undefined) throw new Error('runtime memory is unavailable')
          return success(runtimeMemory.snapshot())
        case 'status':
          return success({
            ...await service.status(),
            ...(lifecycle === undefined ? {} : {
              lifecycle: lifecycle.snapshot(payload.sessionId === undefined ? undefined : String(payload.sessionId)),
            }),
          })
        case 'graph':
          return success(await service.graph(undefined, Array.isArray(payload.memoryBodyIds) ? payload.memoryBodyIds.map(String) : undefined))
        case 'bodies':
          return success(await service.bodies())
        case 'list':
          return success(await service.list({
            ...(payload.query === undefined ? {} : { query: String(payload.query) }),
            ...(payload.category === undefined ? {} : { category: payload.category as Category }),
            ...(payload.limit === undefined ? {} : { limit: Number(payload.limit) }),
            ...(Array.isArray(payload.memoryBodyIds) ? { memoryBodyIds: payload.memoryBodyIds.map(String) } : {}),
          }))
        case 'entities':
          {
            const entity = payload.entity === undefined ? '' : String(payload.entity).trim()
            const limit = payload.limit === undefined ? undefined : Number(payload.limit)
            return success(await service.entities(entity || undefined, limit))
          }
        case 'search':
          {
            const request = {
            query: String(payload.query ?? ''),
            ...(payload.mode === undefined ? {} : { mode: payload.mode as NonNullable<SearchRequest['mode']> }),
            ...(payload.limit === undefined ? {} : { limit: Number(payload.limit) }),
            ...(payload.category === undefined ? {} : { category: payload.category as Category }),
            ...(payload.source === undefined ? {} : { source: payload.source as Source }),
            ...(payload.intent === undefined ? {} : { intent: payload.intent as Intent }),
            ...(Array.isArray(payload.memoryBodyIds) ? { memoryBodyIds: payload.memoryBodyIds.map(String) } : {}),
            }
            return success(await service.search(request))
          }
        case 'agent-search':
          {
            if (lifecycle === undefined) throw new Error('Mnemon Agent query is unavailable without lifecycle integration')
            const request = {
              query: String(payload.query ?? ''),
              ...(payload.mode === undefined ? {} : { mode: payload.mode as NonNullable<SearchRequest['mode']> }),
              ...(payload.limit === undefined ? {} : { limit: Number(payload.limit) }),
              ...(payload.category === undefined ? {} : { category: payload.category as Category }),
              ...(payload.source === undefined ? {} : { source: payload.source as Source }),
              ...(payload.intent === undefined ? {} : { intent: payload.intent as Intent }),
              ...(Array.isArray(payload.memoryBodyIds) ? { memoryBodyIds: payload.memoryBodyIds.map(String) } : {}),
            }
            const recalled = await service.search(request)
            const answer = await lifecycle.answer(String(payload.sessionId ?? ''), request.query, recalled.results)
            return success({ ...recalled, ...answer })
          }
        case 'related':
          return success(await service.related(String(payload.id ?? ''), payload.depth === undefined ? 2 : Number(payload.depth), payload.edge as EdgeType | undefined, undefined, payload.memoryBodyId === undefined ? undefined : String(payload.memoryBodyId)))
        default:
          return badRequest(`unknown read endpoint: ${endpoint}`)
      }
    } catch (error) {
      return failure(error)
    }
  }
}

export function createWriteHandler(service: MnemonService, lifecycle?: MnemonLifecycle, runtimeMemory?: RuntimeMemoryController): HostRpcHandler {
  return async (endpoint, rawPayload) => {
    try {
      const payload = object(rawPayload)
      switch (endpoint) {
        case 'runtime-memory':
          if (runtimeMemory === undefined) throw new Error('runtime memory is unavailable')
          {
            const request = {
            action: String(payload.action ?? '') as 'add' | 'replace' | 'remove',
            target: String(payload.target ?? '') as RuntimeMemoryTarget,
            ...(payload.content === undefined ? {} : { content: String(payload.content) }),
            ...(payload.old_text === undefined ? {} : { oldText: String(payload.old_text) }),
            ...(payload.importance === undefined ? {} : { importance: String(payload.importance) as RuntimeMemoryImportance }),
            }
            const sessionId = String(payload.sessionId ?? '').trim()
            return success(lifecycle === undefined || sessionId === '' ? await runtimeMemory.mutate(request) : await lifecycle.runtime(sessionId, request))
          }
        case 'supervise':
          if (lifecycle === undefined) throw new Error('Mnemon lifecycle integration is unavailable')
          return success(await lifecycle.supervise(String(payload.sessionId ?? ''), String(payload.content ?? '')))
        case 'remember':
          {
            const request = {
            content: String(payload.content ?? ''),
            ...(payload.category === undefined ? {} : { category: payload.category as Category }),
            ...(payload.importance === undefined ? {} : { importance: Number(payload.importance) }),
            ...(Array.isArray(payload.tags) ? { tags: payload.tags.map(String) } : {}),
            ...(Array.isArray(payload.entities) ? { entities: payload.entities.map(String) } : {}),
            ...(payload.memoryBodyId === undefined ? {} : { memoryBodyId: String(payload.memoryBodyId) }),
            source: 'user',
            } as const
            return success(lifecycle === undefined
              ? await service.remember(request)
              : await lifecycle.remember(String(payload.sessionId ?? ''), request))
          }
        case 'link':
          return success(lifecycle === undefined
            ? await service.link(String(payload.sourceId ?? ''), String(payload.targetId ?? ''), payload.type as EdgeType | undefined, payload.weight === undefined ? 0.5 : Number(payload.weight), payload.reason === undefined ? undefined : String(payload.reason), undefined, payload.memoryBodyId === undefined ? undefined : String(payload.memoryBodyId))
            : await lifecycle.mutate(String(payload.sessionId ?? ''), 'link', payload))
        case 'forget':
          return success(lifecycle === undefined
            ? await service.forget(String(payload.id ?? ''), undefined, payload.memoryBodyId === undefined ? undefined : String(payload.memoryBodyId))
            : await lifecycle.mutate(String(payload.sessionId ?? ''), 'forget', { id: String(payload.id ?? ''), ...(payload.memoryBodyId === undefined ? {} : { memoryBodyId: String(payload.memoryBodyId) }) }))
        case 'body-create':
          return success(await service.createBody({
            name: String(payload.name ?? ''),
            description: String(payload.description ?? ''),
            ...(payload.active === undefined ? {} : { active: Boolean(payload.active) }),
          }))
        case 'body-update':
          return success(service.updateBody(String(payload.memoryBodyId ?? ''), {
            ...(payload.name === undefined ? {} : { name: String(payload.name) }),
            ...(payload.description === undefined ? {} : { description: String(payload.description) }),
            ...(payload.active === undefined ? {} : { active: Boolean(payload.active) }),
          }))
        default:
          return badRequest(`unknown write endpoint: ${endpoint}`)
      }
    } catch (error) {
      return failure(error)
    }
  }
}

/** Read operations are available to trusted Web hosts; local mutations stay loopback-only. */
export function registerRpc(connection: HostConnectionHandle, service: MnemonService, lifecycle?: MnemonLifecycle, runtimeMemory?: RuntimeMemoryController): void {
  connection.rpc.handle(MNEMON_READ_CHANNEL, createReadHandler(service, lifecycle, runtimeMemory), { authority: 'trusted-host' })
  if (service.config.writeEnabled) {
    connection.rpc.handle(MNEMON_WRITE_CHANNEL, createWriteHandler(service, lifecycle, runtimeMemory), { authority: 'loopback' })
  }
}
