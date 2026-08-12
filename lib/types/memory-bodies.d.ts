import type { MnemonRunner } from './runner.ts';
export interface MemoryBody {
    id: string;
    name: string;
    description: string;
    active: boolean;
    dbPath: string;
    createdAt: string;
    updatedAt: string;
}
export interface CreateMemoryBodyRequest {
    id?: string;
    name: string;
    description?: string;
    active?: boolean;
}
export interface UpdateMemoryBodyRequest {
    name?: string;
    description?: string;
    active?: boolean;
}
export declare function validateMemoryBodyId(value: string): string;
/**
 * Persistent metadata layered over Mnemon's native named stores.
 *
 * The registry lives beside the store directories, while each body keeps using
 * Mnemon's stable `<dataDir>/data/<id>/mnemon.db` layout.
 */
export declare class MemoryBodyRegistry {
    readonly runner: MnemonRunner;
    private readonly persistent;
    private readonly now;
    readonly directory: string;
    readonly registryPath: string;
    private bodies;
    constructor(runner: MnemonRunner, persistent?: boolean, now?: () => Date);
    list(): MemoryBody[];
    active(): MemoryBody[];
    get(id: string): MemoryBody;
    create(request: CreateMemoryBodyRequest, signal?: AbortSignal): Promise<MemoryBody>;
    update(id: string, request: UpdateMemoryBodyRequest): MemoryBody;
    setActive(id: string, active: boolean): MemoryBody;
    private loadAndReconcile;
    private reconcileDiscoveredStores;
    private view;
    private save;
}
//# sourceMappingURL=memory-bodies.d.ts.map