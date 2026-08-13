import type { ResolvedConfig } from './config.ts'
import type {
  HostAgent,
  HostContextShape,
  HostPreStepDecision,
  HostSessionEvent,
  HostUserMessage,
} from './contracts.ts'
import type { Insight, RememberRequest, SearchRequest } from './service.ts'
import type { RuntimeMemoryMutation } from './runtime-memory.ts'
import { MnemonSubagentCoordinator, type DelegatedWriteResult, type SubagentCounters } from './subagent.ts'

export const MNEMON_PLUGIN_SOURCE = 'dsh-mnemon'

export type LifecyclePhase = 'idle' | 'prime' | 'recall' | 'writeback' | 'review' | 'supervised' | 'error'

export interface LifecycleCounters {
  primes: number
  recallCues: number
  writebackCues: number
  supervisedRequests: number
  failures: number
}

export interface LifecycleAgentSnapshot {
  sessionId: string
  status: 'idle' | 'running'
  startSource: 'startup' | 'resume' | 'clear' | 'compact' | 'adopted'
  primePending: boolean
  guidedTurns: number
  memoryToolCalls: number
  idleReviewPending: boolean
  reviewRunning: boolean
  lastPhase: LifecyclePhase
  lastReviewAt?: string
  lastReviewAction?: string
  lastAt?: string
  lastError?: string
}

export interface LifecycleSnapshot {
  enabled: boolean
  recallMode: ResolvedConfig['recallMode']
  writebackMode: ResolvedConfig['writebackMode']
  idleReviewMs: number
  activeAgents: number
  sessionAvailable: boolean
  counters: LifecycleCounters
  subagents: SubagentCounters
  current?: LifecycleAgentSnapshot
}

export interface SupervisedWritebackResult extends DelegatedWriteResult { sessionId: string }

interface AgentEventPayload {
  agent: HostAgent
}

interface SessionStartPayload extends AgentEventPayload {
  source: 'startup' | 'resume' | 'clear' | 'compact'
}

interface PreStepPayload extends AgentEventPayload {
  messages: HostUserMessage[]
  turn: number
  step: number
  signal: AbortSignal
}

interface TurnStoppingPayload extends AgentEventPayload {
  turn: number
  signal: AbortSignal
}

function createPluginMessage(text: string, form: 'recall' | 'notice' | 'instructions', summary?: string): HostUserMessage {
  return structuredClone({
    id: crypto.randomUUID(),
    role: 'user' as const,
    content: [{ type: 'text' as const, text }],
    source: {
      kind: 'plugin',
      plugin: MNEMON_PLUGIN_SOURCE,
      form,
      ...(summary === undefined ? {} : { summary }),
    },
  })
}

function sourceOf(message: HostUserMessage): { kind?: string; plugin?: string } {
  return message.source
}

function eventTurn(event: HostSessionEvent): number | undefined {
  return typeof event.data.turn === 'number' ? event.data.turn : undefined
}

function memoryToolCalls(events: readonly HostSessionEvent[], turn?: number): number {
  return events.filter(event => event.type === 'tool/call'
    && (turn === undefined || eventTurn(event) === turn)
    && typeof event.data.name === 'string'
    && event.data.name.startsWith('mnemon_')).length
}

function guidedReminder(config: ResolvedConfig): string | undefined {
  if (config.recallMode === 'guided' && config.writebackMode === 'guided') return '[MNEMON] Call mnemon_recall when prior durable context matters or hot memory lacks an exact historical detail—never infer the missing rule; use mnemon_runtime_memory only for new, explicit, reusable information. Otherwise call neither.'
  if (config.recallMode === 'guided') return '[MNEMON] Call mnemon_recall when prior durable context matters or hot memory lacks an exact historical detail—never infer the missing rule; otherwise continue without recalling.'
  if (config.writebackMode === 'guided') return '[MNEMON] Use mnemon_runtime_memory only for new, explicit, reusable information; otherwise continue without writing memory.'
  return undefined
}

class MnemonAgentLifecycle {
  private primePending = true
  private startSource: LifecycleAgentSnapshot['startSource']
  private readonly guidedTurns = new Set<number>()
  private idleReviewTimer: ReturnType<typeof setTimeout> | undefined
  private reviewController: AbortController | undefined
  private reviewRunning = false
  private lastReviewAt: string | undefined
  private lastReviewAction: string | undefined
  private lastPhase: LifecyclePhase = 'idle'
  private lastAt: string | undefined
  private lastError: string | undefined

  constructor(
    readonly agent: HostAgent,
    private readonly coordinator: MnemonSubagentCoordinator,
    private readonly config: ResolvedConfig,
    private readonly counters: LifecycleCounters,
    source: LifecycleAgentSnapshot['startSource'],
  ) {
    this.startSource = source
  }

