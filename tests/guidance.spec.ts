import { describe, expect, it, vi } from 'vitest'
import type { HostAgent } from '../src/contracts.ts'
import { registerAgentRuntimeMemoryContext, RUNTIME_MEMORY_SECTION_NAME } from '../src/guidance.ts'
import type { RuntimeMemoryController } from '../src/runtime-memory.ts'

describe('agent-scoped runtime memory context', () => {
  it('registers a same-named per-Agent prompt section that resolves the current workspace lazily', () => {
    const dispose = vi.fn()
    const section = vi.fn((_value: { name: string; order: number; text: () => string }) => dispose)
    const agent = {
      ctx: { get: vi.fn((name: string) => name === 'systemPrompt' ? { section } : undefined) },
    } as unknown as HostAgent
    let text = 'workspace-one memory'
    const controller = { contextText: vi.fn(() => text) } as unknown as RuntimeMemoryController

    const stop = registerAgentRuntimeMemoryContext(agent, () => controller)
    const registered = section.mock.calls[0]![0]
    expect(registered).toMatchObject({ name: RUNTIME_MEMORY_SECTION_NAME, order: 145 })
    expect(registered?.text()).toBe('workspace-one memory')
    text = 'workspace-two memory'
    expect(registered?.text()).toBe('workspace-two memory')
    stop()
    expect(dispose).toHaveBeenCalledTimes(1)
  })
})
