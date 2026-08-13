export const GUIDANCE_SECTION_NAME = 'mnemon:routing';
export const RUNTIME_MEMORY_SECTION_NAME = 'mnemon:runtime-memory';
export const ROUTING_GUIDANCE = 'Use Mnemon only by need. Call mnemon_recall when prior durable context may matter, especially if hot memory is only a pointer or lacks an exact requested detail; never infer a missing historical rule. New explicit reusable information normally goes to mnemon_runtime_memory; direct archival is exceptional. A write completes only with a tool receipt.';
function systemPrompt(ctx) {
    return ctx.get('systemPrompt');
}
export function registerGuidance(ctx) {
    systemPrompt(ctx)?.section?.({ name: GUIDANCE_SECTION_NAME, order: 150, text: ROUTING_GUIDANCE });
}
/** Inject the latest committed USER.md/MEMORY.md projections on every prompt assembly. */
export function registerRuntimeMemoryContext(ctx, runtimeMemory) {
    systemPrompt(ctx)?.section?.({
        name: RUNTIME_MEMORY_SECTION_NAME,
        order: 145,
        text: () => runtimeMemory.contextText(),
    });
}
//# sourceMappingURL=guidance.js.map