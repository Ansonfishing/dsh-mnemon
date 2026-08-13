import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import type { Config } from '../config.ts'
import type { ClientSettingsScope } from '../contracts.ts'
import css from './MnemonSettingsCard.module.css'
import { translateZh, type MnemonTranslate } from './locales.ts'

export interface MnemonSettingsCardProps {
  scope: ClientSettingsScope<Config>
  t?: MnemonTranslate
}

type Field = 'storageScope' | 'dataDir'
type Draft = Record<Field, string>

const FIELD_ORDER: Field[] = ['storageScope', 'dataDir']

function record(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function draftOf(value: Config | undefined): Draft {
  const resolved = value ?? {}
  return {
    storageScope: resolved.storageScope ?? (resolved.dataDir?.trim() ? 'custom' : 'global'),
    dataDir: resolved.dataDir?.trim() ?? '',
  }
}

function inheritedDraft(base: unknown): Draft {
  return draftOf(record(base) as Config)
}

function validation(t: MnemonTranslate, draft: Draft): string | null {
  if (!['global', 'workspace', 'custom'].includes(draft.storageScope)) return t('config.invalidScope')
  if (draft.storageScope !== 'custom') return null
  const directory = draft.dataDir.trim()
  if (directory === '') return t('config.customRequired')
  if (!(directory === '~' || directory.startsWith('~/') || directory.startsWith('/'))) return t('config.customAbsolute')
  return null
}

export function MnemonSettingsCard({ scope, t = translateZh }: MnemonSettingsCardProps): JSX.Element | null {
  const subscribe = useMemo(() => scope.subscribe.bind(scope), [scope])
  const getSnapshot = useMemo(() => scope.getSnapshot.bind(scope), [scope])
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const [draft, setDraft] = useState<Draft>(() => draftOf(snapshot.value))
  const [dirty, setDirty] = useState<Set<Field>>(() => new Set())
  const [reset, setReset] = useState<Set<Field>>(() => new Set())
  const [saving, setSaving] = useState(false)
  const [failed, setFailed] = useState<string | null>(null)

  useEffect(() => {
    if (dirty.size === 0) setDraft(draftOf(snapshot.value))
  }, [dirty.size, snapshot.value])

  const overridden = useMemo(() => record(snapshot.user), [snapshot.user])
  const inherited = useMemo(() => inheritedDraft(snapshot.base), [snapshot.base])
  const error = validation(t, draft)

  if (snapshot.status === 'unavailable') return null

  const edit = (field: Field, value: string) => {
    setDraft(current => ({ ...current, [field]: value }))
    setDirty(current => new Set(current).add(field))
    setReset(current => {
      const next = new Set(current)
      next.delete(field)
      return next
    })
    setFailed(null)
  }

  const resetField = (field: Field) => {
    setDraft(current => ({ ...current, [field]: inherited[field] }))
    setDirty(current => new Set(current).add(field))
    setReset(current => new Set(current).add(field))
    setFailed(null)
  }

  const discard = () => {
    setDraft(draftOf(snapshot.value))
    setDirty(new Set())
    setReset(new Set())
    setFailed(null)
  }

  const save = async () => {
    if (error !== null || dirty.size === 0 || saving) return
    setSaving(true)
    setFailed(null)
    try {
      const order = draft.storageScope === 'custom' ? [...FIELD_ORDER].reverse() : FIELD_ORDER
      for (const field of order) {
        if (!dirty.has(field)) continue
        if (reset.has(field) || (field === 'dataDir' && draft.dataDir.trim() === '')) {
          await scope.unset(field)
        } else {
          await scope.set(field, draft[field].trim())
        }
      }
      setDirty(new Set())
      setReset(new Set())
    } catch (reason) {
      setFailed(reason instanceof Error ? reason.message : String(reason))
    } finally {
      setSaving(false)
    }
  }

  const fieldMeta = (field: Field) => Object.hasOwn(overridden, field) && !reset.has(field)

  return (
    <section className={css.card} aria-label={t('config.aria')}>
      <div className={css.panelHeader}>
        <div><h3>Mnemon</h3><p>{t('config.description')}</p></div>
        <strong>{dirty.size > 0 ? t('config.unsaved') : t('config.restart')}</strong>
      </div>
      <div className={css.body}>
        <div className={css.notice}>{t('config.noticeBefore')} <code>.dsh/settings.yaml</code>{t('config.noticeAfter')}</div>

        <div className={css.primarySettings}>
          <SettingField t={t} label={t('config.scope')} hint={t('config.scopeHint')} overridden={fieldMeta('storageScope')} onReset={() => resetField('storageScope')}>
            <select aria-label={t('config.scopeAria')} value={draft.storageScope} onChange={event => edit('storageScope', event.target.value)} disabled={!snapshot.writable}><option value="global">{t('config.global')} · ~/.mnemon</option><option value="workspace">{t('config.workspace')} · &lt;workspace&gt;/.mnemon</option><option value="custom">{t('config.custom')}</option></select>
          </SettingField>
          {draft.storageScope === 'custom' && <SettingField t={t} label={t('config.customDirectory')} hint={t('config.customHint')} overridden={fieldMeta('dataDir')} onReset={() => resetField('dataDir')}>
            <input aria-label={t('config.customAria')} value={draft.dataDir} onChange={event => edit('dataDir', event.target.value)} placeholder="~/mnemon-data" disabled={!snapshot.writable} />
          </SettingField>}
        </div>

        {error !== null && <p className={css.error} role="alert">{error}</p>}
        {failed !== null && <p className={css.error} role="alert">{t('config.saveFailed', { error: failed })}</p>}
        {!snapshot.writable && <p className={css.readOnly}>{t('config.readOnly')}</p>}

        <div className={css.actions}>
          <button type="button" className={css.discard} disabled={dirty.size === 0 || saving} onClick={discard}>{t('config.discard')}</button>
          <button type="button" className={css.save} disabled={dirty.size === 0 || saving || error !== null || !snapshot.writable} onClick={() => void save()}>{saving ? t('config.saving') : t('config.save')}</button>
        </div>
      </div>
    </section>
  )
}

function SettingField(props: { t: MnemonTranslate; label: string; hint: string; overridden: boolean; onReset: () => void; children: JSX.Element }): JSX.Element {
  return (
    <label className={css.field}>
      <span className={css.fieldTitle}>{props.label}{props.overridden && <em>{props.t('config.overridden')}</em>}{props.overridden && <button type="button" onClick={event => { event.preventDefault(); props.onReset() }}>{props.t('config.reset')}</button>}</span>
      {props.children}
      <small>{props.hint}</small>
    </label>
  )
}
