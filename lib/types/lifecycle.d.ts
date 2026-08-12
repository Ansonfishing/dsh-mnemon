import type { ResolvedConfig } from './config.ts';
import type { HostContextShape } from './contracts.ts';
import type { MnemonService } from './service.ts';
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
    current?: LifecycleAgentSnapshot;
}
export interface SupervisedWritebackResult {
    queued: true;
    sessionId: string;
    messageId: string;
    agentStatus: 'idle' | 'running';
}
/** DSH-native owner for per-agent Mnemon lifecycle hooks and UI-triggered LLM work. */
export declare class MnemonLifecycle {
    private readonly ctx;
    private readonly service;
    private readonly config;
    private readonly owners;
    private readonly counters;
    constructor(ctx: HostContextShape, service: MnemonService, config: ResolvedConfig);
    start(): () => void;
    snapshot(sessionId?: string): LifecycleSnapshot;
    supervise(sessionId: string, content: string): SupervisedWritebackResult;
    private install;
}
//# sourceMappingURL=lifecycle.d.ts.map