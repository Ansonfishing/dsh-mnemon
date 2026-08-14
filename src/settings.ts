import type { HostConnectionHandle, HostRpcHandler, HostSettingsService, RpcResult } from './contracts.ts'

export const MNEMON_SETTINGS_CHANNEL = '/dsh-mnemon-settings'
export const MNEMON_SETTINGS_NAMESPACE = 'mnemon'

function success(value: unknown): RpcResult<unknown> {
  return { ok: true, value }
}

function failure(error: unknown): RpcResult<unknown> {
  return {
    ok: false,
    error: {
      code: 'settings-rejected',
      message: error instanceof Error ? error.message : String(error),
      details: { ns: MNEMON_SETTINGS_NAMESPACE },
    },
  }
}

function badRequest(message: string): RpcResult<unknown> {
  return { ok: false, error: { code: 'bad-request', message, details: { issues: [] } } }
}

function descriptor(settings: HostSettingsService) {
  const view = settings.describe({ redactSecrets: true }).find(candidate => candidate.ns === MNEMON_SETTINGS_NAMESPACE)
  if (view === undefined) throw new Error('Mnemon settings namespace is unavailable')
  return {
    status: 'ready' as const,
    value: view.value,
    base: view.base,
    user: view.user,
    revision: view.revision,
    writable: settings.writable,
    mode: 'host' as const,
    applies: view.applies,
  }
}

function object(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error('payload must be an object')
  return value as Record<string, unknown>
}

const MUTABLE_FIELDS = [
  'storageScope', 'cliPath', 'dataDir', 'store', 'timeoutMs', 'defaultRecallLimit',
  'routingGuidance', 'lifecycleEnabled', 'recallMode', 'writebackMode', 'idleReviewMs',
  'tabEnabled', 'writeEnabled',
]

/** Nested paths of the live in-conversation interaction toggles. */
const INTERACTION_PATHS: string[][] = [
  ['conversationInteraction', 'toolviews'],
  ['conversationInteraction', 'turnBar'],
  ['conversationInteraction', 'saveAction'],
]

/** Whether one mutation path targets a supported Mnemon settings field. */
function mutablePath(path: string[]): boolean {
  if (path.length === 1) return MUTABLE_FIELDS.includes(path[0]!)
  return INTERACTION_PATHS.some(allowed => allowed.length === path.length && allowed.every((segment, index) => segment === path[index]))
}

export function createSettingsHandler(settings: HostSettingsService): HostRpcHandler {
  return async (endpoint, rawPayload) => {
    try {
      if (endpoint === 'get') return success(descriptor(settings))
      if (endpoint !== 'mutate') return badRequest(`unknown settings endpoint: ${endpoint}`)
      if (!settings.writable) throw new Error('DSH settings are read-only')
      const payload = object(rawPayload)
      if (!Array.isArray(payload.ops) || payload.ops.length === 0 || payload.ops.length > 16) throw new Error('ops must contain 1..16 settings edits')
      const ops = payload.ops.map((raw) => {
        const op = object(raw)
        const path = Array.isArray(op.path) && op.path.length > 0 ? op.path.map(segment => String(segment)) : []
        if (!mutablePath(path)) throw new Error(`unsupported Mnemon settings field: ${path.join('.')}`)
        if (op.op === 'unset') return { op: 'unset' as const, path }
        if (op.op !== 'set') throw new Error(`unsupported settings operation: ${String(op.op)}`)
        return { op: 'set' as const, path, value: op.value }
      })
      const revision = payload.expectedRevision === undefined ? undefined : Number(payload.expectedRevision)
      await settings.mutate(MNEMON_SETTINGS_NAMESPACE, ops, revision)
      return success(descriptor(settings))
    } catch (error) {
      return failure(error)
    }
  }
}

export function registerSettingsRpc(connection: HostConnectionHandle, settings: HostSettingsService): void {
  connection.rpc.handle(MNEMON_SETTINGS_CHANNEL, createSettingsHandler(settings), { authority: 'loopback' })
}
