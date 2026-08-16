import { randomUUID } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import type { MnemonRunner, MnemonTextCommand } from './runner.ts'
import type { MemoryPlacementCandidate } from './provider-placement.ts'
import type {
  CreateMemoryBodyRequest,
  MemoryBody,
  MemoryBodyProvider,
  MemoryPlacementDecision,
  MemoryProviderCapabilities,
  MemoryProviderId,
  OpenVikingBodyConnection,
  UpdateMemoryBodyRequest,
} from './shared/contracts.ts'

export type { CreateMemoryBodyRequest, MemoryBody, UpdateMemoryBodyRequest } from './shared/contracts.ts'

const NATIVE_REGISTRY_VERSION = 1
const PROVIDER_REGISTRY_VERSION = 1
const ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/

const NATIVE_CAPABILITIES: MemoryProviderCapabilities = {
  search: true,
  browse: true,
  graph: true,
  entities: true,
  related: true,
  remember: true,
  link: true,
  forget: true,
  writeMode: 'exact',
  deletionMode: 'soft',
}

const OPENVIKING_CAPABILITIES: MemoryProviderCapabilities = {
  search: true,
  browse: true,
  graph: false,
  entities: false,
  related: false,
  remember: true,
  link: false,
  forget: false,
  writeMode: 'async-extracting',
  deletionMode: 'hard',
}

interface StoredOpenVikingConnection {
  endpoint: string
  targetUri: string
  apiKey: string
  account: string
  user: string
  actorPeerId: string
}

interface StoredMemoryBody extends Omit<MemoryBody, 'dbPath' | 'provider'> {
  providerId: MemoryProviderId
  openViking?: StoredOpenVikingConnection
}

interface StoredNativeMemoryBody extends Omit<StoredMemoryBody, 'providerId' | 'openViking'> {}

interface NativeRegistryFile {
  version: 1
  bodies: StoredNativeMemoryBody[]
}

interface LegacyProviderRegistryFile {
  version: 2
  bodies: StoredMemoryBody[]
}

interface ProviderRegistryFile {
  version: 1
  bodies: StoredMemoryBody[]
}

function requiredText(value: string, label: string, max: number): string {
  const normalized = value.trim()
  if (normalized === '') throw new Error(`${label} is required`)
  if (normalized.length > max) throw new Error(`${label} is too long (max ${max} characters)`)
  return normalized
}

function optionalText(value: string | undefined, label: string, max: number): string {
  const normalized = value?.trim() ?? ''
  if (normalized.length > max) throw new Error(`${label} is too long (max ${max} characters)`)
  return normalized
}

function normalizeEndpoint(value: string): string {
  const normalized = requiredText(value, 'OpenViking endpoint', 2000).replace(/\/+$/, '')
  let url: URL
  try { url = new URL(normalized) } catch { throw new Error('OpenViking endpoint must be a valid http(s) URL') }
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('OpenViking endpoint must use http or https')
  if (url.username !== '' || url.password !== '') throw new Error('OpenViking endpoint must not contain credentials')
  return normalized
}

function normalizeTargetUri(value: string): string {
  const normalized = requiredText(value, 'OpenViking memory URI', 2000).replace(/\/+$/, '')
  if (!/^viking:\/\/user(?:\/[^/]+)?\/memories$/u.test(normalized)) {
    throw new Error('OpenViking memory URI must be a viking://user/.../memories root')
  }
  return normalized
}

function normalizeOpenViking(connection: OpenVikingBodyConnection): StoredOpenVikingConnection {
  return {
    endpoint: normalizeEndpoint(connection.endpoint),
    targetUri: normalizeTargetUri(connection.targetUri),
    apiKey: optionalText(connection.apiKey, 'OpenViking API key', 8000),
    account: optionalText(connection.account, 'OpenViking account', 200),
    user: optionalText(connection.user, 'OpenViking user', 200),
    actorPeerId: optionalText(connection.actorPeerId, 'OpenViking actor peer', 200),
  }
}

