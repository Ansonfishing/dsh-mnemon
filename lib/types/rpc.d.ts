import type { HostConnectionHandle, HostRpcHandler } from './contracts.ts';
import type { MnemonLifecycle } from './lifecycle.ts';
import type { RuntimeMemoryController } from './runtime-memory.ts';
import type { MnemonService } from './service.ts';
import type { StorageScopeInspector } from './storage-scope.ts';
import type { MnemonPackManager } from './pack.ts';
import type { LiveMnemonRuntime } from './live-runtime.ts';
import { VersionUpdateManager } from './version-updates.ts';
export { MNEMON_PACK_CHANNEL, MNEMON_READ_CHANNEL, MNEMON_WRITE_CHANNEL } from './channels.ts';
type RuntimeInput = MnemonService | LiveMnemonRuntime;
export declare function createReadHandler(input: RuntimeInput, lifecycle?: MnemonLifecycle, runtimeMemory?: RuntimeMemoryController, storage?: StorageScopeInspector, versions?: VersionUpdateManager): HostRpcHandler;
export declare function createWriteHandler(input: RuntimeInput, lifecycle?: MnemonLifecycle, runtimeMemory?: RuntimeMemoryController, versions?: VersionUpdateManager): HostRpcHandler;
/** Backup payloads contain private memory and therefore remain loopback-only. */
export declare function createPackHandler(manager: MnemonPackManager, writeEnabled?: boolean | (() => boolean)): HostRpcHandler;
/** Read operations are available to trusted Web hosts; local mutations stay loopback-only. */
export declare function registerRpc(connection: HostConnectionHandle, input: RuntimeInput, lifecycle?: MnemonLifecycle, runtimeMemory?: RuntimeMemoryController, storage?: StorageScopeInspector, packs?: MnemonPackManager, versions?: VersionUpdateManager): void;
//# sourceMappingURL=rpc.d.ts.map