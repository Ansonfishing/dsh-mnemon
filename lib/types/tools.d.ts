import type { HostContextShape } from './contracts.ts';
import type { RuntimeMemoryController } from './runtime-memory.ts';
import { MnemonSubagentCoordinator } from './subagent.ts';
import { type MnemonService } from './service.ts';
/** Root calls delegate to a bounded child; memory-worker calls reach the deterministic service. */
export declare function registerTools(ctx: HostContextShape, service: MnemonService, coordinator: MnemonSubagentCoordinator, runtimeMemory: RuntimeMemoryController): void;
//# sourceMappingURL=tools.d.ts.map