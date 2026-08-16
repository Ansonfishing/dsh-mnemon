// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MnemonSettingsCard } from '../src/client/MnemonSettingsCard.tsx'
import { translateEn } from '../src/client/locales.ts'
import type { ClientConnectionHandle, ClientSettingsScope } from '../src/contracts.ts'
import type { Config, InteractionConfig } from '../src/config.ts'

afterEach(cleanup)

describe('MnemonSettingsCard', () => {
  it('defaults to sidebar and persists a buildin display-mode selection', async () => {
    const mutate = vi.fn(async () => {})
    const snapshot = {
      status: 'ready' as const,
      value: { storageScope: 'global' as const },
      base: {}, user: {}, revision: 0, writable: true, mode: 'host' as const,
    }
    const scope = {
      snapshot,
      getSnapshot() { return this.snapshot },
      subscribe() { return () => {} },
      set: vi.fn(async () => {}), unset: vi.fn(async () => {}), setPath: vi.fn(async () => {}), unsetPath: vi.fn(async () => {}),
      mutate,
    } satisfies ClientSettingsScope<Config> & { snapshot: typeof snapshot }

    render(<MnemonSettingsCard scope={scope} />)

    expect((screen.getByRole('radio', { name: 'Sidebar' }) as HTMLInputElement).checked).toBe(true)
    fireEvent.click(screen.getByRole('radio', { name: 'Buildin' }))
    fireEvent.click(screen.getByRole('button', { name: '保存' }))

    await waitFor(() => expect(mutate).toHaveBeenCalledWith([
      { op: 'set', path: ['displayMode'], value: 'buildin' },
    ]))
  })

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
    expect(screen.getByText('已保存并实时生效')).toBeTruthy()
    expect(screen.queryByRole('button', { name: '恢复默认' })).toBeNull()
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

    expect(screen.getByRole('radiogroup', { name: 'Memory system scope' })).toBeTruthy()
    fireEvent.click(screen.getByRole('radio', { name: /Workspace/ }))
    expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy()
  })

  it('accepts and persists a manually entered custom directory', async () => {
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

    fireEvent.click(view.getByRole('radio', { name: '自定义' }))
    fireEvent.change(view.getByRole('textbox', { name: 'Mnemon 自定义数据目录' }), { target: { value: '  /tmp/mnemon-custom  ' } })
    fireEvent.click(view.getByRole('button', { name: '保存' }))

    await waitFor(() => expect(mutate).toHaveBeenCalledWith([
      { op: 'set', path: ['storageScope'], value: 'custom' },
      { op: 'set', path: ['dataDir'], value: '/tmp/mnemon-custom' },
    ]))
  })

  it('migrates a legacy named Pack to the single selected directory', async () => {
    const mutate = vi.fn(async () => {})
    const snapshot = {
      status: 'ready' as const,
      value: {
        storageScope: 'custom' as const,
        customPackId: 'project',
        customPacks: [
          { id: 'project', name: 'Project', dataDir: '/packs/project' },
          { id: 'research', name: 'Research', dataDir: '/packs/research' },
        ],
      },
      base: {},
      user: {
        storageScope: 'custom' as const,
        customPackId: 'project',
        customPacks: [
          { id: 'project', name: 'Project', dataDir: '/packs/project' },
          { id: 'research', name: 'Research', dataDir: '/packs/research' },
        ],
      },
      revision: 0, writable: true, mode: 'host' as const,
    }
    const scope = {
      snapshot,
      getSnapshot() { return this.snapshot },
      subscribe() { return () => {} },
      set: vi.fn(async () => {}), unset: vi.fn(async () => {}), setPath: vi.fn(async () => {}), unsetPath: vi.fn(async () => {}), mutate,
    } satisfies ClientSettingsScope<Config> & { snapshot: typeof snapshot }

    render(<MnemonSettingsCard scope={scope} />)
    const directory = screen.getByRole('textbox', { name: 'Mnemon 自定义数据目录' }) as HTMLInputElement
    expect(directory.value).toBe('/packs/project')
    fireEvent.change(directory, { target: { value: '/packs/research' } })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))

    await waitFor(() => expect(mutate).toHaveBeenCalledWith([
      { op: 'set', path: ['dataDir'], value: '/packs/research' },
      { op: 'unset', path: ['customPackId'] },
      { op: 'unset', path: ['customPacks'] },
    ]))
  })

  it('keeps custom storage invalid until a directory is entered', () => {
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
    fireEvent.click(screen.getByRole('radio', { name: '自定义' }))

    expect((screen.getByRole('textbox', { name: 'Mnemon 自定义数据目录' }) as HTMLInputElement).value).toBe('')
    expect(screen.getByRole('alert').textContent).toBe('选择自定义存储时必须填写数据目录。')
    expect((screen.getByRole('button', { name: '保存' }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('accepts Windows drive and UNC paths in the browser form', () => {
    const snapshot = {
      status: 'ready' as const,
      value: { storageScope: 'global' as const },
      base: {}, user: {}, revision: 0, writable: true, mode: 'host' as const,
    }
    const scope = {
      snapshot,
      getSnapshot() { return this.snapshot },
      subscribe() { return () => {} },
      set: vi.fn(async () => {}), unset: vi.fn(async () => {}), setPath: vi.fn(async () => {}), unsetPath: vi.fn(async () => {}),
    } satisfies ClientSettingsScope<Config> & { snapshot: typeof snapshot }

    render(<MnemonSettingsCard scope={scope} />)
    fireEvent.click(screen.getByRole('radio', { name: '自定义' }))
    const directory = screen.getByRole('textbox', { name: 'Mnemon 自定义数据目录' })
    fireEvent.change(directory, { target: { value: 'relative/mnemon' } })
    expect(screen.getByRole('alert').textContent).toContain('绝对路径')
    fireEvent.change(directory, { target: { value: 'C:\\memory\\mnemon' } })
    expect(screen.queryByRole('alert')).toBeNull()
    fireEvent.change(directory, { target: { value: '\\\\server\\share\\mnemon' } })
    expect(screen.queryByRole('alert')).toBeNull()
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
    expect(screen.queryByRole('radiogroup', { name: '记忆系统范围' })).toBeNull()
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
      value: { turnBar: true, saveAction: true },
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

    const turnBar = view.getByLabelText('回合记忆条') as HTMLInputElement
    expect(turnBar.checked).toBe(true)
    expect(view.queryByLabelText('记忆工具卡')).toBeNull()

    fireEvent.click(turnBar)
    fireEvent.click(view.getByRole('button', { name: '保存' }))

    await waitFor(() => expect(interactionMutate).toHaveBeenCalledWith([
      { op: 'set', path: ['turnBar'], value: false },
    ]))
  })

  it('presents the two remaining interaction toggles checked by default', () => {
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

    expect(view.queryByLabelText('记忆工具卡')).toBeNull()
    expect((view.getByLabelText('回合记忆条') as HTMLInputElement).checked).toBe(true)
    expect((view.getByLabelText('存入记忆按钮') as HTMLInputElement).checked).toBe(true)
  })

  it('edits a reusable provider service without creating a Memory Space', async () => {
    const snapshot = {
      status: 'ready' as const,
      value: { storageScope: 'workspace' as const },
      base: {}, user: {}, revision: 0, writable: true, mode: 'host' as const,
    }
    const scope = {
      snapshot,
      getSnapshot() { return this.snapshot },
      subscribe() { return () => {} },
      set: vi.fn(async () => {}), unset: vi.fn(async () => {}), setPath: vi.fn(async () => {}), unsetPath: vi.fn(async () => {}),
    } satisfies ClientSettingsScope<Config> & { snapshot: typeof snapshot }
    const provider = {
      id: 'openviking' as const,
      label: 'OpenViking', kind: 'remote' as const, origin: 'third-party' as const, summary: 'Shared memory',
      workspaceBinding: 'provider-global' as const,
      capabilities: { search: true, browse: true, graph: false, entities: false, related: false, remember: true, link: false, forget: true, writeMode: 'async-extracting' as const, deletionMode: 'hard' as const },
      fields: [
        { key: 'endpoint', label: 'Endpoint', scope: 'service' as const, input: 'url' as const, required: true, defaultValue: 'http://127.0.0.1:1933' },
        { key: 'apiKey', label: 'API key', scope: 'service' as const, input: 'secret' as const, required: false },
        { key: 'targetUri', label: 'Memory URI', scope: 'memory' as const, input: 'text' as const, required: true, defaultValue: 'viking://user/memories' },
      ],
    }
    const call = vi.fn(async (channel: string, endpoint: string) => {
      if (channel === '/dsh-mnemon-read' && endpoint === 'provider-services') return { ok: true as const, value: { providers: [provider], items: [{ providerId: 'openviking', enabled: true, configured: true, settings: { endpoint: 'http://127.0.0.1:1933' }, configuredSecrets: ['apiKey'] }], generatedAt: '2026-08-17T00:00:00.000Z' } }
      if (channel === '/dsh-mnemon-write' && endpoint === 'provider-service-update') return { ok: true as const, value: { providerId: 'openviking', enabled: true, configured: true, settings: { endpoint: 'http://127.0.0.1:1933' }, configuredSecrets: ['apiKey'] } }
      if (channel === '/dsh-mnemon-pack' && endpoint === 'target') return { ok: true as const, value: { root: '/workspace/.mnemon', scope: 'workspace' } }
      throw new Error(`unexpected ${channel} ${endpoint}`)
    })
    const connection = { rpc: { call } } as ClientConnectionHandle

    render(<MnemonSettingsCard scope={scope} connection={connection} sessionId="session-1" workspaceId="workspace-1" workspaceLabel="dsh-mnemon" />)

    await waitFor(() => expect(screen.getByText('OpenViking')).toBeTruthy())
    expect(screen.getByRole('group', { name: 'OpenViking 服务配置' })).toBeTruthy()
    const disclosure = screen.getByText('OpenViking').closest('button') as HTMLButtonElement
    expect(disclosure.getAttribute('aria-expanded')).toBe('false')
    expect((screen.getByRole('checkbox', { name: '启用 OpenViking' }) as HTMLInputElement).checked).toBe(true)
    expect(screen.getByText('当前 DSH 工作区：dsh-mnemon；只有标记“随工作区”的 Provider 会切换数据范围。')).toBeTruthy()
    fireEvent.click(screen.getByText('OpenViking'))
    expect(disclosure.getAttribute('aria-expanded')).toBe('true')
    expect((screen.getByLabelText('服务地址') as HTMLInputElement).value).toBe('http://127.0.0.1:1933')
    expect(screen.queryByLabelText('记忆范围 URI')).toBeNull()
    expect(screen.queryByLabelText('记忆体名称')).toBeNull()
    expect(screen.queryByRole('checkbox', { name: '清除已保存的凭据' })).toBeNull()
    expect(screen.getByText('已安全保存，留空不会更改')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '移除' }))
    expect(screen.getByText('将在保存后移除')).toBeTruthy()
    expect((screen.getByLabelText('API Key') as HTMLInputElement).placeholder).toBe('保存后将移除；输入新凭证可替换')
    fireEvent.click(screen.getByRole('button', { name: '撤销' }))
    expect(screen.getByText('已安全保存，留空不会更改')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '保存服务配置' }))

    await waitFor(() => expect(call).toHaveBeenCalledWith('/dsh-mnemon-write', 'provider-service-update', {
      providerId: 'openviking',
      settings: { endpoint: 'http://127.0.0.1:1933' },
      enabled: true,
      sessionId: 'session-1',
      workspaceId: 'workspace-1',
    }))
    expect(await screen.findByText('服务配置已保存')).toBeTruthy()
    expect(disclosure.getAttribute('aria-expanded')).toBe('true')
    expect(call.mock.calls.some(([, endpoint]) => endpoint === 'body-create')).toBe(false)
  })

  it('keeps a new provider off until its required service configuration is saved', async () => {
    const snapshot = {
      status: 'ready' as const,
      value: { storageScope: 'global' as const },
      base: {}, user: {}, revision: 0, writable: true, mode: 'host' as const,
    }
    const scope = {
      snapshot,
      getSnapshot() { return this.snapshot },
      subscribe() { return () => {} },
      set: vi.fn(async () => {}), unset: vi.fn(async () => {}), setPath: vi.fn(async () => {}), unsetPath: vi.fn(async () => {}),
    } satisfies ClientSettingsScope<Config> & { snapshot: typeof snapshot }
    const provider = {
      id: 'supermemory' as const,
      label: 'Supermemory', kind: 'remote' as const, origin: 'third-party' as const, summary: 'Semantic memory',
      workspaceBinding: 'provider-global' as const,
      capabilities: { search: true, browse: true, graph: false, entities: false, related: false, remember: true, link: false, forget: true, writeMode: 'async-extracting' as const, deletionMode: 'soft' as const },
      fields: [
        { key: 'endpoint', label: 'Endpoint', scope: 'service' as const, input: 'url' as const, required: true, defaultValue: 'https://api.supermemory.ai' },
        { key: 'apiKey', label: 'API key', scope: 'service' as const, input: 'secret' as const, required: true },
      ],
    }
    let service = { providerId: 'supermemory' as const, enabled: false, configured: false, settings: {}, configuredSecrets: [] as string[] }
    const call = vi.fn(async (channel: string, endpoint: string, payload: unknown) => {
      if (channel === '/dsh-mnemon-read' && endpoint === 'provider-services') return { ok: true as const, value: { providers: [provider], items: [service], generatedAt: '2026-08-17T00:00:00.000Z' } }
      if (channel === '/dsh-mnemon-write' && endpoint === 'provider-service-update') {
        const request = payload as { enabled: boolean; settings: Record<string, unknown> }
        service = {
          providerId: 'supermemory', enabled: request.enabled, configured: service.configured || Object.keys(request.settings).length > 0,
          settings: Object.hasOwn(request.settings, 'endpoint') ? { endpoint: request.settings.endpoint as string } : service.settings,
          configuredSecrets: Object.hasOwn(request.settings, 'apiKey') ? ['apiKey'] : service.configuredSecrets,
        }
        return { ok: true as const, value: service }
      }
      if (channel === '/dsh-mnemon-pack' && endpoint === 'target') return { ok: true as const, value: { root: '/active/.mnemon', scope: 'global' } }
      throw new Error(`unexpected ${channel} ${endpoint}`)
    })

    render(<MnemonSettingsCard scope={scope} connection={{ rpc: { call } } as ClientConnectionHandle} />)

    const providerToggle = await screen.findByRole('checkbox', { name: '启用 Supermemory' }) as HTMLInputElement
    expect(providerToggle.checked).toBe(false)
    expect(screen.queryByLabelText('服务地址')).toBeNull()

    fireEvent.click(providerToggle)
    expect(providerToggle.checked).toBe(true)
    expect(screen.getByLabelText('服务地址')).toBeTruthy()
    const enable = screen.getByRole('button', { name: '保存并启用' }) as HTMLButtonElement
    expect(enable.disabled).toBe(true)
    fireEvent.change(screen.getByLabelText('API Key'), { target: { value: 'service-secret' } })
    expect(enable.disabled).toBe(false)
    fireEvent.click(enable)

    await waitFor(() => expect(call).toHaveBeenCalledWith('/dsh-mnemon-write', 'provider-service-update', expect.objectContaining({
      providerId: 'supermemory', enabled: true, settings: { endpoint: 'https://api.supermemory.ai', apiKey: 'service-secret' },
    })))
    expect(await screen.findByText('服务配置已保存')).toBeTruthy()

    fireEvent.click(providerToggle)
    await waitFor(() => expect(call).toHaveBeenCalledWith('/dsh-mnemon-write', 'provider-service-update', expect.objectContaining({
      providerId: 'supermemory', enabled: false, settings: {},
    })))
    expect(screen.queryByLabelText('服务地址')).toBeNull()
  })

  it('previews and safely imports one complete directory ZIP', async () => {
    const snapshot = {
      status: 'ready' as const,
      value: { storageScope: 'global' as const },
      base: {}, user: {}, revision: 0, writable: true, mode: 'host' as const,
    }
    const scope = {
      snapshot,
      getSnapshot() { return this.snapshot },
      subscribe() { return () => {} },
      set: vi.fn(async () => {}), unset: vi.fn(async () => {}), setPath: vi.fn(async () => {}), unsetPath: vi.fn(async () => {}),
    } satisfies ClientSettingsScope<Config> & { snapshot: typeof snapshot }
    const call = vi.fn(async (_channel: string, endpoint: string, payload: unknown) => {
      if (endpoint === 'target') return { ok: true as const, value: { root: '/active/.mnemon', scope: 'global' } }
      if (endpoint === 'inspect') return {
        ok: true as const,
        value: {
          fileName: 'backup.zip', archiveBytes: 4, expandedBytes: 2048,
          targetRoot: '/active/.mnemon', targetScope: 'global',
          occupied: { runtime: true, documents: true, 'memory-spaces': true },
          manifest: {
            format: 'mnemonpack', version: 1, scope: 'full', exportedAt: '2026-08-14T12:00:00.000Z',
            source: { plugin: 'dsh-mnemon', pluginVersion: '0.1.0' },
            components: ['runtime', 'documents', 'memory-spaces'],
            summary: [
              { component: 'runtime', files: 3, bytes: 600, items: 2 },
              { component: 'documents', files: 2, bytes: 700, items: 1 },
              { component: 'memory-spaces', files: 2, bytes: 748, items: 1 },
            ],
          },
        },
      }
      if (endpoint === 'import') return {
        ok: true as const,
        value: { imported: true, mode: 'merge', targetRoot: '/active/.mnemon', components: ['runtime', 'documents', 'memory-spaces'], summary: [] },
      }
      throw new Error(`unexpected endpoint ${endpoint}: ${JSON.stringify(payload)}`)
    })
    const connection = { rpc: { call } } as ClientConnectionHandle

    render(<MnemonSettingsCard scope={scope} connection={connection} />)
    await waitFor(() => expect(screen.getByText('/active/.mnemon')).toBeTruthy())

    const file = new File(['pack'], 'backup.zip', { type: 'application/zip' })
    fireEvent.change(screen.getByLabelText('选择 Mnemon 备份 ZIP'), { target: { files: [file] } })
    await waitFor(() => expect(screen.getByText('backup.zip')).toBeTruthy())
    expect(screen.getByText(/校验通过 · 3 个组件 · 4 项/)).toBeTruthy()
    expect(screen.queryByRole('checkbox', { name: /Documents/ })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: '安全导入' }))
    await waitFor(() => expect(call).toHaveBeenCalledWith('/dsh-mnemon-pack', 'import', {
      base64: 'cGFjaw==',
    }))
    expect(screen.getByText('已将 ZIP 安全合并到 /active/.mnemon。')).toBeTruthy()
  })
})
