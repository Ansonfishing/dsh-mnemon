import { MNEMON_READ_CHANNEL, MNEMON_WRITE_CHANNEL } from "../rpc.js";
const turnActivityCache = new WeakMap();
async function loadTurnActivities(connection, sessionId, requiredCursor) {
    let sessions = turnActivityCache.get(connection);
    if (sessions === undefined) {
        sessions = new Map();
        turnActivityCache.set(connection, sessions);
    }
    const key = sessionId ?? '';
    let entry = sessions.get(key);
    if (entry === undefined) {
        entry = { cursor: -1, activities: new Map() };
        sessions.set(key, entry);
    }
    if (entry.cursor >= requiredCursor)
        return { cursor: entry.cursor, activities: [...entry.activities.values()] };
    if (entry.inFlight !== undefined) {
        const snapshot = await entry.inFlight;
        return snapshot.cursor >= requiredCursor ? snapshot : loadTurnActivities(connection, sessionId, requiredCursor);
    }
    const request = connection.rpc.call(MNEMON_READ_CHANNEL, 'turn-activities', sessionId === undefined ? {} : { sessionId })
        .then(response => {
        if (!response.ok)
            throw new Error(response.error.message);
        const snapshot = response.value;
        entry.cursor = snapshot.cursor;
        entry.activities = new Map(snapshot.activities.map(activity => [activity.turn, activity]));
        return snapshot;
    })
        .finally(() => { delete entry.inFlight; });
    entry.inFlight = request;
    return request;
}
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
    runtimeMemory() {
        return this.call(MNEMON_READ_CHANNEL, 'runtime-memory', {});
    }
    mutateRuntimeMemory(request) {
        return this.call(MNEMON_WRITE_CHANNEL, 'runtime-memory', { ...request, sessionId: this.sessionId });
    }
    documents() {
        return this.call(MNEMON_READ_CHANNEL, 'documents', { sessionId: this.sessionId });
    }
    document(id) {
        return this.call(MNEMON_READ_CHANNEL, 'document', { sessionId: this.sessionId, id });
    }
    searchDocuments(query, includeArchived = false, limit = 50) {
        return this.call(MNEMON_READ_CHANNEL, 'document-search', { sessionId: this.sessionId, query, includeArchived, limit });
    }
    mutateDocument(request) {
        return this.call(MNEMON_WRITE_CHANNEL, 'document', { ...request, sessionId: this.sessionId });
    }
    archiveDocument(id) {
        return this.call(MNEMON_WRITE_CHANNEL, 'document', { action: 'archive', id, sessionId: this.sessionId });
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
    agentSearch(request) {
        return this.call(MNEMON_READ_CHANNEL, 'agent-search', { ...request, sessionId: this.sessionId });
    }
    related(id, memoryBodyId) {
        return this.call(MNEMON_READ_CHANNEL, 'related', { id, depth: 2, sessionId: this.sessionId, ...(memoryBodyId === undefined ? {} : { memoryBodyId }) });
    }
    /** Settled memory-tool activity of one turn, shared across all mounted tails. */
    async turnActivity(turn, cursor = 0) {
        const snapshot = await loadTurnActivities(this.connection, this.sessionId, cursor);
        return snapshot.activities.find(activity => activity.turn === turn) ?? null;
    }
    /** Plain text of one finalized assistant message; null when absent or empty. */
    assistantMessageText(messageId) {
        return this.call(MNEMON_READ_CHANNEL, 'assistant-message', { sessionId: this.sessionId, messageId });
    }
    remember(request) {
        return this.call(MNEMON_WRITE_CHANNEL, 'remember', { ...request, sessionId: this.sessionId });
    }
    supervise(content, idempotencyKey) {
        return this.call(MNEMON_WRITE_CHANNEL, 'supervise', { sessionId: this.sessionId, content, ...(idempotencyKey === undefined ? {} : { idempotencyKey }) });
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