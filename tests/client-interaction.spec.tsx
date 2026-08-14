// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { waitFor } from '@testing-library/react'
import { apply } from '../src/client/index.ts'

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
        const key = options.key ?? options.id ?? options.name
        active.push(key)
        return () => { active = active.filter(candidate => candidate !== key) }
      },
    },
    connection: {
      rpc: {
        call: vi.fn(async (channel: string, endpoint: string) => {
          if (channel === '/dsh-mnemon-settings' && endpoint === 'get') {
            return { ok: true, value: { status: 'ready', value: initialValue, base: {}, user: {}, revision: 1, writable: true, mode: 'host' } }
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
  return { ctx, injects, injectDisposers, activeRegistrations, effectDisposers }
}

const TOOLVIEW_KEYS = ['mnemon_memory_bodies', 'mnemon_recall', 'mnemon_related', 'mnemon_status', 'mnemon_document_search', 'mnemon_document_manage', 'mnemon_runtime_memory', 'mnemon_remember', 'mnemon_link', 'mnemon_forget', 'mnemon_memory_body_create', 'mnemon_memory_body_update', 'mnemon_memory_body_merge']

describe('interaction surfaces binding', () => {
  afterEach(() => { vi.restoreAllMocks() })

  it('registers no interaction surface by default (opt-in off)', async () => {
    const { ctx, injects, activeRegistrations } = makeCtx({})
    apply(ctx)
    // conversation.view and settings.plugin.item always register; the
    // interaction surfaces must not until settings explicitly enable them.
    expect(injects).toEqual(expect.arrayContaining(['conversation.view', 'settings.plugin.item']))
    await waitFor(() => {
      expect(activeRegistrations()).not.toEqual(expect.arrayContaining(TOOLVIEW_KEYS))
    })
    expect(activeRegistrations()).not.toContain('conversation.chat.turnTail')
    expect(activeRegistrations()).not.toContain('mnemon-save')
  })

  it('registers explicitly enabled surfaces after settings load', async () => {
    const { ctx, activeRegistrations } = makeCtx({
      conversationInteraction: { toolviews: true, turnBar: true, saveAction: true },
    })
    apply(ctx)
    await waitFor(() => {
      expect(activeRegistrations()).toEqual(expect.arrayContaining(TOOLVIEW_KEYS))
    })
    expect(activeRegistrations()).toEqual(expect.arrayContaining(['conversation.chat.turnTail', 'mnemon-save']))
  })

  it('registers only the enabled surfaces when toggles are mixed', async () => {
    const { ctx, activeRegistrations } = makeCtx({
      conversationInteraction: { toolviews: true, turnBar: false, saveAction: true },
    })
    apply(ctx)
    await waitFor(() => {
      expect(activeRegistrations()).toEqual(expect.arrayContaining(TOOLVIEW_KEYS))
    })
    expect(activeRegistrations()).toEqual(expect.arrayContaining(['mnemon-save']))
    expect(activeRegistrations()).not.toContain('conversation.chat.turnTail')
  })
})
