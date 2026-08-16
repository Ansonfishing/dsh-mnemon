import type { ConnectionHandle as DshClientConnectionHandle } from '@deepseek-ai/dsh-client-connection/client'

export const MNEMON_READ_CHANNEL = '/dsh-mnemon-read'
export const MNEMON_WRITE_CHANNEL = '/dsh-mnemon-write'
export const MNEMON_PACK_CHANNEL = '/dsh-mnemon-pack'
export const MNEMON_SETTINGS_CHANNEL = '/dsh-mnemon-settings'
export const MNEMON_SETTINGS_NAMESPACE = 'mnemon'
export const MNEMON_UI_SETTINGS_NAMESPACE = 'mnemon-ui'

export type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }

export type RpcError =
  | { code: 'bad-request'; message: string; details: { issues: JsonValue[] } }
  | { code: 'settings-rejected'; message: string; details: { ns: string } }
  | { code: 'internal'; message: string; details: Record<string, never> }

export type RpcResult<T = JsonValue> =
  | { ok: true; value: T }
  | { ok: false; error: RpcError }

/** Public DSH browser RPC face; the plugin intentionally consumes no other connection state. */
export type ClientConnectionHandle = Pick<DshClientConnectionHandle, 'rpc'>

export interface ClientSettingsSnapshot<T> {
  status: 'loading' | 'ready' | 'unavailable'
  value?: T
  base?: unknown
  user?: unknown
  revision?: number
  writable: boolean
  mode: 'host' | 'memory'
}

export interface ClientSettingsScope<T> {
  getSnapshot(): ClientSettingsSnapshot<T>
  subscribe(listener: () => void): () => void
  set(field: string, value: unknown): Promise<void>
  unset(field: string): Promise<void>
  setPath(path: string[], value: unknown): Promise<void>
  unsetPath(path: string[]): Promise<void>
  mutate?(ops: SettingsOperation[]): Promise<void>
}

export type SettingsOperation = { op: 'set'; path: string[]; value: unknown } | { op: 'unset'; path: string[] }

export type StorageScopeKind = 'global' | 'workspace' | 'custom'

export interface CustomPackConfig {
  id: string
  name: string
  dataDir: string
}

export interface Config {
  storageScope?: StorageScopeKind
  cliPath?: string
  dataDir?: string
  customPackId?: string
  customPacks?: CustomPackConfig[]
  store?: string
  timeoutMs?: number
  defaultRecallLimit?: number
  routingGuidance?: boolean
  displayMode?: 'sidebar' | 'buildin'
  tabEnabled?: boolean
  writeEnabled?: boolean
  lifecycleEnabled?: boolean
  recallMode?: 'guided' | 'off'
  writebackMode?: 'guided' | 'off'
  idleReviewMs?: number
  conversationInteraction?: {
    toolviews?: boolean
    turnBar?: boolean
    saveAction?: boolean
  }
}

export interface InteractionConfig {
  turnBar?: boolean
  saveAction?: boolean
}

export interface MemoryBody {
  id: string
  name: string
  description: string
  active: boolean
  dbPath: string
  createdAt: string
  updatedAt: string
}

export type Category = 'preference' | 'decision' | 'fact' | 'insight' | 'context' | 'general'
export const CATEGORIES = ['preference', 'decision', 'fact', 'insight', 'context', 'general'] as const satisfies readonly Category[]
export type Source = 'user' | 'agent' | 'external'
export type EdgeType = 'temporal' | 'semantic' | 'causal' | 'entity'
export type Intent = 'WHY' | 'WHEN' | 'ENTITY' | 'GENERAL'

export interface Insight {
  id: string
  content: string
  category?: string
  importance?: number
  tags?: string[]
  entities?: string[]
  source?: string
  score?: number
  confidence?: string
  intent?: string
  matchedVia?: string
  createdAt?: string
  depth?: number
  edgeType?: string
  memoryBodyId?: string
  memoryBodyName?: string
}

export interface SearchRequest {
  query: string
  mode?: 'smart' | 'keyword' | 'basic'
  limit?: number
  category?: Category
  source?: Source
  intent?: Intent
  memoryBodyIds?: string[]
}

export interface RememberRequest {
  content: string
  category?: Category
  importance?: number
  tags?: string[]
  entities?: string[]
  source?: Source
  memoryBodyId?: string
}

export interface MemoryBodyStats {
  totalInsights: number
  deletedInsights: number
  edgeCount: number
  oplogCount: number
  dbSizeBytes: number
  byCategory: Record<string, number>
  topEntities: Array<{ entity: string; count: number }>
}

export interface MemoryBodyView extends MemoryBody {
  healthy: boolean
  error?: string
  stats?: MemoryBodyStats
}

export interface MemoryBodyCatalog {
  items: MemoryBodyView[]
  total: number
  activeCount: number
  directory: string
  generatedAt: string
}