function normalizePlacementDecision(value: unknown, providerId: MemoryProviderId): MemoryPlacementDecision | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined
  const placement = value as Partial<MemoryPlacementDecision>
  if (placement.mode !== 'automatic' || placement.providerId !== providerId) return undefined
  if (placement.decidedBy !== 'rules' && placement.decidedBy !== 'llm') return undefined
  if (placement.confidence !== 'high' && placement.confidence !== 'medium' && placement.confidence !== 'low') return undefined
  if (typeof placement.reason !== 'string' || placement.reason.trim() === '' || placement.reason.length > 1000) return undefined
  if (!Array.isArray(placement.candidateProviderIds) || !placement.candidateProviderIds.every(id => id === 'mnemon-native' || id === 'openviking') || !placement.candidateProviderIds.includes(providerId)) return undefined
  if (!Array.isArray(placement.appliedRules) || !placement.appliedRules.every(rule => typeof rule === 'string' && rule.length <= 500)) return undefined
  if (typeof placement.decidedAt !== 'string' || placement.decidedAt.trim() === '') return undefined
  if (placement.runId !== undefined && typeof placement.runId !== 'string') return undefined
  if (placement.subagentProvider !== undefined && typeof placement.subagentProvider !== 'string') return undefined
  return {
    mode: 'automatic',
    providerId,
    decidedBy: placement.decidedBy,
    reason: placement.reason.trim(),
    confidence: placement.confidence,
    candidateProviderIds: [...new Set(placement.candidateProviderIds)],
    appliedRules: [...placement.appliedRules],
    decidedAt: placement.decidedAt,
    ...(placement.runId === undefined ? {} : { runId: placement.runId }),
    ...(placement.subagentProvider === undefined ? {} : { subagentProvider: placement.subagentProvider }),
  }
}

export function validateMemoryBodyId(value: string): string {
  const normalized = value.trim()
  if (!ID_PATTERN.test(normalized)) throw new Error('memoryBodyId must match [a-zA-Z0-9][a-zA-Z0-9_-]*')
  return normalized
}

/**
 * Persistent metadata layered over Mnemon's native named stores.
 *
 * Native metadata lives beside Store directories so existing Mnemon Packs stay
 * compatible. External connection metadata lives under state and is never
 * included in Memory Space Packs.
 */
export class MemoryBodyRegistry {
  readonly directory: string
  readonly registryPath: string
  readonly providerRegistryPath: string
  private bodies: StoredMemoryBody[] = []

  constructor(
    readonly runner: MnemonRunner,
    private readonly persistent = runner.commandFound,
    private readonly now: () => Date = () => new Date(),
  ) {
    this.directory = join(runner.effectiveDataDir(), 'data')
    this.registryPath = join(this.directory, '.dsh-memory-bodies.json')
    this.providerRegistryPath = join(runner.effectiveDataDir(), 'state', 'memory-providers.json')
    this.loadAndReconcile()
  }

  list(): MemoryBody[] {
    this.reconcileDiscoveredStores()
    return this.bodies.map(body => this.view(body))
  }

  active(): MemoryBody[] {
    return this.list().filter(body => body.active)
  }

  get(id: string): MemoryBody {
    const normalized = validateMemoryBodyId(id)
    const body = this.list().find(entry => entry.id === normalized)
    if (body === undefined) throw new Error(`unknown memory body: ${normalized}`)
    return body
  }

  openVikingConnection(id: string): OpenVikingBodyConnection {
    const normalized = validateMemoryBodyId(id)
    const body = this.bodies.find(entry => entry.id === normalized)
    if (body?.providerId !== 'openviking' || body.openViking === undefined) throw new Error(`memory body is not backed by OpenViking: ${normalized}`)
    return { ...body.openViking }
  }

  placementCandidates(request: Pick<CreateMemoryBodyRequest, 'openViking'>): MemoryPlacementCandidate[] {
    return [
      {
        id: 'mnemon-native',
        label: 'Mnemon Native',
        kind: 'local',
        configured: this.runner.commandFound,
        summary: 'Official local-first memory with exact writes, typed graph relations, and soft deletion.',
        capabilities: NATIVE_CAPABILITIES,
      },
      {
        id: 'openviking',
        label: 'OpenViking',
        kind: 'remote',
        configured: request.openViking !== undefined
          && request.openViking.endpoint.trim() !== ''
          && request.openViking.targetUri.trim() !== '',
        summary: 'Shared remote memory with hierarchical browsing and asynchronous semantic extraction.',
        capabilities: OPENVIKING_CAPABILITIES,
      },
    ]
  }

