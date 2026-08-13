import type { HostContextShape } from './contracts.ts';
import type { RuntimeMemoryController } from './runtime-memory.ts';
export declare const GUIDANCE_SECTION_NAME = "mnemon:routing";
export declare const RUNTIME_MEMORY_SECTION_NAME = "mnemon:runtime-memory";
export declare const ROUTING_GUIDANCE = "Use Mnemon only by need. Call mnemon_recall when prior durable context may matter, especially if hot memory is only a pointer or lacks an exact requested detail; never infer a missing historical rule. New explicit reusable information normally goes to mnemon_runtime_memory; direct archival is exceptional. A write completes only with a tool receipt.";
export declare function registerGuidance(ctx: HostContextShape): void;
/** Inject the latest committed USER.md/MEMORY.md projections on every prompt assembly. */
export declare function registerRuntimeMemoryContext(ctx: HostContextShape, runtimeMemory: RuntimeMemoryController): void;
//# sourceMappingURL=guidance.d.ts.map