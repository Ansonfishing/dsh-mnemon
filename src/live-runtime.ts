import type { ResolvedConfig } from './config.ts'
import { resolve } from 'node:path'
import type { HostAgent, HostAgentsService, HostWorkspace, HostWorkspaceRegistry } from './contracts.ts'
import { DocumentManager } from './documents.ts'
import { MnemonPackManager } from './pack.ts'
import { createRunner, type MnemonRunner } from './runner.ts'
import { RuntimeMemoryController } from './runtime-memory.ts'
import { MnemonService } from './service.ts'
import { StorageScopeInspector } from './storage-scope.ts'
import { MemoryCatalog } from './memory-system/catalog.ts'
import { MemoryKernel } from './memory-system/kernel.ts'
import { registerDefaultMemorySystem } from './memory-system/defaults.ts'
import { MemoryTopologyManager } from './memory-system/topology.ts'
import { registerBuiltinMemoryAdapters } from './providers/memory-system.ts'
import type { MemoryExtensionHost } from '../packages/extension-sdk/src/index.ts'
import type { MemoryViewManager } from '../packages/kernel/src/index.ts'
import { createDefaultMemoryViewManager } from './memory-view.ts'

export interface MnemonRuntimeGraph {
  config: ResolvedConfig
  runner: MnemonRunner
  service: MnemonService
  runtimeMemory: RuntimeMemoryController
  documents: DocumentManager
  storage: StorageScopeInspector
  packs: MnemonPackManager
  memoryCatalog: MemoryCatalog
  memoryTopology: MemoryTopologyManager
  memoryKernel: MemoryKernel
  memoryViews: MemoryViewManager
  /** Detach this generation from future Host-global extension changes. */
  dispose(): void
}

/**
 * Build a complete generation before it can become visible. Constructors also
 * validate and initialize the selected storage root, so a failed candidate is
 * rejected by DSH settings validation without disturbing the active graph.
 */
export function createRuntimeGraph(config: ResolvedConfig, workspaceRoot?: string, extensions?: MemoryExtensionHost): MnemonRuntimeGraph {
  const memoryCatalog = new MemoryCatalog()
  registerDefaultMemorySystem(memoryCatalog)
  registerBuiltinMemoryAdapters(memoryCatalog)
  const extensionAttachment = extensions?.attach(memoryCatalog)
  try {
    const configuredLayers = Object.entries(config.memoryTopology.layers).map(([id, layer]) => ({ id, ...layer }))
    const configuredIds = new Set(configuredLayers.map(layer => layer.id))
    const discoveredLayers = memoryCatalog.snapshot().layers
      .filter(layer => !configuredIds.has(layer.id))
      .map(layer => ({
        id: layer.id,
        enabled: false,
        participation: { recall: 'manual' as const, write: 'manual' as const, projection: 'manual' as const, maintenance: 'manual' as const },
        adapterIds: [],
      }))
    const memoryTopology = new MemoryTopologyManager(memoryCatalog, {
      id: config.memoryTopology.id,
      strategyId: config.memoryTopology.strategyId,
      layers: [...configuredLayers, ...discoveredLayers],
    })
    const memoryKernel = new MemoryKernel(memoryCatalog, memoryTopology)
    extensionAttachment?.bindKernel(memoryKernel)
    const runner = createRunner(config, undefined, workspaceRoot)
    const service = new MnemonService(runner, config)
    const runtimeMemory = new RuntimeMemoryController(runner)
    const documents = new DocumentManager(undefined, undefined, () => runner.effectiveDataDir())
    const storage = new StorageScopeInspector(runner, config)
    const packs = new MnemonPackManager(runner, config, components => {
      if (components.includes('memory-spaces')) service.memoryBodies.reload()
    })
    const memoryViews = createDefaultMemoryViewManager(memoryKernel, { runtimeMemory, documents, service })
    let disposed = false
    return {
      config, runner, service, runtimeMemory, documents, storage, packs, memoryCatalog, memoryTopology, memoryKernel, memoryViews,
      dispose: () => {
        if (disposed) return
        disposed = true
        memoryTopology.dispose()
        extensionAttachment?.release()
      },
    }
  } catch (error) {
    extensionAttachment?.dispose()
    throw error
  }
}

/** Resolve every property access against one generation, binding methods to it. */
function liveProxy<T extends object>(resolve: () => T): T {
  return new Proxy({} as T, {
    get(_placeholder, property) {
      const target = resolve()
      const value = Reflect.get(target, property, target) as unknown
      return typeof value === 'function' ? value.bind(target) : value
    },
    has(_placeholder, property) {
      return property in resolve()
    },
    ownKeys() {
      return Reflect.ownKeys(resolve())
    },
    getOwnPropertyDescriptor(_placeholder, property) {
      const descriptor = Reflect.getOwnPropertyDescriptor(resolve(), property)
      return descriptor === undefined ? undefined : { ...descriptor, configurable: true }
    },
  })
}

/**
 * Stable faces handed to DSH registrations. `swap` is synchronous and contains
 * no user code, so all faces move to the same prevalidated generation in one
 * JavaScript turn. A method obtained before the swap stays bound to its old
 * generation until that invocation settles.
 */
export class LiveMnemonRuntime {
  private current: MnemonRuntimeGraph
  private readonly workspaceGraphs = new Map<string, MnemonRuntimeGraph>()

