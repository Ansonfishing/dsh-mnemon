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
export function createReadHandler(service, lifecycle) {
    return async (endpoint, rawPayload) => {
        try {
            const payload = object(rawPayload);
            switch (endpoint) {
                case 'status':
                    return success({
                        ...await service.status(),
                        ...(lifecycle === undefined ? {} : {
                            lifecycle: lifecycle.snapshot(payload.sessionId === undefined ? undefined : String(payload.sessionId)),
                        }),
                    });
                case 'graph':
                    return success(await service.graph(undefined, Array.isArray(payload.memoryBodyIds) ? payload.memoryBodyIds.map(String) : undefined));
                case 'bodies':
                    return success(await service.bodies());
                case 'list':
                    return success(await service.list({
                        ...(payload.query === undefined ? {} : { query: String(payload.query) }),
                        ...(payload.category === undefined ? {} : { category: payload.category }),
                        ...(payload.limit === undefined ? {} : { limit: Number(payload.limit) }),
                        ...(Array.isArray(payload.memoryBodyIds) ? { memoryBodyIds: payload.memoryBodyIds.map(String) } : {}),
                    }));
                case 'entities':
                    {
                        const entity = payload.entity === undefined ? '' : String(payload.entity).trim();
                        const limit = payload.limit === undefined ? undefined : Number(payload.limit);
                        if (entity === '' || lifecycle === undefined)
                            return success(await service.entities(entity || undefined, limit));
                        const base = await service.entities();
                        const recalled = await lifecycle.recall(String(payload.sessionId ?? ''), { query: entity, intent: 'ENTITY', ...(limit === undefined ? {} : { limit }) });
                        return success({ items: base.items, selected: entity, insights: recalled.results });
                    }
                case 'search':
                    {
                        const request = {
                            query: String(payload.query ?? ''),
                            ...(payload.mode === undefined ? {} : { mode: payload.mode }),
                            ...(payload.limit === undefined ? {} : { limit: Number(payload.limit) }),
                            ...(payload.category === undefined ? {} : { category: payload.category }),
                            ...(payload.source === undefined ? {} : { source: payload.source }),
                            ...(payload.intent === undefined ? {} : { intent: payload.intent }),
                            ...(Array.isArray(payload.memoryBodyIds) ? { memoryBodyIds: payload.memoryBodyIds.map(String) } : {}),
                        };
                        return success(lifecycle === undefined
                            ? await service.search(request)
                            : await lifecycle.recall(String(payload.sessionId ?? ''), request));
                    }
                case 'related':
                    return success(lifecycle === undefined
                        ? await service.related(String(payload.id ?? ''), payload.depth === undefined ? 2 : Number(payload.depth), payload.edge, undefined, payload.memoryBodyId === undefined ? undefined : String(payload.memoryBodyId))
                        : (await lifecycle.related(String(payload.sessionId ?? ''), String(payload.id ?? ''), payload.memoryBodyId === undefined ? undefined : String(payload.memoryBodyId))).results);
                default:
                    return { ok: false, error: { code: 'not-found', message: `unknown read endpoint: ${endpoint}` } };
            }
        }
        catch (error) {
            return failure(error);
        }
    };
}
export function createWriteHandler(service, lifecycle) {
    return async (endpoint, rawPayload) => {
        try {
            const payload = object(rawPayload);
            switch (endpoint) {
                case 'supervise':
                    if (lifecycle === undefined)
                        throw new Error('Mnemon lifecycle integration is unavailable');
                    return success(await lifecycle.supervise(String(payload.sessionId ?? ''), String(payload.content ?? '')));
                case 'remember':
                    {
                        const request = {
                            content: String(payload.content ?? ''),
                            ...(payload.category === undefined ? {} : { category: payload.category }),
                            ...(payload.importance === undefined ? {} : { importance: Number(payload.importance) }),
                            ...(Array.isArray(payload.tags) ? { tags: payload.tags.map(String) } : {}),
                            ...(Array.isArray(payload.entities) ? { entities: payload.entities.map(String) } : {}),
                            ...(payload.memoryBodyId === undefined ? {} : { memoryBodyId: String(payload.memoryBodyId) }),
                            source: 'user',
                        };
                        return success(lifecycle === undefined
                            ? await service.remember(request)
                            : await lifecycle.remember(String(payload.sessionId ?? ''), request));
                    }
                case 'link':
                    return success(lifecycle === undefined
                        ? await service.link(String(payload.sourceId ?? ''), String(payload.targetId ?? ''), payload.type, payload.weight === undefined ? 0.5 : Number(payload.weight), payload.reason === undefined ? undefined : String(payload.reason), undefined, payload.memoryBodyId === undefined ? undefined : String(payload.memoryBodyId))
                        : await lifecycle.mutate(String(payload.sessionId ?? ''), 'link', payload));
                case 'forget':
                    return success(lifecycle === undefined
                        ? await service.forget(String(payload.id ?? ''), undefined, payload.memoryBodyId === undefined ? undefined : String(payload.memoryBodyId))
                        : await lifecycle.mutate(String(payload.sessionId ?? ''), 'forget', { id: String(payload.id ?? ''), ...(payload.memoryBodyId === undefined ? {} : { memoryBodyId: String(payload.memoryBodyId) }) }));
                case 'body-create':
                    return success(await service.createBody({
                        ...(payload.id === undefined ? {} : { id: String(payload.id) }),
                        name: String(payload.name ?? ''),
                        ...(payload.description === undefined ? {} : { description: String(payload.description) }),
                        ...(payload.active === undefined ? {} : { active: Boolean(payload.active) }),
                    }));
                case 'body-update':
                    return success(service.updateBody(String(payload.memoryBodyId ?? ''), {
                        ...(payload.name === undefined ? {} : { name: String(payload.name) }),
                        ...(payload.description === undefined ? {} : { description: String(payload.description) }),
                        ...(payload.active === undefined ? {} : { active: Boolean(payload.active) }),
                    }));
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
export function registerRpc(connection, service, lifecycle) {
    connection.rpc.handle(MNEMON_READ_CHANNEL, createReadHandler(service, lifecycle), { authority: 'trusted-host' });
    if (service.config.writeEnabled) {
        connection.rpc.handle(MNEMON_WRITE_CHANNEL, createWriteHandler(service, lifecycle), { authority: 'loopback' });
    }
}
//# sourceMappingURL=rpc.js.map