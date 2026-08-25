import { describe, expect, it, vi } from 'vitest'
import { renderContextSnapshot, renderPrompt, type PromptAssembly } from '@deepseek-ai/dsh-system-prompt'
import type { HostAgent, HostContextShape } from '../src/contracts.ts'
import { registerAgentMemoryViewContext, registerAgentRuntimeMemoryContext, registerRuntimeMemoryContext, RUNTIME_MEMORY_CONTEXT_NAME, RUNTIME_MEMORY_PROTOCOL_SECTION_NAME } from '../src/guidance.ts'
import { RUNTIME_MEMORY_PROTOCOL, type RuntimeMemoryController } from '../src/runtime-memory.ts'
import type { MemoryWake } from '../packages/contracts/src/index.ts'

describe('runtime memory prompt interpolation', () => {
  it('preserves every runtime-memory interpolation shape as literal data', () => {
    const sections: Array<{ name: string; order: number; text: () => string }> = []
    const contexts: Array<{ name: string; order: number; text: () => string }> = []
    const variables = new Map<string, () => string>()
    const prompt = {
      section: vi.fn((section: { name: string; order: number; text: () => string }) => { sections.push(section) }),
      context: vi.fn((context: { name: string; order: number; text: () => string }) => { contexts.push(context) }),
      variable: vi.fn((name: string, provider: () => string) => { variables.set(name, provider) }),
    }
    const ctx = {
      get: vi.fn((name: string) => name === 'systemPrompt' ? prompt : undefined),
    } as unknown as HostContextShape
    let memoryText = [
      'Empty: {{}}',
      'Non-ASCII: {{变量}}',
      'Whitespace: {{ 变量 }}',
      'Legal and unknown names: {{model}} {{unknown}}',
      'Adjacent and nested: {{a}}{{b}} {{{nested}}} {{{{}}}}',
      'Escape name: {{mnemon_runtime_memory_literal_open_braces}}',
      'Incomplete groups: prefix {{unterminated and stray }}',
    ].join('\n')
    const controller = {
      contextText: vi.fn(() => memoryText),
    } as unknown as RuntimeMemoryController

    registerRuntimeMemoryContext(ctx, controller)
    const runtimeProtocol = sections.find(section => section.name === RUNTIME_MEMORY_PROTOCOL_SECTION_NAME)!
    const runtimeContext = contexts.find(context => context.name === RUNTIME_MEMORY_CONTEXT_NAME)!
    const assemble = (): PromptAssembly => ({
      sections: [
        { name: 'other', text: 'Other section uses {{model}}.' },
        { name: runtimeProtocol.name, text: runtimeProtocol.text() },
      ],
      contexts: [{ name: runtimeContext.name, text: runtimeContext.text() }],
      tools: [],
      variables: {
        model: 'deepseek',
        ...Object.fromEntries([...variables].map(([name, provider]) => [name, provider()])),
      },
    })

    const first = assemble()
    expect(() => renderPrompt(first)).not.toThrow()
    expect(() => renderContextSnapshot(first)).not.toThrow()
    expect(renderPrompt(first)).toBe(['Other section uses deepseek.', RUNTIME_MEMORY_PROTOCOL].join('\n\n'))
    expect(renderContextSnapshot(first)).toBe([
      'Current runtime context. This snapshot supersedes earlier runtime-context snapshots.',
      memoryText,
    ].join('\n\n'))

    memoryText = 'Updated workspace memory.'
    const second = assemble()
    expect(renderPrompt(second)).toBe(renderPrompt(first))
    expect(renderContextSnapshot(second)).toBe([
      'Current runtime context. This snapshot supersedes earlier runtime-context snapshots.',
      'Updated workspace memory.',
    ].join('\n\n'))
    expect(prompt.section).toHaveBeenCalledOnce()
  })
})

describe('agent-scoped runtime memory context', () => {
  it('renders only the currently pinned View Wake and preserves interpolation as literal data', () => {
    const context = vi.fn()
    const section = vi.fn()
    const agent = {
      ctx: { get: vi.fn((name: string) => name === 'systemPrompt' ? { context, section } : undefined) },
    } as unknown as HostAgent
    let wake: MemoryWake = { viewId: 'view-1', viewDigest: 'digest-1', text: 'Pinned {{model}} memory.', sections: [{ layerId: 'runtime', mode: 'eager', text: 'Pinned {{model}} memory.' }] }

    registerAgentMemoryViewContext(agent, () => wake)
    const registeredContext = context.mock.calls[0]![0]
    const registeredProtocol = section.mock.calls[0]![0]
    expect(registeredContext?.text()).toBe('Pinned {{mnemon_runtime_memory_literal_open_braces}}model}} memory.')
    expect(registeredProtocol?.text()).toBe(RUNTIME_MEMORY_PROTOCOL)
    wake = { viewId: 'view-1', viewDigest: 'digest-1', text: 'Same pinned memory.', sections: [{ layerId: 'runtime', mode: 'eager', text: 'Same pinned memory.' }] }
    expect(registeredContext?.text()).toBe('Same pinned memory.')
    wake = { viewId: 'view-2', viewDigest: 'digest-2', text: 'Only routed memory.', sections: [{ layerId: 'documents', mode: 'routed', text: 'One active project Document.' }] }
    expect(registeredProtocol?.text()).toBe('')
    expect(registeredContext?.text()).toBe('Only routed memory.')
  })

  it('registers a same-named per-Agent runtime context that resolves the current workspace lazily', () => {
    const disposeContext = vi.fn()
    const disposeProtocol = vi.fn()
    const context = vi.fn((_value: { name: string; order: number; text: () => string }) => disposeContext)
    const section = vi.fn((_value: { name: string; order: number; text: () => string }) => disposeProtocol)
    const agent = {
      ctx: { get: vi.fn((name: string) => name === 'systemPrompt' ? { context, section } : undefined) },
    } as unknown as HostAgent
    let text = 'workspace-one memory'
    const controller = { contextText: vi.fn(() => text) } as unknown as RuntimeMemoryController

    const stop = registerAgentRuntimeMemoryContext(agent, () => controller)
    const registered = context.mock.calls[0]![0]
    expect(registered).toMatchObject({ name: RUNTIME_MEMORY_CONTEXT_NAME, order: 145 })
    expect(registered?.text()).toBe('workspace-one memory')
    text = 'workspace-two memory'
    expect(registered?.text()).toBe('workspace-two memory')
    stop()
    expect(disposeContext).toHaveBeenCalledTimes(1)
    expect(disposeProtocol).toHaveBeenCalledTimes(1)
  })

  it('projects no hot memory while automatic projection is disabled', () => {
    const context = vi.fn()
    const section = vi.fn()
    const agent = {
      ctx: { get: vi.fn((name: string) => name === 'systemPrompt' ? { context, section } : undefined) },
    } as unknown as HostAgent
    const controller = { contextText: vi.fn(() => 'private workspace memory') } as unknown as RuntimeMemoryController
    let enabled = false

    registerAgentRuntimeMemoryContext(agent, () => controller, () => enabled)
    const registered = context.mock.calls[0]![0]
    const protocol = section.mock.calls[0]![0]
    expect(registered?.text()).toBe('')
    expect(protocol?.text()).toBe('')
    expect(controller.contextText).not.toHaveBeenCalled()
    enabled = true
    expect(registered?.text()).toBe('private workspace memory')
    expect(protocol?.text()).toBe(RUNTIME_MEMORY_PROTOCOL)
  })
})
