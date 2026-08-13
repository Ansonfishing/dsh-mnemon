import type { HostContextShape, ToolDefinition, ToolExecution } from './contracts.ts'
import type { RuntimeMemoryController, RuntimeMemoryImportance, RuntimeMemoryTarget } from './runtime-memory.ts'
import { isSubagent, MnemonSubagentCoordinator } from './subagent.ts'
import {
  CATEGORIES,
  EDGE_TYPES,
  INTENTS,
  SOURCES,
  type Category,
  type EdgeType,
  type Intent,
  type MnemonService,
  type Source,
} from './service.ts'

const text = (value: unknown): Array<{ type: 'text'; text: string }> => [{
  type: 'text',
  text: typeof value === 'string' ? value : JSON.stringify(value, null, 2),
}]

function definition(value: ToolDefinition): ToolDefinition {
  return value
}

// DSH tool outputs use its supported JSON Schema subset. `type: "json"` is
// valid in the parameter DSL, but it is not a JSON Schema type.
const JSON_OBJECT_OUTPUT = { type: 'object', additionalProperties: true } as const

/** Register a deliberately small model-facing surface over Mnemon's protocol. */
function requireAgent(exec: ToolExecution) {
  if (exec.agent === undefined) throw new Error('Mnemon semantic operations require a live DSH agent')
  return exec.agent
}

