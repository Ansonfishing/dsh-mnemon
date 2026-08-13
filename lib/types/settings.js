export const MNEMON_SETTINGS_CHANNEL = '/dsh-mnemon-settings';
export const MNEMON_SETTINGS_NAMESPACE = 'mnemon';
function success(value) {
    return { ok: true, value };
}
function failure(error) {
    return {
        ok: false,
        error: {
            code: 'settings-rejected',
            message: error instanceof Error ? error.message : String(error),
            details: { ns: MNEMON_SETTINGS_NAMESPACE },
        },
    };
}
function badRequest(message) {
    return { ok: false, error: { code: 'bad-request', message, details: { issues: [] } } };
}
function descriptor(settings) {
    const view = settings.describe({ redactSecrets: true }).find(candidate => candidate.ns === MNEMON_SETTINGS_NAMESPACE);
    if (view === undefined)
        throw new Error('Mnemon settings namespace is unavailable');
    return {
        status: 'ready',
        value: view.value,
        base: view.base,
        user: view.user,
        revision: view.revision,
        writable: settings.writable,
        mode: 'host',
        applies: view.applies,
    };
}
function object(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value))
        throw new Error('payload must be an object');
    return value;
}
export function createSettingsHandler(settings) {
    return async (endpoint, rawPayload) => {
        try {
            if (endpoint === 'get')
                return success(descriptor(settings));
            if (endpoint !== 'mutate')
                return badRequest(`unknown settings endpoint: ${endpoint}`);
            if (!settings.writable)
                throw new Error('DSH settings are read-only');
            const payload = object(rawPayload);
            if (!Array.isArray(payload.ops) || payload.ops.length === 0 || payload.ops.length > 16)
                throw new Error('ops must contain 1..16 settings edits');
            const ops = payload.ops.map((raw) => {
                const op = object(raw);
                const field = Array.isArray(op.path) && op.path.length === 1 ? String(op.path[0]) : '';
                if (!['cliPath', 'dataDir', 'store', 'timeoutMs', 'defaultRecallLimit', 'routingGuidance', 'lifecycleEnabled', 'recallMode', 'writebackMode', 'idleReviewMs', 'tabEnabled', 'writeEnabled'].includes(field)) {
                    throw new Error(`unsupported Mnemon settings field: ${field}`);
                }
                if (op.op === 'unset')
                    return { op: 'unset', path: [field] };
                if (op.op !== 'set')
                    throw new Error(`unsupported settings operation: ${String(op.op)}`);
                return { op: 'set', path: [field], value: op.value };
            });
            const revision = payload.expectedRevision === undefined ? undefined : Number(payload.expectedRevision);
            await settings.mutate(MNEMON_SETTINGS_NAMESPACE, ops, revision);
            return success(descriptor(settings));
        }
        catch (error) {
            return failure(error);
        }
    };
}
export function registerSettingsRpc(connection, settings) {
    connection.rpc.handle(MNEMON_SETTINGS_CHANNEL, createSettingsHandler(settings), { authority: 'loopback' });
}
//# sourceMappingURL=settings.js.map