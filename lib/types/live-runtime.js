import { resolve } from 'node:path';
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
export function createRuntimeGraph(config, workspaceRoot) {
    const runner = createRunner(config, undefined, workspaceRoot);
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
    workspaceRegistry;
    agents;
    current;
    workspaceGraphs = new Map();
    config;
    runner;
    service;
    runtimeMemory;
    documents;
    storage;
    packs;
    constructor(initial, workspaceRegistry, agents) {
        this.workspaceRegistry = workspaceRegistry;
        this.agents = agents;
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
        this.workspaceGraphs.clear();
    }
    snapshot() {
        return this.current;
    }
    /** Resolve the runtime that must serve one Agent execution. */
    forAgent(agent) {
        if (this.current.config.storageScope !== 'workspace')
            return this.current;
        const cwd = agent.session.header?.cwd?.trim();
        if (cwd === undefined || cwd === '')
            throw new Error('the current DSH session has no workspace for Mnemon');
        return this.forWorkspacePath(cwd);
    }
    /** Resolve an authorized DSH workspace selected by the Web workbench. */
    forWorkspaceId(workspaceId) {
        const workspace = this.requireWorkspace(workspaceId);
        return this.current.config.storageScope === 'workspace' ? this.forWorkspacePath(workspace.path) : this.current;
    }
    /** Resolve a Web request, preferring its explicit inspection workspace. */
    route(request) {
        const effectiveAgent = this.agent(request.sessionId);
        const effectiveWorkspace = effectiveAgent === undefined ? undefined : this.workspaceForPath(effectiveAgent.session.header?.cwd);
        const selectedWorkspace = request.workspaceId === undefined || request.workspaceId.trim() === ''
            ? effectiveWorkspace
            : this.requireWorkspace(request.workspaceId);
        const graph = selectedWorkspace === undefined
            ? effectiveAgent === undefined ? this.current : this.forAgent(effectiveAgent)
            : this.current.config.storageScope === 'workspace' ? this.forWorkspacePath(selectedWorkspace.path) : this.current;
        const effectiveGraph = effectiveAgent === undefined ? this.current : this.forAgent(effectiveAgent);
        const selectedRoot = resolve(graph.runner.effectiveDataDir());
        const effectiveRoot = resolve(effectiveGraph.runner.effectiveDataDir());
        return {
            graph,
            ...(selectedWorkspace === undefined ? {} : { selectedWorkspace }),
            ...(effectiveWorkspace === undefined ? {} : { effectiveWorkspace }),
            selectedRoot,
            effectiveRoot,
            aligned: selectedRoot === effectiveRoot,
        };
    }
    forWorkspacePath(workspaceRoot) {
        const key = resolve(workspaceRoot);
        let graph = this.workspaceGraphs.get(key);
        if (graph === undefined) {
            graph = createRuntimeGraph(this.current.config, key);
            this.workspaceGraphs.set(key, graph);
        }
        return graph;
    }
    agent(sessionId) {
        const normalized = sessionId?.trim();
        return normalized === undefined || normalized === '' ? undefined : this.agents?.get(normalized);
    }
    requireWorkspace(workspaceId) {
        const normalized = workspaceId.trim();
        const workspace = normalized === '' ? undefined : this.workspaceRegistry?.get(normalized);
        if (workspace === undefined)
            throw new Error('selected DSH workspace is unavailable');
        return workspace;
    }
    workspaceForPath(path) {
        const normalized = path?.trim();
        if (normalized === undefined || normalized === '')
            return undefined;
        const canonical = resolve(normalized);
        return this.workspaceRegistry?.list().find(workspace => resolve(workspace.path) === canonical);
    }
}
//# sourceMappingURL=live-runtime.js.map