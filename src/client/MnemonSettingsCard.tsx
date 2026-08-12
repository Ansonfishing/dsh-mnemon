import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import type { Config, ResolvedConfig } from '../config.ts'
import { DEFAULT_RECALL_LIMIT, DEFAULT_TIMEOUT_MS } from '../config-values.ts'
import type { ClientSettingsScope } from '../contracts.ts'
import css from './MnemonSettingsCard.module.css'

export interface MnemonSettingsCardProps {
  scope: ClientSettingsScope<Config>
}

type Field = keyof ResolvedConfig
type Draft = Record<Field, string | boolean>

const FIELD_ORDER: Field[] = [
  'cliPath',
  'dataDir',
  'store',
  'timeoutMs',
  'defaultRecallLimit',
  'routingGuidance',
  'lifecycleEnabled',
  'recallMode',
  'writebackMode',
  'tabEnabled',
  'writeEnabled',
]

function record(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function draftOf(value: Config | undefined): Draft {
  const resolved = value ?? {}
  return {
    cliPath: resolved.cliPath?.trim() ?? '',
    dataDir: resolved.dataDir?.trim() ?? '',
    store: resolved.store?.trim() ?? '',
    timeoutMs: String(resolved.timeoutMs ?? DEFAULT_TIMEOUT_MS),
    defaultRecallLimit: String(resolved.defaultRecallLimit ?? DEFAULT_RECALL_LIMIT),
    routingGuidance: resolved.routingGuidance ?? true,
    lifecycleEnabled: resolved.lifecycleEnabled ?? true,
    recallMode: resolved.recallMode ?? 'guided',
    writebackMode: resolved.writebackMode ?? 'guided',
    tabEnabled: resolved.tabEnabled ?? true,
    writeEnabled: resolved.writeEnabled ?? true,
  }
}

function inheritedDraft(base: unknown): Draft {
  return draftOf(record(base) as Config)
}

function isBooleanField(field: Field): field is 'routingGuidance' | 'lifecycleEnabled' | 'tabEnabled' | 'writeEnabled' {
  return field === 'routingGuidance' || field === 'lifecycleEnabled' || field === 'tabEnabled' || field === 'writeEnabled'
}

function parsed(field: Field, value: string | boolean): unknown {
  if (isBooleanField(field)) return value
  if (field === 'timeoutMs' || field === 'defaultRecallLimit') return Number(value)
  return String(value).trim()
}

function validation(draft: Draft): string | null {
  const timeout = Number(draft.timeoutMs)
  if (!Number.isInteger(timeout) || timeout < 100 || timeout > 120_000) return 'CLI 超时需为 100–120000 之间的整数。'
  const limit = Number(draft.defaultRecallLimit)
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) return '默认召回条数需为 1–50 之间的整数。'
  const store = String(draft.store).trim()
  if (store !== '' && !/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(store)) return 'Store 仅支持字母、数字、下划线和连字符。'
  if (!['guided', 'off'].includes(String(draft.recallMode))) return '召回 Hook 模式无效。'
  if (!['guided', 'off'].includes(String(draft.writebackMode))) return '沉淀 Hook 模式无效。'
  return null
}

