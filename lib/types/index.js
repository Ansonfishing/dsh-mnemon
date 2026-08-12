import { Config, resolveConfig } from "./config.js";
import { registerCommands } from "./commands.js";
import { registerGuidance } from "./guidance.js";
import { MnemonLifecycle } from "./lifecycle.js";
import { registerRpc } from "./rpc.js";
import { createRunner } from "./runner.js";
import { MnemonService } from "./service.js";
import { registerSettingsRpc } from "./settings.js";
import { registerTools } from "./tools.js";
export const name = 'dsh-mnemon';
export const inject = ['tools', 'settings', 'commands', 'agents'];
export { Config, resolveConfig, MnemonLifecycle, MnemonService, createRunner };
/** Mount native model tools on every DSH surface and UI RPC only when Web connection exists. */
export function apply(rawContext, config = {}) {
    const ctx = rawContext;
    const settings = ctx.settings.register('mnemon', Config, {
        base: config,
        applies: 'restart',
        validate: value => { resolveConfig(value); },
    });
    const resolved = resolveConfig(settings.get());
    const service = new MnemonService(createRunner(resolved), resolved);
    const lifecycle = new MnemonLifecycle(ctx, service, resolved);
    ctx.effect(() => lifecycle.start(), 'dsh-mnemon.lifecycle-root()');
    registerTools(ctx, service);
    registerCommands(ctx.commands, service);
    if (resolved.routingGuidance)
        registerGuidance(ctx);
    ctx.inject(['connection'], (webContext) => {
        if (resolved.tabEnabled)
            registerRpc(webContext.connection, service, lifecycle);
        registerSettingsRpc(webContext.connection, ctx.settings);
    });
}
//# sourceMappingURL=index.js.map