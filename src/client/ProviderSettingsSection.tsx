import { useCallback, useEffect, useMemo, useState, type FormEvent, type JSX } from 'react'
import type {
  ClientConnectionHandle,
  MemoryBodyCatalog,
  MemoryBodyView,
  MemoryProviderConfigField,
  MemoryProviderConnection,
  MemoryProviderDescriptor,
  MemoryProviderId,
} from '../shared/contracts.ts'
import { MnemonClient } from './api.ts'
import css from './MnemonSettingsCard.module.css'
import type { MnemonKey, MnemonTranslate } from './locales.ts'

interface ProviderSettingsSectionProps {
  connection?: ClientConnectionHandle
  sessionId?: string
  workspaceId?: string
  workspaceLabel?: string
  refreshKey: number
  disabled: boolean
  scopeChanging: boolean
  t: MnemonTranslate
}

interface ConfigDraft {
  name: string
  description: string
  active: boolean
  connection: MemoryProviderConnection
  clearSecrets: string[]
}

function message(reason: unknown): string {
  return reason instanceof Error ? reason.message : String(reason)
}

function providerDefaults(provider: MemoryProviderDescriptor): MemoryProviderConnection {
  return Object.fromEntries(provider.fields.flatMap(field => field.defaultValue === undefined ? [] : [[field.key, field.defaultValue]]))
}

function draftFor(body: MemoryBodyView): ConfigDraft {
  return {
    name: body.name,
    description: body.description ?? '',
    active: body.active,
    connection: { ...body.provider.settings },
    clearSecrets: [],
  }
}

function newDraft(provider: MemoryProviderDescriptor, t: MnemonTranslate): ConfigDraft {
  return {
    name: t('config.providerDefaultName', { provider: provider.label }),
    description: t('config.providerDefaultDescription', { provider: provider.label }),
    active: true,
    connection: providerDefaults(provider),
    clearSecrets: [],
  }
}

function configurationComplete(provider: MemoryProviderDescriptor, draft: ConfigDraft, body?: MemoryBodyView): boolean {
  if (draft.name.trim() === '' || draft.description.trim() === '') return false
  return provider.fields.every(field => {
    if (!field.required) return true
    if (field.input === 'secret' && body?.provider.configuredSecrets.includes(field.key) === true && !draft.clearSecrets.includes(field.key)) return true
    const value = draft.connection[field.key]
    return field.input === 'boolean' ? typeof value === 'boolean' : String(value ?? '').trim() !== ''
  })
}

function fieldLabel(t: MnemonTranslate, field: MemoryProviderConfigField): string {
  const labels: Record<string, MnemonKey> = {
    endpoint: 'overview.providerEndpoint', apiKey: 'overview.providerApiKey', targetUri: 'overview.providerTargetUri', account: 'overview.providerAccount', user: 'overview.providerUser', actorPeerId: 'overview.providerActorPeer',
    workspace: 'overview.providerField.workspace', userId: 'overview.providerField.userId', agentId: 'overview.providerField.agentId', mode: 'overview.providerField.mode', rerank: 'overview.providerField.rerank',
    bankId: 'overview.providerField.bankId', budget: 'overview.providerField.budget', dataPath: 'overview.providerField.dataPath', defaultTrust: 'overview.providerField.defaultTrust', minTrust: 'overview.providerField.minTrust',
    project: 'overview.providerField.project', cliPath: 'overview.providerField.cliPath', workingDirectory: 'overview.providerField.workingDirectory', containerTag: 'overview.providerField.containerTag', searchMode: 'overview.providerField.searchMode',
  }
  return labels[field.key] === undefined ? field.label : t(labels[field.key]!)
}

function ProviderField(props: {
  field: MemoryProviderConfigField
  value: string | number | boolean | undefined
  body?: MemoryBodyView
  clearing: boolean
  disabled: boolean
  t: MnemonTranslate
  onChange: (value: string | number | boolean) => void
  onClear: (clear: boolean) => void
}): JSX.Element {
  const label = fieldLabel(props.t, props.field)
  const savedSecret = props.body?.provider.configuredSecrets.includes(props.field.key) === true
  const required = props.field.required && (!savedSecret || props.clearing)
  const input = props.field.input === 'boolean'
    ? <label className={css.providerBoolean}><input aria-label={label} type="checkbox" checked={Boolean(props.value)} disabled={props.disabled} onChange={event => props.onChange(event.target.checked)} /><span>{label}</span></label>
    : props.field.input === 'select'
      ? <label>{label}<select aria-label={label} value={String(props.value ?? '')} required={required} disabled={props.disabled} onChange={event => props.onChange(event.target.value)}>{props.field.options?.map(option => <option key={option.value} value={option.value}>{props.t(`overview.providerOption.${option.value}` as MnemonKey)}</option>)}</select></label>
      : <label>{label}<input aria-label={label} type={props.field.input === 'secret' ? 'password' : props.field.input === 'number' ? 'number' : props.field.input === 'url' ? 'url' : 'text'} value={String(props.value ?? '')} required={required} disabled={props.disabled} autoComplete={props.field.input === 'secret' ? 'new-password' : undefined} placeholder={savedSecret && !props.clearing ? props.t('overview.providerApiKeyKeep') : props.field.placeholder ?? (props.field.input === 'secret' ? props.t('overview.providerApiKeyOptional') : undefined)} maxLength={props.field.input === 'secret' ? 8000 : 2000} step={props.field.input === 'number' ? 'any' : undefined} onChange={event => props.onChange(event.target.value)} /></label>
  return <div className={css.providerFieldControl} data-input={props.field.input}>
    {input}
    {props.field.input === 'secret' && savedSecret && <label className={css.providerSecretClear}><input type="checkbox" checked={props.clearing} disabled={props.disabled} onChange={event => props.onClear(event.target.checked)} />{props.t('overview.providerSecretClear')}</label>}
  </div>
}

