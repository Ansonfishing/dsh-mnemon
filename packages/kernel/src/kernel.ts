import { createHash, randomUUID } from 'node:crypto'
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
} from '../../contracts/src/index.ts'
import { MEMORY_CAPABILITIES } from '../../contracts/src/index.ts'
import { assertMemoryLayerParticipation, decideMemoryLayerParticipation, participationChannel, type MemoryParticipationDecision } from './access.ts'
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

const MEMORY_CAPABILITY_SET = new Set<string>(MEMORY_CAPABILITIES)
const MEMORY_TRIGGER_SET = new Set<string>(['manual', 'automatic', 'system'])
const MEMORY_STORAGE_SET = new Set<string>(['global', 'workspace', 'custom'])
const MAX_ISSUED_PLANS = 1_024

function canonical(value: unknown, label = 'memory value', ancestors = new Set<object>(), depth = 0): string {
  if (depth > 64) throw new Error(`${label} is nested too deeply`)
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return JSON.stringify(value)
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error(`${label} contains a non-finite number`)
    return JSON.stringify(value)
  }
  if (Array.isArray(value)) {
    if (ancestors.has(value)) throw new Error(`${label} contains a cycle`)
    ancestors.add(value)
    const items: string[] = []
    for (let index = 0; index < value.length; index += 1) {
      if (!(index in value)) throw new Error(`${label} contains a sparse array`)
      items.push(canonical(value[index], label, ancestors, depth + 1))
    }
    ancestors.delete(value)
    return `[${items.join(',')}]`
  }
  if (typeof value !== 'object') throw new Error(`${label} contains a non-JSON value`)
  const prototype = Object.getPrototypeOf(value)
  if (prototype !== Object.prototype && prototype !== null) throw new Error(`${label} contains a non-plain JSON object`)
  if (ancestors.has(value)) throw new Error(`${label} contains a cycle`)
  ancestors.add(value)
  const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right))
  const rendered = entries.map(([key, item]) => {
    if (key.length > 1_000) throw new Error(`${label} contains an oversized key`)
    return `${JSON.stringify(key)}:${canonical(item, label, ancestors, depth + 1)}`
  })
  ancestors.delete(value)
  return `{${rendered.join(',')}}`
}

function digest(value: unknown, label: string): string {
  return createHash('sha256').update(canonical(value, label)).digest('hex')
}

function deepFreeze<T>(value: T): T {
  if (typeof value !== 'object' || value === null || Object.isFrozen(value)) return value
  for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child)
  return Object.freeze(value)
}

function jsonClone<T>(value: T, label: string): T {
  canonical(value, label)
  return structuredClone(value)
}

function requiredText(value: unknown, label: string, maximum: number): string {
  if (typeof value !== 'string') throw new Error(`${label} must be a string`)
  const normalized = value.trim()
  if (normalized === '') throw new Error(`${label} is required`)
  if (normalized.length > maximum) throw new Error(`${label} is too long (max ${maximum} characters)`)
  return normalized
}

function optionalText(value: unknown, label: string, maximum: number): string | undefined {
  if (value === undefined) return undefined
  return requiredText(value, label, maximum)
}

function normalizedIds(value: unknown, label: string): string[] | undefined {
  if (value === undefined) return undefined
  if (!Array.isArray(value)) throw new Error(`${label} must be an array`)
  const ids = [...new Set(value.map(item => requiredText(item, `${label} entry`, 128)))]
  if (ids.length === 0) return []
  if (ids.length > 1_000) throw new Error(`${label} contains too many entries`)
  return ids
}

