import type { ResolvedConfig } from './config.ts';
import type { HostAgent, HostContextShape } from './contracts.ts';
import type { Insight, RememberRequest, SearchRequest } from './service.ts';
import type { RuntimeMemoryMutation } from './runtime-memory.ts';
import type { DocumentMutation } from './documents.ts';
import { MnemonSubagentCoordinator, type DelegatedWriteResult, type SubagentCounters } from './subagent.ts';
import { type ReviewActivityScore } from './review-activity.ts';
import { type TurnMemoryActivitySnapshot } from './activity.ts';
import type { RuntimeMemoryController } from './runtime-memory.ts';
interface AgentRuntimeSource {
    forAgent(agent: HostAgent): {
        runtimeMemory: RuntimeMemoryController;
    };
}
export type { TurnMemoryActivity, TurnMemoryActivitySnapshot } from './activity.ts';
export declare const MNEMON_PLUGIN_SOURCE = "dsh-mnemon";
export type LifecyclePhase = 'idle' | 'prime' | 'recall' | 'writeback' | 'review' | 'supervised' | 'error';
export interface LifecycleCounters {
    primes: number;
    recallCues: number;
    writebackCues: number;
    supervisedRequests: number;
    failures: number;
}
export interface LifecycleAgentSnapshot {
    sessionId: string;
    status: 'idle' | 'running';
    startSource: 'startup' | 'resume' | 'clear' | 'compact' | 'adopted';
    primePending: boolean;
    guidedTurns: number;
    memoryToolCalls: number;
    idleReviewPending: boolean;
    reviewRunning: boolean;
    reviewActivity: ReviewActivityScore;
    lastPhase: LifecyclePhase;
    lastReviewAt?: string;
    lastReviewAction?: string;
    lastReviewScore?: number;
    lastReviewDocumentIds?: string[];
    lastAt?: string;
    lastError?: string;
}
export interface LifecycleSnapshot {
    enabled: boolean;
    recallMode: ResolvedConfig['recallMode'];
    writebackMode: ResolvedConfig['writebackMode'];
    idleReviewMs: number;
    activeAgents: number;
    sessionAvailable: boolean;
    counters: LifecycleCounters;
    subagents: SubagentCounters;
    current?: LifecycleAgentSnapshot;
}
export interface SupervisedWritebackResult extends DelegatedWriteResult {
    sessionId: string;
}
/** Extracted plain text of one finalized assistant message, when present in the session log. */
export interface AssistantMessageText {
    messageId: string;
    text: string;
}
/** DSH-native owner for per-agent Mnemon lifecycle hooks and UI-triggered LLM work. */
export declare class MnemonLifecycle {
    private readonly ctx;
    private readonly coordinator;
    private readonly config;
    private readonly runtimeSource?;
    private readonly owners;
    private readonly counters;
    /** Bounded process-local replay fence for finalized-message write actions. */
    private readonly supervisedWritebacks;
    constructor(ctx: HostContextShape, coordinator: MnemonSubagentCoordinator, config: ResolvedConfig, runtimeSource?: AgentRuntimeSource | undefined);
    start(): () => void;
    snapshot(sessionId?: string): LifecycleSnapshot;
    workspaceRoot(sessionId?: string): string | undefined;
    /** Settled memory-tool activity for all turns, resolved per session. */
    turnActivities(sessionId: string): TurnMemoryActivitySnapshot;
    /** Plain text of one finalized assistant message, resolved per session; null while absent. */
    assistantMessage(sessionId: string, messageId: string): AssistantMessageText | null;
    recall(sessionId: string, request: SearchRequest, signal?: AbortSignal): Promise<import("./subagent.ts").DelegatedRecallResult>;
    related(sessionId: string, id: string, memoryBodyId?: string, signal?: AbortSignal): Promise<import("./subagent.ts").DelegatedRecallResult>;
    answer(sessionId: string, query: string, evidence: Insight[], signal?: AbortSignal): Promise<import("./subagent.ts").DelegatedAnswerResult>;
    remember(sessionId: string, request: RememberRequest, signal?: AbortSignal): Promise<DelegatedWriteResult>;
    runtime(sessionId: string, request: RuntimeMemoryMutation, signal?: AbortSignal): Promise<import("./subagent.ts").CoordinatedRuntimeMemoryResult>;
    documents(sessionId: string): import("./documents.ts").DocumentSnapshot;
    document(sessionId: string, id: string): import("./documents.ts").DocumentView;
    searchDocuments(sessionId: string, query: string, includeArchived?: boolean, limit?: number): Promise<import("./documents.ts").DocumentSearchResult>;
    mutateDocument(sessionId: string, request: DocumentMutation, signal?: AbortSignal): Promise<import("./subagent.ts").CoordinatedDocumentResult>;
    archiveDocument(sessionId: string, id: string, signal?: AbortSignal): Promise<import("./subagent.ts").CoordinatedDocumentResult>;
    mutate(sessionId: string, operation: string, request: unknown, signal?: AbortSignal): Promise<DelegatedWriteResult>;
    supervise(sessionId: string, content: string, idempotencyKey?: string, signal?: AbortSignal): Promise<SupervisedWritebackResult>;
    private liveAgent;
    private install;
}
//# sourceMappingURL=lifecycle.d.ts.map