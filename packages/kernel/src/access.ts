import type {
  MemoryCapability,
  MemoryOperationTrigger,
  MemoryParticipationChannel,
  MemoryParticipationMode,
  MemoryTopologyLayer,
} from '../../contracts/src/index.ts'

export function participationChannel(capability: MemoryCapability): MemoryParticipationChannel {
  if (capability === 'project') return 'projection'
  if (['write', 'archive', 'link', 'forget', 'import'].includes(capability)) return 'write'
  if (['maintain', 'export', 'status'].includes(capability)) return 'maintenance'
  return 'recall'
}

export interface MemoryParticipationDecision {
  allowed: boolean
  layerId: string
  capability: MemoryCapability
  trigger: MemoryOperationTrigger
  channel: MemoryParticipationChannel
  mode: MemoryParticipationMode
  reason?: string
}

/** Evaluate one topology boundary without invoking strategy or data-plane code. */
export function decideMemoryLayerParticipation(
  layer: MemoryTopologyLayer,
  capability: MemoryCapability,
  trigger: MemoryOperationTrigger,
): MemoryParticipationDecision {
  const channel = participationChannel(capability)
  const mode = layer.participation[channel]
  const base = { layerId: layer.id, capability, trigger, channel, mode }
  if (!layer.enabled) return { ...base, allowed: false, reason: `memory layer ${layer.id} is disabled by the active topology` }
  if (mode === 'off') return { ...base, allowed: false, reason: `memory layer ${layer.id} has ${channel} participation turned off` }
  if (trigger !== 'manual' && mode !== 'automatic') {
    return { ...base, allowed: false, reason: `memory layer ${layer.id} allows ${channel} only for manual operations` }
  }
  return { ...base, allowed: true }
}

export function assertMemoryLayerParticipation(
  layer: MemoryTopologyLayer,
  capability: MemoryCapability,
  trigger: MemoryOperationTrigger,
): MemoryParticipationDecision {
  const decision = decideMemoryLayerParticipation(layer, capability, trigger)
  if (!decision.allowed) throw new Error(decision.reason)
  return decision
}
