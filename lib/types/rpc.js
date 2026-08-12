export const MNEMON_READ_CHANNEL = '/dsh-mnemon-read';
export const MNEMON_WRITE_CHANNEL = '/dsh-mnemon-write';
function object(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value))
        throw new Error('payload must be an object');
    return value;
}
function success(value) {
    return { ok: true, value };
}
function failure(error) {
    return {
        ok: false,
        error: {
            code: 'mnemon-error',
            message: error instanceof Error ? error.message : String(error),
        },
    };
}
export function createReadHandler(service) {
    return async (endpoint, rawPayload) => {
        try {
            const payload = object(rawPayload);
            switch (endpoint) {
                case 'status':
                    return success(await service.status());
                case 'search':
                    return success(await service.search({
                        query: String(payload.query ?? ''),
                        ...(payload.mode === undefined ? {} : { mode: payload.mode }),
                        ...(payload.limit === undefined ? {} : { limit: Number(payload.limit) }),
                        ...(payload.category === undefined ? {} : { category: payload.category }),
                        ...(payload.source === undefined ? {} : { source: payload.source }),
                        ...(payload.intent === undefined ? {} : { intent: payload.intent }),
                    }));
                case 'related':
                    return success(await service.related(String(payload.id ?? ''), payload.depth === undefined ? 2 : Number(payload.depth), payload.edge));
                default:
                    return { ok: false, error: { code: 'not-found', message: `unknown read endpoint: ${endpoint}` } };
            }
        }
        catch (error) {
            return failure(error);
        }
    };
}
export function createWriteHandler(service) {
    return async (endpoint, rawPayload) => {
        try {
            const payload = object(rawPayload);
            switch (endpoint) {
                case 'remember':
                    return success(await service.remember({
                        content: String(payload.content ?? ''),
                        ...(payload.category === undefined ? {} : { category: payload.category }),
                        ...(payload.importance === undefined ? {} : { importance: Number(payload.importance) }),
                        ...(Array.isArray(payload.tags) ? { tags: payload.tags.map(String) } : {}),
                        ...(Array.isArray(payload.entities) ? { entities: payload.entities.map(String) } : {}),
                        source: 'user',
                    }));
                case 'link':
                    return success(await service.link(String(payload.sourceId ?? ''), String(payload.targetId ?? ''), payload.type, payload.weight === undefined ? 0.5 : Number(payload.weight), payload.reason === undefined ? undefined : String(payload.reason)));
                case 'forget':
                    return success(await service.forget(String(payload.id ?? '')));
                default:
                    return { ok: false, error: { code: 'not-found', message: `unknown write endpoint: ${endpoint}` } };
            }
        }
        catch (error) {
            return failure(error);
        }
    };
}
/** Read operations are available to trusted Web hosts; local mutations stay loopback-only. */
export function registerRpc(connection, service) {
    connection.rpc.handle(MNEMON_READ_CHANNEL, createReadHandler(service), { authority: 'trusted-host' });
    if (service.config.writeEnabled) {
        connection.rpc.handle(MNEMON_WRITE_CHANNEL, createWriteHandler(service), { authority: 'loopback' });
    }
}
//# sourceMappingURL=rpc.js.map