import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { MemoryBodyRegistry, } from "./memory-bodies.js";
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
const JS_STRING = '"(?:\\\\.|[^"\\\\])*"';
const VIZ_NODE_PATTERN = new RegExp(`\\{id:(${JS_STRING}),label:(${JS_STRING}),title:(${JS_STRING}),color:(${JS_STRING}),font:\\{color:"white"\\}\\}`, 'g');
const VIZ_EDGE_PATTERN = new RegExp(`\\{from:(${JS_STRING}),to:(${JS_STRING}),label:(${JS_STRING}),color:\\{color:(${JS_STRING})\\},arrows:"to"`, 'g');
const EDGE_COLORS = {
    '#aaaaaa': 'temporal',
    '#3498db': 'semantic',
    '#e74c3c': 'causal',
    '#2ecc71': 'entity',
};
function decodeJsString(value) {
    const decoded = JSON.parse(value);
    if (typeof decoded !== 'string')
        throw new Error('Mnemon viz contained an invalid string');
    return decoded;
}
/** Parse the official Mnemon vis.js export without executing its HTML or loading its CDN script. */
export function parseMemoryGraph(html, now = new Date()) {
    const nodes = [];
    const edges = [];
    for (const match of html.matchAll(VIZ_NODE_PATTERN)) {
        const id = decodeJsString(match[1]);
        const label = decodeJsString(match[2]);
        const content = decodeJsString(match[3]).replaceAll('\\n', '\n');
        const color = decodeJsString(match[4]);
        const category = /\[([a-z_]+)\]/i.exec(label)?.[1] ?? 'general';
        nodes.push({ id, content, category, color });
    }
    for (const match of html.matchAll(VIZ_EDGE_PATTERN)) {
        const color = decodeJsString(match[4]);
        const type = EDGE_COLORS[color.toLowerCase()];
        edges.push({
            sourceId: decodeJsString(match[1]),
            targetId: decodeJsString(match[2]),
            label: decodeJsString(match[3]),
            color,
            ...(type === undefined ? {} : { type }),
        });
    }
    if (!html.includes('var nodes = new vis.DataSet(['))
        throw new Error('Mnemon viz returned an unexpected HTML payload');
    return { nodes, edges, generatedAt: now.toISOString() };
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
    memoryBodies;
    constructor(runner, config, memoryBodies) {
        this.runner = runner;
        this.config = config;
        this.memoryBodies = memoryBodies ?? new MemoryBodyRegistry(runner);
    }
    async bodies(signal) {
        const items = [];
        for (const body of this.memoryBodies.list())
            items.push(await this.bodyStatus(body, signal));
        return {
            items,
            total: items.length,
            activeCount: items.filter(body => body.active).length,
            directory: this.memoryBodies.directory,
            generatedAt: new Date().toISOString(),
        };
    }
    async status(signal) {
        const catalog = await this.bodies(signal);
        const active = catalog.items.filter(body => body.active);
        const base = {
            cliPath: this.runner.command,
            commandFound: this.runner.commandFound,
            dataDir: this.runner.effectiveDataDir(),
            store: active.map(body => body.id).join(', ') || 'none',
            writeEnabled: this.config.writeEnabled,
            timeoutMs: this.config.timeoutMs,
            defaultRecallLimit: this.config.defaultRecallLimit,
            memoryBodyDirectory: catalog.directory,
            memoryBodies: catalog.items,
        };
        try {
            const rawVersion = await this.runner.runText(['--version'], signal === undefined ? { globalFlags: false } : { signal, globalFlags: false });
            const healthyBodies = active.filter(body => body.healthy && body.stats !== undefined);
            const topEntities = new Map();
            const byCategory = {};
            for (const body of healthyBodies) {
                for (const [category, count] of Object.entries(body.stats.byCategory))
                    byCategory[category] = (byCategory[category] ?? 0) + count;
                for (const entity of body.stats.topEntities)
                    topEntities.set(entity.entity, (topEntities.get(entity.entity) ?? 0) + entity.count);
            }
            const stats = {
                totalInsights: healthyBodies.reduce((total, body) => total + body.stats.totalInsights, 0),
                deletedInsights: healthyBodies.reduce((total, body) => total + body.stats.deletedInsights, 0),
                edgeCount: healthyBodies.reduce((total, body) => total + body.stats.edgeCount, 0),
                oplogCount: healthyBodies.reduce((total, body) => total + body.stats.oplogCount, 0),
                dbSizeBytes: healthyBodies.reduce((total, body) => total + body.stats.dbSizeBytes, 0),
                byCategory,
                topEntities: [...topEntities].map(([entity, count]) => ({ entity, count })).sort((left, right) => right.count - left.count),
                ...(active.length === 1 ? { dbPath: active[0].dbPath } : {}),
            };
            const failed = active.filter(body => !body.healthy);
            return {
                healthy: failed.length === 0,
                ...base,
                version: rawVersion.trim().replace(/^mnemon version\s+/i, ''),
                stats,
                ...(failed.length === 0 ? {} : { error: failed.map(body => `${body.name}: ${body.error ?? 'unavailable'}`).join('; ') }),
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
        const bodies = this.readBodies(request.memoryBodyIds);
        const results = [];
        const hints = [];
        for (const body of bodies) {
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
            const payload = await this.runner.runJson(args, { ...(signal === undefined ? {} : { signal }), store: body.id });
            const wrapper = record(payload);
            const values = Array.isArray(payload) ? payload : Array.isArray(wrapper?.results) ? wrapper.results : [];
            results.push(...values.map(normalizeInsight).filter((entry) => entry !== undefined).map(entry => this.annotate(entry, body)));
            const hint = text(wrapper?.hint);
            if (hint !== undefined)
                hints.push(`${body.name}: ${hint}`);
        }
        results.sort((left, right) => (right.score ?? 0) - (left.score ?? 0));
        return { query, mode, results: results.slice(0, limit), ...(hints.length === 0 ? {} : { hint: hints.join('\n') }) };
    }
    async graph(signal, memoryBodyIds) {
        const bodies = this.readBodies(memoryBodyIds);
        const nodes = [];
        const edges = [];
        for (const body of bodies) {
            const snapshot = await this.graphForBody(body, signal);
            const graphId = (id) => `${body.id}:${id}`;
            nodes.push(...snapshot.nodes.map(node => ({ ...this.annotate(node, body), color: node.color, graphId: graphId(node.id) })));
            edges.push(...snapshot.edges.map(edge => ({ ...edge, sourceId: graphId(edge.sourceId), targetId: graphId(edge.targetId) })));
        }
        return {
            nodes,
            edges,
            generatedAt: new Date().toISOString(),
            memoryBodies: bodies.map(({ id, name, active }) => ({ id, name, active })),
        };
    }
    async list(request = {}, signal) {
        const query = request.query?.trim().toLocaleLowerCase() ?? '';
        if (query.length > 500)
            throw new Error('query is too long (max 500 characters)');
        const category = allowed(request.category, CATEGORIES, 'category');
        const limit = boundedInteger(request.limit, 200, 1, 1000);
        const graph = await this.graph(signal, request.memoryBodyIds);
        const matches = graph.nodes.filter(node => (category === undefined || node.category === category)
            && (query === '' || node.content.toLocaleLowerCase().includes(query) || node.id.toLocaleLowerCase().includes(query)));
        return { items: matches.slice(0, limit), total: matches.length, generatedAt: graph.generatedAt };
    }
    async entities(entity, limit, signal) {
        const status = await this.status(signal);
        const items = status.stats?.topEntities ?? [];
        const selected = entity?.trim() ?? '';
        if (selected === '')
            return { items, insights: [] };
        if (selected.length > 200)
            throw new Error('entity is too long (max 200 characters)');
        const response = await this.search({ query: selected, intent: 'ENTITY', limit: boundedInteger(limit, 20, 1, 50) }, signal);
        return { items, selected, insights: response.results };
    }
    async remember(request, signal) {
        this.assertWritable();
        const body = this.writeBody(request.memoryBodyId);
        const content = required(request.content, 'content', 8000);
        const importance = boundedInteger(request.importance, 3, 1, 5);
        const category = allowed(request.category, CATEGORIES, 'category') ?? 'general';
        const source = allowed(request.source, SOURCES, 'source') ?? 'user';
        const args = ['remember', content, '--cat', category, '--imp', String(importance), '--source', source];
        const tags = commaList(request.tags, 'tags', 20);
        const entities = commaList(request.entities, 'entities', 50);
        if (tags !== undefined)
            args.push('--tags', tags);
        if (entities !== undefined)
            args.push('--entities', entities);
        const result = await this.runner.runJson(args, { ...(signal === undefined ? {} : { signal }), store: body.id });
        this.activateAfterWrite(body);
        return this.annotateResult(result, body);
    }
    async related(id, depth = 2, edge, signal, memoryBodyId) {
        const body = this.readBody(memoryBodyId);
        const args = ['related', required(id, 'id', 200), '--depth', String(boundedInteger(depth, 2, 1, 5))];
        const selectedEdge = allowed(edge, EDGE_TYPES, 'edge');
        if (selectedEdge !== undefined)
            args.push('--edge', selectedEdge);
        const payload = await this.runner.runJson(args, { ...(signal === undefined ? {} : { signal }), store: body.id });
        if (!Array.isArray(payload))
            return [];
        return payload.map(normalizeInsight).filter((entry) => entry !== undefined).map(entry => this.annotate(entry, body));
    }
    async link(sourceId, targetId, type = 'semantic', weight = 0.5, reason, signal, memoryBodyId) {
        this.assertWritable();
        const body = this.writeBody(memoryBodyId);
        if (!Number.isFinite(weight) || weight < 0 || weight > 1)
            throw new Error('weight must be within 0..1');
        const selectedType = allowed(type, EDGE_TYPES, 'type') ?? 'semantic';
        const args = ['link', required(sourceId, 'sourceId', 200), required(targetId, 'targetId', 200), '--type', selectedType, '--weight', String(weight)];
        if (reason !== undefined && reason.trim() !== '')
            args.push('--meta', JSON.stringify({ reason: required(reason, 'reason', 1000) }));
        const result = await this.runner.runJson(args, { ...(signal === undefined ? {} : { signal }), store: body.id });
        this.activateAfterWrite(body);
        return this.annotateResult(result, body);
    }
    async forget(id, signal, memoryBodyId) {
        this.assertWritable();
        const body = this.writeBody(memoryBodyId);
        const result = await this.runner.runJson(['forget', required(id, 'id', 200)], { ...(signal === undefined ? {} : { signal }), store: body.id });
        this.activateAfterWrite(body);
        return this.annotateResult(result, body);
    }
    async createBody(request, signal) {
        this.assertWritable();
        return this.memoryBodies.create(request, signal);
    }
    updateBody(id, request) {
        this.assertWritable();
        return this.memoryBodies.update(id, request);
    }
    async mergeBodies(targetBodyId, sourceBodyIds, deactivateSources = true, signal) {
        this.assertWritable();
        const target = this.memoryBodies.get(targetBodyId);
        const sourceIds = [...new Set(sourceBodyIds.map(id => id.trim()).filter(id => id !== ''))];
        if (sourceIds.length === 0)
            throw new Error('sourceMemoryBodyIds requires at least one memory body');
        if (sourceIds.includes(target.id))
            throw new Error('target memory body cannot also be a merge source');
        const sources = sourceIds.map(id => this.memoryBodies.get(id));
        const insights = [];
        const edges = [];
        for (const source of sources) {
            const offset = insights.length;
            const sourceInsights = await this.allInsights(source, signal);
            const indexById = new Map(sourceInsights.map((insight, index) => [insight.id, offset + index]));
            for (const insight of sourceInsights) {
                insights.push({
                    content: insight.content,
                    ...(insight.category === undefined ? {} : { category: insight.category }),
                    ...(insight.importance === undefined ? {} : { importance: insight.importance }),
                    ...(insight.tags === undefined ? {} : { tags: insight.tags }),
                    ...(insight.entities === undefined ? {} : { entities: insight.entities }),
                    ...(insight.source === undefined ? {} : { source: insight.source }),
                    ...(insight.createdAt === undefined ? {} : { created_at: insight.createdAt }),
                });
            }
            const graph = await this.graphForBody(source, signal);
            for (const edge of graph.edges) {
                const sourceIndex = indexById.get(edge.sourceId);
                const targetIndex = indexById.get(edge.targetId);
                if (sourceIndex === undefined || targetIndex === undefined || edge.type === undefined)
                    continue;
                edges.push({ source_index: sourceIndex, target_index: targetIndex, edge_type: edge.type, weight: 0.5, reason: edge.label });
            }
        }
        if (insights.length === 0) {
            this.activateAfterWrite(target);
            if (deactivateSources)
                for (const source of sources)
                    this.memoryBodies.setActive(source.id, false);
            return { imported: 0, updated: 0, skipped: 0, edges_inserted: 0, targetMemoryBodyId: target.id };
        }
        const temporary = mkdtempSync(join(tmpdir(), 'dsh-mnemon-merge-'));
        const draftPath = join(temporary, 'memory-draft.json');
        try {
            writeFileSync(draftPath, JSON.stringify({ schema_version: '1', source: 'dsh-mnemon-merge', insights, edges }), { encoding: 'utf8', mode: 0o600 });
            const result = await this.runner.runJson(['import', draftPath], { ...(signal === undefined ? {} : { signal }), store: target.id });
            this.activateAfterWrite(target);
            if (deactivateSources)
                for (const source of sources)
                    this.memoryBodies.setActive(source.id, false);
            return this.annotateResult(result, target);
        }
        finally {
            rmSync(temporary, { recursive: true, force: true });
        }
    }
    async bodyStatus(body, signal) {
        try {
            const raw = await this.runner.runJson(['status'], { ...(signal === undefined ? {} : { signal }), store: body.id });
            const status = record(raw);
            if (status === undefined)
                throw new Error('mnemon status returned an unexpected payload');
            return { ...body, healthy: true, stats: this.parseStats(status) };
        }
        catch (error) {
            return { ...body, healthy: false, error: error instanceof Error ? error.message : String(error) };
        }
    }
    parseStats(status) {
        const byCategoryRecord = record(status.by_category) ?? {};
        const byCategory = {};
        for (const [category, count] of Object.entries(byCategoryRecord))
            if (typeof count === 'number')
                byCategory[category] = count;
        const topEntities = Array.isArray(status.top_entities)
            ? status.top_entities.flatMap((entry) => {
                const entity = record(entry);
                const name = text(entity?.entity);
                const count = number(entity?.count);
                return name === undefined || count === undefined ? [] : [{ entity: name, count }];
            })
            : [];
        return {
            totalInsights: number(status.total_insights) ?? 0,
            deletedInsights: number(status.deleted_insights) ?? 0,
            edgeCount: number(status.edge_count) ?? 0,
            oplogCount: number(status.oplog_count) ?? 0,
            dbSizeBytes: number(status.db_size_bytes) ?? 0,
            byCategory,
            topEntities,
        };
    }
    async graphForBody(body, signal) {
        const [html, insights] = await Promise.all([
            this.runner.runText(['viz', '--format', 'html', '--output', '-'], { ...(signal === undefined ? {} : { signal }), store: body.id }),
            // Mnemon's HTML visualization omits tags and entities. A readonly recall
            // supplies that metadata without incrementing access counters.
            this.allInsights(body, signal, true),
        ]);
        const snapshot = parseMemoryGraph(html);
        const metadata = new Map(insights.map(insight => [insight.id, insight]));
        return {
            ...snapshot,
            nodes: snapshot.nodes.map(node => {
                const insight = metadata.get(node.id);
                return insight === undefined
                    ? node
                    : { ...node, ...insight, id: node.id, content: node.content, color: node.color };
            }),
        };
    }
    async allInsights(body, signal, readonly = false) {
        const payload = await this.runner.runJson([
            ...(readonly ? ['--readonly'] : []),
            'recall', '', '--basic', '--limit', '100000',
        ], { ...(signal === undefined ? {} : { signal }), store: body.id });
        const values = Array.isArray(payload) ? payload : Array.isArray(record(payload)?.results) ? record(payload).results : [];
        return values.map(normalizeInsight).filter((entry) => entry !== undefined);
    }
    readBodies(ids) {
        const active = this.memoryBodies.active();
        if (ids === undefined || ids.length === 0)
            return active;
        const requested = [...new Set(ids.map(id => id.trim()).filter(id => id !== ''))];
        return requested.map(id => {
            const body = this.memoryBodies.get(id);
            if (!body.active)
                throw new Error(`memory body is not active for reading: ${id}`);
            return body;
        });
    }
    readBody(id) {
        if (id !== undefined && id.trim() !== '') {
            const body = this.memoryBodies.get(id);
            if (!body.active)
                throw new Error(`memory body is not active for reading: ${body.id}`);
            return body;
        }
        const active = this.memoryBodies.active();
        if (active.length !== 1)
            throw new Error('memoryBodyId is required when the number of active memory bodies is not exactly one');
        return active[0];
    }
    writeBody(id) {
        if (id !== undefined && id.trim() !== '')
            return this.memoryBodies.get(id);
        const active = this.memoryBodies.active();
        if (active.length !== 1)
            throw new Error('memoryBodyId is required when the number of active memory bodies is not exactly one');
        return active[0];
    }
    annotate(insight, body) {
        return { ...insight, memoryBodyId: body.id, memoryBodyName: body.name };
    }
    annotateResult(result, body) {
        const value = record(result);
        return value === undefined ? result : { ...value, memoryBodyId: body.id, memoryBodyName: body.name };
    }
    activateAfterWrite(body) {
        if (!body.active)
            this.memoryBodies.setActive(body.id, true);
    }
    assertWritable() {
        if (!this.config.writeEnabled)
            throw new Error('dsh-mnemon is configured read-only (writeEnabled: false)');
    }
}
//# sourceMappingURL=service.js.map