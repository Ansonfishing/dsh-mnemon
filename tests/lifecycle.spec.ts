import { describe, expect, it, vi } from 'vitest'
import { resolveConfig } from '../src/config.ts'
import type {
  HostAgent,
  HostAgentContext,
  HostContextShape,
  HostPreStepDecision,
  HostSessionEvent,
  HostUserMessage,
} from '../src/contracts.ts'
import { MnemonLifecycle } from '../src/lifecycle.ts'
import type { MnemonService } from '../src/service.ts'
import type { MnemonSubagentCoordinator } from '../src/subagent.ts'

type Listener = (...args: unknown[]) => unknown

function userMessage(text = 'Continue the project'): HostUserMessage {
  return {
    id: crypto.randomUUID(),
    role: 'user',
    content: [{ type: 'text', text }],
    source: { kind: 'user' },
  }
}

function fixture(config = resolveConfig({ cliPath: '/fake/mnemon' })) {
  const agentListeners = new Map<string, Listener>()
  const rootListeners = new Map<string, Listener>()
  const events: HostSessionEvent[] = []
  const followup = vi.fn()
  const steer = vi.fn()
  const agentCtx = {
    on: vi.fn((name: string, listener: Listener) => {
      agentListeners.set(name, listener)
      return () => agentListeners.delete(name)
    }),
    effect: vi.fn((callback: () => (() => unknown) | void) => {
      const cleanup = callback()
      return () => cleanup?.()
    }),
  } as unknown as HostAgentContext
  const agent = {
    id: 'session-1',
    status: 'idle',
    session: { events },
    ctx: agentCtx,
    followup,
    steer,
    inject: vi.fn(),
  } satisfies HostAgent
  const service = {
    status: vi.fn(async () => ({
      healthy: true,
      store: 'project',
      stats: { totalInsights: 12, edgeCount: 8 },
      memoryBodies: [{ id: 'project', name: 'Project', description: 'Project context', active: true }],
    })),
  } as unknown as MnemonService
  const coordinator = {
    recall: vi.fn(async (_agent, request) => ({ query: request.query, mode: 'smart', results: [], delegation: { runId: 'recall-child', provider: 'spawn', summary: '', selectedMemoryBodyIds: [] } })),
    write: vi.fn(async () => ({ delegated: true, runId: 'write-child', provider: 'spawn', summary: 'No durable memory', action: 'skipped', memoryBodyIds: [] })),
    snapshot: vi.fn(() => ({ recalls: 0, writes: 0, failures: 0 })),
  } as unknown as MnemonSubagentCoordinator
  const ctx = {
    agents: { get: (id: string) => id === agent.id ? agent : undefined, roots: () => [agent] },
    on: vi.fn((name: string, listener: Listener) => {
      rootListeners.set(name, listener)
      return () => rootListeners.delete(name)
    }),
  } as unknown as HostContextShape
  const lifecycle = new MnemonLifecycle(ctx, coordinator, config)
  const stop = lifecycle.start()

  const preStep = async (messages: HostUserMessage[], turn: number, step = 1): Promise<HostPreStepDecision> => {
    const listener = agentListeners.get('agent/pre-step')
    if (listener === undefined) throw new Error('pre-step listener missing')
    return await listener({ agent, messages, turn, step, signal: new AbortController().signal }, async () => ({ kind: 'enter', messages })) as HostPreStepDecision
  }
  const turnStopping = async (turn: number) => {
    const listener = agentListeners.get('agent/turn-stopping')
    if (listener === undefined) throw new Error('turn-stopping listener missing')
    await listener({ agent, turn, signal: new AbortController().signal })
  }

  return { agent, events, followup, steer, lifecycle, service, coordinator, preStep, turnStopping, stop }
}

