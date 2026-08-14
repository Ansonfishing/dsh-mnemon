import type { HostConnectionHandle, HostRpcHandler } from './contracts.ts';
import type { MnemonLifecycle } from './lifecycle.ts';
import type { RuntimeMemoryController } from './runtime-memory.ts';
import type { MnemonService } from './service.ts';
import type { StorageScopeInspector } from './storage-scope.ts';
import type { MnemonPackManager } from './pack.ts';
import type { LiveMnemonRuntime } from './live-runtime.ts';
type RuntimeInput = MnemonService | LiveMnemonRuntime;
export declare const MNEMON_READ_CHANNEL = "/dsh-mnemon-read";
export declare const MNEMON_WRITE_CHANNEL = "/dsh-mnemon-write";
export declare const MNEMON_PACK_CHANNEL = "/dsh-mnemon-pack";
export declare function createReadHandler(input: RuntimeInput, lifecycle?: MnemonLifecycle, runtimeMemory?: RuntimeMemoryController, storage?: StorageScopeInspector): HostRpcHandler;
export declare function createWriteHandler(input: RuntimeInput, lifecycle?: MnemonLifecycle, runtimeMemory?: RuntimeMemoryController): HostRpcHandler;
/** Backup payloads contain private memory and therefore remain loopback-only. */
export declare function createPackHandler(manager: MnemonPackManager, writeEnabled?: boolean | (() => boolean)): HostRpcHandler;
/** Read operations are available to trusted Web hosts; local mutations stay loopback-only. */
export declare function registerRpc(connection: HostConnectionHandle, input: RuntimeInput, lifecycle?: MnemonLifecycle, runtimeMemory?: RuntimeMemoryController, storage?: StorageScopeInspector, packs?: MnemonPackManager): void;
export {};
//# sourceMappingURL=rpc.d.ts.map