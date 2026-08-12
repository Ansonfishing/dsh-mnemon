import type { JsonValue } from './contracts.ts';
import type { ResolvedConfig } from './config.ts';
import { MemoryBodyRegistry, type CreateMemoryBodyRequest, type MemoryBody, type UpdateMemoryBodyRequest } from './memory-bodies.ts';
import type { MnemonRunner } from './runner.ts';
import type { LifecycleSnapshot } from './lifecycle.ts';
export declare const CATEGORIES: readonly ["preference", "decision", "fact", "insight", "context", "general"];
export type Category = typeof CATEGORIES[number];
export declare const SOURCES: readonly ["user", "agent", "external"];
export type Source = typeof SOURCES[number];
export declare const EDGE_TYPES: readonly ["temporal", "semantic", "causal", "entity"];
export type EdgeType = typeof EDGE_TYPES[number];
export declare const INTENTS: readonly ["WHY", "WHEN", "ENTITY", "GENERAL"];
export type Intent = typeof INTENTS[number];
export interface Insight {
    id: string;
    content: string;
    category?: string;
    importance?: number;
    tags?: string[];
    entities?: string[];
    source?: string;
    score?: number;
    confidence?: string;
    intent?: string;
    matchedVia?: string;
    createdAt?: string;
    depth?: number;
    edgeType?: string;
    memoryBodyId?: string;
    memoryBodyName?: string;
}
export interface SearchRequest {
    query: string;
    mode?: 'smart' | 'keyword' | 'basic';
    limit?: number;
    category?: Category;
    source?: Source;
    intent?: Intent;
    memoryBodyIds?: string[];
}
export interface RememberRequest {
    content: string;
    category?: Category;
    importance?: number;
    tags?: string[];
    entities?: string[];
    source?: Source;
    memoryBodyId?: string;
}
export interface MemoryBodyStats {
    totalInsights: number;
    deletedInsights: number;
    edgeCount: number;
    oplogCount: number;
    dbSizeBytes: number;
    byCategory: Record<string, number>;
    topEntities: Array<{
        entity: string;
        count: number;
    }>;
}
export interface MemoryBodyView extends MemoryBody {
    healthy: boolean;
    error?: string;
    stats?: MemoryBodyStats;
}
export interface MemoryBodyCatalog {
    items: MemoryBodyView[];
    total: number;
    activeCount: number;
    directory: string;
    generatedAt: string;
}
export interface StatusView {
    healthy: boolean;
    error?: string;
    version?: string;
    cliPath: string;
    commandFound: boolean;
    dataDir: string;
    store: string;
    writeEnabled: boolean;
    timeoutMs: number;
    defaultRecallLimit: number;
    memoryBodyDirectory: string;
    memoryBodies: MemoryBodyView[];
    lifecycle?: LifecycleSnapshot;
    stats?: MemoryBodyStats & {
        dbPath?: string;
    };
}
export interface MemoryGraphNode extends Insight {
    color: string;
    graphId?: string;
}
export interface MemoryGraphEdge {
    sourceId: string;
    targetId: string;
    label: string;
    color: string;
    type?: EdgeType;
}
export interface MemoryGraphSnapshot {
    nodes: MemoryGraphNode[];
    edges: MemoryGraphEdge[];
    generatedAt: string;
    memoryBodies?: Array<Pick<MemoryBody, 'id' | 'name' | 'active'>>;
}
export interface MemoryListRequest {
    query?: string;
    category?: Category;
    limit?: number;
    memoryBodyIds?: string[];
}
export interface MemoryListView {
    items: MemoryGraphNode[];
    total: number;
    generatedAt: string;
}
export interface EntityView {
    items: Array<{
        entity: string;
        count: number;
    }>;
    insights: Insight[];
    selected?: string;
}
/** Parse the official Mnemon vis.js export without executing its HTML or loading its CDN script. */
export declare function parseMemoryGraph(html: string, now?: Date): MemoryGraphSnapshot;
export declare class MnemonService {
    readonly runner: MnemonRunner;
    readonly config: ResolvedConfig;
    readonly memoryBodies: MemoryBodyRegistry;
    constructor(runner: MnemonRunner, config: ResolvedConfig, memoryBodies?: MemoryBodyRegistry);
    bodies(signal?: AbortSignal): Promise<MemoryBodyCatalog>;
    status(signal?: AbortSignal): Promise<StatusView>;
    search(request: SearchRequest, signal?: AbortSignal): Promise<{
        query: string;
        mode: string;
        results: Insight[];
        hint?: string;
    }>;
    graph(signal?: AbortSignal, memoryBodyIds?: string[]): Promise<MemoryGraphSnapshot>;
    list(request?: MemoryListRequest, signal?: AbortSignal): Promise<MemoryListView>;
    entities(entity?: string, limit?: number, signal?: AbortSignal): Promise<EntityView>;
    remember(request: RememberRequest, signal?: AbortSignal): Promise<JsonValue>;
    related(id: string, depth?: number, edge?: EdgeType, signal?: AbortSignal, memoryBodyId?: string): Promise<Insight[]>;
    link(sourceId: string, targetId: string, type?: EdgeType, weight?: number, reason?: string, signal?: AbortSignal, memoryBodyId?: string): Promise<JsonValue>;
    forget(id: string, signal?: AbortSignal, memoryBodyId?: string): Promise<JsonValue>;
    createBody(request: CreateMemoryBodyRequest, signal?: AbortSignal): Promise<MemoryBody>;
    updateBody(id: string, request: UpdateMemoryBodyRequest): MemoryBody;
    mergeBodies(targetBodyId: string, sourceBodyIds: string[], deactivateSources?: boolean, signal?: AbortSignal): Promise<JsonValue>;
    private bodyStatus;
    private parseStats;
    private graphForBody;
    private allInsights;
    private readBodies;
    private readBody;
    private writeBody;
    private annotate;
    private annotateResult;
    private activateAfterWrite;
    private assertWritable;
}
//# sourceMappingURL=service.d.ts.map