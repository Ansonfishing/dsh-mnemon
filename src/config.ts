import z from 'schemastery'
import { isAbsolute } from 'node:path'
import { DEFAULT_IDLE_REVIEW_MS, DEFAULT_RECALL_LIMIT, DEFAULT_TIMEOUT_MS } from './config-values.ts'

export { DEFAULT_IDLE_REVIEW_MS, DEFAULT_RECALL_LIMIT, DEFAULT_TIMEOUT_MS } from './config-values.ts'

/** User-facing configuration mounted from the DSH profile patch. */
export interface Config {
  /** Storage domain selected in DSH plugin settings. Changes apply after restart. */
  storageScope?: 'global' | 'workspace' | 'custom'
  /** Explicit `mnemon` executable. Omit to resolve MNEMON_CLI_PATH, PATH, then common install locations. */
  cliPath?: string
  /** Custom Mnemon base directory; also retained as a legacy dataDir-only scope selection. */
  dataDir?: string
  /** Legacy store hint used to bootstrap or discover the initial Memory Space. */
  store?: string
  /** Hard deadline for one CLI process. */
  timeoutMs?: number
  /** Default number of recall results exposed to the agent and the tab. */
  defaultRecallLimit?: number
  /** Add conservative recall/writeback guidance to the DSH system prompt. */
  routingGuidance?: boolean
  /** Register the Web conversation-view memory tab. */
  tabEnabled?: boolean
  /** Allow remember/link/forget mutations. Recall and status remain available when false. */
  writeEnabled?: boolean
  /** Enable DSH agent lifecycle integration (Prime plus recall/remember cues). */
  lifecycleEnabled?: boolean
  /** Recall behavior at the first step of each DSH turn. */
  recallMode?: 'guided' | 'off'
  /** Enable the short remember cue and the scored, debounced full-checkpoint review. */
  writebackMode?: 'guided' | 'off'
  /** Continuous root-agent idle time after the QoderWork activity gate is met. */
  idleReviewMs?: number
}

export const Config: z<Config> = z.object({
  // Keep this optional in the schema so legacy dataDir-only installs still
  // resolve to the custom scope instead of being silently reset to global.
  storageScope: z.union(['global', 'workspace', 'custom'] as const),
  cliPath: z.string(),
  dataDir: z.string(),
  store: z.string(),
  timeoutMs: z.number().step(1).min(100).max(120_000).default(DEFAULT_TIMEOUT_MS),
  defaultRecallLimit: z.number().step(1).min(1).max(50).default(DEFAULT_RECALL_LIMIT),
  routingGuidance: z.boolean().default(true),
  tabEnabled: z.boolean().default(true),
  writeEnabled: z.boolean().default(true),
  lifecycleEnabled: z.boolean().default(true),
  recallMode: z.union(['guided', 'off'] as const).default('guided'),
  writebackMode: z.union(['guided', 'off'] as const).default('guided'),
  idleReviewMs: z.number().step(1).min(5_000).max(600_000).default(DEFAULT_IDLE_REVIEW_MS),
})

export interface ResolvedConfig {
  storageScope: 'global' | 'workspace' | 'custom'
  cliPath?: string
  dataDir?: string
  store?: string
  timeoutMs: number
  defaultRecallLimit: number
  routingGuidance: boolean
  tabEnabled: boolean
  writeEnabled: boolean
  lifecycleEnabled: boolean
  recallMode: 'guided' | 'off'
  writebackMode: 'guided' | 'off'
  idleReviewMs: number
}

function optionalText(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed === undefined || trimmed === '' ? undefined : trimmed
}

export function resolveConfig(config: Config = {}): ResolvedConfig {
  const cliPath = optionalText(config.cliPath)
  const dataDir = optionalText(config.dataDir)
  const store = optionalText(config.store)
  const storageScope = config.storageScope ?? (dataDir === undefined ? 'global' : 'custom')
  if (storageScope === 'custom' && dataDir === undefined) throw new Error('dsh-mnemon: dataDir is required when storageScope is custom')
  if (storageScope === 'custom' && dataDir !== undefined && !isAbsolute(dataDir) && dataDir !== '~' && !dataDir.startsWith('~/')) {
    throw new Error('dsh-mnemon: custom dataDir must be absolute or start with ~/')
  }
  if (store !== undefined && !/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(store)) {
    throw new Error('dsh-mnemon: store must match [a-zA-Z0-9][a-zA-Z0-9_-]*')
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
  }
}
