import { useEffect, useMemo, useState, useSyncExternalStore, type JSX } from 'react'
import type { Config, CustomPackConfig, InteractionConfig } from '../config.ts'
import type { ClientConnectionHandle, ClientSettingsScope, ClientSettingsSnapshot, SettingsOperation } from '../contracts.ts'
import css from './MnemonSettingsCard.module.css'
import { translateZh, type MnemonTranslate } from './locales.ts'
import { MnemonPackSection } from './MnemonPackSection.tsx'

export interface MnemonSettingsCardProps {
  scope: ClientSettingsScope<Config>
  /** Separate live namespace; falls back to the core scope for older hosts. */
  interactionScope?: ClientSettingsScope<InteractionConfig>
  /** Loopback RPC used for Pack import/export; older hosts may omit it. */
  connection?: ClientConnectionHandle
  t?: MnemonTranslate
}

type CoreField = 'storageScope' | 'dataDir' | 'customPackId' | 'customPacks'
type InteractionField = 'toolviews' | 'turnBar' | 'saveAction'
type Field = CoreField | InteractionField
interface Draft extends Record<InteractionField, boolean> {
  storageScope: string
  dataDir: string
  customPackId: string
  customPacks: CustomPackConfig[]
}

const CORE_FIELDS: CoreField[] = ['storageScope', 'dataDir', 'customPackId', 'customPacks']
const INTERACTION_FIELDS: InteractionField[] = ['toolviews', 'turnBar', 'saveAction']

