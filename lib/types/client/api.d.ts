import type { ClientConnectionHandle } from '../contracts.ts';
import type { EntityView, Insight, MemoryGraphSnapshot, MemoryListRequest, MemoryListView, RememberRequest, SearchRequest, StatusView } from '../service.ts';
export interface SearchResponse {
    query: string;
    mode: string;
    results: Insight[];
    hint?: string;
}
export declare class MnemonClient {
    private readonly connection;
    constructor(connection: ClientConnectionHandle);
    private call;
    status(sessionId?: string): Promise<StatusView>;
    graph(): Promise<MemoryGraphSnapshot>;
    list(request?: MemoryListRequest): Promise<MemoryListView>;
    entities(entity?: string, limit?: number): Promise<EntityView>;
    search(request: SearchRequest): Promise<SearchResponse>;
    related(id: string): Promise<Insight[]>;
    remember(request: RememberRequest): Promise<Record<string, unknown>>;
    supervise(sessionId: string, content: string): Promise<{
        queued: true;
        sessionId: string;
        messageId: string;
        agentStatus: 'idle' | 'running';
    }>;
    forget(id: string): Promise<Record<string, unknown>>;
}
//# sourceMappingURL=api.d.ts.map