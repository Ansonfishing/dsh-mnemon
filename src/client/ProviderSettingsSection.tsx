import { useCallback, useEffect, useMemo, useState, type FormEvent, type JSX } from 'react'
import type {
  ClientConnectionHandle,
  MemoryProviderConfigField,
  MemoryProviderConnection,
  MemoryProviderDescriptor,
  MemoryProviderServiceCatalog,
  MemoryProviderServiceView,
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

interface ServiceDraft {
  settings: MemoryProviderConnection
  clearSecrets: string[]
}

function message(reason: unknown): string {
  return reason instanceof Error ? reason.message : String(reason)
}

function serviceFields(provider: MemoryProviderDescriptor): MemoryProviderConfigField[] {
  return provider.fields.filter(field => field.scope === 'service')
}

function serviceDefaults(provider: MemoryProviderDescriptor): MemoryProviderConnection {
  return Object.fromEntries(serviceFields(provider).flatMap(field => field.defaultValue === undefined ? [] : [[field.key, field.defaultValue]]))
}

function draftFor(provider: MemoryProviderDescriptor, service: MemoryProviderServiceView): ServiceDraft {
  return { settings: { ...serviceDefaults(provider), ...service.settings }, clearSecrets: [] }
}

function configurationComplete(provider: MemoryProviderDescriptor, draft: ServiceDraft, service: MemoryProviderServiceView): boolean {
  return serviceFields(provider).every(field => {
    if (!field.required) return true
    if (field.input === 'secret' && service.configuredSecrets.includes(field.key) && !draft.clearSecrets.includes(field.key)) return true
    const value = draft.settings[field.key]
    return field.input === 'boolean' ? typeof value === 'boolean' : String(value ?? '').trim() !== ''
  })
}

function fieldLabel(t: MnemonTranslate, field: MemoryProviderConfigField): string {
  const labels: Record<string, MnemonKey> = {
    endpoint: 'overview.providerEndpoint', apiKey: 'overview.providerApiKey', account: 'overview.providerAccount', mode: 'overview.providerField.mode',
    dataPath: 'overview.providerField.dataPath', cliPath: 'overview.providerField.cliPath',
  }
  return labels[field.key] === undefined ? field.label : t(labels[field.key]!)
}

function ServiceField(props: {
  field: MemoryProviderConfigField
  value: string | number | boolean | undefined
  configuredSecrets: string[]
  clearing: boolean
  disabled: boolean
  t: MnemonTranslate
  onChange: (value: string | number | boolean) => void
  onClear: (clear: boolean) => void
}): JSX.Element {
  const label = fieldLabel(props.t, props.field)
  const savedSecret = props.configuredSecrets.includes(props.field.key)
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

function ProviderServiceForm(props: {
  provider: MemoryProviderDescriptor
  service: MemoryProviderServiceView
  disabled: boolean
  t: MnemonTranslate
  onSave: (provider: MemoryProviderDescriptor, draft: ServiceDraft) => Promise<void>
}): JSX.Element {
  const [draft, setDraft] = useState<ServiceDraft>(() => draftFor(props.provider, props.service))
  const [saving, setSaving] = useState(false)
  const [failed, setFailed] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => setDraft(draftFor(props.provider, props.service)), [props.provider, props.service])

  const submit = async (event: FormEvent): Promise<void> => {
    event.preventDefault()
    if (!configurationComplete(props.provider, draft, props.service) || saving || props.disabled) return
    setSaving(true); setFailed(null); setSaved(false)
    try { await props.onSave(props.provider, draft); setSaved(true) } catch (reason) { setFailed(message(reason)) } finally { setSaving(false) }
  }

  const update = (key: string, value: string | number | boolean): void => {
    setDraft(current => ({ ...current, settings: { ...current.settings, [key]: value } }))
    setFailed(null); setSaved(false)
  }

  return <form className={css.memoryConfig} onSubmit={event => void submit(event)} data-provider={props.provider.id}>
    <div className={css.memoryConfigHeader}><div><strong>{props.t('config.providerServiceTitle')}</strong><small>{props.t('config.providerServiceHint')}</small></div></div>
    <div className={css.providerSettingsGrid}>{serviceFields(props.provider).map(field => <ServiceField key={field.key} field={field} value={draft.settings[field.key]} configuredSecrets={props.service.configuredSecrets} clearing={draft.clearSecrets.includes(field.key)} disabled={props.disabled || saving} t={props.t} onChange={value => update(field.key, value)} onClear={clear => setDraft(current => ({ ...current, clearSecrets: clear ? [...new Set([...current.clearSecrets, field.key])] : current.clearSecrets.filter(key => key !== field.key) }))} />)}</div>
    <div className={css.memoryConfigFooter}>
      <div className={css.configFeedback} aria-live="polite">{failed !== null && <span className={css.error}>{props.t('config.providerSaveFailed', { error: failed })}</span>}{saved && <span className={css.packSuccess}>{props.t('config.providerServiceSaved')}</span>}</div>
      <button type="submit" className={css.primaryPill} disabled={props.disabled || saving || !configurationComplete(props.provider, draft, props.service)}>{saving ? props.t('config.saving') : props.t('config.saveProviderService')}</button>
    </div>
  </form>
}

function ProviderPanel(props: { provider: MemoryProviderDescriptor; service: MemoryProviderServiceView; disabled: boolean; t: MnemonTranslate; onSave: (provider: MemoryProviderDescriptor, draft: ServiceDraft) => Promise<void> }): JSX.Element {
  return <details className={css.providerPanel}>
    <summary>
      <span className={css.providerIdentity}><i className={css.providerMark} aria-hidden="true">{props.provider.label.slice(0, 1).toUpperCase()}</i><span><strong>{props.provider.label}</strong><small>{props.t(`overview.providerSummary.${props.provider.id}` as MnemonKey)}</small></span></span>
      <span className={css.providerState}>{props.t(props.service.configured ? 'config.providerServiceConfigured' : 'config.providerServiceNotConfigured')}</span>
    </summary>
    <div className={css.providerPanelBody}><ProviderServiceForm {...props} /></div>
  </details>
}

export function ProviderSettingsSection(props: ProviderSettingsSectionProps): JSX.Element {
  const client = useMemo(() => props.connection === undefined ? null : new MnemonClient(props.connection, props.sessionId, props.workspaceId), [props.connection, props.sessionId, props.workspaceId])
  const [catalog, setCatalog] = useState<MemoryProviderServiceCatalog | null>(null)
  const [loading, setLoading] = useState(client !== null)
  const [failed, setFailed] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (client === null) return
    setLoading(true); setFailed(null)
    try { setCatalog(await client.providerServices()) } catch (reason) { setFailed(message(reason)) } finally { setLoading(false) }
  }, [client])

  useEffect(() => { void load() }, [load, props.refreshKey])

  const save = async (provider: MemoryProviderDescriptor, draft: ServiceDraft): Promise<void> => {
    if (client === null) throw new Error(props.t('config.providerUnavailable'))
    const settings = Object.fromEntries(Object.entries(draft.settings).filter(([key, value]) => serviceFields(provider).find(field => field.key === key)?.input !== 'secret' || String(value).trim() !== ''))
    await client.updateProviderService({ providerId: provider.id, settings, ...(draft.clearSecrets.length === 0 ? {} : { clearSecrets: draft.clearSecrets }) })
    await load()
  }

  const disabled = props.disabled || props.scopeChanging || client === null
  return <>
    {props.scopeChanging && <p className={css.scopeChanging} role="status">{props.t('config.saveScopeBeforeProviders')}</p>}
    {props.workspaceLabel !== undefined && <p className={css.providerTarget}>{props.t('config.providerTargetWorkspace', { workspace: props.workspaceLabel })}</p>}
    {loading && <p className={css.providerLoading}>{props.t('config.loadingProviders')}</p>}
    {failed !== null && <div className={css.providerLoadError}><span className={css.error}>{props.t('config.providerLoadFailed', { error: failed })}</span><button type="button" className={css.textButton} onClick={() => void load()}>{props.t('config.retryProviders')}</button></div>}
    {!loading && failed === null && catalog?.providers.map(provider => {
      const service = catalog.items.find(item => item.providerId === provider.id) ?? { providerId: provider.id, configured: false, settings: {}, configuredSecrets: [] }
      return <ProviderPanel key={provider.id} provider={provider} service={service} disabled={disabled} t={props.t} onSave={save} />
    })}
  </>
}
