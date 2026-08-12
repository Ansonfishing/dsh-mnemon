import type { HostAgent, HostSubagentsService } from './contracts.ts';
import type { Insight, MnemonService, RememberRequest, SearchRequest } from './service.ts';
/** Rejects schema keywords that DSH structured-output tools cannot compile. */
export declare function assertDshOutputSchema(schema: unknown, path?: string): void;
export interface SubagentCounters {
    recalls: number;
    writes: number;
    answers: number;
    failures: number;
    lastRunId?: string;
    lastOperation?: 'recall' | 'write';
    lastAt?: string;
}
export interface DelegatedRecallResult {
    query: string;
    mode: string;
    results: Insight[];
    hint?: string;
    delegation: {
        runId: string;
        provider: string;
        summary: string;
        selectedMemoryBodyIds: string[];
    };
}
export interface DelegatedWriteResult {
    delegated: true;
    runId: string;
    provider: string;
    summary: string;
    action: string;
    memoryBodyIds: string[];
}
export interface DelegatedAnswerResult {
    answer: string;
    citations: string[];
    delegation: {
        runId: string;
        provider: string;
    };
}
export declare function isSubagent(agent: HostAgent | undefined): boolean;
/** Delegates memory judgment and execution to a fresh, tool-scoped DSH child. */
export declare class MnemonSubagentCoordinator {
    private readonly subagents;
    private readonly service;
    private readonly counters;
    constructor(subagents: HostSubagentsService, service: MnemonService);
    snapshot(): SubagentCounters;
    recall(parent: HostAgent, request: SearchRequest, signal: AbortSignal): Promise<DelegatedRecallResult>;
    related(parent: HostAgent, id: string, memoryBodyId: string | undefined, signal: AbortSignal): Promise<DelegatedRecallResult>;
    remember(parent: HostAgent, request: RememberRequest, signal: AbortSignal): Promise<DelegatedWriteResult>;
    answer(parent: HostAgent, query: string, evidence: Insight[], signal: AbortSignal): Promise<DelegatedAnswerResult>;
    write(parent: HostAgent, operation: string, request: unknown, signal: AbortSignal): Promise<DelegatedWriteResult>;
    private recallResult;
    private delegate;
    private provider;
}
//# sourceMappingURL=subagent.d.ts.map