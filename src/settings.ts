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
      code: 'mnemon-settings-error',
      message: error instanceof Error ? error.message : String(error),
    },
  }
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

export function createSettingsHandler(settings: HostSettingsService): HostRpcHandler {
  return async (endpoint, rawPayload) => {
    try {
      if (endpoint === 'get') return success(descriptor(settings))
      if (endpoint !== 'mutate') return { ok: false, error: { code: 'not-found', message: `unknown settings endpoint: ${endpoint}` } }
      if (!settings.writable) throw new Error('DSH settings are read-only')
      const payload = object(rawPayload)
      if (!Array.isArray(payload.ops) || payload.ops.length === 0 || payload.ops.length > 16) throw new Error('ops must contain 1..16 settings edits')
      const ops = payload.ops.map((raw) => {
        const op = object(raw)
        const field = Array.isArray(op.path) && op.path.length === 1 ? String(op.path[0]) : ''
        if (!['cliPath', 'dataDir', 'store', 'timeoutMs', 'defaultRecallLimit', 'routingGuidance', 'lifecycleEnabled', 'recallMode', 'writebackMode', 'tabEnabled', 'writeEnabled'].includes(field)) {
          throw new Error(`unsupported Mnemon settings field: ${field}`)
        }
        if (op.op === 'unset') return { op: 'unset' as const, path: [field] }
        if (op.op !== 'set') throw new Error(`unsupported settings operation: ${String(op.op)}`)
        return { op: 'set' as const, path: [field], value: op.value }
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
