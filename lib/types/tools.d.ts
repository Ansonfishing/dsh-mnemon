import type { HostContextShape } from './contracts.ts';
import { MnemonSubagentCoordinator } from './subagent.ts';
import { type MnemonService } from './service.ts';
/** Root calls delegate to a bounded child; memory-worker calls reach the deterministic service. */
export declare function registerTools(ctx: HostContextShape, service: MnemonService, coordinator: MnemonSubagentCoordinator): void;
//# sourceMappingURL=tools.d.ts.map