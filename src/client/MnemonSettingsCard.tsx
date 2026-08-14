import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import type { Config } from '../config.ts'
import type { ClientSettingsScope } from '../contracts.ts'
import css from './MnemonSettingsCard.module.css'
import { translateZh, type MnemonTranslate } from './locales.ts'

export interface MnemonSettingsCardProps {
  scope: ClientSettingsScope<Config>
  t?: MnemonTranslate
}

type StringField = 'storageScope' | 'dataDir'
type BooleanField = 'interactionToolviews' | 'interactionTurnBar' | 'interactionSaveAction'
type Field = StringField | BooleanField
type Draft = Record<StringField, string> & Record<BooleanField, boolean>

const FIELD_ORDER: StringField[] = ['storageScope', 'dataDir']
const INTERACTION_ORDER: BooleanField[] = ['interactionToolviews', 'interactionTurnBar', 'interactionSaveAction']

/** Nested settings paths of the live interaction toggles. */
const INTERACTION_PATHS: Record<BooleanField, string[]> = {
  interactionToolviews: ['conversationInteraction', 'toolviews'],
  interactionTurnBar: ['conversationInteraction', 'turnBar'],
  interactionSaveAction: ['conversationInteraction', 'saveAction'],
}

function record(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function draftOf(value: Config | undefined): Draft {
  const resolved = value ?? {}
  const interaction = record(resolved.conversationInteraction)
  return {
    storageScope: resolved.storageScope ?? (resolved.dataDir?.trim() ? 'custom' : 'global'),
    dataDir: resolved.dataDir?.trim() ?? '',
    interactionToolviews: interaction.toolviews !== false,
    interactionTurnBar: interaction.turnBar !== false,
    interactionSaveAction: interaction.saveAction !== false,
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
  const controlsDisabled = !snapshot.writable || saving

  if (snapshot.status === 'unavailable') return null

  const edit = (field: Field, value: string | boolean) => {
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
      const order: Field[] = [...(draft.storageScope === 'custom' ? [...FIELD_ORDER].reverse() : FIELD_ORDER), ...INTERACTION_ORDER]
      for (const field of order) {
        if (!dirty.has(field)) continue
        const booleanPath = INTERACTION_PATHS[field as BooleanField]
        if (booleanPath !== undefined) {
          if (reset.has(field)) await scope.unsetPath(booleanPath)
          else await scope.setPath(booleanPath, draft[field as BooleanField] === true)
          continue
        }
        const stringField = field as StringField
        if (reset.has(stringField) || (stringField === 'dataDir' && draft.dataDir.trim() === '')) {
          await scope.unset(stringField)
        } else {
          await scope.set(stringField, draft[stringField].trim())
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
  const interactionMeta = (field: BooleanField) => {
    const group = record(overridden.conversationInteraction)
    const path = INTERACTION_PATHS[field]
    return Object.hasOwn(group, path[path.length - 1]!) && !reset.has(field)
  }
  const errorId = error === null ? undefined : 'mnemon-settings-validation'
  const loading = snapshot.status === 'loading'

  return (
    <section className={css.card} aria-label={t('config.aria')} aria-busy={saving || loading}>
      <div className={css.panelHeader}>
        <div className={css.headerCopy}><h3>Mnemon</h3><p>{t('config.description')}</p></div>
        <span className={`${css.status} ${dirty.size > 0 ? css.statusDirty : ''}`} aria-live="polite">
          {loading ? t('common.loading') : dirty.size > 0 ? t('config.unsaved') : t('config.restart')}
        </span>
      </div>
      <div className={css.body}>
        {loading ? <p className={css.loading} role="status">{t('common.loading')}</p> : <>
        <p className={css.notice}>{t('config.noticeBefore')} <code>.dsh/settings.yaml</code>{t('config.noticeAfter')}</p>

        <div className={css.primarySettings}>
          <SettingField controlId="mnemon-storage-scope" t={t} label={t('config.scope')} hint={t('config.scopeHint')} overridden={fieldMeta('storageScope')} resetDisabled={controlsDisabled} onReset={() => resetField('storageScope')}>
            <select id="mnemon-storage-scope" aria-label={t('config.scopeAria')} aria-describedby="mnemon-storage-scope-hint" value={draft.storageScope} onChange={event => edit('storageScope', event.target.value)} disabled={controlsDisabled}><option value="global">{t('config.global')} · ~/.mnemon</option><option value="workspace">{t('config.workspace')} · &lt;workspace&gt;/.mnemon</option><option value="custom">{t('config.custom')}</option></select>
          </SettingField>
          {draft.storageScope === 'custom' && <SettingField controlId="mnemon-custom-directory" t={t} label={t('config.customDirectory')} hint={t('config.customHint')} overridden={fieldMeta('dataDir')} resetDisabled={controlsDisabled} onReset={() => resetField('dataDir')}>
            <input id="mnemon-custom-directory" aria-label={t('config.customAria')} aria-describedby={`mnemon-custom-directory-hint${errorId === undefined ? '' : ` ${errorId}`}`} aria-invalid={error !== null} value={draft.dataDir} onChange={event => edit('dataDir', event.target.value)} placeholder="~/mnemon-data" spellCheck={false} autoComplete="off" disabled={controlsDisabled} />
          </SettingField>}
        </div>

        <div className={css.interactionGroup}>
          <div className={css.interactionHeader}>
            <strong>{t('config.interactionTitle')}</strong>
            <span>{t('config.interactionLive')}</span>
          </div>
          <p className={css.interactionHint}>{t('config.interactionHint')}</p>
          <SettingField controlId="mnemon-interaction-toolviews" t={t} label={t('config.interactionToolviews')} hint={t('config.interactionToolviewsHint')} overridden={interactionMeta('interactionToolviews')} resetDisabled={controlsDisabled} onReset={() => resetField('interactionToolviews')}>
            <label className={css.checkboxLine}><input id="mnemon-interaction-toolviews" type="checkbox" checked={draft.interactionToolviews} onChange={event => edit('interactionToolviews', event.target.checked)} disabled={controlsDisabled} /><span>{t('config.interactionOn')}</span></label>
          </SettingField>
          <SettingField controlId="mnemon-interaction-turn-bar" t={t} label={t('config.interactionTurnBar')} hint={t('config.interactionTurnBarHint')} overridden={interactionMeta('interactionTurnBar')} resetDisabled={controlsDisabled} onReset={() => resetField('interactionTurnBar')}>
            <label className={css.checkboxLine}><input id="mnemon-interaction-turn-bar" type="checkbox" checked={draft.interactionTurnBar} onChange={event => edit('interactionTurnBar', event.target.checked)} disabled={controlsDisabled} /><span>{t('config.interactionOn')}</span></label>
          </SettingField>
          <SettingField controlId="mnemon-interaction-save-action" t={t} label={t('config.interactionSaveAction')} hint={t('config.interactionSaveActionHint')} overridden={interactionMeta('interactionSaveAction')} resetDisabled={controlsDisabled} onReset={() => resetField('interactionSaveAction')}>
            <label className={css.checkboxLine}><input id="mnemon-interaction-save-action" type="checkbox" checked={draft.interactionSaveAction} onChange={event => edit('interactionSaveAction', event.target.checked)} disabled={controlsDisabled} /><span>{t('config.interactionOn')}</span></label>
          </SettingField>
        </div>

        <div className={css.feedback} aria-live="polite">
          {error !== null && <p id="mnemon-settings-validation" className={css.error} role="alert">{error}</p>}
          {failed !== null && <p className={css.error} role="alert">{t('config.saveFailed', { error: failed })}</p>}
          {!snapshot.writable && <p className={css.readOnly}>{t('config.readOnly')}</p>}
        </div>

        <div className={css.actions}>
          <button type="button" className={css.discard} disabled={dirty.size === 0 || saving} onClick={discard}>{t('config.discard')}</button>
          <button type="button" className={css.save} disabled={dirty.size === 0 || saving || error !== null || !snapshot.writable} onClick={() => void save()}>{saving ? t('config.saving') : t('config.save')}</button>
        </div>
        </>}
      </div>
    </section>
  )
}

function SettingField(props: { controlId: string; t: MnemonTranslate; label: string; hint: string; overridden: boolean; resetDisabled: boolean; onReset: () => void; children: JSX.Element }): JSX.Element {
  return (
    <div className={css.field}>
      <div className={css.fieldHeading}>
        <label className={css.fieldTitle} htmlFor={props.controlId}>{props.label}</label>
        {props.overridden && <em className={css.overridden}>{props.t('config.overridden')}</em>}
        {props.overridden && <button className={css.reset} type="button" disabled={props.resetDisabled} onClick={props.onReset}>{props.t('config.reset')}</button>}
      </div>
      {props.children}
      <p id={`${props.controlId}-hint`} className={css.fieldHint}>{props.hint}</p>
    </div>
  )
}
