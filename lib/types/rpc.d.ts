import type { HostConnectionHandle, HostRpcHandler } from './contracts.ts';
import type { MnemonService } from './service.ts';
export declare const MNEMON_READ_CHANNEL = "/dsh-mnemon-read";
export declare const MNEMON_WRITE_CHANNEL = "/dsh-mnemon-write";
export declare function createReadHandler(service: MnemonService): HostRpcHandler;
export declare function createWriteHandler(service: MnemonService): HostRpcHandler;
/** Read operations are available to trusted Web hosts; local mutations stay loopback-only. */
export declare function registerRpc(connection: HostConnectionHandle, service: MnemonService): void;
//# sourceMappingURL=rpc.d.ts.map