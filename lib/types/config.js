import z from 'schemastery';
import { isAbsolute } from 'node:path';
import { DEFAULT_IDLE_REVIEW_MS, DEFAULT_RECALL_LIMIT, DEFAULT_TIMEOUT_MS } from "./config-values.js";
export { DEFAULT_IDLE_REVIEW_MS, DEFAULT_RECALL_LIMIT, DEFAULT_TIMEOUT_MS } from "./config-values.js";
export const Config = z.object({
    // Keep this optional in the schema so legacy dataDir-only installs still
    // resolve to the custom scope instead of being silently reset to global.
    storageScope: z.union(['global', 'workspace', 'custom']),
    cliPath: z.string(),
    dataDir: z.string(),
    store: z.string(),
    timeoutMs: z.number().step(1).min(100).max(120_000).default(DEFAULT_TIMEOUT_MS),
    defaultRecallLimit: z.number().step(1).min(1).max(50).default(DEFAULT_RECALL_LIMIT),
    routingGuidance: z.boolean().default(true),
    tabEnabled: z.boolean().default(true),
    writeEnabled: z.boolean().default(true),
    lifecycleEnabled: z.boolean().default(true),
    recallMode: z.union(['guided', 'off']).default('guided'),
    writebackMode: z.union(['guided', 'off']).default('guided'),
    idleReviewMs: z.number().step(1).min(5_000).max(600_000).default(DEFAULT_IDLE_REVIEW_MS),
    // Each interaction surface defaults on; users may disable any of them live.
    conversationInteraction: z.object({
        toolviews: z.boolean().default(true),
        turnBar: z.boolean().default(true),
        saveAction: z.boolean().default(true),
    }).default({ toolviews: true, turnBar: true, saveAction: true }),
});
function optionalText(value) {
    const trimmed = value?.trim();
    return trimmed === undefined || trimmed === '' ? undefined : trimmed;
}
export function resolveConfig(config = {}) {
    const cliPath = optionalText(config.cliPath);
    const dataDir = optionalText(config.dataDir);
    const store = optionalText(config.store);
    const storageScope = config.storageScope ?? (dataDir === undefined ? 'global' : 'custom');
    if (storageScope === 'custom' && dataDir === undefined)
        throw new Error('dsh-mnemon: dataDir is required when storageScope is custom');
    if (storageScope === 'custom' && dataDir !== undefined && !isAbsolute(dataDir) && dataDir !== '~' && !dataDir.startsWith('~/')) {
        throw new Error('dsh-mnemon: custom dataDir must be absolute or start with ~/');
    }
    if (store !== undefined && !/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(store)) {
        throw new Error('dsh-mnemon: store must match [a-zA-Z0-9][a-zA-Z0-9_-]*');
    }
    return {
        storageScope,
        ...(cliPath === undefined ? {} : { cliPath }),
        ...(dataDir === undefined ? {} : { dataDir }),
        ...(store === undefined ? {} : { store }),
        timeoutMs: config.timeoutMs ?? DEFAULT_TIMEOUT_MS,
        defaultRecallLimit: config.defaultRecallLimit ?? DEFAULT_RECALL_LIMIT,
        routingGuidance: config.routingGuidance ?? true,
        tabEnabled: config.tabEnabled ?? true,
        writeEnabled: config.writeEnabled ?? true,
        lifecycleEnabled: config.lifecycleEnabled ?? true,
        recallMode: config.recallMode ?? 'guided',
        writebackMode: config.writebackMode ?? 'guided',
        idleReviewMs: config.idleReviewMs ?? DEFAULT_IDLE_REVIEW_MS,
        conversationInteraction: {
            toolviews: config.conversationInteraction?.toolviews ?? true,
            turnBar: config.conversationInteraction?.turnBar ?? true,
            saveAction: config.conversationInteraction?.saveAction ?? true,
        },
    };
}
//# sourceMappingURL=config.js.map