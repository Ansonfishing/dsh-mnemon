import z from 'schemastery';
export { DEFAULT_IDLE_REVIEW_MS, DEFAULT_RECALL_LIMIT, DEFAULT_TIMEOUT_MS } from './config-values.ts';
/** User-facing configuration mounted from the DSH profile patch. */
export interface Config {
    /** Storage domain selected in DSH plugin settings. Changes apply after restart. */
    storageScope?: 'global' | 'workspace' | 'custom';
    /** Explicit `mnemon` executable. Omit to resolve MNEMON_CLI_PATH, PATH, then common install locations. */
    cliPath?: string;
    /** Custom Mnemon base directory; also retained as a legacy dataDir-only scope selection. */
    dataDir?: string;
    /** Legacy store hint used to bootstrap or discover the initial Memory Space. */
    store?: string;
    /** Hard deadline for one CLI process. */
    timeoutMs?: number;
    /** Default number of recall results exposed to the agent and the tab. */
    defaultRecallLimit?: number;
    /** Add conservative recall/writeback guidance to the DSH system prompt. */
    routingGuidance?: boolean;
    /** Register the Web conversation-view memory tab. */
    tabEnabled?: boolean;
    /** Allow remember/link/forget mutations. Recall and status remain available when false. */
    writeEnabled?: boolean;
    /** Enable DSH agent lifecycle integration (Prime plus recall/remember cues). */
    lifecycleEnabled?: boolean;
    /** Recall behavior at the first step of each DSH turn. */
    recallMode?: 'guided' | 'off';
    /** Enable the short remember cue and the scored, debounced full-checkpoint review. */
    writebackMode?: 'guided' | 'off';
    /** Continuous root-agent idle time after the QoderWork activity gate is met. */
    idleReviewMs?: number;
}
export declare const Config: z<Config>;
export interface ResolvedConfig {
    storageScope: 'global' | 'workspace' | 'custom';
    cliPath?: string;
    dataDir?: string;
    store?: string;
    timeoutMs: number;
    defaultRecallLimit: number;
    routingGuidance: boolean;
    tabEnabled: boolean;
    writeEnabled: boolean;
    lifecycleEnabled: boolean;
    recallMode: 'guided' | 'off';
    writebackMode: 'guided' | 'off';
    idleReviewMs: number;
}
export declare function resolveConfig(config?: Config): ResolvedConfig;
//# sourceMappingURL=config.d.ts.map