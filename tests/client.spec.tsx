// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
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
  } satisfies ClientSettingsScope<Config>

  function createConnection(options: { withInactiveBody?: boolean } = {}) {
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
      lifecycle: {
        enabled: true,
        recallMode: 'guided',
        writebackMode: 'guided',
        activeAgents: 1,
        sessionAvailable: true,
        counters: { primes: 1, recallCues: 2, writebackChecks: 1, supervisedRequests: 1, failures: 0 },
        subagents: { recalls: 2, writes: 1, failures: 0 },
        current: {
          sessionId: 'session-1',
          status: 'idle',
          startSource: 'startup',
          primePending: false,
          checkedTurns: 1,
          memoryToolCalls: 2,
          lastPhase: 'writeback',
          lastAt: '2026-08-13T03:00:00.000Z',
        },
      },
    }
    const memory = { id: 'memory-12345678', content: '项目选择 SQLite，因为需要单文件部署。', category: 'decision', importance: 4, tags: ['architecture'], entities: ['SQLite'], color: '#e74c3c', memoryBodyId: body.id, memoryBodyName: body.name, graphId: `${body.id}:memory-12345678` }
    const secondaryMemory = { id: 'preference-1', content: '用户偏好简洁中文回答。', category: 'preference', importance: 4, tags: ['style'], color: '#9b59b6', memoryBodyId: secondaryBody.id, memoryBodyName: secondaryBody.name, graphId: `${secondaryBody.id}:preference-1` }
    const call = vi.fn(async (_channel: string, endpoint: string, payload?: Record<string, unknown>) => {
      const bodies = options.withInactiveBody ? [body, { ...secondaryBody, active: secondaryActive }] : [body]
      if (endpoint === 'status') return { ok: true, value: { ...status, memoryBodies: bodies } }
      if (endpoint === 'bodies') return { ok: true, value: { items: bodies, total: bodies.length, activeCount: bodies.filter(item => item.active).length, directory: '/tmp/mnemon/data', generatedAt: '2026-08-13T03:00:00.000Z' } }
      if (endpoint === 'graph') return {
        ok: true,
        value: {
          nodes: [memory, { id: 'memory-graph-2', content: 'Mnemon 使用四图持久记忆。', category: 'fact', color: '#3498db', memoryBodyId: body.id, memoryBodyName: body.name, graphId: `${body.id}:memory-graph-2` }, ...(secondaryActive ? [secondaryMemory] : [])],
          edges: [{ sourceId: `${body.id}:${memory.id}`, targetId: `${body.id}:memory-graph-2`, label: 'backbone', color: '#aaaaaa', type: 'temporal' }],
          generatedAt: '2026-08-13T03:00:00.000Z',
        },
      }
      if (endpoint === 'list') return { ok: true, value: { items: [memory], total: 1, generatedAt: '2026-08-13T03:00:00.000Z' } }
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
        if (payload?.memoryBodyId === secondaryBody.id) secondaryActive = payload.active as boolean
        return { ok: true, value: { ...(payload?.memoryBodyId === secondaryBody.id ? secondaryBody : body), active: payload?.active as boolean } }
      }
      if (endpoint === 'body-create') return { ok: true, value: { ...body, id: 'new-body', name: String(payload?.name ?? '') } }
      return { ok: false, error: { code: 'unexpected', message: endpoint } }
    })
    return { connection: { rpc: { call } } as unknown as ClientConnectionHandle, call }
  }

  it('shows the live graph and all six Mnemon workspaces', async () => {
    const { connection } = createConnection()
    render(<MnemonView connection={connection} settingsScope={settingsScope} sessionId="session-1" />)
    await waitFor(() => expect(screen.getByText('已连接 · 1 个已激活')).toBeTruthy())
    expect(screen.getByRole('heading', { name: '记忆体总览' })).toBeTruthy()
    expect(screen.getByRole('region', { name: '记忆体目录' })).toBeTruthy()
    expect(screen.getAllByText('项目记忆体').length).toBeGreaterThan(0)
    expect(screen.getByRole('switch', { name: '项目记忆体读取开关' }).getAttribute('aria-checked')).toBe('true')
    expect(screen.getByText('12')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Mnemon', level: 1 })).toBeTruthy()
    expect(screen.queryByText('LLM-supervised 4-graph persistent memory for AI agents.')).toBeNull()
    expect(screen.getByRole('img', { name: 'Mnemon' })).toBeTruthy()
    await waitFor(() => expect(screen.getByRole('img', { name: /Mnemon 实时记忆图谱/ })).toBeTruthy())
    expect(screen.getByRole('button', { name: '记忆体: 项目记忆体' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '实体: SQLite' })).toBeTruthy()
    expect(screen.getByText('1 个空间 · 2 条记忆 · 1 个实体')).toBeTruthy()
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

    fireEvent.click(screen.getByRole('button', { name: /检索 意图增强召回/ }))
    expect(screen.getByRole('heading', { name: '检索记忆' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /实体 关系与上下文/ }))
    expect(screen.getByRole('heading', { name: '实体查阅' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /沉淀 LLM 监督写回/ }))
    expect(screen.getByRole('heading', { name: '沉淀记忆' })).toBeTruthy()
    expect(screen.getByText('记忆子 Agent 会完成什么')).toBeTruthy()
    expect(screen.getByText('人工高级选项')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /内容 浏览与维护/ }))
    expect(screen.getByRole('heading', { name: '记忆内容' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /状态 运行与诊断/ }))
    expect(screen.getByRole('heading', { name: '运行状态' })).toBeTruthy()
    expect(screen.getByText('记忆子 Agent 可用')).toBeTruthy()
    expect(screen.getByRole('heading', { name: '子 Agent 生命周期' })).toBeTruthy()
    expect(screen.getByText('召回处理')).toBeTruthy()
    expect(screen.getByText('/mnemon status')).toBeTruthy()
  })

  it('activates an additional memory space without crashing the live graph', async () => {
    const { connection } = createConnection({ withInactiveBody: true })
    render(<MnemonView connection={connection} settingsScope={settingsScope} sessionId="session-1" />)

    const toggle = await screen.findByRole('switch', { name: '偏好记忆体读取开关' })
    expect(toggle.getAttribute('aria-checked')).toBe('false')
    fireEvent.click(toggle)

    await waitFor(() => expect(screen.getByRole('switch', { name: '偏好记忆体读取开关' }).getAttribute('aria-checked')).toBe('true'))
    expect(screen.getByRole('button', { name: /偏好: 用户偏好简洁中文回答/ })).toBeTruthy()
    expect(screen.getByRole('img', { name: /Mnemon 实时记忆图谱，7 个元素/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: '记忆体: 偏好记忆体' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '实体: DSH' })).toBeTruthy()
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
    expect(screen.getAllByText('记忆体目录尚未同步').length).toBeGreaterThan(0)
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.queryByText('0 / 0')).toBeNull()
    expect(screen.getByText('2')).toBeTruthy()
  })

  it('renders all product copy in English with Memory Space terminology', async () => {
    const { connection } = createConnection()
    render(<MnemonView connection={connection} settingsScope={settingsScope} sessionId="session-1" t={translateEn} />)

    await waitFor(() => expect(screen.getByText('Connected · 1 active')).toBeTruthy())
    expect(screen.getByRole('heading', { name: 'Memory Overview' })).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Memory Space Directory' })).toBeTruthy()
    expect(screen.getByRole('navigation', { name: 'Mnemon pages' })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Recall Intent-aware retrieval/ })).toBeTruthy()
    expect(screen.queryByText('PERSISTENT AGENT MEMORY')).toBeNull()
    expect(screen.queryByText(/Memory Bod(y|ies)/i)).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /Status Runtime and diagnostics/ }))
    expect(screen.getByRole('heading', { name: 'Runtime Status' })).toBeTruthy()
    expect(screen.getByText('Recall worker')).toBeTruthy()
    expect(screen.getAllByText('Memory Spaces').length).toBeGreaterThan(0)
  })
})
