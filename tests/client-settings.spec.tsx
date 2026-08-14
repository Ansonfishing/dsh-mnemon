// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MnemonSettingsCard } from '../src/client/MnemonSettingsCard.tsx'
import { translateEn } from '../src/client/locales.ts'
import type { ClientSettingsScope } from '../src/contracts.ts'
import type { Config, InteractionConfig } from '../src/config.ts'

afterEach(cleanup)

describe('MnemonSettingsCard', () => {
  it('stages settings and writes them through the DSH settings scope', async () => {
    const set = vi.fn(async () => {})
    const unset = vi.fn(async () => {})
    const snapshot = {
      status: 'ready' as const,
      value: { timeoutMs: 10000, defaultRecallLimit: 10, routingGuidance: true, lifecycleEnabled: true, recallMode: 'guided' as const, writebackMode: 'guided' as const, tabEnabled: true, writeEnabled: true },
      base: { timeoutMs: 10000, defaultRecallLimit: 10, routingGuidance: true, lifecycleEnabled: true, recallMode: 'guided' as const, writebackMode: 'guided' as const, tabEnabled: true, writeEnabled: true },
      user: {},
      revision: 0,
      writable: true,
      mode: 'host' as const,
    }
    const scope = {
      snapshot,
      getSnapshot() { return this.snapshot },
      subscribe() { return () => {} },
      set,
      unset,
      setPath: set,
      unsetPath: unset,
    } satisfies ClientSettingsScope<Config> & { snapshot: typeof snapshot }

    render(<MnemonSettingsCard scope={scope} />)
    fireEvent.click(screen.getByRole('radio', { name: /工作区/ }))
    fireEvent.click(screen.getByRole('button', { name: '保存' }))

    await waitFor(() => expect(set).toHaveBeenCalledWith('storageScope', 'workspace'))
    expect(screen.getByText(/\.dsh\/settings.yaml/)).toBeTruthy()
    expect(unset).not.toHaveBeenCalled()
  })

  it('uses the DSH-bound locale in the plugin configuration slot', () => {
    const snapshot = {
      status: 'ready' as const,
      value: { storageScope: 'global' as const },
      base: {},
      user: {},
      revision: 0,
      writable: true,
      mode: 'host' as const,
    }
    const scope = {
      snapshot,
      getSnapshot() { return this.snapshot },
      subscribe() { return () => {} },
      set: vi.fn(async () => {}), setPath: vi.fn(async () => {}), unsetPath: vi.fn(async () => {}),
      unset: vi.fn(async () => {}),
    } satisfies ClientSettingsScope<Config> & { snapshot: typeof snapshot }

    render(<MnemonSettingsCard scope={scope} t={translateEn} />)

    expect(screen.getByRole('radiogroup', { name: 'Mnemon storage scope' })).toBeTruthy()
    fireEvent.click(screen.getByRole('radio', { name: /Workspace/ }))
    expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy()
  })

  it('persists a custom directory before selecting the custom scope', async () => {
    const mutate = vi.fn(async () => {})
    const snapshot = {
      status: 'ready' as const,
      value: { storageScope: 'global' as const },
      base: {},
      user: {},
      revision: 0,
      writable: true,
      mode: 'host' as const,
    }
    const scope = {
      snapshot,
      getSnapshot() { return this.snapshot },
      subscribe() { return () => {} },
      set: vi.fn(async () => {}), setPath: vi.fn(async () => {}), unsetPath: vi.fn(async () => {}),
      unset: vi.fn(async () => {}),
      mutate,
    } satisfies ClientSettingsScope<Config> & { snapshot: typeof snapshot }
    const view = render(<MnemonSettingsCard scope={scope} />)

    fireEvent.click(view.getByRole('radio', { name: /自定义目录/ }))
    fireEvent.change(view.getByLabelText('Mnemon 自定义数据目录'), { target: { value: '/tmp/mnemon-custom' } })
    fireEvent.click(view.getByRole('button', { name: '保存' }))

    await waitFor(() => expect(mutate).toHaveBeenCalledWith([
      { op: 'set', path: ['customPacks'], value: [{ id: 'custom', name: '自定义 Pack', dataDir: '/tmp/mnemon-custom' }] },
      { op: 'set', path: ['customPackId'], value: 'custom' },
      { op: 'set', path: ['dataDir'], value: '/tmp/mnemon-custom' },
      { op: 'set', path: ['storageScope'], value: 'custom' },
    ]))
  })

  it('switches among configured custom Packs through the native dropdown', async () => {
    const mutate = vi.fn(async () => {})
    const snapshot = {
      status: 'ready' as const,
      value: {
        storageScope: 'custom' as const,
        customPackId: 'project',
        dataDir: '/packs/project',
        customPacks: [
          { id: 'project', name: 'Project', dataDir: '/packs/project' },
          { id: 'research', name: 'Research', dataDir: '/packs/research' },
        ],
      },
      base: {}, user: {}, revision: 0, writable: true, mode: 'host' as const,
    }
    const scope = {
      snapshot,
      getSnapshot() { return this.snapshot },
      subscribe() { return () => {} },
      set: vi.fn(async () => {}), unset: vi.fn(async () => {}), setPath: vi.fn(async () => {}), unsetPath: vi.fn(async () => {}), mutate,
    } satisfies ClientSettingsScope<Config> & { snapshot: typeof snapshot }

    render(<MnemonSettingsCard scope={scope} />)
    fireEvent.change(screen.getByLabelText('选择自定义 Mnemon Pack'), { target: { value: 'research' } })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))

    await waitFor(() => expect(mutate).toHaveBeenCalledWith([
      { op: 'set', path: ['customPackId'], value: 'research' },
      { op: 'set', path: ['dataDir'], value: '/packs/research' },
    ]))
  })

  it('connects custom-directory validation to the visible control', () => {
    const snapshot = {
      status: 'ready' as const,
      value: { storageScope: 'global' as const },
      base: {},
      user: {},
      revision: 0,
      writable: true,
      mode: 'host' as const,
    }
    const scope = {
      snapshot,
      getSnapshot() { return this.snapshot },
      subscribe() { return () => {} },
      set: vi.fn(async () => {}), setPath: vi.fn(async () => {}), unsetPath: vi.fn(async () => {}),
      unset: vi.fn(async () => {}),
    } satisfies ClientSettingsScope<Config> & { snapshot: typeof snapshot }

    render(<MnemonSettingsCard scope={scope} />)
    fireEvent.click(screen.getByRole('radio', { name: /自定义目录/ }))

    const directory = screen.getByLabelText('Mnemon 自定义数据目录')
    expect(directory.getAttribute('aria-invalid')).toBe('true')
    expect(directory.getAttribute('aria-describedby')).toContain('mnemon-settings-validation')
    expect(screen.getByRole('alert').textContent).toBe('选择自定义存储时必须填写数据目录。')
  })

  it('uses native disabled semantics for a read-only settings scope', () => {
    const snapshot = {
      status: 'ready' as const,
      value: { storageScope: 'global' as const },
      base: {},
      user: {},
      revision: 0,
      writable: false,
      mode: 'host' as const,
    }
    const scope = {
      snapshot,
      getSnapshot() { return this.snapshot },
      subscribe() { return () => {} },
      set: vi.fn(async () => {}), setPath: vi.fn(async () => {}), unsetPath: vi.fn(async () => {}),
      unset: vi.fn(async () => {}),
    } satisfies ClientSettingsScope<Config> & { snapshot: typeof snapshot }

    render(<MnemonSettingsCard scope={scope} />)

    expect((screen.getByRole('radio', { name: /全局/ }) as HTMLInputElement).disabled).toBe(true)
    expect((screen.getByRole('button', { name: '保存' }) as HTMLButtonElement).disabled).toBe(true)
    expect(screen.getByText('当前部署的插件设置为只读。')).toBeTruthy()
  })

  it('does not present temporary defaults as read-only while settings load', () => {
    const snapshot = {
      status: 'loading' as const,
      writable: false,
      mode: 'host' as const,
    }
    const scope = {
      snapshot,
      getSnapshot() { return this.snapshot },
      subscribe() { return () => {} },
      set: vi.fn(async () => {}), setPath: vi.fn(async () => {}), unsetPath: vi.fn(async () => {}),
      unset: vi.fn(async () => {}),
    } satisfies ClientSettingsScope<Config> & { snapshot: typeof snapshot }

    render(<MnemonSettingsCard scope={scope} />)

    expect(screen.getByRole('status').textContent).toBe('载入中…')
    expect(screen.queryByText('当前部署的插件设置为只读。')).toBeNull()
    expect(screen.queryByRole('radiogroup', { name: 'Mnemon 存储范围' })).toBeNull()
  })

  it('persists live interaction toggles as one atomic mnemon-ui mutation', async () => {
    const interactionMutate = vi.fn(async () => {})
    const coreSnapshot = {
      status: 'ready' as const,
      value: { storageScope: 'global' as const },
      base: {},
      user: {},
      revision: 0,
      writable: true,
      mode: 'host' as const,
    }
    const scope = {
      snapshot: coreSnapshot,
      getSnapshot() { return this.snapshot },
      subscribe() { return () => {} },
      set: vi.fn(async () => {}),
      unset: vi.fn(async () => {}),
      setPath: vi.fn(async () => {}),
      unsetPath: vi.fn(async () => {}),
    } satisfies ClientSettingsScope<Config> & { snapshot: typeof coreSnapshot }
    const interactionSnapshot = {
      status: 'ready' as const,
      value: { toolviews: true, turnBar: true, saveAction: true },
      base: {},
      user: {},
      revision: 0,
      writable: true,
      mode: 'host' as const,
    }
    const interactionScope = {
      snapshot: interactionSnapshot,
      getSnapshot() { return this.snapshot },
      subscribe() { return () => {} },
      set: vi.fn(async () => {}),
      unset: vi.fn(async () => {}),
      setPath: vi.fn(async () => {}),
      unsetPath: vi.fn(async () => {}),
      mutate: interactionMutate,
    } satisfies ClientSettingsScope<InteractionConfig> & { snapshot: typeof interactionSnapshot }

    const view = render(<MnemonSettingsCard scope={scope} interactionScope={interactionScope} />)

    const toolviews = view.getByLabelText('记忆工具卡') as HTMLInputElement
    const turnBar = view.getByLabelText('回合记忆条') as HTMLInputElement
    expect(toolviews.checked).toBe(true)
    expect(turnBar.checked).toBe(true)

    fireEvent.click(toolviews)
    fireEvent.click(turnBar)
    fireEvent.click(view.getByRole('button', { name: '保存' }))

    await waitFor(() => expect(interactionMutate).toHaveBeenCalledWith([
      { op: 'set', path: ['toolviews'], value: false },
      { op: 'set', path: ['turnBar'], value: false },
    ]))
  })

  it('presents interaction toggles unchecked by default (opt-in)', () => {
    const snapshot = {
      status: 'ready' as const,
      value: { storageScope: 'global' as const },
      base: {},
      user: {},
      revision: 0,
      writable: true,
      mode: 'host' as const,
    }
    const scope = {
      snapshot,
      getSnapshot() { return this.snapshot },
      subscribe() { return () => {} },
      set: vi.fn(async () => {}),
      unset: vi.fn(async () => {}),
      setPath: vi.fn(async () => {}),
      unsetPath: vi.fn(async () => {}),
    } satisfies ClientSettingsScope<Config> & { snapshot: typeof snapshot }

    const view = render(<MnemonSettingsCard scope={scope} />)

    expect((view.getByLabelText('记忆工具卡') as HTMLInputElement).checked).toBe(false)
    expect((view.getByLabelText('回合记忆条') as HTMLInputElement).checked).toBe(false)
    expect((view.getByLabelText('存入记忆按钮') as HTMLInputElement).checked).toBe(false)
  })
})