  start(): () => void {
    const disposers = [
      this.agent.ctx.on('agent/session-start', ((payload: SessionStartPayload) => {
        this.cancelIdleReview(true)
        this.startSource = payload.source
        this.primePending = true
        this.mark('prime')
      }) as never),
      this.agent.ctx.on('agent/pre-step', ((payload: PreStepPayload, next: () => Promise<HostPreStepDecision>) => this.preStep(payload, next)) as never),
      this.agent.ctx.on('agent/turn-stopping', ((payload: TurnStoppingPayload) => { this.scheduleIdleReview(payload.turn) }) as never),
    ]
    return () => {
      this.cancelIdleReview(true)
      for (const dispose of disposers.reverse()) dispose()
    }
  }

  snapshot(): LifecycleAgentSnapshot {
    return {
      sessionId: this.agent.id,
      status: this.agent.status,
      startSource: this.startSource,
      primePending: this.primePending,
      guidedTurns: this.guidedTurns.size,
      memoryToolCalls: memoryToolCalls(this.agent.session.events),
      idleReviewPending: this.idleReviewTimer !== undefined,
      reviewRunning: this.reviewRunning,
      lastPhase: this.lastPhase,
      ...(this.lastReviewAt === undefined ? {} : { lastReviewAt: this.lastReviewAt }),
      ...(this.lastReviewAction === undefined ? {} : { lastReviewAction: this.lastReviewAction }),
      ...(this.lastAt === undefined ? {} : { lastAt: this.lastAt }),
      ...(this.lastError === undefined ? {} : { lastError: this.lastError }),
    }
  }

  markSupervised(): void {
    this.counters.supervisedRequests += 1
    this.mark('supervised')
  }

  private async preStep(payload: PreStepPayload, next: () => Promise<HostPreStepDecision>): Promise<HostPreStepDecision> {
    if (payload.step === 1) this.cancelIdleReview(true)
    const decision = await next()
    if (decision.kind === 'reject' || payload.signal.aborted || !this.config.lifecycleEnabled || payload.step !== 1) return decision

    const ownRequest = decision.messages.some(message => {
      const source = sourceOf(message)
      return source.kind === 'plugin' && source.plugin === MNEMON_PLUGIN_SOURCE
    })
    if (ownRequest) {
      return decision
    }
    if (decision.messages.length === 0) return decision

    if (this.primePending) {
      this.primePending = false
      this.counters.primes += 1
      this.mark('prime')
    }
    const reminder = guidedReminder(this.config)
    if (reminder === undefined) return decision
    this.guidedTurns.add(payload.turn)
    if (this.config.recallMode === 'guided') this.counters.recallCues += 1
    if (this.config.writebackMode === 'guided' && this.config.writeEnabled) this.counters.writebackCues += 1
    this.mark(this.config.recallMode === 'guided' ? 'recall' : 'writeback')
    return { kind: 'enter', messages: [...decision.messages, createPluginMessage(reminder, 'instructions', 'Optional memory recall and remember reminder')] }
  }

  private scheduleIdleReview(turn: number): void {
    if (!this.config.lifecycleEnabled || !this.config.writeEnabled || this.config.writebackMode !== 'guided') return
    this.cancelIdleReview(true)
    this.idleReviewTimer = setTimeout(() => {
      this.idleReviewTimer = undefined
      if (this.agent.status !== 'idle') return
      const completed = this.agent.session.events.some(event => event.type === 'turn/end' && eventTurn(event) === turn)
      if (!completed) return
      void this.runIdleReview()
    }, this.config.idleReviewMs)
  }

  private async runIdleReview(): Promise<void> {
    const controller = new AbortController()
    this.reviewRunning = true
    this.reviewController = controller
    this.mark('review')
    try {
      const result = await this.coordinator.review(this.agent, controller.signal)
      this.lastReviewAt = new Date().toISOString()
      this.lastReviewAction = result.action
      this.mark('review')
    } catch (error) {
      if (!controller.signal.aborted) this.fail(error)
    } finally {
      if (this.reviewController === controller) {
        this.reviewRunning = false
        this.reviewController = undefined
      }
    }
  }

  private cancelIdleReview(abortRunning: boolean): void {
    if (this.idleReviewTimer !== undefined) clearTimeout(this.idleReviewTimer)
    this.idleReviewTimer = undefined
    if (abortRunning) this.reviewController?.abort()
  }

  private mark(phase: LifecyclePhase): void {
    this.lastPhase = phase
    this.lastAt = new Date().toISOString()
    this.lastError = undefined
  }

  private fail(error: unknown): void {
    this.counters.failures += 1
    this.lastPhase = 'error'
    this.lastAt = new Date().toISOString()
    this.lastError = error instanceof Error ? error.message : String(error)
  }

}

