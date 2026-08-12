export interface ProcessResult {
    stdout: string;
    stderr: string;
    exitCode: number | null;
}
export interface ProcessOptions {
    signal?: AbortSignal;
    timeoutMs: number;
    maxOutputBytes?: number;
}
export type ProcessRunner = (command: string, args: readonly string[], options: ProcessOptions) => Promise<ProcessResult>;
/** Spawn without a shell, with bounded output and cooperative cancellation. */
export declare const runProcess: ProcessRunner;
//# sourceMappingURL=process.d.ts.map