import { describe, expect, it, vi } from 'vitest'
import { apply, inject } from '../src/client/index.ts'
import { en, zh } from '../src/client/locales.ts'

describe('Mnemon Web client composition', () => {
  it('registers locale dictionaries and exposes a locale-bound conversation tab', () => {
    let active: 'zh' | 'en' = 'zh'
    let slotOptions: Record<string, unknown> | undefined
    const registerLocale = vi.fn(() => () => {})
    const context = {
      connection: { rpc: { call: vi.fn(async () => ({ ok: true, value: { status: 'ready', value: {}, writable: true, mode: 'host' } })) } },
      effect: vi.fn((callback: () => unknown) => callback()),
      locale: {
        register: registerLocale,
        bind: vi.fn(() => (key: keyof typeof zh) => (active === 'zh' ? zh : en)[key]),
      },
      slots: {
        inject: vi.fn((_name: string, factory: () => unknown) => factory()),
        register: vi.fn((options: Record<string, unknown>) => { slotOptions = options; return () => {} }),
      },
    }

    apply(context)

    expect(inject).toEqual(['slots', 'connection', 'locale'])
    expect(registerLocale).toHaveBeenCalledWith('mnemon', { zh, en })
    expect(slotOptions).toMatchObject({ name: 'conversation.view', id: 'mnemon', order: 30, locale: 'mnemon' })
    const label = slotOptions?.label as () => string
    expect(label()).toBe('记忆体')
    active = 'en'
    expect(label()).toBe('Memory')
  })
})
