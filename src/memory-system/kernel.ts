import { randomUUID } from 'node:crypto'
import type { MemoryCatalog, MemoryLayerExecutionContext } from './catalog.ts'
import type {
  MemoryCapability,
  MemoryGuardDecision,
  MemoryOperationTrigger,
  MemoryPlan,
  MemoryPlanRequest,
  MemoryPlanStep,
  MemoryReceipt,
  MemoryReceiptStatus,
  MemoryReceiptStep,
  MemorySystemDescriptor,
} from './contracts.ts'
import { assertMemoryLayerParticipation, decideMemoryLayerParticipation, type MemoryParticipationDecision } from './access.ts'
import { participationChannel } from './defaults.ts'
import type { MemoryTopologyManager } from './topology.ts'

export interface MemoryGuardContext {
  descriptor: MemorySystemDescriptor
}

export interface MemoryGuardRegistration {
  id: string
  decide(request: MemoryPlanRequest, context: MemoryGuardContext): MemoryGuardDecision | Promise<MemoryGuardDecision>
}

export interface MemoryReceiptSink {
  append(receipt: MemoryReceipt): void | Promise<void>
}

export interface MemoryKernelOptions {
  now?: () => Date
  id?: () => string
  receiptSink?: MemoryReceiptSink
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function aborted(signal: AbortSignal | undefined): boolean {
  return signal?.aborted === true
}

function checkBudget(request: MemoryPlanRequest): void {
  const budget = request.budget
  if (budget?.maxSteps !== undefined && (!Number.isInteger(budget.maxSteps) || budget.maxSteps < 1 || budget.maxSteps > 100)) {
    throw new Error('memory plan maxSteps must be an integer within 1..100')
  }
  if (budget?.maxResults !== undefined && (!Number.isInteger(budget.maxResults) || budget.maxResults < 1 || budget.maxResults > 10_000)) {
    throw new Error('memory plan maxResults must be an integer within 1..10000')
  }
  if (budget?.maxTokens !== undefined && (!Number.isInteger(budget.maxTokens) || budget.maxTokens < 1 || budget.maxTokens > 10_000_000)) {
    throw new Error('memory plan maxTokens must be an integer within 1..10000000')
  }
  if (budget?.timeoutMs !== undefined && (!Number.isInteger(budget.timeoutMs) || budget.timeoutMs < 1 || budget.timeoutMs > 3_600_000)) {
    throw new Error('memory plan timeoutMs must be an integer within 1..3600000')
  }
}

/** Plans and executes bounded operations without granting strategies direct data-plane access. */
export class MemoryKernel {
  private readonly guards = new Map<string, MemoryGuardRegistration>()
  private readonly now: () => Date
  private readonly id: () => string
  private readonly receiptSink: MemoryReceiptSink | undefined

  constructor(
    readonly catalog: MemoryCatalog,
    readonly topology: MemoryTopologyManager,
    options: MemoryKernelOptions = {},
  ) {
    this.now = options.now ?? (() => new Date())
    this.id = options.id ?? randomUUID
    this.receiptSink = options.receiptSink
  }

  descriptor(): MemorySystemDescriptor {
    return { catalog: this.catalog.snapshot(), topology: this.topology.snapshot() }
  }

  participation(layerId: string, capability: MemoryCapability, trigger: MemoryOperationTrigger): MemoryParticipationDecision {
    const descriptor = this.catalog.layer(layerId)?.descriptor
    if (descriptor === undefined) {
      return {
        allowed: false,
        layerId,
        capability,
        trigger,
        channel: participationChannel(capability),
        mode: 'off',
        reason: `memory layer is unavailable: ${layerId}`,
      }
    }
    if (!descriptor.capabilities.includes(capability)) {
      return {
        allowed: false,
        layerId,
        capability,
        trigger,
        channel: participationChannel(capability),
        mode: 'off',
        reason: `memory layer ${layerId} does not support ${capability}`,
      }
    }
    const layer = this.topology.snapshot().layers.find(item => item.id === layerId)
    if (layer === undefined) {
      return {
        allowed: false,
        layerId,
        capability,
        trigger,
        channel: participationChannel(capability),
        mode: 'off',
        reason: `memory layer is not configured in the active topology: ${layerId}`,
      }
    }
    return decideMemoryLayerParticipation(layer, capability, trigger)
  }

