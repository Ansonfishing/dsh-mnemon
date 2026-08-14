// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, waitFor } from '@testing-library/react'

vi.mock('../src/client/MnemonView.tsx', () => ({
  MnemonView: ({ sessionId, workspaceId, workspaceSelection, surface, t, locale }: {
    sessionId?: string
    workspaceId?: string
    surface?: 'sidebar' | 'buildin'
    t?: (key: string) => string
    locale?: 'zh' | 'en'
    workspaceSelection?: {
      options: Array<{ id: string; title: string }>
      selectedWorkspaceId?: string
      effectiveWorkspaceId?: string
      onSelect(id: string): void
      onAlign(): void
    }
  }) => <div data-testid="mnemon-panel-content" data-workspace-id={workspaceId} data-effective-workspace-id={workspaceSelection?.effectiveWorkspaceId} data-surface={surface} data-locale={locale}>
    <h1>{t?.('tab.label')}</h1>
    <span>{sessionId ?? 'no-session'}</span>
    <select aria-label="workspace-test-selector" value={workspaceSelection?.selectedWorkspaceId ?? ''} onChange={event => workspaceSelection?.onSelect(event.target.value)}>
      {workspaceSelection?.options.map(workspace => <option key={workspace.id} value={workspace.id}>{workspace.title}</option>)}
    </select>
    <button type="button" onClick={workspaceSelection?.onAlign}>align-test-workspace</button>
  </div>,
}))

import { MNEMON_ANCHOR_EVENT } from '../src/client/anchor.ts'
import { mountMnemonWorkspace } from '../src/client/workspace-mount.tsx'

let currentDispose: (() => void) | undefined

function renderShell(): void {
  document.body.innerHTML = `
    <div data-dsh-frame>
      <aside data-pane="sidebar">
        <div class="sidebarRoot">
          <div class="logoRow"><button class="newSession">New</button></div>
          <button data-dsh-taskboard-entry>Tasks</button>
          <button data-dsh-ssh-entry>SSH</button>
          <button class="sessionRow">Session</button>
        </div>
      </aside>
      <main data-pane="conversation"><div data-chat-content>Chat stays mounted</div></main>
    </div>`
}

function context(locale?: { getSnapshot(): { active: 'zh' | 'en'; locales: readonly never[]; revision: number }; subscribe(listener: () => void): () => void }) {
  const fallbackLocale = { active: 'zh' as const, locales: [] as const, revision: 0 }
  const snapshot = {
    ids: ['session-1'],
    byId: { 'session-1': { cwd: '/tmp/workspace-one' } },
    current: 'session-1',
    phase: 'ready',
    subagentsByParent: {},
    jobsBySession: {},
    currentAddress: undefined,
  }
  const workspaceSnapshot = {
    items: [
      { workspaceId: 'workspace-1', title: 'Workspace One', path: '/tmp/workspace-one' },
      { workspaceId: 'workspace-2', title: 'Workspace Two', path: '/tmp/workspace-two' },
    ],
    recentWorkspaceId: 'workspace-2',
  }
  return {
    connection: { rpc: { call: vi.fn() } },
    locale: locale ?? { getSnapshot: () => fallbackLocale, subscribe: () => () => {} },
    sessions: {
      list: { getSnapshot: () => snapshot, subscribe: () => () => {} },
    },
    workspaces: {
      list: {
        getSnapshot: () => workspaceSnapshot,
        subscribe: () => () => {},
      },
    },
  }
}

