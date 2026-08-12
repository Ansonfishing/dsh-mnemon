import z from 'schemastery'
import { DEFAULT_RECALL_LIMIT, DEFAULT_TIMEOUT_MS } from './config-values.ts'

export { DEFAULT_RECALL_LIMIT, DEFAULT_TIMEOUT_MS } from './config-values.ts'

/** User-facing configuration mounted from the DSH profile patch. */
export interface Config {
  /** Explicit `mnemon` executable. Omit to resolve MNEMON_CLI_PATH, PATH, then common install locations. */
  cliPath?: string
  /** Mnemon base directory. Omit to preserve MNEMON_DATA_DIR / Mnemon's ~/.mnemon default. */
  dataDir?: string
  /** Named store forced on every call. Omit to preserve MNEMON_STORE / the active-store file. */
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
}

export const Config: z<Config> = z.object({
  cliPath: z.string(),
  dataDir: z.string(),
  store: z.string(),
  timeoutMs: z.number().step(1).min(100).max(120_000).default(DEFAULT_TIMEOUT_MS),
  defaultRecallLimit: z.number().step(1).min(1).max(50).default(DEFAULT_RECALL_LIMIT),
  routingGuidance: z.boolean().default(true),
  tabEnabled: z.boolean().default(true),
  writeEnabled: z.boolean().default(true),
})

export interface ResolvedConfig {
  cliPath?: string
  dataDir?: string
  store?: string
  timeoutMs: number
  defaultRecallLimit: number
  routingGuidance: boolean
  tabEnabled: boolean
  writeEnabled: boolean
}

function optionalText(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed === undefined || trimmed === '' ? undefined : trimmed
}

export function resolveConfig(config: Config = {}): ResolvedConfig {
  const cliPath = optionalText(config.cliPath)
  const dataDir = optionalText(config.dataDir)
  const store = optionalText(config.store)
  if (store !== undefined && !/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(store)) {
    throw new Error('dsh-mnemon: store must match [a-zA-Z0-9][a-zA-Z0-9_-]*')
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
  }
}
