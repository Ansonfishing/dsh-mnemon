import { useEffect, useMemo, useState, useSyncExternalStore, type JSX } from 'react'
import type { Config, InteractionConfig } from '../config.ts'
import type { ClientConnectionHandle, ClientSettingsScope, ClientSettingsSnapshot, SettingsOperation } from '../contracts.ts'
import css from './MnemonSettingsCard.module.css'
import { translateZh, type MnemonTranslate } from './locales.ts'
import { MnemonPackSection } from './MnemonPackSection.tsx'

export interface MnemonSettingsCardProps {
  scope: ClientSettingsScope<Config>
  /** Separate live namespace; falls back to the core scope for older hosts. */
  interactionScope?: ClientSettingsScope<InteractionConfig>
  /** Loopback RPC used for whole-directory ZIP backup and restore. */
  connection?: ClientConnectionHandle
  t?: MnemonTranslate
}

type CoreField = 'displayMode' | 'storageScope' | 'dataDir'
type InteractionField = 'turnBar' | 'saveAction'
type Field = CoreField | InteractionField
interface Draft extends Record<InteractionField, boolean> {
  displayMode: 'sidebar' | 'buildin'
  storageScope: string
  dataDir: string
}

const CORE_FIELDS: CoreField[] = ['displayMode', 'storageScope', 'dataDir']
const INTERACTION_FIELDS: InteractionField[] = ['turnBar', 'saveAction']

