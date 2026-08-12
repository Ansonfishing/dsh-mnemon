import type { ResolvedConfig } from './config.ts';
import type { HostContextShape } from './contracts.ts';
import type { MnemonService, RememberRequest, SearchRequest } from './service.ts';
import { MnemonSubagentCoordinator, type DelegatedWriteResult, type SubagentCounters } from './subagent.ts';
export declare const MNEMON_PLUGIN_SOURCE = "dsh-mnemon";
export type LifecyclePhase = 'idle' | 'prime' | 'recall' | 'writeback' | 'supervised' | 'error';
export interface LifecycleCounters {
    primes: number;
    recallCues: number;
    writebackChecks: number;
    supervisedRequests: number;
    failures: number;
}
export interface LifecycleAgentSnapshot {
    sessionId: string;
    status: 'idle' | 'running';
    startSource: 'startup' | 'resume' | 'clear' | 'compact' | 'adopted';
    primePending: boolean;
    checkedTurns: number;
    memoryToolCalls: number;
    lastPhase: LifecyclePhase;
    lastAt?: string;
    lastError?: string;
}
export interface LifecycleSnapshot {
    enabled: boolean;
    recallMode: ResolvedConfig['recallMode'];
    writebackMode: ResolvedConfig['writebackMode'];
    activeAgents: number;
    sessionAvailable: boolean;
    counters: LifecycleCounters;
    subagents: SubagentCounters;
    current?: LifecycleAgentSnapshot;
}
export interface SupervisedWritebackResult extends DelegatedWriteResult {
    sessionId: string;
}
/** DSH-native owner for per-agent Mnemon lifecycle hooks and UI-triggered LLM work. */
export declare class MnemonLifecycle {
    private readonly ctx;
    private readonly service;
    private readonly coordinator;
    private readonly config;
    private readonly owners;
    private readonly counters;
    constructor(ctx: HostContextShape, service: MnemonService, coordinator: MnemonSubagentCoordinator, config: ResolvedConfig);
    start(): () => void;
    snapshot(sessionId?: string): LifecycleSnapshot;
    recall(sessionId: string, request: SearchRequest, signal?: AbortSignal): Promise<import("./subagent.ts").DelegatedRecallResult>;
    related(sessionId: string, id: string, memoryBodyId?: string, signal?: AbortSignal): Promise<import("./subagent.ts").DelegatedRecallResult>;
    remember(sessionId: string, request: RememberRequest, signal?: AbortSignal): Promise<DelegatedWriteResult>;
    mutate(sessionId: string, operation: string, request: unknown, signal?: AbortSignal): Promise<DelegatedWriteResult>;
    supervise(sessionId: string, content: string, signal?: AbortSignal): Promise<SupervisedWritebackResult>;
    private liveAgent;
    private install;
}
//# sourceMappingURL=lifecycle.d.ts.map