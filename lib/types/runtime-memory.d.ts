import type { MnemonRunner } from './runner.ts';
export declare const RUNTIME_MEMORY_VERSION = 1;
export declare const RUNTIME_ENTRY_DELIMITER = "\n\u00A7\n";
export declare const RUNTIME_MEMORY_LIMITS: {
    readonly memory: number;
    readonly user: number;
};
export type RuntimeMemoryTarget = keyof typeof RUNTIME_MEMORY_LIMITS;
export type RuntimeMemoryImportance = 'critical' | 'normal' | 'low';
export type RuntimeMemoryAction = 'add' | 'replace' | 'remove';
export interface RuntimeMemoryEntry {
    content: string;
    created_at: string;
    updated_at: string;
    target: RuntimeMemoryTarget;
    importance: RuntimeMemoryImportance;
}
export interface RuntimeMemoryUsage {
    used: number;
    limit: number;
}
export interface RuntimeMemoryTargetView extends RuntimeMemoryUsage {
    target: RuntimeMemoryTarget;
    entryCount: number;
    markdownPath: string;
}
export interface RuntimeMemorySnapshot {
    directory: string;
    sourcePath: string;
    revision: string;
    generatedAt: string;
    entries: RuntimeMemoryEntry[];
    targets: Record<RuntimeMemoryTarget, RuntimeMemoryTargetView>;
}
export interface RuntimeMemoryCompactedEntry {
    content: string;
    importance: RuntimeMemoryImportance;
}
export interface RuntimeMemoryMutation {
    action: RuntimeMemoryAction;
    target: RuntimeMemoryTarget;
    content?: string;
    oldText?: string;
    importance?: RuntimeMemoryImportance;
}
export type RuntimeMemoryMutationResult = {
    success: true;
    message: string;
    target: RuntimeMemoryTarget;
    entryCount: number;
    usage: RuntimeMemoryUsage;
    added?: string;
    replaced?: {
        from: string;
        to: string;
    };
    removed?: string;
    maintenance?: {
        kind: 'local-compaction' | 'mnemon-archive';
        runId: string;
        provider: string;
        summary: string;
        memoryBodyIds: string[];
    };
};
export declare class RuntimeMemoryCapacityError extends Error {
    readonly target: RuntimeMemoryTarget;
    readonly used: number;
    readonly projected: number;
    readonly limit: number;
    constructor(target: RuntimeMemoryTarget, used: number, projected: number, limit: number);
}
export declare class RuntimeMemoryConflictError extends Error {
    constructor();
}
/**
 * Single authority for hot memory. JSON is the durable source of truth;
 * Markdown files are deterministic projections consumed by prompt assembly.
 */
export declare class RuntimeMemoryController {
    private readonly now;
    readonly directory: string;
    readonly sourcePath: string;
    readonly memoryPath: string;
    readonly userPath: string;
    readonly lockPath: string;
    private queue;
    constructor(runner: Pick<MnemonRunner, 'effectiveDataDir'>, now?: () => Date);
    snapshot(): RuntimeMemorySnapshot;
    contextText(): string;
    mutate(request: RuntimeMemoryMutation): Promise<RuntimeMemoryMutationResult>;
    /** Apply an LLM-produced compaction only to the exact snapshot it reviewed. */
    compactTarget(expectedRevision: string, target: RuntimeMemoryTarget, compacted: RuntimeMemoryCompactedEntry[], maxBytes?: number): Promise<RuntimeMemorySnapshot>;
    private initialize;
    private mutateLocked;
    private result;
    private targetView;
    private snapshotUnlocked;
    private readSource;
    private persist;
    private repairProjections;
    private withLock;
}
//# sourceMappingURL=runtime-memory.d.ts.map