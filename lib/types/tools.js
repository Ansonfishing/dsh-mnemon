import { isSubagent, MnemonSubagentCoordinator } from "./subagent.js";
import { CATEGORIES, EDGE_TYPES, INTENTS, SOURCES, } from "./service.js";
const text = (value) => [{
        type: 'text',
        text: typeof value === 'string' ? value : JSON.stringify(value, null, 2),
    }];
function definition(value) {
    return value;
}
// DSH tool outputs use its supported JSON Schema subset. `type: "json"` is
// valid in the parameter DSL, but it is not a JSON Schema type.
const JSON_OBJECT_OUTPUT = { type: 'object', additionalProperties: true };
/** Register a deliberately small model-facing surface over Mnemon's protocol. */
function requireAgent(exec) {
    if (exec.agent === undefined)
        throw new Error('Mnemon semantic operations require a live DSH agent');
    return exec.agent;
}
function isAgentRuntimeSource(value) {
    return 'forAgent' in value && typeof value.forAgent === 'function';
}
/** Root calls delegate to a bounded child; memory-worker calls reach the deterministic service. */
export function registerTools(ctx, serviceOrSource, coordinator, runtimeMemory, documents) {
    const runtimeFor = (exec) => {
        if (isAgentRuntimeSource(serviceOrSource))
            return serviceOrSource.forAgent(requireAgent(exec));
        if (runtimeMemory === undefined || documents === undefined)
            throw new Error('Mnemon runtime control plane is unavailable');
        return { service: serviceOrSource, runtimeMemory, documents };
    };
    const config = serviceOrSource.config;
    ctx.tools.register(definition({
        name: 'mnemon_memory_bodies',
        description: 'List the global Mnemon Memory Space catalog, including each space id, name, description, activation state, database path, and statistics. Read only. Use this before choosing a write target, or when the Prime summary is insufficient. Recall may only read active spaces; writes may target any space.',
        parameters: { type: 'object', properties: {} },
        output: { schema: JSON_OBJECT_OUTPUT, render: (_args, value) => text(value) },
        execute: (_args, exec) => runtimeFor(exec).service.bodies(exec.signal),
        presentCall: () => ({ card: 'generic', title: 'Inspect Mnemon Memory Spaces', kind: 'search' }),
        presentResult: () => ({ card: 'generic', title: 'Mnemon Memory Spaces ready' }),
    }));
    ctx.tools.register(definition({
        name: 'mnemon_recall',
        description: 'Recall durable knowledge from one or more active Mnemon Memory Spaces. Choose spaces whose name/description matches the task; omit memoryBodyIds only when a cross-space search is intentionally useful. Use one focused query when prior decisions, preferences, rationale, conventions, pitfalls, or earlier work could materially change the answer.',
        parameters: {
            type: 'object',
            properties: {
                query: { type: 'string', description: 'Focused natural-language memory query.' },
                mode: { type: 'string', enum: ['smart', 'keyword', 'basic'], description: 'smart=graph-enhanced default, keyword=token ranking, basic=SQL LIKE fallback.' },
                limit: { type: 'integer', description: 'Maximum number of results. The service accepts 1 through 50.' },
                category: { type: 'string', enum: [...CATEGORIES] },
                source: { type: 'string', enum: [...SOURCES] },
                intent: { type: 'string', enum: [...INTENTS] },
                memoryBodyIds: { type: 'array', items: { type: 'string' }, description: 'One or more active Memory Space ids. Omit to search every active space; the service accepts at most 20 ids.' },
            },
            required: ['query'],
        },
        output: {
            schema: JSON_OBJECT_OUTPUT,
            render: (_args, value) => text(value),
        },
        async execute(args, exec) {
            return isSubagent(exec.agent)
                ? runtimeFor(exec).service.search(args, exec.signal)
                : coordinator.recall(requireAgent(exec), args, exec.signal);
        },
        presentCall: (args) => ({ card: 'generic', title: 'Recall Mnemon memory', kind: 'search', rawInput: args.query }),
        presentResult: () => ({ card: 'generic', title: 'Mnemon recall complete' }),
    }));
    ctx.tools.register(definition({
        name: 'mnemon_related',
        description: 'Traverse the Mnemon graph from a known insight id. Use after mnemon_recall when causal, semantic, temporal, or entity neighbors help explain or verify a remembered fact.',
        parameters: {
            type: 'object',
            properties: {
                id: { type: 'string', description: 'Insight id returned by mnemon_recall.' },
                depth: { type: 'integer', description: 'Traversal depth. The service accepts 1 through 5.' },
                edge: { type: 'string', enum: [...EDGE_TYPES] },
                memoryBodyId: { type: 'string', description: 'Active Memory Space that returned this insight id.' },
            },
            required: ['id'],
        },
        output: { schema: JSON_OBJECT_OUTPUT, render: (_args, value) => text(value) },
        async execute(args, exec) {
            if (!isSubagent(exec.agent))
                return coordinator.related(requireAgent(exec), args.id, args.memoryBodyId, exec.signal);
            const results = await runtimeFor(exec).service.related(args.id, args.depth, args.edge, exec.signal, args.memoryBodyId);
            // DSH tool output validation requires the declared object shape. Keep the
            // underlying service array internal and expose a stable traversal receipt.
            return {
                id: args.id,
                depth: args.depth ?? 2,
                ...(args.edge === undefined ? {} : { edge: args.edge }),
                ...(args.memoryBodyId === undefined ? {} : { memoryBodyId: args.memoryBodyId }),
                results,
            };
        },
        presentCall: (args) => ({ card: 'generic', title: 'Traverse Mnemon graph', kind: 'search', rawInput: args.id }),
        presentResult: () => ({ card: 'generic', title: 'Mnemon graph traversal complete' }),
    }));
    ctx.tools.register(definition({
        name: 'mnemon_status',
        description: 'Check the local Mnemon integration, active Memory Spaces, aggregate database statistics, and configuration. Use when a Mnemon operation fails or the user asks about memory health.',
        parameters: { type: 'object', properties: {} },
        output: { schema: JSON_OBJECT_OUTPUT, render: (_args, value) => text(value) },
        execute: (_args, exec) => runtimeFor(exec).service.status(exec.signal),
        presentCall: () => ({ card: 'generic', title: 'Check Mnemon status', kind: 'other' }),
        presentResult: () => ({ card: 'generic', title: 'Mnemon status checked' }),
    }));
    ctx.tools.register(definition({
        name: 'mnemon_document_search',
        description: 'Search project-scoped managed Documents before falling back to deep Mnemon recall. Active Documents contain substantial design, research, procedure, and handoff knowledge. Search is deterministic and read only. Cold archives are excluded unless includeArchived is explicitly required by a known archive reference.',
        parameters: {
            type: 'object',
            properties: {
                query: { type: 'string', description: 'Focused natural-language or keyword query. Empty lists recent documents.' },
                includeArchived: { type: 'boolean', description: 'Include cold archived originals only for explicit deep-reference inspection.' },
                limit: { type: 'integer', description: 'Maximum results, 1 through 8 for model calls.' },
            },
            required: ['query'],
        },
        output: { schema: JSON_OBJECT_OUTPUT, render: (_args, value) => text(value) },
        async execute(args, exec) {
            const controller = runtimeFor(exec).documents.forAgent(requireAgent(exec));
            const result = await controller.search(args.query, { ...(args.includeArchived === undefined ? {} : { includeArchived: args.includeArchived }), limit: Math.min(8, args.limit ?? 8) });
            const suggestions = result.results.length === 0 && args.query.trim() !== ''
                ? controller.snapshot().documents
                    .filter(document => args.includeArchived === true || document.status === 'active')
                    .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt))
                    .slice(0, Math.min(5, args.limit ?? 5))
                    .map(document => ({
                    id: document.id,
                    title: document.title,
                    description: document.description,
                    status: document.status,
                    excerpt: document.excerpt,
                }))
                : [];
            return {
                ...result,
                results: result.results.map(document => ({
                    ...document,
                    content: document.content.length <= 8_000 ? document.content : `${document.content.slice(0, 8_000)}\n[truncated]`,
                })),
                ...(suggestions.length === 0 ? {} : {
                    suggestions,
                    suggestionHint: 'No exact same-language match. Retry with distinctive words from a suggested title or description before deep recall.',
                }),
            };
        },
        presentCall: (args) => ({ card: 'generic', title: 'Search Mnemon Documents', kind: 'search', rawInput: args.query }),
        presentResult: () => ({ card: 'generic', title: 'Mnemon Documents ready' }),
    }));
    ctx.tools.register(definition({
        name: 'mnemon_document_manage',
        description: 'Create or update one managed project Document through the Mnemon Documents control plane. Use for substantial reusable project knowledge, not user-profile preferences, routine progress, raw transcripts, secrets, or small hot-memory facts. Source paths are references inside the workspace and are never edited. Archive is allowed only from a root request and first writes a durable Mnemon cold-reference through an isolated subagent.',
        parameters: {
            type: 'object',
            properties: {
                action: { type: 'string', enum: ['create', 'update', 'archive'] },
                id: { type: 'string', description: 'Required for update and archive.' },
                title: { type: 'string', description: 'Meaningful project-document title. Required for create.' },
                description: { type: 'string', description: 'Concise routing description.' },
                content: { type: 'string', description: 'Managed Markdown body. Required for create.' },
                sourcePaths: { type: 'array', items: { type: 'string' }, description: 'Read-only source paths relative to the workspace.' },
            },
            required: ['action'],
        },
        output: { schema: JSON_OBJECT_OUTPUT, render: (_args, value) => text(value) },
        execute: (args, exec) => {
            if (!config.writeEnabled)
                throw new Error('dsh-mnemon is configured read-only (writeEnabled: false)');
            const agent = requireAgent(exec);
            if (args.action === 'archive') {
                if (isSubagent(agent))
                    throw new Error('idle document workers cannot cold-archive directly');
                if (args.id === undefined)
                    throw new Error('document id is required for archive');
                return coordinator.archiveDocument(agent, args.id, exec.signal);
            }
            const request = args.action === 'create'
                ? { action: 'create', title: args.title ?? '', content: args.content ?? '', ...(args.description === undefined ? {} : { description: args.description }), ...(args.sourcePaths === undefined ? {} : { sourcePaths: args.sourcePaths }), sessionIds: [agent.id] }
                : { action: 'update', id: args.id ?? '', ...(args.title === undefined ? {} : { title: args.title }), ...(args.description === undefined ? {} : { description: args.description }), ...(args.content === undefined ? {} : { content: args.content }), ...(args.sourcePaths === undefined ? {} : { sourcePaths: args.sourcePaths }), sessionIds: [agent.id] };
            return isSubagent(agent) ? runtimeFor(exec).documents.forAgent(agent).mutate(request) : coordinator.document(agent, request, exec.signal);
        },
        presentCall: (args) => ({ card: 'generic', title: `${args.action} Mnemon Document`, kind: 'edit', ...(args.title === undefined ? {} : { rawInput: args.title }) }),
        presentResult: () => ({ card: 'generic', title: 'Mnemon Document processed' }),
    }));
    ctx.tools.register(definition({
        name: 'mnemon_runtime_memory',
        description: 'Maintain compact hot memory injected into future turns. Use proactively for durable user corrections, preferences, personal details, stable environment facts, project conventions, tool quirks, and reusable lessons. add creates one independent fact; replace corrects or consolidates one uniquely matched entry; remove is only for an explicitly withdrawn, obsolete, or wrong entry. target=user is only for who the user is; target=memory is for project/environment/decisions/lessons. Skip questions, guesses, assistant-authored claims, temporary progress, completed-work logs, raw dumps, secrets, rediscoverable facts, and skill-covered guidance. This tool is the exclusive writer for runtime MEMORY.md and USER.md; capacity archival and compaction are automatic.',
        parameters: {
            type: 'object',
            properties: {
                action: { type: 'string', enum: ['add', 'replace', 'remove'], description: 'add a new entry, replace one uniquely matched entry, or remove one uniquely matched entry.' },
                target: { type: 'string', enum: ['memory', 'user'], description: 'user for user identity/preferences; memory for project, environment, decisions, and lessons.' },
                content: { type: 'string', description: 'Compact entry content. Required for add and replace.' },
                old_text: { type: 'string', description: 'Unique substring of the existing entry. Required for replace and remove.' },
                importance: { type: 'string', enum: ['critical', 'normal', 'low'], description: 'critical for explicit must/always/never rules; low for transient facts; normal by default.' },
            },
            required: ['action', 'target'],
        },
        output: { schema: JSON_OBJECT_OUTPUT, render: (_args, value) => text(value) },
        execute: (args, exec) => {
            if (!config.writeEnabled)
                throw new Error('dsh-mnemon is configured read-only (writeEnabled: false)');
            const request = {
                action: args.action,
                target: args.target,
                ...(args.content === undefined ? {} : { content: args.content }),
                ...(args.old_text === undefined ? {} : { oldText: args.old_text }),
                ...(args.importance === undefined ? {} : { importance: args.importance }),
            };
            return isSubagent(exec.agent) ? runtimeFor(exec).runtimeMemory.mutate(request) : coordinator.runtime(requireAgent(exec), request, exec.signal);
        },
        presentCall: (args) => ({ card: 'generic', title: `${args.action} runtime ${args.target} memory`, kind: 'edit' }),
        presentResult: () => ({ card: 'generic', title: 'Runtime memory updated' }),
    }));
    ctx.tools.register(definition({
        name: 'mnemon_remember',
        description: 'Archive one durable insight in a selected Mnemon Memory Space. Ordinary new hot memory belongs in mnemon_runtime_memory; use direct archival only for explicit long-term persistence or runtime capacity migration. Choose the narrowest existing space, search it first, and do not dump transcripts, temporary progress, routine observations, or repository-obvious facts.',
        parameters: {
            type: 'object',
            properties: {
                content: { type: 'string', description: 'One concise, self-contained durable insight.' },
                category: { type: 'string', enum: [...CATEGORIES] },
                importance: { type: 'integer', description: 'Durable value from 1 through 5.' },
                tags: { type: 'array', items: { type: 'string' }, description: 'At most 20 concise tags.' },
                entities: { type: 'array', items: { type: 'string' }, description: 'At most 50 named entities.' },
                source: { type: 'string', enum: [...SOURCES], description: 'Defaults to agent for model-authored writeback.' },
                memoryBodyId: { type: 'string', description: 'Target Memory Space id. Required unless exactly one space is active.' },
            },
            required: ['content'],
        },
        output: { schema: JSON_OBJECT_OUTPUT, render: (_args, value) => text(value) },
        async execute(args, exec) {
            const request = { ...args, source: args.source ?? 'agent' };
            return isSubagent(exec.agent)
                ? runtimeFor(exec).service.remember(request, exec.signal)
                : coordinator.remember(requireAgent(exec), request, exec.signal);
        },
        presentCall: () => ({ card: 'generic', title: 'Write Mnemon memory', kind: 'edit' }),
        presentResult: () => ({ card: 'generic', title: 'Mnemon memory processed' }),
    }));
    ctx.tools.register(definition({
        name: 'mnemon_link',
        description: 'Create a typed, bidirectional relation between two known Mnemon insights. Link only when the relation improves future recall and both ids were verified through recall or graph traversal.',
        parameters: {
            type: 'object',
            properties: {
                sourceId: { type: 'string' },
                targetId: { type: 'string' },
                type: { type: 'string', enum: [...EDGE_TYPES] },
                weight: { type: 'number', description: 'Relationship confidence from 0 through 1.' },
                reason: { type: 'string' },
                memoryBodyId: { type: 'string', description: 'Body containing both insight ids.' },
            },
            required: ['sourceId', 'targetId'],
        },
        output: { schema: JSON_OBJECT_OUTPUT, render: (_args, value) => text(value) },
        async execute(args, exec) {
            return isSubagent(exec.agent)
                ? runtimeFor(exec).service.link(args.sourceId, args.targetId, args.type, args.weight, args.reason, exec.signal, args.memoryBodyId)
                : coordinator.write(requireAgent(exec), 'link', args, exec.signal);
        },
        presentCall: () => ({ card: 'generic', title: 'Link Mnemon insights', kind: 'edit' }),
        presentResult: () => ({ card: 'generic', title: 'Mnemon insights linked' }),
    }));
    ctx.tools.register(definition({
        name: 'mnemon_forget',
        description: 'Soft-delete one Mnemon insight by exact id. This is a destructive semantic operation; use only when the user explicitly asks to forget it or the insight is verified obsolete/incorrect.',
        parameters: {
            type: 'object',
            properties: { id: { type: 'string' }, memoryBodyId: { type: 'string', description: 'Body containing the insight id.' } },
            required: ['id'],
        },
        output: { schema: JSON_OBJECT_OUTPUT, render: (_args, value) => text(value) },
        execute: (args, exec) => isSubagent(exec.agent)
            ? runtimeFor(exec).service.forget(args.id, exec.signal, args.memoryBodyId)
            : coordinator.write(requireAgent(exec), 'forget', args, exec.signal),
        presentCall: (args) => ({ card: 'generic', title: 'Forget Mnemon insight', kind: 'edit', rawInput: args.id }),
        presentResult: () => ({ card: 'generic', title: 'Mnemon insight forgotten' }),
    }));
    ctx.tools.register(definition({
        name: 'mnemon_memory_body_create',
        description: 'Create a new isolated Mnemon Memory Space. Use only when durable knowledge forms a recurring scope not owned by any existing space; never create one for a single temporary task. Supply a topic-specific human name and a precise routing description that states what belongs here and when it should be recalled; avoid generic labels such as miscellaneous, archive, or new memory. The host generates the immutable UUID. After creation, write the qualifying insight into it with mnemon_remember, which will activate it.',
        parameters: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Topic-specific human-readable name that remains meaningful in the directory.' },
                description: { type: 'string', description: 'Precise routing boundary: what durable knowledge belongs here and when it should be recalled.' },
            },
            required: ['name', 'description'],
        },
        output: { schema: JSON_OBJECT_OUTPUT, render: (_args, value) => text(value) },
        execute: (args, exec) => isSubagent(exec.agent)
            ? runtimeFor(exec).service.createBody(args, exec.signal)
            : coordinator.write(requireAgent(exec), 'create-memory-body', args, exec.signal),
        presentCall: () => ({ card: 'generic', title: 'Create Mnemon Memory Space', kind: 'edit' }),
        presentResult: () => ({ card: 'generic', title: 'Mnemon Memory Space created' }),
    }));
    ctx.tools.register(definition({
        name: 'mnemon_memory_body_update',
        description: 'Update a Memory Space name, routing description, or activation state. Activation controls reads only. Use conservatively; prefer the user-facing toggle for ordinary manual activation changes.',
        parameters: {
            type: 'object',
            properties: {
                memoryBodyId: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' },
                active: { type: 'boolean' },
            },
            required: ['memoryBodyId'],
        },
        output: { schema: JSON_OBJECT_OUTPUT, render: (_args, value) => text(value) },
        execute: (args, exec) => isSubagent(exec.agent)
            ? runtimeFor(exec).service.updateBody(args.memoryBodyId, args)
            : coordinator.write(requireAgent(exec), 'update-memory-body', args, exec.signal),
        presentCall: () => ({ card: 'generic', title: 'Update Mnemon Memory Space', kind: 'edit' }),
        presentResult: () => ({ card: 'generic', title: 'Mnemon Memory Space updated' }),
    }));
    ctx.tools.register(definition({
        name: 'mnemon_memory_body_merge',
        description: 'Non-destructively merge complete source Memory Spaces into one existing target through Mnemon import, preserving durable nodes and typed graph edges where available. Use only after confirming substantial scope overlap or when the user requests consolidation. Source databases are retained; they are merely deactivated by default.',
        parameters: {
            type: 'object',
            properties: {
                targetMemoryBodyId: { type: 'string' },
                sourceMemoryBodyIds: { type: 'array', items: { type: 'string' }, description: 'One through 20 source Memory Space ids.' },
                deactivateSources: { type: 'boolean', description: 'Defaults to true. Never deletes source databases.' },
            },
            required: ['targetMemoryBodyId', 'sourceMemoryBodyIds'],
        },
        output: { schema: JSON_OBJECT_OUTPUT, render: (_args, value) => text(value) },
        execute: (args, exec) => isSubagent(exec.agent)
            ? runtimeFor(exec).service.mergeBodies(args.targetMemoryBodyId, args.sourceMemoryBodyIds, args.deactivateSources ?? true, exec.signal)
            : coordinator.write(requireAgent(exec), 'merge-memory-bodies', args, exec.signal),
        presentCall: () => ({ card: 'generic', title: 'Merge Mnemon Memory Spaces', kind: 'edit' }),
        presentResult: () => ({ card: 'generic', title: 'Mnemon Memory Spaces merged' }),
    }));
}
//# sourceMappingURL=tools.js.map