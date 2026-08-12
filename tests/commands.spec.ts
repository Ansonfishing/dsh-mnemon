import { describe, expect, it, vi } from 'vitest'
import { createMnemonCommand } from '../src/commands.ts'
import type { MnemonService } from '../src/service.ts'

function invocation(rawInput: string) {
  return { rawInput, signal: new AbortController().signal }
}

describe('/mnemon command', () => {
  it('renders status without involving the model', async () => {
    const service = {
      config: { writeEnabled: true, defaultRecallLimit: 10 },
      status: vi.fn(async () => ({
        healthy: true,
        version: '0.1.2',
        cliPath: '/usr/local/bin/mnemon',
        dataDir: '/tmp/mnemon',
        store: 'project',
        writeEnabled: true,
        defaultRecallLimit: 10,
        stats: { totalInsights: 3, edgeCount: 2, deletedInsights: 1 },
      })),
    } as unknown as MnemonService
    const result = await createMnemonCommand(service).handler(invocation('status'))
    expect(result).toEqual(expect.objectContaining({ kind: 'success', text: expect.stringContaining('store=project') }))
    expect(service.status).toHaveBeenCalledOnce()
  })

  it('runs a bounded recall and includes full ids', async () => {
    const service = {
      config: { writeEnabled: true, defaultRecallLimit: 20 },
      search: vi.fn(async () => ({ results: [{ id: 'memory-full-id', content: '选择 SQLite 以便本地优先', score: 0.8 }] })),
    } as unknown as MnemonService
    const result = await createMnemonCommand(service).handler(invocation('recall 为什么使用 SQLite'))
    expect(service.search).toHaveBeenCalledWith({ query: '为什么使用 SQLite', limit: 10 }, expect.any(AbortSignal))
    expect(result).toEqual(expect.objectContaining({ kind: 'success', text: expect.stringContaining('memory-full-id') }))
  })

  it('rejects mutation subcommands in read-only mode', async () => {
    const remember = vi.fn()
    const service = { config: { writeEnabled: false, defaultRecallLimit: 10 }, remember } as unknown as MnemonService
    const result = await createMnemonCommand(service).handler(invocation('remember 永久记住这条'))
    expect(result).toEqual({ kind: 'error', text: 'Mnemon 当前为只读模式，不能写入记忆。' })
    expect(remember).not.toHaveBeenCalled()
  })

  it('returns the nested Mnemon insight id after writeback', async () => {
    const service = {
      config: { writeEnabled: true, defaultRecallLimit: 10 },
      remember: vi.fn(async () => ({ action: 'added', insight: { id: 'new-memory-id' } })),
    } as unknown as MnemonService
    const result = await createMnemonCommand(service).handler(invocation('remember 一条稳定记忆'))
    expect(result).toEqual({ kind: 'success', text: 'Mnemon 已处理：added · ID new-memory-id' })
  })
})