describe('Mnemon sidebar workspace', () => {
  beforeEach(() => { renderShell() })
  afterEach(() => {
    currentDispose?.()
    currentDispose = undefined
    document.documentElement.removeAttribute('data-dsh-mnemon-active')
    document.documentElement.removeAttribute('data-dsh-taskboard-active')
    document.documentElement.removeAttribute('data-dsh-ssh-active')
    document.body.replaceChildren()
    vi.restoreAllMocks()
  })

  it('mounts after the official panel family and toggles the center workspace', async () => {
    const dispose = currentDispose = mountMnemonWorkspace(context() as never, {} as never, key => key === 'tab.label' ? '记忆系统' : key)
    const entry = document.querySelector<HTMLButtonElement>('[data-dsh-mnemon-entry]')
    expect(entry?.textContent).toBe('记忆系统')
    expect(entry?.previousElementSibling?.hasAttribute('data-dsh-ssh-entry')).toBe(true)
    expect(document.querySelector('[data-chat-content]')).not.toBeNull()
    await waitFor(() => expect(document.querySelector('[data-testid="mnemon-panel-content"] span')?.textContent).toBe('session-1'))
    expect(document.querySelector('[data-testid="mnemon-panel-content"]')?.getAttribute('data-workspace-id')).toBe('workspace-1')
    expect(document.querySelector('[data-testid="mnemon-panel-content"]')?.getAttribute('data-surface')).toBe('sidebar')

    fireEvent.click(entry!)
    expect(document.documentElement.hasAttribute('data-dsh-mnemon-active')).toBe(true)
    expect(entry?.getAttribute('data-active')).toBe('true')

    fireEvent.click(entry!)
    expect(document.documentElement.hasAttribute('data-dsh-mnemon-active')).toBe(false)
    expect(entry?.hasAttribute('data-active')).toBe(false)
    dispose()
    currentDispose = undefined
  })

  it('keeps the inspected workspace independent and aligns it to the current session on demand', async () => {
    currentDispose = mountMnemonWorkspace(context() as never, {} as never, key => String(key))
    await waitFor(() => expect(document.querySelector('[data-testid="mnemon-panel-content"]')).not.toBeNull())
    const panel = document.querySelector<HTMLElement>('[data-testid="mnemon-panel-content"]')!
    expect(panel.getAttribute('data-workspace-id')).toBe('workspace-1')
    expect(panel.getAttribute('data-effective-workspace-id')).toBe('workspace-1')

    fireEvent.change(document.querySelector('[aria-label="workspace-test-selector"]')!, { target: { value: 'workspace-2' } })
    await waitFor(() => expect(panel.getAttribute('data-workspace-id')).toBe('workspace-2'))
    expect(panel.getAttribute('data-effective-workspace-id')).toBe('workspace-1')

    const align = [...document.querySelectorAll<HTMLButtonElement>('button')].find(button => button.textContent === 'align-test-workspace')
    fireEvent.click(align!)
    await waitFor(() => expect(panel.getAttribute('data-workspace-id')).toBe('workspace-1'))
  })

  it('opens for conversation anchors and yields to sessions and sibling panels', async () => {
    const dispose = currentDispose = mountMnemonWorkspace(context() as never, {} as never, key => String(key))
    const entry = document.querySelector<HTMLButtonElement>('[data-dsh-mnemon-entry]')!

    window.dispatchEvent(new CustomEvent(MNEMON_ANCHOR_EVENT, { detail: { page: 'explore', sessionId: 'session-1' } }))
    expect(document.documentElement.hasAttribute('data-dsh-mnemon-active')).toBe(true)
    fireEvent.click(document.querySelector('.sessionRow')!)
    expect(document.documentElement.hasAttribute('data-dsh-mnemon-active')).toBe(false)

    fireEvent.click(entry)
    document.dispatchEvent(new CustomEvent('dsh-panel-activate', { detail: 'taskboard' }))
    expect(document.documentElement.hasAttribute('data-dsh-mnemon-active')).toBe(false)

    fireEvent.click(entry)
    document.dispatchEvent(new CustomEvent('dsh-panel-activate', { detail: 'ssh' }))
    expect(document.documentElement.hasAttribute('data-dsh-mnemon-active')).toBe(false)
    dispose()
    currentDispose = undefined
  })

  it('self-heals after a sidebar React-style row replacement', async () => {
    const dispose = currentDispose = mountMnemonWorkspace(context() as never, {} as never, key => String(key))
    document.querySelector('[data-dsh-mnemon-entry]')?.remove()
    await waitFor(() => expect(document.querySelector('[data-dsh-mnemon-entry]')).not.toBeNull())
    dispose()
    currentDispose = undefined
    expect(document.querySelector('[data-dsh-mnemon-entry]')).toBeNull()
    expect(document.querySelector('[data-dsh-mnemon-view]')).toBeNull()
  })

  it('updates the custom sidebar entry and workspace when the DSH locale changes', async () => {
    let active: 'zh' | 'en' = 'zh'
    let revision = 0
    let localeSnapshot: { active: 'zh' | 'en'; locales: readonly never[]; revision: number } = {
      active,
      locales: [],
      revision,
    }
    const listeners = new Set<() => void>()
    const locale = {
      getSnapshot: () => localeSnapshot,
      subscribe: (listener: () => void) => { listeners.add(listener); return () => listeners.delete(listener) },
    }
    const t = (key: string) => key === 'tab.label' ? active === 'zh' ? '记忆系统' : 'Memory System' : key
    currentDispose = mountMnemonWorkspace(context(locale) as never, {} as never, t)

    await waitFor(() => expect(document.querySelector('[data-testid="mnemon-panel-content"] h1')?.textContent).toBe('记忆系统'))
    expect(document.querySelector('[data-dsh-mnemon-entry]')?.textContent).toBe('记忆系统')

    active = 'en'
    revision += 1
    localeSnapshot = { active, locales: [] as const, revision }
    for (const listener of listeners) listener()

    await waitFor(() => expect(document.querySelector('[data-testid="mnemon-panel-content"] h1')?.textContent).toBe('Memory System'))
    expect(document.querySelector('[data-dsh-mnemon-entry]')?.textContent).toBe('Memory System')
    expect(document.querySelector('[data-testid="mnemon-panel-content"]')?.getAttribute('data-locale')).toBe('en')
  })
})
