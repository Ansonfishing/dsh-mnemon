import type { ClientConnectionHandle } from '../contracts.ts';
import type { MemoryBody } from '../memory-bodies.ts';
import type { DocumentMutation, DocumentMutationResult, DocumentSearchResult, DocumentSnapshot, DocumentView } from '../documents.ts';
import type { RuntimeMemoryImportance, RuntimeMemoryMutationResult, RuntimeMemorySnapshot, RuntimeMemoryTarget } from '../runtime-memory.ts';
import type { EntityView, Insight, MemoryBodyCatalog, MemoryGraphSnapshot, MemoryListRequest, MemoryListView, RememberRequest, SearchRequest, StatusView } from '../service.ts';
import type { AssistantMessageText, TurnMemoryActivity } from '../lifecycle.ts';
import type { MnemonPackExport, MnemonPackImportResult, MnemonPackPreview } from '../pack.ts';
export interface SearchResponse {
    query: string;
    mode: string;
    results: Insight[];
    hint?: string;
}
export interface AgentSearchResponse extends SearchResponse {
    answer: string;
    citations: string[];
    delegation: {
        runId: string;
        provider: string;
    };
}
export declare class MnemonClient {
    private readonly connection;
    private readonly sessionId?;
    constructor(connection: ClientConnectionHandle, sessionId?: string | undefined);
    private call;
    status(): Promise<StatusView>;
    runtimeMemory(): Promise<RuntimeMemorySnapshot>;
    mutateRuntimeMemory(request: {
        action: 'add' | 'replace' | 'remove';
        target: RuntimeMemoryTarget;
        content?: string;
        old_text?: string;
        importance?: RuntimeMemoryImportance;
    }): Promise<RuntimeMemoryMutationResult>;
    documents(): Promise<DocumentSnapshot>;
    document(id: string): Promise<DocumentView>;
    searchDocuments(query: string, includeArchived?: boolean, limit?: number): Promise<DocumentSearchResult>;
    mutateDocument(request: DocumentMutation): Promise<DocumentMutationResult>;
    archiveDocument(id: string): Promise<DocumentMutationResult>;
    bodies(): Promise<MemoryBodyCatalog>;
    graph(memoryBodyIds?: string[]): Promise<MemoryGraphSnapshot>;
    list(request?: MemoryListRequest): Promise<MemoryListView>;
    entities(entity?: string, limit?: number): Promise<EntityView>;
    search(request: SearchRequest): Promise<SearchResponse>;
    agentSearch(request: SearchRequest): Promise<AgentSearchResponse>;
    related(id: string, memoryBodyId?: string): Promise<Insight[]>;
    /** Settled memory-tool activity of one turn, shared across all mounted tails. */
    turnActivity(turn: number, cursor?: number): Promise<TurnMemoryActivity | null>;
    /** Plain text of one finalized assistant message; null when absent or empty. */
    assistantMessageText(messageId: string): Promise<AssistantMessageText | null>;
    remember(request: RememberRequest): Promise<Record<string, unknown>>;
    supervise(content: string, idempotencyKey?: string): Promise<{
        delegated: true;
        sessionId: string;
        runId: string;
        provider: string;
        summary: string;
        action: string;
        memoryBodyIds: string[];
    }>;
    forget(id: string, memoryBodyId?: string): Promise<Record<string, unknown>>;
    createBody(request: {
        name: string;
        description: string;
        active?: boolean;
    }): Promise<MemoryBody>;
    updateBody(memoryBodyId: string, request: {
        name?: string;
        description?: string;
        active?: boolean;
    }): Promise<MemoryBody>;
    packTarget(): Promise<{
        root: string;
        scope: 'global' | 'workspace' | 'custom';
    }>;
    exportPack(): Promise<MnemonPackExport>;
    inspectPack(base64: string, fileName?: string): Promise<MnemonPackPreview>;
    importPack(base64: string): Promise<MnemonPackImportResult>;
}
//# sourceMappingURL=api.d.ts.map