function record(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function coreDraft(value: Config | undefined): Pick<Draft, CoreField> {
  const resolved = value ?? {}
  const customPacks = (resolved.customPacks ?? []).filter(pack => pack.id?.trim() && pack.name?.trim() && pack.dataDir?.trim()).map(pack => ({
    id: pack.id.trim(), name: pack.name.trim(), dataDir: pack.dataDir.trim(),
  }))
  const legacyDirectory = resolved.dataDir?.trim() ?? ''
  if (legacyDirectory !== '' && !customPacks.some(pack => pack.dataDir === legacyDirectory)) {
    let id = 'legacy'
    let suffix = 2
    while (customPacks.some(pack => pack.id === id)) id = `legacy-${suffix++}`
    customPacks.push({ id, name: 'Custom Pack', dataDir: legacyDirectory })
  }
  const selected = customPacks.find(pack => pack.id === resolved.customPackId)
    ?? customPacks.find(pack => pack.dataDir === legacyDirectory)
    ?? (customPacks.length === 1 ? customPacks[0] : undefined)
  return {
    storageScope: resolved.storageScope ?? (legacyDirectory ? 'custom' : 'global'),
    dataDir: selected?.dataDir ?? legacyDirectory,
    customPackId: selected?.id ?? '',
    customPacks,
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
  if (draft.customPackId === '' || !draft.customPacks.some(pack => pack.id === draft.customPackId)) return t('config.customPackRequired')
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
  const [reset, setReset] = useState<Set<Field>>(() => new Set())
  const [saving, setSaving] = useState(false)
  const [failed, setFailed] = useState<string | null>(null)
  const [addingPack, setAddingPack] = useState(false)
  const [newPackName, setNewPackName] = useState('')
  const [newPackDirectory, setNewPackDirectory] = useState('')

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

  const stageCore = (next: Partial<Pick<Draft, CoreField>>, fields: CoreField[]): void => {
    setDraft(current => ({ ...current, ...next }))
    setDirty(current => {
      const result = new Set(current)
      for (const field of fields) result.add(field)
      return result
    })
    setReset(current => {
      const result = new Set(current)
      for (const field of fields) result.delete(field)
      return result
    })
    setFailed(null)
  }

  const chooseScope = (storageScope: string): void => {
    if (storageScope !== 'custom' || draft.customPackId !== '') return edit('storageScope', storageScope)
    let id = 'custom'
    let suffix = 2
    while (draft.customPacks.some(pack => pack.id === id)) id = `custom-${suffix++}`
    const customPacks = [...draft.customPacks, { id, name: t('config.customDefaultName'), dataDir: '' }]
    stageCore({ storageScope, customPackId: id, customPacks }, ['storageScope', 'customPackId', 'customPacks'])
  }

  const chooseCustomPack = (customPackId: string): void => {
    const pack = draft.customPacks.find(candidate => candidate.id === customPackId)
    if (pack === undefined) return
    stageCore({ customPackId, dataDir: pack.dataDir }, ['customPackId', 'dataDir'])
  }

  const editCustomDirectory = (dataDir: string): void => {
    const customPacks = draft.customPacks.map(pack => pack.id === draft.customPackId ? { ...pack, dataDir } : pack)
    stageCore({ dataDir, customPacks }, ['dataDir', 'customPacks'])
  }

  const addCustomPack = (): void => {
    const name = newPackName.trim()
    const dataDir = newPackDirectory.trim()
    if (name === '' || dataDir === '') return
    const id = `pack-${globalThis.crypto.randomUUID()}`
    const customPacks = [...draft.customPacks, { id, name, dataDir }]
    stageCore({ storageScope: 'custom', customPackId: id, dataDir, customPacks }, ['storageScope', 'customPackId', 'dataDir', 'customPacks'])
    setAddingPack(false)
    setNewPackName('')
    setNewPackDirectory('')
  }

  const removeCustomPack = (): void => {
    const customPacks = draft.customPacks.filter(pack => pack.id !== draft.customPackId)
    const selected = customPacks[0]
    stageCore({
      customPacks,
      customPackId: selected?.id ?? '',
      dataDir: selected?.dataDir ?? '',
    }, ['customPacks', 'customPackId', 'dataDir'])
  }

  const resetField = (field: Field): void => {
    setDraft(current => ({ ...current, [field]: inherited[field] }))
    setDirty(current => new Set(current).add(field))
    setReset(current => new Set(current).add(field))
    setFailed(null)
  }

  const resetFields = (fields: readonly Field[]): void => {
    for (const field of fields) {
      if (overridden(field)) resetField(field)
    }
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
      const coreOrder: CoreField[] = draft.storageScope === 'custom' ? ['customPacks', 'customPackId', 'dataDir', 'storageScope'] : CORE_FIELDS
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
  const storageOverridden = CORE_FIELDS.some(overridden)
  const interactionOverridden = INTERACTION_FIELDS.some(overridden)

  return (
    <section className={css.page} aria-label={t('config.aria')} aria-busy={saving || loading}>
      {loading ? <p className={css.loading} role="status">{t('common.loading')}</p> : <>
        <section className={css.section} aria-labelledby="mnemon-storage-heading">
          <div className={css.sectionHeading}>
            <div>
              <h2 id="mnemon-storage-heading">{t('config.storageTitle')}</h2>
              <p>{t('config.storageDescription')} {t('config.restart')}</p>
            </div>
            {storageOverridden && <button className={css.reset} type="button" disabled={coreDisabled} onClick={() => resetFields(CORE_FIELDS)}>{t('config.reset')}</button>}
          </div>

          <div className={css.choiceGrid} role="radiogroup" aria-label={t('config.scopeAria')}>
            <ChoiceCard id="mnemon-storage-global" name="mnemon-storage" label={t('config.global')} detail="~/.mnemon" checked={draft.storageScope === 'global'} disabled={coreDisabled} onChange={() => chooseScope('global')} />
            <ChoiceCard id="mnemon-storage-workspace" name="mnemon-storage" label={t('config.workspace')} detail="<workspace>/.mnemon" checked={draft.storageScope === 'workspace'} disabled={coreDisabled} onChange={() => chooseScope('workspace')} />
            <ChoiceCard id="mnemon-storage-custom" name="mnemon-storage" label={t('config.custom')} detail={draft.customPacks.find(pack => pack.id === draft.customPackId)?.name || t('config.customHintShort')} checked={draft.storageScope === 'custom'} disabled={coreDisabled} onChange={() => chooseScope('custom')} />
          </div>

          {draft.storageScope === 'custom' && <div className={css.customField}>
            <div className={css.fieldHeading}>
              <label htmlFor="mnemon-custom-pack">{t('config.customPack')}</label>
              <span className={css.inlineActions}>
                <button className={css.reset} type="button" disabled={coreDisabled} onClick={() => setAddingPack(value => !value)}>{addingPack ? t('config.cancelAddPack') : t('config.addPack')}</button>
                {draft.customPacks.length > 0 && <button className={css.reset} type="button" disabled={coreDisabled} onClick={removeCustomPack}>{t('config.removePack')}</button>}
              </span>
            </div>
            <select id="mnemon-custom-pack" aria-label={t('config.customPackAria')} value={draft.customPackId} onChange={event => chooseCustomPack(event.target.value)} disabled={coreDisabled || draft.customPacks.length === 0}>
              {draft.customPacks.length === 0 && <option value="">{t('config.noCustomPacks')}</option>}
              {draft.customPacks.map(pack => <option key={pack.id} value={pack.id}>{pack.name}</option>)}
            </select>
            <div className={css.fieldHeading}>
              <label htmlFor="mnemon-custom-directory">{t('config.customDirectory')}</label>
              {overridden('dataDir') && <button className={css.reset} type="button" disabled={coreDisabled} onClick={() => resetField('dataDir')}>{t('config.reset')}</button>}
            </div>
            <input id="mnemon-custom-directory" aria-label={t('config.customAria')} aria-describedby={`mnemon-custom-directory-hint${errorId === undefined ? '' : ` ${errorId}`}`} aria-invalid={error !== null} value={draft.dataDir} onChange={event => editCustomDirectory(event.target.value)} placeholder="~/mnemon-data" spellCheck={false} autoComplete="off" disabled={coreDisabled || draft.customPackId === ''} />
            <p id="mnemon-custom-directory-hint">{t('config.customHint')}</p>
            {addingPack && <div className={css.addPackFields}>
              <input aria-label={t('config.customPackNameAria')} value={newPackName} onChange={event => setNewPackName(event.target.value)} placeholder={t('config.customPackNamePlaceholder')} maxLength={100} disabled={coreDisabled} />
              <input aria-label={t('config.newPackDirectoryAria')} value={newPackDirectory} onChange={event => setNewPackDirectory(event.target.value)} placeholder="~/mnemon-packs/project" spellCheck={false} autoComplete="off" disabled={coreDisabled} />
              <button type="button" className={css.compactButton} disabled={coreDisabled || newPackName.trim() === '' || newPackDirectory.trim() === ''} onClick={addCustomPack}>{t('config.confirmAddPack')}</button>
            </div>}
          </div>}
        </section>

        <section className={css.section} aria-labelledby="mnemon-interaction-heading">
          <div className={css.sectionHeading}>
            <div>
              <h2 id="mnemon-interaction-heading">{t('config.interactionTitle')}</h2>
              <p>{t('config.interactionHint')}</p>
            </div>
            {interactionOverridden && <button className={css.reset} type="button" disabled={interactionDisabled} onClick={() => resetFields(INTERACTION_FIELDS)}>{t('config.reset')}</button>}
          </div>
          <div className={css.choiceGrid}>
            <ToggleCard id="mnemon-interaction-toolviews" label={t('config.interactionToolviews')} hint={t('config.interactionToolviewsHint')} checked={draft.toolviews} disabled={interactionDisabled} onChange={value => edit('toolviews', value)} />
            <ToggleCard id="mnemon-interaction-turn-bar" label={t('config.interactionTurnBar')} hint={t('config.interactionTurnBarHint')} checked={draft.turnBar} disabled={interactionDisabled} onChange={value => edit('turnBar', value)} />
            <ToggleCard id="mnemon-interaction-save-action" label={t('config.interactionSaveAction')} hint={t('config.interactionSaveActionHint')} checked={draft.saveAction} disabled={interactionDisabled} onChange={value => edit('saveAction', value)} />
          </div>
        </section>

        <MnemonPackSection
          {...(connection === undefined ? {} : { connection })}
          configuredScope={draft.storageScope}
          configuredDirectory={draft.dataDir}
          storageDirty={CORE_FIELDS.some(field => dirty.has(field))}
          t={t}
        />

        <div className={css.feedback} aria-live="polite">
          {error !== null && <p id="mnemon-settings-validation" className={css.error} role="alert">{error}</p>}
          {failed !== null && <p className={css.error} role="alert">{t('config.saveFailed', { error: failed })}</p>}
          {!writable && <p className={css.readOnly}>{t('config.readOnly')}</p>}
        </div>

        <footer className={`${css.actions} ${dirty.size > 0 ? css.actionsVisible : ''}`} aria-live="polite">
          <span>{t('config.unsaved')}</span>
          <div>
            <button type="button" className={css.discard} disabled={dirty.size === 0 || saving} onClick={discard}>{t('config.discard')}</button>
            <button type="button" className={css.save} disabled={dirty.size === 0 || saving || error !== null || !writable} onClick={() => void save()}>{saving ? t('config.saving') : t('config.save')}</button>
          </div>
        </footer>

        <p className={css.settingsNote}>{t('config.noticeBefore')} <code>.dsh/settings.yaml</code>{t('config.noticeAfter')}</p>
      </>}
    </section>
  )
}

function ChoiceCard(props: { id: string; name: string; label: string; detail: string; checked: boolean; disabled: boolean; onChange: () => void }): JSX.Element {
  return (
    <label className={css.choiceCard} htmlFor={props.id}>
      <input id={props.id} name={props.name} type="radio" aria-label={props.label} checked={props.checked} disabled={props.disabled} onChange={props.onChange} />
      <span className={css.choiceFace}>
        <strong>{props.label}</strong>
        <small>{props.detail}</small>
        <span className={css.check} aria-hidden="true">✓</span>
      </span>
    </label>
  )
}

function ToggleCard(props: { id: string; label: string; hint: string; checked: boolean; disabled: boolean; onChange: (value: boolean) => void }): JSX.Element {
  return (
    <label className={css.choiceCard} htmlFor={props.id}>
      <input id={props.id} type="checkbox" aria-label={props.label} checked={props.checked} disabled={props.disabled} onChange={event => props.onChange(event.target.checked)} />
      <span className={css.choiceFace}>
        <strong>{props.label}</strong>
        <small>{props.hint}</small>
        <span className={css.check} aria-hidden="true">✓</span>
      </span>
    </label>
  )
}
