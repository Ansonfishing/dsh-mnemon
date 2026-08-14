import type { ResolvedConfig } from './config.ts';
import type { MnemonRunner } from './runner.ts';
export declare const MNEMON_PACK_FORMAT = "mnemonpack";
export declare const MNEMON_PACK_VERSION = 1;
export declare const MNEMON_PACK_MIME = "application/zip";
export declare const MNEMON_PACK_MAX_ARCHIVE_BYTES: number;
export declare const MNEMON_PACK_MAX_EXPANDED_BYTES: number;
declare const COMPONENT_ORDER: readonly ["runtime", "documents", "memory-spaces"];
export type MnemonPackComponent = typeof COMPONENT_ORDER[number];
export type MnemonPackScope = 'full' | MnemonPackComponent;
export type MnemonPackImportMode = 'merge' | 'replace';
export interface MnemonPackComponentSummary {
    component: MnemonPackComponent;
    files: number;
    bytes: number;
    items: number;
}
export interface MnemonPackManifest {
    format: typeof MNEMON_PACK_FORMAT;
    version: typeof MNEMON_PACK_VERSION;
    scope: MnemonPackScope;
    exportedAt: string;
    source: {
        plugin: 'dsh-mnemon';
        pluginVersion: string;
    };
    components: MnemonPackComponent[];
    summary: MnemonPackComponentSummary[];
}
export interface MnemonPackExport {
    fileName: string;
    mimeType: typeof MNEMON_PACK_MIME;
    bytes: number;
    base64: string;
    targetRoot: string;
    manifest: MnemonPackManifest;
}
export interface MnemonPackPreview {
    fileName?: string;
    archiveBytes: number;
    expandedBytes: number;
    targetRoot: string;
    targetScope: ResolvedConfig['storageScope'];
    manifest: MnemonPackManifest;
    occupied: Record<MnemonPackComponent, boolean>;
}
export interface MnemonPackImportResult {
    imported: true;
    mode: MnemonPackImportMode;
    targetRoot: string;
    components: MnemonPackComponent[];
    summary: MnemonPackComponentSummary[];
}
/** Native, checksummed import/export for the one currently effective Mnemon root. */
export declare class MnemonPackManager {
    private readonly runner;
    private readonly config;
    private readonly afterImport;
    private readonly now;
    private readonly root;
    constructor(runner: MnemonRunner, config: Pick<ResolvedConfig, 'storageScope'>, afterImport?: (components: MnemonPackComponent[]) => void, now?: () => Date);
    target(): {
        root: string;
        scope: ResolvedConfig['storageScope'];
    };
    exportPack(scope: MnemonPackScope): Promise<MnemonPackExport>;
    inspectPack(base64: string, fileName?: string): MnemonPackPreview;
    importPack(base64: string, options: {
        mode: MnemonPackImportMode;
        components?: MnemonPackComponent[];
    }): Promise<MnemonPackImportResult>;
}
export {};
//# sourceMappingURL=pack.d.ts.map