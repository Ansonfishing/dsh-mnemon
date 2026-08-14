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
  /** @deprecated Migration-only selector from the former named-Pack settings UI. */
  customPackId?: string
  /** @deprecated Migration-only roots from the former named-Pack settings UI. */
  customPacks?: CustomPackConfig[]
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
  /** @deprecated Migration source for pre-0.2 settings; new writes use the live `mnemon-ui` namespace. */
  conversationInteraction?: {
    /** Memory-flavoured toolview cards for mnemon_* tool calls. */
    toolviews?: boolean
    /** Per-turn memory activity bar under completed turns. */
    turnBar?: boolean
    /** Save-to-memory action on finalized assistant messages. */
    saveAction?: boolean
  }
}

export interface CustomPackConfig {
  id: string
  name: string
  dataDir: string
}

/** Browser-only interaction settings, registered live under `mnemon-ui`. */
export interface InteractionConfig {
  toolviews?: boolean
  turnBar?: boolean
  saveAction?: boolean
}

export const InteractionConfig: z<InteractionConfig> = z.object({
  toolviews: z.boolean().default(false),
  turnBar: z.boolean().default(false),
  saveAction: z.boolean().default(false),
})

export const Config: z<Config> = z.object({
  // Keep this optional in the schema so legacy dataDir-only installs still
  // resolve to the custom scope instead of being silently reset to global.
  storageScope: z.union(['global', 'workspace', 'custom'] as const),
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
  recallMode: z.union(['guided', 'off'] as const).default('guided'),
  writebackMode: z.union(['guided', 'off'] as const).default('guided'),
  idleReviewMs: z.number().step(1).min(5_000).max(600_000).default(DEFAULT_IDLE_REVIEW_MS),
  // Each interaction surface is opt-in and defaults off; users enable them live.
  conversationInteraction: z.object({
    toolviews: z.boolean().default(false),
    turnBar: z.boolean().default(false),
    saveAction: z.boolean().default(false),
  }).default({ toolviews: false, turnBar: false, saveAction: false }),
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
  conversationInteraction: {
    toolviews: boolean
    turnBar: boolean
    saveAction: boolean
  }
}

export interface ResolvedInteractionConfig {
  toolviews: boolean
  turnBar: boolean
  saveAction: boolean
}

export function resolveInteractionConfig(config: InteractionConfig = {}): ResolvedInteractionConfig {
  return {
    toolviews: config.toolviews ?? false,
    turnBar: config.turnBar ?? false,
    saveAction: config.saveAction ?? false,
  }
}

function optionalText(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed === undefined || trimmed === '' ? undefined : trimmed
}

const CUSTOM_PACK_ID = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/

function validateCustomDataDir(value: string): string {
  const dataDir = optionalText(value)
  if (dataDir === undefined) throw new Error('dsh-mnemon: custom Pack dataDir is required')
  if (!isAbsolute(dataDir) && dataDir !== '~' && !dataDir.startsWith('~/')) {
    throw new Error('dsh-mnemon: custom Pack dataDir must be absolute or start with ~/')
  }
  return dataDir
}

function resolveCustomPacks(value: CustomPackConfig[] | undefined, legacyDataDir: string | undefined): CustomPackConfig[] {
  const packs: CustomPackConfig[] = []
  const ids = new Set<string>()
  for (const candidate of value ?? []) {
    const id = optionalText(candidate.id)
    const name = optionalText(candidate.name)
    if (id === undefined || !CUSTOM_PACK_ID.test(id)) throw new Error('dsh-mnemon: custom Pack id must match [a-zA-Z0-9][a-zA-Z0-9_-]*')
    if (ids.has(id)) throw new Error(`dsh-mnemon: duplicate custom Pack id: ${id}`)
    if (name === undefined || name.length > 100) throw new Error('dsh-mnemon: custom Pack name must contain 1..100 characters')
    ids.add(id)
    packs.push({ id, name, dataDir: validateCustomDataDir(candidate.dataDir) })
  }
  if (packs.length > 32) throw new Error('dsh-mnemon: at most 32 custom Packs may be configured')
  if (legacyDataDir !== undefined && !packs.some(pack => pack.dataDir === legacyDataDir)) {
    let id = 'legacy'
    let suffix = 2
    while (ids.has(id)) id = `legacy-${suffix++}`
    packs.push({ id, name: 'Custom Pack', dataDir: validateCustomDataDir(legacyDataDir) })
  }
  return packs
}

export function resolveConfig(config: Config = {}): ResolvedConfig {
  const cliPath = optionalText(config.cliPath)
  const legacyDataDir = optionalText(config.dataDir)
  const legacyPacks = resolveCustomPacks(config.customPacks, legacyDataDir)
  const requestedPackId = optionalText(config.customPackId)
  if (requestedPackId !== undefined && !CUSTOM_PACK_ID.test(requestedPackId)) throw new Error('dsh-mnemon: customPackId is invalid')
  const store = optionalText(config.store)
  const storageScope = config.storageScope ?? (legacyDataDir === undefined && legacyPacks.length === 0 ? 'global' : 'custom')
  const selectedPack = requestedPackId === undefined
    ? legacyPacks.find(pack => pack.dataDir === legacyDataDir) ?? (legacyPacks.length === 1 ? legacyPacks[0] : undefined)
    : legacyPacks.find(pack => pack.id === requestedPackId)
  if (requestedPackId !== undefined && selectedPack === undefined) throw new Error(`dsh-mnemon: unknown custom Pack: ${requestedPackId}`)
  const dataDir = selectedPack?.dataDir ?? legacyDataDir
  if (storageScope === 'custom' && dataDir === undefined) throw new Error('dsh-mnemon: a custom dataDir is required when storageScope is custom')
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
    conversationInteraction: {
      toolviews: config.conversationInteraction?.toolviews ?? false,
      turnBar: config.conversationInteraction?.turnBar ?? false,
      saveAction: config.conversationInteraction?.saveAction ?? false,
    },
  }
}
