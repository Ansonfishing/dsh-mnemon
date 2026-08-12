import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import type { ClientConnectionHandle } from '../contracts.ts'
import { CATEGORIES, type Category, type Insight, type SearchRequest, type StatusView } from '../service.ts'
import { MnemonClient } from './api.ts'
import css from './MnemonView.module.css'

export interface MnemonViewProps {
  connection: ClientConnectionHandle
  sessionId?: string
}

type Page = 'explore' | 'remember' | 'config'

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
  onRelated: (insight: Insight) => void
  onForget: (insight: Insight) => void
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
        <button type="button" className={css.ghostButton} onClick={() => props.onRelated(insight)}>查看关联</button>
        <button type="button" className={css.ghostButton} onClick={() => void navigator.clipboard?.writeText(insight.id)}>复制 ID</button>
        {props.writeEnabled && (
          <button type="button" className={css.dangerButton} onClick={() => props.onForget(insight)}>忘记</button>
        )}
      </div>
    </article>
  )
}

export function MnemonView({ connection }: MnemonViewProps): JSX.Element {
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
    if (!window.confirm(`确定要软删除这条记忆吗？\n\n${insight.content}`)) return
    try {
      await client.forget(insight.id)
      setResults(items => items.filter(item => item.id !== insight.id))
      if (relatedTo?.id === insight.id) setRelatedTo(null)
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
      <header className={css.header}>
        <div>
          <div className={css.eyebrow}>EXTERNAL MEMORY</div>
          <h1>Mnemon 记忆</h1>
          <p>共享的持久记忆图谱；按需召回，审慎沉淀。</p>
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

      <section className={css.metrics} aria-label="记忆统计">
        <div className={css.metric}><span>有效记忆</span><strong>{stats?.totalInsights ?? '—'}</strong></div>
        <div className={css.metric}><span>图谱连接</span><strong>{stats?.edgeCount ?? '—'}</strong></div>
        <div className={css.metric}><span>实体</span><strong>{stats?.topEntities.length ?? '—'}</strong></div>
        <div className={css.metric}><span>数据库</span><strong>{stats === undefined ? '—' : humanBytes(stats.dbSizeBytes)}</strong></div>
      </section>

      <nav className={css.nav} aria-label="Mnemon 页面">
        {([['explore', '检索'], ['remember', '记住'], ['config', '配置']] as const).map(([id, label]) => (
          <button key={id} type="button" aria-current={page === id ? 'page' : undefined} onClick={() => setPage(id)}>{label}</button>
        ))}
      </nav>

      {page === 'explore' && (
        <section className={css.page}>
          <form className={css.searchBar} onSubmit={event => void performSearch(event)}>
            <span className={css.searchIcon}>⌕</span>
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索决策、偏好、经验、项目约定……" aria-label="记忆查询" />
            <select value={category} onChange={event => setCategory(event.target.value as Category | '')} aria-label="记忆分类">
              <option value="">全部分类</option>
              {CATEGORIES.map(value => <option key={value} value={value}>{CATEGORY_LABELS[value]}</option>)}
            </select>
            <select value={mode} onChange={event => setMode(event.target.value as 'smart' | 'keyword' | 'basic')} aria-label="检索模式">
              <option value="smart">图增强召回</option>
              <option value="keyword">关键词检索</option>
              <option value="basic">基础匹配</option>
            </select>
            <button type="submit" className={css.primaryButton} disabled={searching || query.trim() === ''}>{searching ? '检索中…' : '召回'}</button>
          </form>
          {searchError !== null && <div className={css.inlineError}>{searchError}</div>}
          {!searched && (
            <div className={css.emptyState}>
              <div className={css.orbit}>◎</div>
              <h2>从一个明确问题开始</h2>
              <p>例如“为什么选用 SQLite？”或“这个项目有哪些发布约定？”。聚焦的查询会比批量加载整库更可靠。</p>
            </div>
          )}
          {searched && !searching && results.length === 0 && searchError === null && (
            <div className={css.emptyState}><h2>没有命中</h2><p>换一个更具体的实体、决策或时间线关键词试试。</p></div>
          )}
          {results.length > 0 && (
            <div className={css.resultLayout}>
              <div className={css.results}>
                <div className={css.sectionHeading}><h2>召回结果</h2><span>{results.length} 条</span></div>
                {results.map(insight => <InsightCard key={insight.id} insight={insight} writeEnabled={writeEnabled} onRelated={insight => void showRelated(insight)} onForget={insight => void forget(insight)} />)}
              </div>
              {relatedTo !== null && (
                <aside className={css.relatedPane}>
                  <div className={css.sectionHeading}><h2>关联记忆</h2><button type="button" onClick={() => setRelatedTo(null)}>×</button></div>
                  <p className={css.relatedSource}>{relatedTo.content}</p>
                  {relatedLoading && <div className={css.loading}>正在遍历图谱…</div>}
                  {!relatedLoading && related.length === 0 && <div className={css.muted}>没有找到两跳内的关联节点。</div>}
                  {related.map(insight => <InsightCard key={insight.id} insight={insight} writeEnabled={writeEnabled} onRelated={insight => void showRelated(insight)} onForget={insight => void forget(insight)} />)}
                </aside>
              )}
            </div>
          )}
        </section>
      )}

      {page === 'remember' && (
        <section className={css.page}>
          {!writeEnabled ? (
            <div className={css.emptyState}><h2>当前为只读模式</h2><p>在 DSH profile 配置中将 <code>writeEnabled</code> 设为 <code>true</code> 后重启。</p></div>
          ) : (
            <form className={css.rememberForm} onSubmit={event => void saveMemory(event)}>
              <div className={css.formIntro}><span>WRITEBACK</span><h2>沉淀一条值得带走的记忆</h2><p>写清事实、原因和适用范围。Mnemon 会在写入前做重复与冲突检查。</p></div>
              <label className={css.fieldWide}>内容<textarea value={content} onChange={event => setContent(event.target.value)} maxLength={8000} rows={8} placeholder="示例：项目选择 SQLite，因为需要单文件部署和本地优先；若并发写入成为瓶颈再评估 PostgreSQL。" /></label>
              <div className={css.formGrid}>
                <label>分类<select value={rememberCategory} onChange={event => setRememberCategory(event.target.value as Category)}>{CATEGORIES.map(value => <option key={value} value={value}>{CATEGORY_LABELS[value]}</option>)}</select></label>
                <label>重要性<select value={importance} onChange={event => setImportance(Number(event.target.value))}>{[1, 2, 3, 4, 5].map(value => <option key={value} value={value}>{value} / 5</option>)}</select></label>
                <label className={css.fieldWide}>标签（逗号分隔）<input value={tags} onChange={event => setTags(event.target.value)} placeholder="architecture, sqlite" /></label>
              </div>
              <div className={css.formActions}><button type="submit" className={css.primaryButton} disabled={saving || content.trim() === ''}>{saving ? '保存中…' : '写入 Mnemon'}</button>{saveResult !== null && <span>{saveResult}</span>}</div>
            </form>
          )}
        </section>
      )}

      {page === 'config' && (
        <section className={css.page}>
          <div className={css.configGrid}>
            <article className={css.configCard}>
              <span className={css.cardKicker}>RUNTIME</span><h2>连接配置</h2>
              <dl>
                <div><dt>CLI</dt><dd><code>{status?.cliPath ?? 'mnemon'}</code></dd></div>
                <div><dt>版本</dt><dd>{status?.version ?? '—'}</dd></div>
                <div><dt>Store</dt><dd><code>{status?.store ?? 'default'}</code></dd></div>
                <div><dt>数据目录</dt><dd><code>{status?.dataDir ?? '~/.mnemon'}</code></dd></div>
                <div><dt>超时</dt><dd>{status?.timeoutMs ?? '—'} ms</dd></div>
                <div><dt>默认召回</dt><dd>{status?.defaultRecallLimit ?? '—'} 条</dd></div>
                <div><dt>写入</dt><dd>{writeEnabled ? '已启用（本机页面）' : '只读'}</dd></div>
              </dl>
            </article>
            <article className={css.configCard}>
              <span className={css.cardKicker}>SETTINGS</span><h2>用户配置</h2>
              <pre>{`# ~/.dsh/settings.yaml\nmnemon:\n  cliPath: /opt/homebrew/bin/mnemon\n  dataDir: ~/.mnemon\n  store: default\n  routingGuidance: true\n  tabEnabled: true\n  writeEnabled: true\n  timeoutMs: 10000\n  defaultRecallLimit: 10`}</pre>
              <p>推荐从“设置 → 插件配置 → Mnemon 外置记忆”修改。用户设置覆盖 profile base，并在重启 DSH 后生效。</p>
            </article>
            <article className={css.configCard}>
              <span className={css.cardKicker}>PRINCIPLE</span><h2>工作方式</h2>
              <ul><li>任务开始只在记忆可能改变结果时召回。</li><li>当前用户指令和仓库事实高于旧记忆。</li><li>任务结束只沉淀稳定、可复用、未来值得检索的洞察。</li><li>Tab 不会自动把整个记忆库注入模型上下文。</li></ul>
            </article>
          </div>
        </section>
      )}
    </main>
  )
}
