import { Config, resolveConfig, type Config as MnemonConfig } from './config.ts';
import { DocumentManager } from './documents.ts';
import { MnemonLifecycle } from './lifecycle.ts';
import { createRunner } from './runner.ts';
import { RuntimeMemoryController } from './runtime-memory.ts';
import { MnemonService } from './service.ts';
import { MnemonSubagentCoordinator } from './subagent.ts';
export declare const name = "dsh-mnemon";
export declare const inject: string[];
export { Config, resolveConfig, DocumentManager, MnemonLifecycle, MnemonService, MnemonSubagentCoordinator, RuntimeMemoryController, createRunner };
export type { MnemonConfig };
/** Mount native model tools on every DSH surface and UI RPC only when Web connection exists. */
export declare function apply(rawContext: unknown, config?: MnemonConfig): void;
//# sourceMappingURL=index.d.ts.map