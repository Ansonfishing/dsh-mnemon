import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolveConfig } from '../src/config.ts'
import { MemoryBodyRegistry } from '../src/memory-bodies.ts'
import type { ProcessRunner } from '../src/process.ts'
import { Mem0Provider } from '../src/providers/mem0.ts'
import { RetainDbProvider } from '../src/providers/retaindb.ts'
import { SupermemoryProvider } from '../src/providers/supermemory.ts'
import { createRunner } from '../src/runner.ts'
import type { MemoryProviderConnection, MemoryProviderId } from '../src/shared/contracts.ts'

const temporaryDirectories: string[] = []

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) rmSync(directory, { recursive: true, force: true })
})

async function providerBody(providerId: MemoryProviderId, connection: MemoryProviderConnection) {
  const dataDir = mkdtempSync(join(tmpdir(), `dsh-mnemon-${providerId}-`))
  temporaryDirectories.push(dataDir)
  const runner = createRunner(resolveConfig({ cliPath: '/fake/mnemon', dataDir }), vi.fn<ProcessRunner>())
  const registry = new MemoryBodyRegistry(runner, true)
  const body = await registry.create({
    name: `${providerId} memory`,
    description: `External memory backed by ${providerId}.`,
    active: true,
    providerId,
    connection,
  })
  return { registry, body }
}

function response(payload: unknown, status = 200): Response {
  return new Response(payload === undefined ? null : JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } })
}

