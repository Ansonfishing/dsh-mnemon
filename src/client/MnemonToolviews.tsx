import { memo, useMemo, useState, type JSX, type MouseEvent as ReactMouseEvent } from 'react'
import { MnemonLogo } from './MnemonLogo.tsx'
import { dispatchMnemonAnchor, type MnemonAnchorPage } from './anchor.ts'
import type { MnemonKey } from './locales.ts'
import css from './MnemonToolviews.module.css'

export interface MnemonToolViewProps {
  callId: string
  toolName: string
  /** RunningToolCall while live, ToolResultNode once settled; both are opaque wire slices. */
  block: unknown
  openFile?: (path: string) => void
  cwd?: string
  /** Optional on older/newer DSH tool hosts; omit the action when unavailable. */
  inspect?: () => void
  /** Session the call belongs to; injected by the slot host. */
  sessionId?: string
  t: (key: MnemonKey, params?: Record<string, unknown>) => string
}

const READ_TOOLS = new Set(['mnemon_recall', 'mnemon_related', 'mnemon_document_search', 'mnemon_status', 'mnemon_memory_bodies'])

/** Anchor destination per tool: where "open in Memory view" should land. */
const ANCHOR_TARGETS: Record<string, { page: MnemonAnchorPage; seed?: (args: Record<string, unknown>) => string | undefined }> = {
  mnemon_recall: { page: 'explore', seed: args => typeof args.query === 'string' && args.query.trim() !== '' ? args.query.trim() : undefined },
  mnemon_related: { page: 'explore', seed: args => typeof args.id === 'string' && args.id.trim() !== '' ? args.id.trim() : undefined },
  mnemon_document_search: { page: 'documents' },
  mnemon_status: { page: 'status' },
  mnemon_memory_bodies: { page: 'overview' },
  mnemon_runtime_memory: { page: 'runtime' },
  mnemon_document_manage: { page: 'documents' },
  mnemon_remember: { page: 'overview' },
  mnemon_forget: { page: 'overview' },
  mnemon_link: { page: 'overview' },
  mnemon_memory_body_create: { page: 'overview' },
  mnemon_memory_body_update: { page: 'overview' },
  mnemon_memory_body_merge: { page: 'overview' },
}

function isSettled(block: unknown): boolean {
  return typeof block === 'object' && block !== null && 'kind' in block
}

/** Parse the call's raw arguments JSON; always returns a plain object. */
function argsOf(block: unknown): Record<string, unknown> {
  const record = block as { call?: { argsRaw?: unknown }; argsRaw?: unknown } | null
  const raw = typeof record?.call?.argsRaw === 'string' ? record.call.argsRaw : typeof record?.argsRaw === 'string' ? record.argsRaw : ''
  if (raw === '') return {}
  try {
    const parsed: unknown = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {}
  } catch {
    return {}
  }
}

/** Joined text blocks of a settled result; empty while running. */
function resultText(block: unknown): string {
  if (!isSettled(block)) return ''
  const content = (block as { content?: unknown }).content
  if (!Array.isArray(content)) return ''
  return content
    .filter(item => typeof item === 'object' && item !== null && (item as { type?: unknown }).type === 'text' && typeof (item as { text?: unknown }).text === 'string')
    .map(item => String((item as { text: string }).text))
    .join('')
}

/** Parsed result JSON when the output is one object; otherwise null. */
function outputJson(block: unknown): Record<string, unknown> | null {
  const text = resultText(block)
  if (text === '') return null
  try {
    const parsed: unknown = JSON.parse(text)
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null
  } catch {
    return null
  }
}

function truncateInline(value: string, max: number): string {
  const normalized = value.replace(/\s+/g, ' ').trim()
  return normalized.length <= max ? normalized : `${normalized.slice(0, max)}…`
}

function truncateBlock(value: string, max: number): string {
  const normalized = value.trim()
  return normalized.length <= max ? normalized : `${normalized.slice(0, max)}\n…`
}

function countOf(value: unknown): number | undefined {
  return Array.isArray(value) ? value.length : undefined
}

