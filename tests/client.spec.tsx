// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { ClientConnectionHandle } from '../src/contracts.ts'
import { MnemonView } from '../src/client/MnemonView.tsx'

describe('MnemonView', () => {
  it('shows the live store overview and all three sub-pages', async () => {
    const connection = {
      rpc: {
        call: vi.fn(async () => ({
          ok: true,
          value: {
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
          },
        })),
      },
    } as unknown as ClientConnectionHandle
    render(<MnemonView connection={connection} />)
    await waitFor(() => expect(screen.getByText('已连接 · project')).toBeTruthy())
    expect(screen.getByText('12')).toBeTruthy()
    expect(screen.getByRole('button', { name: '检索' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '记住' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '配置' })).toBeTruthy()
  })
})
