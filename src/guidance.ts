import type { HostContextShape } from './contracts.ts'

export const GUIDANCE_SECTION_NAME = 'mnemon:routing'
export const ROUTING_GUIDANCE = 'Use Mnemon only by need: call mnemon_recall when prior durable context may matter, and call mnemon_remember only for new, explicit, reusable user information. Otherwise call neither. Treat recall as fallible and writes as complete only after a tool receipt.'

export function registerGuidance(ctx: HostContextShape): void {
  const systemPrompt = ctx.get('systemPrompt') as {
    section?: (value: { name: string; order: number; text: string }) => unknown
  } | undefined
  systemPrompt?.section?.({ name: GUIDANCE_SECTION_NAME, order: 150, text: ROUTING_GUIDANCE })
}
