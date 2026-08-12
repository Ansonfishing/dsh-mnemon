import z from 'schemastery';
export { DEFAULT_RECALL_LIMIT, DEFAULT_TIMEOUT_MS } from './config-values.ts';
/** User-facing configuration mounted from the DSH profile patch. */
export interface Config {
    /** Explicit `mnemon` executable. Omit to resolve MNEMON_CLI_PATH, PATH, then common install locations. */
    cliPath?: string;
    /** Mnemon base directory. Omit to preserve MNEMON_DATA_DIR / Mnemon's ~/.mnemon default. */
    dataDir?: string;
    /** Legacy store hint used to bootstrap or discover the initial memory body. */
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
    /** Enable DSH agent lifecycle integration (Prime, recall cue, and writeback checkpoint). */
    lifecycleEnabled?: boolean;
    /** Recall behavior at the first step of each DSH turn. */
    recallMode?: 'guided' | 'off';
    /** Writeback behavior immediately before a DSH turn closes. */
    writebackMode?: 'guided' | 'off';
}
export declare const Config: z<Config>;
export interface ResolvedConfig {
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
}
export declare function resolveConfig(config?: Config): ResolvedConfig;
//# sourceMappingURL=config.d.ts.map