  allows(layerId: string, capability: MemoryCapability, trigger: MemoryOperationTrigger): boolean {
    return this.participation(layerId, capability, trigger).allowed
  }

  assertParticipation(layerId: string, capability: MemoryCapability, trigger: MemoryOperationTrigger): MemoryParticipationDecision {
    const layer = this.topology.snapshot().layers.find(item => item.id === layerId)
    if (layer === undefined) throw new Error(`memory layer is not configured in the active topology: ${layerId}`)
    const descriptor = this.catalog.layer(layerId)?.descriptor
    if (descriptor === undefined) throw new Error(`memory layer is unavailable: ${layerId}`)
    if (!descriptor.capabilities.includes(capability)) throw new Error(`memory layer ${layerId} does not support ${capability}`)
    return assertMemoryLayerParticipation(layer, capability, trigger)
  }

  registerGuard(guard: MemoryGuardRegistration): () => void {
    const id = guard.id.trim()
    if (!/^[a-z][a-z0-9-]{0,127}$/u.test(id)) throw new Error('memory guard id must match [a-z][a-z0-9-]{0,127}')
    if (this.guards.has(id)) throw new Error(`memory guard is already registered: ${id}`)
    this.guards.set(id, guard)
    return () => {
      if (this.guards.get(id) === guard) this.guards.delete(id)
    }
  }

  async plan(request: MemoryPlanRequest): Promise<MemoryPlan> {
    checkBudget(request)
    const descriptor = this.descriptor()
    for (const guard of this.guards.values()) {
      const decision = await guard.decide(request, { descriptor })
      if (decision.kind === 'deny') throw new Error(`memory operation denied by ${guard.id}: ${decision.reason}`)
    }
    const strategy = this.catalog.strategy(descriptor.topology.strategyId)
    if (strategy === undefined) throw new Error(`active memory strategy is unavailable: ${descriptor.topology.strategyId}`)
    const proposal = await strategy.propose(request, descriptor)
    if (proposal.strategyId !== strategy.descriptor.id || proposal.strategyVersion !== strategy.descriptor.version) {
      throw new Error('memory strategy proposal identity does not match its registration')
    }
    const maxSteps = request.budget?.maxSteps ?? 32
    if (proposal.steps.length > maxSteps) throw new Error(`memory strategy proposed ${proposal.steps.length} steps; budget allows ${maxSteps}`)
    const steps: MemoryPlanStep[] = proposal.steps.map((step, index) => {
      if (step.capability !== request.capability) throw new Error('memory strategy cannot change the requested capability')
      const topologyLayer = descriptor.topology.layers.find(layer => layer.id === step.layerId)
      const catalogLayer = descriptor.catalog.layers.find(layer => layer.id === step.layerId)
      if (topologyLayer === undefined || catalogLayer === undefined) throw new Error(`memory strategy selected an unavailable layer: ${step.layerId}`)
      if (!topologyLayer.enabled) throw new Error(`memory strategy selected a disabled layer: ${step.layerId}`)
      if (!catalogLayer.capabilities.includes(step.capability)) throw new Error(`memory layer ${step.layerId} does not support ${step.capability}`)
      const participation = participationChannel(step.capability)
      const mode = topologyLayer.participation[participation]
      if (mode === 'off' || (request.trigger !== 'manual' && mode !== 'automatic')) {
        throw new Error(`memory layer ${step.layerId} does not allow ${request.trigger} ${participation}`)
      }
      if (step.adapterId !== undefined) {
        if (!topologyLayer.adapterIds.includes(step.adapterId)) throw new Error(`memory adapter ${step.adapterId} is not bound to ${step.layerId}`)
        const adapter = descriptor.catalog.adapters.find(item => item.id === step.adapterId)
        if (adapter === undefined || !adapter.capabilities.includes(step.capability)) {
          throw new Error(`memory adapter ${step.adapterId} does not support ${step.capability}`)
        }
      }
      return { ...step, id: `${this.id()}:${index + 1}`, participation }
    })
    return {
      id: this.id(),
      topologyId: descriptor.topology.id,
      topologyGeneration: descriptor.topology.generation,
      catalogGeneration: descriptor.catalog.generation,
      strategyId: proposal.strategyId,
      strategyVersion: proposal.strategyVersion,
      operation: request.operation,
      trigger: request.trigger,
      scope: { ...request.scope },
      reason: proposal.reason,
      createdAt: this.now().toISOString(),
      budget: { ...request.budget },
      steps,
    }
  }

