import type { ResolvedConfig } from './config.ts'
import { DocumentManager } from './documents.ts'
import { MnemonPackManager } from './pack.ts'
import { createRunner, type MnemonRunner } from './runner.ts'
import { RuntimeMemoryController } from './runtime-memory.ts'
import { MnemonService } from './service.ts'
import { StorageScopeInspector } from './storage-scope.ts'

export interface MnemonRuntimeGraph {
  config: ResolvedConfig
  runner: MnemonRunner
  service: MnemonService
  runtimeMemory: RuntimeMemoryController
  documents: DocumentManager
  storage: StorageScopeInspector
  packs: MnemonPackManager
}

/**
 * Build a complete generation before it can become visible. Constructors also
 * validate and initialize the selected storage root, so a failed candidate is
 * rejected by DSH settings validation without disturbing the active graph.
 */
export function createRuntimeGraph(config: ResolvedConfig): MnemonRuntimeGraph {
  const runner = createRunner(config)
  const service = new MnemonService(runner, config)
  const runtimeMemory = new RuntimeMemoryController(runner)
  const documents = new DocumentManager(undefined, undefined, () => runner.effectiveDataDir())
  const storage = new StorageScopeInspector(runner, config)
  const packs = new MnemonPackManager(runner, config, components => {
    if (components.includes('memory-spaces')) service.memoryBodies.reload()
  })
  return { config, runner, service, runtimeMemory, documents, storage, packs }
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

  readonly config: ResolvedConfig
  readonly runner: MnemonRunner
  readonly service: MnemonService
  readonly runtimeMemory: RuntimeMemoryController
  readonly documents: DocumentManager
  readonly storage: StorageScopeInspector
  readonly packs: MnemonPackManager

  constructor(initial: MnemonRuntimeGraph) {
    this.current = initial
    this.config = liveProxy(() => this.current.config)
    this.runner = liveProxy(() => this.current.runner)
    this.service = liveProxy(() => this.current.service)
    this.runtimeMemory = liveProxy(() => this.current.runtimeMemory)
    this.documents = liveProxy(() => this.current.documents)
    this.storage = liveProxy(() => this.current.storage)
    this.packs = liveProxy(() => this.current.packs)
  }

  swap(next: MnemonRuntimeGraph): void {
    this.current = next
  }

  snapshot(): MnemonRuntimeGraph {
    return this.current
  }
}