function ProviderConfiguration(props: {
  provider: MemoryProviderDescriptor
  body?: MemoryBodyView
  disabled: boolean
  t: MnemonTranslate
  onCreate: (draft: ConfigDraft) => Promise<void>
  onUpdate: (body: MemoryBodyView, draft: ConfigDraft) => Promise<void>
  onCancel?: () => void
}): JSX.Element {
  const [draft, setDraft] = useState<ConfigDraft>(() => props.body === undefined ? newDraft(props.provider, props.t) : draftFor(props.body))
  const [saving, setSaving] = useState(false)
  const [failed, setFailed] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (props.body !== undefined) setDraft(draftFor(props.body))
  }, [props.body])

  const updateConnection = (key: string, value: string | number | boolean): void => {
    setDraft(current => ({ ...current, connection: { ...current.connection, [key]: value } }))
    setFailed(null); setSaved(false)
  }

  const submit = async (event: FormEvent): Promise<void> => {
    event.preventDefault()
    if (!configurationComplete(props.provider, draft, props.body) || saving || props.disabled) return
    setSaving(true); setFailed(null); setSaved(false)
    try {
      if (props.body === undefined) await props.onCreate(draft)
      else await props.onUpdate(props.body, draft)
      setSaved(true)
    } catch (reason) {
      setFailed(message(reason))
    } finally { setSaving(false) }
  }

  return <form className={css.memoryConfig} onSubmit={event => void submit(event)} data-provider={props.provider.id}>
    <div className={css.memoryConfigHeader}>
      <div><strong>{props.body === undefined ? props.t('config.newProviderConfig') : draft.name}</strong><small>{props.body === undefined ? props.t('config.newProviderConfigHint') : props.body!.healthy ? props.t('config.providerHealthy') : props.t('config.providerNeedsAttention')}</small></div>
      {props.body !== undefined && <label className={css.configActive}><input type="checkbox" checked={draft.active} disabled={props.disabled || saving} onChange={event => setDraft(current => ({ ...current, active: event.target.checked }))} /><span>{props.t('config.providerActive')}</span></label>}
    </div>
    <div className={css.providerIdentityFields}>
      <label>{props.t('config.providerMemoryName')}<input value={draft.name} disabled={props.disabled || saving} maxLength={100} required onChange={event => setDraft(current => ({ ...current, name: event.target.value }))} /></label>
      <label>{props.t('config.providerMemoryDescription')}<input value={draft.description} disabled={props.disabled || saving} maxLength={1000} required onChange={event => setDraft(current => ({ ...current, description: event.target.value }))} /></label>
    </div>
    <div className={css.providerSettingsGrid}>{props.provider.fields.map(field => <ProviderField key={field.key} field={field} value={draft.connection[field.key]} {...(props.body === undefined ? {} : { body: props.body })} clearing={draft.clearSecrets.includes(field.key)} disabled={props.disabled || saving} t={props.t} onChange={value => updateConnection(field.key, value)} onClear={clear => setDraft(current => ({ ...current, clearSecrets: clear ? [...new Set([...current.clearSecrets, field.key])] : current.clearSecrets.filter(key => key !== field.key) }))} />)}</div>
    <div className={css.memoryConfigFooter}>
      <div className={css.configFeedback} aria-live="polite">{failed !== null && <span className={css.error}>{props.t('config.providerSaveFailed', { error: failed })}</span>}{saved && <span className={css.packSuccess}>{props.t('config.providerSaved')}</span>}</div>
      <div>{props.onCancel !== undefined && <button type="button" className={css.textButton} disabled={saving} onClick={props.onCancel}>{props.t('common.cancel')}</button>}<button type="submit" className={css.primaryPill} disabled={props.disabled || saving || !configurationComplete(props.provider, draft, props.body)}>{saving ? props.t('config.saving') : props.body === undefined ? props.t('config.createAndEnable') : props.t('config.saveProviderConfig')}</button></div>
    </div>
  </form>
}