/** Root calls delegate to a bounded child; memory-worker calls reach the deterministic service. */
export function registerTools(ctx: HostContextShape, service: MnemonService, coordinator: MnemonSubagentCoordinator, runtimeMemory: RuntimeMemoryController): void {
  ctx.tools.register(definition({
    name: 'mnemon_memory_bodies',
    description: 'List the global Mnemon Memory Space catalog, including each space id, name, description, activation state, database path, and statistics. Read only. Use this before choosing a write target, or when the Prime summary is insufficient. Recall may only read active spaces; writes may target any space.',
    parameters: { type: 'object', properties: {} },
    output: { schema: JSON_OBJECT_OUTPUT, render: (_args: unknown, value: unknown) => text(value) },
    execute: (_args: unknown, exec: ToolExecution) => service.bodies(exec.signal),
    presentCall: () => ({ card: 'generic', title: 'Inspect Mnemon Memory Spaces', kind: 'search' }),
    presentResult: () => ({ card: 'generic', title: 'Mnemon Memory Spaces ready' }),
  } as never))

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
      render: (_args: unknown, value: unknown) => text(value),
    },
    async execute(args: { query: string; mode?: 'smart' | 'keyword' | 'basic'; limit?: number; category?: Category; source?: Source; intent?: Intent; memoryBodyIds?: string[] }, exec: ToolExecution) {
      return isSubagent(exec.agent)
        ? service.search(args, exec.signal)
        : coordinator.recall(requireAgent(exec), args, exec.signal)
    },
    presentCall: (args: { query: string }) => ({ card: 'generic', title: 'Recall Mnemon memory', kind: 'search', rawInput: args.query }),
    presentResult: () => ({ card: 'generic', title: 'Mnemon recall complete' }),
  } as never))

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
    output: { schema: JSON_OBJECT_OUTPUT, render: (_args: unknown, value: unknown) => text(value) },
    async execute(args: { id: string; depth?: number; edge?: EdgeType; memoryBodyId?: string }, exec: ToolExecution) {
      if (!isSubagent(exec.agent)) return coordinator.related(requireAgent(exec), args.id, args.memoryBodyId, exec.signal)
      const results = await service.related(args.id, args.depth, args.edge, exec.signal, args.memoryBodyId)
      // DSH tool output validation requires the declared object shape. Keep the
      // underlying service array internal and expose a stable traversal receipt.
      return {
        id: args.id,
        depth: args.depth ?? 2,
        ...(args.edge === undefined ? {} : { edge: args.edge }),
        ...(args.memoryBodyId === undefined ? {} : { memoryBodyId: args.memoryBodyId }),
        results,
      }
    },
    presentCall: (args: { id: string }) => ({ card: 'generic', title: 'Traverse Mnemon graph', kind: 'search', rawInput: args.id }),
    presentResult: () => ({ card: 'generic', title: 'Mnemon graph traversal complete' }),
  } as never))

  ctx.tools.register(definition({
    name: 'mnemon_status',
    description: 'Check the local Mnemon integration, active Memory Spaces, aggregate database statistics, and configuration. Use when a Mnemon operation fails or the user asks about memory health.',
    parameters: { type: 'object', properties: {} },
    output: { schema: JSON_OBJECT_OUTPUT, render: (_args: unknown, value: unknown) => text(value) },
    execute: (_args: unknown, exec: ToolExecution) => service.status(exec.signal),
    presentCall: () => ({ card: 'generic', title: 'Check Mnemon status', kind: 'other' }),
    presentResult: () => ({ card: 'generic', title: 'Mnemon status checked' }),
  } as never))

  if (!service.config.writeEnabled) return

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
    output: { schema: JSON_OBJECT_OUTPUT, render: (_args: unknown, value: unknown) => text(value) },
    execute: (args: { action: 'add' | 'replace' | 'remove'; target: RuntimeMemoryTarget; content?: string; old_text?: string; importance?: RuntimeMemoryImportance }, exec: ToolExecution) => {
      const request = {
        action: args.action,
        target: args.target,
        ...(args.content === undefined ? {} : { content: args.content }),
        ...(args.old_text === undefined ? {} : { oldText: args.old_text }),
        ...(args.importance === undefined ? {} : { importance: args.importance }),
      }
      return isSubagent(exec.agent) ? runtimeMemory.mutate(request) : coordinator.runtime(requireAgent(exec), request, exec.signal)
    },
    presentCall: (args: { action: string; target: string }) => ({ card: 'generic', title: `${args.action} runtime ${args.target} memory`, kind: 'edit' }),
    presentResult: () => ({ card: 'generic', title: 'Runtime memory updated' }),
  } as never))

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
    output: { schema: JSON_OBJECT_OUTPUT, render: (_args: unknown, value: unknown) => text(value) },
    async execute(args: { content: string; category?: Category; importance?: number; tags?: string[]; entities?: string[]; source?: Source; memoryBodyId?: string }, exec: ToolExecution) {
      const request = { ...args, source: args.source ?? 'agent' }
      return isSubagent(exec.agent)
        ? service.remember(request, exec.signal)
        : coordinator.remember(requireAgent(exec), request, exec.signal)
    },
    presentCall: () => ({ card: 'generic', title: 'Write Mnemon memory', kind: 'edit' }),
    presentResult: () => ({ card: 'generic', title: 'Mnemon memory processed' }),
  } as never))

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
    output: { schema: JSON_OBJECT_OUTPUT, render: (_args: unknown, value: unknown) => text(value) },
    async execute(args: { sourceId: string; targetId: string; type?: EdgeType; weight?: number; reason?: string; memoryBodyId?: string }, exec: ToolExecution) {
      return isSubagent(exec.agent)
        ? service.link(args.sourceId, args.targetId, args.type, args.weight, args.reason, exec.signal, args.memoryBodyId)
        : coordinator.write(requireAgent(exec), 'link', args, exec.signal)
    },
    presentCall: () => ({ card: 'generic', title: 'Link Mnemon insights', kind: 'edit' }),
    presentResult: () => ({ card: 'generic', title: 'Mnemon insights linked' }),
  } as never))

  ctx.tools.register(definition({
    name: 'mnemon_forget',
    description: 'Soft-delete one Mnemon insight by exact id. This is a destructive semantic operation; use only when the user explicitly asks to forget it or the insight is verified obsolete/incorrect.',
    parameters: {
      type: 'object',
      properties: { id: { type: 'string' }, memoryBodyId: { type: 'string', description: 'Body containing the insight id.' } },
      required: ['id'],
    },
    output: { schema: JSON_OBJECT_OUTPUT, render: (_args: unknown, value: unknown) => text(value) },
    execute: (args: { id: string; memoryBodyId?: string }, exec: ToolExecution) => isSubagent(exec.agent)
      ? service.forget(args.id, exec.signal, args.memoryBodyId)
      : coordinator.write(requireAgent(exec), 'forget', args, exec.signal),
    presentCall: (args: { id: string }) => ({ card: 'generic', title: 'Forget Mnemon insight', kind: 'edit', rawInput: args.id }),
    presentResult: () => ({ card: 'generic', title: 'Mnemon insight forgotten' }),
  } as never))

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
    output: { schema: JSON_OBJECT_OUTPUT, render: (_args: unknown, value: unknown) => text(value) },
    execute: (args: { name: string; description: string }, exec: ToolExecution) => isSubagent(exec.agent)
      ? service.createBody(args, exec.signal)
      : coordinator.write(requireAgent(exec), 'create-memory-body', args, exec.signal),
    presentCall: () => ({ card: 'generic', title: 'Create Mnemon Memory Space', kind: 'edit' }),
    presentResult: () => ({ card: 'generic', title: 'Mnemon Memory Space created' }),
  } as never))

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
    output: { schema: JSON_OBJECT_OUTPUT, render: (_args: unknown, value: unknown) => text(value) },
    execute: (args: { memoryBodyId: string; name?: string; description?: string; active?: boolean }, exec: ToolExecution) => isSubagent(exec.agent)
      ? service.updateBody(args.memoryBodyId, args)
      : coordinator.write(requireAgent(exec), 'update-memory-body', args, exec.signal),
    presentCall: () => ({ card: 'generic', title: 'Update Mnemon Memory Space', kind: 'edit' }),
    presentResult: () => ({ card: 'generic', title: 'Mnemon Memory Space updated' }),
  } as never))

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
    output: { schema: JSON_OBJECT_OUTPUT, render: (_args: unknown, value: unknown) => text(value) },
    execute: (args: { targetMemoryBodyId: string; sourceMemoryBodyIds: string[]; deactivateSources?: boolean }, exec: ToolExecution) => isSubagent(exec.agent)
      ? service.mergeBodies(args.targetMemoryBodyId, args.sourceMemoryBodyIds, args.deactivateSources ?? true, exec.signal)
      : coordinator.write(requireAgent(exec), 'merge-memory-bodies', args, exec.signal),
    presentCall: () => ({ card: 'generic', title: 'Merge Mnemon Memory Spaces', kind: 'edit' }),
    presentResult: () => ({ card: 'generic', title: 'Mnemon Memory Spaces merged' }),
  } as never))
}