function normalizeRequest(request: MemoryPlanRequest): MemoryPlanRequest {
  if (typeof request !== 'object' || request === null) throw new Error('memory plan request must be an object')
  const operation = requiredText(request.operation, 'memory operation', 200)
  if (!MEMORY_CAPABILITY_SET.has(request.capability)) throw new Error(`unsupported memory capability: ${String(request.capability)}`)
  if (!MEMORY_TRIGGER_SET.has(request.trigger)) throw new Error(`unsupported memory operation trigger: ${String(request.trigger)}`)
  if (typeof request.scope !== 'object' || request.scope === null) throw new Error('memory operation scope must be an object')
  if (!MEMORY_STORAGE_SET.has(request.scope.storage)) throw new Error(`unsupported memory storage scope: ${String(request.scope.storage)}`)
  const workspaceId = optionalText(request.scope.workspaceId, 'memory workspace id', 2_000)
  const sessionId = optionalText(request.scope.sessionId, 'memory session id', 300)
  const agentId = optionalText(request.scope.agentId, 'memory agent id', 300)
  const candidateLayerIds = normalizedIds(request.candidateLayerIds, 'memory candidate layer ids')
  const adapterIds = normalizedIds(request.adapterIds, 'memory adapter ids')
  const budget = request.budget === undefined ? undefined : jsonClone(request.budget, 'memory operation budget')
  const input = request.input === undefined ? undefined : jsonClone(request.input, 'memory operation input')
  const normalized: MemoryPlanRequest = {
    operation,
    capability: request.capability,
    trigger: request.trigger,
    scope: {
      storage: request.scope.storage,
      ...(workspaceId === undefined ? {} : { workspaceId }),
      ...(sessionId === undefined ? {} : { sessionId }),
      ...(agentId === undefined ? {} : { agentId }),
    },
    ...(candidateLayerIds === undefined ? {} : { candidateLayerIds }),
    ...(adapterIds === undefined ? {} : { adapterIds }),
    ...(budget === undefined ? {} : { budget }),
    ...(input === undefined ? {} : { input }),
  }
  checkBudget(normalized)
  return deepFreeze(normalized)
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
  private currentGuardGeneration = 0
  private readonly now: () => Date
  private readonly id: () => string
  private readonly receiptSinks = new Set<MemoryReceiptSink>()
  private readonly issuedPlans = new Map<string, { plan: MemoryPlan; planDigest: string; requestDigest: string }>()

  constructor(
    readonly catalog: MemoryCatalog,
    readonly topology: MemoryTopologyManager,
    options: MemoryKernelOptions = {},
  ) {
    this.now = options.now ?? (() => new Date())
    this.id = options.id ?? randomUUID
    if (options.receiptSink !== undefined) this.receiptSinks.add(options.receiptSink)
  }

  get guardGeneration(): number {
    return this.currentGuardGeneration
  }

  registerReceiptSink(sink: MemoryReceiptSink): () => void {
    this.receiptSinks.add(sink)
    let active = true
    return () => {
      if (!active) return
      active = false
      this.receiptSinks.delete(sink)
    }
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
    const registration: MemoryGuardRegistration = Object.freeze({ id, decide: guard.decide })
    this.guards.set(id, registration)
    this.currentGuardGeneration += 1
    let active = true
    return () => {
      if (!active) return
      active = false
      if (this.guards.get(id) !== registration) return
      this.guards.delete(id)
      this.currentGuardGeneration += 1
    }
  }

  async plan(request: MemoryPlanRequest): Promise<MemoryPlan> {
    const normalizedRequest = normalizeRequest(request)
    const descriptor = deepFreeze(jsonClone(this.descriptor(), 'memory system descriptor'))
    const guardGeneration = this.currentGuardGeneration
    const guards = [...this.guards.values()]
    const strategy = this.catalog.strategy(descriptor.topology.strategyId)
    if (strategy === undefined) throw new Error(`active memory strategy is unavailable: ${descriptor.topology.strategyId}`)
    for (const guard of guards) {
      const decision = await guard.decide(normalizedRequest, { descriptor })
      if (typeof decision !== 'object' || decision === null || (decision.kind !== 'allow' && decision.kind !== 'deny')) {
        throw new Error(`memory guard returned an invalid decision: ${guard.id}`)
      }
      if (decision.kind === 'deny') throw new Error(`memory operation denied by ${guard.id}: ${decision.reason}`)
    }
    const proposal = await strategy.propose(normalizedRequest, descriptor)
    if (proposal.strategyId !== strategy.descriptor.id || proposal.strategyVersion !== strategy.descriptor.version) {
      throw new Error('memory strategy proposal identity does not match its registration')
    }
    if (proposal.steps.length === 0) throw new Error(`memory strategy produced no executable steps: ${proposal.reason}`)
    const maxSteps = normalizedRequest.budget?.maxSteps ?? 32
    if (proposal.steps.length > maxSteps) throw new Error(`memory strategy proposed ${proposal.steps.length} steps; budget allows ${maxSteps}`)
    const planId = this.id()
    const steps: MemoryPlanStep[] = proposal.steps.map((step, index) => {
      const layerId = requiredText(step.layerId, 'memory plan step layer id', 128)
      const adapterId = optionalText(step.adapterId, 'memory plan step adapter id', 128)
      const candidate = { layerId, capability: step.capability, ...(adapterId === undefined ? {} : { adapterId }) }
      const participation = this.validateStep(candidate, normalizedRequest, descriptor, 'memory strategy')
      const input = step.input === undefined ? undefined : jsonClone(step.input, 'memory plan step input')
      return { ...candidate, ...(input === undefined ? {} : { input }), id: `${planId}:${index + 1}`, participation }
    })
    const current = this.descriptor()
    if (current.catalog.generation !== descriptor.catalog.generation
      || current.topology.generation !== descriptor.topology.generation
      || this.currentGuardGeneration !== guardGeneration) {
      throw new Error('memory planning inputs changed while the plan was being compiled')
    }
    const requestDigest = digest(normalizedRequest, 'memory plan request')
    const plan = deepFreeze({
      id: planId,
      topologyId: descriptor.topology.id,
      topologyGeneration: descriptor.topology.generation,
      catalogGeneration: descriptor.catalog.generation,
      guardGeneration,
      strategyId: proposal.strategyId,
      strategyVersion: proposal.strategyVersion,
      operation: normalizedRequest.operation,
      capability: normalizedRequest.capability,
      trigger: normalizedRequest.trigger,
      scope: { ...normalizedRequest.scope },
      request: normalizedRequest,
      requestDigest,
      reason: requiredText(proposal.reason, 'memory strategy proposal reason', 4_000),
      createdAt: this.now().toISOString(),
      budget: { ...normalizedRequest.budget },
      steps,
    } satisfies MemoryPlan)
    this.rememberPlan(plan)
    return plan
  }

  async execute(plan: MemoryPlan, request: MemoryPlanRequest, signal?: AbortSignal): Promise<MemoryReceipt> {
    const issued = this.issuedPlans.get(plan.id)
    if (issued === undefined) throw new Error('memory plan was not issued by this Kernel or was already claimed')
    let suppliedPlanDigest: string
    try {
      suppliedPlanDigest = digest(plan, 'memory plan')
    } catch (error) {
      throw new Error(`memory plan is invalid: ${errorText(error)}`)
    }
    if (suppliedPlanDigest !== issued.planDigest) throw new Error('memory plan changed after authorization')
    const normalizedRequest = normalizeRequest(request)
    const executionRequestDigest = digest(normalizedRequest, 'memory execution request')
    if (executionRequestDigest !== issued.requestDigest) throw new Error('memory plan does not match the complete execution request')
    const authorizedPlan = issued.plan
    const authorizedRequest = authorizedPlan.request
    const current = this.descriptor()
    if (authorizedPlan.topologyGeneration !== current.topology.generation || authorizedPlan.catalogGeneration !== current.catalog.generation) {
      throw new Error('memory plan is stale; re-plan against the active generation')
    }
    if (authorizedPlan.guardGeneration !== this.currentGuardGeneration) {
      throw new Error('memory plan is stale; re-plan against the active guards')
    }
    if (authorizedPlan.topologyId !== current.topology.id) throw new Error('memory plan topology identity does not match the active topology')
    const strategy = this.catalog.strategy(current.topology.strategyId)
    if (strategy === undefined || strategy.descriptor.id !== authorizedPlan.strategyId || strategy.descriptor.version !== authorizedPlan.strategyVersion) {
      throw new Error('memory plan strategy identity does not match the active strategy')
    }
    if (authorizedPlan.steps.length === 0 || authorizedPlan.steps.length > (authorizedRequest.budget?.maxSteps ?? 32)) {
      throw new Error('memory plan step count exceeds its authorized budget')
    }
    for (const step of authorizedPlan.steps) {
      const participation = this.validateStep(step, authorizedRequest, current, 'memory plan')
      if (step.participation !== participation) throw new Error(`memory plan participation changed for step ${step.id}`)
    }
    // Resolve and bind every data-plane function before the first await. A
    // Catalog generation may be unloaded and replaced while an earlier step is
    // running; this operation must continue on the generation it authorized.
    const executableSteps = authorizedPlan.steps.map(step => {
      const layer = this.catalog.layer(step.layerId)
      return { step, execute: layer?.execute?.bind(layer) }
    })
    const executionTopology = deepFreeze(jsonClone(current.topology, 'memory execution topology'))
    // Claim the authorization synchronously, after every supplied value has
    // passed validation and before the first data-plane await. A Plan is an
    // at-most-once authority, not a replayable recipe.
    if (this.issuedPlans.get(authorizedPlan.id) !== issued) throw new Error('memory plan was already claimed')
    this.issuedPlans.delete(authorizedPlan.id)
    const startedAt = this.now().toISOString()
    const steps: MemoryReceiptStep[] = []
    for (const executable of executableSteps) {
      const { step, execute } = executable
      const stepStartedAt = this.now().toISOString()
      if (aborted(signal)) {
        steps.push({ stepId: step.id, layerId: step.layerId, ...(step.adapterId === undefined ? {} : { adapterId: step.adapterId }), status: 'cancelled', startedAt: stepStartedAt, finishedAt: this.now().toISOString(), error: 'operation cancelled' })
        continue
      }
      if (execute === undefined) {
        steps.push({ stepId: step.id, layerId: step.layerId, ...(step.adapterId === undefined ? {} : { adapterId: step.adapterId }), status: 'failed', startedAt: stepStartedAt, finishedAt: this.now().toISOString(), error: `memory layer has no executor: ${step.layerId}` })
        continue
      }
      const context: MemoryLayerExecutionContext = {
        planId: authorizedPlan.id,
        topology: executionTopology,
        request: authorizedRequest,
        ...(signal === undefined ? {} : { signal }),
      }
      try {
        const output = deepFreeze(jsonClone(await execute(step, context), 'memory layer output'))
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
      planId: authorizedPlan.id,
      topologyId: authorizedPlan.topologyId,
      topologyGeneration: authorizedPlan.topologyGeneration,
      catalogGeneration: authorizedPlan.catalogGeneration,
      guardGeneration: authorizedPlan.guardGeneration,
      strategyId: authorizedPlan.strategyId,
      strategyVersion: authorizedPlan.strategyVersion,
      operation: authorizedPlan.operation,
      capability: authorizedRequest.capability,
      status,
      startedAt,
      finishedAt: this.now().toISOString(),
      steps,
    }
    for (const sink of this.receiptSinks) await sink.append(receipt)
    return receipt
  }

  async run(request: MemoryPlanRequest, signal?: AbortSignal): Promise<{ plan: MemoryPlan; receipt: MemoryReceipt }> {
    const plan = await this.plan(request)
    const receipt = await this.execute(plan, request, signal)
    return { plan, receipt }
  }

  private validateStep(
    step: Pick<MemoryPlanStep, 'layerId' | 'capability' | 'adapterId'>,
    request: MemoryPlanRequest,
    descriptor: MemorySystemDescriptor,
    source: string,
  ): MemoryPlanStep['participation'] {
    if (step.capability !== request.capability) throw new Error(`${source} cannot change the requested capability`)
    if (request.candidateLayerIds !== undefined && !request.candidateLayerIds.includes(step.layerId)) {
      throw new Error(`${source} selected a layer outside the request candidates: ${step.layerId}`)
    }
    const topologyLayer = descriptor.topology.layers.find(layer => layer.id === step.layerId)
    const catalogLayer = descriptor.catalog.layers.find(layer => layer.id === step.layerId)
    if (topologyLayer === undefined || catalogLayer === undefined) throw new Error(`${source} selected an unavailable layer: ${step.layerId}`)
    if (!topologyLayer.enabled) throw new Error(`${source} selected a disabled layer: ${step.layerId}`)
    if (!catalogLayer.capabilities.includes(step.capability)) throw new Error(`memory layer ${step.layerId} does not support ${step.capability}`)
    const participation = participationChannel(step.capability)
    const mode = topologyLayer.participation[participation]
    if (mode === 'off' || (request.trigger !== 'manual' && mode !== 'automatic')) {
      throw new Error(`memory layer ${step.layerId} does not allow ${request.trigger} ${participation}`)
    }
    if (step.adapterId !== undefined) {
      if (request.adapterIds !== undefined && !request.adapterIds.includes(step.adapterId)) {
        throw new Error(`${source} selected an adapter outside the request candidates: ${step.adapterId}`)
      }
      if (!topologyLayer.adapterIds.includes(step.adapterId)) throw new Error(`memory adapter ${step.adapterId} is not bound to ${step.layerId}`)
      const adapter = descriptor.catalog.adapters.find(item => item.id === step.adapterId)
      if (adapter === undefined || !adapter.capabilities.includes(step.capability)) {
        throw new Error(`memory adapter ${step.adapterId} does not support ${step.capability}`)
      }
    }
    return participation
  }

  private rememberPlan(plan: MemoryPlan): void {
    this.issuedPlans.set(plan.id, {
      plan,
      planDigest: digest(plan, 'memory plan'),
      requestDigest: plan.requestDigest,
    })
    while (this.issuedPlans.size > MAX_ISSUED_PLANS) {
      const oldest = this.issuedPlans.keys().next().value as string | undefined
      if (oldest === undefined) break
      this.issuedPlans.delete(oldest)
    }
  }

}