  async create(request: CreateMemoryBodyRequest, signal?: AbortSignal, placement?: MemoryPlacementDecision): Promise<MemoryBody> {
    const name = requiredText(request.name, 'name', 100)
    const description = requiredText(request.description, 'description', 1000)
    if (request.placement !== undefined && placement === undefined) throw new Error('automatic provider placement must be resolved before creating a Memory Space')
    if (placement !== undefined && request.providerId !== undefined && request.providerId !== placement.providerId) throw new Error('resolved provider placement conflicts with providerId')
    const providerId = placement?.providerId ?? request.providerId ?? 'mnemon-native'
    if (providerId !== 'mnemon-native' && providerId !== 'openviking') throw new Error(`unsupported memory provider: ${String(providerId)}`)
    const normalizedPlacement = placement === undefined ? undefined : normalizePlacementDecision(placement, providerId)
    if (placement !== undefined && normalizedPlacement === undefined) throw new Error('resolved provider placement is invalid')
    const reservedIds = new Set(this.list().map(body => body.id))
    const nativeStoreIds = this.nativeStoreIds()
    let id = providerId === 'mnemon-native' && nativeStoreIds.length === 0 && !reservedIds.has('default')
      ? 'default'
      : validateMemoryBodyId(providerId === 'openviking' ? `openviking-${randomUUID()}` : randomUUID())
    while (reservedIds.has(id) || nativeStoreIds.includes(id)) id = validateMemoryBodyId(randomUUID())
    const openViking = providerId === 'openviking'
      ? normalizeOpenViking(request.openViking ?? { endpoint: '', targetUri: '' })
      : undefined
    if (providerId === 'mnemon-native') await this.runner.runText(['store', 'create', id], { ...(signal === undefined ? {} : { signal }), store: id })
    const timestamp = this.now().toISOString()
    const body: StoredMemoryBody = {
      id,
      name,
      description,
      active: request.active ?? false,
      providerId,
      ...(normalizedPlacement === undefined ? {} : { placement: normalizedPlacement }),
      ...(openViking === undefined ? {} : { openViking }),
      createdAt: timestamp,
      updatedAt: timestamp,
    }
    this.bodies.push(body)
    this.save()
    return this.view(body)
  }

  update(id: string, request: UpdateMemoryBodyRequest): MemoryBody {
    const normalized = validateMemoryBodyId(id)
    const index = this.bodies.findIndex(body => body.id === normalized)
    if (index < 0) throw new Error(`unknown memory body: ${normalized}`)
    const current = this.bodies[index]!
    if (request.openViking !== undefined && current.providerId !== 'openviking') throw new Error('OpenViking connection settings only apply to OpenViking memory bodies')
    const openViking = request.openViking === undefined
      ? current.openViking
      : normalizeOpenViking({
          endpoint: request.openViking.endpoint ?? current.openViking!.endpoint,
          targetUri: request.openViking.targetUri ?? current.openViking!.targetUri,
          apiKey: request.openViking.clearApiKey === true ? '' : request.openViking.apiKey ?? current.openViking!.apiKey,
          account: request.openViking.account ?? current.openViking!.account,
          user: request.openViking.user ?? current.openViking!.user,
          actorPeerId: request.openViking.actorPeerId ?? current.openViking!.actorPeerId,
        })
    const body: StoredMemoryBody = {
      ...current,
      ...(request.name === undefined ? {} : { name: requiredText(request.name, 'name', 100) }),
      ...(request.description === undefined ? {} : { description: optionalText(request.description, 'description', 1000) }),
      ...(request.active === undefined ? {} : { active: request.active }),
      ...(openViking === undefined ? {} : { openViking }),
      updatedAt: this.now().toISOString(),
    }
    this.bodies[index] = body
    this.save()
    return this.view(body)
  }