export function MnemonSettingsCard({ scope }: MnemonSettingsCardProps): JSX.Element | null {
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
  const error = validation(draft)

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
      for (const field of FIELD_ORDER) {
        if (!dirty.has(field)) continue
        if (reset.has(field) || (!isBooleanField(field) && String(draft[field]).trim() === '' && (field === 'cliPath' || field === 'dataDir' || field === 'store'))) {
          await scope.unset(field)
        } else {
          await scope.set(field, parsed(field, draft[field]))
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
    <section className={css.card} aria-label="Mnemon 配置">
      <div className={css.panelHeader}>
        <div><span>PLUGIN CONFIG</span><h3>连接与行为</h3><p>配置 Mnemon CLI、Store、召回上限与读写策略。</p></div>
        <strong>{dirty.size > 0 ? '未保存' : '重启后生效'}</strong>
      </div>
      <div className={css.body}>
        <div className={css.notice}><span>RESTART</span> 保存到 <code>.dsh/settings.yaml</code>，重启 DSH 后应用。</div>

        <div className={css.grid}>
            <SettingField label="Mnemon CLI" hint="留空时按环境变量、PATH 与常见安装路径自动发现。" overridden={fieldMeta('cliPath')} onReset={() => resetField('cliPath')}>
              <input aria-label="Mnemon CLI" value={String(draft.cliPath)} onChange={event => edit('cliPath', event.target.value)} placeholder="自动发现" disabled={!snapshot.writable} />
            </SettingField>
            <SettingField label="数据目录" hint="Mnemon 根目录；留空沿用 MNEMON_DATA_DIR 或 ~/.mnemon。" overridden={fieldMeta('dataDir')} onReset={() => resetField('dataDir')}>
              <input aria-label="Mnemon 数据目录" value={String(draft.dataDir)} onChange={event => edit('dataDir', event.target.value)} placeholder="~/.mnemon" disabled={!snapshot.writable} />
            </SettingField>
            <SettingField label="命名 Store" hint="多个 Agent 共享时留空；需要隔离时指定稳定名称。" overridden={fieldMeta('store')} onReset={() => resetField('store')}>
              <input aria-label="Mnemon Store" value={String(draft.store)} onChange={event => edit('store', event.target.value)} placeholder="active / default" disabled={!snapshot.writable} />
            </SettingField>
            <SettingField label="CLI 超时" hint={`单次命令上限，默认 ${DEFAULT_TIMEOUT_MS} ms。`} overridden={fieldMeta('timeoutMs')} onReset={() => resetField('timeoutMs')}>
              <input aria-label="Mnemon CLI 超时" type="number" min={100} max={120000} step={100} value={String(draft.timeoutMs)} onChange={event => edit('timeoutMs', event.target.value)} disabled={!snapshot.writable} />
            </SettingField>
            <SettingField label="默认召回条数" hint={`模型工具与 WebUI 的默认上限，默认 ${DEFAULT_RECALL_LIMIT}。`} overridden={fieldMeta('defaultRecallLimit')} onReset={() => resetField('defaultRecallLimit')}>
              <input aria-label="Mnemon 默认召回条数" type="number" min={1} max={50} value={String(draft.defaultRecallLimit)} onChange={event => edit('defaultRecallLimit', event.target.value)} disabled={!snapshot.writable} />
            </SettingField>
            <SettingField label="召回 Hook" hint="guided 会在每轮首个模型请求前注入一次召回判断；off 仅保留手动工具。" overridden={fieldMeta('recallMode')} onReset={() => resetField('recallMode')}>
              <select aria-label="Mnemon 召回 Hook" value={String(draft.recallMode)} onChange={event => edit('recallMode', event.target.value)} disabled={!snapshot.writable}><option value="guided">guided · LLM 判断</option><option value="off">off · 关闭</option></select>
            </SettingField>
            <SettingField label="沉淀 Hook" hint="guided 会在 turn 关闭前安排一次受监督写回判断，并对同一 turn 去重。" overridden={fieldMeta('writebackMode')} onReset={() => resetField('writebackMode')}>
              <select aria-label="Mnemon 沉淀 Hook" value={String(draft.writebackMode)} onChange={event => edit('writebackMode', event.target.value)} disabled={!snapshot.writable}><option value="guided">guided · LLM 判断</option><option value="off">off · 关闭</option></select>
            </SettingField>
        </div>

        <div className={css.switches}>
            <SettingToggle label="记忆路由指引" hint="指导 Agent 按需召回、审慎写回。" checked={Boolean(draft.routingGuidance)} overridden={fieldMeta('routingGuidance')} disabled={!snapshot.writable} onChange={value => edit('routingGuidance', value)} onReset={() => resetField('routingGuidance')} />
            <SettingToggle label="生命周期编排" hint="为 DSH 根 Agent 启用 Prime、Recall 和 Writeback 生命周期 Hook。" checked={Boolean(draft.lifecycleEnabled)} overridden={fieldMeta('lifecycleEnabled')} disabled={!snapshot.writable} onChange={value => edit('lifecycleEnabled', value)} onReset={() => resetField('lifecycleEnabled')} />
            <SettingToggle label="会话记忆 Tab" hint="在会话页展示 Mnemon 检索与管理界面。" checked={Boolean(draft.tabEnabled)} overridden={fieldMeta('tabEnabled')} disabled={!snapshot.writable} onChange={value => edit('tabEnabled', value)} onReset={() => resetField('tabEnabled')} />
            <SettingToggle label="允许写入" hint="控制 Agent 与本机 WebUI 的 remember/link/forget 能力。" checked={Boolean(draft.writeEnabled)} overridden={fieldMeta('writeEnabled')} disabled={!snapshot.writable} onChange={value => edit('writeEnabled', value)} onReset={() => resetField('writeEnabled')} />
        </div>

        {error !== null && <p className={css.error} role="alert">{error}</p>}
        {failed !== null && <p className={css.error} role="alert">保存失败：{failed}</p>}
        {!snapshot.writable && <p className={css.readOnly}>当前部署的 settings 为只读。</p>}

        <div className={css.actions}>
          <button type="button" className={css.discard} disabled={dirty.size === 0 || saving} onClick={discard}>放弃修改</button>
          <button type="button" className={css.save} disabled={dirty.size === 0 || saving || error !== null || !snapshot.writable} onClick={() => void save()}>{saving ? '保存中…' : '保存到 settings.yaml'}</button>
        </div>
      </div>
    </section>
  )
}

function SettingField(props: { label: string; hint: string; overridden: boolean; onReset: () => void; children: JSX.Element }): JSX.Element {
  return (
    <label className={css.field}>
      <span className={css.fieldTitle}>{props.label}{props.overridden && <em>已覆盖</em>}{props.overridden && <button type="button" onClick={event => { event.preventDefault(); props.onReset() }}>恢复默认</button>}</span>
      {props.children}
      <small>{props.hint}</small>
    </label>
  )
}

function SettingToggle(props: { label: string; hint: string; checked: boolean; overridden: boolean; disabled: boolean; onChange: (value: boolean) => void; onReset: () => void }): JSX.Element {
  return (
    <div className={css.toggleRow}>
      <span><strong>{props.label}{props.overridden && <em>已覆盖</em>}</strong><small>{props.hint}</small></span>
      {props.overridden && <button type="button" className={css.resetLink} onClick={props.onReset}>恢复默认</button>}
      <label className={css.switch}><input type="checkbox" aria-label={props.label} checked={props.checked} disabled={props.disabled} onChange={event => props.onChange(event.target.checked)} /><span /></label>
    </div>
  )
}
