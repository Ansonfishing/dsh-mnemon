import { useCallback, useEffect, useMemo, useState, type CSSProperties, type FormEvent } from 'react'
import type { ClientConnectionHandle, ClientSettingsScope } from '../contracts.ts'
import type { Config } from '../config.ts'
import {
  CATEGORIES,
  type Category,
  type EntityView,
  type Insight,
  type MemoryGraphNode,
  type MemoryGraphSnapshot,
  type MemoryListView,
  type StatusView,
} from '../service.ts'
import { MnemonClient } from './api.ts'
import { MnemonLogo } from './MnemonLogo.tsx'
import { MnemonSettingsCard } from './MnemonSettingsCard.tsx'
import css from './MnemonView.module.css'

export interface MnemonViewProps {
  connection: ClientConnectionHandle
  settingsScope: ClientSettingsScope<Config>
  sessionId?: string
}

type Page = 'overview' | 'explore' | 'entities' | 'remember' | 'list' | 'status'

const PAGE_NAV: Array<{ id: Page; label: string; detail: string; glyph: string }> = [
  { id: 'overview', label: '总览', detail: '实时记忆图谱', glyph: '◇' },
  { id: 'explore', label: '检索', detail: '意图增强召回', glyph: '⌕' },
  { id: 'entities', label: '实体', detail: '关系与上下文', glyph: '◎' },
  { id: 'remember', label: '沉淀', detail: '审慎写回', glyph: '+' },
  { id: 'list', label: '记忆库', detail: '浏览与维护', glyph: '≡' },
  { id: 'status', label: '状态', detail: '配置与诊断', glyph: '⌘' },
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

function short(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`
}

function PageHeader(props: { kicker: string; title: string; description: string; meta?: string; action?: JSX.Element }): JSX.Element {
  return (
    <div className={css.pageHeader}>
      <div><span>{props.kicker}</span><h2>{props.title}</h2><p>{props.description}</p></div>
      <div className={css.pageHeaderMeta}>{props.meta !== undefined && <code>{props.meta}</code>}{props.action}</div>
    </div>
  )
}

function EmptyState(props: { glyph: string; title: string; children: string }): JSX.Element {
  return (
    <div className={css.emptyState}>
      <div className={css.emptyGlyph} aria-hidden="true"><span>{props.glyph}</span></div>
      <div><h3>{props.title}</h3><p>{props.children}</p></div>
    </div>
  )
}

function InsightCard(props: {
  insight: Insight
  writeEnabled: boolean
  onForget: (insight: Insight) => Promise<void>
  onRelated?: (insight: Insight) => void
  onClone?: (insight: Insight) => void
}): JSX.Element {
  const [confirming, setConfirming] = useState(false)
  const [forgetting, setForgetting] = useState(false)
  const { insight } = props
  const meta = [
    insight.category !== undefined ? CATEGORY_LABELS[insight.category] ?? insight.category : undefined,
    insight.importance !== undefined ? `重要性 ${insight.importance}` : undefined,
    insight.score !== undefined ? `score ${insight.score.toFixed(3)}` : undefined,
    insight.depth !== undefined ? `${insight.depth} 跳` : undefined,
  ].filter((entry): entry is string => entry !== undefined)

  const forget = async () => {
    setForgetting(true)
    try {
      await props.onForget(insight)
    } finally {
      setForgetting(false)
      setConfirming(false)
    }
  }

  return (
    <article className={css.insightCard}>
      <div className={css.cardTop}>
        <div className={css.badges}>{meta.map(entry => <span key={entry} className={css.badge}>{entry}</span>)}</div>
        <code className={css.id} title={insight.id}>{insight.id.slice(0, 8)}</code>
      </div>
      <p className={css.content}>{insight.content}</p>
      {(insight.tags?.length ?? 0) > 0 && <div className={css.tags}>{insight.tags!.map(tag => <span key={tag}>#{tag}</span>)}</div>}
      {(insight.entities?.length ?? 0) > 0 && <div className={css.entities}>{insight.entities!.map(entity => <span key={entity}>{entity}</span>)}</div>}
      <div className={css.cardActions}>
        {confirming ? (
          <div className={css.confirmBar} role="group" aria-label="确认忘记记忆">
            <span>软删除这条记忆？</span>
            <button type="button" className={css.dangerSolidButton} disabled={forgetting} onClick={() => void forget()}>{forgetting ? '处理中…' : '确认忘记'}</button>
            <button type="button" className={css.ghostButton} disabled={forgetting} onClick={() => setConfirming(false)}>取消</button>
          </div>
        ) : (
          <>
            {props.onRelated !== undefined && <button type="button" className={css.ghostButton} onClick={() => props.onRelated?.(insight)}>查看关联</button>}
            {props.onClone !== undefined && <button type="button" className={css.ghostButton} onClick={() => props.onClone?.(insight)}>基于此新建</button>}
            <button type="button" className={css.ghostButton} onClick={() => void navigator.clipboard?.writeText(insight.id)}>复制 ID</button>
            {props.writeEnabled && <button type="button" className={css.dangerButton} onClick={() => setConfirming(true)}>忘记</button>}
          </>
        )}
      </div>
    </article>
  )
}

const GRAPH_ANCHORS: Record<string, [number, number]> = {
  preference: [160, 145],
  decision: [405, 110],
  fact: [705, 145],
  insight: [770, 390],
  context: [500, 425],
  general: [205, 390],
}

function hash(value: string): number {
  let result = 2166136261
  for (const char of value) result = Math.imul(result ^ char.charCodeAt(0), 16777619)
  return result >>> 0
}

function graphPositions(nodes: MemoryGraphNode[]): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>()
  const grouped = new Map<string, MemoryGraphNode[]>()
  for (const node of nodes) {
    const category = node.category ?? 'general'
    grouped.set(category, [...(grouped.get(category) ?? []), node])
  }
  for (const [category, items] of grouped) {
    const [anchorX, anchorY] = GRAPH_ANCHORS[category] ?? GRAPH_ANCHORS.general!
    items.forEach((node, index) => {
      const seed = hash(node.id)
      const angle = (index / Math.max(items.length, 1)) * Math.PI * 2 + (seed % 31) / 31
      const ring = index === 0 ? 0 : 38 + Math.floor((index - 1) / 7) * 28
      const jitter = (seed % 17) - 8
      positions.set(node.id, { x: anchorX + Math.cos(angle) * (ring + jitter), y: anchorY + Math.sin(angle) * (ring + jitter) })
    })
  }
  return positions
}

function MemoryGraph(props: { graph: MemoryGraphSnapshot; selectedId?: string | undefined; onSelect: (node: MemoryGraphNode) => void }): JSX.Element {
  const visibleNodes = props.graph.nodes.slice(0, 60)
  const positions = graphPositions(visibleNodes)
  const visibleIds = new Set(visibleNodes.map(node => node.id))
  const edges = props.graph.edges.filter(edge => visibleIds.has(edge.sourceId) && visibleIds.has(edge.targetId)).slice(0, 180)
  return (
    <svg className={css.graphSvg} viewBox="0 0 930 520" role="img" aria-label={`Mnemon 实时记忆图谱，${props.graph.nodes.length} 个节点，${props.graph.edges.length} 条连接`}>
      <defs>
        <pattern id="mnemon-grid" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M 26 0 L 0 0 0 26" className={css.graphGridLine} fill="none" /></pattern>
        <filter id="mnemon-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <rect width="930" height="520" className={css.graphBackdrop} />
      <rect width="930" height="520" fill="url(#mnemon-grid)" />
      {edges.map((edge, index) => {
        const source = positions.get(edge.sourceId)!
        const target = positions.get(edge.targetId)!
        return <line key={`${edge.sourceId}-${edge.targetId}-${index}`} x1={source.x} y1={source.y} x2={target.x} y2={target.y} className={css.graphEdge} data-edge={edge.type ?? 'temporal'} />
      })}
      {visibleNodes.map((node, index) => {
        const position = positions.get(node.id)!
        const selected = props.selectedId === node.id
        const showLabel = selected || visibleNodes.length < 22 || index % 3 === 0
        return (
          <g key={node.id} className={css.graphNode} data-category={node.category ?? 'general'} data-selected={selected || undefined}
            transform={`translate(${position.x} ${position.y})`} role="button" tabIndex={0} aria-label={`${CATEGORY_LABELS[node.category ?? 'general'] ?? node.category}: ${short(node.content, 80)}`}
            onClick={() => props.onSelect(node)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') props.onSelect(node) }}>
            <circle r={selected ? 15 : 11} className={css.nodeHalo} filter={selected ? 'url(#mnemon-glow)' : undefined} />
            <circle r={selected ? 6 : 4.5} className={css.nodeCore} />
            {showLabel && <text x="15" y="4" className={css.nodeLabel}>{short(node.content.replace(/\s+/gu, ' '), selected ? 34 : 19)}</text>}
          </g>
        )
      })}
    </svg>
  )
}

function OverviewPage(props: { client: MnemonClient; revision: number; onExplore: (query: string) => void }): JSX.Element {
  const [graph, setGraph] = useState<MemoryGraphSnapshot | null>(null)
  const [selected, setSelected] = useState<MemoryGraphNode | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true)
    setError(null)
    try {
      const next = await props.client.graph()
      setGraph(next)
      setSelected(current => current === null ? null : next.nodes.find(node => node.id === current.id) ?? null)
    } catch (reason) {
      setError(message(reason))
    } finally {
      setLoading(false)
    }
  }, [props.client])

  useEffect(() => {
    void load()
    const timer = window.setInterval(() => void load(true), 15_000)
    return () => window.clearInterval(timer)
  }, [load, props.revision])

  const generated = graph === null ? '等待首个快照' : `更新于 ${new Date(graph.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
  return (
    <div className={css.page}>
      <PageHeader kicker="LIVE OVERVIEW" title="记忆图谱" description="以 Mnemon 的四类图关系为脉络，观察当前 Store 中仍然活跃的上下文。" meta="AUTO · 15S"
        action={<button type="button" className={css.secondaryButton} disabled={loading} onClick={() => void load()}>{loading ? '同步中…' : '立即同步'}</button>} />
      {error !== null && <div className={css.inlineError} role="alert">{error}</div>}
      {graph !== null && graph.nodes.length > 0 ? (
        <div className={css.graphLayout}>
          <section className={css.graphPanel}>
            <div className={css.graphToolbar}>
              <div><span className={css.liveDot} />实时快照 <small>{generated}</small></div>
              <div className={css.graphLegend}><span data-edge="temporal">时间</span><span data-edge="semantic">语义</span><span data-edge="causal">因果</span><span data-edge="entity">实体</span></div>
            </div>
            <div className={css.graphViewport}><MemoryGraph graph={graph} selectedId={selected?.id} onSelect={setSelected} /></div>
            <div className={css.graphFooter}><span>展示 {Math.min(graph.nodes.length, 60)} / {graph.nodes.length} 个节点</span><span>{graph.edges.length} 条图谱连接</span></div>
          </section>
          <aside className={css.graphInspector}>
            {selected === null ? (
              <div className={css.inspectorEmpty}><MnemonLogo className={css.inspectorLogo} title="Mnemon node inspector" /><span>NODE INSPECTOR</span><h3>选择一个记忆节点</h3><p>查看完整内容、分类与精确 ID。</p></div>
            ) : (
              <>
                <div className={css.inspectorHeading}><span>NODE INSPECTOR</span><button type="button" onClick={() => setSelected(null)} aria-label="关闭节点详情">×</button></div>
                <span className={css.categoryChip}>{CATEGORY_LABELS[selected.category ?? 'general'] ?? selected.category}</span>
                <h3>{selected.content}</h3>
                <dl className={css.inspectorMeta}><div><dt>Memory ID</dt><dd><code>{selected.id}</code></dd></div><div><dt>Category</dt><dd>{selected.category ?? 'general'}</dd></div></dl>
                <div className={css.inspectorActions}><button type="button" className={css.primaryButton} onClick={() => props.onExplore(selected.content)}>围绕它检索</button><button type="button" className={css.secondaryButton} onClick={() => void navigator.clipboard?.writeText(selected.id)}>复制 ID</button></div>
              </>
            )}
          </aside>
        </div>
      ) : !loading && error === null ? (
        <EmptyState glyph="◇" title="图谱正在等待第一条记忆">沉淀一条稳定、可复用的上下文后，这里会实时呈现节点与关系。</EmptyState>
      ) : (
        <div className={css.loadingPanel}>正在读取 Mnemon active graph…</div>
      )}
    </div>
  )
}

function ExplorePage(props: { client: MnemonClient; status: StatusView | null; seed: string; writeEnabled: boolean; onForget: (insight: Insight) => Promise<void> }): JSX.Element {
  const [query, setQuery] = useState(props.seed)
  const [mode, setMode] = useState<'smart' | 'keyword' | 'basic'>('smart')
  const [category, setCategory] = useState<Category | ''>('')
  const [results, setResults] = useState<Insight[]>([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [relatedTo, setRelatedTo] = useState<Insight | null>(null)
  const [related, setRelated] = useState<Insight[]>([])
  const [relatedLoading, setRelatedLoading] = useState(false)

  useEffect(() => { if (props.seed !== '') setQuery(props.seed) }, [props.seed])

  const search = async (event: FormEvent) => {
    event.preventDefault()
    if (query.trim() === '') return
    setSearching(true); setSearched(true); setError(null); setRelatedTo(null)
    try {
      const response = await props.client.search({ query, mode, ...(category === '' ? {} : { category }), limit: props.status?.defaultRecallLimit ?? 10 })
      setResults(response.results)
    } catch (reason) {
      setError(message(reason)); setResults([])
    } finally {
      setSearching(false)
    }
  }

  const showRelated = async (insight: Insight) => {
    setRelatedTo(insight); setRelated([]); setRelatedLoading(true); setError(null)
    try { setRelated(await props.client.related(insight.id)) } catch (reason) { setError(message(reason)) } finally { setRelatedLoading(false) }
  }

  const forget = async (insight: Insight) => {
    await props.onForget(insight)
    setResults(items => items.filter(item => item.id !== insight.id))
    setRelated(items => items.filter(item => item.id !== insight.id))
    if (relatedTo?.id === insight.id) setRelatedTo(null)
  }

  return (
    <div className={css.page}>
      <PageHeader kicker="INTENT RECALL" title="检索记忆" description="用明确问题召回相关上下文，再沿图谱关系继续查阅。" meta={`${props.status?.defaultRecallLimit ?? '—'} MAX RESULTS`} />
      <form className={css.searchBar} onSubmit={event => void search(event)}>
        <div className={css.queryField}><span aria-hidden="true">⌕</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="为什么选用 SQLite？这个项目有哪些发布约定？" aria-label="记忆查询" /><kbd>↵</kbd></div>
        <div className={css.searchControls}>
          <label>分类<select value={category} onChange={event => setCategory(event.target.value as Category | '')} aria-label="记忆分类"><option value="">全部分类</option>{CATEGORIES.map(value => <option key={value} value={value}>{CATEGORY_LABELS[value]}</option>)}</select></label>
          <label>策略<select value={mode} onChange={event => setMode(event.target.value as 'smart' | 'keyword' | 'basic')} aria-label="检索模式"><option value="smart">图增强召回</option><option value="keyword">关键词检索</option><option value="basic">基础匹配</option></select></label>
          <button type="submit" className={css.primaryButton} disabled={searching || query.trim() === ''}>{searching ? '检索中…' : '开始召回'}</button>
        </div>
      </form>
      {error !== null && <div className={css.inlineError} role="alert">{error}</div>}
      {!searched && <EmptyState glyph="⌕" title="从一个明确问题开始">聚焦实体、决策或时间线，比批量加载整库更可靠。</EmptyState>}
      {searched && !searching && results.length === 0 && error === null && <EmptyState glyph="0" title="没有命中">换一个更具体的实体、决策或时间线关键词试试。</EmptyState>}
      {results.length > 0 && (
        <div className={relatedTo === null ? css.singleColumn : css.resultLayout}>
          <section className={css.results}><div className={css.sectionHeading}><div><span>RESULT SET</span><h3>召回结果</h3></div><strong>{results.length}</strong></div>{results.map(insight => <InsightCard key={insight.id} insight={insight} writeEnabled={props.writeEnabled} onForget={forget} onRelated={item => void showRelated(item)} />)}</section>
          {relatedTo !== null && <aside className={css.relatedPane}><div className={css.sectionHeading}><div><span>GRAPH INSPECTOR</span><h3>关联记忆</h3></div><button type="button" onClick={() => setRelatedTo(null)} aria-label="关闭关联记忆">×</button></div><p className={css.relatedSource}>{relatedTo.content}</p>{relatedLoading && <div className={css.loading}>正在遍历图谱…</div>}{!relatedLoading && related.length === 0 && <div className={css.muted}>没有找到两跳内的关联节点。</div>}{related.map(insight => <InsightCard key={insight.id} insight={insight} writeEnabled={props.writeEnabled} onForget={forget} onRelated={item => void showRelated(item)} />)}</aside>}
        </div>
      )}
    </div>
  )
}

function EntitiesPage(props: { client: MnemonClient; revision: number; writeEnabled: boolean; onForget: (insight: Insight) => Promise<void>; onExplore: (query: string) => void }): JSX.Element {
  const [view, setView] = useState<EntityView>({ items: [], insights: [] })
  const [entity, setEntity] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (selected?: string) => {
    setLoading(true); setError(null)
    try { setView(await props.client.entities(selected, 20)) } catch (reason) { setError(message(reason)) } finally { setLoading(false) }
  }, [props.client])

  useEffect(() => { void load() }, [load, props.revision])
  const submit = (event: FormEvent) => { event.preventDefault(); if (entity.trim() !== '') void load(entity) }

  return (
    <div className={css.page}>
      <PageHeader kicker="ENTITY LENS" title="实体查阅" description="选择 Mnemon 识别出的实体，召回它跨越事实、决策与上下文的关系。" meta={`${view.items.length} ACTIVE ENTITIES`} />
      <div className={css.entityLayout}>
        <aside className={css.entityRail}>
          <form className={css.entitySearch} onSubmit={submit}><input aria-label="实体名称" value={entity} onChange={event => setEntity(event.target.value)} placeholder="输入任意实体…" /><button type="submit" className={css.primaryButton} disabled={loading || entity.trim() === ''}>查阅</button></form>
          <div className={css.entityHeading}><span>TOP ENTITIES</span><small>按出现频率</small></div>
          <div className={css.entityList}>{view.items.map(item => <button key={item.entity} type="button" aria-pressed={view.selected === item.entity} onClick={() => { setEntity(item.entity); void load(item.entity) }}><span>{item.entity}</span><strong>{item.count}</strong></button>)}</div>
          {!loading && view.items.length === 0 && <p className={css.muted}>写入带实体的记忆后，这里会形成入口。</p>}
        </aside>
        <section className={css.entityResults}>
          {error !== null && <div className={css.inlineError} role="alert">{error}</div>}
          {loading && <div className={css.loadingPanel}>正在沿实体关系召回…</div>}
          {!loading && view.selected === undefined && <EmptyState glyph="◎" title="选择或输入一个实体">实体视图会聚合与它相关的记忆，而不是只做字面匹配。</EmptyState>}
          {!loading && view.selected !== undefined && <><div className={css.sectionHeading}><div><span>ENTITY CONTEXT</span><h3>{view.selected}</h3></div><strong>{view.insights.length}</strong></div>{view.insights.length === 0 ? <EmptyState glyph="0" title="没有关联记忆">尝试更完整的名称或另一个实体别名。</EmptyState> : view.insights.map(insight => <InsightCard key={insight.id} insight={insight} writeEnabled={props.writeEnabled} onForget={props.onForget} onRelated={() => props.onExplore(insight.content)} />)}</>}
        </section>
      </div>
    </div>
  )
}

function RememberPage(props: { client: MnemonClient; writeEnabled: boolean; seed: string; onMutate: () => void }): JSX.Element {
  const [content, setContent] = useState(props.seed)
  const [category, setCategory] = useState<Category>('general')
  const [importance, setImportance] = useState(3)
  const [tags, setTags] = useState('')
  const [entities, setEntities] = useState('')
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  useEffect(() => { if (props.seed !== '') setContent(props.seed) }, [props.seed])

  const save = async (event: FormEvent) => {
    event.preventDefault(); if (content.trim() === '') return
    setSaving(true); setResult(null)
    try {
      const response = await props.client.remember({ content, category, importance, tags: tags.split(',').map(value => value.trim()).filter(Boolean), entities: entities.split(',').map(value => value.trim()).filter(Boolean), source: 'user' })
      const action = typeof response.action === 'string' ? response.action : 'saved'
      setResult(action === 'skipped' ? 'Mnemon 判定为重复内容，已跳过。' : `记忆已处理：${action}`)
      if (action !== 'skipped') { setContent(''); setTags(''); setEntities(''); props.onMutate() }
    } catch (reason) { setResult(`保存失败：${message(reason)}`) } finally { setSaving(false) }
  }

  return (
    <div className={css.page}>
      <PageHeader kicker="SUPERVISED WRITEBACK" title="沉淀记忆" description="保存稳定、可复用，并且未来确实值得再次检索的信息。" meta={props.writeEnabled ? 'WRITE ENABLED' : 'READ ONLY'} />
      {!props.writeEnabled ? <EmptyState glyph="⊘" title="当前为只读模式">请在本 Tab 的“状态”页面启用写入，保存 settings.yaml 并重启 DSH。</EmptyState> : (
        <div className={css.writebackLayout}>
          <aside className={css.writeGuide}><span className={css.cardKicker}>DURABILITY GATE</span><h3>写入前快速判断</h3><ol><li><strong>稳定</strong><span>不是临时进度或一次性输出</span></li><li><strong>可复用</strong><span>能影响未来的选择或执行</span></li><li><strong>自包含</strong><span>包含原因、范围和必要约束</span></li></ol><p>当前指令与仓库事实始终高于历史记忆。</p></aside>
          <form className={css.rememberForm} onSubmit={event => void save(event)}>
            <label className={css.fieldWide}>记忆内容<textarea value={content} onChange={event => setContent(event.target.value)} maxLength={8000} rows={8} placeholder="示例：项目选择 SQLite，因为需要单文件部署和本地优先；若并发写入成为瓶颈再评估 PostgreSQL。" /></label>
            <div className={css.formGrid}><label>分类<select value={category} onChange={event => setCategory(event.target.value as Category)}>{CATEGORIES.map(value => <option key={value} value={value}>{CATEGORY_LABELS[value]}</option>)}</select></label><label>重要性<select value={importance} onChange={event => setImportance(Number(event.target.value))}>{[1, 2, 3, 4, 5].map(value => <option key={value} value={value}>{value} / 5</option>)}</select></label><label className={css.fieldWide}>实体（逗号分隔）<input value={entities} onChange={event => setEntities(event.target.value)} placeholder="SQLite, DSH" /></label><label className={css.fieldWide}>标签（逗号分隔）<input value={tags} onChange={event => setTags(event.target.value)} placeholder="architecture, local-first" /></label></div>
            <div className={css.formActions}><button type="submit" className={css.primaryButton} disabled={saving || content.trim() === ''}>{saving ? '保存中…' : '写入 Mnemon'}</button>{result !== null && <span role="status">{result}</span>}</div>
          </form>
        </div>
      )}
    </div>
  )
}

function ListPage(props: { client: MnemonClient; revision: number; writeEnabled: boolean; onForget: (insight: Insight) => Promise<void>; onClone: (insight: Insight) => void; onExplore: (query: string) => void }): JSX.Element {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | ''>('')
  const [view, setView] = useState<MemoryListView | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try { setView(await props.client.list({ ...(query.trim() === '' ? {} : { query }), ...(category === '' ? {} : { category }), limit: 1000 })) } catch (reason) { setError(message(reason)) } finally { setLoading(false) }
  }, [category, props.client, query])
  useEffect(() => { void load() }, [props.revision])
  const submit = (event: FormEvent) => { event.preventDefault(); void load() }
  const forget = async (insight: Insight) => { await props.onForget(insight); setView(current => current === null ? current : { ...current, total: Math.max(0, current.total - 1), items: current.items.filter(item => item.id !== insight.id) }) }

  return (
    <div className={css.page}>
      <PageHeader kicker="ACTIVE MEMORY LIST" title="记忆库" description="无副作用浏览 active memory；查阅、复制、基于旧内容新建或软删除。" meta={`${view?.total ?? '—'} MEMORIES`} />
      <form className={css.listToolbar} onSubmit={submit}><input aria-label="筛选记忆库" value={query} onChange={event => setQuery(event.target.value)} placeholder="按内容或精确 ID 筛选…" /><select aria-label="记忆库分类" value={category} onChange={event => setCategory(event.target.value as Category | '')}><option value="">全部分类</option>{CATEGORIES.map(value => <option key={value} value={value}>{CATEGORY_LABELS[value]}</option>)}</select><button type="submit" className={css.primaryButton} disabled={loading}>{loading ? '载入中…' : '应用筛选'}</button></form>
      <div className={css.listNotice}><span>NON-MUTATING READ</span> List 读取 Mnemon active graph，不会增加 recall 访问计数。</div>
      {error !== null && <div className={css.inlineError} role="alert">{error}</div>}
      {!loading && view?.items.length === 0 && <EmptyState glyph="≡" title="没有符合条件的记忆">清空筛选，或前往“沉淀”写入第一条稳定上下文。</EmptyState>}
      <div className={css.memoryList}>{view?.items.map(insight => <InsightCard key={insight.id} insight={insight} writeEnabled={props.writeEnabled} onForget={forget} onClone={props.onClone} onRelated={() => props.onExplore(insight.content)} />)}</div>
    </div>
  )
}

function StatusPage(props: { status: StatusView | null; loading: boolean; onRefresh: () => void; settingsScope: ClientSettingsScope<Config> }): JSX.Element {
  const status = props.status
  return (
    <div className={css.page}>
      <PageHeader kicker="RUNTIME & CONFIG" title="状态与配置" description="诊断当前运行时，并在 Mnemon 工作台内维护插件配置。" meta={status?.healthy === true ? 'SYSTEM NOMINAL' : 'CHECK REQUIRED'} action={<button type="button" className={css.secondaryButton} onClick={props.onRefresh}>{props.loading ? '检查中…' : '重新检查'}</button>} />
      <div className={css.statusGrid}>
        <article className={css.runtimeCard}><div className={css.cardTitleRow}><div><span className={css.cardKicker}>CONNECTION</span><h3>Mnemon Runtime</h3></div><span className={`${css.runtimeBadge} ${status?.healthy === true ? css.runtimeOnline : css.runtimeOffline}`}>{status?.healthy === true ? 'ONLINE' : 'OFFLINE'}</span></div><dl><div><dt>CLI</dt><dd><code>{status?.cliPath ?? 'mnemon'}</code></dd></div><div><dt>版本</dt><dd>{status?.version ?? '—'}</dd></div><div><dt>Store</dt><dd><code>{status?.store ?? 'default'}</code></dd></div><div><dt>数据目录</dt><dd><code>{status?.dataDir ?? '~/.mnemon'}</code></dd></div><div><dt>超时</dt><dd>{status?.timeoutMs ?? '—'} ms</dd></div><div><dt>默认召回</dt><dd>{status?.defaultRecallLimit ?? '—'} 条</dd></div><div><dt>访问模式</dt><dd>{status?.writeEnabled === true ? '读取与写入' : '只读'}</dd></div></dl></article>
        <article className={css.infoCard}><span className={css.cardKicker}>OPERATING PRINCIPLE</span><h3>记忆边界</h3><ul><li>只在记忆可能改变结果时召回。</li><li>当前用户指令和仓库事实高于旧记忆。</li><li>只沉淀稳定、可复用的洞察。</li><li>不会把整个记忆库自动注入上下文。</li></ul></article>
        <article className={css.infoCard}><span className={css.cardKicker}>NATIVE COMMAND</span><h3>对话内接入</h3><div className={css.commandList}><code>/mnemon status</code><code>/mnemon recall &lt;query&gt;</code><code>/mnemon remember &lt;content&gt;</code></div><p>查询状态、召回、写入、关联和软删除均可使用原生命令。</p></article>
        <div className={css.settingsPanel}><MnemonSettingsCard scope={props.settingsScope} /></div>
      </div>
    </div>
  )
}

export function MnemonView({ connection, settingsScope }: MnemonViewProps): JSX.Element {
  const client = useMemo(() => new MnemonClient(connection), [connection])
  const [page, setPage] = useState<Page>('overview')
  const [status, setStatus] = useState<StatusView | null>(null)
  const [statusLoading, setStatusLoading] = useState(true)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [revision, setRevision] = useState(0)
  const [searchSeed, setSearchSeed] = useState('')
  const [rememberSeed, setRememberSeed] = useState('')

  const loadStatus = useCallback(async () => {
    setStatusLoading(true); setStatusError(null)
    try { setStatus(await client.status()) } catch (reason) { setStatusError(message(reason)) } finally { setStatusLoading(false) }
  }, [client])
  useEffect(() => { void loadStatus() }, [loadStatus])

  const mutate = useCallback(() => { setRevision(value => value + 1); void loadStatus() }, [loadStatus])
  const forget = useCallback(async (insight: Insight) => { await client.forget(insight.id); mutate() }, [client, mutate])
  const explore = useCallback((query: string) => { setSearchSeed(query); setPage('explore') }, [])
  const clone = useCallback((insight: Insight) => { setRememberSeed(insight.content); setPage('remember') }, [])
  const refreshAll = () => { setRevision(value => value + 1); void loadStatus() }
  const writeEnabled = status?.writeEnabled === true
  const stats = status?.stats

  return (
    <main className={css.shell}>
      <header className={css.masthead}>
        <div className={css.brand}><MnemonLogo className={css.brandLogo} /><div><div className={css.eyebrow}>PERSISTENT AGENT MEMORY</div><h1>Mnemon</h1><p>LLM-supervised 4-graph persistent memory for AI agents.</p></div></div>
        <div className={css.statusCluster}><span className={`${css.statusDot} ${status?.healthy === true ? css.online : css.offline}`} /><span>{statusLoading ? '检查中' : status?.healthy === true ? `已连接 · ${status.store}` : '不可用'}</span><button type="button" className={css.iconButton} onClick={refreshAll} aria-label="刷新状态">↻</button></div>
      </header>
      {(statusError !== null || status?.healthy === false) && <div className={css.alert} role="alert"><strong>Mnemon 尚未就绪</strong><span>{statusError ?? status?.error}</span></div>}
      <section className={css.telemetry} aria-label="记忆统计"><div className={css.telemetryLead}><span className={css.telemetryPulse} />Memory telemetry</div><div className={css.telemetryMetric}><span>有效记忆</span><strong>{stats?.totalInsights ?? '—'}</strong></div><div className={css.telemetryMetric}><span>图谱连接</span><strong>{stats?.edgeCount ?? '—'}</strong></div><div className={css.telemetryMetric}><span>已识别实体</span><strong>{stats?.topEntities.length ?? '—'}</strong></div><div className={css.telemetryMetric}><span>数据库</span><strong>{stats === undefined ? '—' : humanBytes(stats.dbSizeBytes)}</strong></div></section>
      <div className={css.workspace}>
        <aside className={css.sidebar}><nav className={css.nav} aria-label="Mnemon 页面">{PAGE_NAV.map(item => <button key={item.id} type="button" aria-current={page === item.id ? 'page' : undefined} onClick={() => setPage(item.id)}><span className={css.navGlyph} aria-hidden="true">{item.glyph}</span><span><strong>{item.label}</strong><small>{item.detail}</small></span></button>)}</nav><div className={css.sidebarFooter}><span>ACTIVE STORE</span><code>{status?.store ?? '—'}</code><small>{writeEnabled ? 'Read / Write' : 'Read only'}</small></div></aside>
        <section className={css.canvas}>
          {page === 'overview' && <OverviewPage client={client} revision={revision} onExplore={explore} />}
          {page === 'explore' && <ExplorePage client={client} status={status} seed={searchSeed} writeEnabled={writeEnabled} onForget={forget} />}
          {page === 'entities' && <EntitiesPage client={client} revision={revision} writeEnabled={writeEnabled} onForget={forget} onExplore={explore} />}
          {page === 'remember' && <RememberPage client={client} writeEnabled={writeEnabled} seed={rememberSeed} onMutate={mutate} />}
          {page === 'list' && <ListPage client={client} revision={revision} writeEnabled={writeEnabled} onForget={forget} onClone={clone} onExplore={explore} />}
          {page === 'status' && <StatusPage status={status} loading={statusLoading} onRefresh={() => void loadStatus()} settingsScope={settingsScope} />}
        </section>
      </div>
    </main>
  )
}