  readonly config: ResolvedConfig
  readonly runner: MnemonRunner
  readonly service: MnemonService
  readonly runtimeMemory: RuntimeMemoryController
  readonly documents: DocumentManager
  readonly storage: StorageScopeInspector
  readonly packs: MnemonPackManager
  readonly memoryCatalog: MemoryCatalog
  readonly memoryTopology: MemoryTopologyManager
  readonly memoryKernel: MemoryKernel
  readonly memoryViews: MemoryViewManager

  constructor(initial: MnemonRuntimeGraph, private readonly workspaceRegistry?: HostWorkspaceRegistry, private readonly agents?: HostAgentsService, private readonly extensions?: MemoryExtensionHost) {
    this.current = initial
    this.config = liveProxy(() => this.current.config)
    this.runner = liveProxy(() => this.current.runner)
    this.service = liveProxy(() => this.current.service)
    this.runtimeMemory = liveProxy(() => this.current.runtimeMemory)
    this.documents = liveProxy(() => this.current.documents)
    this.storage = liveProxy(() => this.current.storage)
    this.packs = liveProxy(() => this.current.packs)
    this.memoryCatalog = liveProxy(() => this.current.memoryCatalog)
    this.memoryTopology = liveProxy(() => this.current.memoryTopology)
    this.memoryKernel = liveProxy(() => this.current.memoryKernel)
    this.memoryViews = liveProxy(() => this.current.memoryViews)
  }

  swap(next: MnemonRuntimeGraph): void {
    const previous = this.current
    this.current = next
    previous.dispose()
    for (const graph of this.workspaceGraphs.values()) graph.dispose()
    this.workspaceGraphs.clear()
  }

  snapshot(): MnemonRuntimeGraph {
    return this.current
  }

  /** Resolve the runtime that must serve one Agent execution. */
  forAgent(agent: HostAgent): MnemonRuntimeGraph {
    if (this.current.config.storageScope !== 'workspace') return this.current
    const cwd = agent.session.header?.cwd?.trim()
    if (cwd === undefined || cwd === '') throw new Error('the current DSH session has no workspace for Mnemon')
    return this.forWorkspacePath(cwd)
  }

  /** Resolve an authorized DSH workspace selected by the Web workbench. */
  forWorkspaceId(workspaceId: string): MnemonRuntimeGraph {
    const workspace = this.requireWorkspace(workspaceId)
    return this.current.config.storageScope === 'workspace' ? this.forWorkspacePath(workspace.path) : this.current
  }

  /** Resolve a Web request, preferring its explicit inspection workspace. */
  route(request: { workspaceId?: string; sessionId?: string }): {
    graph: MnemonRuntimeGraph
    selectedWorkspace?: HostWorkspace
    effectiveWorkspace?: HostWorkspace
    selectedRoot: string
    effectiveRoot: string
    aligned: boolean
  } {
    const effectiveAgent = this.agent(request.sessionId)
    const effectiveWorkspace = effectiveAgent === undefined ? undefined : this.workspaceForPath(effectiveAgent.session.header?.cwd)
    const selectedWorkspace = request.workspaceId === undefined || request.workspaceId.trim() === ''
      ? effectiveWorkspace
      : this.requireWorkspace(request.workspaceId)
    const graph = selectedWorkspace === undefined
      ? effectiveAgent === undefined ? this.current : this.forAgent(effectiveAgent)
      : this.current.config.storageScope === 'workspace' ? this.forWorkspacePath(selectedWorkspace.path) : this.current
    const effectiveGraph = effectiveAgent === undefined ? this.current : this.forAgent(effectiveAgent)
    const selectedRoot = resolve(graph.runner.effectiveDataDir())
    const effectiveRoot = resolve(effectiveGraph.runner.effectiveDataDir())
    return {
      graph,
      ...(selectedWorkspace === undefined ? {} : { selectedWorkspace }),
      ...(effectiveWorkspace === undefined ? {} : { effectiveWorkspace }),
      selectedRoot,
      effectiveRoot,
      aligned: selectedRoot === effectiveRoot,
    }
  }

  private forWorkspacePath(workspaceRoot: string): MnemonRuntimeGraph {
    const key = resolve(workspaceRoot)
    let graph = this.workspaceGraphs.get(key)
    if (graph === undefined) {
      graph = createRuntimeGraph(this.current.config, key, this.extensions)
      this.workspaceGraphs.set(key, graph)
    }
    return graph
  }

  private agent(sessionId?: string): HostAgent | undefined {
    const normalized = sessionId?.trim()
    return normalized === undefined || normalized === '' ? undefined : this.agents?.get(normalized)
  }

  private requireWorkspace(workspaceId: string): HostWorkspace {
    const normalized = workspaceId.trim()
    const workspace = normalized === '' ? undefined : this.workspaceRegistry?.get(normalized)
    if (workspace === undefined) throw new Error('selected DSH workspace is unavailable')
    return workspace
  }

  private workspaceForPath(path?: string): HostWorkspace | undefined {
    const normalized = path?.trim()
    if (normalized === undefined || normalized === '') return undefined
    const canonical = resolve(normalized)
    return this.workspaceRegistry?.list().find(workspace => resolve(workspace.path) === canonical)
  }
}
