import type { JsonValue, RpcResult, SettingsOperation } from './shared/contracts.ts'

export type {
  ClientConnectionHandle,
  ClientSettingsScope,
  ClientSettingsSnapshot,
  JsonPrimitive,
  JsonValue,
  RpcError,
  RpcResult,
  SettingsOperation,
} from './shared/contracts.ts'

export type HostRpcHandler = (endpoint: string, payload: unknown) => Promise<RpcResult<unknown>>

export interface HostConnectionHandle {
  rpc: {
    handle(channel: string, handler: HostRpcHandler, options: { authority: 'trusted-host' | 'loopback' }): unknown
  }
}

export interface HostSettingsScope<T> {
  get(): T
}

export interface HostSettingsService {
  readonly writable: boolean
  register<T>(
    namespace: string,
    schema: unknown,
    options: { base?: Partial<T>; applies: 'live' | 'restart'; validate?: (value: T) => void },
  ): HostSettingsScope<T>
  describe(options?: { redactSecrets?: boolean }): Array<{
    ns: string
    value: unknown
    base?: unknown
    user?: unknown
    revision: number
    applies: 'live' | 'restart'
  }>
  mutate(namespace: string, ops: SettingsOperation[], expectedRevision?: number): Promise<void>
}

export interface ToolExecution {
  signal: AbortSignal
  agent?: HostAgent
}

export type CommandResult = { kind: 'success'; text?: string } | { kind: 'error'; text: string }

export interface CommandInvocation {
  agent: HostAgent
  rawInput: string
  signal: AbortSignal
}

export interface CommandDefinition {
  name: string
  description: string
  input?: { hint: string }
  handler(invocation: CommandInvocation): CommandResult | Promise<CommandResult>
}

export interface CommandService {
  register(definition: CommandDefinition): unknown
}

export interface ToolDefinition {
  name: string
  description: string
  parameters: Record<string, unknown>
  output: {
    schema: Record<string, unknown>
    render: (args: Record<string, unknown>, value: never) => Array<{ type: 'text'; text: string }>
  }
  execute: (args: never, execution: ToolExecution) => Promise<unknown>
  presentCall?: (args: never) => Record<string, unknown>
  presentResult?: () => Record<string, unknown>
}

export interface HostMessageSource {
  kind: string
  plugin?: string
  form?: string
  summary?: string
}

export interface HostUserMessage {
  id: string
  role: 'user'
  content: Array<{ type: 'text'; text: string }>
  source: HostMessageSource
}

export interface HostSessionEvent {
  type: string
  seq?: number
  time?: number
  data: Record<string, unknown>
}

export type HostPreStepDecision = { kind: 'reject' } | { kind: 'enter'; messages: HostUserMessage[] }

export interface HostAgentContext {
  on(name: string, listener: (...args: never[]) => unknown): () => unknown
  effect(callback: () => (() => unknown) | void, label?: string): () => unknown
  get?(name: string): unknown
}

export interface HostAgent {
  id: string
  status: 'idle' | 'running'
  options?: { provider?: string; model?: string; maxTokens?: number }
  session: {
    header?: { origin?: 'subagent'; delegationDepth?: number; cwd?: string }
    events: readonly HostSessionEvent[]
  }
  ctx: HostAgentContext
  followup(message: HostUserMessage): void
  steer(message: HostUserMessage): void
  inject(message: HostUserMessage): void
}

export interface HostAgentsService {
  get(id: string): HostAgent | undefined
  roots(): HostAgent[]
}

export interface HostWorkspace {
  readonly id: string
  readonly path: string
  readonly title: string
}

export interface HostWorkspaceRegistry {
  get(id: string): HostWorkspace | undefined
  list(): HostWorkspace[]
}

export interface HostSubagentResult {
  output: Array<{ type: string; text?: string; [key: string]: unknown }>
  structured?: unknown
  stopReason: string
}

export interface HostSubagentRun {
  id: string
  localAgent?: HostAgent
  result: Promise<HostSubagentResult>
  dispose(): Promise<void>
}

export interface HostSubagentProvider {
  inheritsParentContext?: boolean
  capabilities: { outputSchema: boolean; depthLimit: boolean; toolFilter: boolean; persona: boolean }
}

export interface HostSubagentsService {
  list(): string[]
  getProvider(name: string): HostSubagentProvider | undefined
  start(name: string, request: {
    label?: string
    prompt: Array<{ type: 'text'; text: string }>
    parent: HostAgent
    signal: AbortSignal
    agentOptions?: { provider?: string; model?: string; maxTokens?: number }
    outputSchema?: Record<string, unknown>
    maxDepth?: number
    toolFilter?: { allow?: string[]; deny?: string[] }
    persona?: string
  }): Promise<HostSubagentRun>
}

export interface HostContextShape {
  tools: { register(definition: ToolDefinition): unknown }
  commands: CommandService
  settings: HostSettingsService
  connection: HostConnectionHandle
  agents: HostAgentsService
  subagents: HostSubagentsService
  workspaceRegistry: HostWorkspaceRegistry
  get(name: string): unknown
  inject(services: string[], callback: (ctx: HostContextShape) => void): unknown
  on(name: string, listener: (...args: never[]) => unknown): () => unknown
  effect(callback: () => (() => unknown) | void, label?: string): () => unknown
}
