import { describe, expect, it, vi } from 'vitest'
import { apply, inject } from '../src/client/index.ts'
import { en, zh } from '../src/client/locales.ts'

describe('Mnemon Web client composition', () => {
  it('registers locale dictionaries and exposes a locale-bound conversation tab', async () => {
    let active: 'zh' | 'en' = 'zh'
    const slots: Record<string, unknown>[] = []
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
        register: vi.fn((options: Record<string, unknown>) => { slots.push(options); return () => {} }),
      },
    }

    apply(context)

    expect(inject).toEqual(['slots', 'connection', 'locale'])
    expect(registerLocale).toHaveBeenCalledWith('mnemon', { zh, en })
    const slotOptions = slots.find(options => options.name === 'conversation.view')
    expect(slotOptions).toMatchObject({ name: 'conversation.view', id: 'mnemon', order: 30, locale: 'mnemon' })
    expect(slots).toEqual(expect.arrayContaining([expect.objectContaining({ name: 'settings.section', id: 'mnemon', order: 20 })]))
    const settingsEntry = slots.find(options => options.name === 'settings.section')
    const settingsInject = settingsEntry?.inject as (() => { t: (key: keyof typeof zh) => string }) | undefined
    expect(settingsInject?.().t('config.scope')).toBe('存储范围')
    const label = slotOptions?.label as () => string
    expect(label()).toBe('记忆系统')
    active = 'en'
    expect(label()).toBe('Memory System')
    expect((settingsEntry?.label as () => string)()).toBe('Memory System')
    expect(settingsInject?.().t('config.scope')).toBe('Storage scope')
  })
})
