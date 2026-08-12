import { Config, resolveConfig } from "./config.js";
import { registerCommands } from "./commands.js";
import { registerGuidance } from "./guidance.js";
import { registerRpc } from "./rpc.js";
import { createRunner } from "./runner.js";
import { MnemonService } from "./service.js";
import { registerSettingsRpc } from "./settings.js";
import { registerTools } from "./tools.js";
export const name = 'dsh-mnemon';
export const inject = ['tools', 'settings', 'commands'];
export { Config, resolveConfig, MnemonService, createRunner };
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
    registerTools(ctx, service);
    registerCommands(ctx.commands, service);
    if (resolved.routingGuidance)
        registerGuidance(ctx);
    ctx.inject(['connection'], (webContext) => {
        if (resolved.tabEnabled)
            registerRpc(webContext.connection, service);
        registerSettingsRpc(webContext.connection, ctx.settings);
    });
}
//# sourceMappingURL=index.js.map