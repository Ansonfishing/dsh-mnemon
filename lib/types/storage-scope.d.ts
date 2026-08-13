import type { ResolvedConfig } from './config.ts';
import type { MnemonRunner } from './runner.ts';
export type StorageScopeKind = 'global' | 'workspace' | 'custom';
export type StorageAreaKind = 'runtime' | 'memory-bodies' | 'documents' | 'state';
export type StorageAreaStatus = 'ready' | 'empty' | 'missing' | 'invalid';
export interface StorageAreaInventory {
    kind: StorageAreaKind;
    path: string;
    status: StorageAreaStatus;
    bytes: number;
    itemCount: number;
    details: Record<string, number | string | boolean>;
    issue?: string;
}
export interface StorageScopeInventory {
    kind: StorageScopeKind;
    root?: string;
    configured: boolean;
    active: boolean;
    available: boolean;
    totalBytes: number;
    areas: StorageAreaInventory[];
    issue?: string;
}
export interface StorageScopeCatalog {
    activeKind: StorageScopeKind;
    activeRoot: string;
    scopes: StorageScopeInventory[];
    generatedAt: string;
}
/** Read-only catalog of the three storage domains. It never creates, moves, or repairs files. */
export declare class StorageScopeInspector {
    private readonly runner;
    private readonly config;
    constructor(runner: Pick<MnemonRunner, 'effectiveDataDir'>, config: Pick<ResolvedConfig, 'dataDir' | 'storageScope'>);
    catalog(workspaceRoot?: string): StorageScopeCatalog;
}
export declare function validateCustomStorageRoot(value: string): string;
//# sourceMappingURL=storage-scope.d.ts.map