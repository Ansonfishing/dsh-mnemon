import { useEffect, useMemo, useRef, useState, type ChangeEvent, type JSX } from 'react'
import type { ClientConnectionHandle } from '../contracts.ts'
import type { MnemonPackComponent, MnemonPackExport, MnemonPackImportMode, MnemonPackPreview, MnemonPackScope } from '../pack.ts'
import { MnemonClient } from './api.ts'
import type { MnemonTranslate } from './locales.ts'
import css from './MnemonSettingsCard.module.css'

interface MnemonPackSectionProps {
  connection?: ClientConnectionHandle
  configuredScope: string
  configuredDirectory: string
  storageDirty: boolean
  t: MnemonTranslate
}

interface PendingPack {
  requestedScope: MnemonPackScope
  base64: string
  preview: MnemonPackPreview
  components: MnemonPackComponent[]
}

const PACK_ACCEPT = '.mnemonpack,application/vnd.mnemon.pack+zip,application/zip'

function fileBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error ?? new Error('Could not read Pack file'))
    reader.onload = () => {
      const value = reader.result
      if (typeof value !== 'string') return reject(new Error('Could not read Pack file'))
      const separator = value.indexOf(',')
      if (separator < 0) return reject(new Error('Pack file encoding is invalid'))
      resolve(value.slice(separator + 1))
    }
    reader.readAsDataURL(file)
  })
}

function bytesFromBase64(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return bytes
}

