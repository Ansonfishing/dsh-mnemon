// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ClientConnectionHandle } from '../src/contracts.ts'
import { MnemonSaveAction } from '../src/client/MnemonSaveAction.tsx'
import { MnemonToolView } from '../src/client/MnemonToolviews.tsx'
import { consumeMnemonAnchor, dispatchMnemonAnchor, subscribeMnemonAnchor } from '../src/client/anchor.ts'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const translate = (key: string): string => key

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((onResolve, onReject) => {
    resolve = onResolve
    reject = onReject
  })
  return { promise, resolve, reject }
}

describe('conversation interaction surfaces', () => {
  it('consumes a delivered anchor instead of replaying it after remount', () => {
    const received: string[] = []
    const unsubscribe = subscribeMnemonAnchor('session-a', anchor => received.push(anchor.page))

    dispatchMnemonAnchor({ page: 'documents', sessionId: 'session-a' })

    expect(received).toEqual(['documents'])
    expect(consumeMnemonAnchor('session-a')).toBeNull()
    unsubscribe()
  })

  it('keeps an anchor pending when no matching view is mounted', () => {
    dispatchMnemonAnchor({ page: 'explore', seed: 'sqlite', sessionId: 'session-b' })

    expect(consumeMnemonAnchor('session-b')).toEqual({ page: 'explore', seed: 'sqlite', sessionId: 'session-b' })
    expect(consumeMnemonAnchor('session-b')).toBeNull()
  })

  it('renders expanded tool evidence outside the fixed-height interactive row', () => {
    render(<MnemonToolView
      callId="call-1"
      toolName="mnemon_recall"
      block={{
        kind: 'tool-result',
        call: { argsRaw: JSON.stringify({ query: 'project architecture', limit: 5 }) },
        content: [{ type: 'text', text: JSON.stringify({ results: [{ id: 'memory-1' }] }, null, 2) }],
      }}
      t={translate as never}
    />)

    const row = screen.getByRole('button', { name: /toolview\.recallTitle/ })
    fireEvent.click(row)

    const argumentBlock = screen.getAllByText(/project architecture/)[0]!
    expect(row.contains(argumentBlock)).toBe(false)
    expect(argumentBlock.textContent).toContain('\n')
    expect(screen.queryByRole('button', { name: 'toolview.inspect' })).toBeNull()
  })

  it('prevents a second supervised write while a closed panel still has one in flight', async () => {
    const status = deferred<{ ok: true; value: { writeEnabled: boolean } }>()
    const supervision = deferred<{ ok: true; value: { summary: string; action: string } }>()
    let statusCalls = 0
    const rpcCall = vi.fn(async (_channel: string, endpoint: string) => {
      if (endpoint === 'status') {
        statusCalls += 1
        return statusCalls === 1 ? status.promise : { ok: true as const, value: { writeEnabled: true } }
      }
      if (endpoint === 'assistant-message') return { ok: true as const, value: { messageId: 'message-1', text: 'A durable project decision.' } }
      if (endpoint === 'supervise') return supervision.promise
      throw new Error(`unexpected endpoint: ${endpoint}`)
    })
    const connection = { rpc: { call: rpcCall } } as ClientConnectionHandle

    render(<MnemonSaveAction messageId="message-1" sessionId="session-a" connection={connection} t={translate as never} />)
    fireEvent.click(screen.getByRole('button', { name: 'saveAction.button' }))

    const submit = await screen.findByRole('button', { name: 'saveAction.submit' }) as HTMLButtonElement
    expect(submit.disabled).toBe(true)
    status.resolve({ ok: true, value: { writeEnabled: true } })
    await waitFor(() => expect(submit.disabled).toBe(false))
    fireEvent.click(submit)
    expect(rpcCall.mock.calls.filter(call => call[1] === 'supervise')).toHaveLength(1)
    expect(rpcCall).toHaveBeenCalledWith(expect.anything(), 'supervise', {
      sessionId: 'session-a',
      content: 'A durable project decision.',
      idempotencyKey: 'message-1',
    })

    fireEvent.click(screen.getByRole('button', { name: 'saveAction.close' }))
    fireEvent.click(screen.getByRole('button', { name: 'saveAction.button' }))
    const reopenedSubmit = await screen.findByRole('button', { name: 'saveAction.submitting' }) as HTMLButtonElement
    expect(reopenedSubmit.disabled).toBe(true)
    fireEvent.click(reopenedSubmit)
    expect(rpcCall.mock.calls.filter(call => call[1] === 'supervise')).toHaveLength(1)

    supervision.resolve({ ok: true, value: { summary: 'stored', action: 'remember' } })
    await waitFor(() => expect((screen.getByRole('button', { name: 'saveAction.submit' }) as HTMLButtonElement).disabled).toBe(false))
    expect(screen.queryByText('saveAction.result')).toBeNull()
  })
})