  async remove(id: string, signal?: AbortSignal): Promise<MemoryBody> {
    const body = this.get(id)
    if (body.provider.id === 'openviking') {
      this.bodies = this.bodies.filter(entry => entry.id !== body.id)
      this.save()
      return body
    }
    const nativeStoreIds = this.nativeStoreIds()
    if (nativeStoreIds.includes(body.id) && nativeStoreIds.length === 1) {
      throw new Error(`cannot delete the last Mnemon Store "${body.id}"; disable it for DSH or create another Memory Space first`)
    }
    const persistedStore = this.runner.persistedStore()
    const commands: MnemonTextCommand[] = []
    let commandStore = persistedStore
    if (persistedStore === body.id) {
      const nativeIds = new Set(nativeStoreIds)
      const replacement = this.list()
        .filter(candidate => candidate.id !== body.id && nativeIds.has(candidate.id))
        .sort((left, right) => Number(right.active) - Number(left.active) || left.id.localeCompare(right.id))[0]?.id
        ?? nativeStoreIds.filter(candidate => candidate !== body.id).sort()[0]
      if (replacement === undefined) throw new Error(`cannot switch away from Mnemon Store "${body.id}" before deleting it`)
      commandStore = replacement
      commands.push({
        args: ['store', 'set', replacement],
        options: { ...(signal === undefined ? {} : { signal }), store: replacement },
      })
    }
    commands.push({
      args: ['store', 'remove', body.id],
      // Mnemon treats --store as the active Store even for `store remove`.
      // Keep the deletion target out of command context or every removal fails.
      options: { ...(signal === undefined ? {} : { signal }), store: commandStore },
    })
    await this.runner.runTextBatch(commands)
    this.bodies = this.bodies.filter(entry => entry.id !== body.id)
    this.save()
    return body
  }

  setActive(id: string, active: boolean): MemoryBody {
    return this.update(id, { active })
  }

  /** Refresh metadata after an atomic Pack import replaced the data component. */
  reload(): void {
    this.bodies = []
    this.loadAndReconcile()
  }

  private loadAndReconcile(): void {
    let migratedSyntheticDefault = false
    let migratedProviderRegistry = false
    if (this.persistent && existsSync(this.registryPath)) {
      try {
        const parsed = JSON.parse(readFileSync(this.registryPath, 'utf8')) as NativeRegistryFile | LegacyProviderRegistryFile
        if ((parsed.version === NATIVE_REGISTRY_VERSION || parsed.version === 2) && Array.isArray(parsed.bodies)) {
          migratedProviderRegistry = parsed.version === 2
          this.bodies = parsed.bodies.filter(body => ID_PATTERN.test(body.id)).map(body => {
            // Earlier dsh-mnemon builds gave an already-existing upstream
            // `default` Store a synthetic Chinese product name. That made a
            // compatibility import look like a newly-created default Memory
            // Space. Preserve the Store and its activation state, but restore
            // its neutral on-disk identity.
            const syntheticDefault = body.id === 'default'
              && body.name === '默认记忆体'
              && body.description === '从现有 Mnemon Store 自动接入。'
            migratedSyntheticDefault ||= syntheticDefault
            const providerId: MemoryProviderId = 'providerId' in body && body.providerId === 'openviking' ? 'openviking' : 'mnemon-native'
            const placement = 'placement' in body ? normalizePlacementDecision(body.placement, providerId) : undefined
            return {
              id: body.id,
              name: requiredText(syntheticDefault ? body.id : body.name || body.id, 'name', 100),
              description: optionalText(syntheticDefault ? 'Existing Mnemon Store discovered on disk.' : body.description, 'description', 1000),
              active: body.active === true,
              providerId,
              ...(placement === undefined ? {} : { placement }),
              ...('openViking' in body && body.openViking != null ? { openViking: normalizeOpenViking(body.openViking as OpenVikingBodyConnection) } : {}),
              createdAt: body.createdAt,
              updatedAt: body.updatedAt,
            }
          })
        }
      } catch {
        // Rebuild a valid catalog from native stores without touching their DBs.
        this.bodies = []
      }
    }
    if (this.persistent && existsSync(this.providerRegistryPath)) {
      try {
        const parsed = JSON.parse(readFileSync(this.providerRegistryPath, 'utf8')) as ProviderRegistryFile
        if (parsed.version === PROVIDER_REGISTRY_VERSION && Array.isArray(parsed.bodies)) {
          const existingIds = new Set(this.bodies.map(body => body.id))
          this.bodies.push(...parsed.bodies
            .filter(body => body.providerId === 'openviking' && ID_PATTERN.test(body.id) && !existingIds.has(body.id))
            .map(body => {
              const placement = normalizePlacementDecision(body.placement, 'openviking')
              return {
                id: body.id,
                name: requiredText(body.name || body.id, 'name', 100),
                description: optionalText(body.description, 'description', 1000),
                active: body.active === true,
                providerId: 'openviking' as const,
                ...(placement === undefined ? {} : { placement }),
                openViking: normalizeOpenViking(body.openViking ?? { endpoint: '', targetUri: '' }),
                createdAt: body.createdAt,
                updatedAt: body.updatedAt,
              }
            }))
        }
      } catch {
        // Ignore an invalid optional provider registry; native Stores remain usable.
      }
    }
    this.reconcileDiscoveredStores()
    if (migratedSyntheticDefault || migratedProviderRegistry) this.save()
  }

