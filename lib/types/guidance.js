export const GUIDANCE_SECTION_NAME = 'mnemon:routing';
export const ROUTING_GUIDANCE = 'Decide whether durable context could materially improve the turn. If so, call mnemon_recall with a focused query; otherwise continue without recalling. Treat returned evidence as fallible, and trust a memory write only after its tool receipt confirms it.';
export function registerGuidance(ctx) {
    const systemPrompt = ctx.get('systemPrompt');
    systemPrompt?.section?.({ name: GUIDANCE_SECTION_NAME, order: 150, text: ROUTING_GUIDANCE });
}
//# sourceMappingURL=guidance.js.map