/** DSH-native owner for per-agent Mnemon lifecycle hooks and UI-triggered LLM work. */
export class MnemonLifecycle {
  private readonly owners = new Map<HostAgent, { lifecycle: MnemonAgentLifecycle; dispose: () => unknown }>()
  private readonly counters: LifecycleCounters = { primes: 0, recallCues: 0, writebackCues: 0, supervisedRequests: 0, failures: 0 }

  constructor(
    private readonly ctx: HostContextShape,
    private readonly coordinator: MnemonSubagentCoordinator,
    private readonly config: ResolvedConfig,
  ) {}

  start(): () => void {
    const stopCreated = this.ctx.on('agent/created', (({ agent }: AgentEventPayload) => { this.install(agent, 'startup') }) as never)
    for (const agent of this.ctx.agents.roots()) this.install(agent, 'adopted')
    return () => {
      stopCreated()
      for (const owner of [...this.owners.values()].reverse()) owner.dispose()
      this.owners.clear()
    }
  }

  snapshot(sessionId?: string): LifecycleSnapshot {
    const agent = sessionId === undefined ? undefined : this.ctx.agents.get(sessionId)
    const owner = agent === undefined ? undefined : this.owners.get(agent)?.lifecycle
    return {
      enabled: this.config.lifecycleEnabled,
      recallMode: this.config.recallMode,
      writebackMode: this.config.writebackMode,
      idleReviewMs: this.config.idleReviewMs,
      activeAgents: this.owners.size,
      sessionAvailable: agent !== undefined,
      counters: { ...this.counters },
      subagents: this.coordinator.snapshot(),
      ...(owner === undefined ? {} : { current: owner.snapshot() }),
    }
  }

  recall(sessionId: string, request: SearchRequest, signal = new AbortController().signal) {
    return this.coordinator.recall(this.liveAgent(sessionId), request, signal)
  }

  related(sessionId: string, id: string, memoryBodyId?: string, signal = new AbortController().signal) {
    return this.coordinator.related(this.liveAgent(sessionId), id, memoryBodyId, signal)
  }

  answer(sessionId: string, query: string, evidence: Insight[], signal = new AbortController().signal) {
    return this.coordinator.answer(this.liveAgent(sessionId), query, evidence, signal)
  }

  remember(sessionId: string, request: RememberRequest, signal = new AbortController().signal) {
    return this.coordinator.remember(this.liveAgent(sessionId), request, signal)
  }

  runtime(sessionId: string, request: RuntimeMemoryMutation, signal = new AbortController().signal) {
    return this.coordinator.runtime(this.liveAgent(sessionId), request, signal)
  }

  mutate(sessionId: string, operation: string, request: unknown, signal = new AbortController().signal) {
    return this.coordinator.write(this.liveAgent(sessionId), operation, request, signal)
  }

  async supervise(sessionId: string, content: string, signal = new AbortController().signal): Promise<SupervisedWritebackResult> {
    if (!this.config.writeEnabled) throw new Error('dsh-mnemon is configured read-only (writeEnabled: false)')
    const normalizedSessionId = sessionId.trim()
    const normalizedContent = content.trim()
    if (normalizedSessionId === '') throw new Error('current DSH session is unavailable')
    if (normalizedContent === '') throw new Error('memory candidate is required')
    if (normalizedContent.length > 8000) throw new Error('memory candidate is too long (max 8000 characters)')
    const agent = this.liveAgent(normalizedSessionId)
    const owner = this.owners.get(agent)?.lifecycle
    if (owner === undefined) this.counters.supervisedRequests += 1
    else owner.markSupervised()
    const result = await this.coordinator.write(agent, 'supervised-writeback', {
      content: normalizedContent,
      source: 'explicit Mnemon tab submission',
    }, signal)
    return { ...result, sessionId: normalizedSessionId }
  }

  private liveAgent(sessionId: string): HostAgent {
    const normalized = sessionId.trim()
    if (normalized === '') throw new Error('current DSH session is unavailable')
    const agent = this.ctx.agents.get(normalized)
    if (agent === undefined) throw new Error('current DSH agent is not live; reopen or resume the conversation and try again')
    return agent
  }

  private install(agent: HostAgent, source: LifecycleAgentSnapshot['startSource']): void {
    if (this.owners.has(agent) || !this.ctx.agents.roots().includes(agent)) return
    const lifecycle = new MnemonAgentLifecycle(agent, this.coordinator, this.config, this.counters, source)
    let dispose: () => unknown
    dispose = agent.ctx.effect(() => {
      const stop = lifecycle.start()
      return () => {
        stop()
        if (this.owners.get(agent)?.dispose === dispose) this.owners.delete(agent)
      }
    }, 'dsh-mnemon.lifecycle()')
    this.owners.set(agent, { lifecycle, dispose })
  }
}