describe('Hermes-inspired remote memory providers', () => {
  it('uses Mem0 Platform v3 scoping and keeps the token out of result projections', async () => {
    const requests: Array<{ url: string; init?: RequestInit }> = []
    const fetchMock = vi.fn<typeof fetch>(async (url, init) => {
      requests.push({ url: String(url), ...(init === undefined ? {} : { init }) })
      const path = new URL(String(url)).pathname
      if (path === '/v3/memories/search/') return response({ results: [{ id: 'mem-1', memory: 'Alice prefers concise replies.', score: 0.91, categories: ['preference'] }] })
      if (path === '/v3/memories/add/') return response({ status: 'PENDING', event_id: 'event-1' })
      if (path === '/v1/memories/mem-1') return response({ message: 'deleted' })
      throw new Error(`unexpected path ${path}`)
    })
    const { registry, body } = await providerBody('mem0', {
      endpoint: 'https://api.mem0.ai', apiKey: 'mem0-secret', mode: 'platform', userId: 'alice', agentId: 'dsh', rerank: true,
    })
    const provider = new Mem0Provider(registry, { fetch: fetchMock })

    await expect(provider.search(body, { query: 'reply style', limit: 5 })).resolves.toEqual({
      results: [expect.objectContaining({ id: 'mem-1', content: 'Alice prefers concise replies.', category: 'preference', score: 0.91 })],
    })
    await expect(provider.remember(body, { content: 'Alice likes TypeScript.', category: 'preference' })).resolves.toMatchObject({ eventId: 'event-1', status: 'PENDING' })
    await expect(provider.forget(body, 'mem-1')).resolves.toMatchObject({ action: 'deleted', id: 'mem-1' })

    expect(new Headers(requests[0]?.init?.headers).get('Authorization')).toBe('Token mem0-secret')
    expect(JSON.parse(String(requests[0]?.init?.body))).toMatchObject({ filters: { user_id: 'alice', agent_id: 'dsh' }, rerank: true })
    expect(JSON.stringify((await provider.search(body, { query: 'reply style' })).results)).not.toContain('mem0-secret')
  })

  it('preserves RetainDB project/user/session scope and current-to-legacy fallbacks', async () => {
    const requests: Array<{ url: string; init?: RequestInit }> = []
    const fetchMock = vi.fn<typeof fetch>(async (url, init) => {
      requests.push({ url: String(url), ...(init === undefined ? {} : { init }) })
      const path = new URL(String(url)).pathname
      if (path === '/v1/memory/search') return response({ memories: [{ id: 'ret-1', content: 'Use staged rollout.', score: 0.8, memory_type: 'decision' }] })
      if (path === '/v1/memory') return response({ message: 'missing' }, 404)
      if (path === '/v1/memories' && init?.method === 'POST') return response({ id: 'ret-2' })
      if (path === '/v1/memory/ret-1') return response({ message: 'missing' }, 404)
      if (path === '/v1/memories/ret-1') return response({ deleted: true })
      throw new Error(`unexpected ${init?.method ?? 'GET'} ${path}`)
    })
    const { registry, body } = await providerBody('retaindb', {
      endpoint: 'https://api.retaindb.com', apiKey: 'retain-secret', project: 'launch', userId: 'alice',
    })
    const provider = new RetainDbProvider(registry, { fetch: fetchMock })

    await expect(provider.search(body, { query: 'rollout', limit: 4 })).resolves.toEqual({
      results: [expect.objectContaining({ id: 'ret-1', category: 'decision', score: 0.8 })],
    })
    await expect(provider.remember(body, { content: 'Canary before production.', category: 'decision' })).resolves.toMatchObject({ id: 'ret-2' })
    await expect(provider.forget(body, 'ret-1')).resolves.toMatchObject({ action: 'deleted' })

    expect(JSON.parse(String(requests[0]?.init?.body))).toMatchObject({ project: 'launch', user_id: 'alice', top_k: 4 })
    expect(new Headers(requests[0]?.init?.headers).get('Authorization')).toBe('Bearer retain-secret')
    expect(new Headers(requests[0]?.init?.headers).get('X-API-Key')).toBe('retain-secret')
    expect(requests.map(request => new URL(request.url).pathname)).toContain('/v1/memories/ret-1')
  })

  it('maps Supermemory v4 recall/list/forget and v3 document ingestion', async () => {
    const requests: Array<{ url: string; init?: RequestInit }> = []
    const fetchMock = vi.fn<typeof fetch>(async (url, init) => {
      requests.push({ url: String(url), ...(init === undefined ? {} : { init }) })
      const path = new URL(String(url)).pathname
      if (path === '/v4/search') return response({ results: [{ id: 'sm-1', memory: 'Alice uses dark mode.', similarity: 0.88, metadata: { category: 'preference' } }] })
      if (path === '/v4/memories/list') return response({ memoryEntries: [{ id: 'sm-1', memory: 'Alice uses dark mode.', createdAt: '2026-08-16T00:00:00Z' }] })
      if (path === '/v3/documents') return response({ id: 'doc-1', status: 'queued' })
      if (path === '/v4/memories' && init?.method === 'DELETE') return response({ id: 'sm-1', forgotten: true })
      throw new Error(`unexpected ${init?.method ?? 'GET'} ${path}`)
    })
    const { registry, body } = await providerBody('supermemory', {
      endpoint: 'https://api.supermemory.ai', apiKey: 'sm-secret', containerTag: 'alice', searchMode: 'hybrid',
    })
    const provider = new SupermemoryProvider(registry, { fetch: fetchMock })

    await expect(provider.search(body, { query: 'theme', limit: 6 })).resolves.toEqual({
      results: [expect.objectContaining({ id: 'sm-1', category: 'preference', score: 0.88 })],
    })
    await expect(provider.list(body, { limit: 10 })).resolves.toEqual([expect.objectContaining({ id: 'sm-1' })])
    await expect(provider.remember(body, { content: 'Alice prefers dark mode.', category: 'preference' })).resolves.toMatchObject({ id: 'doc-1', status: 'queued' })
    await expect(provider.forget(body, 'sm-1')).resolves.toMatchObject({ forgotten: true })

    expect(JSON.parse(String(requests[0]?.init?.body))).toMatchObject({ q: 'theme', containerTag: 'alice', searchMode: 'hybrid', limit: 6 })
    expect(new Headers(requests[0]?.init?.headers).get('Authorization')).toBe('Bearer sm-secret')
    expect(new Headers(requests[0]?.init?.headers).get('x-sm-source')).toBe('dsh-mnemon')
    expect(JSON.parse(String(requests.at(-1)?.init?.body))).toEqual({ id: 'sm-1', containerTag: 'alice', reason: 'Deleted from dsh-mnemon' })
  })
})
