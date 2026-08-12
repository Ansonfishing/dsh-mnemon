import { MNEMON_READ_CHANNEL, MNEMON_WRITE_CHANNEL } from "../rpc.js";
export class MnemonClient {
    connection;
    sessionId;
    constructor(connection, sessionId) {
        this.connection = connection;
        this.sessionId = sessionId;
    }
    async call(channel, endpoint, payload) {
        const response = await this.connection.rpc.call(channel, endpoint, payload);
        if (!response.ok)
            throw new Error(response.error.message);
        return response.value;
    }
    status() {
        return this.call(MNEMON_READ_CHANNEL, 'status', this.sessionId === undefined ? {} : { sessionId: this.sessionId });
    }
    bodies() {
        return this.call(MNEMON_READ_CHANNEL, 'bodies', {});
    }
    graph(memoryBodyIds) {
        return this.call(MNEMON_READ_CHANNEL, 'graph', memoryBodyIds === undefined ? {} : { memoryBodyIds });
    }
    list(request = {}) {
        return this.call(MNEMON_READ_CHANNEL, 'list', request);
    }
    entities(entity, limit) {
        return this.call(MNEMON_READ_CHANNEL, 'entities', {
            sessionId: this.sessionId,
            ...(entity === undefined ? {} : { entity }),
            ...(limit === undefined ? {} : { limit }),
        });
    }
    search(request) {
        return this.call(MNEMON_READ_CHANNEL, 'search', { ...request, sessionId: this.sessionId });
    }
    related(id, memoryBodyId) {
        return this.call(MNEMON_READ_CHANNEL, 'related', { id, depth: 2, sessionId: this.sessionId, ...(memoryBodyId === undefined ? {} : { memoryBodyId }) });
    }
    remember(request) {
        return this.call(MNEMON_WRITE_CHANNEL, 'remember', { ...request, sessionId: this.sessionId });
    }
    supervise(content) {
        return this.call(MNEMON_WRITE_CHANNEL, 'supervise', { sessionId: this.sessionId, content });
    }
    forget(id, memoryBodyId) {
        return this.call(MNEMON_WRITE_CHANNEL, 'forget', { id, sessionId: this.sessionId, ...(memoryBodyId === undefined ? {} : { memoryBodyId }) });
    }
    createBody(request) {
        return this.call(MNEMON_WRITE_CHANNEL, 'body-create', request);
    }
    updateBody(memoryBodyId, request) {
        return this.call(MNEMON_WRITE_CHANNEL, 'body-update', { memoryBodyId, ...request });
    }
}
//# sourceMappingURL=api.js.map