import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type PointerEvent as ReactPointerEvent } from 'react'
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
  type MemoryBodyCatalog,
  type MemoryBodyView,
  type StatusView,
} from '../service.ts'
import { MnemonClient } from './api.ts'
import { MnemonLogo } from './MnemonLogo.tsx'
import css from './MnemonView.module.css'

export interface MnemonViewProps {
  connection: ClientConnectionHandle
  settingsScope: ClientSettingsScope<Config>
  sessionId?: string
}

type Page = 'overview' | 'explore' | 'entities' | 'remember' | 'list' | 'status'

const PAGE_NAV: Array<{ id: Page; label: string; detail: string; glyph: string }> = [
  { id: 'overview', label: '总览', detail: '记忆体与实时图谱', glyph: '◇' },
  { id: 'explore', label: '检索', detail: '意图增强召回', glyph: '⌕' },
  { id: 'entities', label: '实体', detail: '关系与上下文', glyph: '◎' },
  { id: 'remember', label: '沉淀', detail: 'LLM 监督写回', glyph: '+' },
  { id: 'list', label: '内容', detail: '浏览与维护', glyph: '≡' },
  { id: 'status', label: '状态', detail: '运行与诊断', glyph: '⌘' },
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

function insightKey(insight: Insight): string {
  return `${insight.memoryBodyId ?? 'memory'}:${insight.id}`
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
    insight.memoryBodyName,
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

const GRAPH_WIDTH = 930
const GRAPH_HEIGHT = 520
const GRAPH_MARGIN_X = 58
const GRAPH_MARGIN_Y = 58
const CATEGORY_ORDER = ['preference', 'decision', 'fact', 'insight', 'context', 'general']

interface GraphPosition { x: number; y: number }
type GraphPositions = Map<string, GraphPosition>
type GraphLayoutMode = 'natural' | 'uniform' | 'custom'

function hash(value: string): number {
  let result = 2166136261
  for (const char of value) result = Math.imul(result ^ char.charCodeAt(0), 16777619)
  return result >>> 0
}

function graphNodeKey(node: MemoryGraphNode): string {
  return node.graphId ?? node.id
}

function activeCategoryAnchors(grouped: Map<string, MemoryGraphNode[]>): Map<string, GraphPosition> {
  const categories = [...grouped.keys()].sort((left, right) => {
    const leftIndex = CATEGORY_ORDER.indexOf(left)
    const rightIndex = CATEGORY_ORDER.indexOf(right)
    return (leftIndex < 0 ? CATEGORY_ORDER.length : leftIndex) - (rightIndex < 0 ? CATEGORY_ORDER.length : rightIndex)
  })
  const anchors = new Map<string, GraphPosition>()
  if (categories.length === 1) {
    anchors.set(categories[0]!, { x: GRAPH_WIDTH / 2, y: GRAPH_HEIGHT / 2 })
    return anchors
  }
  categories.forEach((category, index) => {
    const angle = -Math.PI / 2 + (index / categories.length) * Math.PI * 2
    anchors.set(category, {
      x: GRAPH_WIDTH / 2 + Math.cos(angle) * Math.min(250, 115 + categories.length * 23),
      y: GRAPH_HEIGHT / 2 + Math.sin(angle) * Math.min(165, 78 + categories.length * 15),
    })
  })
  return anchors
}

function clampGraphPosition(position: GraphPosition): GraphPosition {
  return {
    x: Math.min(GRAPH_WIDTH - GRAPH_MARGIN_X, Math.max(GRAPH_MARGIN_X, position.x)),
    y: Math.min(GRAPH_HEIGHT - GRAPH_MARGIN_Y, Math.max(GRAPH_MARGIN_Y, position.y)),
  }
}

function naturalGraphPositions(nodes: MemoryGraphNode[], edges: MemoryGraphSnapshot['edges']): GraphPositions {
  const positions: GraphPositions = new Map()
  const grouped = new Map<string, MemoryGraphNode[]>()
  for (const node of nodes) {
    const category = node.category ?? 'general'
    grouped.set(category, [...(grouped.get(category) ?? []), node])
  }
  const anchors = activeCategoryAnchors(grouped)
  for (const [category, items] of grouped) {
    const anchor = anchors.get(category) ?? { x: GRAPH_WIDTH / 2, y: GRAPH_HEIGHT / 2 }
    items.forEach((node, index) => {
      const seed = hash(graphNodeKey(node))
      const angle = index * 2.399963 + ((seed % 37) / 37) * .4
      const radius = items.length === 1 ? 0 : 24 + Math.sqrt(index + 1) * 35
      positions.set(graphNodeKey(node), clampGraphPosition({ x: anchor.x + Math.cos(angle) * radius, y: anchor.y + Math.sin(angle) * radius }))
    })
  }

  const velocities = new Map(nodes.map(node => [graphNodeKey(node), { x: 0, y: 0 }]))
  const visibleIds = new Set(nodes.map(graphNodeKey))
  const visibleEdges = edges.filter(edge => visibleIds.has(edge.sourceId) && visibleIds.has(edge.targetId))
  for (let iteration = 0; iteration < 150; iteration += 1) {
    const cooling = 1 - iteration / 180
    for (let leftIndex = 0; leftIndex < nodes.length; leftIndex += 1) {
      const left = nodes[leftIndex]!
      const leftPosition = positions.get(graphNodeKey(left))!
      const leftVelocity = velocities.get(graphNodeKey(left))!
      for (let rightIndex = leftIndex + 1; rightIndex < nodes.length; rightIndex += 1) {
        const right = nodes[rightIndex]!
        const rightPosition = positions.get(graphNodeKey(right))!
        const rightVelocity = velocities.get(graphNodeKey(right))!
        let dx = leftPosition.x - rightPosition.x
        let dy = leftPosition.y - rightPosition.y
        if (dx === 0 && dy === 0) { dx = ((hash(graphNodeKey(left)) % 13) - 6) || 1; dy = ((hash(graphNodeKey(right)) % 11) - 5) || -1 }
        const distanceSquared = Math.max(100, dx * dx + dy * dy)
        const distance = Math.sqrt(distanceSquared)
        const repulsion = Math.min(9, 18_000 / distanceSquared) * cooling
        const collision = distance < 66 ? (66 - distance) * .08 : 0
        const force = repulsion + collision
        const forceX = (dx / distance) * force
        const forceY = (dy / distance) * force
        leftVelocity.x += forceX; leftVelocity.y += forceY
        rightVelocity.x -= forceX; rightVelocity.y -= forceY
      }
    }
    for (const edge of visibleEdges) {
      const source = positions.get(edge.sourceId)!
      const target = positions.get(edge.targetId)!
      const sourceVelocity = velocities.get(edge.sourceId)!
      const targetVelocity = velocities.get(edge.targetId)!
      const dx = target.x - source.x
      const dy = target.y - source.y
      const distance = Math.max(1, Math.hypot(dx, dy))
      const sparseScale = nodes.length <= 3 ? 2 : nodes.length <= 8 ? 1.45 : 1
      const desired = (edge.type === 'entity' ? 94 : edge.type === 'semantic' ? 118 : 106) * sparseScale
      const spring = (distance - desired) * .018 * cooling
      const forceX = (dx / distance) * spring
      const forceY = (dy / distance) * spring
      sourceVelocity.x += forceX; sourceVelocity.y += forceY
      targetVelocity.x -= forceX; targetVelocity.y -= forceY
    }
    for (const node of nodes) {
      const key = graphNodeKey(node)
      const position = positions.get(key)!
      const velocity = velocities.get(key)!
      const anchor = anchors.get(node.category ?? 'general') ?? { x: GRAPH_WIDTH / 2, y: GRAPH_HEIGHT / 2 }
      velocity.x += (anchor.x - position.x) * .0035 * cooling + (GRAPH_WIDTH / 2 - position.x) * .0008
      velocity.y += (anchor.y - position.y) * .0035 * cooling + (GRAPH_HEIGHT / 2 - position.y) * .0008
      velocity.x = Math.max(-12, Math.min(12, velocity.x * .76))
      velocity.y = Math.max(-12, Math.min(12, velocity.y * .76))
      positions.set(key, clampGraphPosition({ x: position.x + velocity.x, y: position.y + velocity.y }))
    }
  }
  return positions
}

function uniformGraphPositions(nodes: MemoryGraphNode[]): GraphPositions {
  const positions: GraphPositions = new Map()
  const ordered = [...nodes].sort((left, right) => {
    const categoryDifference = CATEGORY_ORDER.indexOf(left.category ?? 'general') - CATEGORY_ORDER.indexOf(right.category ?? 'general')
    return categoryDifference === 0 ? left.id.localeCompare(right.id) : categoryDifference
  })
  const columns = Math.max(1, Math.ceil(Math.sqrt(ordered.length * 1.65)))
  const rows = Math.max(1, Math.ceil(ordered.length / columns))
  const cellWidth = (GRAPH_WIDTH - GRAPH_MARGIN_X * 2) / columns
  const cellHeight = (GRAPH_HEIGHT - GRAPH_MARGIN_Y * 2) / rows
  ordered.forEach((node, index) => {
    const row = Math.floor(index / columns)
    const column = index % columns
    const rowLength = Math.min(columns, ordered.length - row * columns)
    const rowOffset = (columns - rowLength) * cellWidth / 2
    positions.set(graphNodeKey(node), {
      x: GRAPH_MARGIN_X + rowOffset + cellWidth * (column + .5),
      y: GRAPH_MARGIN_Y + cellHeight * (row + .5),
    })
  })
  return positions
}

function graphPoint(svg: SVGSVGElement, clientX: number, clientY: number): GraphPosition {
  const matrix = svg.getScreenCTM?.()
  if (matrix !== null && matrix !== undefined && typeof svg.createSVGPoint === 'function') {
    const point = svg.createSVGPoint()
    point.x = clientX; point.y = clientY
    return clampGraphPosition(point.matrixTransform(matrix.inverse()))
  }
  const bounds = svg.getBoundingClientRect()
  const width = bounds.width || GRAPH_WIDTH
  const height = bounds.height || GRAPH_HEIGHT
  return clampGraphPosition({ x: (clientX - bounds.left) * GRAPH_WIDTH / width, y: (clientY - bounds.top) * GRAPH_HEIGHT / height })
}

function MemoryGraph(props: { graph: MemoryGraphSnapshot; selectedId?: string | undefined; onSelect: (node: MemoryGraphNode) => void }): JSX.Element {
  const visibleNodes = useMemo(() => props.graph.nodes.slice(0, 60), [props.graph.nodes])
  const visibleIds = useMemo(() => new Set(visibleNodes.map(graphNodeKey)), [visibleNodes])
  const edges = useMemo(() => props.graph.edges.filter(edge => visibleIds.has(edge.sourceId) && visibleIds.has(edge.targetId)).slice(0, 180), [props.graph.edges, visibleIds])
  const curvedEdges = useMemo(() => {
    const groups = new Map<string, number[]>()
    edges.forEach((edge, index) => {
      const key = [edge.sourceId, edge.targetId].sort().join('::')
      groups.set(key, [...(groups.get(key) ?? []), index])
    })
    return edges.map((edge, index) => {
      const key = [edge.sourceId, edge.targetId].sort().join('::')
      const group = groups.get(key) ?? [index]
      const groupIndex = group.indexOf(index)
      return { edge, offset: (groupIndex - (group.length - 1) / 2) * 12 }
    })
  }, [edges])
  const layoutKey = `${visibleNodes.map(node => `${graphNodeKey(node)}:${node.category ?? 'general'}`).join('|')}::${edges.map(edge => `${edge.sourceId}>${edge.targetId}:${edge.type ?? 'temporal'}`).join('|')}`
  const naturalLayout = useMemo(() => naturalGraphPositions(visibleNodes, edges), [layoutKey])
  const [positions, setPositions] = useState<GraphPositions>(() => naturalLayout)
  const [layoutMode, setLayoutMode] = useState<GraphLayoutMode>('natural')
  const positionsRef = useRef(positions)
  const animationRef = useRef<number | null>(null)
  const dragRef = useRef<{ nodeId: string; pointerId: number; moved: boolean } | null>(null)
  const suppressClickRef = useRef(false)

  const commitPositions = useCallback((next: GraphPositions) => {
    positionsRef.current = next
    setPositions(next)
  }, [])

  const cancelAnimation = useCallback(() => {
    if (animationRef.current !== null && typeof window.cancelAnimationFrame === 'function') window.cancelAnimationFrame(animationRef.current)
    animationRef.current = null
  }, [])

  const animateTo = useCallback((target: GraphPositions, mode: Exclude<GraphLayoutMode, 'custom'>) => {
    cancelAnimation()
    setLayoutMode(mode)
    if (typeof window.requestAnimationFrame !== 'function') { commitPositions(target); return }
    const start = new Map(positionsRef.current)
    const startedAt = performance.now()
    const tick = (time: number) => {
      const progress = Math.min(1, (time - startedAt) / 620)
      const eased = 1 - Math.pow(1 - progress, 3)
      const next: GraphPositions = new Map()
      for (const [id, destination] of target) {
        const origin = start.get(id) ?? { x: GRAPH_WIDTH / 2, y: GRAPH_HEIGHT / 2 }
        next.set(id, { x: origin.x + (destination.x - origin.x) * eased, y: origin.y + (destination.y - origin.y) * eased })
      }
      commitPositions(next)
      if (progress < 1) animationRef.current = window.requestAnimationFrame(tick)
      else animationRef.current = null
    }
    animationRef.current = window.requestAnimationFrame(tick)
  }, [cancelAnimation, commitPositions])

  useEffect(() => { animateTo(naturalLayout, 'natural') }, [layoutKey])
  useEffect(() => () => cancelAnimation(), [cancelAnimation])

  const beginDrag = (event: ReactPointerEvent<SVGGElement>, nodeId: string) => {
    event.preventDefault()
    cancelAnimation()
    dragRef.current = { nodeId, pointerId: event.pointerId, moved: false }
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }
  const moveDrag = (event: ReactPointerEvent<SVGGElement>) => {
    const drag = dragRef.current
    const svg = event.currentTarget.ownerSVGElement
    if (drag === null || svg === null || drag.pointerId !== event.pointerId) return
    drag.moved = true
    const point = graphPoint(svg, event.clientX, event.clientY)
    const next = new Map(positionsRef.current)
    next.set(drag.nodeId, point)
    commitPositions(next)
    setLayoutMode('custom')
  }
  const endDrag = (event: ReactPointerEvent<SVGGElement>) => {
    const drag = dragRef.current
    if (drag === null || drag.pointerId !== event.pointerId) return
    const svg = event.currentTarget.ownerSVGElement
    if (drag.moved && svg !== null) {
      const next = new Map(positionsRef.current)
      next.set(drag.nodeId, graphPoint(svg, event.clientX, event.clientY))
      commitPositions(next)
    }
    suppressClickRef.current = drag.moved
    dragRef.current = null
    event.currentTarget.releasePointerCapture?.(event.pointerId)
  }
  const cancelDrag = (event: ReactPointerEvent<SVGGElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null
  }
  const nudge = (nodeId: string, dx: number, dy: number) => {
    cancelAnimation()
    const current = positionsRef.current.get(nodeId)
    if (current === undefined) return
    const next = new Map(positionsRef.current)
    next.set(nodeId, clampGraphPosition({ x: current.x + dx, y: current.y + dy }))
    commitPositions(next)
    setLayoutMode('custom')
  }
  const layoutLabel = layoutMode === 'natural' ? '自然布局' : layoutMode === 'uniform' ? '均匀布局' : '自定义布局'
  return (
    <>
      <div className={css.graphCanvasControls} role="toolbar" aria-label="图谱布局">
        <span role="status" aria-label={`布局状态：${layoutLabel}`}><i />{layoutLabel} · 可拖拽</span>
        <button type="button" data-active={layoutMode === 'natural' || undefined} onClick={() => animateTo(naturalGraphPositions(visibleNodes, edges), 'natural')}>自然铺开</button>
        <button type="button" data-active={layoutMode === 'uniform' || undefined} onClick={() => animateTo(uniformGraphPositions(visibleNodes), 'uniform')}>均匀重置</button>
      </div>
      <svg className={css.graphSvg} viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`} role="img" data-layout={layoutMode} data-density={visibleNodes.length <= 12 ? 'sparse' : 'dense'} aria-label={`Mnemon 实时记忆图谱，${props.graph.nodes.length} 个节点，${props.graph.edges.length} 条连接`}>
      <defs>
        <pattern id="mnemon-grid" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M 26 0 L 0 0 0 26" className={css.graphGridLine} fill="none" /></pattern>
        <filter id="mnemon-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <rect width={GRAPH_WIDTH} height={GRAPH_HEIGHT} className={css.graphBackdrop} />
      <rect width={GRAPH_WIDTH} height={GRAPH_HEIGHT} fill="url(#mnemon-grid)" />
      {curvedEdges.map(({ edge, offset }, index) => {
        const source = positions.get(edge.sourceId)!
        const target = positions.get(edge.targetId)!
        const dx = target.x - source.x
        const dy = target.y - source.y
        const distance = Math.max(1, Math.hypot(dx, dy))
        const direction = edge.sourceId.localeCompare(edge.targetId) <= 0 ? 1 : -1
        const controlX = (source.x + target.x) / 2 - (dy / distance) * offset * direction
        const controlY = (source.y + target.y) / 2 + (dx / distance) * offset * direction
        return <path key={`${edge.sourceId}-${edge.targetId}-${index}`} d={`M ${source.x} ${source.y} Q ${controlX} ${controlY} ${target.x} ${target.y}`} className={css.graphEdge} data-edge={edge.type ?? 'temporal'} />
      })}
      {visibleNodes.map((node, index) => {
        const nodeKey = graphNodeKey(node)
        const position = positions.get(nodeKey)!
        const selected = props.selectedId === nodeKey
        const showLabel = selected || visibleNodes.length < 22 || index % 3 === 0
        return (
          <g key={nodeKey} className={css.graphNode} data-category={node.category ?? 'general'} data-selected={selected || undefined}
            transform={`translate(${position.x} ${position.y})`} role="button" tabIndex={0} aria-label={`${CATEGORY_LABELS[node.category ?? 'general'] ?? node.category}: ${short(node.content, 80)}`}
            data-dragging={dragRef.current?.nodeId === nodeKey || undefined}
            onPointerDown={event => beginDrag(event, nodeKey)} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={cancelDrag} onLostPointerCapture={cancelDrag}
            onClick={() => { if (suppressClickRef.current) { suppressClickRef.current = false; return }; props.onSelect(node) }}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') props.onSelect(node)
              else if (event.key === 'ArrowLeft') { event.preventDefault(); nudge(nodeKey, -12, 0) }
              else if (event.key === 'ArrowRight') { event.preventDefault(); nudge(nodeKey, 12, 0) }
              else if (event.key === 'ArrowUp') { event.preventDefault(); nudge(nodeKey, 0, -12) }
              else if (event.key === 'ArrowDown') { event.preventDefault(); nudge(nodeKey, 0, 12) }
            }}>
            <circle r={selected ? 17 : visibleNodes.length <= 12 ? 14 : 11} className={css.nodeHalo} filter={selected ? 'url(#mnemon-glow)' : undefined} />
            <circle r={selected ? 7 : visibleNodes.length <= 12 ? 6 : 4.5} className={css.nodeCore} />
            {(selected || visibleNodes.length <= 12) && node.memoryBodyName !== undefined && <text x="0" y="-18" textAnchor="middle" className={css.nodeBodyLabel}>{short(node.memoryBodyName, 12)}</text>}
            {showLabel && <text x={visibleNodes.length <= 12 ? 19 : 15} y="4" className={css.nodeLabel}>{short(node.content.replace(/\s+/gu, ' '), selected ? 34 : visibleNodes.length <= 12 ? 26 : 19)}</text>}
          </g>
        )
      })}
      </svg>
    </>
  )
}

function OverviewPage(props: { client: MnemonClient; revision: number; writeEnabled: boolean; onMutate: () => void; onExplore: (query: string) => void }): JSX.Element {
  const [graph, setGraph] = useState<MemoryGraphSnapshot | null>(null)
  const [catalog, setCatalog] = useState<MemoryBodyCatalog | null>(null)
  const [selected, setSelected] = useState<MemoryGraphNode | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [changing, setChanging] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [bodyId, setBodyId] = useState('')
  const [bodyName, setBodyName] = useState('')
  const [bodyDescription, setBodyDescription] = useState('')

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true)
    setError(null)
    try {
      const [nextCatalog, next] = await Promise.all([props.client.bodies(), props.client.graph()])
      setCatalog(nextCatalog)
      setGraph(next)
      setSelected(current => current === null ? null : next.nodes.find(node => graphNodeKey(node) === graphNodeKey(current)) ?? null)
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

  const toggle = async (body: MemoryBodyView) => {
    setChanging(body.id); setError(null)
    try {
      await props.client.updateBody(body.id, { active: !body.active })
      await load(true)
      props.onMutate()
    } catch (reason) { setError(message(reason)) } finally { setChanging(null) }
  }

  const create = async (event: FormEvent) => {
    event.preventDefault()
    if (bodyName.trim() === '' || bodyDescription.trim() === '') return
    setCreating(true); setError(null)
    try {
      await props.client.createBody({ ...(bodyId.trim() === '' ? {} : { id: bodyId }), name: bodyName, description: bodyDescription })
      setBodyId(''); setBodyName(''); setBodyDescription('')
      await load(true)
      props.onMutate()
    } catch (reason) { setError(message(reason)) } finally { setCreating(false) }
  }

  const generated = graph === null ? '等待首个快照' : `更新于 ${new Date(graph.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
  return (
    <div className={css.page}>
      <PageHeader kicker="MEMORY BODY OVERVIEW" title="记忆体总览" description="管理全局记忆体的读取边界，并在一张实时四图快照中观察所有已激活记忆体。" meta="AUTO · 15S"
        action={<button type="button" className={css.secondaryButton} disabled={loading} onClick={() => void load()}>{loading ? '同步中…' : '立即同步'}</button>} />
      {error !== null && <div className={css.inlineError} role="alert">{error}</div>}
      <section className={css.bodyDirectory} aria-label="记忆体目录">
        <div className={css.bodyDirectoryHeader}>
          <div><span className={css.cardKicker}>GLOBAL MEMORY BODIES</span><h3>记忆体目录</h3><p>开关只控制读取；写入可选择任意记忆体，写入未激活记忆体后会自动激活。</p></div>
          <strong>{catalog?.activeCount ?? '—'} / {catalog?.total ?? '—'} ACTIVE</strong>
        </div>
        <div className={css.bodyGrid}>
          {catalog?.items.map((body, index) => (
            <article key={body.id} className={css.bodyCard} data-active={body.active || undefined} style={{ '--mn-body-accent': `hsl(${(hash(body.id) + index * 29) % 360} 66% 58%)` } as CSSProperties}>
              <div className={css.bodyCardTop}><span className={css.bodySignal} /><div><strong>{body.name}</strong><code>{body.id}</code></div><button type="button" role="switch" aria-checked={body.active} aria-label={`${body.name}读取开关`} disabled={!props.writeEnabled || changing === body.id} onClick={() => void toggle(body)}><i />{changing === body.id ? '切换中' : body.active ? '已激活' : '未激活'}</button></div>
              <p>{body.description || '尚未提供路由说明。'}</p>
              <footer><span>{body.stats?.totalInsights ?? 0} 条记忆</span><span>{body.stats?.edgeCount ?? 0} 条连接</span><span>{humanBytes(body.stats?.dbSizeBytes ?? 0)}</span></footer>
            </article>
          ))}
        </div>
        {props.writeEnabled && <details className={css.bodyCreate}><summary>＋ 创建空白记忆体</summary><form onSubmit={event => void create(event)}><input aria-label="新记忆体 ID" value={bodyId} onChange={event => setBodyId(event.target.value)} placeholder="可选 ID，例如 project-alpha" /><input aria-label="新记忆体名称" value={bodyName} onChange={event => setBodyName(event.target.value)} placeholder="名称" required /><input aria-label="新记忆体描述" value={bodyDescription} onChange={event => setBodyDescription(event.target.value)} placeholder="说明哪些内容属于它，以及何时应被召回" required /><button type="submit" className={css.secondaryButton} disabled={creating}>{creating ? '创建中…' : '创建'}</button></form></details>}
      </section>
      {graph !== null && graph.nodes.length > 0 ? (
        <div className={css.graphLayout}>
          <section className={css.graphPanel}>
            <div className={css.graphToolbar}>
              <div><span className={css.liveDot} />多记忆体实时快照 <small>{generated}</small></div>
              <div className={css.graphLegend}><span data-edge="temporal">时间</span><span data-edge="semantic">语义</span><span data-edge="causal">因果</span><span data-edge="entity">实体</span></div>
            </div>
            <div className={css.graphViewport}><MemoryGraph graph={graph} selectedId={selected === null ? undefined : graphNodeKey(selected)} onSelect={setSelected} /></div>
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
                <dl className={css.inspectorMeta}><div><dt>Memory body</dt><dd>{selected.memoryBodyName ?? '—'} <code>{selected.memoryBodyId ?? ''}</code></dd></div><div><dt>Memory ID</dt><dd><code>{selected.id}</code></dd></div><div><dt>Category</dt><dd>{selected.category ?? 'general'}</dd></div></dl>
                <div className={css.inspectorActions}><button type="button" className={css.primaryButton} onClick={() => props.onExplore(selected.content)}>围绕它检索</button><button type="button" className={css.secondaryButton} onClick={() => void navigator.clipboard?.writeText(selected.id)}>复制 ID</button></div>
              </>
            )}
          </aside>
        </div>
      ) : !loading && error === null ? (
        <EmptyState glyph="◇" title="已激活记忆体尚无内容">向任意记忆体沉淀稳定上下文后，这里会聚合呈现节点与关系。</EmptyState>
      ) : (
        <div className={css.loadingPanel}>正在同步记忆体目录与多库图谱…</div>
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
    try { setRelated(await props.client.related(insight.id, insight.memoryBodyId)) } catch (reason) { setError(message(reason)) } finally { setRelatedLoading(false) }
  }

  const forget = async (insight: Insight) => {
    await props.onForget(insight)
    setResults(items => items.filter(item => insightKey(item) !== insightKey(insight)))
    setRelated(items => items.filter(item => insightKey(item) !== insightKey(insight)))
    if (relatedTo !== null && insightKey(relatedTo) === insightKey(insight)) setRelatedTo(null)
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
          <section className={css.results}><div className={css.sectionHeading}><div><span>RESULT SET</span><h3>召回结果</h3></div><strong>{results.length}</strong></div>{results.map(insight => <InsightCard key={insightKey(insight)} insight={insight} writeEnabled={props.writeEnabled} onForget={forget} onRelated={item => void showRelated(item)} />)}</section>
          {relatedTo !== null && <aside className={css.relatedPane}><div className={css.sectionHeading}><div><span>GRAPH INSPECTOR</span><h3>关联记忆</h3></div><button type="button" onClick={() => setRelatedTo(null)} aria-label="关闭关联记忆">×</button></div><p className={css.relatedSource}>{relatedTo.content}</p>{relatedLoading && <div className={css.loading}>正在遍历图谱…</div>}{!relatedLoading && related.length === 0 && <div className={css.muted}>没有找到两跳内的关联节点。</div>}{related.map(insight => <InsightCard key={insightKey(insight)} insight={insight} writeEnabled={props.writeEnabled} onForget={forget} onRelated={item => void showRelated(item)} />)}</aside>}
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
          {!loading && view.selected !== undefined && <><div className={css.sectionHeading}><div><span>ENTITY CONTEXT</span><h3>{view.selected}</h3></div><strong>{view.insights.length}</strong></div>{view.insights.length === 0 ? <EmptyState glyph="0" title="没有关联记忆">尝试更完整的名称或另一个实体别名。</EmptyState> : view.insights.map(insight => <InsightCard key={insightKey(insight)} insight={insight} writeEnabled={props.writeEnabled} onForget={props.onForget} onRelated={() => props.onExplore(insight.content)} />)}</>}
        </section>
      </div>
    </div>
  )
}

function RememberPage(props: { client: MnemonClient; sessionId: string | undefined; memoryBodies: MemoryBodyView[]; writeEnabled: boolean; seed: string; onMutate: () => void }): JSX.Element {
  const [content, setContent] = useState(props.seed)
  const [category, setCategory] = useState<Category>('general')
  const [importance, setImportance] = useState(3)
  const [tags, setTags] = useState('')
  const [entities, setEntities] = useState('')
  const [memoryBodyId, setMemoryBodyId] = useState('')
  const [supervising, setSupervising] = useState(false)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  useEffect(() => { if (props.seed !== '') setContent(props.seed) }, [props.seed])
  useEffect(() => {
    if (memoryBodyId === '' && props.memoryBodies.length > 0) setMemoryBodyId((props.memoryBodies.find(body => body.active) ?? props.memoryBodies[0])!.id)
  }, [memoryBodyId, props.memoryBodies])

  const supervise = async (event: FormEvent) => {
    event.preventDefault()
    if (content.trim() === '' || props.sessionId === undefined) return
    setSupervising(true); setResult(null)
    try {
      const response = await props.client.supervise(content)
      setResult(`${response.action === 'skipped' ? '记忆子 Agent 判断无需写入' : '记忆子 Agent 已完成处理'}${response.memoryBodyIds.length === 0 ? '' : ` · ${response.memoryBodyIds.join(', ')}`}${response.summary === '' ? '' : `：${response.summary}`}`)
      setContent('')
      props.onMutate()
    } catch (reason) { setResult(`调度失败：${message(reason)}`) } finally { setSupervising(false) }
  }

  const manualSave = async (event: FormEvent) => {
    event.preventDefault(); if (content.trim() === '') return
    setSaving(true); setResult(null)
    try {
      const response = await props.client.remember({ content, category, importance, tags: tags.split(',').map(value => value.trim()).filter(Boolean), entities: entities.split(',').map(value => value.trim()).filter(Boolean), source: 'user', ...(memoryBodyId === '' ? {} : { memoryBodyId }) })
      const action = typeof response.action === 'string' ? response.action : 'saved'
      const summary = typeof response.summary === 'string' ? response.summary : ''
      setResult(action === 'skipped' ? `记忆子 Agent 判定无需写入${summary === '' ? '' : `：${summary}`}` : `记忆子 Agent 已处理：${action}${summary === '' ? '' : ` · ${summary}`}`)
      if (action !== 'skipped') { setContent(''); setTags(''); setEntities(''); props.onMutate() }
    } catch (reason) { setResult(`保存失败：${message(reason)}`) } finally { setSaving(false) }
  }

  return (
    <div className={css.page}>
      <PageHeader kicker="SUBAGENT-SUPERVISED WRITEBACK" title="沉淀记忆" description="候选内容会进入隔离的记忆子 Agent，由它选择记忆体、查重、提炼并执行写入，不占用主对话上下文。" meta={props.writeEnabled ? 'MEMORY SUBAGENT' : 'READ ONLY'} />
      {!props.writeEnabled ? <EmptyState glyph="⊘" title="当前为只读模式">当前部署禁止记忆写入；如需调整，请修改 DSH 的 Mnemon 配置并重启。</EmptyState> : (
        <div className={css.writebackLayout}>
          <aside className={css.writeGuide}><span className={css.cardKicker}>SUPERVISION FLOW</span><h3>记忆子 Agent 会完成什么</h3><ol><li><strong>判断归属</strong><span>选择既有记忆体，必要时判断是否形成新范围</span></li><li><strong>检索查重</strong><span>识别重复、补充或冲突的旧记忆</span></li><li><strong>结构化写入</strong><span>提炼内容、元数据与必要关系并返回回执</span></li></ol><p>子 Agent 只拥有 Mnemon 工具，原始目录和检索过程不会挤占主对话上下文。</p></aside>
          <section className={css.supervisedComposer}>
            <form className={css.supervisedForm} onSubmit={event => void supervise(event)}>
              <div className={css.supervisedHeading}><div><span className={css.cardKicker}>ISOLATED MEMORY WORKER</span><h3>交给记忆子 Agent</h3></div><span className={props.sessionId === undefined ? css.sessionMissing : css.sessionReady}>{props.sessionId === undefined ? 'NO SESSION' : 'SUBAGENT READY'}</span></div>
              <label className={css.fieldWide}>候选内容<textarea aria-label="待沉淀内容" value={content} onChange={event => setContent(event.target.value)} maxLength={8000} rows={8} placeholder="输入希望跨任务保留的背景、偏好、决策或洞察。模型会先判断它是否真的值得沉淀。" /></label>
              {props.sessionId === undefined && <p className={css.sessionHint}>当前视图没有绑定 live session，无法创建记忆子 Agent。</p>}
              <div className={css.formActions}><button type="submit" className={css.primaryButton} disabled={supervising || content.trim() === '' || props.sessionId === undefined}>{supervising ? '记忆子 Agent 处理中…' : '调度子 Agent 判断并沉淀'}</button>{result !== null && <span role="status">{result}</span>}</div>
            </form>
            <details className={css.advancedWrite}>
              <summary><span><strong>人工高级选项</strong><small>为记忆子 Agent指定目标记忆体与元数据约束</small></span><span>展开</span></summary>
              <form className={css.manualForm} onSubmit={event => void manualSave(event)}>
                <div className={css.formGrid}><label className={css.fieldWide}>目标记忆体<select aria-label="目标记忆体" value={memoryBodyId} onChange={event => setMemoryBodyId(event.target.value)}>{props.memoryBodies.map(body => <option key={body.id} value={body.id}>{body.name} · {body.id}{body.active ? ' · 已激活' : ''}</option>)}</select></label><label>分类<select value={category} onChange={event => setCategory(event.target.value as Category)}>{CATEGORIES.map(value => <option key={value} value={value}>{CATEGORY_LABELS[value]}</option>)}</select></label><label>重要性<select value={importance} onChange={event => setImportance(Number(event.target.value))}>{[1, 2, 3, 4, 5].map(value => <option key={value} value={value}>{value} / 5</option>)}</select></label><label className={css.fieldWide}>实体（逗号分隔）<input value={entities} onChange={event => setEntities(event.target.value)} placeholder="SQLite, DSH" /></label><label className={css.fieldWide}>标签（逗号分隔）<input value={tags} onChange={event => setTags(event.target.value)} placeholder="architecture, local-first" /></label></div>
                <div className={css.manualActions}><p>高级选项是约束而不是绕过监督；记忆子 Agent 仍会查重并返回结构化回执。</p><button type="submit" className={css.secondaryButton} disabled={saving || content.trim() === '' || props.sessionId === undefined || memoryBodyId === ''}>{saving ? '子 Agent 写入中…' : '按高级约束沉淀'}</button></div>
              </form>
            </details>
          </section>
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
  const forget = async (insight: Insight) => { await props.onForget(insight); setView(current => current === null ? current : { ...current, total: Math.max(0, current.total - 1), items: current.items.filter(item => insightKey(item) !== insightKey(insight)) }) }

  return (
    <div className={css.page}>
      <PageHeader kicker="ACTIVE MEMORY CONTENT" title="记忆内容" description="无副作用浏览所有已激活记忆体；每条内容都会标明所属记忆体，可继续查阅或维护。" meta={`${view?.total ?? '—'} MEMORIES`} />
      <form className={css.listToolbar} onSubmit={submit}><input aria-label="筛选记忆库" value={query} onChange={event => setQuery(event.target.value)} placeholder="按内容或精确 ID 筛选…" /><select aria-label="记忆库分类" value={category} onChange={event => setCategory(event.target.value as Category | '')}><option value="">全部分类</option>{CATEGORIES.map(value => <option key={value} value={value}>{CATEGORY_LABELS[value]}</option>)}</select><button type="submit" className={css.primaryButton} disabled={loading}>{loading ? '载入中…' : '应用筛选'}</button></form>
      <div className={css.listNotice}><span>NON-MUTATING READ</span> 内容列表读取已激活记忆体的图谱快照，不会增加 recall 访问计数。</div>
      {error !== null && <div className={css.inlineError} role="alert">{error}</div>}
      {!loading && view?.items.length === 0 && <EmptyState glyph="≡" title="没有符合条件的记忆">清空筛选，或前往“沉淀”写入第一条稳定上下文。</EmptyState>}
      <div className={css.memoryList}>{view?.items.map(insight => <InsightCard key={insightKey(insight)} insight={insight} writeEnabled={props.writeEnabled} onForget={forget} onClone={props.onClone} onRelated={() => props.onExplore(insight.content)} />)}</div>
    </div>
  )
}

function StatusPage(props: { status: StatusView | null; loading: boolean; onRefresh: () => void }): JSX.Element {
  const status = props.status
  const lifecycle = status?.lifecycle
  const current = lifecycle?.current
  const workers = lifecycle?.subagents
  const memoryBodies = status?.memoryBodies ?? []
  const activeBodies = memoryBodies.filter(body => body.active).length
  const latest = current?.lastAt === undefined ? '尚无运行记录' : new Date(current.lastAt).toLocaleString()
  const phase = current?.lastPhase === undefined ? 'idle' : ({ idle: '待命', prime: 'Prime', recall: 'Recall', writeback: 'Writeback', supervised: '受监督请求', error: '异常' } as const)[current.lastPhase]
  return (
    <div className={css.page}>
      <PageHeader kicker="RUNTIME OBSERVABILITY" title="运行状态" description="聚焦 Mnemon 引擎、记忆体目录和子 Agent 编排；连接配置由 DSH 部署统一管理。" meta={status?.healthy === true && lifecycle?.sessionAvailable === true ? 'SYSTEM NOMINAL' : 'CHECK REQUIRED'} action={<button type="button" className={css.secondaryButton} onClick={props.onRefresh}>{props.loading ? '检查中…' : '重新检查'}</button>} />

      <section className={css.healthStrip} aria-label="Mnemon 运行状态">
        <article><span className={`${css.healthIndicator} ${status?.healthy === true ? css.healthGood : css.healthBad}`} /><div><small>MEMORY ENGINE</small><strong>{status?.healthy === true ? 'Mnemon 已连接' : 'Mnemon 不可用'}</strong><p>{status?.version === undefined ? '等待版本信息' : `CLI ${status.version}`}</p></div></article>
        <article><span className={`${css.healthIndicator} ${activeBodies > 0 ? css.healthGood : css.healthMuted}`} /><div><small>MEMORY BODIES</small><strong>{activeBodies} / {memoryBodies.length} 已激活</strong><p>{status?.stats?.totalInsights ?? 0} 条有效记忆</p></div></article>
        <article><span className={`${css.healthIndicator} ${lifecycle?.sessionAvailable === true ? css.healthGood : css.healthBad}`} /><div><small>SUBAGENT ROUTER</small><strong>{lifecycle?.sessionAvailable === true ? '记忆子 Agent 可用' : '当前会话未绑定'}</strong><p>{workers === undefined ? '等待编排状态' : `${workers.recalls} 次召回 · ${workers.writes} 次写入`}</p></div></article>
      </section>

      <div className={css.statusLayout}>
        <section className={css.lifecyclePanel}>
          <div className={css.statusSectionHeader}><div><span className={css.cardKicker}>ISOLATED MEMORY LIFECYCLE</span><h3>子 Agent 生命周期</h3><p>主 Agent 只接收压缩证据与回执；记忆体选择、查重和写入在隔离子上下文中完成。</p></div><span className={css.phaseBadge}>{phase}</span></div>
          <div className={css.lifecycleFlow}>
            <article><span>01</span><div><strong>Prime</strong><p>只注入计数和编排能力，不展开目录</p></div><code>{lifecycle?.counters.primes ?? 0}</code></article>
            <article data-disabled={lifecycle?.recallMode === 'off' || undefined}><span>02</span><div><strong>Recall Worker</strong><p>{lifecycle?.recallMode === 'guided' ? 'pre-step 选择记忆体并压缩证据' : '自动召回已关闭'}</p></div><code>{workers?.recalls ?? 0}</code></article>
            <article data-disabled={lifecycle?.writebackMode === 'off' || undefined}><span>03</span><div><strong>Write Worker</strong><p>{lifecycle?.writebackMode === 'guided' ? 'turn-stopping 内判断并完成副作用' : '自动写回已关闭'}</p></div><code>{workers?.writes ?? 0}</code></article>
          </div>
          <div className={css.lifecycleFoot}><span>最近阶段 <strong>{phase}</strong></span><span>最近活动 <strong>{latest}</strong></span><span>受监督请求 <strong>{lifecycle?.counters.supervisedRequests ?? 0}</strong></span><span>子 Agent 失败 <strong>{workers?.failures ?? 0}</strong></span></div>
          {current?.lastError !== undefined && <div className={css.inlineError} role="alert">Lifecycle：{current.lastError}</div>}
        </section>

        <aside className={css.diagnosticsPanel}>
          <div className={css.statusSectionHeader}><div><span className={css.cardKicker}>QUICK DIAGNOSTICS</span><h3>快速诊断</h3></div></div>
          <ul className={css.diagnosticList}>
            <li data-ok={status?.commandFound || undefined}><span />Mnemon CLI {status?.commandFound ? '可执行' : '未找到'}</li>
            <li data-ok={activeBodies > 0 || undefined}><span />{activeBodies} 个记忆体参与读取</li>
            <li data-ok={lifecycle?.sessionAvailable || undefined}><span />{lifecycle?.sessionAvailable ? 'WebUI 可创建隔离记忆子 Agent' : '缺少 live session'}</li>
            <li data-ok={(lifecycle?.counters.failures ?? 0) === 0 || undefined}><span />Lifecycle 失败 {lifecycle?.counters.failures ?? 0} 次</li>
          </ul>
          <div className={css.nativeAccess}><span className={css.cardKicker}>NATIVE ACCESS</span><code>/mnemon status</code><code>/mnemon recall &lt;query&gt;</code><p>模型侧使用原生 <code>mnemon_*</code> 工具；人工命令不会绕入模型。</p></div>
        </aside>
      </div>

      <section className={css.runtimeDetails}>
        <div className={css.statusSectionHeader}><div><span className={css.cardKicker}>RUNTIME DETAILS</span><h3>引擎与存储</h3></div><span className={`${css.runtimeBadge} ${status?.healthy === true ? css.runtimeOnline : css.runtimeOffline}`}>{status?.healthy === true ? 'ONLINE' : 'OFFLINE'}</span></div>
        <dl><div><dt>CLI</dt><dd><code>{status?.cliPath ?? 'mnemon'}</code></dd></div><div><dt>Mnemon 版本</dt><dd>{status?.version ?? '—'}</dd></div><div><dt>记忆体目录</dt><dd><code>{status?.memoryBodyDirectory ?? '—'}</code></dd></div><div><dt>总数据库大小</dt><dd>{status?.stats === undefined ? '—' : humanBytes(status.stats.dbSizeBytes)}</dd></div><div><dt>记忆体</dt><dd>{status === undefined ? '—' : memoryBodies.length} 个</dd></div><div><dt>已激活</dt><dd>{activeBodies} 个</dd></div><div><dt>有效记忆</dt><dd>{status?.stats?.totalInsights ?? '—'}</dd></div><div><dt>图谱连接</dt><dd>{status?.stats?.edgeCount ?? '—'}</dd></div></dl>
      </section>
    </div>
  )
}

export function MnemonView({ connection, sessionId }: MnemonViewProps): JSX.Element {
  const client = useMemo(() => new MnemonClient(connection, sessionId), [connection, sessionId])
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
  const forget = useCallback(async (insight: Insight) => { await client.forget(insight.id, insight.memoryBodyId); mutate() }, [client, mutate])
  const explore = useCallback((query: string) => { setSearchSeed(query); setPage('explore') }, [])
  const clone = useCallback((insight: Insight) => { setRememberSeed(insight.content); setPage('remember') }, [])
  const refreshAll = () => { setRevision(value => value + 1); void loadStatus() }
  const writeEnabled = status?.writeEnabled === true
  const stats = status?.stats
  const memoryBodies = status?.memoryBodies ?? []
  const activeBodies = memoryBodies.filter(body => body.active).length

  return (
    <main className={css.shell}>
      <header className={css.masthead}>
        <div className={css.brand}><MnemonLogo className={css.brandLogo} /><div><div className={css.eyebrow}>PERSISTENT AGENT MEMORY</div><h1>Mnemon</h1><p>LLM-supervised 4-graph persistent memory for AI agents.</p></div></div>
        <div className={css.statusCluster}><span className={`${css.statusDot} ${status?.healthy === true ? css.online : css.offline}`} /><span>{statusLoading ? '检查中' : status?.healthy === true ? `已连接 · ${activeBodies} 个记忆体` : '不可用'}</span><button type="button" className={css.iconButton} onClick={refreshAll} aria-label="刷新状态">↻</button></div>
      </header>
      {(statusError !== null || status?.healthy === false) && <div className={css.alert} role="alert"><strong>Mnemon 尚未就绪</strong><span>{statusError ?? status?.error}</span></div>}
      <section className={css.telemetry} aria-label="记忆统计"><div className={css.telemetryLead}><span className={css.telemetryPulse} />Memory telemetry</div><div className={css.telemetryMetric}><span>有效记忆</span><strong>{stats?.totalInsights ?? '—'}</strong></div><div className={css.telemetryMetric}><span>图谱连接</span><strong>{stats?.edgeCount ?? '—'}</strong></div><div className={css.telemetryMetric}><span>已识别实体</span><strong>{stats?.topEntities.length ?? '—'}</strong></div><div className={css.telemetryMetric}><span>激活记忆体</span><strong>{status === null ? '—' : activeBodies}</strong></div></section>
      <div className={css.workspace}>
        <aside className={css.sidebar}><nav className={css.nav} aria-label="Mnemon 页面">{PAGE_NAV.map(item => <button key={item.id} type="button" aria-current={page === item.id ? 'page' : undefined} onClick={() => setPage(item.id)}><span className={css.navGlyph} aria-hidden="true">{item.glyph}</span><span><strong>{item.label}</strong><small>{item.detail}</small></span></button>)}</nav><div className={css.sidebarFooter}><span>ACTIVE MEMORY BODIES</span><code>{activeBodies} / {status === undefined ? '—' : memoryBodies.length}</code><small>{writeEnabled ? 'Subagent supervised' : 'Read only'}</small></div></aside>
        <section className={css.canvas}>
          {page === 'overview' && <OverviewPage client={client} revision={revision} writeEnabled={writeEnabled} onMutate={mutate} onExplore={explore} />}
          {page === 'explore' && <ExplorePage client={client} status={status} seed={searchSeed} writeEnabled={writeEnabled} onForget={forget} />}
          {page === 'entities' && <EntitiesPage client={client} revision={revision} writeEnabled={writeEnabled} onForget={forget} onExplore={explore} />}
          {page === 'remember' && <RememberPage client={client} sessionId={sessionId} memoryBodies={status?.memoryBodies ?? []} writeEnabled={writeEnabled} seed={rememberSeed} onMutate={mutate} />}
          {page === 'list' && <ListPage client={client} revision={revision} writeEnabled={writeEnabled} onForget={forget} onClone={clone} onExplore={explore} />}
          {page === 'status' && <StatusPage status={status} loading={statusLoading} onRefresh={() => void loadStatus()} />}
        </section>
      </div>
    </main>
  )
}
