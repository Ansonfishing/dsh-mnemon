import { useEffect, useMemo, useState, useSyncExternalStore, type JSX } from 'react'
import type { Config, InteractionConfig } from '../config.ts'
import type { ClientSettingsScope, ClientSettingsSnapshot, SettingsOperation } from '../contracts.ts'
import css from './MnemonSettingsCard.module.css'
import { translateZh, type MnemonTranslate } from './locales.ts'

export interface MnemonSettingsCardProps {
  scope: ClientSettingsScope<Config>
  /** Separate live namespace; falls back to the core scope for older hosts. */
  interactionScope?: ClientSettingsScope<InteractionConfig>
  t?: MnemonTranslate
}

type CoreField = 'storageScope' | 'dataDir'
type InteractionField = 'toolviews' | 'turnBar' | 'saveAction'
type Field = CoreField | InteractionField
type Draft = Record<CoreField, string> & Record<InteractionField, boolean>

const CORE_FIELDS: CoreField[] = ['storageScope', 'dataDir']
const INTERACTION_FIELDS: InteractionField[] = ['toolviews', 'turnBar', 'saveAction']

function record(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function coreDraft(value: Config | undefined): Pick<Draft, CoreField> {
  const resolved = value ?? {}
  return {
    storageScope: resolved.storageScope ?? (resolved.dataDir?.trim() ? 'custom' : 'global'),
    dataDir: resolved.dataDir?.trim() ?? '',
  }
}

function interactionDraft(value: InteractionConfig | undefined): Pick<Draft, InteractionField> {
  return {
    toolviews: value?.toolviews === true,
    turnBar: value?.turnBar === true,
    saveAction: value?.saveAction === true,
  }
}

function draftOf(core: Config | undefined, interaction: InteractionConfig | undefined): Draft {
  return { ...coreDraft(core), ...interactionDraft(interaction) }
}

function validation(t: MnemonTranslate, draft: Draft): string | null {
  if (!['global', 'workspace', 'custom'].includes(draft.storageScope)) return t('config.invalidScope')
  if (draft.storageScope !== 'custom') return null
  const directory = draft.dataDir.trim()
  if (directory === '') return t('config.customRequired')
  if (!(directory === '~' || directory.startsWith('~/') || directory.startsWith('/'))) return t('config.customAbsolute')
  return null
}

function useScope<T>(scope: ClientSettingsScope<T>): ClientSettingsSnapshot<T> {
  const subscribe = useMemo(() => scope.subscribe.bind(scope), [scope])
  const getSnapshot = useMemo(() => scope.getSnapshot.bind(scope), [scope])
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

function operations(fields: readonly Field[], dirty: ReadonlySet<Field>, reset: ReadonlySet<Field>, draft: Draft): SettingsOperation[] {
  return fields.flatMap((field): SettingsOperation[] => {
    if (!dirty.has(field)) return []
    if (reset.has(field) || (field === 'dataDir' && draft.dataDir.trim() === '')) return [{ op: 'unset', path: [field] }]
    return [{ op: 'set', path: [field], value: typeof draft[field] === 'string' ? draft[field].trim() : draft[field] }]
  })
}

async function commit<T>(scope: ClientSettingsScope<T>, edits: SettingsOperation[]): Promise<void> {
  if (scope.mutate !== undefined) return scope.mutate(edits)
  for (const edit of edits) {
    if (edit.path.length === 1) {
      if (edit.op === 'set') await scope.set(edit.path[0]!, edit.value)
      else await scope.unset(edit.path[0]!)
    } else if (edit.op === 'set') await scope.setPath(edit.path, edit.value)
    else await scope.unsetPath(edit.path)
  }
}

/** Dedicated Mnemon page contributed to DSH's Plugins settings tabs. */
export function MnemonSettingsCard({ scope, interactionScope: suppliedInteractionScope, t = translateZh }: MnemonSettingsCardProps): JSX.Element | null {
  const interactionScope = suppliedInteractionScope ?? scope as unknown as ClientSettingsScope<InteractionConfig>
  const coreSnapshot = useScope(scope)
  const interactionSnapshot = useScope(interactionScope)
  const [draft, setDraft] = useState<Draft>(() => draftOf(coreSnapshot.value, interactionSnapshot.value))
  const [dirty, setDirty] = useState<Set<Field>>(() => new Set())
  const [reset, setReset] = useState<Set<Field>>(() => new Set())
  const [saving, setSaving] = useState(false)
  const [failed, setFailed] = useState<string | null>(null)

  useEffect(() => {
    if (dirty.size === 0) setDraft(draftOf(coreSnapshot.value, interactionSnapshot.value))
  }, [dirty.size, coreSnapshot.value, interactionSnapshot.value])

  const inherited = useMemo(() => draftOf(record(coreSnapshot.base) as Config, record(interactionSnapshot.base) as InteractionConfig), [coreSnapshot.base, interactionSnapshot.base])
  const coreUser = useMemo(() => record(coreSnapshot.user), [coreSnapshot.user])
  const interactionUser = useMemo(() => record(interactionSnapshot.user), [interactionSnapshot.user])
  const error = validation(t, draft)
  const loading = coreSnapshot.status === 'loading' || interactionSnapshot.status === 'loading'
  const writable = coreSnapshot.writable && interactionSnapshot.writable

  if (coreSnapshot.status === 'unavailable' && interactionSnapshot.status === 'unavailable') return null

  const edit = (field: Field, value: string | boolean): void => {
    setDraft(current => ({ ...current, [field]: value }))
    setDirty(current => new Set(current).add(field))
    setReset(current => {
      const next = new Set(current)
      next.delete(field)
      return next
    })
    setFailed(null)
  }

  const resetField = (field: Field): void => {
    setDraft(current => ({ ...current, [field]: inherited[field] }))
    setDirty(current => new Set(current).add(field))
    setReset(current => new Set(current).add(field))
    setFailed(null)
  }

  const discard = (): void => {
    setDraft(draftOf(coreSnapshot.value, interactionSnapshot.value))
    setDirty(new Set())
    setReset(new Set())
    setFailed(null)
  }

  const save = async (): Promise<void> => {
    if (error !== null || dirty.size === 0 || saving || !writable) return
    setSaving(true)
    setFailed(null)
    try {
      const coreOrder: CoreField[] = draft.storageScope === 'custom' ? ['dataDir', 'storageScope'] : CORE_FIELDS
      const coreOps = operations(coreOrder, dirty, reset, draft)
      const interactionOps = operations(INTERACTION_FIELDS, dirty, reset, draft)
      await Promise.all([
        ...(coreOps.length === 0 ? [] : [commit(scope, coreOps)]),
        ...(interactionOps.length === 0 ? [] : [commit(interactionScope, interactionOps)]),
      ])
      setDirty(new Set())
      setReset(new Set())
    } catch (reason) {
      setFailed(reason instanceof Error ? reason.message : String(reason))
    } finally {
      setSaving(false)
    }
  }

  const overridden = (field: Field): boolean => Object.hasOwn(INTERACTION_FIELDS.includes(field as InteractionField) ? interactionUser : coreUser, field) && !reset.has(field)
  const coreDisabled = loading || saving || !coreSnapshot.writable
  const interactionDisabled = loading || saving || !interactionSnapshot.writable
  const errorId = error === null ? undefined : 'mnemon-settings-validation'

  return (
    <section className={css.page} aria-label={t('config.aria')} aria-busy={saving || loading}>
      <header className={css.pageHeader}>
        <div className={css.headerCopy}>
          <span className={css.eyebrow}>MNEMON</span>
          <h2>{t('config.title')}</h2>
          <p>{t('config.description')}</p>
        </div>
        <span className={`${css.status} ${dirty.size > 0 ? css.statusDirty : ''}`} aria-live="polite">
          {loading ? t('common.loading') : dirty.size > 0 ? t('config.unsaved') : t('config.ready')}
        </span>
      </header>

      {loading ? <p className={css.loading} role="status">{t('common.loading')}</p> : <>
        <p className={css.notice}>{t('config.noticeBefore')} <code>.dsh/settings.yaml</code>{t('config.noticeAfter')}</p>

        <section className={css.group} aria-labelledby="mnemon-storage-heading">
          <div className={css.groupHeader}>
            <div><h3 id="mnemon-storage-heading">{t('config.storageTitle')}</h3><p>{t('config.storageDescription')}</p></div>
            <span className={css.restartBadge}>{t('config.restart')}</span>
          </div>
          <div className={css.fields}>
            <SettingField controlId="mnemon-storage-scope" t={t} label={t('config.scope')} hint={t('config.scopeHint')} overridden={overridden('storageScope')} resetDisabled={coreDisabled} onReset={() => resetField('storageScope')}>
              <select id="mnemon-storage-scope" aria-label={t('config.scopeAria')} aria-describedby="mnemon-storage-scope-hint" value={draft.storageScope} onChange={event => edit('storageScope', event.target.value)} disabled={coreDisabled}><option value="global">{t('config.global')} · ~/.mnemon</option><option value="workspace">{t('config.workspace')} · &lt;workspace&gt;/.mnemon</option><option value="custom">{t('config.custom')}</option></select>
            </SettingField>
            {draft.storageScope === 'custom' && <SettingField controlId="mnemon-custom-directory" t={t} label={t('config.customDirectory')} hint={t('config.customHint')} overridden={overridden('dataDir')} resetDisabled={coreDisabled} onReset={() => resetField('dataDir')}>
              <input id="mnemon-custom-directory" aria-label={t('config.customAria')} aria-describedby={`mnemon-custom-directory-hint${errorId === undefined ? '' : ` ${errorId}`}`} aria-invalid={error !== null} value={draft.dataDir} onChange={event => edit('dataDir', event.target.value)} placeholder="~/mnemon-data" spellCheck={false} autoComplete="off" disabled={coreDisabled} />
            </SettingField>}
          </div>
        </section>

        <section className={css.group} aria-labelledby="mnemon-interaction-heading">
          <div className={css.groupHeader}>
            <div><h3 id="mnemon-interaction-heading">{t('config.interactionTitle')}</h3><p>{t('config.interactionHint')}</p></div>
            <span className={css.liveBadge}>{t('config.interactionLive')}</span>
          </div>
          <div className={css.switches}>
            <SwitchRow id="mnemon-interaction-toolviews" label={t('config.interactionToolviews')} hint={t('config.interactionToolviewsHint')} checked={draft.toolviews} disabled={interactionDisabled} overridden={overridden('toolviews')} t={t} onReset={() => resetField('toolviews')} onChange={value => edit('toolviews', value)} />
            <SwitchRow id="mnemon-interaction-turn-bar" label={t('config.interactionTurnBar')} hint={t('config.interactionTurnBarHint')} checked={draft.turnBar} disabled={interactionDisabled} overridden={overridden('turnBar')} t={t} onReset={() => resetField('turnBar')} onChange={value => edit('turnBar', value)} />
            <SwitchRow id="mnemon-interaction-save-action" label={t('config.interactionSaveAction')} hint={t('config.interactionSaveActionHint')} checked={draft.saveAction} disabled={interactionDisabled} overridden={overridden('saveAction')} t={t} onReset={() => resetField('saveAction')} onChange={value => edit('saveAction', value)} />
          </div>
        </section>

        <div className={css.feedback} aria-live="polite">
          {error !== null && <p id="mnemon-settings-validation" className={css.error} role="alert">{error}</p>}
          {failed !== null && <p className={css.error} role="alert">{t('config.saveFailed', { error: failed })}</p>}
          {!writable && <p className={css.readOnly}>{t('config.readOnly')}</p>}
        </div>

        <footer className={`${css.actions} ${dirty.size > 0 ? css.actionsVisible : ''}`}>
          <span>{dirty.size > 0 ? t('config.unsaved') : t('config.ready')}</span>
          <div>
            <button type="button" className={css.discard} disabled={dirty.size === 0 || saving} onClick={discard}>{t('config.discard')}</button>
            <button type="button" className={css.save} disabled={dirty.size === 0 || saving || error !== null || !writable} onClick={() => void save()}>{saving ? t('config.saving') : t('config.save')}</button>
          </div>
        </footer>
      </>}
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

function SwitchRow(props: { id: string; label: string; hint: string; checked: boolean; disabled: boolean; overridden: boolean; t: MnemonTranslate; onReset: () => void; onChange: (value: boolean) => void }): JSX.Element {
  return (
    <div className={css.switchRow}>
      <label htmlFor={props.id} className={css.switchCopy}><strong>{props.label}</strong><span>{props.hint}</span></label>
      <div className={css.switchControl}>
        {props.overridden && <button className={css.reset} type="button" disabled={props.disabled} onClick={props.onReset}>{props.t('config.reset')}</button>}
        <label className={css.switch}>
          <input id={props.id} type="checkbox" aria-label={props.label} checked={props.checked} disabled={props.disabled} onChange={event => props.onChange(event.target.checked)} />
          <span aria-hidden="true" />
        </label>
      </div>
    </div>
  )
}
