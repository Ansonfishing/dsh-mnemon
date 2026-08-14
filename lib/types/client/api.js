import { MNEMON_PACK_CHANNEL, MNEMON_READ_CHANNEL, MNEMON_WRITE_CHANNEL } from "../rpc.js";
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
    workspaceId;
    constructor(connection, sessionId, workspaceId) {
        this.connection = connection;
        this.sessionId = sessionId;
        this.workspaceId = workspaceId;
    }
    async call(channel, endpoint, payload) {
        const response = await this.connection.rpc.call(channel, endpoint, payload);
        if (!response.ok)
            throw new Error(response.error.message);
        return response.value;
    }
    scoped(payload = {}) {
        return {
            ...payload,
            ...(this.sessionId === undefined ? {} : { sessionId: this.sessionId }),
            ...(this.workspaceId === undefined ? {} : { workspaceId: this.workspaceId }),
        };
    }
    status() {
        return this.call(MNEMON_READ_CHANNEL, 'status', this.scoped());
    }
    runtimeMemory() {
        return this.call(MNEMON_READ_CHANNEL, 'runtime-memory', this.scoped());
    }
    mutateRuntimeMemory(request) {
        return this.call(MNEMON_WRITE_CHANNEL, 'runtime-memory', this.scoped(request));
    }
    documents() {
        return this.call(MNEMON_READ_CHANNEL, 'documents', this.scoped());
    }
    document(id) {
        return this.call(MNEMON_READ_CHANNEL, 'document', this.scoped({ id }));
    }
    searchDocuments(query, includeArchived = false, limit = 50) {
        return this.call(MNEMON_READ_CHANNEL, 'document-search', this.scoped({ query, includeArchived, limit }));
    }
    mutateDocument(request) {
        return this.call(MNEMON_WRITE_CHANNEL, 'document', this.scoped(request));
    }
    archiveDocument(id) {
        return this.call(MNEMON_WRITE_CHANNEL, 'document', this.scoped({ action: 'archive', id }));
    }
    bodies() {
        return this.call(MNEMON_READ_CHANNEL, 'bodies', this.scoped());
    }
    graph(memoryBodyIds) {
        return this.call(MNEMON_READ_CHANNEL, 'graph', this.scoped(memoryBodyIds === undefined ? {} : { memoryBodyIds }));
    }
    list(request = {}) {
        return this.call(MNEMON_READ_CHANNEL, 'list', this.scoped(request));
    }
    entities(entity, limit) {
        return this.call(MNEMON_READ_CHANNEL, 'entities', this.scoped({
            ...(entity === undefined ? {} : { entity }),
            ...(limit === undefined ? {} : { limit }),
        }));
    }
    search(request) {
        return this.call(MNEMON_READ_CHANNEL, 'search', this.scoped(request));
    }
    agentSearch(request) {
        return this.call(MNEMON_READ_CHANNEL, 'agent-search', this.scoped(request));
    }
    related(id, memoryBodyId) {
        return this.call(MNEMON_READ_CHANNEL, 'related', this.scoped({ id, depth: 2, ...(memoryBodyId === undefined ? {} : { memoryBodyId }) }));
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
        return this.call(MNEMON_WRITE_CHANNEL, 'remember', this.scoped(request));
    }
    supervise(content, idempotencyKey) {
        return this.call(MNEMON_WRITE_CHANNEL, 'supervise', this.scoped({ content, ...(idempotencyKey === undefined ? {} : { idempotencyKey }) }));
    }
    forget(id, memoryBodyId) {
        return this.call(MNEMON_WRITE_CHANNEL, 'forget', this.scoped({ id, ...(memoryBodyId === undefined ? {} : { memoryBodyId }) }));
    }
    createBody(request) {
        return this.call(MNEMON_WRITE_CHANNEL, 'body-create', this.scoped(request));
    }
    updateBody(memoryBodyId, request) {
        return this.call(MNEMON_WRITE_CHANNEL, 'body-update', this.scoped({ memoryBodyId, ...request }));
    }
    deleteBody(memoryBodyId) {
        return this.call(MNEMON_WRITE_CHANNEL, 'body-delete', this.scoped({ memoryBodyId }));
    }
    packTarget() {
        return this.call(MNEMON_PACK_CHANNEL, 'target', {});
    }
    exportPack() {
        return this.call(MNEMON_PACK_CHANNEL, 'export', {});
    }
    inspectPack(base64, fileName) {
        return this.call(MNEMON_PACK_CHANNEL, 'inspect', { base64, ...(fileName === undefined ? {} : { fileName }) });
    }
    importPack(base64) {
        return this.call(MNEMON_PACK_CHANNEL, 'import', { base64 });
    }
}
//# sourceMappingURL=api.js.map