import { memo, useEffect, useRef, useState, type JSX } from 'react'
import type { ClientConnectionHandle } from '../contracts.ts'
import { MnemonClient } from './api.ts'
import type { MnemonKey } from './locales.ts'
import css from './MnemonSaveAction.module.css'

export interface MnemonSaveActionProps {
  /** Stable identity of the finalized assistant message this action addresses. */
  messageId: string
  /** Injected by the slot host: the session this message belongs to. */
  sessionId?: string
  connection: ClientConnectionHandle
  t: (key: MnemonKey, params?: Record<string, unknown>) => string
}

interface SuperviseOutcome {
  summary: string
  action: string
}

const PREVIEW_LIMIT = 8000

/** Save-to-memory action on finalized assistant messages, routed through the supervised writeback gate. */
export const MnemonSaveAction = memo(function MnemonSaveAction({ messageId, sessionId, connection, t }: MnemonSaveActionProps): JSX.Element {
  const [open, setOpen] = useState(false)
  const [writeEnabled, setWriteEnabled] = useState<boolean | undefined>(undefined)
  const [candidate, setCandidate] = useState<string | undefined>(undefined)
  const [truncated, setTruncated] = useState(false)
  const [missing, setMissing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [outcome, setOutcome] = useState<SuperviseOutcome | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const openRef = useRef(false)
  const requestVersionRef = useRef(0)
  const submitActiveRef = useRef(false)

  const setPanelOpen = (next: boolean): void => {
    requestVersionRef.current += 1
    openRef.current = next
    setOpen(next)
  }

  useEffect(() => {
    if (!open) {
      setWriteEnabled(undefined)
      setCandidate(undefined)
      setTruncated(false)
      setMissing(false)
      setSubmitting(submitActiveRef.current)
      setOutcome(null)
      setFailure(null)
      return
    }
    const requestVersion = ++requestVersionRef.current
    let alive = true
    setSubmitting(submitActiveRef.current)
    const client = new MnemonClient(connection, sessionId)
    client.status()
      .then(status => { if (alive && requestVersionRef.current === requestVersion) setWriteEnabled(status.writeEnabled) })
      .catch(() => { if (alive && requestVersionRef.current === requestVersion) setWriteEnabled(false) })
    client.assistantMessageText(messageId)
      .then(result => {
        if (!alive || requestVersionRef.current !== requestVersion) return
        if (result === null || result.text === '') setMissing(true)
        else {
          setTruncated(result.text.length > PREVIEW_LIMIT)
          setCandidate(result.text.slice(0, PREVIEW_LIMIT))
        }
      })
      .catch(() => { if (alive && requestVersionRef.current === requestVersion) setMissing(true) })
    return () => { alive = false }
  }, [open, connection, sessionId, messageId])

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setPanelOpen(false)
    }
    const closeOutside = (event: PointerEvent): void => {
      if (event.target instanceof Node && !wrapRef.current?.contains(event.target)) setPanelOpen(false)
    }
    document.addEventListener('keydown', closeOnEscape)
    document.addEventListener('pointerdown', closeOutside)
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.removeEventListener('pointerdown', closeOutside)
    }
  }, [open])

  const submit = (): void => {
    const content = textareaRef.current?.value.trim() ?? ''
    if (content === '' || writeEnabled !== true || submitActiveRef.current) return
    const requestVersion = requestVersionRef.current
    submitActiveRef.current = true
    setSubmitting(true)
    setFailure(null)
    setOutcome(null)
    const client = new MnemonClient(connection, sessionId)
    client.supervise(content)
      .then(result => {
        if (!openRef.current || requestVersionRef.current !== requestVersion) return
        setOutcome({ summary: result.summary, action: result.action })
        setCandidate(content)
      })
      .catch(reason => {
        if (openRef.current && requestVersionRef.current === requestVersion) setFailure(reason instanceof Error ? reason.message : String(reason))
      })
      .finally(() => {
        submitActiveRef.current = false
        if (openRef.current) setSubmitting(false)
      })
  }

  return (
    <div ref={wrapRef} className={css.wrap}>
      <button
        type="button"
        className={css.button}
        aria-expanded={open}
        title={t('saveAction.button')}
        onClick={() => setPanelOpen(!openRef.current)}
      >
        <span className={css.glyph} aria-hidden="true">◈</span>
        <span className={css.label}>{t('saveAction.button')}</span>
      </button>
      {open && (
        <div className={css.panel} role="dialog" aria-label={t('saveAction.title')}>
          <header className={css.panelHeader}>
            <strong>{t('saveAction.title')}</strong>
            <button type="button" className={css.close} aria-label={t('saveAction.close')} onClick={() => setPanelOpen(false)}>×</button>
          </header>
          <p className={css.hint}>{t('saveAction.hint')}</p>
          {writeEnabled === false && <div className={css.readOnly} role="status">{t('saveAction.readOnly')}</div>}
          {candidate === undefined && !missing && <div className={css.status}>{t('saveAction.fetching')}</div>}
          {missing && <div className={css.status} role="status">{t('saveAction.missing')}</div>}
          {candidate !== undefined && (
            <label className={css.candidate}>
              <span>{t('saveAction.candidate')}</span>
              <textarea ref={textareaRef} rows={5} defaultValue={candidate} />
              {truncated && <small className={css.truncated}>{t('saveAction.truncated', { limit: PREVIEW_LIMIT })}</small>}
            </label>
          )}
          {outcome !== null && <div className={css.outcome} role="status">{t('saveAction.result', { summary: outcome.summary })}</div>}
          {failure !== null && <div className={css.failure} role="alert">{t('saveAction.failed', { error: failure })}</div>}
          {candidate !== undefined && (
            <button type="button" className={css.submit} disabled={submitting || writeEnabled !== true} onClick={submit}>
              {submitting ? t('saveAction.submitting') : t('saveAction.submit')}
            </button>
          )}
        </div>
      )}
    </div>
  )
})
