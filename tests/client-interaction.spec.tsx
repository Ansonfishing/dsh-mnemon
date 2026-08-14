// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { waitFor } from '@testing-library/react'
import { apply } from '../src/client/index.ts'
import { selectMnemonTurnTail } from '../src/client/MnemonTurnTail.tsx'

interface SlotOptions {
  name: string
  key?: string
  id?: string
  select?: unknown
  order?: number
  priority?: number
  label?: unknown
  locale?: string
  children?: Record<string, unknown>
  inject?: (...args: unknown[]) => Record<string, unknown>
}

function makeCtx(initialValue: unknown) {
  const injects: string[] = []
  /** Registrations that have not been disposed yet. */
  let active: string[] = []
  const effects: Array<() => unknown> = []
  const registeredOptions: SlotOptions[] = []
  let uiValue = initialValue as Record<string, unknown>
  let revision = 1

  const ctx = {
    slots: {
      inject: (slot: string, factory: () => unknown) => {
        injects.push(slot)
        let dispose: (() => void) | undefined
        dispose = factory() as (() => void) | undefined
        const disposer = () => { dispose?.(); dispose = undefined }
        injectDisposers.set(slot, disposer)
        return disposer
      },
      register: (options: SlotOptions) => {
        registeredOptions.push(options)
        const key = options.key ?? options.id ?? options.name
        active.push(key)
        return () => { active = active.filter(candidate => candidate !== key) }
      },
    },
    connection: {
      rpc: {
        call: vi.fn(async (channel: string, endpoint: string, rawPayload: unknown) => {
          if (channel === '/dsh-mnemon-settings') {
            const payload = rawPayload as { namespace?: string; ops?: Array<{ op: string; path: string[]; value?: unknown }> }
            const namespace = payload.namespace
            if (endpoint === 'mutate' && namespace === 'mnemon-ui') {
              for (const op of payload.ops ?? []) {
                if (op.op === 'set') uiValue = { ...uiValue, [op.path[0]!]: op.value }
                else {
                  uiValue = { ...uiValue }
                  delete uiValue[op.path[0]!]
                }
              }
              revision += 1
            }
            return { ok: true, value: { status: 'ready', value: namespace === 'mnemon-ui' ? uiValue : {}, base: {}, user: namespace === 'mnemon-ui' ? uiValue : {}, revision, writable: true, mode: 'host' } }
          }
          return { ok: false, error: { code: 'internal', message: 'unexpected', details: {} } }
        }),
      },
    },
    locale: {
      register: vi.fn(() => () => {}),
      bind: vi.fn(() => (key: string) => key),
    },
    effect: vi.fn((callback: () => unknown) => {
      const dispose = callback()
      effects.push(callback)
      if (typeof dispose === 'function') effectDisposers.push(dispose as () => void)
      return () => {}
    }),
  }

  const injectDisposers = new Map<string, () => void>()
  const effectDisposers: Array<() => void> = []
  const activeRegistrations = () => active
  return { ctx, injects, injectDisposers, registeredOptions, activeRegistrations, effectDisposers }
}

const TOOLVIEW_KEYS = ['mnemon_memory_bodies', 'mnemon_recall', 'mnemon_related', 'mnemon_status', 'mnemon_document_search', 'mnemon_document_manage', 'mnemon_runtime_memory', 'mnemon_remember', 'mnemon_link', 'mnemon_forget', 'mnemon_memory_body_create', 'mnemon_memory_body_update', 'mnemon_memory_body_merge']

describe('interaction surfaces binding', () => {
  afterEach(() => { vi.restoreAllMocks() })

  it('declines an unsettled turn with the DSH chain-slot null sentinel', () => {
    const owner = (status: string) => ({ turn: { status }, seq: 1, openFile: vi.fn() })
    expect(selectMnemonTurnTail(owner('open') as never)).toBeNull()
    expect(selectMnemonTurnTail(owner('closed') as never)).toEqual({})
  })

  it('registers no interaction surface by default (opt-in off)', async () => {
    const { ctx, injects, activeRegistrations } = makeCtx({})
    apply(ctx)
    // conversation.view and the dedicated settings section always register; the
    // interaction surfaces must not until settings explicitly enable them.
    expect(injects).toEqual(expect.arrayContaining(['conversation.view', 'settings.section']))
    await waitFor(() => {
      expect(activeRegistrations()).not.toEqual(expect.arrayContaining(TOOLVIEW_KEYS))
    })
    expect(activeRegistrations()).not.toContain('conversation.chat.turnTail')
    expect(activeRegistrations()).not.toContain('mnemon-save')
  })

  it('registers explicitly enabled surfaces after settings load', async () => {
    const { ctx, activeRegistrations } = makeCtx({ toolviews: true, turnBar: true, saveAction: true })
    apply(ctx)
    await waitFor(() => {
      expect(activeRegistrations()).toEqual(expect.arrayContaining(TOOLVIEW_KEYS))
    })
    expect(activeRegistrations()).toEqual(expect.arrayContaining(['conversation.chat.turnTail', 'mnemon-save']))
  })

  it('registers only the enabled surfaces when toggles are mixed', async () => {
    const { ctx, activeRegistrations } = makeCtx({ toolviews: true, turnBar: false, saveAction: true })
    apply(ctx)
    await waitFor(() => {
      expect(activeRegistrations()).toEqual(expect.arrayContaining(TOOLVIEW_KEYS))
    })
    expect(activeRegistrations()).toEqual(expect.arrayContaining(['mnemon-save']))
    expect(activeRegistrations()).not.toContain('conversation.chat.turnTail')
  })

  it('registers and disposes interaction surfaces when mnemon-ui changes live', async () => {
    const { ctx, registeredOptions, activeRegistrations } = makeCtx({})
    apply(ctx)
    await waitFor(() => expect(registeredOptions.some(options => options.name === 'settings.section')).toBe(true))
    const settingsEntry = registeredOptions.find(options => options.name === 'settings.section')
    const injected = settingsEntry?.inject?.() as { interactionScope?: { mutate: (ops: unknown[]) => Promise<void> } } | undefined
    if (injected?.interactionScope === undefined) throw new Error('mnemon-ui settings scope was not injected')

    await injected.interactionScope.mutate([{ op: 'set', path: ['turnBar'], value: true }])
    await waitFor(() => expect(activeRegistrations()).toContain('conversation.chat.turnTail'))

    await injected.interactionScope.mutate([{ op: 'set', path: ['turnBar'], value: false }])
    await waitFor(() => expect(activeRegistrations()).not.toContain('conversation.chat.turnTail'))
  })
})
