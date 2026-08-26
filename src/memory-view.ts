import { createHash } from 'node:crypto'
import type { MemoryOperationScope } from '../packages/contracts/src/index.ts'
import { MemoryTurnViewManager, type MemorySource } from '../packages/kernel/src/index.ts'
import type { DocumentManager } from './documents.ts'
import { resolveGitBranch } from './git-branch.ts'
import type { MemoryKernel } from './memory-system/kernel.ts'
import type { RuntimeMemoryController } from './runtime-memory.ts'
import type { MnemonService } from './service.ts'

export interface DefaultMemorySources {
  runtimeMemory: RuntimeMemoryController
  documents: DocumentManager
  service: MnemonService
}

/** Compatibility name for the v0.3 pre-release API. */
export type DefaultMemoryViewSources = DefaultMemorySources

export type BranchResolver = (cwd?: string) => string | undefined

export interface DefaultMemoryTurnViewManagerOptions {
  /** Override the git branch probe used for runtime branch scoping. Defaults to resolveGitBranch. */
  resolveBranch?: BranchResolver
}

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function workspace(scope: MemoryOperationScope | undefined): string | undefined {
  const value = scope?.workspaceId?.trim()
  return value === undefined || value === '' ? undefined : value
}

export function createRuntimeMemorySource(runtimeMemory: RuntimeMemoryController, resolveBranch: BranchResolver = resolveGitBranch): MemorySource {
  return {
    layerId: 'runtime',
    mode: 'eager',
    snapshot: context => {
      // The branch is resolved per publication from the workspace root. A missing or
      // detached HEAD degrades to the unfiltered projection; a mid-turn checkout is
      // picked up by the next turn's pinned view.
      const projection = runtimeMemory.contextProjection(resolveBranch(workspace(context.scope)))
      return {
        revision: projection.revision,
        wake: projection.text,
      }
    },
  }
}

function documentsSource(documents: DocumentManager): MemorySource {
  return {
    layerId: 'documents',
    mode: 'routed',
    snapshot: context => {
      const workspaceRoot = workspace(context.scope)
      if (workspaceRoot === undefined) {
        return {
          revision: 'unavailable:no-workspace',
          wake: 'No workspace-scoped project Documents are available for this turn.',
          state: { documentIds: [] },
        }
      }
      try {
        const snapshot = documents.forWorkspace(workspaceRoot).snapshot()
        const active = snapshot.documents
          .filter(document => document.status === 'active' && document.healthy)
          .sort((left, right) => left.id.localeCompare(right.id))
        return {
          revision: snapshot.revision,
          wake: `${active.length} active project Document${active.length === 1 ? '' : 's'}.`,
          state: { documentIds: active.map(document => document.id) },
        }
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error)
        return {
          revision: `unavailable:${hash(reason)}`,
          wake: 'Project Documents are temporarily unavailable; Runtime Memory remains active.',
          state: { documentIds: [] },
        }
      }
    },
  }
}

function memorySpacesSource(service: MnemonService): MemorySource {
  return {
    layerId: 'memory-spaces',
    mode: 'routed',
    snapshot: () => {
      try {
        const bodies = service.memoryBodies.list()
        const active = service.memoryBodies.active().sort((left, right) => left.id.localeCompare(right.id))
        const providers = new Set(active.map(body => body.provider.id))
        return {
          revision: service.memoryRevision(),
          wake: `${active.length} active of ${bodies.length} configured Memory Space${bodies.length === 1 ? '' : 's'} across ${providers.size} Provider${providers.size === 1 ? '' : 's'}.`,
          state: { memoryBodyIds: active.map(body => body.id) },
        }
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error)
        return {
          revision: `unavailable:${hash(reason)}`,
          wake: 'Memory Spaces are temporarily unavailable; Runtime Memory remains active.',
          state: { memoryBodyIds: [] },
        }
      }
    },
  }
}

export function createDefaultMemoryTurnViewManager(
  kernel: MemoryKernel,
  sources: DefaultMemorySources,
  options: DefaultMemoryTurnViewManagerOptions = {},
): MemoryTurnViewManager {
  return new MemoryTurnViewManager(kernel, [
    createRuntimeMemorySource(sources.runtimeMemory, options.resolveBranch ?? resolveGitBranch),
    documentsSource(sources.documents),
    memorySpacesSource(sources.service),
  ])
}

/** Compatibility name for the v0.3 pre-release API. */
export const createDefaultMemoryViewManager = createDefaultMemoryTurnViewManager