  async execute(plan: MemoryPlan, request: MemoryPlanRequest, signal?: AbortSignal): Promise<MemoryReceipt> {
    const current = this.descriptor()
    if (plan.topologyGeneration !== current.topology.generation || plan.catalogGeneration !== current.catalog.generation) {
      throw new Error('memory plan is stale; re-plan against the active generation')
    }
    if (plan.operation !== request.operation || plan.trigger !== request.trigger) throw new Error('memory plan does not match the execution request')
    const startedAt = this.now().toISOString()
    const steps: MemoryReceiptStep[] = []
    for (const step of plan.steps) {
      const stepStartedAt = this.now().toISOString()
      if (aborted(signal)) {
        steps.push({ stepId: step.id, layerId: step.layerId, ...(step.adapterId === undefined ? {} : { adapterId: step.adapterId }), status: 'cancelled', startedAt: stepStartedAt, finishedAt: this.now().toISOString(), error: 'operation cancelled' })
        continue
      }
      const layer = this.catalog.layer(step.layerId)
      if (layer?.execute === undefined) {
        steps.push({ stepId: step.id, layerId: step.layerId, ...(step.adapterId === undefined ? {} : { adapterId: step.adapterId }), status: 'failed', startedAt: stepStartedAt, finishedAt: this.now().toISOString(), error: `memory layer has no executor: ${step.layerId}` })
        continue
      }
      const context: MemoryLayerExecutionContext = {
        planId: plan.id,
        topology: current.topology,
        request,
        ...(signal === undefined ? {} : { signal }),
      }
      try {
        const output = await layer.execute(step, context)
        steps.push({ stepId: step.id, layerId: step.layerId, ...(step.adapterId === undefined ? {} : { adapterId: step.adapterId }), status: 'succeeded', startedAt: stepStartedAt, finishedAt: this.now().toISOString(), output })
      } catch (error) {
        const status = aborted(signal) ? 'cancelled' as const : 'failed' as const
        steps.push({ stepId: step.id, layerId: step.layerId, ...(step.adapterId === undefined ? {} : { adapterId: step.adapterId }), status, startedAt: stepStartedAt, finishedAt: this.now().toISOString(), error: errorText(error) })
      }
    }
    const succeeded = steps.filter(step => step.status === 'succeeded').length
    const cancelled = steps.filter(step => step.status === 'cancelled').length
    let status: MemoryReceiptStatus
    if (steps.length > 0 && cancelled === steps.length) status = 'cancelled'
    else if (succeeded === steps.length) status = 'succeeded'
    else if (succeeded > 0) status = 'partial'
    else status = 'failed'
    const receipt: MemoryReceipt = {
      id: this.id(),
      planId: plan.id,
      topologyId: plan.topologyId,
      topologyGeneration: plan.topologyGeneration,
      catalogGeneration: plan.catalogGeneration,
      strategyId: plan.strategyId,
      strategyVersion: plan.strategyVersion,
      operation: plan.operation,
      status,
      startedAt,
      finishedAt: this.now().toISOString(),
      steps,
    }
    await this.receiptSink?.append(receipt)
    return receipt
  }

  async run(request: MemoryPlanRequest, signal?: AbortSignal): Promise<{ plan: MemoryPlan; receipt: MemoryReceipt }> {
    const plan = await this.plan(request)
    const receipt = await this.execute(plan, request, signal)
    return { plan, receipt }
  }

}
