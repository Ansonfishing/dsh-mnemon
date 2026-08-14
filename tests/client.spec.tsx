// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ClientConnectionHandle } from '../src/contracts.ts'
import type { ClientSettingsScope } from '../src/contracts.ts'
import type { Config } from '../src/config.ts'
import { MnemonView } from '../src/client/MnemonView.tsx'
import { translateEn } from '../src/client/locales.ts'

describe('MnemonView', () => {
  afterEach(cleanup)
  const settingsSnapshot = { status: 'ready' as const, value: {}, base: {}, user: {}, revision: 0, writable: true, mode: 'host' as const }
  const settingsScope = {
    getSnapshot: () => settingsSnapshot,
    subscribe: () => () => {},
    set: async () => {},
    unset: async () => {},
    setPath: async () => {},
    unsetPath: async () => {},
  } satisfies ClientSettingsScope<Config>

  function createConnection(options: { withInactiveBody?: boolean; listCount?: number; longContent?: boolean } = {}) {
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
    }
    const memory = { id: 'memory-12345678', content: options.longContent === true ? '这是一段非常长的记忆内容，用于验证图谱检查器对超长文本的截断展示，以及全文预览窗口的打开与关闭。'.repeat(6) : '项目选择 SQLite，因为需要单文件部署。', category: 'decision', importance: 4, tags: ['architecture'], entities: ['SQLite'], color: '#e74c3c', memoryBodyId: body.id, memoryBodyName: body.name, graphId: `${body.id}:memory-12345678` }
    const secondaryMemory = { id: 'preference-1', content: '用户偏好简洁中文回答。', category: 'preference', importance: 4, tags: ['style'], entities: ['DSH'], color: '#9b59b6', memoryBodyId: secondaryBody.id, memoryBodyName: secondaryBody.name, graphId: `${secondaryBody.id}:preference-1` }
    let runtimeEntries = [{ content: '用户偏好简洁中文回答。', created_at: '2026-08-13T02:00:00.000Z', updated_at: '2026-08-13T02:00:00.000Z', target: 'user', importance: 'critical' }]
    let documents = [{
      id: 'document-12345678', title: '发布验证清单', description: '发布前的完整验证路径。', status: 'active', filename: 'release-document-1234.md',
      relativePath: '.mnemon/documents/active/release-document-1234.md', sourcePaths: ['package.json'], sessionIds: ['session-1'],
      createdAt: '2026-08-13T02:00:00.000Z', updatedAt: '2026-08-13T02:00:00.000Z', lastAccessedAt: '2026-08-13T02:00:00.000Z',
      revision: 1, contentHash: 'a'.repeat(64), sizeBytes: 640, memoryBodyIds: [] as string[], healthy: true, excerpt: '发布前运行 typecheck、单元测试与真实 WebUI E2E。',
      content: '# 发布验证\n\n发布前运行 **typecheck**、单元测试与真实 WebUI E2E。\n\n- 检查构建产物\n- 检查真实页面\n\n[架构说明](https://example.com/architecture)\n\n[不安全链接](javascript:alert(1))',
    }]
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
      if (endpoint === 'entities') return { ok: true, value: { items: [{ entity: 'SQLite', count: 2 }], insights: [] } }
      if (endpoint === 'search') return {
        ok: true,
        value: {
          query: 'SQLite',
          mode: 'smart',
          results: [memory],
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
    expect(screen.getByText('记忆子 Agent 可用')).toBeTruthy()
    expect(screen.getByRole('heading', { name: '子 Agent 生命周期' })).toBeTruthy()
    expect(screen.getByText('召回处理')).toBeTruthy()
    expect(screen.getByRole('heading', { name: '记忆系统流转' })).toBeTruthy()
    expect(screen.getByRole('img', { name: /^记忆系统流转/ })).toBeTruthy()
    expect(screen.getByRole('heading', { name: '存储域' })).toBeTruthy()
    expect(screen.getByText('/tmp/mnemon')).toBeTruthy()
  })

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
    expect(call).toHaveBeenCalledWith(expect.anything(), 'body-update', { memoryBodyId: 'project', name: '项目决策空间', description: '存放架构与交付决策。' })
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
    render(<MnemonView connection={connection} settingsScope={settingsScope} sessionId="session-1" />)

    await waitFor(() => expect(screen.getByText('已连接 · 1 个已激活')).toBeTruthy())
    const canvas = screen.getByTestId('mnemon-canvas')
    canvas.scrollTop = 900
    fireEvent.click(screen.getByRole('button', { name: /运行时 热记忆与上下文/ }))
    expect(canvas.scrollTop).toBe(0)
    canvas.scrollTop = 900
    fireEvent.click(screen.getByRole('button', { name: /记忆体 记忆体目录与实时图谱/ }))
    expect(canvas.scrollTop).toBe(0)
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
    render(<MnemonView connection={connection} settingsScope={settingsScope} sessionId="session-1" t={translateEn} />)

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
    expect(screen.getByText('Recall worker')).toBeTruthy()
    expect(screen.getAllByText('Memory Spaces').length).toBeGreaterThan(0)
  })
})