/** Tool-specific one-line summary from the call args and the settled output. */
function summaryFor(toolName: string, args: Record<string, unknown>, out: Record<string, unknown> | null, t: (key: MnemonKey, params?: Record<string, unknown>) => string): string {
  switch (toolName) {
    case 'mnemon_recall': {
      const query = typeof args.query === 'string' ? truncateInline(args.query, 56) : ''
      const hits = out === null ? undefined : countOf(out.results)
      return hits === undefined ? query : t('toolview.recallSummary', { query, count: hits })
    }
    case 'mnemon_related': {
      const id = typeof args.id === 'string' ? args.id : ''
      const hits = out === null ? undefined : countOf(out.results)
      return hits === undefined ? truncateInline(id, 56) : t('toolview.relatedSummary', { id: truncateInline(id, 28), count: hits })
    }
    case 'mnemon_document_search': {
      const query = typeof args.query === 'string' ? truncateInline(args.query, 56) : ''
      const hits = out === null ? undefined : countOf(out.results)
      return hits === undefined ? query : t('toolview.documentSearchSummary', { query, count: hits })
    }
    case 'mnemon_status':
      return out === null ? t('toolview.running') : out.healthy === true ? t('toolview.statusHealthy') : t('toolview.statusUnhealthy')
    case 'mnemon_memory_bodies':
      return out === null ? t('toolview.running') : t('toolview.bodiesSummary', { count: out.total ?? 0, active: out.activeCount ?? 0 })
    case 'mnemon_remember':
      return typeof args.content === 'string' ? truncateInline(args.content, 56) : t('toolview.genericSummary')
    case 'mnemon_runtime_memory': {
      const action = typeof args.action === 'string' ? args.action : ''
      const target = typeof args.target === 'string' ? args.target : ''
      const content = typeof args.content === 'string' ? truncateInline(args.content, 40) : ''
      return content === '' ? t('toolview.runtimeSummary', { action, target }) : t('toolview.runtimeSummaryWithContent', { action, target, content })
    }
    case 'mnemon_document_manage': {
      const action = typeof args.action === 'string' ? args.action : ''
      const title = typeof args.title === 'string' ? truncateInline(args.title, 40) : ''
      return title === '' ? t('toolview.documentManageSummary', { action }) : t('toolview.documentManageSummaryWithTitle', { action, title })
    }
    case 'mnemon_link': {
      const source = typeof args.sourceId === 'string' ? truncateInline(args.sourceId, 18) : '?'
      const target = typeof args.targetId === 'string' ? truncateInline(args.targetId, 18) : '?'
      return `${source} → ${target}`
    }
    case 'mnemon_forget':
      return typeof args.id === 'string' ? truncateInline(args.id, 56) : t('toolview.genericSummary')
    case 'mnemon_memory_body_create':
      return typeof args.name === 'string' ? truncateInline(args.name, 56) : t('toolview.genericSummary')
    case 'mnemon_memory_body_update': {
      const id = typeof args.memoryBodyId === 'string' ? truncateInline(args.memoryBodyId, 32) : ''
      return id === '' ? t('toolview.genericSummary') : t('toolview.bodyUpdateSummary', { id })
    }
    case 'mnemon_memory_body_merge': {
      const target = typeof args.targetMemoryBodyId === 'string' ? truncateInline(args.targetMemoryBodyId, 24) : '?'
      const sources = countOf(args.sourceMemoryBodyIds) ?? 0
      return t('toolview.bodyMergeSummary', { target, count: sources })
    }
    default:
      return t('toolview.genericSummary')
  }
}

/** Render one mnemon_* tool call as a memory-flavoured row with expandable evidence. */
export const MnemonToolView = memo(function MnemonToolView({ toolName, block, inspect, sessionId, t }: MnemonToolViewProps): JSX.Element {
  const [open, setOpen] = useState(false)
  const settled = isSettled(block)
  const record = block as { error?: { code?: unknown }; isError?: unknown } | null
  const state: 'running' | 'ok' | 'error' | 'stopped' = !settled
    ? 'running'
    : record?.error?.code === 'interrupted'
      ? 'stopped'
      : record?.isError === true
        ? 'error'
        : 'ok'
  const args = useMemo(() => argsOf(block), [block])
  const out = useMemo(() => outputJson(block), [block])
  const text = useMemo(() => resultText(block), [block])
  const title = READ_TOOLS.has(toolName) ? t('toolview.recallTitle') : t('toolview.writeTitle')
  const summary = summaryFor(toolName, args, out, t)
  const target = ANCHOR_TARGETS[toolName]
  const seed = target?.seed?.(args)

  const toggle = (): void => setOpen(value => !value)
  const openView = (event: ReactMouseEvent): void => {
    event.stopPropagation()
    if (target === undefined) return
    dispatchMnemonAnchor({ page: target.page, ...(seed === undefined ? {} : { seed }), ...(sessionId === undefined ? {} : { sessionId }) })
  }
  const inspectCall = (event: ReactMouseEvent): void => {
    event.stopPropagation()
    inspect?.()
  }

  const showArgs = Object.keys(args).length > 0
  const showResult = text !== ''

  return (
    <div className={css.root} data-state={state} data-open={open || undefined}>
      <div className={css.row} role="button" tabIndex={0} aria-expanded={open} aria-label={`${title}：${summary}`} onClick={toggle} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle() } }}>
        <span className={`${css.dot} ${state === 'running' ? css.dotRunning : state === 'error' ? css.dotError : state === 'stopped' ? css.dotStopped : css.dotOk}`} aria-hidden="true" />
        <MnemonLogo className={css.leading} title={title} />
        <span className={css.title}>{title}</span>
        <span className={css.summary}>{summary}</span>
        {(inspect !== undefined || target !== undefined) && (
          <span className={css.actions} onClick={event => event.stopPropagation()}>
            {target !== undefined && <button type="button" className={css.actionButton} onClick={openView} title={t('toolview.openView')}>{t('toolview.openView')}</button>}
            {settled && inspect !== undefined && <button type="button" className={css.actionButton} onClick={inspectCall} title={t('toolview.inspect')}>{t('toolview.inspect')}</button>}
          </span>
        )}
        <span className={`${css.chevron} ${open ? css.chevronOpen : ''}`} aria-hidden="true" />
      </div>
      {open && (
        <div className={css.details} onClick={event => event.stopPropagation()}>
          {showArgs && <div className={css.detailSection}><span className={css.detailLabel}>{t('toolview.args')}</span><pre className={css.detailCode}>{truncateBlock(JSON.stringify(args, null, 2), 2000)}</pre></div>}
          {showResult && <div className={css.detailSection}><span className={css.detailLabel}>{t('toolview.result')}</span><pre className={css.detailCode}>{truncateBlock(text, 4000)}</pre></div>}
          {!showArgs && !showResult && <div className={css.detailEmpty}>{state === 'running' ? t('toolview.running') : t('toolview.noResult')}</div>}
        </div>
      )}
    </div>
  )
})

/** Tool name → toolview component, registered as keyed `tool.call.toolview` entries. */
export const MNEMON_TOOLVIEW_NAMES = Object.keys(ANCHOR_TARGETS) as readonly string[]
