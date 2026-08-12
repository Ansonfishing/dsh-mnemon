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
    })),
  } as unknown as MnemonService
  const ctx = {
    agents: { get: (id: string) => id === agent.id ? agent : undefined, roots: () => [agent] },
    on: vi.fn((name: string, listener: Listener) => {
      rootListeners.set(name, listener)
      return () => rootListeners.delete(name)
    }),
  } as unknown as HostContextShape
  const lifecycle = new MnemonLifecycle(ctx, service, config)
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

  return { agent, events, followup, steer, lifecycle, service, preStep, turnStopping, stop }
}

describe('Mnemon DSH lifecycle integration', () => {
  it('awaits Prime in pre-step and adds one bounded recall decision cue', async () => {
    const value = fixture()
    const prompt = userMessage()
    const decision = await value.preStep([prompt], 1)

    expect(decision).toMatchObject({ kind: 'enter' })
    if (decision.kind !== 'enter') throw new Error('unexpected rejection')
    expect(decision.messages).toHaveLength(2)
    expect(decision.messages[1]?.source).toMatchObject({ kind: 'plugin', plugin: 'dsh-mnemon', form: 'recall' })
    expect(decision.messages[1]?.content[0]?.text).toContain('[MNEMON PRIME]')
    expect(decision.messages[1]?.content[0]?.text).toContain('[MNEMON RECALL CHECKPOINT]')
    expect(value.service.status).toHaveBeenCalledTimes(1)

    const second = await value.preStep([userMessage('Second turn')], 2)
    if (second.kind !== 'enter') throw new Error('unexpected rejection')
    expect(second.messages[1]?.content[0]?.text).not.toContain('[MNEMON PRIME]')
    expect(value.service.status).toHaveBeenCalledTimes(1)
    expect(value.lifecycle.snapshot('session-1').counters).toMatchObject({ primes: 1, recallCues: 2 })
  })

  it('steers exactly one writeback checkpoint before a user turn closes', async () => {
    const value = fixture()
    const prompt = userMessage()
    value.events.push(
      { type: 'turn/start', data: { turn: 1 } },
      { type: 'user/message', data: prompt as unknown as Record<string, unknown> },
      { type: 'assistant/message', data: { turn: 1, step: 1 } },
    )

    await value.turnStopping(1)
    await value.turnStopping(1)

    expect(value.steer).toHaveBeenCalledTimes(1)
    expect(value.steer.mock.calls[0]?.[0]).toMatchObject({ source: { kind: 'plugin', plugin: 'dsh-mnemon', form: 'instructions' } })
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
    expect(value.lifecycle.snapshot('session-1').current?.memoryToolCalls).toBe(1)
  })

  it('queues memory-tab candidates as their own DSH LLM turn', async () => {
    const value = fixture()
    const result = value.lifecycle.supervise('session-1', 'Use SQLite because deployment must remain single-file.')

    expect(result).toMatchObject({ queued: true, sessionId: 'session-1', agentStatus: 'idle' })
    expect(value.followup).toHaveBeenCalledTimes(1)
    const message = value.followup.mock.calls[0]?.[0] as HostUserMessage
    expect(message.source).toMatchObject({ kind: 'plugin', plugin: 'dsh-mnemon', form: 'notice' })
    expect(message.content[0]?.text).toContain('candidate_json')
    expect(message.content[0]?.text).toContain('Use SQLite')
    expect(value.lifecycle.snapshot('session-1').counters.supervisedRequests).toBe(1)
  })

  it('keeps disabled lifecycle hooks out of model input while retaining manual supervision', async () => {
    const value = fixture(resolveConfig({ lifecycleEnabled: false, recallMode: 'off', writebackMode: 'off' }))
    const prompt = userMessage()
    const decision = await value.preStep([prompt], 1)
    expect(decision).toEqual({ kind: 'enter', messages: [prompt] })
    await value.turnStopping(1)
    expect(value.steer).not.toHaveBeenCalled()
    expect(value.lifecycle.supervise('session-1', 'Durable preference').queued).toBe(true)
  })
})
