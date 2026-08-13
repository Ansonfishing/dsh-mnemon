import { Config, resolveConfig } from "./config.js";
import { registerCommands } from "./commands.js";
import { DocumentManager } from "./documents.js";
import { registerGuidance, registerRuntimeMemoryContext } from "./guidance.js";
import { MnemonLifecycle } from "./lifecycle.js";
import { registerRpc } from "./rpc.js";
import { createRunner } from "./runner.js";
import { RuntimeMemoryController } from "./runtime-memory.js";
import { MnemonService } from "./service.js";
import { registerSettingsRpc } from "./settings.js";
import { MnemonSubagentCoordinator } from "./subagent.js";
import { registerTools } from "./tools.js";
export const name = 'dsh-mnemon';
export const inject = ['tools', 'settings', 'commands', 'agents', 'subagents'];
export { Config, resolveConfig, DocumentManager, MnemonLifecycle, MnemonService, MnemonSubagentCoordinator, RuntimeMemoryController, createRunner };
/** Mount native model tools on every DSH surface and UI RPC only when Web connection exists. */
export function apply(rawContext, config = {}) {
    const ctx = rawContext;
    const settings = ctx.settings.register('mnemon', Config, {
        base: config,
        applies: 'restart',
        validate: value => { resolveConfig(value); },
    });
    const resolved = resolveConfig(settings.get());
    const runner = createRunner(resolved);
    const service = new MnemonService(runner, resolved);
    const runtimeMemory = new RuntimeMemoryController(runner);
    const documents = new DocumentManager();
    const coordinator = new MnemonSubagentCoordinator(ctx.subagents, runtimeMemory, documents);
    const lifecycle = new MnemonLifecycle(ctx, coordinator, resolved);
    ctx.effect(() => lifecycle.start(), 'dsh-mnemon.lifecycle-root()');
    registerTools(ctx, service, coordinator, runtimeMemory, documents);
    registerCommands(ctx.commands, service, coordinator);
    if (resolved.routingGuidance)
        registerGuidance(ctx);
    registerRuntimeMemoryContext(ctx, runtimeMemory);
    ctx.inject(['connection'], (webContext) => {
        if (resolved.tabEnabled)
            registerRpc(webContext.connection, service, lifecycle, runtimeMemory);
        registerSettingsRpc(webContext.connection, ctx.settings);
    });
}
//# sourceMappingURL=index.js.map