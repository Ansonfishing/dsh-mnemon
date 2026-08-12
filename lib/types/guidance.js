export const GUIDANCE_SECTION_NAME = 'mnemon:routing';
export const ROUTING_GUIDANCE = 'Use Mnemon only by need: call mnemon_recall when prior durable context may matter, and call mnemon_remember only for new, explicit, reusable user information. Otherwise call neither. Treat recall as fallible and writes as complete only after a tool receipt.';
export function registerGuidance(ctx) {
    const systemPrompt = ctx.get('systemPrompt');
    systemPrompt?.section?.({ name: GUIDANCE_SECTION_NAME, order: 150, text: ROUTING_GUIDANCE });
}
//# sourceMappingURL=guidance.js.map