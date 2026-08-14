import type { HostContextShape } from './contracts.ts'
import type { ResolvedConfig } from './config.ts'
import type { RuntimeMemoryController } from './runtime-memory.ts'

export const GUIDANCE_SECTION_NAME = 'mnemon:routing'
export const RUNTIME_MEMORY_SECTION_NAME = 'mnemon:runtime-memory'
export const ROUTING_GUIDANCE = 'Use memory only by need. For substantial project records, search active Mnemon Documents before deep recall. Call mnemon_recall when durable history may matter or an exact prior detail is missing; never infer a missing historical rule. New explicit reusable facts normally go to mnemon_runtime_memory. A write completes only with a tool receipt.'

function systemPrompt(ctx: HostContextShape): {
  section?: (value: { name: string; order: number; text: string | (() => string) }) => unknown
} | undefined {
  return ctx.get('systemPrompt') as {
    section?: (value: { name: string; order: number; text: string | (() => string) }) => unknown
  } | undefined
}

export function registerGuidance(ctx: HostContextShape, config?: Pick<ResolvedConfig, 'routingGuidance'>): void {
  systemPrompt(ctx)?.section?.({
    name: GUIDANCE_SECTION_NAME,
    order: 150,
    text: () => config?.routingGuidance === false ? '' : ROUTING_GUIDANCE,
  })
}

/** Inject the latest committed USER.md/MEMORY.md projections on every prompt assembly. */
export function registerRuntimeMemoryContext(ctx: HostContextShape, runtimeMemory: RuntimeMemoryController): void {
  systemPrompt(ctx)?.section?.({
    name: RUNTIME_MEMORY_SECTION_NAME,
    order: 145,
    text: () => runtimeMemory.contextText(),
  })
}