  private reconcileDiscoveredStores(): void {
    if (!this.persistent || !existsSync(this.directory)) return
    const timestamp = this.now().toISOString()
    const legacyActive = this.runner.effectiveStore()
    let changed = false
    for (const entry of readdirSync(this.directory, { withFileTypes: true })) {
      if (!entry.isDirectory() || !ID_PATTERN.test(entry.name) || !existsSync(join(this.directory, entry.name, 'mnemon.db'))) continue
      if (this.bodies.some(body => body.id === entry.name)) continue
      this.bodies.push({
        id: entry.name,
        name: entry.name,
        description: 'Existing Mnemon Store discovered on disk.',
        active: this.bodies.length === 0 || entry.name === legacyActive,
        providerId: 'mnemon-native',
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      changed = true
    }
    if (changed) this.save()
  }

  private nativeStoreIds(): string[] {
    if (!existsSync(this.directory)) return []
    return readdirSync(this.directory, { withFileTypes: true })
      .filter(entry => entry.isDirectory() && ID_PATTERN.test(entry.name))
      .map(entry => entry.name)
      .sort()
  }

  private view(body: StoredMemoryBody): MemoryBody {
    const provider: MemoryBodyProvider = body.providerId === 'openviking'
      ? {
          id: 'openviking',
          label: 'OpenViking',
          kind: 'remote',
          location: body.openViking!.endpoint,
          targetUri: body.openViking!.targetUri,
          ...(body.openViking!.account === '' ? {} : { account: body.openViking!.account }),
          ...(body.openViking!.user === '' ? {} : { user: body.openViking!.user }),
          ...(body.openViking!.actorPeerId === '' ? {} : { actorPeerId: body.openViking!.actorPeerId }),
          apiKeyConfigured: body.openViking!.apiKey !== '',
          capabilities: OPENVIKING_CAPABILITIES,
        }
      : {
          id: 'mnemon-native',
          label: 'Mnemon Native',
          kind: 'local',
          location: join(this.directory, body.id, 'mnemon.db'),
          apiKeyConfigured: false,
          capabilities: NATIVE_CAPABILITIES,
        }
    const { providerId: _providerId, openViking: _openViking, ...metadata } = body
    return { ...metadata, dbPath: provider.id === 'mnemon-native' ? provider.location : '', provider }
  }

  private save(): void {
    if (!this.persistent) return
    mkdirSync(this.directory, { recursive: true, mode: 0o700 })
    const nativeBodies: StoredNativeMemoryBody[] = this.bodies
      .filter(body => body.providerId === 'mnemon-native')
      .map(({ providerId: _providerId, openViking: _openViking, ...body }) => body)
    this.writeRegistry(this.registryPath, { version: NATIVE_REGISTRY_VERSION, bodies: nativeBodies })

    const providerBodies = this.bodies.filter(body => body.providerId !== 'mnemon-native')
    if (providerBodies.length === 0) {
      rmSync(this.providerRegistryPath, { force: true })
      return
    }
    mkdirSync(join(this.runner.effectiveDataDir(), 'state'), { recursive: true, mode: 0o700 })
    this.writeRegistry(this.providerRegistryPath, { version: PROVIDER_REGISTRY_VERSION, bodies: providerBodies })
  }

  private writeRegistry(path: string, file: NativeRegistryFile | ProviderRegistryFile): void {
    const temporary = join(dirname(path), `.${basename(path)}.${process.pid}.tmp`)
    writeFileSync(temporary, `${JSON.stringify(file, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
    renameSync(temporary, path)
  }
}
