import type { HostContextShape } from './contracts.ts'

export const GUIDANCE_SECTION_NAME = 'mnemon:routing'
export const ROUTING_GUIDANCE = `## Mnemon Memory Spaces

Mnemon memory orchestration runs in isolated DSH subagents. Lifecycle hooks may add a compact [MNEMON RECALL RESULT] containing selected evidence; use it as fallible context, with current user instructions and repository evidence always taking precedence. When additional durable context could materially change the work, call mnemon_recall once with a focused query—the tool delegates Memory Space selection, retrieval, and compression to a bounded child. Memory writes, new-space decisions, and merges are likewise supervised in a child; never invent memory that Mnemon did not return or claim a write that its receipt did not confirm.`

export function registerGuidance(ctx: HostContextShape): void {
  const systemPrompt = ctx.get('systemPrompt') as {
    section?: (value: { name: string; order: number; text: string }) => unknown
  } | undefined
  systemPrompt?.section?.({ name: GUIDANCE_SECTION_NAME, order: 150, text: ROUTING_GUIDANCE })
}