function download(result: MnemonPackExport): void {
  const bytes = bytesFromBase64(result.base64)
  const buffer = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(buffer).set(bytes)
  const blob = new Blob([buffer], { type: result.mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = result.fileName
  anchor.hidden = true
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function MnemonPackSection({ connection, configuredScope, configuredDirectory, storageDirty, t }: MnemonPackSectionProps): JSX.Element {
  const client = useMemo(() => connection === undefined ? null : new MnemonClient(connection), [connection])
  const inputs = useRef<Partial<Record<MnemonPackScope, HTMLInputElement | null>>>({})
  const [target, setTarget] = useState<{ root: string; scope: 'global' | 'workspace' | 'custom'; customPackId?: string } | null>(null)
  const [targetFailed, setTargetFailed] = useState<string | null>(null)
  const [pending, setPending] = useState<PendingPack | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [failed, setFailed] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [confirmReplace, setConfirmReplace] = useState(false)

  useEffect(() => {
    let active = true
    if (client === null) return
    setTargetFailed(null)
    void client.packTarget().then(value => {
      if (active) setTarget(value)
    }).catch(reason => {
      if (active) setTargetFailed(reason instanceof Error ? reason.message : String(reason))
    })
    return () => { active = false }
  }, [client])

  const scopeLabel = (scope: string): string => scope === 'global' ? t('config.global') : scope === 'workspace' ? t('config.workspace') : t('config.custom')
  const componentLabel = (component: MnemonPackComponent): string => component === 'runtime'
    ? t('config.packRuntime')
    : component === 'documents' ? t('config.packDocuments') : t('config.packMemorySpaces')
  const absoluteConfiguredDirectory = configuredDirectory.trim().startsWith('/') ? configuredDirectory.trim() : null
  const restartPending = target !== null && (storageDirty || configuredScope !== target.scope || (configuredScope === 'custom' && absoluteConfiguredDirectory !== null && absoluteConfiguredDirectory !== target.root))
  const unavailable = client === null || targetFailed !== null

  const scopes: Array<{ scope: MnemonPackScope; glyph: string; title: string; hint: string }> = [
    { scope: 'full', glyph: 'PK', title: t('config.packFull'), hint: t('config.packFullHint') },
    { scope: 'runtime', glyph: 'RT', title: t('config.packRuntime'), hint: t('config.packRuntimeHint') },
    { scope: 'documents', glyph: 'DC', title: t('config.packDocuments'), hint: t('config.packDocumentsHint') },
    { scope: 'memory-spaces', glyph: 'DB', title: t('config.packMemorySpaces'), hint: t('config.packMemorySpacesHint') },
  ]

  const exportScope = async (scope: MnemonPackScope): Promise<void> => {
    if (client === null || busy !== null) return
    setBusy(`export:${scope}`); setFailed(null); setNotice(null)
    try {
      const result = await client.exportPack(scope)
      download(result)
      setNotice(t('config.packExported', { file: result.fileName, size: formatBytes(result.bytes) }))
    } catch (reason) {
      setFailed(reason instanceof Error ? reason.message : String(reason))
    } finally {
      setBusy(null)
    }
  }

  const inspectFile = async (requestedScope: MnemonPackScope, file: File): Promise<void> => {
    if (client === null || busy !== null) return
    setBusy(`inspect:${requestedScope}`); setFailed(null); setNotice(null); setPending(null); setConfirmReplace(false)
    try {
      const base64 = await fileBase64(file)
      const preview = await client.inspectPack(base64, file.name)
      const components = requestedScope === 'full'
        ? [...preview.manifest.components]
        : preview.manifest.components.includes(requestedScope) ? [requestedScope] : []
      if (components.length === 0) throw new Error(t('config.packComponentMissing'))
      setPending({ requestedScope, base64, preview, components })
    } catch (reason) {
      setFailed(reason instanceof Error ? reason.message : String(reason))
    } finally {
      setBusy(null)
    }
  }

  const chooseFile = (scope: MnemonPackScope, event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (file !== undefined) void inspectFile(scope, file)
  }

  const toggleComponent = (component: MnemonPackComponent): void => {
    setPending(current => {
      if (current === null || current.requestedScope !== 'full') return current
      const components = current.components.includes(component)
        ? current.components.filter(value => value !== component)
        : current.preview.manifest.components.filter(value => value === component || current.components.includes(value))
      return { ...current, components }
    })
    setConfirmReplace(false)
  }

  const importPending = async (mode: MnemonPackImportMode): Promise<void> => {
    if (client === null || pending === null || pending.components.length === 0 || busy !== null) return
    setBusy(`import:${mode}`); setFailed(null); setNotice(null)
    try {
      const result = await client.importPack(pending.base64, mode, pending.components)
      setNotice(t('config.packImported', { components: result.components.map(componentLabel).join('、'), root: result.targetRoot }))
      setPending(null)
      setConfirmReplace(false)
    } catch (reason) {
      setFailed(reason instanceof Error ? reason.message : String(reason))
    } finally {
      setBusy(null)
    }
  }

  return (
    <section className={css.section} aria-labelledby="mnemon-pack-heading">
      <div className={css.sectionHeading}>
        <div>
          <h2 id="mnemon-pack-heading">{t('config.packTitle')}</h2>
          <p>{t('config.packDescription')}</p>
        </div>
      </div>

      <div className={css.packTarget} data-pending-restart={restartPending || undefined}>
        <span className={css.packTargetGlyph} aria-hidden="true">⌂</span>
        <div>
          <strong>{t('config.packActiveTarget')}</strong>
          {target !== null ? <><code>{target.root}</code><small>{scopeLabel(target.scope)}{target.customPackId === undefined ? '' : ` · ${target.customPackId}`}</small></> : <small>{targetFailed === null ? t('config.packTargetLoading') : t('config.packUnavailable')}</small>}
        </div>
        {restartPending && <em>{t('config.packRestartPending')}</em>}
      </div>

      <div className={css.packGrid}>
        {scopes.map(item => <article key={item.scope} className={css.packCard}>
          <div className={css.packCardHeading}>
            <span aria-hidden="true">{item.glyph}</span>
            <div><strong>{item.title}</strong><small>{item.hint}</small></div>
          </div>
          <div className={css.packCardActions}>
            <button type="button" disabled={unavailable || busy !== null} onClick={() => void exportScope(item.scope)}>{busy === `export:${item.scope}` ? t('config.packExporting') : t('config.packExport')}</button>
            <button type="button" disabled={unavailable || busy !== null} onClick={() => inputs.current[item.scope]?.click()}>{busy === `inspect:${item.scope}` ? t('config.packInspecting') : t('config.packImport')}</button>
          </div>
          <input ref={element => { inputs.current[item.scope] = element }} className={css.visuallyHidden} type="file" accept={PACK_ACCEPT} aria-label={t('config.packChooseFile', { component: item.title })} onChange={event => chooseFile(item.scope, event)} />
        </article>)}
      </div>

      <p className={css.packFormatHint}>{t('config.packFormatHint')}</p>

      {pending !== null && <section className={css.packPreview} aria-labelledby="mnemon-pack-preview-heading">
        <header>
          <div><span>{t('config.packPreviewEyebrow')}</span><strong id="mnemon-pack-preview-heading">{pending.preview.fileName ?? t('config.packUnnamed')}</strong></div>
          <button type="button" disabled={busy !== null} aria-label={t('common.cancel')} onClick={() => { setPending(null); setConfirmReplace(false) }}>×</button>
        </header>
        <dl>
          <div><dt>{t('config.packSource')}</dt><dd>{pending.preview.manifest.source.plugin} {pending.preview.manifest.source.pluginVersion} · {new Date(pending.preview.manifest.exportedAt).toLocaleString()}</dd></div>
          <div><dt>{t('config.packDestination')}</dt><dd><code>{pending.preview.targetRoot}</code></dd></div>
          <div><dt>{t('config.packArchiveSize')}</dt><dd>{formatBytes(pending.preview.archiveBytes)} / {formatBytes(pending.preview.expandedBytes)}</dd></div>
        </dl>
        <div className={css.packComponentChoices} aria-label={t('config.packComponents')}>
          {pending.preview.manifest.summary.map(summary => {
            const selected = pending.components.includes(summary.component)
            const disabled = pending.requestedScope !== 'full'
            return <label key={summary.component}>
              <input type="checkbox" checked={selected} disabled={disabled || busy !== null} onChange={() => toggleComponent(summary.component)} />
              <span><strong>{componentLabel(summary.component)}</strong><small>{t('config.packComponentSummary', { items: summary.items, files: summary.files, size: formatBytes(summary.bytes) })}</small></span>
              {pending.preview.occupied[summary.component] && <em>{t('config.packHasData')}</em>}
            </label>
          })}
        </div>
        <div className={css.packImportActions}>
          <div><strong>{t('config.packMerge')}</strong><small>{t('config.packMergeHint')}</small></div>
          <button type="button" className={css.packPrimary} disabled={busy !== null || pending.components.length === 0} onClick={() => void importPending('merge')}>{busy === 'import:merge' ? t('config.packImporting') : t('config.packMergeAction')}</button>
          <button type="button" className={css.packDangerLink} disabled={busy !== null || pending.components.length === 0} onClick={() => setConfirmReplace(true)}>{t('config.packReplaceAction')}</button>
        </div>
        {confirmReplace && <div className={css.packReplaceConfirm} role="alert">
          <div><strong>{t('config.packReplace')}</strong><span>{t('config.packReplaceHint')}</span></div>
          <button type="button" disabled={busy !== null} onClick={() => setConfirmReplace(false)}>{t('common.cancel')}</button>
          <button type="button" className={css.packDanger} disabled={busy !== null} onClick={() => void importPending('replace')}>{busy === 'import:replace' ? t('config.packImporting') : t('config.packConfirmReplace')}</button>
        </div>}
      </section>}

      <div className={css.packFeedback} aria-live="polite">
        {targetFailed !== null && <p className={css.error}>{t('config.packFailed', { error: targetFailed })}</p>}
        {failed !== null && <p className={css.error} role="alert">{t('config.packFailed', { error: failed })}</p>}
        {notice !== null && <p className={css.packSuccess}>{notice}</p>}
        {client === null && <p className={css.readOnly}>{t('config.packUnavailable')}</p>}
      </div>
    </section>
  )
}
