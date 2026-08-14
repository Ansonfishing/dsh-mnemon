import { memo, useEffect, useState, type JSX, type MouseEvent as ReactMouseEvent } from 'react'
import type { ClientConnectionHandle } from '../contracts.ts'
import type { TurnMemoryActivity } from '../lifecycle.ts'
import { MnemonClient } from './api.ts'
import { dispatchMnemonAnchor } from './anchor.ts'
import type { MnemonKey } from './locales.ts'
import css from './MnemonTurnTail.module.css'

export interface MnemonTurnTailProps {
  /** Engine-owned closing Turn boundary (TurnLocation on the wire). */
  turn: unknown
  seq: number
  openFile: (path: string) => void
  /** Injected by the slot host: the session this tail belongs to. */
  sessionId?: string
  connection: ClientConnectionHandle
  t: (key: MnemonKey, params?: Record<string, unknown>) => string
}

function turnNumber(turn: unknown): number | undefined {
  const value = (turn as { turn?: unknown } | null)?.turn
  return typeof value === 'number' ? value : undefined
}

/** Whether this entry renders for the owner; chain selectors decline quietly. */
export function selectMnemonTurnTail(owner: unknown): boolean {
  const turn = (owner as { turn?: { status?: unknown } } | null)?.turn
  return turn !== undefined && turn.status === 'closed'
}

/** One-line memory-activity bar under a completed turn; hides when the turn touched no memory. */
export const MnemonTurnTail = memo(function MnemonTurnTail({ turn, sessionId, connection, t }: MnemonTurnTailProps): JSX.Element | null {
  const [activity, setActivity] = useState<TurnMemoryActivity | null | undefined>(undefined)
  const [open, setOpen] = useState(false)
  const number = turnNumber(turn)

  useEffect(() => {
    if (number === undefined) {
      setActivity(null)
      return
    }
    let alive = true
    const client = new MnemonClient(connection, sessionId)
    client.turnActivity(number)
      .then(result => { if (alive) setActivity(result) })
      .catch(() => { if (alive) setActivity(null) })
    return () => { alive = false }
  }, [connection, sessionId, number])

  if (activity === undefined || activity === null) return null
  if (number === undefined) return null

  const openView = (event: ReactMouseEvent): void => {
    event.stopPropagation()
    dispatchMnemonAnchor({ page: 'status', ...(sessionId === undefined ? {} : { sessionId }) })
  }

  return (
    <div className={css.root} data-open={open || undefined}>
      <button type="button" className={css.bar} aria-expanded={open} onClick={() => setOpen(value => !value)}>
        <span className={css.mark} aria-hidden="true">◈</span>
        <span className={css.label}>{t('turnTail.label')}</span>
        <span className={css.metrics}>
          {activity.recalls > 0 && <span>{t('turnTail.recall', { count: activity.recalls })}</span>}
          {activity.writes > 0 && <span>{t('turnTail.write', { count: activity.writes })}</span>}
          {activity.documentSearches > 0 && <span>{t('turnTail.documents', { count: activity.documentSearches })}</span>}
        </span>
        <span className={`${css.chevron} ${open ? css.chevronOpen : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <div className={css.details}>
          <span className={css.detailLabel}>{t('turnTail.toolList')}</span>
          <div className={css.tools}>
            {activity.names.map(name => <code key={name} className={css.toolChip}>{name}</code>)}
          </div>
          <button type="button" className={css.viewButton} onClick={openView}>{t('turnTail.openView')}</button>
        </div>
      )}
    </div>
  )
})
