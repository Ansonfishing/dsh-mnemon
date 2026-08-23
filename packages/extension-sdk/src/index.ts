import type { MemoryAdapterRegistration, MemoryCatalog, MemoryLayerRegistration, MemoryStrategyRegistration } from '../../kernel/src/catalog.ts'
import type { MemoryGuardRegistration, MemoryKernel } from '../../kernel/src/kernel.ts'
import type { MemoryViewManager, MemoryViewProjector } from '../../kernel/src/view.ts'

const EXTENSION_ID = /^[a-z][a-z0-9-]{0,127}$/u

export interface MemoryExtensionDescriptor {
  id: string
  version: string
  label: string
  description: string
}

export interface MemoryExtension {
  descriptor: MemoryExtensionDescriptor
  layers?: readonly MemoryLayerRegistration[]
  adapters?: readonly MemoryAdapterRegistration[]
  strategies?: readonly MemoryStrategyRegistration[]
  /** Trusted, query-independent projection sources for extension Layers. */
  projectors?: readonly MemoryViewProjector[]
  /** Guards can only deny; strategies and data-plane executors cannot bypass them. */
  guards?: readonly MemoryGuardRegistration[]
}

export interface MemoryExtensionAttachment {
  bindKernel(kernel: MemoryKernel): void
  bindViewManager(manager: MemoryViewManager): void
  dispose(): void
  release(): void
}

interface AttachedTarget {
  catalog: MemoryCatalog
  kernel?: MemoryKernel
  viewManager?: MemoryViewManager
  releases: Map<string, () => void>
  released: boolean
}

function reverseDispose(disposers: Array<() => void>): void {
  for (const dispose of disposers.reverse()) dispose()
}

/**
 * Host-global extension control plane. Every runtime graph receives the same
 * contribution set while retaining its own Catalog, Topology and Kernel state.
 */
export class MemoryExtensionHost {
  private readonly extensions = new Map<string, MemoryExtension>()
  private readonly targets = new Set<AttachedTarget>()

  register(extension: MemoryExtension): () => void {
    const id = extension.descriptor.id.trim()
    if (!EXTENSION_ID.test(id)) throw new Error('memory extension id must match [a-z][a-z0-9-]{0,127}')
    if (this.extensions.has(id)) throw new Error(`memory extension is already registered: ${id}`)
    const normalized: MemoryExtension = {
      ...extension,
      descriptor: { ...extension.descriptor, id },
    }
    const applied: AttachedTarget[] = []
    try {
      for (const target of this.targets) {
        target.releases.set(id, this.applyChecked(normalized, target))
        applied.push(target)
      }
    } catch (error) {
      for (const target of applied.reverse()) {
        target.releases.get(id)?.()
        target.releases.delete(id)
      }
      throw error
    }
    this.extensions.set(id, normalized)
    let active = true
    return () => {
      if (!active) return
      if (this.extensions.get(id) !== normalized) {
        active = false
        return
      }
      this.unregister(normalized)
      active = false
    }
  }

  attach(catalog: MemoryCatalog): MemoryExtensionAttachment {
    const target: AttachedTarget = { catalog, releases: new Map(), released: false }
    try {
      for (const extension of this.extensions.values()) {
        target.releases.set(extension.descriptor.id, this.apply(extension, target))
      }
    } catch (error) {
      reverseDispose([...target.releases.values()])
      throw error
    }
    this.targets.add(target)
    return {
      bindKernel: kernel => {
        if (target.released) throw new Error('memory extension attachment is released')
        if (target.kernel !== undefined) throw new Error('memory extension attachment already has a kernel')
        target.kernel = kernel
        const guardReleases = new Map<string, () => void>()
        try {
          for (const extension of this.extensions.values()) {
            const disposers: Array<() => void> = []
            try {
              for (const guard of extension.guards ?? []) disposers.push(kernel.registerGuard(guard))
              guardReleases.set(extension.descriptor.id, () => reverseDispose(disposers))
            } catch (error) {
              reverseDispose(disposers)
              throw error
            }
          }
          for (const [id, releaseGuards] of guardReleases) {
            const releaseCatalog = target.releases.get(id) ?? (() => {})
            target.releases.set(id, () => {
              releaseGuards()
              releaseCatalog()
            })
          }
        } catch (error) {
          reverseDispose([...guardReleases.values()])
          delete target.kernel
          throw error
        }
      },
      bindViewManager: manager => {
        if (target.released) throw new Error('memory extension attachment is released')
        if (target.viewManager !== undefined) throw new Error('memory extension attachment already has a View manager')
        target.viewManager = manager
        const projectorReleases = new Map<string, () => void>()
        try {
          for (const extension of this.extensions.values()) {
            const disposers: Array<() => void> = []
            try {
              for (const projector of extension.projectors ?? []) {
                if (target.catalog.layer(projector.layerId) === undefined) throw new Error(`memory View projector layer is unavailable: ${projector.layerId}`)
                disposers.push(manager.registerProjector(projector))
              }
              projectorReleases.set(extension.descriptor.id, () => reverseDispose(disposers))
            } catch (error) {
              reverseDispose(disposers)
              throw error
            }
          }
          manager.assertProjectionReady()
          for (const [id, releaseProjectors] of projectorReleases) {
            const releasePrevious = target.releases.get(id) ?? (() => {})
            target.releases.set(id, () => {
              releaseProjectors()
              releasePrevious()
            })
          }
        } catch (error) {
          reverseDispose([...projectorReleases.values()])
          delete target.viewManager
          throw error
        }
      },
      dispose: () => {
        if (target.released) return
        target.released = true
        this.targets.delete(target)
        reverseDispose([...target.releases.values()])
        target.releases.clear()
      },
      // Releasing a retired runtime stops future extension updates but keeps
      // its registrations intact for operations already pinned to that graph.
      release: () => {
        if (target.released) return
        target.released = true
        this.targets.delete(target)
        target.releases.clear()
      },
    }
  }

