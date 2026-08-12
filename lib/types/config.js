import z from 'schemastery';
import { DEFAULT_RECALL_LIMIT, DEFAULT_TIMEOUT_MS } from "./config-values.js";
export { DEFAULT_RECALL_LIMIT, DEFAULT_TIMEOUT_MS } from "./config-values.js";
export const Config = z.object({
    cliPath: z.string(),
    dataDir: z.string(),
    store: z.string(),
    timeoutMs: z.number().step(1).min(100).max(120_000).default(DEFAULT_TIMEOUT_MS),
    defaultRecallLimit: z.number().step(1).min(1).max(50).default(DEFAULT_RECALL_LIMIT),
    routingGuidance: z.boolean().default(true),
    tabEnabled: z.boolean().default(true),
    writeEnabled: z.boolean().default(true),
});
function optionalText(value) {
    const trimmed = value?.trim();
    return trimmed === undefined || trimmed === '' ? undefined : trimmed;
}
export function resolveConfig(config = {}) {
    const cliPath = optionalText(config.cliPath);
    const dataDir = optionalText(config.dataDir);
    const store = optionalText(config.store);
    if (store !== undefined && !/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(store)) {
        throw new Error('dsh-mnemon: store must match [a-zA-Z0-9][a-zA-Z0-9_-]*');
    }
    return {
        ...(cliPath === undefined ? {} : { cliPath }),
        ...(dataDir === undefined ? {} : { dataDir }),
        ...(store === undefined ? {} : { store }),
        timeoutMs: config.timeoutMs ?? DEFAULT_TIMEOUT_MS,
        defaultRecallLimit: config.defaultRecallLimit ?? DEFAULT_RECALL_LIMIT,
        routingGuidance: config.routingGuidance ?? true,
        tabEnabled: config.tabEnabled ?? true,
        writeEnabled: config.writeEnabled ?? true,
    };
}
//# sourceMappingURL=config.js.map