import type { HostConnectionHandle, HostRpcHandler, RpcResult } from './contracts.ts'
import type { MnemonLifecycle } from './lifecycle.ts'
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
      code: 'mnemon-error',
      message: error instanceof Error ? error.message : String(error),
    },
  }
}

export function createReadHandler(service: MnemonService, lifecycle?: MnemonLifecycle): HostRpcHandler {
  return async (endpoint, rawPayload) => {
    try {
      const payload = object(rawPayload)
      switch (endpoint) {
        case 'status':
          return success({
            ...await service.status(),
            ...(lifecycle === undefined ? {} : {
              lifecycle: lifecycle.snapshot(payload.sessionId === undefined ? undefined : String(payload.sessionId)),
            }),
          })
        case 'graph':
          return success(await service.graph())
        case 'list':
          return success(await service.list({
            ...(payload.query === undefined ? {} : { query: String(payload.query) }),
            ...(payload.category === undefined ? {} : { category: payload.category as Category }),
            ...(payload.limit === undefined ? {} : { limit: Number(payload.limit) }),
          }))
        case 'entities':
          return success(await service.entities(
            payload.entity === undefined ? undefined : String(payload.entity),
            payload.limit === undefined ? undefined : Number(payload.limit),
          ))
        case 'search':
          return success(await service.search({
            query: String(payload.query ?? ''),
            ...(payload.mode === undefined ? {} : { mode: payload.mode as NonNullable<SearchRequest['mode']> }),
            ...(payload.limit === undefined ? {} : { limit: Number(payload.limit) }),
            ...(payload.category === undefined ? {} : { category: payload.category as Category }),
            ...(payload.source === undefined ? {} : { source: payload.source as Source }),
            ...(payload.intent === undefined ? {} : { intent: payload.intent as Intent }),
          }))
        case 'related':
          return success(await service.related(
            String(payload.id ?? ''),
            payload.depth === undefined ? 2 : Number(payload.depth),
            payload.edge as EdgeType | undefined,
          ))
        default:
          return { ok: false, error: { code: 'not-found', message: `unknown read endpoint: ${endpoint}` } }
      }
    } catch (error) {
      return failure(error)
    }
  }
}

export function createWriteHandler(service: MnemonService, lifecycle?: MnemonLifecycle): HostRpcHandler {
  return async (endpoint, rawPayload) => {
    try {
      const payload = object(rawPayload)
      switch (endpoint) {
        case 'supervise':
          if (lifecycle === undefined) throw new Error('Mnemon lifecycle integration is unavailable')
          return success(lifecycle.supervise(String(payload.sessionId ?? ''), String(payload.content ?? '')))
        case 'remember':
          return success(await service.remember({
            content: String(payload.content ?? ''),
            ...(payload.category === undefined ? {} : { category: payload.category as Category }),
            ...(payload.importance === undefined ? {} : { importance: Number(payload.importance) }),
            ...(Array.isArray(payload.tags) ? { tags: payload.tags.map(String) } : {}),
            ...(Array.isArray(payload.entities) ? { entities: payload.entities.map(String) } : {}),
            source: 'user',
          }))
        case 'link':
          return success(await service.link(
            String(payload.sourceId ?? ''),
            String(payload.targetId ?? ''),
            payload.type as EdgeType | undefined,
            payload.weight === undefined ? 0.5 : Number(payload.weight),
            payload.reason === undefined ? undefined : String(payload.reason),
          ))
        case 'forget':
          return success(await service.forget(String(payload.id ?? '')))
        default:
          return { ok: false, error: { code: 'not-found', message: `unknown write endpoint: ${endpoint}` } }
      }
    } catch (error) {
      return failure(error)
    }
  }
}

/** Read operations are available to trusted Web hosts; local mutations stay loopback-only. */
export function registerRpc(connection: HostConnectionHandle, service: MnemonService, lifecycle?: MnemonLifecycle): void {
  connection.rpc.handle(MNEMON_READ_CHANNEL, createReadHandler(service, lifecycle), { authority: 'trusted-host' })
  if (service.config.writeEnabled) {
    connection.rpc.handle(MNEMON_WRITE_CHANNEL, createWriteHandler(service, lifecycle), { authority: 'loopback' })
  }
}