  descriptors(): MemoryExtensionDescriptor[] {
    return [...this.extensions.values()]
      .map(extension => ({ ...extension.descriptor }))
      .sort((left, right) => left.id.localeCompare(right.id))
  }

  private apply(extension: MemoryExtension, target: AttachedTarget): () => void {
    const disposers: Array<() => void> = []
    try {
      for (const layer of extension.layers ?? []) disposers.push(target.catalog.registerLayer(layer))
      for (const adapter of extension.adapters ?? []) disposers.push(target.catalog.registerAdapter(adapter))
      for (const strategy of extension.strategies ?? []) disposers.push(target.catalog.registerStrategy(strategy))
      if (target.kernel !== undefined) {
        for (const guard of extension.guards ?? []) disposers.push(target.kernel.registerGuard(guard))
      }
      if (target.viewManager !== undefined) {
        for (const projector of extension.projectors ?? []) {
          if (target.catalog.layer(projector.layerId) === undefined) throw new Error(`memory View projector layer is unavailable: ${projector.layerId}`)
          disposers.push(target.viewManager.registerProjector(projector))
        }
      }
      return () => reverseDispose(disposers)
    } catch (error) {
      reverseDispose(disposers)
      throw error
    }
  }

  private applyChecked(extension: MemoryExtension, target: AttachedTarget): () => void {
    const release = this.apply(extension, target)
    try {
      target.viewManager?.assertProjectionReady()
      return release
    } catch (error) {
      release()
      throw error
    }
  }

  /** Remove one global extension from every live graph, or restore it everywhere. */
  private unregister(extension: MemoryExtension): void {
    const id = extension.descriptor.id
    const removed: AttachedTarget[] = []
    try {
      for (const target of this.targets) {
        const release = target.releases.get(id)
        if (release === undefined) continue
        release()
        target.releases.delete(id)
        removed.push(target)
        target.viewManager?.assertProjectionReady()
      }
    } catch (error) {
      const rollbackFailures: unknown[] = []
      for (const target of removed.reverse()) {
        try {
          target.releases.set(id, this.applyChecked(extension, target))
        } catch (rollbackError) {
          rollbackFailures.push(rollbackError)
        }
      }
      if (rollbackFailures.length > 0) {
        throw new AggregateError([error, ...rollbackFailures], `memory extension ${id} unload failed and could not be fully rolled back`)
      }
      throw error
    }
    this.extensions.delete(id)
  }
}

export function defineMemoryExtension<T extends MemoryExtension>(extension: T): T {
  return extension
}

/** Process-global registry, allowing extension modules to contribute before the DSH Host mounts. */
export const memoryExtensions = new MemoryExtensionHost()

export function registerMemoryExtension(extension: MemoryExtension): () => void {
  return memoryExtensions.register(extension)
}

export type { MemoryAdapterRegistration, MemoryLayerRegistration, MemoryStrategyRegistration } from '../../kernel/src/catalog.ts'
export type { MemoryGuardRegistration } from '../../kernel/src/kernel.ts'
export type { MemoryViewProjector } from '../../kernel/src/view.ts'
