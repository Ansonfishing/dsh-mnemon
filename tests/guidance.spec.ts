import { describe, expect, it, vi } from 'vitest'
import { renderPrompt, type PromptAssembly } from '@deepseek-ai/dsh-system-prompt'
import type { HostAgent, HostContextShape } from '../src/contracts.ts'
import { registerAgentRuntimeMemoryContext, registerRuntimeMemoryContext, RUNTIME_MEMORY_SECTION_NAME } from '../src/guidance.ts'
import type { RuntimeMemoryController } from '../src/runtime-memory.ts'

describe('runtime memory prompt interpolation', () => {
  it('preserves literal {{}} while leaving legal variables and other sections intact', () => {
    const sections: Array<{ name: string; order: number; text: () => string }> = []
    const variables = new Map<string, () => string>()
    const prompt = {
      section: vi.fn((section: { name: string; order: number; text: () => string }) => { sections.push(section) }),
      variable: vi.fn((name: string, provider: () => string) => { variables.set(name, provider) }),
    }
    const ctx = {
      get: vi.fn((name: string) => name === 'systemPrompt' ? prompt : undefined),
    } as unknown as HostContextShape
    const controller = {
      contextText: vi.fn(() => 'Remember the exact literal {{}} and the active model {{model}}.'),
    } as unknown as RuntimeMemoryController

    registerRuntimeMemoryContext(ctx, controller)
    const runtimeSection = sections.find(section => section.name === RUNTIME_MEMORY_SECTION_NAME)!
    const assembly: PromptAssembly = {
      sections: [
        { name: 'other', text: 'Other section uses {{model}}.' },
        { name: runtimeSection.name, text: runtimeSection.text() },
      ],
      contexts: [],
      tools: [],
      variables: {
        model: 'deepseek',
        ...Object.fromEntries([...variables].map(([name, provider]) => [name, provider()])),
      },
    }

    expect(() => renderPrompt(assembly)).not.toThrow()
    expect(renderPrompt(assembly)).toBe([
      'Other section uses deepseek.',
      'Remember the exact literal {{}} and the active model deepseek.',
    ].join('\n\n'))
  })
})

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
