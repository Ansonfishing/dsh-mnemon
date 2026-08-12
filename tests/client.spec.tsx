// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ClientConnectionHandle } from '../src/contracts.ts'
import type { ClientSettingsScope } from '../src/contracts.ts'
import type { Config } from '../src/config.ts'
import { MnemonView } from '../src/client/MnemonView.tsx'

describe('MnemonView', () => {
  afterEach(cleanup)
  const settingsSnapshot = { status: 'ready' as const, value: {}, base: {}, user: {}, revision: 0, writable: true, mode: 'host' as const }
  const settingsScope = {
    getSnapshot: () => settingsSnapshot,
    subscribe: () => () => {},
    set: async () => {},
    unset: async () => {},
  } satisfies ClientSettingsScope<Config>

  function createConnection() {
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
      stats: { totalInsights: 12, deletedInsights: 0, edgeCount: 9, oplogCount: 20, dbSizeBytes: 4096, byCategory: {}, topEntities: [] },
      lifecycle: {
        enabled: true,
        recallMode: 'guided',
        writebackMode: 'guided',
        activeAgents: 1,
        sessionAvailable: true,
        counters: { primes: 1, recallCues: 2, writebackChecks: 1, supervisedRequests: 1, failures: 0 },
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
    const memory = { id: 'memory-12345678', content: '项目选择 SQLite，因为需要单文件部署。', category: 'decision', importance: 4, tags: ['architecture'], color: '#e74c3c' }
    const call = vi.fn(async (_channel: string, endpoint: string) => {
      if (endpoint === 'status') return { ok: true, value: status }
      if (endpoint === 'graph') return {
        ok: true,
        value: {
          nodes: [memory, { id: 'memory-graph-2', content: 'Mnemon 使用四图持久记忆。', category: 'fact', color: '#3498db' }],
          edges: [{ sourceId: memory.id, targetId: 'memory-graph-2', label: 'backbone', color: '#aaaaaa', type: 'temporal' }],
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
      if (endpoint === 'related') return { ok: true, value: [] }
      if (endpoint === 'supervise') return { ok: true, value: { queued: true, sessionId: 'session-1', messageId: 'message-1', agentStatus: 'idle' } }
      if (endpoint === 'remember') return { ok: true, value: { action: 'added' } }
      if (endpoint === 'forget') return { ok: true, value: { action: 'forgotten' } }
      return { ok: false, error: { code: 'unexpected', message: endpoint } }
    })
    return { connection: { rpc: { call } } as unknown as ClientConnectionHandle, call }
  }

  it('shows the live graph and all six Mnemon workspaces', async () => {
    const { connection } = createConnection()
    render(<MnemonView connection={connection} settingsScope={settingsScope} sessionId="session-1" />)
    await waitFor(() => expect(screen.getByText('已连接 · project')).toBeTruthy())
    expect(screen.getByText('12')).toBeTruthy()
    expect(screen.getByText('LLM-supervised 4-graph persistent memory for AI agents.')).toBeTruthy()
    expect(screen.getByRole('img', { name: 'Mnemon' })).toBeTruthy()
    await waitFor(() => expect(screen.getByRole('img', { name: /Mnemon 实时记忆图谱/ })).toBeTruthy())
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
    expect(screen.getByText('模型会完成什么')).toBeTruthy()
    expect(screen.getByText('人工高级写入')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /记忆库 浏览与维护/ }))
    expect(screen.getByRole('heading', { name: '记忆库' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /状态 配置与诊断/ }))
    expect(screen.getByRole('heading', { name: '状态与配置' })).toBeTruthy()
    expect(screen.getByText('生命周期编排已启用')).toBeTruthy()
    expect(screen.getByRole('heading', { name: '记忆生命周期' })).toBeTruthy()
    expect(screen.getByText('Recall Gate')).toBeTruthy()
    expect(screen.getByText('当前会话已绑定')).toBeTruthy()
    expect(screen.getByText('/mnemon status')).toBeTruthy()
    expect(screen.getAllByText(/\.dsh\/settings.yaml/)).toHaveLength(2)
  })

  it('requires inline confirmation before forgetting a recalled memory', async () => {
    const { connection, call } = createConnection()
    render(<MnemonView connection={connection} settingsScope={settingsScope} sessionId="session-1" />)
    await waitFor(() => expect(screen.getByText('已连接 · project')).toBeTruthy())

    fireEvent.click(screen.getByRole('button', { name: /检索 意图增强召回/ }))
    fireEvent.change(screen.getByRole('textbox', { name: '记忆查询' }), { target: { value: 'SQLite' } })
    fireEvent.click(screen.getByRole('button', { name: '开始召回' }))
    await waitFor(() => expect(screen.getByText('项目选择 SQLite，因为需要单文件部署。')).toBeTruthy())

    fireEvent.click(screen.getByRole('button', { name: '忘记' }))
    expect(screen.getByRole('group', { name: '确认忘记记忆' })).toBeTruthy()
    expect(call).not.toHaveBeenCalledWith(expect.anything(), 'forget', expect.anything())

    fireEvent.click(screen.getByRole('button', { name: '确认忘记' }))
    await waitFor(() => expect(screen.queryByText('项目选择 SQLite，因为需要单文件部署。')).toBeNull())
    expect(call).toHaveBeenCalledWith(expect.anything(), 'forget', { id: 'memory-12345678' })
  })

  it('queues the default writeback path through the live DSH model', async () => {
    const { connection, call } = createConnection()
    render(<MnemonView connection={connection} settingsScope={settingsScope} sessionId="session-1" />)
    await waitFor(() => expect(screen.getByText('已连接 · project')).toBeTruthy())

    fireEvent.click(screen.getByRole('button', { name: /沉淀 LLM 监督写回/ }))
    fireEvent.change(screen.getByRole('textbox', { name: '待沉淀内容' }), { target: { value: '项目发布前必须通过真实 WebUI 验证。' } })
    fireEvent.click(screen.getByRole('button', { name: '交给当前 LLM 判断并沉淀' }))

    await waitFor(() => expect(screen.getByText(/已交给当前对话的 LLM/)).toBeTruthy())
    expect(call).toHaveBeenCalledWith(expect.anything(), 'supervise', {
      sessionId: 'session-1',
      content: '项目发布前必须通过真实 WebUI 验证。',
    })
    expect(call).not.toHaveBeenCalledWith(expect.anything(), 'remember', expect.anything())
  })
})
