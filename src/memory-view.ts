import { createHash } from 'node:crypto'
import type { MemoryOperationScope } from '../packages/contracts/src/index.ts'
import { MemoryViewManager, type MemoryViewProjector } from '../packages/kernel/src/index.ts'
import type { DocumentManager } from './documents.ts'
import type { MemoryKernel } from './memory-system/kernel.ts'
import type { RuntimeMemoryController } from './runtime-memory.ts'
import type { MnemonService } from './service.ts'

const MAX_DOCUMENTS_IN_WAKE = 64
const MAX_MEMORY_SPACES_IN_WAKE = 64

export interface DefaultMemoryViewSources {
  runtimeMemory: RuntimeMemoryController
  documents: DocumentManager
  service: MnemonService
}

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function compact(value: string, maximum: number): string {
  const normalized = value.replace(/\s+/gu, ' ').trim()
  return normalized.length <= maximum ? normalized : `${normalized.slice(0, Math.max(0, maximum - 1))}…`
}

function workspace(scope: MemoryOperationScope | undefined): string | undefined {
  const value = scope?.workspaceId?.trim()
  return value === undefined || value === '' ? undefined : value
}

function runtimeProjector(runtimeMemory: RuntimeMemoryController): MemoryViewProjector {
  return {
    layerId: 'runtime',
    mode: 'exact',
    project: () => {
      const projection = runtimeMemory.contextProjection()
      return {
        revision: projection.revision,
        nodes: [{
          key: 'runtime',
          kind: 'content',
          label: 'Runtime Memory',
          content: projection.text,
          reference: `runtime:${projection.revision}`,
        }],
      }
    },
  }
}

function documentsProjector(documents: DocumentManager): MemoryViewProjector {
  return {
    layerId: 'documents',
    mode: 'outline',
    project: context => {
      const workspaceRoot = workspace(context.scope)
      if (workspaceRoot === undefined) {
        return {
          revision: 'unavailable:no-workspace',
          nodes: [{ key: 'documents', kind: 'root', label: 'Documents', summary: 'No workspace-scoped Document outline is available for this session.' }],
        }
      }
      try {
        const snapshot = documents.forWorkspace(workspaceRoot).snapshot()
        const active = snapshot.documents
          .filter(document => document.status === 'active' && document.healthy)
          .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt) || left.id.localeCompare(right.id))
        const selected = active.slice(0, MAX_DOCUMENTS_IN_WAKE)
        const omitted = Math.max(0, active.length - selected.length)
        return {
          revision: snapshot.revision,
          nodes: [{
            key: 'documents',
            kind: 'root',
            label: 'Documents',
            summary: `${active.length} active project Document${active.length === 1 ? '' : 's'}${omitted === 0 ? '' : `; ${omitted} omitted from this bounded map`}.`,
            reference: 'documents:active',
          }, ...selected.map(document => ({
            key: `document:${document.id}`,
            parentKey: 'documents',
            kind: 'outline' as const,
            label: compact(document.title, 160),
            summary: compact(document.description || document.excerpt || 'Managed project Document.', 600),
            reference: `document:${document.id}`,
            metadata: {
              documentId: document.id,
              status: document.status,
              revision: document.revision,
              contentHash: document.contentHash,
            },
          }))],
        }
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error)
        return {
          revision: `unavailable:${hash(reason)}`,
          nodes: [{ key: 'documents', kind: 'root', label: 'Documents', summary: 'The optional Document outline is temporarily unavailable; Runtime Memory remains active.' }],
        }
      }
    },
  }
}

function memorySpacesProjector(service: MnemonService): MemoryViewProjector {
  return {
    layerId: 'memory-spaces',
    mode: 'outline',
    project: () => {
      try {
        const bodies = service.memoryBodies.list()
          .sort((left, right) => Number(right.active) - Number(left.active) || left.name.localeCompare(right.name) || left.id.localeCompare(right.id))
        const active = bodies.filter(body => body.active)
        const selected = active.slice(0, MAX_MEMORY_SPACES_IN_WAKE)
        const omitted = Math.max(0, active.length - selected.length)
        const revisionInput = bodies.map(body => ({
          id: body.id,
          name: body.name,
          description: body.description,
          active: body.active,
          providerId: body.provider.id,
          updatedAt: body.updatedAt,
          capabilities: body.provider.capabilities,
        }))
        return {
          revision: hash(JSON.stringify(revisionInput)),
          nodes: [{
            key: 'memory-spaces',
            kind: 'root',
            label: 'Memory Spaces',
            summary: `${active.length} active of ${bodies.length} configured Memory Space${bodies.length === 1 ? '' : 's'}${omitted === 0 ? '' : `; ${omitted} omitted from this bounded map`}.`,
            reference: 'memory-spaces:active',
          }, ...selected.map(body => ({
            key: `memory-space:${body.id}`,
            parentKey: 'memory-spaces',
            kind: 'query' as const,
            label: compact(body.name, 100),
            summary: compact(`${body.description || 'Durable memory evidence.'} Provider: ${body.provider.label}.`, 600),
            reference: `memory-space:${body.id}`,
            metadata: {
              memoryBodyId: body.id,
              providerId: body.provider.id,
              active: body.active,
              search: body.provider.capabilities.search,
              related: body.provider.capabilities.related,
              graph: body.provider.capabilities.graph,
            },
          }))],
        }
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error)
        return {
          revision: `unavailable:${hash(reason)}`,
          nodes: [{ key: 'memory-spaces', kind: 'root', label: 'Memory Spaces', summary: 'The optional Memory Space catalog is temporarily unavailable; use Runtime Memory and retry later.' }],
        }
      }
    },
  }
}

export function createDefaultMemoryViewManager(kernel: MemoryKernel, sources: DefaultMemoryViewSources): MemoryViewManager {
  return new MemoryViewManager(kernel, [
    runtimeProjector(sources.runtimeMemory),
    documentsProjector(sources.documents),
    memorySpacesProjector(sources.service),
  ])
}
