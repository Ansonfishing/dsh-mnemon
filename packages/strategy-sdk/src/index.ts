import type { MemoryPlanProposal, MemoryPlanRequest, MemoryStrategyDescriptor, MemorySystemDescriptor } from '../../contracts/src/index.ts'
import type { MemoryStrategyContext, MemoryStrategyRegistration } from '../../kernel/src/index.ts'

export const MEMORY_STRATEGY_PLUGIN_API_VERSION = 'dsh-mnemon/v1alpha1' as const

export interface MemoryStrategyPluginManifest {
  apiVersion: typeof MEMORY_STRATEGY_PLUGIN_API_VERSION
  kind: 'MemoryStrategyPlugin'
  metadata: {
    id: string
    version: string
    label: string
    description: string
  }
  permissions: {
    layerIds: string[]
    adapterIds: string[]
    capabilities: MemoryPlanRequest['capability'][]
    maxSteps: number
  }
}

export interface MemoryStrategyPlugin {
  manifest: MemoryStrategyPluginManifest
  strategy: MemoryStrategyRegistration
}

/** Define an immutable, declarative strategy package; the Kernel remains authoritative. */
export function defineMemoryStrategyPlugin(plugin: MemoryStrategyPlugin): Readonly<MemoryStrategyPlugin> {
  if (plugin.manifest.apiVersion !== MEMORY_STRATEGY_PLUGIN_API_VERSION) throw new Error(`unsupported memory strategy plugin API: ${plugin.manifest.apiVersion}`)
  if (plugin.manifest.kind !== 'MemoryStrategyPlugin') throw new Error('memory strategy plugin kind must be MemoryStrategyPlugin')
  if (plugin.manifest.metadata.id !== plugin.strategy.descriptor.id || plugin.manifest.metadata.version !== plugin.strategy.descriptor.version) {
    throw new Error('memory strategy plugin manifest does not match its strategy identity')
  }
  if (!Number.isInteger(plugin.manifest.permissions.maxSteps) || plugin.manifest.permissions.maxSteps < 1 || plugin.manifest.permissions.maxSteps > 100) {
    throw new Error('memory strategy plugin maxSteps must be an integer within 1..100')
  }
  const manifest = Object.freeze({
    ...plugin.manifest,
    metadata: Object.freeze({ ...plugin.manifest.metadata }),
    permissions: Object.freeze({
      ...plugin.manifest.permissions,
      layerIds: Object.freeze([...new Set(plugin.manifest.permissions.layerIds)]) as unknown as string[],
      adapterIds: Object.freeze([...new Set(plugin.manifest.permissions.adapterIds)]) as unknown as string[],
      capabilities: Object.freeze([...new Set(plugin.manifest.permissions.capabilities)]) as unknown as MemoryPlanRequest['capability'][],
    }),
  })
  const allowedLayers = new Set(manifest.permissions.layerIds)
  const allowedAdapters = new Set(manifest.permissions.adapterIds)
  const allowedCapabilities = new Set(manifest.permissions.capabilities)
  const propose = plugin.strategy.propose.bind(plugin.strategy)
  const strategy: MemoryStrategyRegistration = Object.freeze({
    descriptor: Object.freeze({
      ...plugin.strategy.descriptor,
      hooks: Object.freeze([...plugin.strategy.descriptor.hooks]) as unknown as MemoryStrategyDescriptor['hooks'],
    }),
    async propose(request: MemoryPlanRequest, context: MemoryStrategyContext) {
      if (!allowedCapabilities.has(request.capability)) throw new Error(`memory strategy plugin is not permitted to use ${request.capability}`)
      const proposal = await propose(request, context)
      if (proposal.steps.length > manifest.permissions.maxSteps) {
        throw new Error(`memory strategy plugin proposed ${proposal.steps.length} steps; manifest allows ${manifest.permissions.maxSteps}`)
      }
      for (const step of proposal.steps) {
        if (!allowedLayers.has(step.layerId)) throw new Error(`memory strategy plugin is not permitted to use layer ${step.layerId}`)
        if (!allowedCapabilities.has(step.capability)) throw new Error(`memory strategy plugin is not permitted to use ${step.capability}`)
        if (step.adapterId !== undefined && !allowedAdapters.has(step.adapterId)) {
          throw new Error(`memory strategy plugin is not permitted to use adapter ${step.adapterId}`)
        }
      }
      return proposal
    },
  })
  return Object.freeze({ manifest, strategy })
}

export interface MemoryStrategyReplayCase {
  request: MemoryPlanRequest
  descriptor: MemorySystemDescriptor
  assert(proposal: MemoryPlanProposal): void | Promise<void>
}

/** Deterministic replay primitive for generated and hand-written strategies. */
export async function replayMemoryStrategy(strategy: MemoryStrategyRegistration, cases: readonly MemoryStrategyReplayCase[]): Promise<void> {
  for (const replay of cases) {
    const proposal = await strategy.propose(replay.request, replay.descriptor)
    await replay.assert(proposal)
  }
}

export function defineMemoryStrategy<T extends MemoryStrategyRegistration>(strategy: T): T {
  return strategy
}

export type {
  MemoryPlanProposal,
  MemoryPlanRequest,
  MemoryStrategyDescriptor,
  MemoryStrategyHook,
  MemorySystemDescriptor,
} from '../../contracts/src/index.ts'
export type { MemoryStrategyContext, MemoryStrategyRegistration } from '../../kernel/src/index.ts'
