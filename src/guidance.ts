import type { HostContextShape } from './contracts.ts'

export const GUIDANCE_SECTION_NAME = 'mnemon:routing'
export const ROUTING_GUIDANCE = `## Mnemon external memory

Mnemon is a shared, persistent memory graph. At the start of a task, make a recall judgment: use one focused mnemon_recall query only when prior decisions, preferences, rationale, conventions, pitfalls, or earlier work could materially change the result. Current user instructions and repository evidence always outrank stale memory. At the end of a task, make a writeback judgment: use mnemon_remember only for durable, self-contained knowledge worth carrying into future sessions; skip routine progress, transcripts, temporary state, and facts already obvious from the repository. Search before writing to avoid duplicates, use mnemon_related when graph context matters, and never invent memory that Mnemon did not return.`

export function registerGuidance(ctx: HostContextShape): void {
  const systemPrompt = ctx.get('systemPrompt') as {
    section?: (value: { name: string; order: number; text: string }) => unknown
  } | undefined
  systemPrompt?.section?.({ name: GUIDANCE_SECTION_NAME, order: 150, text: ROUTING_GUIDANCE })
}