export interface MemoryGraphNode extends Insight {
  color: string
  graphId?: string
  kind?: 'memory' | 'entity' | 'space'
  memoryBodyIds?: string[]
  memoryBodyNames?: string[]
  occurrenceCount?: number
}

export interface MemoryGraphEdge {
  sourceId: string
  targetId: string
  label: string
  color: string
  type?: EdgeType | 'scope'
}

export interface MemoryGraphSnapshot {
  nodes: MemoryGraphNode[]
  edges: MemoryGraphEdge[]
  generatedAt: string
  memoryBodies?: Array<Pick<MemoryBody, 'id' | 'name' | 'active'>>
}

export interface MemoryListRequest {
  query?: string
  category?: Category
  limit?: number
  memoryBodyIds?: string[]
}

export interface MemoryListView {
  items: MemoryGraphNode[]
  total: number
  generatedAt: string
}

export interface EntityView {
  items: Array<{ entity: string; count: number }>
  insights: Insight[]
  selected?: string
}

export type DocumentStatus = 'active' | 'archived'

export interface DocumentRecord {
  id: string
  title: string
  description: string
  status: DocumentStatus
  filename: string
  relativePath: string
  sourcePaths: string[]
  sessionIds: string[]
  createdAt: string
  updatedAt: string
  lastAccessedAt: string
  revision: number
  contentHash: string
  sizeBytes: number
  archivedAt?: string
  archiveSummary?: string
  memoryBodyIds: string[]
}

export interface DocumentView extends DocumentRecord {
  content: string
}

export interface DocumentSnapshot {
  workspaceRoot: string
  directory: string
  indexPath: string
  generatedAt: string
  revision: string
  limitBytes: number
  activeBytes: number
  activeCount: number
  archivedCount: number
  total: number
  documents: Array<DocumentRecord & { healthy: boolean; excerpt: string }>
}

export interface DocumentSearchResult {
  query: string
  includeArchived: boolean
  total: number
  generatedAt: string
  results: Array<DocumentView & { score: number; excerpt: string }>
}

export type DocumentMutation =
  | { action: 'create'; title: string; description?: string; content: string; sourcePaths?: string[]; sessionIds?: string[] }
  | { action: 'update'; id: string; title?: string; description?: string; content?: string; sourcePaths?: string[]; sessionIds?: string[] }

export interface DocumentMutationResult {
  success: true
  action: 'created' | 'updated' | 'archived'
  document: DocumentView
  snapshot: DocumentSnapshot
  maintenance?: { runId: string; provider: string; summary: string; memoryBodyIds: string[]; archivedDocumentIds: string[] }
}

export type RuntimeMemoryTarget = 'memory' | 'user'
export type RuntimeMemoryImportance = 'critical' | 'normal' | 'low'

export interface RuntimeMemoryEntry {
  content: string
  created_at: string
  updated_at: string
  target: RuntimeMemoryTarget
  importance: RuntimeMemoryImportance
}

export interface RuntimeMemoryUsage {
  used: number
  limit: number
}

export interface RuntimeMemoryTargetView extends RuntimeMemoryUsage {
  target: RuntimeMemoryTarget
  entryCount: number
  markdownPath: string
}

export interface RuntimeMemorySnapshot {
  directory: string
  sourcePath: string
  revision: string
  generatedAt: string
  entries: RuntimeMemoryEntry[]
  targets: Record<RuntimeMemoryTarget, RuntimeMemoryTargetView>
}

export type RuntimeMemoryMutationResult = {
  success: true
  message: string
  target: RuntimeMemoryTarget
  entryCount: number
  usage: RuntimeMemoryUsage
  added?: string
  replaced?: { from: string; to: string }
  removed?: string
  maintenance?: {
    kind: 'local-compaction' | 'mnemon-archive'
    runId: string
    provider: string
    summary: string
    memoryBodyIds: string[]
  }
}

export interface TurnMemoryActivity {
  turn: number
  count: number
  names: string[]
  recalls: number
  writes: number
  documentSearches: number
  inspections: number
  failures: number
}

export interface TurnMemoryActivitySnapshot {
  cursor: number
  activities: TurnMemoryActivity[]
}

export interface AssistantMessageText {
  messageId: string
  text: string
}

export type StorageAreaKind = 'runtime' | 'memory-bodies' | 'documents' | 'state'
export type StorageAreaStatus = 'ready' | 'empty' | 'missing' | 'invalid'

export interface StorageAreaInventory {
  kind: StorageAreaKind
  path: string
  status: StorageAreaStatus
  bytes: number
  itemCount: number
  details: Record<string, number | string | boolean>
  issue?: string
}

export interface StorageScopeInventory {
  kind: StorageScopeKind
  root?: string
  configured: boolean
  active: boolean
  available: boolean
  totalBytes: number
  areas: StorageAreaInventory[]
  issue?: string
}

