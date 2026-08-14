// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ClientConnectionHandle } from '../src/contracts.ts'
import type { ClientSettingsScope, ClientSettingsSnapshot } from '../src/contracts.ts'
import type { Config } from '../src/config.ts'
import { MnemonView } from '../src/client/MnemonView.tsx'
import { translateEn } from '../src/client/locales.ts'

describe('MnemonView', () => {
  afterEach(cleanup)
  const settingsSnapshot = { status: 'ready' as const, value: { storageScope: 'custom' as const }, base: {}, user: {}, revision: 0, writable: true, mode: 'host' as const }
  const settingsScope = {
    getSnapshot: () => settingsSnapshot,
    subscribe: () => () => {},
    set: async () => {},
    unset: async () => {},
    setPath: async () => {},
    unsetPath: async () => {},
  } satisfies ClientSettingsScope<Config>

  function createConnection(options: { withInactiveBody?: boolean; listCount?: number; searchCount?: number; entityCount?: number; entityInsightCount?: number; documentCount?: number; runtimeCount?: number; longContent?: boolean; workspaceMismatch?: boolean } = {}) {
    const body = {
      id: 'project',
      name: '项目记忆体',
      description: '项目决策、约定与交付上下文。',
      active: true,
      dbPath: '/tmp/mnemon/data/project/mnemon.db',
      createdAt: '2026-08-13T02:00:00.000Z',
      updatedAt: '2026-08-13T03:00:00.000Z',
      healthy: true,
      stats: { totalInsights: 12, deletedInsights: 0, edgeCount: 9, oplogCount: 20, dbSizeBytes: 4096, byCategory: {}, topEntities: [{ entity: 'SQLite', count: 2 }] },
    }
    let secondaryActive = false
    let mnemonVersionUpdated = false
    const secondaryBody = {
      ...body,
      id: 'preferences',
      name: '偏好记忆体',
      description: '长期稳定的表达与协作偏好。',
      active: secondaryActive,
      dbPath: '/tmp/mnemon/data/preferences/mnemon.db',
      stats: { ...body.stats, totalInsights: 1, edgeCount: 0, topEntities: [{ entity: 'DSH', count: 1 }] },
    }
    const status = {
      healthy: true,
      version: '0.1.2',
      dshMnemonVersion: '0.1.2',
      cliPath: '/usr/local/bin/mnemon',
      commandFound: true,
      dataDir: '/tmp/mnemon',
      store: 'project',
      writeEnabled: true,
      timeoutMs: 10000,
      defaultRecallLimit: 10,
      memoryBodyDirectory: '/tmp/mnemon/data',
      memoryBodies: options.withInactiveBody ? [body, secondaryBody] : [body],
      stats: { totalInsights: 12, deletedInsights: 0, edgeCount: 9, oplogCount: 20, dbSizeBytes: 4096, byCategory: {}, topEntities: [] },
      storage: {
        activeKind: 'custom', activeRoot: '/tmp/mnemon', generatedAt: '2026-08-13T03:00:00.000Z',
        scopes: [{
          kind: 'custom', root: '/tmp/mnemon', configured: true, active: true, available: true, totalBytes: 8192,
          areas: [
            { kind: 'runtime', path: '/tmp/mnemon/runtime', status: 'ready', bytes: 1024, itemCount: 1, details: { userEntries: 1, memoryEntries: 0 } },
            { kind: 'memory-bodies', path: '/tmp/mnemon/data', status: 'ready', bytes: 7168, itemCount: 1, details: { activeBodies: 1, databases: 1 } },
            { kind: 'documents', path: '/tmp/mnemon/documents', status: 'empty', bytes: 0, itemCount: 0, details: { activeDocuments: 0, archivedDocuments: 0 } },
            { kind: 'state', path: '/tmp/mnemon/state', status: 'missing', bytes: 0, itemCount: 0, details: {} },
          ],
        }],
      },
      lifecycle: {
        enabled: true,
        recallMode: 'guided',
        writebackMode: 'guided',
        idleReviewMs: 30000,
        activeAgents: 1,
        sessionAvailable: true,
        counters: { primes: 1, recallCues: 2, writebackCues: 2, supervisedRequests: 1, failures: 0 },
        subagents: { recalls: 2, answers: 1, reviews: 1, writes: 1, failures: 0 },
        current: {
          sessionId: 'session-1',
          status: 'idle',
          startSource: 'startup',
          primePending: false,
          guidedTurns: 1,
          memoryToolCalls: 2,
          idleReviewPending: false,
          reviewRunning: false,
          lastReviewAt: '2026-08-13T02:59:00.000Z',
          lastReviewAction: 'skipped',
          lastPhase: 'writeback',
          lastAt: '2026-08-13T03:00:00.000Z',
        },
      },
      ...(options.workspaceMismatch === true ? {
        workspaceContext: {
          mode: 'workspace',
          selectedRoot: '/tmp/workspace-two/.mnemon',
          effectiveRoot: '/tmp/workspace-one/.mnemon',
          aligned: false,
          selectedWorkspace: { id: 'workspace-2', title: 'Workspace Two', path: '/tmp/workspace-two' },
          effectiveWorkspace: { id: 'workspace-1', title: 'Workspace One', path: '/tmp/workspace-one' },
        },
      } : {}),
    }
    const memory = { id: 'memory-12345678', content: options.longContent === true ? '这是一段非常长的记忆内容，用于验证图谱检查器对超长文本的截断展示，以及全文预览窗口的打开与关闭。'.repeat(6) : '项目选择 SQLite，因为需要单文件部署。', category: 'decision', importance: 4, tags: ['architecture'], entities: ['SQLite'], color: '#e74c3c', memoryBodyId: body.id, memoryBodyName: body.name, graphId: `${body.id}:memory-12345678` }
    const secondaryMemory = { id: 'preference-1', content: '用户偏好简洁中文回答。', category: 'preference', importance: 4, tags: ['style'], entities: ['DSH'], color: '#9b59b6', memoryBodyId: secondaryBody.id, memoryBodyName: secondaryBody.name, graphId: `${secondaryBody.id}:preference-1` }
    let runtimeEntries = options.runtimeCount === undefined
      ? [{ content: '用户偏好简洁中文回答。', created_at: '2026-08-13T02:00:00.000Z', updated_at: '2026-08-13T02:00:00.000Z', target: 'user', importance: 'critical' }]
      : Array.from({ length: options.runtimeCount }, (_, index) => ({ content: `运行时条目 ${index + 1}`, created_at: `2026-08-13T02:${String(index).padStart(2, '0')}:00.000Z`, updated_at: `2026-08-13T02:${String(index).padStart(2, '0')}:00.000Z`, target: index % 2 === 0 ? 'user' : 'memory', importance: index % 3 === 0 ? 'critical' : 'normal' }))
    const baseDocument = {
      id: 'document-12345678', title: '发布验证清单', description: '发布前的完整验证路径。', status: 'active', filename: 'release-document-1234.md',
      relativePath: '.mnemon/documents/active/release-document-1234.md', sourcePaths: ['package.json'], sessionIds: ['session-1'],
      createdAt: '2026-08-13T02:00:00.000Z', updatedAt: '2026-08-13T02:00:00.000Z', lastAccessedAt: '2026-08-13T02:00:00.000Z',
      revision: 1, contentHash: 'a'.repeat(64), sizeBytes: 640, memoryBodyIds: [] as string[], healthy: true, excerpt: '发布前运行 typecheck、单元测试与真实 WebUI E2E。',
      content: '# 发布验证\n\n发布前运行 **typecheck**、单元测试与真实 WebUI E2E。\n\n- 检查构建产物\n- 检查真实页面\n\n[架构说明](https://example.com/architecture)\n\n[不安全链接](javascript:alert(1))',
    }
    let documents = options.documentCount === undefined
      ? [baseDocument]
      : Array.from({ length: options.documentCount }, (_, index) => ({ ...baseDocument, id: `document-${String(index + 1).padStart(8, '0')}`, title: `档案条目 ${index + 1}`, filename: `document-${index + 1}.md`, relativePath: `.mnemon/documents/active/document-${index + 1}.md`, content: `# 档案条目 ${index + 1}\n\n正文 ${index + 1}`, excerpt: `档案摘要 ${index + 1}` }))
    const call = vi.fn(async (_channel: string, endpoint: string, payload?: Record<string, unknown>) => {
      const bodies = options.withInactiveBody ? [body, { ...secondaryBody, active: secondaryActive }] : [body]
      if (endpoint === 'runtime-memory') {
        if (payload?.action !== undefined) {
          const target = String(payload.target)
          if (payload.action === 'add') runtimeEntries = [...runtimeEntries, { content: String(payload.content), created_at: '2026-08-13T03:01:00.000Z', updated_at: '2026-08-13T03:01:00.000Z', target, importance: String(payload.importance ?? 'normal') }]
          if (payload.action === 'replace') runtimeEntries = runtimeEntries.map(entry => entry.target === target && entry.content.includes(String(payload.old_text)) ? { ...entry, content: String(payload.content), importance: String(payload.importance ?? entry.importance), updated_at: '2026-08-13T03:01:00.000Z' } : entry)
          if (payload.action === 'remove') runtimeEntries = runtimeEntries.filter(entry => !(entry.target === target && entry.content.includes(String(payload.old_text))))
          const targetEntries = runtimeEntries.filter(entry => entry.target === target)
          return { ok: true, value: { success: true, message: 'updated', target, entryCount: targetEntries.length, usage: { used: targetEntries.reduce((sum, entry) => sum + entry.content.length, 0), limit: target === 'user' ? 4096 : 10240 } } }
        }
        const targetView = (target: string, limit: number) => { const entries = runtimeEntries.filter(entry => entry.target === target); return { target, entryCount: entries.length, used: entries.reduce((sum, entry) => sum + entry.content.length, 0), limit, markdownPath: `/tmp/mnemon/runtime/${target === 'user' ? 'USER' : 'MEMORY'}.md` } }
        return { ok: true, value: { directory: '/tmp/mnemon/runtime', sourcePath: '/tmp/mnemon/runtime/memories.json', generatedAt: '2026-08-13T03:00:00.000Z', entries: runtimeEntries, targets: { user: targetView('user', 4096), memory: targetView('memory', 10240) } } }
      }
      if (endpoint === 'documents') {
        const active = documents.filter(document => document.status === 'active')
        return { ok: true, value: { workspaceRoot: '/tmp/project', directory: '/tmp/project/.mnemon/documents', indexPath: '/tmp/project/.mnemon/documents/index.json', generatedAt: '2026-08-13T03:00:00.000Z', revision: 'r1', limitBytes: 10 * 1024 * 1024, activeBytes: active.reduce((sum, document) => sum + document.sizeBytes, 0), activeCount: active.length, archivedCount: documents.length - active.length, total: documents.length, documents: documents.map(({ content: _content, ...document }) => document) } }
      }
      if (endpoint === 'document-search') {
        const query = String(payload?.query ?? '').toLowerCase()
        const includeArchived = payload?.includeArchived === true
        const results = documents.filter(document => (includeArchived || document.status === 'active') && `${document.title} ${document.description} ${document.content}`.toLowerCase().includes(query)).map(document => ({ ...document, score: 8 }))
        return { ok: true, value: { query, includeArchived, total: results.length, generatedAt: '2026-08-13T03:00:00.000Z', results } }
      }
      if (endpoint === 'document') {
        if (payload?.action === 'create') {
          const created = { ...documents[0]!, id: 'document-new-1234', title: String(payload.title), description: String(payload.description ?? ''), content: String(payload.content), excerpt: String(payload.content).slice(0, 120), sourcePaths: payload.sourcePaths as string[] ?? [], filename: 'new-document-new.md', relativePath: '.mnemon/documents/active/new-document-new.md' }
          documents = [...documents, created]
          return { ok: true, value: { success: true, action: 'created', document: created, snapshot: {} } }
        }
        if (payload?.action === 'update') {
          documents = documents.map(document => document.id === payload.id ? { ...document, title: String(payload.title ?? document.title), description: String(payload.description ?? document.description), content: String(payload.content ?? document.content), revision: document.revision + 1 } : document)
          return { ok: true, value: { success: true, action: 'updated', document: documents.find(document => document.id === payload.id), snapshot: {} } }
        }
        if (payload?.action === 'archive') {
          documents = documents.map(document => document.id === payload.id ? { ...document, status: 'archived', relativePath: `.mnemon/documents/archived/${document.filename}`, archiveSummary: '已写入发布记忆体索引。', memoryBodyIds: ['project'] } : document)
          return { ok: true, value: { success: true, action: 'archived', document: documents.find(document => document.id === payload.id), snapshot: {}, maintenance: { runId: 'archive-child', provider: 'spawn', summary: 'indexed', memoryBodyIds: ['project'], archivedDocumentIds: [payload.id] } } }
        }
        return { ok: true, value: documents.find(document => document.id === payload?.id) }
      }
      if (endpoint === 'status') return { ok: true, value: { ...status, memoryBodies: bodies } }
      if (endpoint === 'versions') return { ok: true, value: {
        checkedAt: '2026-08-15T03:00:00.000Z',
        components: [
          { id: 'mnemon', name: 'Mnemon CLI', current: mnemonVersionUpdated ? '0.2.0' : '0.1.2', latest: '0.2.0', outdated: !mnemonVersionUpdated, installMode: 'homebrew', updateSupported: true, updateHint: 'brew' },
          { id: 'dsh-mnemon', name: 'dsh-mnemon', current: '0.1.2', latest: '0.1.3', outdated: true, installMode: 'link', updateSupported: false, updateHint: 'link' },
        ],
      } }
      if (endpoint === 'version-update') {
        mnemonVersionUpdated = payload?.component === 'mnemon'
        status.version = mnemonVersionUpdated ? '0.2.0' : status.version
        return { ok: true, value: { component: payload?.component, previousVersion: '0.1.2', currentVersion: '0.2.0', updated: true, restartRequired: false } }
      }
      if (endpoint === 'bodies') return { ok: true, value: { items: bodies, total: bodies.length, activeCount: bodies.filter(item => item.active).length, directory: '/tmp/mnemon/data', generatedAt: '2026-08-13T03:00:00.000Z' } }
      if (endpoint === 'graph') return {
        ok: true,
        value: {
          nodes: [memory, { id: 'memory-graph-2', content: 'Mnemon 使用四图持久记忆。', category: 'fact', color: '#3498db', memoryBodyId: body.id, memoryBodyName: body.name, graphId: `${body.id}:memory-graph-2` }, ...(secondaryActive ? [secondaryMemory] : [])],
          edges: [
            { sourceId: `${body.id}:${memory.id}`, targetId: `${body.id}:memory-graph-2`, label: 'backbone', color: '#aaaaaa', type: 'temporal' },
            { sourceId: `${body.id}:${memory.id}`, targetId: `${body.id}:memory-graph-2`, label: 'SQLite', color: '#2ecc71', type: 'entity' },
          ],
          generatedAt: '2026-08-13T03:00:00.000Z',
        },
      }
      if (endpoint === 'list') {
        const items = options.listCount === undefined
          ? [memory]
          : Array.from({ length: options.listCount }, (_, index) => ({ ...memory, id: `memory-${index + 1}`, graphId: `${body.id}:memory-${index + 1}`, content: `记忆条目 ${index + 1}` }))
        return { ok: true, value: { items, total: items.length, generatedAt: '2026-08-13T03:00:00.000Z' } }
      }
      if (endpoint === 'entities') {
        const items = options.entityCount === undefined ? [{ entity: 'SQLite', count: 2 }] : Array.from({ length: options.entityCount }, (_, index) => ({ entity: `实体 ${index + 1}`, count: options.entityCount! - index }))
        const selected = payload?.entity === undefined ? undefined : String(payload.entity)
        const insights = selected === undefined ? [] : Array.from({ length: options.entityInsightCount ?? 1 }, (_, index) => ({ ...memory, id: `entity-memory-${index + 1}`, graphId: `${body.id}:entity-memory-${index + 1}`, content: `${selected} 关联记忆 ${index + 1}` }))
        return { ok: true, value: { items, ...(selected === undefined ? {} : { selected }), insights } }
      }
      if (endpoint === 'search') return {
        ok: true,
        value: {
          query: 'SQLite',
          mode: 'smart',
          results: options.searchCount === undefined ? [memory] : Array.from({ length: options.searchCount }, (_, index) => ({ ...memory, id: `search-memory-${index + 1}`, graphId: `${body.id}:search-memory-${index + 1}`, content: `检索记忆 ${index + 1}` })),
        },
      }
      if (endpoint === 'agent-search') return {
        ok: true,
        value: {
          query: 'SQLite', mode: 'smart', results: [memory],
          answer: '项目选择 SQLite，以满足单文件部署。', citations: ['project/memory-12345678'],
          delegation: { runId: 'answer-child-1', provider: 'spawn' },
        },
      }
      if (endpoint === 'related') return { ok: true, value: [] }
      if (endpoint === 'supervise') return { ok: true, value: { delegated: true, sessionId: 'session-1', runId: 'child-1', provider: 'spawn', summary: '已提炼并写入项目交付约束。', action: 'stored', memoryBodyIds: ['project'] } }
      if (endpoint === 'remember') return { ok: true, value: { delegated: true, runId: 'child-2', provider: 'spawn', summary: '已按高级约束写入。', action: 'stored', memoryBodyIds: ['project'] } }
      if (endpoint === 'forget') return { ok: true, value: { action: 'forgotten' } }
      if (endpoint === 'body-update') {
        const target = payload?.memoryBodyId === secondaryBody.id ? secondaryBody : body
        if (payload?.name !== undefined) target.name = String(payload.name)
        if (payload?.description !== undefined) target.description = String(payload.description)
        if (payload?.active !== undefined) {
          target.active = Boolean(payload.active)
          if (target === secondaryBody) secondaryActive = target.active
        }
        return { ok: true, value: { ...target } }
      }
      if (endpoint === 'body-delete') return { ok: true, value: { ...body } }
      if (endpoint === 'body-create') return { ok: true, value: { ...body, id: 'new-body', name: String(payload?.name ?? '') } }
      return { ok: false, error: { code: 'unexpected', message: endpoint } }
    })
    return { connection: { rpc: { call } } as unknown as ClientConnectionHandle, call }
  }

  it('shows the live graph and all eight Mnemon workspaces', async () => {
    const { connection } = createConnection()
    const { container } = render(<MnemonView connection={connection} settingsScope={settingsScope} sessionId="session-1" />)
    await waitFor(() => expect(screen.getByText('已连接 · 1 个已激活')).toBeTruthy())
    fireEvent.click(screen.getByRole('button', { name: /记忆体 记忆体目录与实时图谱/ }))
    expect(screen.getByRole('heading', { name: '记忆体' })).toBeTruthy()
    expect(screen.getByRole('region', { name: '记忆体目录' })).toBeTruthy()
    await waitFor(() => expect(screen.getAllByText('项目记忆体').length).toBeGreaterThan(0))
    expect(screen.getByRole('switch', { name: '项目记忆体读取开关' }).getAttribute('aria-checked')).toBe('true')
    expect(screen.getByText('12')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Mnemon', level: 1 })).toBeTruthy()
    expect(container.querySelector('[data-mnemon-surface="buildin"]')).toBeTruthy()
    expect(screen.queryByText('LLM-supervised 4-graph persistent memory for AI agents.')).toBeNull()
    expect(screen.getByRole('img', { name: 'Mnemon' })).toBeTruthy()
    await waitFor(() => expect(screen.getByRole('img', { name: /Mnemon 实时记忆图谱/ })).toBeTruthy())
    expect(screen.getByRole('button', { name: '记忆体: 项目记忆体' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '实体: SQLite' })).toBeTruthy()
    expect(screen.getByText('1 个空间 · 2 条记忆 · 1 个实体')).toBeTruthy()
    const entityEdges = container.querySelectorAll('path[data-edge="entity"]')
    expect(entityEdges).toHaveLength(1)
    expect(entityEdges[0]?.getAttribute('data-source-kind')).toBe('entity')
    expect(entityEdges[0]?.getAttribute('data-target-kind')).toBe('memory')
    expect(entityEdges[0]?.getAttribute('data-source-id')).toBe(container.querySelector('[data-kind="entity"]')?.getAttribute('data-node-id'))
    fireEvent.click(screen.getByRole('button', { name: '实体: SQLite' }))
    expect(screen.getByText('实体详情')).toBeTruthy()
    expect(screen.getByText('索引次数')).toBeTruthy()
    expect(screen.getByRole('toolbar', { name: '图谱布局' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '自然铺开' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '均匀重置' })).toBeTruthy()

    const graphNode = screen.getByRole('button', { name: /决策: 项目选择 SQLite/ })
    const naturalPosition = graphNode.getAttribute('transform')
    fireEvent.click(screen.getByRole('button', { name: '均匀重置' }))
    await waitFor(() => expect(graphNode.getAttribute('transform')).not.toBe(naturalPosition))
    expect(screen.getByRole('status', { name: '布局状态：均匀布局' })).toBeTruthy()

    fireEvent.keyDown(graphNode, { key: 'ArrowRight' })
    expect(screen.getByRole('status', { name: '布局状态：自定义布局' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /运行时 热记忆与上下文/ }))
    expect(screen.getByRole('heading', { name: '运行时记忆' })).toBeTruthy()
    await waitFor(() => expect(screen.getByText('用户偏好简洁中文回答。')).toBeTruthy())
    expect(screen.getByRole('region', { name: '用户画像' })).toBeTruthy()
    expect(screen.getByRole('region', { name: '工作记忆' })).toBeTruthy()
    fireEvent.change(screen.getByRole('textbox', { name: '运行时记忆内容' }), { target: { value: '项目默认使用 pnpm。' } })
    fireEvent.click(screen.getByRole('button', { name: '添加' }))
    await waitFor(() => expect(screen.getByText('项目默认使用 pnpm。')).toBeTruthy())

    fireEvent.click(screen.getByRole('button', { name: /检索 意图增强召回/ }))
    expect(screen.getByRole('heading', { name: '检索记忆' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /档案 项目知识与归档/ }))
    expect(screen.getByRole('heading', { name: '项目档案' })).toBeTruthy()
    await waitFor(() => expect(screen.getByText('发布验证清单')).toBeTruthy())
    const documentReader = screen.getByRole('region', { name: '档案阅读器' })
    await waitFor(() => expect(documentReader.querySelector('h1')?.textContent).toBe('发布验证'))
    expect(documentReader.querySelector('strong')?.textContent).toBe('typecheck')
    expect(documentReader.querySelectorAll('li')).toHaveLength(2)
    expect(documentReader.querySelector('a[href="https://example.com/architecture"]')?.getAttribute('target')).toBe('_blank')
    expect(documentReader.querySelector('a[href^="javascript:"]')).toBeNull()
    expect(documentReader.querySelector('pre')).toBeNull()
    expect(screen.getByText('640 B / 10.0 MB')).toBeTruthy()
    expect(screen.getByText('`.mnemon/documents/index.json` 是控制面事实源；active 总量固定不超过 10 MB，archived 不计入上限，项目源文件不会被修改。')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /实体 关系与上下文/ }))
    expect(screen.getByRole('heading', { name: '实体查阅' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /沉淀 LLM 监督写回/ }))
    expect(screen.getByRole('heading', { name: '沉淀记忆' })).toBeTruthy()
    expect(screen.getByText('记忆子 Agent 会完成什么')).toBeTruthy()
    expect(screen.getByText('人工高级选项')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /内容 浏览与维护/ }))
    expect(screen.getByRole('heading', { name: '记忆内容' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /状态 运行与诊断/ }))
    expect(screen.getByRole('heading', { name: '系统状态' })).toBeTruthy()
    expect(within(screen.getByRole('region', { name: 'Mnemon 运行状态' })).getAllByRole('article')).toHaveLength(4)
    expect(screen.queryByText('记忆子 Agent 可用')).toBeNull()
    expect(screen.queryByRole('heading', { name: '子 Agent 生命周期' })).toBeNull()
    expect(screen.queryByRole('heading', { name: '记忆系统流转' })).toBeNull()
    expect(screen.getByRole('heading', { name: '存储域' })).toBeTruthy()
    expect(within(screen.getByRole('region', { name: '存储域' })).getAllByRole('article')).toHaveLength(3)
    expect(screen.queryByText('后台状态')).toBeNull()
    expect(screen.getByText('/tmp/mnemon')).toBeTruthy()
  }, 10_000)

  it('activates an additional memory space without crashing the live graph', async () => {
    const { connection } = createConnection({ withInactiveBody: true })
    render(<MnemonView connection={connection} settingsScope={settingsScope} sessionId="session-1" />)

    await waitFor(() => expect(screen.getByText('已连接 · 1 个已激活')).toBeTruthy())
    fireEvent.click(screen.getByRole('button', { name: /记忆体 记忆体目录与实时图谱/ }))
    const toggle = await screen.findByRole('switch', { name: '偏好记忆体读取开关' })
    expect(toggle.getAttribute('aria-checked')).toBe('false')
    fireEvent.click(toggle)

    await waitFor(() => expect(screen.getByRole('switch', { name: '偏好记忆体读取开关' }).getAttribute('aria-checked')).toBe('true'))
    expect(screen.getByRole('button', { name: /偏好: 用户偏好简洁中文回答/ })).toBeTruthy()
    expect(screen.getByRole('img', { name: /Mnemon 实时记忆图谱，7 个元素/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: '记忆体: 偏好记忆体' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '实体: DSH' })).toBeTruthy()
  })

  it('checks both product versions and only offers a safe supported update', async () => {
    const { connection, call } = createConnection()
    render(<MnemonView connection={connection} settingsScope={settingsScope} sessionId="session-1" surface="sidebar" />)

    await waitFor(() => expect(screen.getByText('dsh-mnemon 0.1.2')).toBeTruthy())
    fireEvent.click(screen.getByRole('button', { name: '检查版本' }))
    const dialog = screen.getByRole('dialog', { name: '检查与更新版本' })
    await waitFor(() => expect(within(dialog).getByText('Mnemon CLI')).toBeTruthy())
    expect(within(dialog).getByText('dsh-mnemon')).toBeTruthy()
    expect(within(dialog).getByText('本地 Link')).toBeTruthy()
    expect(within(dialog).getByText(/请在源码目录拉取并构建/)).toBeTruthy()
    expect(within(dialog).getAllByRole('button', { name: '更新' })).toHaveLength(1)

    fireEvent.click(within(dialog).getByRole('button', { name: '更新' }))
    await waitFor(() => expect(within(dialog).getByText('Mnemon CLI 已更新')).toBeTruthy())
    expect(call).toHaveBeenCalledWith('/dsh-mnemon-write', 'version-update', { component: 'mnemon' })
    await waitFor(() => expect(within(dialog).getByText('已是最新')).toBeTruthy())
    expect(call.mock.calls.filter(([, endpoint]) => endpoint === 'versions')).toHaveLength(2)
    await waitFor(() => expect(screen.getByText('Mnemon 0.2.0')).toBeTruthy())
  })

  it('keeps shared functionality but applies the minimal unbranded sidebar appearance', async () => {
    const { connection, call } = createConnection()
    const { container } = render(<MnemonView connection={connection} settingsScope={settingsScope} sessionId="session-1" surface="sidebar" />)

    expect(screen.getByLabelText('存储位置模式：自定义')).toBeTruthy()
    expect(screen.queryByLabelText('存储位置模式：—')).toBeNull()
    await waitFor(() => expect(screen.getByText('已连接')).toBeTruthy())
    expect(container.querySelector('[data-mnemon-surface="sidebar"]')).toBeTruthy()
    const sidebarHeader = screen.getByRole('heading', { name: '记忆系统', level: 1 }).closest('header')
    if (sidebarHeader === null) throw new Error('Sidebar header missing')
    expect(within(sidebarHeader).getByLabelText('存储位置模式：自定义')).toBeTruthy()
    expect(within(sidebarHeader).getByText('已连接')).toBeTruthy()
    expect(within(sidebarHeader).queryByText(/个已激活/)).toBeNull()
    expect(screen.getByRole('heading', { name: '记忆系统', level: 1 })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Mnemon', level: 1 })).toBeNull()
    expect(screen.queryByRole('img', { name: 'Mnemon' })).toBeNull()
    expect(screen.queryByRole('region', { name: '记忆统计' })).toBeNull()
    expect(screen.queryByText('运行与诊断')).toBeNull()

    const tablist = screen.getByRole('tablist', { name: 'Mnemon 页面' })
    const tabs = within(tablist).getAllByRole('tab')
    const statusTab = within(tablist).getByRole('tab', { name: '状态' })
    const runtimeTab = within(tablist).getByRole('tab', { name: '运行时' })
    const bodiesTab = within(tablist).getByRole('tab', { name: '记忆体' })
    const documentsTab = within(tablist).getByRole('tab', { name: '档案' })
    expect(tabs).toHaveLength(4)
    expect(statusTab.getAttribute('aria-selected')).toBe('true')
    expect(statusTab.hasAttribute('data-active')).toBe(true)
    expect(bodiesTab.getAttribute('aria-selected')).toBe('false')
    expect(screen.queryByRole('navigation', { name: 'Mnemon 页面' })).toBeNull()

    const canvas = screen.getByTestId('mnemon-canvas')
    expect(canvas.hasAttribute('data-lock-page-header')).toBe(true)
    canvas.scrollTop = 240
    fireEvent.click(bodiesTab)
    expect(canvas.scrollTop).toBe(0)
    expect(canvas.hasAttribute('data-lock-page-header')).toBe(false)
    expect(statusTab.getAttribute('aria-selected')).toBe('false')
    expect(statusTab.hasAttribute('data-active')).toBe(false)
    expect(bodiesTab.getAttribute('aria-selected')).toBe('true')
    expect(bodiesTab.hasAttribute('data-active')).toBe(true)
    const memoryTablist = screen.getByRole('tablist', { name: '记忆体页面' })
    const memoryTabs = within(memoryTablist).getAllByRole('tab')
    const overviewTab = within(memoryTablist).getByRole('tab', { name: '概览' })
    const searchTab = within(memoryTablist).getByRole('tab', { name: '检索' })
    const rememberAction = screen.getByRole('button', { name: '沉淀记忆' })
    expect(memoryTabs).toHaveLength(4)
    expect(overviewTab.getAttribute('aria-selected')).toBe('true')
    expect(rememberAction.className).toContain('primaryButton')
    expect(screen.getByRole('heading', { name: '记忆体', level: 2 })).toBeTruthy()
    expect(screen.getByText('管理全局记忆体的读取边界，并在一张实时四图快照中观察所有已激活记忆体。')).toBeTruthy()
    expect(screen.getByRole('heading', { name: '概览', level: 2 })).toBeTruthy()
    await waitFor(() => expect(screen.getByRole('region', { name: '记忆体目录' })).toBeTruthy())

    const createBodyButton = screen.getByRole('button', { name: '创建记忆体' })
    createBodyButton.focus()
    fireEvent.click(createBodyButton)
    const bodyCreateDialog = screen.getByRole('dialog', { name: '创建记忆体' })
    expect(within(bodyCreateDialog).getByRole('textbox', { name: '新记忆体名称' })).toBeTruthy()
    expect(within(bodyCreateDialog).getByRole('textbox', { name: '新记忆体描述' })).toBeTruthy()
    const bodyCreateCancel = within(bodyCreateDialog).getAllByRole('button', { name: '取消' }).at(-1)
    if (bodyCreateCancel === undefined) throw new Error('memory body create cancel button missing')
    fireEvent.click(bodyCreateCancel)
    expect(screen.queryByRole('dialog', { name: '创建记忆体' })).toBeNull()
    expect(document.activeElement).toBe(createBodyButton)

    fireEvent.click(await screen.findByRole('button', { name: '编辑项目记忆体' }))
    const bodyDialog = screen.getByRole('dialog', { name: '编辑项目记忆体' })
    expect(within(bodyDialog).getByRole('textbox', { name: '名称' })).toBeTruthy()
    expect(within(bodyDialog).getByRole('textbox', { name: '路由说明' })).toBeTruthy()
    const bodyCancel = within(bodyDialog).getAllByRole('button', { name: '取消' }).at(-1)
    if (bodyCancel === undefined) throw new Error('memory body cancel button missing')
    fireEvent.click(bodyCancel)
    expect(screen.queryByRole('dialog', { name: '编辑项目记忆体' })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: '删除项目记忆体' }))
    const deleteDialog = screen.getByRole('dialog', { name: '删除“项目记忆体”？' })
    expect(within(deleteDialog).getByText(/永久删除这个记忆体及其中的全部记忆与关系/)).toBeTruthy()
    expect(document.activeElement).toBe(within(deleteDialog).getAllByRole('button', { name: '取消' }).at(-1))
    fireEvent.click(within(deleteDialog).getByRole('button', { name: '确认删除' }))
    await waitFor(() => expect(screen.queryByRole('dialog', { name: '删除“项目记忆体”？' })).toBeNull())
    expect(call).toHaveBeenCalledWith(expect.anything(), 'body-delete', { memoryBodyId: 'project', sessionId: 'session-1' })

    fireEvent.click(rememberAction)
    const rememberDialog = screen.getByRole('dialog', { name: '沉淀记忆' })
    expect(within(rememberDialog).getByRole('textbox', { name: '待沉淀内容' })).toBeTruthy()
    const advanced = rememberDialog.querySelector('details')
    expect(advanced?.hasAttribute('open')).toBe(false)
    fireEvent.click(within(rememberDialog).getByText('人工高级选项'))
    expect(advanced?.hasAttribute('open')).toBe(true)
    const rememberCancel = within(rememberDialog).getAllByRole('button', { name: '取消' }).at(-1)
    if (rememberCancel === undefined) throw new Error('remember cancel button missing')
    fireEvent.click(rememberCancel)
    expect(screen.queryByRole('dialog', { name: '沉淀记忆' })).toBeNull()
    expect(overviewTab.getAttribute('aria-selected')).toBe('true')

    fireEvent.click(searchTab)
    expect(searchTab.getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('heading', { name: '检索记忆', level: 2 })).toBeTruthy()
    fireEvent.click(statusTab)
    expect(screen.queryByRole('tablist', { name: '记忆体页面' })).toBeNull()
    fireEvent.click(bodiesTab)
    expect(within(screen.getByRole('tablist', { name: '记忆体页面' })).getByRole('tab', { name: '检索' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('heading', { name: '检索记忆', level: 2 })).toBeTruthy()

    fireEvent.click(runtimeTab)
    expect(canvas.hasAttribute('data-lock-page-header')).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: '添加记忆' }))
    const runtimeDialog = screen.getByRole('dialog', { name: '添加热记忆' })
    expect(within(runtimeDialog).getByRole('textbox', { name: '运行时记忆内容' })).toBeTruthy()
    const runtimeCancel = within(runtimeDialog).getAllByRole('button', { name: '取消' }).at(-1)
    if (runtimeCancel === undefined) throw new Error('runtime cancel button missing')
    fireEvent.click(runtimeCancel)
    expect(screen.queryByRole('dialog', { name: '添加热记忆' })).toBeNull()
    const runtimeList = screen.getByRole('region', { name: '运行时记忆列表' })
    expect(within(runtimeList).getByRole('group', { name: '运行时记忆范围' })).toBeTruthy()
    expect(within(runtimeList).getByRole('textbox', { name: '筛选运行时记忆' })).toBeTruthy()
    fireEvent.click(await within(runtimeList).findByRole('button', { name: '编辑' }))
    const runtimeEditDialog = screen.getByRole('dialog', { name: '编辑运行时记忆' })
    expect(within(runtimeEditDialog).getByRole('textbox', { name: '编辑运行时记忆' })).toBeTruthy()
    const runtimeEditCancel = within(runtimeEditDialog).getAllByRole('button', { name: '取消' }).at(-1)
    if (runtimeEditCancel === undefined) throw new Error('runtime edit cancel button missing')
    fireEvent.click(runtimeEditCancel)
    expect(screen.queryByRole('dialog', { name: '编辑运行时记忆' })).toBeNull()
    fireEvent.click(within(runtimeList).getByRole('button', { name: '移除' }))
    const runtimeRemoveDialog = screen.getByRole('dialog', { name: '移除运行时记忆？' })
    expect(within(runtimeRemoveDialog).getByText(/不再随每轮上下文加载/)).toBeTruthy()
    const runtimeRemoveCancel = within(runtimeRemoveDialog).getAllByRole('button', { name: '取消' }).at(-1)
    if (runtimeRemoveCancel === undefined) throw new Error('runtime remove cancel button missing')
    fireEvent.click(runtimeRemoveCancel)
    expect(screen.queryByRole('dialog', { name: '移除运行时记忆？' })).toBeNull()

    fireEvent.click(bodiesTab)
    expect(canvas.hasAttribute('data-lock-page-header')).toBe(false)
    const contentTab = within(screen.getByRole('tablist', { name: '记忆体页面' })).getByRole('tab', { name: '内容' })
    fireEvent.click(contentTab)
    fireEvent.click(await screen.findByRole('button', { name: '忘记' }))
    const forgetDialog = screen.getByRole('dialog', { name: '软删除这条记忆？' })
    expect(within(forgetDialog).getByText('项目选择 SQLite，因为需要单文件部署。')).toBeTruthy()
    const forgetCancel = within(forgetDialog).getAllByRole('button', { name: '取消' }).at(-1)
    if (forgetCancel === undefined) throw new Error('forget cancel button missing')
    fireEvent.click(forgetCancel)
    expect(screen.queryByRole('dialog', { name: '软删除这条记忆？' })).toBeNull()

    fireEvent.click(documentsTab)
    expect(canvas.hasAttribute('data-lock-page-header')).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: '新建档案' }))
    const documentDialog = screen.getByRole('dialog', { name: '创建托管档案' })
    expect(within(documentDialog).getByRole('textbox', { name: '标题' })).toBeTruthy()
    const documentCancel = within(documentDialog).getAllByRole('button', { name: '取消' }).at(-1)
    if (documentCancel === undefined) throw new Error('document cancel button missing')
    fireEvent.click(documentCancel)
    expect(screen.queryByRole('dialog', { name: '创建托管档案' })).toBeNull()
    const documentReader = screen.getByRole('region', { name: '档案阅读器' })
    fireEvent.click(await within(documentReader).findByRole('button', { name: '编辑' }))
    const documentEditDialog = screen.getByRole('dialog', { name: '编辑活跃档案' })
    expect(within(documentEditDialog).getByRole('textbox', { name: '标题' })).toBeTruthy()
    const documentEditCancel = within(documentEditDialog).getAllByRole('button', { name: '取消' }).at(-1)
    if (documentEditCancel === undefined) throw new Error('document edit cancel button missing')
    fireEvent.click(documentEditCancel)
    expect(screen.queryByRole('dialog', { name: '编辑活跃档案' })).toBeNull()
    fireEvent.click(within(documentReader).getByRole('button', { name: '归档' }))
    const documentArchiveDialog = screen.getByRole('dialog', { name: '确认建立 Mnemon 索引并迁移这份档案？' })
    expect(within(documentArchiveDialog).getByText(/受限子 Agent 写入可检索的 Mnemon 摘要/)).toBeTruthy()
    const documentArchiveCancel = within(documentArchiveDialog).getAllByRole('button', { name: '取消' }).at(-1)
    if (documentArchiveCancel === undefined) throw new Error('document archive cancel button missing')
    fireEvent.click(documentArchiveCancel)
    expect(screen.queryByRole('dialog', { name: '确认建立 Mnemon 索引并迁移这份档案？' })).toBeNull()
    expect(screen.queryByRole('img', { name: 'Mnemon' })).toBeNull()
  })

  it('edits an existing Memory Space name and description', async () => {
    const { connection, call } = createConnection()
    render(<MnemonView connection={connection} settingsScope={settingsScope} sessionId="session-1" />)

    await waitFor(() => expect(screen.getByText('已连接 · 1 个已激活')).toBeTruthy())
    fireEvent.click(screen.getByRole('button', { name: /记忆体 记忆体目录与实时图谱/ }))

    fireEvent.click(await screen.findByRole('button', { name: '编辑项目记忆体' }))
    fireEvent.change(screen.getByRole('textbox', { name: '名称' }), { target: { value: '项目决策空间' } })
    fireEvent.change(screen.getByRole('textbox', { name: '路由说明' }), { target: { value: '存放架构与交付决策。' } })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))

    await waitFor(() => expect(screen.getByText('项目决策空间')).toBeTruthy())
    expect(screen.getByText('存放架构与交付决策。')).toBeTruthy()
    expect(screen.queryByRole('button', { name: '编辑项目决策空间' })).toBeTruthy()
    expect(call).toHaveBeenCalledWith(expect.anything(), 'body-update', { memoryBodyId: 'project', name: '项目决策空间', description: '存放架构与交付决策。', sessionId: 'session-1' })
  })

  it('shows the inspected workspace, warns on divergence, and offers one-click alignment', async () => {
    const { connection } = createConnection({ workspaceMismatch: true })
    const onSelect = vi.fn()
    const onAlign = vi.fn()
    const workspaceSettingsSnapshot = { ...settingsSnapshot, value: { storageScope: 'workspace' as const } }
    const workspaceSettingsScope = { ...settingsScope, getSnapshot: () => workspaceSettingsSnapshot }
    render(<MnemonView
      connection={connection}
      settingsScope={workspaceSettingsScope}
      sessionId="session-1"
      workspaceId="workspace-2"
      surface="sidebar"
      workspaceSelection={{
        options: [
          { id: 'workspace-1', title: 'Workspace One', path: '/tmp/workspace-one' },
          { id: 'workspace-2', title: 'Workspace Two', path: '/tmp/workspace-two' },
        ],
        selectedWorkspaceId: 'workspace-2',
        effectiveWorkspaceId: 'workspace-1',
        onSelect,
        onAlign,
      }}
    />)

    expect(screen.getByLabelText('存储位置模式：工作区')).toBeTruthy()
    expect((screen.getByRole('combobox', { name: '选择要查看的记忆工作区' }) as HTMLSelectElement).value).toBe('workspace-2')
    const header = (await screen.findByRole('heading', { name: '记忆系统', level: 1 })).closest('header')
    if (header === null) throw new Error('Sidebar header missing')
    expect(within(header).getByLabelText('存储位置模式：工作区')).toBeTruthy()
    const alignment = within(header).getByRole('status', { name: /查看目录与当前会话未对齐/ })
    expect(alignment.getAttribute('aria-label')).toContain('查看：/tmp/workspace-two/.mnemon')
    expect(alignment.getAttribute('aria-label')).toContain('生效：/tmp/workspace-one/.mnemon')
    expect((screen.getByRole('combobox', { name: '选择要查看的记忆工作区' }) as HTMLSelectElement).value).toBe('workspace-2')
    fireEvent.change(screen.getByRole('combobox', { name: '选择要查看的记忆工作区' }), { target: { value: 'workspace-1' } })
    expect(onSelect).toHaveBeenCalledWith('workspace-1')
    fireEvent.click(within(header).getByRole('button', { name: '对齐对话' }))
    expect(onAlign).toHaveBeenCalledTimes(1)
  })

  it('clears workspace-scoped views before a newly selected workspace finishes loading', async () => {
    const { call } = createConnection({ runtimeCount: 3 })
    const delayedCall = vi.fn(async (channel: string, endpoint: string, payload?: Record<string, unknown>) => {
      if (payload?.workspaceId === 'workspace-2' && (endpoint === 'status' || endpoint === 'runtime-memory')) return await new Promise<never>(() => {})
      return call(channel, endpoint, payload)
    })
    const delayedConnection = { rpc: { call: delayedCall } } as unknown as ClientConnectionHandle
    const view = (workspaceId: string) => <MnemonView connection={delayedConnection} settingsScope={settingsScope} sessionId="session-1" workspaceId={workspaceId} surface="sidebar" />
    const { rerender } = render(view('workspace-1'))

    await waitFor(() => expect(screen.getByText('已连接')).toBeTruthy())
    fireEvent.click(screen.getByRole('tab', { name: '运行时' }))
    const oldRuntime = await screen.findByRole('region', { name: '运行时记忆列表' })
    await waitFor(() => expect(within(oldRuntime).getByText('运行时条目 1')).toBeTruthy())
    fireEvent.change(within(oldRuntime).getByRole('textbox', { name: '筛选运行时记忆' }), { target: { value: '条目 1' } })
    const oldCanvas = screen.getByTestId('mnemon-canvas')
    oldCanvas.scrollTop = 240

    rerender(view('workspace-2'))

    const newCanvas = screen.getByTestId('mnemon-canvas')
    expect(newCanvas).not.toBe(oldCanvas)
    expect(newCanvas.scrollTop).toBe(0)
    expect(screen.queryByText('运行时条目 1')).toBeNull()
    expect((screen.getByRole('textbox', { name: '筛选运行时记忆' }) as HTMLInputElement).value).toBe('')
    expect(screen.getByLabelText('存储位置模式：自定义')).toBeTruthy()
    await waitFor(() => expect(delayedCall).toHaveBeenCalledWith(expect.anything(), 'status', expect.objectContaining({ workspaceId: 'workspace-2' })))
  })

  it('remounts and reloads the active Sidebar page as soon as a saved storage setting is published', async () => {
    const base = createConnection({ runtimeCount: 1 })
    let settingsGeneration = 0
    let releaseNextGeneration!: () => void
    const nextGenerationReady = new Promise<void>(resolve => { releaseNextGeneration = resolve })
    const call = vi.fn(async (channel: string, endpoint: string, payload?: Record<string, unknown>) => {
      const response = await base.call(channel, endpoint, payload)
      if (settingsGeneration === 0 || (endpoint !== 'status' && endpoint !== 'runtime-memory')) return response
      await nextGenerationReady
      if (!response.ok) return response
      if (endpoint === 'status') {
        const value = response.value as Record<string, unknown>
        const storage = value.storage as Record<string, unknown>
        return { ...response, value: { ...value, dataDir: '/Users/test/.mnemon', storage: { ...storage, activeKind: 'global', activeRoot: '/Users/test/.mnemon' }, workspaceContext: { mode: 'global', selectedRoot: '/Users/test/.mnemon', effectiveRoot: '/Users/test/.mnemon', aligned: true } } }
      }
      const value = response.value as { targets: Record<string, Record<string, unknown>> }
      const content = '全局目录实时加载的运行时记忆。'
      return {
        ...response,
        value: {
          ...value,
          entries: [{ content, created_at: '2026-08-15T01:00:00.000Z', updated_at: '2026-08-15T01:00:00.000Z', target: 'memory', importance: 'normal' }],
          targets: {
            ...value.targets,
            user: { ...value.targets.user, entryCount: 0, used: 0 },
            memory: { ...value.targets.memory, entryCount: 1, used: content.length },
          },
        },
      }
    })
    const connection = { rpc: { call } } as unknown as ClientConnectionHandle
    let snapshot: ClientSettingsSnapshot<Config> = { status: 'ready', value: { storageScope: 'custom' }, base: {}, user: {}, revision: 0, writable: true, mode: 'host' }
    const listeners = new Set<() => void>()
    const liveSettingsScope = {
      getSnapshot: () => snapshot,
      subscribe: (listener: () => void) => { listeners.add(listener); return () => listeners.delete(listener) },
      set: async () => {}, unset: async () => {}, setPath: async () => {}, unsetPath: async () => {},
    } satisfies ClientSettingsScope<Config>
    render(<MnemonView connection={connection} settingsScope={liveSettingsScope} sessionId="session-1" surface="sidebar" />)

    await waitFor(() => expect(screen.getByText('已连接')).toBeTruthy())
    fireEvent.click(screen.getByRole('tab', { name: '运行时' }))
    await waitFor(() => expect(screen.getByText('运行时条目 1')).toBeTruthy())
    const oldCanvas = screen.getByTestId('mnemon-canvas')
    oldCanvas.scrollTop = 240
    fireEvent.change(screen.getByRole('textbox', { name: '筛选运行时记忆' }), { target: { value: '运行时条目' } })

    settingsGeneration = 1
    snapshot = { ...snapshot, value: { storageScope: 'global' }, revision: 1 }
    act(() => { for (const listener of listeners) listener() })

    await waitFor(() => expect(screen.getByTestId('mnemon-canvas')).not.toBe(oldCanvas))
    expect(screen.getByTestId('mnemon-canvas').scrollTop).toBe(0)
    expect(screen.getByLabelText('存储位置模式：全局')).toBeTruthy()
    expect(screen.queryByText('运行时条目 1')).toBeNull()
    expect((screen.getByRole('textbox', { name: '筛选运行时记忆' }) as HTMLInputElement).value).toBe('')

    releaseNextGeneration()
    await waitFor(() => expect(screen.getByText('全局目录实时加载的运行时记忆。')).toBeTruthy())
    expect(call.mock.calls.filter(([, endpoint]) => endpoint === 'status')).toHaveLength(2)
    expect(call.mock.calls.filter(([, endpoint]) => endpoint === 'runtime-memory')).toHaveLength(2)
  })

  it('clamps long node content in the graph inspector and opens a full-text preview', async () => {
    const { connection } = createConnection({ longContent: true })
    render(<MnemonView connection={connection} settingsScope={settingsScope} sessionId="session-1" />)

    await waitFor(() => expect(screen.getByText('已连接 · 1 个已激活')).toBeTruthy())
    fireEvent.click(screen.getByRole('button', { name: /记忆体 记忆体目录与实时图谱/ }))
    await waitFor(() => expect(screen.getByRole('img', { name: /Mnemon 实时记忆图谱/ })).toBeTruthy())

    fireEvent.click(screen.getByRole('button', { name: /^决策: 这是一段非常长的记忆内容/ }))
    const eye = await screen.findByRole('button', { name: '查看全文' })
    fireEvent.click(eye)

    const dialog = screen.getByRole('dialog', { name: '内容全文' })
    expect(dialog.textContent).toContain('全文预览窗口的打开与关闭')
    fireEvent.click(within(dialog).getByRole('button', { name: '取消' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('resets the shared canvas scroll position when switching pages', async () => {
    const { connection } = createConnection()
    render(<div data-testid="dsh-host-scrollport"><MnemonView connection={connection} settingsScope={settingsScope} sessionId="session-1" /></div>)

    await waitFor(() => expect(screen.getByText('已连接 · 1 个已激活')).toBeTruthy())
    const canvas = screen.getByTestId('mnemon-canvas')
    const hostScrollport = screen.getByTestId('dsh-host-scrollport')
    hostScrollport.scrollTop = 240
    canvas.scrollTop = 900
    fireEvent.click(screen.getByRole('button', { name: /运行时 热记忆与上下文/ }))
    expect(canvas.scrollTop).toBe(0)
    expect(hostScrollport.scrollTop).toBe(240)
    canvas.scrollTop = 900
    fireEvent.click(screen.getByRole('button', { name: /记忆体 记忆体目录与实时图谱/ }))
    expect(canvas.scrollTop).toBe(0)
    expect(hostScrollport.scrollTop).toBe(240)
  })

  it('progressively renders long content lists instead of mounting every card', async () => {
    const { connection } = createConnection({ listCount: 60 })
    render(<MnemonView connection={connection} settingsScope={settingsScope} sessionId="session-1" />)
    await waitFor(() => expect(screen.getByText('已连接 · 1 个已激活')).toBeTruthy())

    fireEvent.click(screen.getByRole('button', { name: /内容 浏览与维护/ }))
    await waitFor(() => expect(screen.getByText('当前显示 48 / 60')).toBeTruthy())
    expect(screen.getByText('记忆条目 48')).toBeTruthy()
    expect(screen.queryByText('记忆条目 49')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: '再显示 12 条' }))
    expect(screen.getByText('当前显示 60 / 60')).toBeTruthy()
    expect(screen.getByText('记忆条目 60')).toBeTruthy()
  })

  it('progressively reveals large Sidebar collections and resets scoped readers', async () => {
    const { connection } = createConnection({ runtimeCount: 23, searchCount: 15, entityCount: 25, entityInsightCount: 15, listCount: 25, documentCount: 17 })
    render(<MnemonView connection={connection} settingsScope={settingsScope} sessionId="session-1" surface="sidebar" />)
    await waitFor(() => expect(screen.getByText('已连接')).toBeTruthy())

    fireEvent.click(screen.getByRole('tab', { name: '运行时' }))
    const runtimeList = await screen.findByRole('region', { name: '运行时记忆列表' })
    await waitFor(() => expect(within(runtimeList).getByText('当前显示 10 / 23')).toBeTruthy())
    expect(within(runtimeList).queryByText('运行时条目 11')).toBeNull()
    fireEvent.click(within(runtimeList).getByRole('button', { name: '再显示 10 条' }))
    expect(within(runtimeList).getByText('运行时条目 20')).toBeTruthy()
    fireEvent.change(within(runtimeList).getByRole('textbox', { name: '筛选运行时记忆' }), { target: { value: '运行时条目 21' } })
    expect(within(runtimeList).getByText('当前显示 1 / 1')).toBeTruthy()
    expect(within(runtimeList).getByText('运行时条目 21')).toBeTruthy()

    fireEvent.click(screen.getByRole('tab', { name: '记忆体' }))
    fireEvent.click(within(screen.getByRole('tablist', { name: '记忆体页面' })).getByRole('tab', { name: '检索' }))
    fireEvent.change(screen.getByRole('textbox', { name: '记忆查询' }), { target: { value: 'SQLite' } })
    fireEvent.click(screen.getByRole('button', { name: '直接检索' }))
    await waitFor(() => expect(screen.getByText('当前显示 6 / 15')).toBeTruthy())
    expect(screen.queryByText('检索记忆 7')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '再显示 6 条' }))
    expect(screen.getByText('检索记忆 12')).toBeTruthy()

    fireEvent.click(within(screen.getByRole('tablist', { name: '记忆体页面' })).getByRole('tab', { name: '实体' }))
    await waitFor(() => expect(screen.getByText('当前显示 10 / 25')).toBeTruthy())
    expect(screen.queryByRole('button', { name: /实体 11/ })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '再显示 10 条' }))
    fireEvent.click(screen.getByRole('button', { name: /实体 11/ }))
    await waitFor(() => expect(screen.getByText('当前显示 6 / 15')).toBeTruthy())
    expect(screen.queryByText('实体 11 关联记忆 7')).toBeNull()

    fireEvent.click(within(screen.getByRole('tablist', { name: '记忆体页面' })).getByRole('tab', { name: '内容' }))
    await waitFor(() => expect(screen.getByText('当前显示 12 / 25')).toBeTruthy())
    expect(screen.queryByText('记忆条目 13')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '再显示 12 条' }))
    expect(screen.getByText('记忆条目 24')).toBeTruthy()

    fireEvent.click(screen.getByRole('tab', { name: '档案' }))
    const documentList = await screen.findByRole('complementary', { name: '项目档案列表' })
    await waitFor(() => expect(within(documentList).getByText('当前显示 8 / 17')).toBeTruthy())
    expect(within(documentList).queryByText('档案条目 9')).toBeNull()
    fireEvent.click(within(documentList).getByRole('button', { name: '再显示 8 条' }))
    expect(within(documentList).getByText('档案条目 16')).toBeTruthy()
    const documentReader = screen.getByRole('region', { name: '档案阅读器' })
    expect(documentReader.hasAttribute('data-scroll-region')).toBe(true)
    documentReader.scrollTop = 240
    fireEvent.click(within(documentList).getByRole('button', { name: /档案条目 2/ }))
    expect(documentReader.scrollTop).toBe(0)
  }, 15_000)

  it('requires inline confirmation before forgetting a recalled memory', async () => {
    const { connection, call } = createConnection()
    render(<MnemonView connection={connection} settingsScope={settingsScope} sessionId="session-1" />)
    await waitFor(() => expect(screen.getByText('已连接 · 1 个已激活')).toBeTruthy())

    fireEvent.click(screen.getByRole('button', { name: /检索 意图增强召回/ }))
    fireEvent.change(screen.getByRole('textbox', { name: '记忆查询' }), { target: { value: 'SQLite' } })
    fireEvent.click(screen.getByRole('button', { name: '直接检索' }))
    await waitFor(() => expect(screen.getByText('项目选择 SQLite，因为需要单文件部署。')).toBeTruthy())

    fireEvent.click(screen.getByRole('button', { name: '忘记' }))
    expect(screen.getByRole('group', { name: '确认忘记记忆' })).toBeTruthy()
    expect(call).not.toHaveBeenCalledWith(expect.anything(), 'forget', expect.anything())

    fireEvent.click(screen.getByRole('button', { name: '确认忘记' }))
    await waitFor(() => expect(screen.queryByText('项目选择 SQLite，因为需要单文件部署。')).toBeNull())
    expect(call).toHaveBeenCalledWith(expect.anything(), 'forget', { id: 'memory-12345678', memoryBodyId: 'project', sessionId: 'session-1' })
  })

  it('shows an Agent answer above the raw direct-recall evidence', async () => {
    const { connection, call } = createConnection()
    render(<MnemonView connection={connection} settingsScope={settingsScope} sessionId="session-1" />)
    await waitFor(() => expect(screen.getByText('已连接 · 1 个已激活')).toBeTruthy())

    fireEvent.click(screen.getByRole('button', { name: /检索 意图增强召回/ }))
    fireEvent.change(screen.getByRole('textbox', { name: '记忆查询' }), { target: { value: 'SQLite' } })
    fireEvent.click(screen.getByRole('button', { name: 'Agent 查询' }))

    await waitFor(() => expect(screen.getByRole('region', { name: 'Agent 查询结果' })).toBeTruthy())
    expect(screen.getByText('项目选择 SQLite，以满足单文件部署。')).toBeTruthy()
    expect(screen.getByText('project/memory-12345678')).toBeTruthy()
    expect(screen.getByText('原始召回内容')).toBeTruthy()
    expect(screen.getByText('项目选择 SQLite，因为需要单文件部署。')).toBeTruthy()
    expect(call).toHaveBeenCalledWith(expect.anything(), 'agent-search', expect.objectContaining({ query: 'SQLite', sessionId: 'session-1' }))
  })

  it('creates and cold-archives a managed Document through the WebUI control plane', async () => {
    const { connection, call } = createConnection()
    render(<MnemonView connection={connection} settingsScope={settingsScope} sessionId="session-1" />)
    await waitFor(() => expect(screen.getByText('已连接 · 1 个已激活')).toBeTruthy())
    fireEvent.click(screen.getByRole('button', { name: /档案 项目知识与归档/ }))
    await waitFor(() => expect(screen.getByText('发布验证清单')).toBeTruthy())

    fireEvent.click(screen.getByRole('button', { name: '新建档案' }))
    fireEvent.change(screen.getByRole('textbox', { name: '标题' }), { target: { value: '架构交接说明' } })
    fireEvent.change(screen.getByRole('textbox', { name: '检索说明' }), { target: { value: '解释存储控制层与并发边界。' } })
    fireEvent.change(screen.getByRole('textbox', { name: '来源路径' }), { target: { value: 'src/documents.ts' } })
    fireEvent.change(screen.getByRole('textbox', { name: 'Markdown 内容' }), { target: { value: '# 控制层\n\nindex.json 是事实源。' } })
    fireEvent.click(screen.getByRole('button', { name: '创建档案' }))

    await waitFor(() => expect(screen.getAllByText('架构交接说明').length).toBeGreaterThan(0))
    expect(call).toHaveBeenCalledWith(expect.anything(), 'document', expect.objectContaining({ action: 'create', title: '架构交接说明', content: '# 控制层\n\nindex.json 是事实源。', sessionId: 'session-1' }))
    await waitFor(() => expect(screen.getByRole('button', { name: '归档' })).toBeTruthy())
    fireEvent.click(screen.getByRole('button', { name: '归档' }))
    fireEvent.click(screen.getByRole('button', { name: '确认归档' }))
    await waitFor(() => expect(screen.getByText(/已建立 Mnemon 冷索引并归档/)).toBeTruthy())
    expect(call).toHaveBeenCalledWith(expect.anything(), 'document', { action: 'archive', id: 'document-new-1234', sessionId: 'session-1' })
    expect(screen.getByText('Mnemon 冷索引回执')).toBeTruthy()
    expect(screen.getByText('已写入发布记忆体索引。')).toBeTruthy()
  })

  it('dispatches the default writeback path to an isolated memory subagent', async () => {
    const { connection, call } = createConnection()
    render(<MnemonView connection={connection} settingsScope={settingsScope} sessionId="session-1" />)
    await waitFor(() => expect(screen.getByText('已连接 · 1 个已激活')).toBeTruthy())

    fireEvent.click(screen.getByRole('button', { name: /沉淀 LLM 监督写回/ }))
    fireEvent.change(screen.getByRole('textbox', { name: '待沉淀内容' }), { target: { value: '项目发布前必须通过真实 WebUI 验证。' } })
    fireEvent.click(screen.getByRole('button', { name: '调度子 Agent 判断并沉淀' }))

    await waitFor(() => expect(screen.getByText(/记忆子 Agent 已完成处理/)).toBeTruthy())
    expect(call).toHaveBeenCalledWith(expect.anything(), 'supervise', {
      sessionId: 'session-1',
      content: '项目发布前必须通过真实 WebUI 验证。',
    })
    expect(call).not.toHaveBeenCalledWith(expect.anything(), 'remember', expect.anything())
  })

  it('renders a usable empty overview when no memory bodies exist', async () => {
    const call = vi.fn(async (_channel: string, endpoint: string) => {
      if (endpoint === 'status') return {
        ok: true,
        value: {
          healthy: true,
          version: '0.2.0',
          cliPath: '/usr/local/bin/mnemon',
          commandFound: true,
          dataDir: '/tmp/mnemon',
          store: 'none',
          writeEnabled: true,
          timeoutMs: 10000,
          defaultRecallLimit: 10,
          memoryBodyDirectory: '/tmp/mnemon/data',
          memoryBodies: [],
          stats: { totalInsights: 0, deletedInsights: 0, edgeCount: 0, oplogCount: 0, dbSizeBytes: 0, byCategory: {}, topEntities: [] },
        },
      }
      if (endpoint === 'bodies') return { ok: false, error: { code: 'compatibility', message: 'memory-body catalog unavailable' } }
      if (endpoint === 'graph') return { ok: true, value: { nodes: [], edges: [], generatedAt: '2026-08-13T03:00:00.000Z' } }
      return { ok: false, error: { code: 'unexpected', message: endpoint } }
    })
    render(<MnemonView connection={{ rpc: { call } } as unknown as ClientConnectionHandle} settingsScope={settingsScope} sessionId="session-1" />)

    fireEvent.click(screen.getByRole('button', { name: /记忆体 记忆体目录与实时图谱/ }))
    await waitFor(() => expect(screen.getAllByRole('heading', { name: '还没有记忆体' })).toHaveLength(1))
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.getByText('0 / 0')).toBeTruthy()
    expect(screen.getByText('＋ 创建空白记忆体')).toBeTruthy()
  })

  it('marks an old Host catalog as unsynchronized instead of reporting zero bodies', async () => {
    const call = vi.fn(async (_channel: string, endpoint: string) => {
      if (endpoint === 'status') return {
        ok: true,
        value: {
          healthy: true,
          version: '0.2.0',
          cliPath: '/usr/local/bin/mnemon',
          commandFound: true,
          dataDir: '/tmp/mnemon',
          store: 'legacy',
          writeEnabled: true,
          timeoutMs: 10000,
          defaultRecallLimit: 10,
          stats: { totalInsights: 2, deletedInsights: 0, edgeCount: 6, oplogCount: 4, dbSizeBytes: 4096, byCategory: {}, topEntities: [] },
        },
      }
      if (endpoint === 'bodies') return { ok: false, error: { code: 'compatibility', message: 'unknown endpoint' } }
      if (endpoint === 'graph') return { ok: true, value: { nodes: [], edges: [], generatedAt: '2026-08-13T03:00:00.000Z' } }
      return { ok: false, error: { code: 'unexpected', message: endpoint } }
    })
    render(<MnemonView connection={{ rpc: { call } } as unknown as ClientConnectionHandle} settingsScope={settingsScope} sessionId="session-1" />)

    await waitFor(() => expect(screen.getByText('已连接 · 目录待同步')).toBeTruthy())
    fireEvent.click(screen.getByRole('button', { name: /记忆体 记忆体目录与实时图谱/ }))
    await waitFor(() => expect(screen.getAllByText('记忆体目录尚未同步').length).toBeGreaterThan(0))
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.queryByText('0 / 0')).toBeNull()
    expect(screen.getByText('2')).toBeTruthy()
  })

  it('renders all product copy in English with Memory Space terminology', async () => {
    const { connection } = createConnection()
    render(<MnemonView connection={connection} settingsScope={settingsScope} sessionId="session-1" t={translateEn} locale="en" />)

    await waitFor(() => expect(screen.getByText('Connected · 1 active')).toBeTruthy())
    fireEvent.click(screen.getByRole('button', { name: /Memory Spaces Directory and live graph/ }))
    expect(screen.getByRole('heading', { name: 'Memory Spaces' })).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Memory Space Directory' })).toBeTruthy()
    expect(screen.getByRole('navigation', { name: 'Mnemon pages' })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Recall Intent-aware retrieval/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Documents Project knowledge and archive/ })).toBeTruthy()
    expect(screen.queryByText('PERSISTENT AGENT MEMORY')).toBeNull()
    expect(screen.queryByText(/Memory Bod(y|ies)/i)).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /Status Runtime and diagnostics/ }))
    expect(screen.getByRole('heading', { name: 'System Status' })).toBeTruthy()
    expect(within(screen.getByRole('region', { name: 'Mnemon runtime status' })).getAllByRole('article')).toHaveLength(4)
    expect(screen.queryByText('Recall worker')).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Subagent Lifecycle' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Memory System Flow' })).toBeNull()
    expect(screen.getAllByText('Memory Spaces').length).toBeGreaterThan(0)
  })
})
