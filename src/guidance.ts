import type { HostContextShape } from './contracts.ts'
import type { RuntimeMemoryController } from './runtime-memory.ts'

export const GUIDANCE_SECTION_NAME = 'mnemon:routing'
export const RUNTIME_MEMORY_SECTION_NAME = 'mnemon:runtime-memory'
export const ROUTING_GUIDANCE = 'Use Mnemon only by need: call mnemon_recall when prior durable context may matter. New explicit reusable information normally goes to mnemon_runtime_memory; direct Mnemon archival is exceptional. Treat recall as fallible and writes as complete only after a tool receipt.'

function systemPrompt(ctx: HostContextShape): {
  section?: (value: { name: string; order: number; text: string | (() => string) }) => unknown
} | undefined {
  return ctx.get('systemPrompt') as {
    section?: (value: { name: string; order: number; text: string | (() => string) }) => unknown
  } | undefined
}

export function registerGuidance(ctx: HostContextShape): void {
  systemPrompt(ctx)?.section?.({ name: GUIDANCE_SECTION_NAME, order: 150, text: ROUTING_GUIDANCE })
}

/** Inject the latest committed USER.md/MEMORY.md projections on every prompt assembly. */
export function registerRuntimeMemoryContext(ctx: HostContextShape, runtimeMemory: RuntimeMemoryController): void {
  systemPrompt(ctx)?.section?.({
    name: RUNTIME_MEMORY_SECTION_NAME,
    order: 145,
    text: () => runtimeMemory.contextText(),
  })
}
