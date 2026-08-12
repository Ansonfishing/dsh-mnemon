export const CATEGORIES = ['preference', 'decision', 'fact', 'insight', 'context', 'general'];
export const SOURCES = ['user', 'agent', 'external'];
export const EDGE_TYPES = ['temporal', 'semantic', 'causal', 'entity'];
export const INTENTS = ['WHY', 'WHEN', 'ENTITY', 'GENERAL'];
function record(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
        ? value
        : undefined;
}
function text(value) {
    return typeof value === 'string' ? value : undefined;
}
function number(value) {
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}
function stringArray(value) {
    if (!Array.isArray(value))
        return undefined;
    return value.filter((entry) => typeof entry === 'string');
}
function normalizeInsight(value) {
    const item = record(value);
    if (item === undefined)
        return undefined;
    // Mnemon <=0.1.2 returns full recall rows as
    // `{ insight: { id, content, ... }, score, intent, via, signals }`; newer
    // builds default to a compact flat row. Accept both without version gates.
    const nested = record(item.insight);
    const core = nested ?? item;
    const id = text(core.id);
    const content = text(core.content);
    if (id === undefined || content === undefined)
        return undefined;
    const insight = { id, content };
    const optionalText = {
        category: text(core.category),
        source: text(core.source),
        confidence: text(item.confidence),
        intent: text(item.intent),
        matchedVia: text(item.matched_via ?? item.via ?? item.via_edge_type),
        createdAt: text(core.created_at),
        edgeType: text(item.via_edge_type),
    };
    for (const [key, value] of Object.entries(optionalText))
        if (value !== undefined)
            Object.assign(insight, { [key]: value });
    const optionalNumbers = {
        importance: number(core.importance),
        score: number(item.score),
        depth: number(item.depth),
    };
    for (const [key, value] of Object.entries(optionalNumbers))
        if (value !== undefined)
            Object.assign(insight, { [key]: value });
    const tags = stringArray(core.tags);
    const entities = stringArray(core.entities);
    if (tags !== undefined)
        insight.tags = tags;
    if (entities !== undefined)
        insight.entities = entities;
    return insight;
}
function boundedInteger(value, fallback, min, max) {
    if (value === undefined)
        return fallback;
    if (!Number.isInteger(value) || value < min || value > max)
        throw new Error(`value must be an integer within ${min}..${max}`);
    return value;
}
function required(value, label, max) {
    const normalized = value.trim();
    if (normalized === '')
        throw new Error(`${label} is required`);
    if (normalized.length > max)
        throw new Error(`${label} is too long (max ${max} characters)`);
    return normalized;
}
function allowed(value, values, label) {
    if (value !== undefined && !values.includes(value)) {
        throw new Error(`${label} must be one of: ${values.join(', ')}`);
    }
    return value;
}
function commaList(values, label, limit) {
    if (values === undefined)
        return undefined;
    const normalized = values.map(value => value.trim()).filter(value => value !== '');
    if (normalized.length > limit)
        throw new Error(`${label} accepts at most ${limit} values`);
    if (normalized.some(value => value.includes(',')))
        throw new Error(`${label} values cannot contain commas`);
    return normalized.length === 0 ? undefined : normalized.join(',');
}
export class MnemonService {
    runner;
    config;
    constructor(runner, config) {
        this.runner = runner;
        this.config = config;
    }
    async status(signal) {
        const base = {
            cliPath: this.runner.command,
            commandFound: this.runner.commandFound,
            dataDir: this.runner.effectiveDataDir(),
            store: this.runner.effectiveStore(),
            writeEnabled: this.config.writeEnabled,
            timeoutMs: this.config.timeoutMs,
            defaultRecallLimit: this.config.defaultRecallLimit,
        };
        try {
            const [rawStatus, rawVersion] = await Promise.all([
                this.runner.runJson(['status'], signal === undefined ? {} : { signal }),
                this.runner.runText(['--version'], signal === undefined ? { globalFlags: false } : { signal, globalFlags: false }),
            ]);
            const status = record(rawStatus);
            if (status === undefined)
                throw new Error('mnemon status returned an unexpected payload');
            const byCategoryRecord = record(status.by_category) ?? {};
            const byCategory = {};
            for (const [category, count] of Object.entries(byCategoryRecord)) {
                if (typeof count === 'number')
                    byCategory[category] = count;
            }
            const topEntities = Array.isArray(status.top_entities)
                ? status.top_entities.flatMap((entry) => {
                    const entity = record(entry);
                    const name = text(entity?.entity);
                    const count = number(entity?.count);
                    return name === undefined || count === undefined ? [] : [{ entity: name, count }];
                })
                : [];
            return {
                healthy: true,
                ...base,
                version: rawVersion.trim().replace(/^mnemon version\s+/i, ''),
                stats: {
                    totalInsights: number(status.total_insights) ?? 0,
                    deletedInsights: number(status.deleted_insights) ?? 0,
                    edgeCount: number(status.edge_count) ?? 0,
                    oplogCount: number(status.oplog_count) ?? 0,
                    ...(text(status.db_path) === undefined ? {} : { dbPath: text(status.db_path) }),
                    dbSizeBytes: number(status.db_size_bytes) ?? 0,
                    byCategory,
                    topEntities,
                },
            };
        }
        catch (error) {
            return { healthy: false, ...base, error: error instanceof Error ? error.message : String(error) };
        }
    }
    async search(request, signal) {
        const query = required(request.query, 'query', 2000);
        const limit = boundedInteger(request.limit, this.config.defaultRecallLimit, 1, 50);
        const mode = allowed(request.mode, ['smart', 'keyword', 'basic'], 'mode') ?? 'smart';
        const category = allowed(request.category, CATEGORIES, 'category');
        const source = allowed(request.source, SOURCES, 'source');
        const intent = allowed(request.intent, INTENTS, 'intent');
        const args = mode === 'keyword'
            ? ['search', query, '--limit', String(limit)]
            : ['recall', query, '--limit', String(limit)];
        if (mode === 'basic')
            args.push('--basic');
        if (mode !== 'keyword') {
            if (category !== undefined)
                args.push('--cat', category);
            if (source !== undefined)
                args.push('--source', source);
            if (intent !== undefined)
                args.push('--intent', intent);
        }
        const payload = await this.runner.runJson(args, signal === undefined ? {} : { signal });
        const wrapper = record(payload);
        const values = Array.isArray(payload)
            ? payload
            : Array.isArray(wrapper?.results) ? wrapper.results : [];
        const results = values.map(normalizeInsight).filter((entry) => entry !== undefined);
        const hint = text(wrapper?.hint);
        return { query, mode, results, ...(hint === undefined ? {} : { hint }) };
    }
    async remember(request, signal) {
        this.assertWritable();
        const content = required(request.content, 'content', 8000);
        const importance = boundedInteger(request.importance, 3, 1, 5);
        const category = allowed(request.category, CATEGORIES, 'category') ?? 'general';
        const source = allowed(request.source, SOURCES, 'source') ?? 'user';
        const args = [
            'remember', content,
            '--cat', category,
            '--imp', String(importance),
            '--source', source,
        ];
        const tags = commaList(request.tags, 'tags', 20);
        const entities = commaList(request.entities, 'entities', 50);
        if (tags !== undefined)
            args.push('--tags', tags);
        if (entities !== undefined)
            args.push('--entities', entities);
        return this.runner.runJson(args, signal === undefined ? {} : { signal });
    }
    async related(id, depth = 2, edge, signal) {
        const args = ['related', required(id, 'id', 200), '--depth', String(boundedInteger(depth, 2, 1, 5))];
        const selectedEdge = allowed(edge, EDGE_TYPES, 'edge');
        if (selectedEdge !== undefined)
            args.push('--edge', selectedEdge);
        const payload = await this.runner.runJson(args, signal === undefined ? {} : { signal });
        if (!Array.isArray(payload))
            return [];
        return payload.map(normalizeInsight).filter((entry) => entry !== undefined);
    }
    async link(sourceId, targetId, type = 'semantic', weight = 0.5, reason, signal) {
        this.assertWritable();
        if (!Number.isFinite(weight) || weight < 0 || weight > 1)
            throw new Error('weight must be within 0..1');
        const selectedType = allowed(type, EDGE_TYPES, 'type') ?? 'semantic';
        const args = ['link', required(sourceId, 'sourceId', 200), required(targetId, 'targetId', 200), '--type', selectedType, '--weight', String(weight)];
        if (reason !== undefined && reason.trim() !== '')
            args.push('--meta', JSON.stringify({ reason: required(reason, 'reason', 1000) }));
        return this.runner.runJson(args, signal === undefined ? {} : { signal });
    }
    async forget(id, signal) {
        this.assertWritable();
        return this.runner.runJson(['forget', required(id, 'id', 200)], signal === undefined ? {} : { signal });
    }
    assertWritable() {
        if (!this.config.writeEnabled)
            throw new Error('dsh-mnemon is configured read-only (writeEnabled: false)');
    }
}
//# sourceMappingURL=service.js.map