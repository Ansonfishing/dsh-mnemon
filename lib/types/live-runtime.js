import { DocumentManager } from "./documents.js";
import { MnemonPackManager } from "./pack.js";
import { createRunner } from "./runner.js";
import { RuntimeMemoryController } from "./runtime-memory.js";
import { MnemonService } from "./service.js";
import { StorageScopeInspector } from "./storage-scope.js";
/**
 * Build a complete generation before it can become visible. Constructors also
 * validate and initialize the selected storage root, so a failed candidate is
 * rejected by DSH settings validation without disturbing the active graph.
 */
export function createRuntimeGraph(config) {
    const runner = createRunner(config);
    const service = new MnemonService(runner, config);
    const runtimeMemory = new RuntimeMemoryController(runner);
    const documents = new DocumentManager(undefined, undefined, () => runner.effectiveDataDir());
    const storage = new StorageScopeInspector(runner, config);
    const packs = new MnemonPackManager(runner, config, components => {
        if (components.includes('memory-spaces'))
            service.memoryBodies.reload();
    });
    return { config, runner, service, runtimeMemory, documents, storage, packs };
}
/** Resolve every property access against one generation, binding methods to it. */
function liveProxy(resolve) {
    return new Proxy({}, {
        get(_placeholder, property) {
            const target = resolve();
            const value = Reflect.get(target, property, target);
            return typeof value === 'function' ? value.bind(target) : value;
        },
        has(_placeholder, property) {
            return property in resolve();
        },
        ownKeys() {
            return Reflect.ownKeys(resolve());
        },
        getOwnPropertyDescriptor(_placeholder, property) {
            const descriptor = Reflect.getOwnPropertyDescriptor(resolve(), property);
            return descriptor === undefined ? undefined : { ...descriptor, configurable: true };
        },
    });
}
/**
 * Stable faces handed to DSH registrations. `swap` is synchronous and contains
 * no user code, so all faces move to the same prevalidated generation in one
 * JavaScript turn. A method obtained before the swap stays bound to its old
 * generation until that invocation settles.
 */
export class LiveMnemonRuntime {
    current;
    config;
    runner;
    service;
    runtimeMemory;
    documents;
    storage;
    packs;
    constructor(initial) {
        this.current = initial;
        this.config = liveProxy(() => this.current.config);
        this.runner = liveProxy(() => this.current.runner);
        this.service = liveProxy(() => this.current.service);
        this.runtimeMemory = liveProxy(() => this.current.runtimeMemory);
        this.documents = liveProxy(() => this.current.documents);
        this.storage = liveProxy(() => this.current.storage);
        this.packs = liveProxy(() => this.current.packs);
    }
    swap(next) {
        this.current = next;
    }
    snapshot() {
        return this.current;
    }
}
//# sourceMappingURL=live-runtime.js.map