function ProviderPanel(props: {
  provider: MemoryProviderDescriptor
  bodies: MemoryBodyView[]
  disabled: boolean
  t: MnemonTranslate
  onCreate: (provider: MemoryProviderDescriptor, draft: ConfigDraft) => Promise<void>
  onUpdate: (body: MemoryBodyView, draft: ConfigDraft) => Promise<void>
}): JSX.Element {
  const [adding, setAdding] = useState(false)
  const configured = props.bodies.length
  return <details className={css.providerPanel}>
    <summary>
      <span className={css.providerIdentity}><i className={css.providerMark} aria-hidden="true">{props.provider.label.slice(0, 1).toUpperCase()}</i><span><strong>{props.provider.label}</strong><small>{props.t(`overview.providerSummary.${props.provider.id}` as MnemonKey)}</small></span></span>
      <span className={css.providerState}>{configured === 0 ? props.t('config.providerNotConfigured') : props.t('config.providerConfiguredCount', { count: configured })}</span>
    </summary>
    <div className={css.providerPanelBody}>
      {configured === 0 || adding
        ? <ProviderConfiguration provider={props.provider} disabled={props.disabled} t={props.t} onCreate={draft => props.onCreate(props.provider, draft)} onUpdate={props.onUpdate} {...(configured === 0 ? {} : { onCancel: () => setAdding(false) })} />
        : null}
      {props.bodies.map(body => <ProviderConfiguration key={body.id} provider={props.provider} body={body} disabled={props.disabled} t={props.t} onCreate={draft => props.onCreate(props.provider, draft)} onUpdate={props.onUpdate} />)}
      {configured > 0 && !adding && <button type="button" className={css.addConfigButton} disabled={props.disabled} onClick={() => setAdding(true)}>＋ {props.t('config.addProviderConfig')}</button>}
    </div>
  </details>
}

export function ProviderSettingsSection(props: ProviderSettingsSectionProps): JSX.Element {
  const client = useMemo(() => props.connection === undefined ? null : new MnemonClient(props.connection, props.sessionId, props.workspaceId), [props.connection, props.sessionId, props.workspaceId])
  const [catalog, setCatalog] = useState<MemoryBodyCatalog | null>(null)
  const [loading, setLoading] = useState(client !== null)
  const [failed, setFailed] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (client === null) return
    setLoading(true); setFailed(null)
    try { setCatalog(await client.bodies()) } catch (reason) { setFailed(message(reason)) } finally { setLoading(false) }
  }, [client])

  useEffect(() => { void load() }, [load, props.refreshKey])

  const create = async (provider: MemoryProviderDescriptor, draft: ConfigDraft): Promise<void> => {
    if (client === null) throw new Error(props.t('config.providerUnavailable'))
    const connection = Object.fromEntries(Object.entries(draft.connection).filter(([key, value]) => provider.fields.find(field => field.key === key)?.input !== 'secret' || String(value).trim() !== ''))
    await client.createBody({ name: draft.name.trim(), description: draft.description.trim(), active: true, providerId: provider.id, connection })
    await load()
  }

  const update = async (body: MemoryBodyView, draft: ConfigDraft): Promise<void> => {
    if (client === null) throw new Error(props.t('config.providerUnavailable'))
    const provider = catalog?.providers.find(candidate => candidate.id === body.provider.id)
    const connection = provider === undefined ? draft.connection : Object.fromEntries(Object.entries(draft.connection).filter(([key, value]) => provider.fields.find(field => field.key === key)?.input !== 'secret' || String(value).trim() !== ''))
    await client.updateBody(body.id, { name: draft.name.trim(), description: draft.description.trim(), active: draft.active, connection, ...(draft.clearSecrets.length === 0 ? {} : { clearSecrets: draft.clearSecrets }) })
    await load()
  }

  const providers = catalog?.providers.filter(provider => provider.id !== 'mnemon-native') ?? []
  const disabled = props.disabled || props.scopeChanging || client === null
  return <>
    {props.scopeChanging && <p className={css.scopeChanging} role="status">{props.t('config.saveScopeBeforeProviders')}</p>}
    {props.workspaceLabel !== undefined && <p className={css.providerTarget}>{props.t('config.providerTargetWorkspace', { workspace: props.workspaceLabel })}</p>}
    {loading && <p className={css.providerLoading}>{props.t('config.loadingProviders')}</p>}
    {failed !== null && <div className={css.providerLoadError}><span className={css.error}>{props.t('config.providerLoadFailed', { error: failed })}</span><button type="button" className={css.textButton} onClick={() => void load()}>{props.t('config.retryProviders')}</button></div>}
    {!loading && failed === null && providers.map(provider => <ProviderPanel key={provider.id} provider={provider} bodies={catalog?.items.filter(body => body.provider.id === provider.id) ?? []} disabled={disabled} t={props.t} onCreate={create} onUpdate={update} />)}
  </>
}
