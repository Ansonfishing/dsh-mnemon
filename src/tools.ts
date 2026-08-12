import type { HostContextShape, ToolDefinition, ToolExecution } from './contracts.ts'
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
export function registerTools(ctx: HostContextShape, service: MnemonService): void {
  ctx.tools.register(definition({
    name: 'mnemon_recall',
    description: 'Recall durable knowledge from the shared Mnemon graph. Use for prior decisions, preferences, rationale, project conventions, known pitfalls, and tasks that resume earlier work. Run one focused query when memory could materially change the answer; do not recall mechanically for trivial or self-contained tasks.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Focused natural-language memory query.' },
        mode: { type: 'string', enum: ['smart', 'keyword', 'basic'], description: 'smart=graph-enhanced default, keyword=token ranking, basic=SQL LIKE fallback.' },
        limit: { type: 'integer', minimum: 1, maximum: 50 },
        category: { type: 'string', enum: [...CATEGORIES] },
        source: { type: 'string', enum: [...SOURCES] },
        intent: { type: 'string', enum: [...INTENTS] },
      },
      required: ['query'],
    },
    output: {
      schema: JSON_OBJECT_OUTPUT,
      render: (_args: unknown, value: unknown) => text(value),
    },
    async execute(args: { query: string; mode?: 'smart' | 'keyword' | 'basic'; limit?: number; category?: Category; source?: Source; intent?: Intent }, exec: ToolExecution) {
      return service.search(args, exec.signal)
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
        depth: { type: 'integer', minimum: 1, maximum: 5 },
        edge: { type: 'string', enum: [...EDGE_TYPES] },
      },
      required: ['id'],
    },
    output: { schema: JSON_OBJECT_OUTPUT, render: (_args: unknown, value: unknown) => text(value) },
    async execute(args: { id: string; depth?: number; edge?: EdgeType }, exec: ToolExecution) {
      return service.related(args.id, args.depth, args.edge, exec.signal)
    },
    presentCall: (args: { id: string }) => ({ card: 'generic', title: 'Traverse Mnemon graph', kind: 'search', rawInput: args.id }),
    presentResult: () => ({ card: 'generic', title: 'Mnemon graph traversal complete' }),
  } as never))

  ctx.tools.register(definition({
    name: 'mnemon_status',
    description: 'Check the local Mnemon integration, active named store, database statistics, and configuration. Use when a Mnemon operation fails or the user asks about memory health.',
    parameters: { type: 'object', properties: {} },
    output: { schema: JSON_OBJECT_OUTPUT, render: (_args: unknown, value: unknown) => text(value) },
    execute: (_args: unknown, exec: ToolExecution) => service.status(exec.signal),
    presentCall: () => ({ card: 'generic', title: 'Check Mnemon status', kind: 'other' }),
    presentResult: () => ({ card: 'generic', title: 'Mnemon status checked' }),
  } as never))

  if (!service.config.writeEnabled) return

  ctx.tools.register(definition({
    name: 'mnemon_remember',
    description: 'Store one durable insight in Mnemon. Use only for stable preferences, decisions with rationale, reusable procedures, non-obvious facts, or important continuity that future sessions should find. Search first to avoid duplicates; do not dump transcripts, temporary progress, routine observations, or information already present in the repository.',
    parameters: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'One concise, self-contained durable insight.' },
        category: { type: 'string', enum: [...CATEGORIES] },
        importance: { type: 'integer', minimum: 1, maximum: 5 },
        tags: { type: 'array', items: { type: 'string' }, maxItems: 20 },
        entities: { type: 'array', items: { type: 'string' }, maxItems: 50 },
        source: { type: 'string', enum: [...SOURCES], description: 'Defaults to agent for model-authored writeback.' },
      },
      required: ['content'],
    },
    output: { schema: JSON_OBJECT_OUTPUT, render: (_args: unknown, value: unknown) => text(value) },
    async execute(args: { content: string; category?: Category; importance?: number; tags?: string[]; entities?: string[]; source?: Source }, exec: ToolExecution) {
      return service.remember({ ...args, source: args.source ?? 'agent' }, exec.signal)
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
        weight: { type: 'number', minimum: 0, maximum: 1 },
        reason: { type: 'string' },
      },
      required: ['sourceId', 'targetId'],
    },
    output: { schema: JSON_OBJECT_OUTPUT, render: (_args: unknown, value: unknown) => text(value) },
    async execute(args: { sourceId: string; targetId: string; type?: EdgeType; weight?: number; reason?: string }, exec: ToolExecution) {
      return service.link(args.sourceId, args.targetId, args.type, args.weight, args.reason, exec.signal)
    },
    presentCall: () => ({ card: 'generic', title: 'Link Mnemon insights', kind: 'edit' }),
    presentResult: () => ({ card: 'generic', title: 'Mnemon insights linked' }),
  } as never))

  ctx.tools.register(definition({
    name: 'mnemon_forget',
    description: 'Soft-delete one Mnemon insight by exact id. This is a destructive semantic operation; use only when the user explicitly asks to forget it or the insight is verified obsolete/incorrect.',
    parameters: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
    output: { schema: JSON_OBJECT_OUTPUT, render: (_args: unknown, value: unknown) => text(value) },
    execute: (args: { id: string }, exec: ToolExecution) => service.forget(args.id, exec.signal),
    presentCall: (args: { id: string }) => ({ card: 'generic', title: 'Forget Mnemon insight', kind: 'edit', rawInput: args.id }),
    presentResult: () => ({ card: 'generic', title: 'Mnemon insight forgotten' }),
  } as never))
}