export interface StorageScopeCatalog {
  activeKind: StorageScopeKind
  activeRoot: string
  scopes: StorageScopeInventory[]
  generatedAt: string
}

export interface ReviewActivityScore {
  totalUserTextLength: number
  turnCount: number
  toolCallCount: number
  uniqueToolCount: number
  textLengthScore: number
  turnScore: number
  toolCallScore: number
  toolDiversityScore: number
  score: number
  threshold: number
  eligible: boolean
}

export interface SubagentCounters {
  recalls: number
  writes: number
  answers: number
  reviews: number
  migrations: number
  compactions: number
  documentArchives: number
  failures: number
  lastRunId?: string
  lastOperation?: 'recall' | 'write' | 'review' | 'migration' | 'compaction' | 'document-archive'
  lastAt?: string
}

export type LifecyclePhase = 'idle' | 'prime' | 'recall' | 'writeback' | 'review' | 'supervised' | 'error'

export interface LifecycleCounters {
  primes: number
  recallCues: number
  writebackCues: number
  supervisedRequests: number
  failures: number
}

export interface LifecycleAgentSnapshot {
  sessionId: string
  status: 'idle' | 'running'
  startSource: 'startup' | 'resume' | 'clear' | 'compact' | 'adopted'
  primePending: boolean
  guidedTurns: number
  memoryToolCalls: number
  idleReviewPending: boolean
  reviewRunning: boolean
  reviewActivity: ReviewActivityScore
  lastPhase: LifecyclePhase
  lastReviewAt?: string
  lastReviewAction?: string
  lastReviewScore?: number
  lastReviewDocumentIds?: string[]
  lastAt?: string
  lastError?: string
}

export interface LifecycleSnapshot {
  enabled: boolean
  recallMode: 'guided' | 'off'
  writebackMode: 'guided' | 'off'
  idleReviewMs: number
  activeAgents: number
  sessionAvailable: boolean
  counters: LifecycleCounters
  subagents: SubagentCounters
  current?: LifecycleAgentSnapshot
}

export interface StatusView {
  healthy: boolean
  error?: string
  version?: string
  dshMnemonVersion?: string
  cliPath: string
  commandFound: boolean
  dataDir: string
  store: string
  writeEnabled: boolean
  timeoutMs: number
  defaultRecallLimit: number
  memoryBodyDirectory: string
  memoryBodies: MemoryBodyView[]
  lifecycle?: LifecycleSnapshot
  documents?: DocumentSnapshot
  storage?: StorageScopeCatalog
  workspaceContext?: {
    mode: StorageScopeKind
    selectedRoot: string
    effectiveRoot: string
    aligned: boolean
    selectedWorkspace?: { id: string; title: string; path: string }
    effectiveWorkspace?: { id: string; title: string; path: string }
  }
  stats?: MemoryBodyStats & { dbPath?: string }
}

export type MnemonPackComponent = 'runtime' | 'documents' | 'memory-spaces'
export type MnemonPackScope = 'full' | MnemonPackComponent
export type MnemonPackImportMode = 'merge' | 'replace'

export interface MnemonPackComponentSummary {
  component: MnemonPackComponent
  files: number
  bytes: number
  items: number
}

export interface MnemonPackManifest {
  format: 'mnemonpack'
  version: 1
  scope: MnemonPackScope
  exportedAt: string
  source: { plugin: 'dsh-mnemon'; pluginVersion: string }
  components: MnemonPackComponent[]
  summary: MnemonPackComponentSummary[]
}

export interface MnemonPackExport {
  fileName: string
  mimeType: 'application/zip'
  bytes: number
  base64: string
  targetRoot: string
  manifest: MnemonPackManifest
}

export interface MnemonPackPreview {
  fileName?: string
  archiveBytes: number
  expandedBytes: number
  targetRoot: string
  targetScope: StorageScopeKind
  manifest: MnemonPackManifest
  occupied: Record<MnemonPackComponent, boolean>
}

export interface MnemonPackImportResult {
  imported: true
  mode: MnemonPackImportMode
  targetRoot: string
  components: MnemonPackComponent[]
  summary: MnemonPackComponentSummary[]
}

export type VersionComponentId = 'mnemon' | 'dsh-mnemon'
export type VersionInstallMode = 'homebrew' | 'go' | 'npm' | 'link' | 'manual' | 'missing'

export interface VersionComponentStatus {
  id: VersionComponentId
  name: string
  executablePath?: string
  installPath?: string
  installProfile?: string
  current?: string
  latest?: string
  outdated: boolean
  installMode: VersionInstallMode
  updateSupported: boolean
  updateHint: string
  checkError?: string
}

export interface VersionStatus {
  checkedAt: string
  components: VersionComponentStatus[]
}

export interface VersionUpdateResult {
  component: VersionComponentId
  previousVersion?: string
  currentVersion?: string
  updated: boolean
  restartRequired: boolean
  output?: string
}
