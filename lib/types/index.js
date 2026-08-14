import { Config, InteractionConfig, resolveConfig, resolveInteractionConfig } from "./config.js";
import { registerCommands } from "./commands.js";
import { DocumentManager } from "./documents.js";
import { registerGuidance, registerRuntimeMemoryContext } from "./guidance.js";
import { createRuntimeGraph, LiveMnemonRuntime } from "./live-runtime.js";
import { MnemonLifecycle } from "./lifecycle.js";
import { registerRpc } from "./rpc.js";
import { createRunner } from "./runner.js";
import { RuntimeMemoryController } from "./runtime-memory.js";
import { MnemonService } from "./service.js";
import { registerSettingsRpc } from "./settings.js";
import { MnemonSubagentCoordinator } from "./subagent.js";
import { registerTools } from "./tools.js";
import { StorageScopeInspector } from "./storage-scope.js";
import { MnemonPackManager } from "./pack.js";
export const name = 'dsh-mnemon';
export const inject = ['tools', 'settings', 'commands', 'agents', 'subagents'];
export { Config, InteractionConfig, resolveConfig, resolveInteractionConfig, DocumentManager, LiveMnemonRuntime, MnemonLifecycle, MnemonService, MnemonSubagentCoordinator, RuntimeMemoryController, StorageScopeInspector, MnemonPackManager, createRunner, createRuntimeGraph };
/** Mount native model tools on every DSH surface and UI RPC only when Web connection exists. */
export function apply(rawContext, config = {}) {
    const ctx = rawContext;
    const prepared = new WeakMap();
    const settings = ctx.settings.register('mnemon', Config, {
        base: config,
        applies: 'live',
        validate: value => {
            prepared.set(value, createRuntimeGraph(resolveConfig(value)));
        },
    });
    const initialSettings = settings.get();
    const runtime = new LiveMnemonRuntime(prepared.get(initialSettings) ?? createRuntimeGraph(resolveConfig(initialSettings)));
    const resolved = runtime.config;
    ctx.on('settings/updated', ((namespace, next) => {
        if (namespace !== 'mnemon')
            return;
        runtime.swap(prepared.get(next) ?? createRuntimeGraph(resolveConfig(next)));
    }));
    ctx.settings.register('mnemon-ui', InteractionConfig, {
        base: resolveInteractionConfig(resolved.conversationInteraction),
        applies: 'live',
    });
    const coordinator = new MnemonSubagentCoordinator(ctx.subagents, runtime.runtimeMemory, runtime.documents);
    const lifecycle = new MnemonLifecycle(ctx, coordinator, resolved);
    ctx.effect(() => lifecycle.start(), 'dsh-mnemon.lifecycle-root()');
    registerTools(ctx, runtime.service, coordinator, runtime.runtimeMemory, runtime.documents);
    registerCommands(ctx.commands, runtime.service, coordinator);
    registerGuidance(ctx, resolved);
    registerRuntimeMemoryContext(ctx, runtime.runtimeMemory);
    ctx.inject(['connection'], (webContext) => {
        registerRpc(webContext.connection, runtime.service, lifecycle, runtime.runtimeMemory, runtime.storage, runtime.packs);
        registerSettingsRpc(webContext.connection, ctx.settings);
    });
}
//# sourceMappingURL=index.js.map