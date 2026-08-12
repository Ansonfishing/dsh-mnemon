import type { HostConnectionHandle, HostRpcHandler, HostSettingsService } from './contracts.ts';
export declare const MNEMON_SETTINGS_CHANNEL = "/dsh-mnemon-settings";
export declare const MNEMON_SETTINGS_NAMESPACE = "mnemon";
export declare function createSettingsHandler(settings: HostSettingsService): HostRpcHandler;
export declare function registerSettingsRpc(connection: HostConnectionHandle, settings: HostSettingsService): void;
//# sourceMappingURL=settings.d.ts.map