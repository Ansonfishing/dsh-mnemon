import { type ProcessRunner } from './process.ts';
export type VersionComponentId = 'mnemon' | 'dsh-mnemon';
export type VersionInstallMode = 'homebrew' | 'go' | 'npm' | 'link' | 'manual' | 'missing';
export interface VersionComponentStatus {
    id: VersionComponentId;
    name: string;
    current?: string;
    latest?: string;
    outdated: boolean;
    installMode: VersionInstallMode;
    updateSupported: boolean;
    updateHint: string;
    checkError?: string;
}
export interface VersionStatus {
    checkedAt: string;
    components: VersionComponentStatus[];
}
export interface VersionUpdateResult {
    component: VersionComponentId;
    previousVersion?: string;
    currentVersion?: string;
    updated: boolean;
    restartRequired: boolean;
    output?: string;
}
export interface VersionUpdateDependencies {
    packageManifestPath?: string;
    dshHome?: string;
    mnemonCliPath?: () => string | undefined;
    processRunner?: ProcessRunner;
    resolveExecutable?: (command: string) => string | undefined;
    fetchNpmLatest?: (name: string) => Promise<string | undefined>;
    fetchMnemonLatest?: () => Promise<string | undefined>;
}
/** Resolve one executable without invoking a shell. */
export declare function resolveExecutable(command: string): string | undefined;
export interface SemverParts {
    major: number;
    minor: number;
    patch: number;
    prerelease: string[];
}
export declare function parseSemver(value: string): SemverParts | undefined;
export declare function compareVersions(a: string, b: string): number;
export declare class VersionUpdateManager {
    private dshMnemonVersion;
    private readonly packageManifestPath;
    private readonly dshHome;
    private readonly mnemonCliPath;
    private readonly processRunner;
    private readonly executable;
    private readonly fetchNpmLatest;
    private readonly fetchMnemonLatest;
    constructor(dependencies?: VersionUpdateDependencies);
    get currentDshMnemonVersion(): string;
    private inspectMnemon;
    check(): Promise<VersionStatus>;
    update(component: VersionComponentId): Promise<VersionUpdateResult>;
}
//# sourceMappingURL=version-updates.d.ts.map