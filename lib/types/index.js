import { Config, resolveConfig } from "./config.js";
import { registerGuidance } from "./guidance.js";
import { registerRpc } from "./rpc.js";
import { createRunner } from "./runner.js";
import { MnemonService } from "./service.js";
import { registerTools } from "./tools.js";
export const name = 'dsh-mnemon';
export const inject = ['tools'];
export { Config, resolveConfig, MnemonService, createRunner };
/** Mount native model tools on every DSH surface and UI RPC only when Web connection exists. */
export function apply(rawContext, config = {}) {
    const ctx = rawContext;
    const resolved = resolveConfig(config);
    const service = new MnemonService(createRunner(resolved), resolved);
    registerTools(ctx, service);
    if (resolved.routingGuidance)
        registerGuidance(ctx);
    if (resolved.tabEnabled) {
        ctx.inject(['connection'], (webContext) => {
            registerRpc(webContext.connection, service);
        });
    }
}
//# sourceMappingURL=index.js.map