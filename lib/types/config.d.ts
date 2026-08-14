import z from 'schemastery';
export { DEFAULT_IDLE_REVIEW_MS, DEFAULT_RECALL_LIMIT, DEFAULT_TIMEOUT_MS } from './config-values.ts';
/** User-facing configuration mounted from the DSH profile patch. */
export interface Config {
    /** Storage domain selected in DSH plugin settings. Changes apply live after save. */
    storageScope?: 'global' | 'workspace' | 'custom';
    /** Explicit `mnemon` executable. Omit to resolve MNEMON_CLI_PATH, PATH, then common install locations. */
    cliPath?: string;
    /** Custom Mnemon base directory; also retained as a legacy dataDir-only scope selection. */
    dataDir?: string;
    /** @deprecated Migration-only selector from the former named-Pack settings UI. */
    customPackId?: string;
    /** @deprecated Migration-only roots from the former named-Pack settings UI. */
    customPacks?: CustomPackConfig[];
    /** Legacy store hint used to bootstrap or discover the initial Memory Space. */
    store?: string;
    /** Hard deadline for one CLI process. */
    timeoutMs?: number;
    /** Default number of recall results exposed to the agent and Web workspace. */
    defaultRecallLimit?: number;
    /** Add conservative recall/writeback guidance to the DSH system prompt. */
    routingGuidance?: boolean;
    /** Choose where the DSH Web memory workspace is mounted. */
    displayMode?: 'sidebar' | 'buildin';
    /** Register the configured DSH Web memory workspace. */
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
    /** @deprecated Migration source for pre-0.2 settings; new writes use the live `mnemon-ui` namespace. */
    conversationInteraction?: {
        /** @deprecated Removed. Mnemon now uses DSH's standard tool presentation. */
        toolviews?: boolean;
        /** Per-turn memory activity bar under completed turns. */
        turnBar?: boolean;
        /** Save-to-memory action on finalized assistant messages. */
        saveAction?: boolean;
    };
}
export interface CustomPackConfig {
    id: string;
    name: string;
    dataDir: string;
}
/** Browser-only interaction settings, registered live under `mnemon-ui`. */
export interface InteractionConfig {
    turnBar?: boolean;
    saveAction?: boolean;
}
export declare const InteractionConfig: z<InteractionConfig>;
export declare const Config: z<Config>;
export interface ResolvedConfig {
    storageScope: 'global' | 'workspace' | 'custom';
    cliPath?: string;
    dataDir?: string;
    store?: string;
    timeoutMs: number;
    defaultRecallLimit: number;
    routingGuidance: boolean;
    displayMode: 'sidebar' | 'buildin';
    tabEnabled: boolean;
    writeEnabled: boolean;
    lifecycleEnabled: boolean;
    recallMode: 'guided' | 'off';
    writebackMode: 'guided' | 'off';
    idleReviewMs: number;
    conversationInteraction: {
        toolviews: boolean;
        turnBar: boolean;
        saveAction: boolean;
    };
}
export interface ResolvedInteractionConfig {
    turnBar: boolean;
    saveAction: boolean;
}
export declare function resolveInteractionConfig(config?: InteractionConfig): ResolvedInteractionConfig;
export declare function resolveConfig(config?: Config): ResolvedConfig;
//# sourceMappingURL=config.d.ts.map