import z from 'schemastery';
export { DEFAULT_RECALL_LIMIT, DEFAULT_TIMEOUT_MS } from './config-values.ts';
/** User-facing configuration mounted from the DSH profile patch. */
export interface Config {
    /** Explicit `mnemon` executable. Omit to resolve MNEMON_CLI_PATH, PATH, then common install locations. */
    cliPath?: string;
    /** Mnemon base directory. Omit to preserve MNEMON_DATA_DIR / Mnemon's ~/.mnemon default. */
    dataDir?: string;
    /** Named store forced on every call. Omit to preserve MNEMON_STORE / the active-store file. */
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
}
export declare function resolveConfig(config?: Config): ResolvedConfig;
//# sourceMappingURL=config.d.ts.map