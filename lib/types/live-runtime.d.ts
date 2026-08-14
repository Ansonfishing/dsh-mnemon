import type { ResolvedConfig } from './config.ts';
import { DocumentManager } from './documents.ts';
import { MnemonPackManager } from './pack.ts';
import { type MnemonRunner } from './runner.ts';
import { RuntimeMemoryController } from './runtime-memory.ts';
import { MnemonService } from './service.ts';
import { StorageScopeInspector } from './storage-scope.ts';
export interface MnemonRuntimeGraph {
    config: ResolvedConfig;
    runner: MnemonRunner;
    service: MnemonService;
    runtimeMemory: RuntimeMemoryController;
    documents: DocumentManager;
    storage: StorageScopeInspector;
    packs: MnemonPackManager;
}
/**
 * Build a complete generation before it can become visible. Constructors also
 * validate and initialize the selected storage root, so a failed candidate is
 * rejected by DSH settings validation without disturbing the active graph.
 */
export declare function createRuntimeGraph(config: ResolvedConfig): MnemonRuntimeGraph;
/**
 * Stable faces handed to DSH registrations. `swap` is synchronous and contains
 * no user code, so all faces move to the same prevalidated generation in one
 * JavaScript turn. A method obtained before the swap stays bound to its old
 * generation until that invocation settles.
 */
export declare class LiveMnemonRuntime {
    private current;
    readonly config: ResolvedConfig;
    readonly runner: MnemonRunner;
    readonly service: MnemonService;
    readonly runtimeMemory: RuntimeMemoryController;
    readonly documents: DocumentManager;
    readonly storage: StorageScopeInspector;
    readonly packs: MnemonPackManager;
    constructor(initial: MnemonRuntimeGraph);
    swap(next: MnemonRuntimeGraph): void;
    snapshot(): MnemonRuntimeGraph;
}
//# sourceMappingURL=live-runtime.d.ts.map