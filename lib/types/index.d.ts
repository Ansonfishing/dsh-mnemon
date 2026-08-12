import { Config, resolveConfig, type Config as MnemonConfig } from './config.ts';
import { MnemonLifecycle } from './lifecycle.ts';
import { createRunner } from './runner.ts';
import { MnemonService } from './service.ts';
export declare const name = "dsh-mnemon";
export declare const inject: string[];
export { Config, resolveConfig, MnemonLifecycle, MnemonService, createRunner };
export type { MnemonConfig };
/** Mount native model tools on every DSH surface and UI RPC only when Web connection exists. */
export declare function apply(rawContext: unknown, config?: MnemonConfig): void;
//# sourceMappingURL=index.d.ts.map