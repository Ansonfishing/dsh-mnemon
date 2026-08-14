import z from 'schemastery';
import { isAbsolute } from 'node:path';
import { DEFAULT_IDLE_REVIEW_MS, DEFAULT_RECALL_LIMIT, DEFAULT_TIMEOUT_MS } from "./config-values.js";
export { DEFAULT_IDLE_REVIEW_MS, DEFAULT_RECALL_LIMIT, DEFAULT_TIMEOUT_MS } from "./config-values.js";
export const InteractionConfig = z.object({
    toolviews: z.boolean().default(false),
    turnBar: z.boolean().default(false),
    saveAction: z.boolean().default(false),
});
export const Config = z.object({
    // Keep this optional in the schema so legacy dataDir-only installs still
    // resolve to the custom scope instead of being silently reset to global.
    storageScope: z.union(['global', 'workspace', 'custom']),
    cliPath: z.string(),
    dataDir: z.string(),
    customPackId: z.string(),
    customPacks: z.array(z.object({
        id: z.string(),
        name: z.string(),
        dataDir: z.string(),
    })).default([]),
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
    // Each interaction surface is opt-in and defaults off; users enable them live.
    conversationInteraction: z.object({
        toolviews: z.boolean().default(false),
        turnBar: z.boolean().default(false),
        saveAction: z.boolean().default(false),
    }).default({ toolviews: false, turnBar: false, saveAction: false }),
});
export function resolveInteractionConfig(config = {}) {
    return {
        toolviews: config.toolviews ?? false,
        turnBar: config.turnBar ?? false,
        saveAction: config.saveAction ?? false,
    };
}
function optionalText(value) {
    const trimmed = value?.trim();
    return trimmed === undefined || trimmed === '' ? undefined : trimmed;
}
const CUSTOM_PACK_ID = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/;
function validateCustomDataDir(value) {
    const dataDir = optionalText(value);
    if (dataDir === undefined)
        throw new Error('dsh-mnemon: custom Pack dataDir is required');
    if (!isAbsolute(dataDir) && dataDir !== '~' && !dataDir.startsWith('~/')) {
        throw new Error('dsh-mnemon: custom Pack dataDir must be absolute or start with ~/');
    }
    return dataDir;
}
function resolveCustomPacks(value, legacyDataDir) {
    const packs = [];
    const ids = new Set();
    for (const candidate of value ?? []) {
        const id = optionalText(candidate.id);
        const name = optionalText(candidate.name);
        if (id === undefined || !CUSTOM_PACK_ID.test(id))
            throw new Error('dsh-mnemon: custom Pack id must match [a-zA-Z0-9][a-zA-Z0-9_-]*');
        if (ids.has(id))
            throw new Error(`dsh-mnemon: duplicate custom Pack id: ${id}`);
        if (name === undefined || name.length > 100)
            throw new Error('dsh-mnemon: custom Pack name must contain 1..100 characters');
        ids.add(id);
        packs.push({ id, name, dataDir: validateCustomDataDir(candidate.dataDir) });
    }
    if (packs.length > 32)
        throw new Error('dsh-mnemon: at most 32 custom Packs may be configured');
    if (legacyDataDir !== undefined && !packs.some(pack => pack.dataDir === legacyDataDir)) {
        let id = 'legacy';
        let suffix = 2;
        while (ids.has(id))
            id = `legacy-${suffix++}`;
        packs.push({ id, name: 'Custom Pack', dataDir: validateCustomDataDir(legacyDataDir) });
    }
    return packs;
}
export function resolveConfig(config = {}) {
    const cliPath = optionalText(config.cliPath);
    const legacyDataDir = optionalText(config.dataDir);
    const legacyPacks = resolveCustomPacks(config.customPacks, legacyDataDir);
    const requestedPackId = optionalText(config.customPackId);
    if (requestedPackId !== undefined && !CUSTOM_PACK_ID.test(requestedPackId))
        throw new Error('dsh-mnemon: customPackId is invalid');
    const store = optionalText(config.store);
    const storageScope = config.storageScope ?? (legacyDataDir === undefined && legacyPacks.length === 0 ? 'global' : 'custom');
    const selectedPack = requestedPackId === undefined
        ? legacyPacks.find(pack => pack.dataDir === legacyDataDir) ?? (legacyPacks.length === 1 ? legacyPacks[0] : undefined)
        : legacyPacks.find(pack => pack.id === requestedPackId);
    if (requestedPackId !== undefined && selectedPack === undefined)
        throw new Error(`dsh-mnemon: unknown custom Pack: ${requestedPackId}`);
    const dataDir = selectedPack?.dataDir ?? legacyDataDir;
    if (storageScope === 'custom' && dataDir === undefined)
        throw new Error('dsh-mnemon: a custom dataDir is required when storageScope is custom');
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
            toolviews: config.conversationInteraction?.toolviews ?? false,
            turnBar: config.conversationInteraction?.turnBar ?? false,
            saveAction: config.conversationInteraction?.saveAction ?? false,
        },
    };
}
//# sourceMappingURL=config.js.map