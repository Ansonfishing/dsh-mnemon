import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import type { ClientConnectionHandle, ClientSettingsScope } from '../contracts.ts'
import type { Config } from '../config.ts'
import { CATEGORIES, type Category, type Insight, type SearchRequest, type StatusView } from '../service.ts'
import { MnemonClient } from './api.ts'
import { MnemonSettingsCard } from './MnemonSettingsCard.tsx'
import css from './MnemonView.module.css'

export interface MnemonViewProps {
  connection: ClientConnectionHandle
  settingsScope: ClientSettingsScope<Config>
  sessionId?: string
}

type Page = 'explore' | 'remember' | 'config'

const PAGE_NAV: Array<{ id: Page; label: string; detail: string; glyph: string }> = [
  { id: 'explore', label: '检索记忆', detail: '召回与关联', glyph: '⌕' },
  { id: 'remember', label: '沉淀记忆', detail: '审慎写回', glyph: '+' },
  { id: 'config', label: '运行状态', detail: '配置与原则', glyph: '⌘' },
]

const CATEGORY_LABELS: Record<string, string> = {
  decision: '决策',
  preference: '偏好',
  fact: '事实',
  insight: '洞察',
  context: '上下文',
  general: '通用',
}

function humanBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function InsightCard(props: {
  insight: Insight
  writeEnabled: boolean
  confirmForget: boolean
  onRelated: (insight: Insight) => void
  onRequestForget: (insight: Insight) => void
  onConfirmForget: (insight: Insight) => void
  onCancelForget: () => void
}): JSX.Element {
  const { insight } = props
  const meta = [
    insight.category !== undefined ? CATEGORY_LABELS[insight.category] ?? insight.category : undefined,
    insight.importance !== undefined ? `重要性 ${insight.importance}` : undefined,
    insight.confidence !== undefined ? `${insight.confidence} confidence` : undefined,
    insight.score !== undefined ? `score ${insight.score.toFixed(3)}` : undefined,
    insight.depth !== undefined ? `${insight.depth} 跳` : undefined,
  ].filter((entry): entry is string => entry !== undefined)
  return (
    <article className={css.insightCard}>
      <div className={css.cardTop}>
        <div className={css.badges}>
          {meta.map(entry => <span key={entry} className={css.badge}>{entry}</span>)}
        </div>
        <code className={css.id} title={insight.id}>{insight.id.slice(0, 8)}</code>
      </div>
      <p className={css.content}>{insight.content}</p>
      {(insight.tags?.length ?? 0) > 0 && (
        <div className={css.tags}>{insight.tags!.map(tag => <span key={tag}>#{tag}</span>)}</div>
      )}
      <div className={css.cardActions}>
        {props.confirmForget ? (
          <div className={css.confirmBar} role="group" aria-label="确认忘记记忆">
            <span>软删除这条记忆？</span>
            <button type="button" className={css.dangerSolidButton} onClick={() => props.onConfirmForget(insight)}>确认忘记</button>
            <button type="button" className={css.ghostButton} onClick={props.onCancelForget}>取消</button>
          </div>
        ) : (
          <>
            <button type="button" className={css.ghostButton} onClick={() => props.onRelated(insight)}>查看关联</button>
            <button type="button" className={css.ghostButton} onClick={() => void navigator.clipboard?.writeText(insight.id)}>复制 ID</button>
            {props.writeEnabled && (
              <button type="button" className={css.dangerButton} onClick={() => props.onRequestForget(insight)}>忘记</button>
            )}
          </>
        )}
      </div>
    </article>
  )
}

export function MnemonView({ connection, settingsScope }: MnemonViewProps): JSX.Element {
  const client = useMemo(() => new MnemonClient(connection), [connection])
  const [page, setPage] = useState<Page>('explore')
  const [status, setStatus] = useState<StatusView | null>(null)
  const [statusLoading, setStatusLoading] = useState(true)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<'smart' | 'keyword' | 'basic'>('smart')
  const [category, setCategory] = useState<Category | ''>('')
  const [results, setResults] = useState<Insight[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const [relatedTo, setRelatedTo] = useState<Insight | null>(null)
  const [related, setRelated] = useState<Insight[]>([])
  const [relatedLoading, setRelatedLoading] = useState(false)
  const [content, setContent] = useState('')
  const [rememberCategory, setRememberCategory] = useState<Category>('general')
  const [importance, setImportance] = useState(3)
  const [tags, setTags] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveResult, setSaveResult] = useState<string | null>(null)
  const [confirmForgetId, setConfirmForgetId] = useState<string | null>(null)

  const loadStatus = useCallback(async () => {
    setStatusLoading(true)
    setStatusError(null)
    try {
      setStatus(await client.status())
    } catch (error) {
      setStatusError(message(error))
    } finally {
      setStatusLoading(false)
    }
  }, [client])

  useEffect(() => { void loadStatus() }, [loadStatus])

  const performSearch = useCallback(async (event?: FormEvent) => {
    event?.preventDefault()
    if (query.trim() === '') return
    setSearching(true)
    setSearchError(null)
    setSearched(true)
    setRelatedTo(null)
    setConfirmForgetId(null)
    try {
      const response = await client.search({
        query,
        mode,
        ...(category === '' ? {} : { category }),
        limit: status?.defaultRecallLimit ?? 10,
      })
      setResults(response.results)
    } catch (error) {
      setSearchError(message(error))
      setResults([])
    } finally {
      setSearching(false)
    }
  }, [category, client, mode, query, status?.defaultRecallLimit])

  const showRelated = useCallback(async (insight: Insight) => {
    setRelatedTo(insight)
    setRelated([])
    setRelatedLoading(true)
    try {
      setRelated(await client.related(insight.id))
    } catch (error) {
      setSearchError(message(error))
    } finally {
      setRelatedLoading(false)
    }
  }, [client])

  const forget = useCallback(async (insight: Insight) => {
    try {
      await client.forget(insight.id)
      setResults(items => items.filter(item => item.id !== insight.id))
      setRelated(items => items.filter(item => item.id !== insight.id))
      if (relatedTo?.id === insight.id) setRelatedTo(null)
      setConfirmForgetId(null)
      void loadStatus()
    } catch (error) {
      setSearchError(message(error))
    }
  }, [client, loadStatus, relatedTo?.id])

  const saveMemory = useCallback(async (event: FormEvent) => {
    event.preventDefault()
    if (content.trim() === '') return
    setSaving(true)
    setSaveResult(null)
    try {
      const response = await client.remember({
        content,
        category: rememberCategory,
        importance,
        tags: tags.split(',').map(value => value.trim()).filter(value => value !== ''),
        source: 'user',
      })
      const action = typeof response.action === 'string' ? response.action : 'saved'
      setSaveResult(action === 'skipped' ? 'Mnemon 判定为重复内容，已跳过。' : `记忆已处理：${action}`)
      if (action !== 'skipped') {
        setContent('')
        setTags('')
      }
      void loadStatus()
    } catch (error) {
      setSaveResult(`保存失败：${message(error)}`)
    } finally {
      setSaving(false)
    }
  }, [client, content, importance, loadStatus, rememberCategory, tags])

  const writeEnabled = status?.writeEnabled === true
  const stats = status?.stats

  return (
    <main className={css.shell}>
      <header className={css.masthead}>
        <div className={css.brand}>
          <span className={css.brandMark} aria-hidden="true">M</span>
          <div>
            <div className={css.eyebrow}>EXTERNAL MEMORY GRAPH</div>
            <h1>Mnemon</h1>
            <p>让值得保留的上下文，在下一次任务中仍然可用。</p>
          </div>
        </div>
        <div className={css.statusCluster}>
          <span className={`${css.statusDot} ${status?.healthy === true ? css.online : css.offline}`} />
          <span>{statusLoading ? '检查中' : status?.healthy === true ? `已连接 · ${status.store}` : '不可用'}</span>
          <button type="button" className={css.iconButton} onClick={() => void loadStatus()} aria-label="刷新状态">↻</button>
        </div>
      </header>

      {(statusError !== null || status?.healthy === false) && (
        <div className={css.alert} role="alert">
          <strong>Mnemon 尚未就绪</strong>
          <span>{statusError ?? status?.error}</span>
        </div>
      )}

      <section className={css.telemetry} aria-label="记忆统计">
        <div className={css.telemetryLead}>
          <span className={css.telemetryPulse} aria-hidden="true" />
          <span>Memory telemetry</span>
        </div>
        <div className={css.telemetryMetric}><span>有效记忆</span><strong>{stats?.totalInsights ?? '—'}</strong></div>
        <div className={css.telemetryMetric}><span>图谱连接</span><strong>{stats?.edgeCount ?? '—'}</strong></div>
        <div className={css.telemetryMetric}><span>已识别实体</span><strong>{stats?.topEntities.length ?? '—'}</strong></div>
        <div className={css.telemetryMetric}><span>数据库</span><strong>{stats === undefined ? '—' : humanBytes(stats.dbSizeBytes)}</strong></div>
      </section>

      <div className={css.workspace}>
        <aside className={css.sidebar}>
          <nav className={css.nav} aria-label="Mnemon 页面">
            {PAGE_NAV.map(item => (
              <button key={item.id} type="button" aria-current={page === item.id ? 'page' : undefined} onClick={() => setPage(item.id)}>
                <span className={css.navGlyph} aria-hidden="true">{item.glyph}</span>
                <span><strong>{item.label}</strong><small>{item.detail}</small></span>
              </button>
            ))}
          </nav>
          <div className={css.sidebarFooter}>
            <span>ACTIVE STORE</span>
            <code>{status?.store ?? '—'}</code>
            <small>{writeEnabled ? 'Read / Write' : 'Read only'}</small>
          </div>
        </aside>

        <section className={css.canvas}>
          {page === 'explore' && (
            <div className={css.page}>
              <div className={css.pageHeader}>
                <div><span>RECALL</span><h2>检索记忆</h2><p>用问题而不是关键词堆砌，找到决策背后的上下文。</p></div>
                <code>{status?.defaultRecallLimit ?? '—'} MAX RESULTS</code>
              </div>
              <form className={css.searchBar} onSubmit={event => void performSearch(event)}>
                <div className={css.queryField}>
                  <span className={css.searchIcon} aria-hidden="true">⌕</span>
                  <input value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索决策、偏好、经验、项目约定……" aria-label="记忆查询" />
                  <kbd>↵</kbd>
                </div>
                <div className={css.searchControls}>
                  <label>分类<select value={category} onChange={event => setCategory(event.target.value as Category | '')} aria-label="记忆分类">
                    <option value="">全部分类</option>
                    {CATEGORIES.map(value => <option key={value} value={value}>{CATEGORY_LABELS[value]}</option>)}
                  </select></label>
                  <label>策略<select value={mode} onChange={event => setMode(event.target.value as 'smart' | 'keyword' | 'basic')} aria-label="检索模式">
                    <option value="smart">图增强召回</option>
                    <option value="keyword">关键词检索</option>
                    <option value="basic">基础匹配</option>
                  </select></label>
                  <button type="submit" className={css.primaryButton} disabled={searching || query.trim() === ''}>{searching ? '检索中…' : '开始召回'}</button>
                </div>
              </form>
              {searchError !== null && <div className={css.inlineError} role="alert">{searchError}</div>}
              {!searched && (
                <div className={css.emptyState}>
                  <div className={css.orbit} aria-hidden="true"><span>◎</span></div>
                  <div><span className={css.cardKicker}>READY TO RECALL</span><h2>从一个明确问题开始</h2><p>例如“为什么选用 SQLite？”或“这个项目有哪些发布约定？”。聚焦的查询会比批量加载整库更可靠。</p></div>
                </div>
              )}
              {searched && !searching && results.length === 0 && searchError === null && (
                <div className={css.emptyState}><div className={css.orbit} aria-hidden="true"><span>0</span></div><div><h2>没有命中</h2><p>换一个更具体的实体、决策或时间线关键词试试。</p></div></div>
              )}
              {results.length > 0 && (
                <div className={css.resultLayout}>
                  <div className={css.results}>
                    <div className={css.sectionHeading}><div><span>RESULT SET</span><h2>召回结果</h2></div><strong>{results.length}</strong></div>
                    {results.map(insight => (
                      <InsightCard key={insight.id} insight={insight} writeEnabled={writeEnabled} confirmForget={confirmForgetId === insight.id}
                        onRelated={item => void showRelated(item)} onRequestForget={item => setConfirmForgetId(item.id)}
                        onConfirmForget={item => void forget(item)} onCancelForget={() => setConfirmForgetId(null)} />
                    ))}
                  </div>
                  {relatedTo !== null && (
                    <aside className={css.relatedPane}>
                      <div className={css.sectionHeading}><div><span>GRAPH INSPECTOR</span><h2>关联记忆</h2></div><button type="button" onClick={() => setRelatedTo(null)} aria-label="关闭关联记忆">×</button></div>
                      <p className={css.relatedSource}>{relatedTo.content}</p>
                      {relatedLoading && <div className={css.loading}>正在遍历图谱…</div>}
                      {!relatedLoading && related.length === 0 && <div className={css.muted}>没有找到两跳内的关联节点。</div>}
                      {related.map(insight => (
                        <InsightCard key={insight.id} insight={insight} writeEnabled={writeEnabled} confirmForget={confirmForgetId === insight.id}
                          onRelated={item => void showRelated(item)} onRequestForget={item => setConfirmForgetId(item.id)}
                          onConfirmForget={item => void forget(item)} onCancelForget={() => setConfirmForgetId(null)} />
                      ))}
                    </aside>
                  )}
                </div>
              )}
            </div>
          )}

          {page === 'remember' && (
            <div className={css.page}>
              <div className={css.pageHeader}>
                <div><span>WRITEBACK</span><h2>沉淀记忆</h2><p>只保存稳定、可复用，并且未来值得再次检索的信息。</p></div>
                <code>{writeEnabled ? 'WRITE ENABLED' : 'READ ONLY'}</code>
              </div>
              {!writeEnabled ? (
                <div className={css.emptyState}><div className={css.orbit} aria-hidden="true"><span>⊘</span></div><div><h2>当前为只读模式</h2><p>在“设置 → 插件配置 → Mnemon 外置记忆”中启用写入，重启 DSH 后生效。</p></div></div>
              ) : (
                <div className={css.writebackLayout}>
                  <aside className={css.writeGuide}>
                    <span className={css.cardKicker}>DURABILITY GATE</span>
                    <h3>写入前快速判断</h3>
                    <ol><li><strong>稳定</strong><span>不是临时进度或一次性输出</span></li><li><strong>可复用</strong><span>能影响未来的选择或执行</span></li><li><strong>有上下文</strong><span>包含原因、范围和必要约束</span></li></ol>
                    <p>当前指令与仓库事实始终高于历史记忆。</p>
                  </aside>
                  <form className={css.rememberForm} onSubmit={event => void saveMemory(event)}>
                    <label className={css.fieldWide}>记忆内容<textarea value={content} onChange={event => setContent(event.target.value)} maxLength={8000} rows={9} placeholder="示例：项目选择 SQLite，因为需要单文件部署和本地优先；若并发写入成为瓶颈再评估 PostgreSQL。" /></label>
                    <div className={css.formGrid}>
                      <label>分类<select value={rememberCategory} onChange={event => setRememberCategory(event.target.value as Category)}>{CATEGORIES.map(value => <option key={value} value={value}>{CATEGORY_LABELS[value]}</option>)}</select></label>
                      <label>重要性<select value={importance} onChange={event => setImportance(Number(event.target.value))}>{[1, 2, 3, 4, 5].map(value => <option key={value} value={value}>{value} / 5</option>)}</select></label>
                      <label className={css.fieldWide}>标签（逗号分隔）<input value={tags} onChange={event => setTags(event.target.value)} placeholder="architecture, sqlite" /></label>
                    </div>
                    <div className={css.formActions}><button type="submit" className={css.primaryButton} disabled={saving || content.trim() === ''}>{saving ? '保存中…' : '写入 Mnemon'}</button>{saveResult !== null && <span role="status">{saveResult}</span>}</div>
                  </form>
                </div>
              )}
            </div>
          )}

          {page === 'config' && (
            <div className={css.page}>
              <div className={css.pageHeader}>
                <div><span>RUNTIME</span><h2>运行状态</h2><p>这里展示当前生效值；修改请前往 DSH 插件配置。</p></div>
                <code>{status?.healthy === true ? 'SYSTEM NOMINAL' : 'CHECK REQUIRED'}</code>
              </div>
              <div className={css.configGrid}>
                <div className={css.settingsPanel}><MnemonSettingsCard scope={settingsScope} /></div>
                <article className={`${css.configCard} ${css.runtimeCard}`}>
                  <div className={css.cardTitleRow}><div><span className={css.cardKicker}>CONNECTION</span><h3>Mnemon Runtime</h3></div><span className={`${css.runtimeBadge} ${status?.healthy === true ? css.runtimeOnline : css.runtimeOffline}`}>{status?.healthy === true ? 'ONLINE' : 'OFFLINE'}</span></div>
                  <dl>
                    <div><dt>CLI</dt><dd><code>{status?.cliPath ?? 'mnemon'}</code></dd></div>
                    <div><dt>版本</dt><dd>{status?.version ?? '—'}</dd></div>
                    <div><dt>Store</dt><dd><code>{status?.store ?? 'default'}</code></dd></div>
                    <div><dt>数据目录</dt><dd><code>{status?.dataDir ?? '~/.mnemon'}</code></dd></div>
                    <div><dt>超时</dt><dd>{status?.timeoutMs ?? '—'} ms</dd></div>
                    <div><dt>默认召回</dt><dd>{status?.defaultRecallLimit ?? '—'} 条</dd></div>
                    <div><dt>访问模式</dt><dd>{writeEnabled ? '读取与写入' : '只读'}</dd></div>
                  </dl>
                </article>
                <article className={css.configCard}>
                  <span className={css.cardKicker}>DSH SETTINGS</span><h3>用户配置</h3>
                  <p>在“设置 → 插件配置 → Mnemon 外置记忆”修改。值写入 <code>~/.dsh/settings.yaml</code> 的 <code>mnemon</code> 命名空间，覆盖 profile base，并在重启后生效。</p>
                  <div className={css.configPath}><span>SETTINGS PATH</span><code>~/.dsh/settings.yaml → mnemon</code></div>
                </article>
                <article className={css.configCard}>
                  <span className={css.cardKicker}>OPERATING PRINCIPLE</span><h3>记忆边界</h3>
                  <ul><li>只在记忆可能改变结果时召回。</li><li>当前用户指令和仓库事实高于旧记忆。</li><li>只沉淀稳定、可复用的洞察。</li><li>不会把整个记忆库自动注入上下文。</li></ul>
                </article>
                <article className={`${css.configCard} ${css.commandCard}`}>
                  <span className={css.cardKicker}>NATIVE COMMAND</span><h3>对话内接入</h3>
                  <code>/mnemon status</code><code>/mnemon recall &lt;query&gt;</code><code>/mnemon remember &lt;content&gt;</code>
                  <p>无需模型参与即可查询状态、召回、写入、关联和软删除。</p>
                </article>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
