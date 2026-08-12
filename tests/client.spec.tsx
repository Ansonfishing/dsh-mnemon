// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { ClientConnectionHandle } from '../src/contracts.ts'
import { MnemonView } from '../src/client/MnemonView.tsx'

describe('MnemonView', () => {
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
    }
    const call = vi.fn(async (_channel: string, endpoint: string) => {
      if (endpoint === 'status') return { ok: true, value: status }
      if (endpoint === 'search') return {
        ok: true,
        value: {
          query: 'SQLite',
          mode: 'smart',
          results: [{ id: 'memory-12345678', content: '项目选择 SQLite，因为需要单文件部署。', category: 'decision', importance: 4, tags: ['architecture'] }],
        },
      }
      if (endpoint === 'related') return { ok: true, value: [] }
      if (endpoint === 'forget') return { ok: true, value: { action: 'forgotten' } }
      return { ok: false, error: { code: 'unexpected', message: endpoint } }
    })
    return { connection: { rpc: { call } } as unknown as ClientConnectionHandle, call }
  }

  it('shows the live store overview and the sidebar workspaces', async () => {
    const { connection } = createConnection()
    render(<MnemonView connection={connection} />)
    await waitFor(() => expect(screen.getByText('已连接 · project')).toBeTruthy())
    expect(screen.getByText('12')).toBeTruthy()
    expect(screen.getByRole('button', { name: /检索记忆/ })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /沉淀记忆/ }))
    expect(screen.getByRole('heading', { name: '沉淀记忆' })).toBeTruthy()
    expect(screen.getByText('写入前快速判断')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /运行状态/ }))
    expect(screen.getByRole('heading', { name: '运行状态' })).toBeTruthy()
    expect(screen.getByText('/mnemon status')).toBeTruthy()
    expect(screen.getByText('~/.dsh/settings.yaml → mnemon')).toBeTruthy()
  })

  it('requires inline confirmation before forgetting a recalled memory', async () => {
    const { connection, call } = createConnection()
    render(<MnemonView connection={connection} />)
    await waitFor(() => expect(screen.getByText('已连接 · project')).toBeTruthy())

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
})