function record(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function legacyPackDirectory(value: Config): string {
  const packs = value.customPacks ?? []
  return packs.find(pack => pack.id === value.customPackId)?.dataDir?.trim()
    ?? (packs.length === 1 ? packs[0]?.dataDir?.trim() : undefined)
    ?? ''
}

function coreDraft(value: Config | undefined): Pick<Draft, CoreField> {
  const resolved = value ?? {}
  const dataDir = resolved.dataDir?.trim() || legacyPackDirectory(resolved)
  return {
    displayMode: resolved.displayMode ?? 'sidebar',
    storageScope: resolved.storageScope ?? (dataDir === '' ? 'global' : 'custom'),
    dataDir,
  }
}

function interactionDraft(value: InteractionConfig | undefined): Pick<Draft, InteractionField> {
  return {
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
  const posixAbsolute = directory.startsWith('/')
  const homeRelative = directory === '~' || directory.startsWith('~/')
  const windowsDriveAbsolute = /^[a-zA-Z]:[\\/]/.test(directory)
  const windowsUncAbsolute = /^\\\\[^\\/]+[\\/][^\\/]+/.test(directory)
  if (!posixAbsolute && !homeRelative && !windowsDriveAbsolute && !windowsUncAbsolute) return t('config.customAbsolute')
  return null
}

function useScope<T>(scope: ClientSettingsScope<T>): ClientSettingsSnapshot<T> {
  const subscribe = useMemo(() => scope.subscribe.bind(scope), [scope])
  const getSnapshot = useMemo(() => scope.getSnapshot.bind(scope), [scope])
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

function operations(fields: readonly Field[], dirty: ReadonlySet<Field>, draft: Draft): SettingsOperation[] {
  return fields.flatMap((field): SettingsOperation[] => {
    if (!dirty.has(field)) return []
    if (field === 'dataDir' && draft.dataDir.trim() === '') return [{ op: 'unset', path: [field] }]
    const value = draft[field]
    return [{ op: 'set', path: [field], value: typeof value === 'string' ? value.trim() : value }]
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

/** Dedicated Mnemon page contributed directly to DSH's settings navigation. */
export function MnemonSettingsCard({ scope, interactionScope: suppliedInteractionScope, connection, t = translateZh }: MnemonSettingsCardProps): JSX.Element | null {
  const interactionScope = suppliedInteractionScope ?? scope as unknown as ClientSettingsScope<InteractionConfig>
  const coreSnapshot = useScope(scope)
  const interactionSnapshot = useScope(interactionScope)
  const [draft, setDraft] = useState<Draft>(() => draftOf(coreSnapshot.value, interactionSnapshot.value))
  const [dirty, setDirty] = useState<Set<Field>>(() => new Set())
  const [saving, setSaving] = useState(false)
  const [failed, setFailed] = useState<string | null>(null)
  const [applied, setApplied] = useState(false)
  const [targetRevision, setTargetRevision] = useState(0)

  useEffect(() => {
    if (dirty.size === 0) setDraft(draftOf(coreSnapshot.value, interactionSnapshot.value))
  }, [dirty.size, coreSnapshot.value, interactionSnapshot.value])

  const coreUser = useMemo(() => record(coreSnapshot.user), [coreSnapshot.user])
  const error = validation(t, draft)
  const loading = coreSnapshot.status === 'loading' || interactionSnapshot.status === 'loading'
  const writable = coreSnapshot.writable && interactionSnapshot.writable

  if (coreSnapshot.status === 'unavailable' && interactionSnapshot.status === 'unavailable') return null

  const edit = (field: Field, value: string | boolean): void => {
    setDraft(current => ({ ...current, [field]: value }))
    setDirty(current => new Set(current).add(field))
    setFailed(null)
    setApplied(false)
  }

  const discard = (): void => {
    setDraft(draftOf(coreSnapshot.value, interactionSnapshot.value))
    setDirty(new Set()); setFailed(null); setApplied(false)
  }

  const save = async (): Promise<void> => {
    if (error !== null || dirty.size === 0 || saving || !writable) return
    setSaving(true); setFailed(null)
    try {
      const coreOps = operations(CORE_FIELDS, dirty, draft)
      if (coreOps.length > 0) {
        if (Object.hasOwn(coreUser, 'customPackId')) coreOps.push({ op: 'unset', path: ['customPackId'] })
        if (Object.hasOwn(coreUser, 'customPacks')) coreOps.push({ op: 'unset', path: ['customPacks'] })
      }
      const interactionOps = operations(INTERACTION_FIELDS, dirty, draft)
      await Promise.all([
        ...(coreOps.length === 0 ? [] : [commit(scope, coreOps)]),
        ...(interactionOps.length === 0 ? [] : [commit(interactionScope, interactionOps)]),
      ])
      setDirty(new Set())
      setApplied(true)
      if (coreOps.length > 0) setTargetRevision(revision => revision + 1)
    } catch (reason) {
      setFailed(reason instanceof Error ? reason.message : String(reason))
    } finally {
      setSaving(false)
    }
  }

  const coreDisabled = loading || saving || !coreSnapshot.writable
  const interactionDisabled = loading || saving || !interactionSnapshot.writable
  return (
    <section className={css.page} aria-label={t('config.aria')} aria-busy={saving || loading}>
      {loading ? <p className={css.loading} role="status">{t('common.loading')}</p> : <>
        <header className={css.pageHeader}>
          <h1>{t('config.title')}</h1>
          <p>{t('config.description')}</p>
        </header>

        <section className={css.section} aria-labelledby="mnemon-display-heading">
          <div className={css.sectionHeading}>
            <div><h2 id="mnemon-display-heading">{t('config.displayTitle')}</h2><p>{t('config.displayDescription')}</p></div>
          </div>
          <div className={`${css.choiceGrid} ${css.displayGrid}`} role="radiogroup" aria-label={t('config.displayAria')}>
            <ChoiceCard id="mnemon-display-sidebar" name="mnemon-display" label={t('config.displaySidebar')} detail={t('config.displaySidebarHint')} checked={draft.displayMode === 'sidebar'} disabled={coreDisabled} onChange={() => edit('displayMode', 'sidebar')} />
            <ChoiceCard id="mnemon-display-buildin" name="mnemon-display" label={t('config.displayBuildin')} detail={t('config.displayBuildinHint')} checked={draft.displayMode === 'buildin'} disabled={coreDisabled} onChange={() => edit('displayMode', 'buildin')} />
          </div>
        </section>

        <section className={css.section} aria-labelledby="mnemon-storage-heading">
          <div className={css.sectionHeading}>
            <div><h2 id="mnemon-storage-heading">{t('config.storageTitle')}</h2><p>{t('config.storageDescription')}</p></div>
          </div>
          <div className={css.choiceGrid} role="radiogroup" aria-label={t('config.scopeAria')}>
            <ChoiceCard id="mnemon-storage-global" name="mnemon-storage" label={t('config.global')} detail="~/.mnemon" checked={draft.storageScope === 'global'} disabled={coreDisabled} onChange={() => edit('storageScope', 'global')} />
            <ChoiceCard id="mnemon-storage-workspace" name="mnemon-storage" label={t('config.workspace')} detail="<workspace>/.mnemon" checked={draft.storageScope === 'workspace'} disabled={coreDisabled} onChange={() => edit('storageScope', 'workspace')} />
            <ChoiceCard id="mnemon-storage-custom" name="mnemon-storage" label={t('config.custom')} detail={draft.dataDir === '' ? t('config.customHintShort') : t('config.customSelected')} checked={draft.storageScope === 'custom'} disabled={coreDisabled} onChange={() => edit('storageScope', 'custom')} />
          </div>
          {draft.storageScope === 'custom' && <div className={css.settingRow}>
            <div className={css.settingCopy}><strong>{t('config.customDirectory')}</strong><small>{t('config.customDirectoryHint')}</small></div>
            <div className={css.directoryControl}>
              <input
                id="mnemon-custom-directory"
                name="mnemon-custom-directory"
                type="text"
                className={css.directoryInput}
                aria-label={t('config.customAria')}
                aria-invalid={error !== null}
                placeholder={t('config.customPlaceholder')}
                value={draft.dataDir}
                disabled={coreDisabled}
                autoComplete="off"
                spellCheck={false}
                autoCapitalize="none"
                autoCorrect="off"
                onChange={event => edit('dataDir', event.target.value)}
              />
            </div>
          </div>}
        </section>

        <section className={css.section} aria-labelledby="mnemon-interaction-heading">
          <div className={css.sectionHeading}>
            <div><h2 id="mnemon-interaction-heading">{t('config.interactionTitle')}</h2><p>{t('config.interactionHint')}</p></div>
          </div>
          <div className={css.rowGroup}>
            <ToggleRow id="mnemon-interaction-turn-bar" label={t('config.interactionTurnBar')} hint={t('config.interactionTurnBarHint')} checked={draft.turnBar} disabled={interactionDisabled} onChange={value => edit('turnBar', value)} />
            <ToggleRow id="mnemon-interaction-save-action" label={t('config.interactionSaveAction')} hint={t('config.interactionSaveActionHint')} checked={draft.saveAction} disabled={interactionDisabled} onChange={value => edit('saveAction', value)} />
          </div>
        </section>

        <MnemonPackSection {...(connection === undefined ? {} : { connection })} refreshKey={targetRevision} t={t} />

        <div className={css.feedback} aria-live="polite">
          {error !== null && <p className={css.error} role="alert">{error}</p>}
          {failed !== null && <p className={css.error} role="alert">{t('config.saveFailed', { error: failed })}</p>}
          {applied && <p className={css.success} role="status">{t('config.ready')}</p>}
          {!writable && <p className={css.readOnly}>{t('config.readOnly')}</p>}
        </div>

        <footer className={`${css.actions} ${dirty.size > 0 ? css.actionsVisible : ''}`} aria-live="polite">
          <span>{t('config.unsaved')}</span>
          <div><button type="button" className={css.discard} disabled={saving} onClick={discard}>{t('config.discard')}</button><button type="button" className={css.save} disabled={saving || error !== null || !writable} onClick={() => void save()}>{saving ? t('config.saving') : t('config.save')}</button></div>
        </footer>
        <p className={css.settingsNote}>{t('config.noticeBefore')} <code>.dsh/settings.yaml</code>{t('config.noticeAfter')}</p>
      </>}
    </section>
  )
}

function ChoiceCard(props: { id: string; name: string; label: string; detail: string; checked: boolean; disabled: boolean; onChange: () => void }): JSX.Element {
  return <label className={css.choiceCard} htmlFor={props.id}><input id={props.id} name={props.name} type="radio" aria-label={props.label} checked={props.checked} disabled={props.disabled} onChange={props.onChange} /><span className={css.choiceFace}><strong>{props.label}</strong><small>{props.detail}</small><span className={css.check} aria-hidden="true">✓</span></span></label>
}

function ToggleRow(props: { id: string; label: string; hint: string; checked: boolean; disabled: boolean; onChange: (value: boolean) => void }): JSX.Element {
  return <label className={css.toggleRow} htmlFor={props.id}><span className={css.settingCopy}><strong>{props.label}</strong><small>{props.hint}</small></span><input id={props.id} type="checkbox" aria-label={props.label} checked={props.checked} disabled={props.disabled} onChange={event => props.onChange(event.target.checked)} /><span className={css.switch} aria-hidden="true"><i /></span></label>
}