describe('Mnemon DSH lifecycle integration', () => {
  it('adds a short optional reminder without forcing recall for an ordinary turn', async () => {
    const value = fixture()
    const prompt = userMessage('Aster 发布前需要检查哪些事项？')
    const decision = await value.preStep([prompt], 1)

    expect(decision).toMatchObject({ kind: 'enter' })
    if (decision.kind !== 'enter') throw new Error('unexpected rejection')
    expect(decision.messages).toHaveLength(2)
    expect(decision.messages[1]?.source).toMatchObject({ kind: 'plugin', plugin: 'dsh-mnemon', form: 'instructions' })
    expect(decision.messages[1]?.content[0]?.text).toBe('[MNEMON] Decide whether this turn needs durable context. If yes, call mnemon_recall with a focused query; otherwise continue.')
    expect(value.coordinator.recall).not.toHaveBeenCalled()
    expect(value.service.status).not.toHaveBeenCalled()

    const second = await value.preStep([userMessage('Second turn')], 2)
    if (second.kind !== 'enter') throw new Error('unexpected rejection')
    expect(second.messages).toHaveLength(2)
    expect(value.coordinator.recall).not.toHaveBeenCalled()
    expect(value.lifecycle.snapshot('session-1').counters).toMatchObject({ primes: 1, recallCues: 2 })
  })

  it('automatically evaluates an ordinary durable project statement before its turn closes', async () => {
    const value = fixture()
    const prompt = userMessage('从本周起，Aster 发布前必须完成备份恢复演练。这是长期稳定流程。')
    value.events.push(
      { type: 'turn/start', data: { turn: 1 } },
      { type: 'user/message', data: prompt as unknown as Record<string, unknown> },
      { type: 'assistant/message', data: { turn: 1, step: 1 } },
    )

    await value.turnStopping(1)
    await value.turnStopping(1)

    expect(value.steer).not.toHaveBeenCalled()
    expect(value.coordinator.write).toHaveBeenCalledTimes(1)
    expect(value.coordinator.write).toHaveBeenCalledWith(value.agent, 'turn-writeback', expect.objectContaining({
      turn: 1,
      events: expect.arrayContaining([expect.objectContaining({ type: 'user/message' })]),
    }), expect.any(AbortSignal))
    expect(value.lifecycle.snapshot('session-1').counters.writebackChecks).toBe(1)
  })

  it('does not add a writeback checkpoint after the model already remembered', async () => {
    const value = fixture()
    const prompt = userMessage()
    value.events.push(
      { type: 'turn/start', data: { turn: 1 } },
      { type: 'user/message', data: prompt as unknown as Record<string, unknown> },
      { type: 'tool/call', data: { turn: 1, step: 1, name: 'mnemon_remember' } },
    )

    await value.turnStopping(1)
    expect(value.steer).not.toHaveBeenCalled()
    expect(value.coordinator.write).not.toHaveBeenCalled()
    expect(value.lifecycle.snapshot('session-1').current?.memoryToolCalls).toBe(1)
  })

  it('delegates memory-tab candidates directly to an isolated memory subagent', async () => {
    const value = fixture()
    const result = await value.lifecycle.supervise('session-1', 'Use SQLite because deployment must remain single-file.')

    expect(result).toMatchObject({ delegated: true, sessionId: 'session-1', runId: 'write-child' })
    expect(value.followup).not.toHaveBeenCalled()
    expect(value.coordinator.write).toHaveBeenCalledWith(value.agent, 'supervised-writeback', expect.objectContaining({ candidate: expect.stringContaining('Use SQLite') }), expect.any(AbortSignal))
    expect(value.lifecycle.snapshot('session-1').counters.supervisedRequests).toBe(1)
  })

  it('keeps disabled lifecycle hooks out of model input while retaining manual supervision', async () => {
    const value = fixture(resolveConfig({ lifecycleEnabled: false, recallMode: 'off', writebackMode: 'off' }))
    const prompt = userMessage()
    const decision = await value.preStep([prompt], 1)
    expect(decision).toEqual({ kind: 'enter', messages: [prompt] })
    await value.turnStopping(1)
    expect(value.steer).not.toHaveBeenCalled()
    await expect(value.lifecycle.supervise('session-1', 'Durable preference')).resolves.toMatchObject({ delegated: true })
  })
})
