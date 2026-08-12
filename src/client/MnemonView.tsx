import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type PointerEvent as ReactPointerEvent } from 'react'
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
import { translateZh, type MnemonKey, type MnemonTranslate } from './locales.ts'
import { MnemonLogo } from './MnemonLogo.tsx'
import css from './MnemonView.module.css'

export interface MnemonViewProps {
  connection: ClientConnectionHandle
  settingsScope: ClientSettingsScope<Config>
  sessionId?: string
  t?: MnemonTranslate
}

type Page = 'overview' | 'explore' | 'entities' | 'remember' | 'list' | 'status'

const PAGE_NAV: Array<{ id: Page; label: MnemonKey; detail: MnemonKey; glyph: string }> = [
  { id: 'overview', label: 'nav.overview', detail: 'nav.overview.detail', glyph: '◇' },
  { id: 'explore', label: 'nav.search', detail: 'nav.search.detail', glyph: '⌕' },
  { id: 'entities', label: 'nav.entities', detail: 'nav.entities.detail', glyph: '◎' },
  { id: 'remember', label: 'nav.remember', detail: 'nav.remember.detail', glyph: '+' },
  { id: 'list', label: 'nav.content', detail: 'nav.content.detail', glyph: '≡' },
  { id: 'status', label: 'nav.status', detail: 'nav.status.detail', glyph: '⌘' },
]

const CATEGORY_KEYS: Record<string, MnemonKey> = {
  decision: 'category.decision',
  preference: 'category.preference',
  fact: 'category.fact',
  insight: 'category.insight',
  context: 'category.context',
  general: 'category.general',
}

const I18nContext = createContext<MnemonTranslate>(translateZh)
function useT(): MnemonTranslate { return useContext(I18nContext) }
function categoryLabel(t: MnemonTranslate, category: string): string { return CATEGORY_KEYS[category] === undefined ? category : t(CATEGORY_KEYS[category]!) }

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

function PageHeader(props: { title: string; description: string; meta?: string; action?: JSX.Element }): JSX.Element {
  return (
    <div className={css.pageHeader}>
      <div><h2>{props.title}</h2><p>{props.description}</p></div>
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
  const t = useT()
  const [confirming, setConfirming] = useState(false)
  const [forgetting, setForgetting] = useState(false)
  const { insight } = props
  const meta = [
    insight.memoryBodyName,
    insight.category !== undefined ? categoryLabel(t, insight.category) : undefined,
    insight.importance !== undefined ? t('common.importance', { value: insight.importance }) : undefined,
    insight.score !== undefined ? `score ${insight.score.toFixed(3)}` : undefined,
    insight.depth !== undefined ? t('common.hops', { count: insight.depth }) : undefined,
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
          <div className={css.confirmBar} role="group" aria-label={t('card.confirmAria')}>
            <span>{t('card.confirmText')}</span>
            <button type="button" className={css.dangerSolidButton} disabled={forgetting} onClick={() => void forget()}>{forgetting ? t('card.processing') : t('card.confirmForget')}</button>
            <button type="button" className={css.ghostButton} disabled={forgetting} onClick={() => setConfirming(false)}>{t('common.cancel')}</button>
          </div>
        ) : (
          <>
            {props.onRelated !== undefined && <button type="button" className={css.ghostButton} onClick={() => props.onRelated?.(insight)}>{t('card.related')}</button>}
            {props.onClone !== undefined && <button type="button" className={css.ghostButton} onClick={() => props.onClone?.(insight)}>{t('card.clone')}</button>}
            <button type="button" className={css.ghostButton} onClick={() => void navigator.clipboard?.writeText(insight.id)}>{t('common.copyId')}</button>
            {props.writeEnabled && <button type="button" className={css.dangerButton} onClick={() => setConfirming(true)}>{t('card.forget')}</button>}
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
  const t = useT()
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
  const dragRef = useRef<{ nodeId: string; pointerId: number; startX: number; startY: number; moved: boolean } | null>(null)

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
    cancelAnimation()
    dragRef.current = { nodeId, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, moved: false }
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }
  const moveDrag = (event: ReactPointerEvent<SVGGElement>) => {
    const drag = dragRef.current
    const svg = event.currentTarget.ownerSVGElement
    if (drag === null || svg === null || drag.pointerId !== event.pointerId) return
    if (!drag.moved && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 4) return
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
    dragRef.current = null
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    if (!drag.moved) {
      const node = visibleNodes.find(candidate => graphNodeKey(candidate) === drag.nodeId)
      if (node !== undefined) props.onSelect(node)
    }
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
  const layoutLabel = t(layoutMode === 'natural' ? 'graph.layoutNatural' : layoutMode === 'uniform' ? 'graph.layoutUniform' : 'graph.layoutCustom')
  return (
    <>
      <div className={css.graphCanvasControls} role="toolbar" aria-label={t('graph.layoutAria')}>
        <span role="status" aria-label={t('graph.layoutStatus', { layout: layoutLabel })}><i />{t('graph.draggable', { layout: layoutLabel })}</span>
        <button type="button" data-active={layoutMode === 'natural' || undefined} onClick={() => animateTo(naturalGraphPositions(visibleNodes, edges), 'natural')}>{t('graph.naturalAction')}</button>
        <button type="button" data-active={layoutMode === 'uniform' || undefined} onClick={() => animateTo(uniformGraphPositions(visibleNodes), 'uniform')}>{t('graph.uniformAction')}</button>
      </div>
      <svg className={css.graphSvg} viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`} role="img" data-layout={layoutMode} data-density={visibleNodes.length <= 12 ? 'sparse' : 'dense'} aria-label={t('graph.aria', { nodes: props.graph.nodes.length, edges: props.graph.edges.length })}>
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
            transform={`translate(${position.x} ${position.y})`} role="button" tabIndex={0} aria-label={`${categoryLabel(t, node.category ?? 'general')}: ${short(node.content, 80)}`}
            data-dragging={dragRef.current?.nodeId === nodeKey || undefined}
            onPointerDown={event => beginDrag(event, nodeKey)} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={cancelDrag} onLostPointerCapture={cancelDrag}
            onClick={() => props.onSelect(node)}
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

function OverviewPage(props: { client: MnemonClient; revision: number; writeEnabled: boolean; fallbackBodies: MemoryBodyView[]; fallbackDirectory: string | undefined; catalogKnown: boolean; onMutate: () => void; onExplore: (query: string) => void }): JSX.Element {
  const t = useT()
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
  const [catalogUnavailable, setCatalogUnavailable] = useState(false)

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true)
    setError(null)
    try {
      const [nextCatalog, next] = await Promise.all([
        props.client.bodies().then(next => { setCatalogUnavailable(false); return next }).catch(() => {
          setCatalogUnavailable(!props.catalogKnown)
          return {
            items: props.fallbackBodies,
            total: props.fallbackBodies.length,
            activeCount: props.fallbackBodies.filter(body => body.active).length,
            directory: props.fallbackDirectory ?? '',
            generatedAt: new Date().toISOString(),
          }
        }),
        props.client.graph(),
      ])
      setCatalog(nextCatalog)
      setGraph(next)
      setSelected(current => current === null ? null : next.nodes.find(node => graphNodeKey(node) === graphNodeKey(current)) ?? null)
    } catch (reason) {
      setError(message(reason))
    } finally {
      setLoading(false)
    }
  }, [props.catalogKnown, props.client, props.fallbackBodies, props.fallbackDirectory])

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

  const generated = graph === null ? t('overview.waitingSnapshot') : t('overview.updatedAt', { time: new Date(graph.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) })
  return (
    <div className={css.page}>
      <PageHeader title={t('overview.title')} description={t('overview.description')} meta={t('overview.interval')}
        action={<button type="button" className={css.secondaryButton} disabled={loading} onClick={() => void load()}>{loading ? t('overview.syncing') : t('overview.syncNow')}</button>} />
      {error !== null && <div className={css.inlineError} role="alert">{error}</div>}
      <section className={css.bodyDirectory} aria-label={t('overview.directory')}>
        <div className={css.bodyDirectoryHeader}>
          <div><h3>{t('overview.directory')}</h3><p>{t('overview.directory.description')}</p><code className={css.bodyDirectoryPath}>{catalogUnavailable ? t('overview.directory.unsynced') : catalog?.directory || props.fallbackDirectory || t('overview.directory.waiting')}</code></div>
          <strong>{catalogUnavailable ? t('overview.directory.unsyncedBadge') : `${catalog?.activeCount ?? '—'} / ${catalog?.total ?? '—'} ${t('common.active')}`}</strong>
        </div>
        <div className={css.bodyGrid}>
          {catalog?.items.map((body, index) => (
            <article key={body.id} className={css.bodyCard} data-active={body.active || undefined} data-healthy={body.healthy || undefined} title={body.error} style={{ '--mn-body-accent': `hsl(${(hash(body.id) + index * 29) % 360} 66% 58%)` } as CSSProperties}>
              <div className={css.bodyCardTop}><span className={css.bodySignal} /><div><strong>{body.name}</strong><code>{body.id}</code><small className={css.bodyHealth}>{body.healthy ? t('overview.storageHealthy') : t('overview.storageUnhealthy')}</small></div><button type="button" role="switch" aria-checked={body.active} aria-label={t('overview.toggleAria', { name: body.name })} disabled={!props.writeEnabled || changing === body.id} onClick={() => void toggle(body)}><i />{changing === body.id ? t('overview.toggling') : body.active ? t('common.active') : t('common.inactive')}</button></div>
              <p>{body.description || t('overview.noDescription')}</p>
              <footer><span>{t('common.memories', { count: body.stats?.totalInsights ?? 0 })}</span><span>{t('common.edges', { count: body.stats?.edgeCount ?? 0 })}</span><span>{humanBytes(body.stats?.dbSizeBytes ?? 0)}</span></footer>
            </article>
          ))}
          {catalog?.total === 0 && <div className={css.bodyDirectoryEmpty}><span>◇</span><div><strong>{catalogUnavailable ? t('overview.unsyncedTitle') : t('overview.emptyTitle')}</strong><p>{catalogUnavailable ? t('overview.unsyncedShort') : t('overview.emptyShort')}</p></div></div>}
        </div>
        {props.writeEnabled && !catalogUnavailable && <details className={css.bodyCreate} open={catalog?.total === 0 ? true : undefined}><summary>{t('overview.create')}</summary><form onSubmit={event => void create(event)}><input aria-label={t('overview.createId')} value={bodyId} onChange={event => setBodyId(event.target.value)} placeholder={t('overview.createIdPlaceholder')} /><input aria-label={t('overview.createName')} value={bodyName} onChange={event => setBodyName(event.target.value)} placeholder={t('overview.createNamePlaceholder')} required /><input aria-label={t('overview.createDescription')} value={bodyDescription} onChange={event => setBodyDescription(event.target.value)} placeholder={t('overview.createDescriptionPlaceholder')} required /><button type="submit" className={css.secondaryButton} disabled={creating}>{creating ? t('overview.creating') : t('overview.createAction')}</button></form></details>}
      </section>
      {!catalogUnavailable && graph !== null && graph.nodes.length > 0 ? (
        <div className={css.graphLayout}>
          <section className={css.graphPanel}>
            <div className={css.graphToolbar}>
              <div><span className={css.liveDot} />{t('overview.snapshot')} <small>{generated}</small></div>
              <div className={css.graphLegend}><span data-edge="temporal">{t('overview.edgeTemporal')}</span><span data-edge="semantic">{t('overview.edgeSemantic')}</span><span data-edge="causal">{t('overview.edgeCausal')}</span><span data-edge="entity">{t('overview.edgeEntity')}</span></div>
            </div>
            <div className={css.graphViewport}><MemoryGraph graph={graph} selectedId={selected === null ? undefined : graphNodeKey(selected)} onSelect={setSelected} /></div>
            <div className={css.graphFooter}><span>{t('overview.graphCount', { visible: Math.min(graph.nodes.length, 60), total: graph.nodes.length })}</span><span>{t('overview.graphEdges', { count: graph.edges.length })}</span></div>
          </section>
          <aside className={css.graphInspector}>
            {selected === null ? (
              <div className={css.inspectorEmpty}><MnemonLogo className={css.inspectorLogo} title={t('overview.inspector')} /><h3>{t('overview.selectNode')}</h3><p>{t('overview.selectNodeText')}</p></div>
            ) : (
              <>
                <div className={css.inspectorHeading}><span>{t('overview.inspector')}</span><button type="button" onClick={() => setSelected(null)} aria-label={t('overview.closeInspector')}>×</button></div>
                <span className={css.categoryChip}>{categoryLabel(t, selected.category ?? 'general')}</span>
                <h3>{selected.content}</h3>
                <dl className={css.inspectorMeta}><div><dt>{t('term.space')}</dt><dd>{selected.memoryBodyName ?? '—'} <code>{selected.memoryBodyId ?? ''}</code></dd></div><div><dt>{t('overview.memoryId')}</dt><dd><code>{selected.id}</code></dd></div><div><dt>{t('common.category')}</dt><dd>{categoryLabel(t, selected.category ?? 'general')}</dd></div></dl>
                <div className={css.inspectorActions}><button type="button" className={css.primaryButton} onClick={() => props.onExplore(selected.content)}>{t('overview.exploreNode')}</button><button type="button" className={css.secondaryButton} onClick={() => void navigator.clipboard?.writeText(selected.id)}>{t('common.copyId')}</button></div>
              </>
            )}
          </aside>
        </div>
      ) : !loading && error === null ? (
        catalogUnavailable
          ? <EmptyState glyph="◇" title={t('overview.unsyncedTitle')}>{t('overview.unsyncedLong')}</EmptyState>
          : catalog?.total === 0
          ? <EmptyState glyph="◇" title={t('overview.emptyTitle')}>{t('overview.emptyLong')}</EmptyState>
          : catalog?.activeCount === 0
            ? <EmptyState glyph="◇" title={t('overview.noActiveTitle')}>{t('overview.noActiveText')}</EmptyState>
            : <EmptyState glyph="◇" title={t('overview.noContentTitle')}>{t('overview.noContentText')}</EmptyState>
      ) : (
        <div className={css.loadingPanel}>{t('overview.loading')}</div>
      )}
    </div>
  )
}

function ExplorePage(props: { client: MnemonClient; status: StatusView | null; seed: string; writeEnabled: boolean; onForget: (insight: Insight) => Promise<void> }): JSX.Element {
  const t = useT()
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
      <PageHeader title={t('search.title')} description={t('search.description')} meta={t('search.maxResults', { count: props.status?.defaultRecallLimit ?? '—' })} />
      <form className={css.searchBar} onSubmit={event => void search(event)}>
        <div className={css.queryField}><span aria-hidden="true">⌕</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder={t('search.placeholder')} aria-label={t('search.queryAria')} /><kbd>↵</kbd></div>
        <div className={css.searchControls}>
          <label>{t('common.category')}<select value={category} onChange={event => setCategory(event.target.value as Category | '')} aria-label={t('search.categoryAria')}><option value="">{t('common.allCategories')}</option>{CATEGORIES.map(value => <option key={value} value={value}>{categoryLabel(t, value)}</option>)}</select></label>
          <label>{t('search.strategy')}<select value={mode} onChange={event => setMode(event.target.value as 'smart' | 'keyword' | 'basic')} aria-label={t('search.modeAria')}><option value="smart">{t('search.modeSmart')}</option><option value="keyword">{t('search.modeKeyword')}</option><option value="basic">{t('search.modeBasic')}</option></select></label>
          <button type="submit" className={css.primaryButton} disabled={searching || query.trim() === ''}>{searching ? t('search.searching') : t('search.action')}</button>
        </div>
      </form>
      {error !== null && <div className={css.inlineError} role="alert">{error}</div>}
      {!searched && <EmptyState glyph="⌕" title={t('search.startTitle')}>{t('search.startText')}</EmptyState>}
      {searched && !searching && results.length === 0 && error === null && <EmptyState glyph="0" title={t('search.emptyTitle')}>{t('search.emptyText')}</EmptyState>}
      {results.length > 0 && (
        <div className={relatedTo === null ? css.singleColumn : css.resultLayout}>
          <section className={css.results}><div className={css.sectionHeading}><div><h3>{t('search.results')}</h3></div><strong>{results.length}</strong></div>{results.map(insight => <InsightCard key={insightKey(insight)} insight={insight} writeEnabled={props.writeEnabled} onForget={forget} onRelated={item => void showRelated(item)} />)}</section>
          {relatedTo !== null && <aside className={css.relatedPane}><div className={css.sectionHeading}><div><h3>{t('search.related')}</h3></div><button type="button" onClick={() => setRelatedTo(null)} aria-label={t('search.closeRelated')}>×</button></div><p className={css.relatedSource}>{relatedTo.content}</p>{relatedLoading && <div className={css.loading}>{t('search.traversing')}</div>}{!relatedLoading && related.length === 0 && <div className={css.muted}>{t('search.noRelated')}</div>}{related.map(insight => <InsightCard key={insightKey(insight)} insight={insight} writeEnabled={props.writeEnabled} onForget={forget} onRelated={item => void showRelated(item)} />)}</aside>}
        </div>
      )}
    </div>
  )
}

function EntitiesPage(props: { client: MnemonClient; revision: number; writeEnabled: boolean; onForget: (insight: Insight) => Promise<void>; onExplore: (query: string) => void }): JSX.Element {
  const t = useT()
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
      <PageHeader title={t('entities.title')} description={t('entities.description')} meta={t('entities.count', { count: view.items.length })} />
      <div className={css.entityLayout}>
        <aside className={css.entityRail}>
          <form className={css.entitySearch} onSubmit={submit}><input aria-label={t('entities.nameAria')} value={entity} onChange={event => setEntity(event.target.value)} placeholder={t('entities.placeholder')} /><button type="submit" className={css.primaryButton} disabled={loading || entity.trim() === ''}>{t('entities.action')}</button></form>
          <div className={css.entityHeading}><span>{t('entities.top')}</span><small>{t('entities.frequency')}</small></div>
          <div className={css.entityList}>{view.items.map(item => <button key={item.entity} type="button" aria-pressed={view.selected === item.entity} onClick={() => { setEntity(item.entity); void load(item.entity) }}><span>{item.entity}</span><strong>{item.count}</strong></button>)}</div>
          {!loading && view.items.length === 0 && <p className={css.muted}>{t('entities.emptyRail')}</p>}
        </aside>
        <section className={css.entityResults}>
          {error !== null && <div className={css.inlineError} role="alert">{error}</div>}
          {loading && <div className={css.loadingPanel}>{t('entities.loading')}</div>}
          {!loading && view.selected === undefined && <EmptyState glyph="◎" title={t('entities.selectTitle')}>{t('entities.selectText')}</EmptyState>}
          {!loading && view.selected !== undefined && <><div className={css.sectionHeading}><div><h3>{view.selected}</h3></div><strong>{view.insights.length}</strong></div>{view.insights.length === 0 ? <EmptyState glyph="0" title={t('entities.emptyTitle')}>{t('entities.emptyText')}</EmptyState> : view.insights.map(insight => <InsightCard key={insightKey(insight)} insight={insight} writeEnabled={props.writeEnabled} onForget={props.onForget} onRelated={() => props.onExplore(insight.content)} />)}</>}
        </section>
      </div>
    </div>
  )
}

function RememberPage(props: { client: MnemonClient; sessionId: string | undefined; memoryBodies: MemoryBodyView[]; writeEnabled: boolean; seed: string; onMutate: () => void }): JSX.Element {
  const t = useT()
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
      setResult(`${t(response.action === 'skipped' ? 'remember.skipped' : 'remember.completed')}${response.memoryBodyIds.length === 0 ? '' : ` · ${response.memoryBodyIds.join(', ')}`}${response.summary === '' ? '' : ` · ${response.summary}`}`)
      setContent('')
      props.onMutate()
    } catch (reason) { setResult(t('remember.dispatchFailed', { error: message(reason) })) } finally { setSupervising(false) }
  }

  const manualSave = async (event: FormEvent) => {
    event.preventDefault(); if (content.trim() === '') return
    setSaving(true); setResult(null)
    try {
      const response = await props.client.remember({ content, category, importance, tags: tags.split(',').map(value => value.trim()).filter(Boolean), entities: entities.split(',').map(value => value.trim()).filter(Boolean), source: 'user', ...(memoryBodyId === '' ? {} : { memoryBodyId }) })
      const action = typeof response.action === 'string' ? response.action : 'saved'
      const summary = typeof response.summary === 'string' ? response.summary : ''
      setResult(action === 'skipped' ? `${t('remember.skipped')}${summary === '' ? '' : ` · ${summary}`}` : `${t('remember.processed', { action })}${summary === '' ? '' : ` · ${summary}`}`)
      if (action !== 'skipped') { setContent(''); setTags(''); setEntities(''); props.onMutate() }
    } catch (reason) { setResult(t('remember.saveFailed', { error: message(reason) })) } finally { setSaving(false) }
  }

  return (
    <div className={css.page}>
      <PageHeader title={t('remember.title')} description={t('remember.description')} meta={props.writeEnabled ? t('remember.worker') : t('common.readOnly')} />
      {!props.writeEnabled ? <EmptyState glyph="⊘" title={t('remember.readOnlyTitle')}>{t('remember.readOnlyText')}</EmptyState> : (
        <div className={css.writebackLayout}>
          <aside className={css.writeGuide}><h3>{t('remember.flowTitle')}</h3><ol><li><strong>{t('remember.routeTitle')}</strong><span>{t('remember.routeText')}</span></li><li><strong>{t('remember.dedupeTitle')}</strong><span>{t('remember.dedupeText')}</span></li><li><strong>{t('remember.writeTitle')}</strong><span>{t('remember.writeText')}</span></li></ol><p>{t('remember.flowText')}</p></aside>
          <section className={css.supervisedComposer}>
            <form className={css.supervisedForm} onSubmit={event => void supervise(event)}>
              <div className={css.supervisedHeading}><div><h3>{t('remember.delegateTitle')}</h3></div><span className={props.sessionId === undefined ? css.sessionMissing : css.sessionReady}>{props.sessionId === undefined ? t('remember.noSession') : t('remember.ready')}</span></div>
              <label className={css.fieldWide}>{t('remember.candidate')}<textarea aria-label={t('remember.candidateAria')} value={content} onChange={event => setContent(event.target.value)} maxLength={8000} rows={8} placeholder={t('remember.placeholder')} /></label>
              {props.sessionId === undefined && <p className={css.sessionHint}>{t('remember.sessionHint')}</p>}
              <div className={css.formActions}><button type="submit" className={css.primaryButton} disabled={supervising || content.trim() === '' || props.sessionId === undefined}>{supervising ? t('remember.processing') : t('remember.action')}</button>{result !== null && <span role="status">{result}</span>}</div>
            </form>
            <details className={css.advancedWrite}>
              <summary><span><strong>{t('remember.advanced')}</strong><small>{t('remember.advancedHint')}</small></span><span>{t('remember.expand')}</span></summary>
              <form className={css.manualForm} onSubmit={event => void manualSave(event)}>
                <div className={css.formGrid}><label className={css.fieldWide}>{t('remember.target')}<select aria-label={t('remember.target')} value={memoryBodyId} onChange={event => setMemoryBodyId(event.target.value)}>{props.memoryBodies.map(body => <option key={body.id} value={body.id}>{body.name} · {body.id}{body.active ? ` · ${t('common.active')}` : ''}</option>)}</select></label><label>{t('common.category')}<select value={category} onChange={event => setCategory(event.target.value as Category)}>{CATEGORIES.map(value => <option key={value} value={value}>{categoryLabel(t, value)}</option>)}</select></label><label>{t('common.importanceLabel')}<select value={importance} onChange={event => setImportance(Number(event.target.value))}>{[1, 2, 3, 4, 5].map(value => <option key={value} value={value}>{value} / 5</option>)}</select></label><label className={css.fieldWide}>{t('remember.entities')}<input value={entities} onChange={event => setEntities(event.target.value)} placeholder="SQLite, DSH" /></label><label className={css.fieldWide}>{t('remember.tags')}<input value={tags} onChange={event => setTags(event.target.value)} placeholder="architecture, local-first" /></label></div>
                <div className={css.manualActions}><p>{t('remember.advancedText')}</p><button type="submit" className={css.secondaryButton} disabled={saving || content.trim() === '' || props.sessionId === undefined || memoryBodyId === ''}>{saving ? t('remember.saving') : t('remember.advancedAction')}</button></div>
              </form>
            </details>
          </section>
        </div>
      )}
    </div>
  )
}

function ListPage(props: { client: MnemonClient; revision: number; writeEnabled: boolean; onForget: (insight: Insight) => Promise<void>; onClone: (insight: Insight) => void; onExplore: (query: string) => void }): JSX.Element {
  const t = useT()
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
      <PageHeader title={t('content.title')} description={t('content.description')} meta={t('content.count', { count: view?.total ?? '—' })} />
      <form className={css.listToolbar} onSubmit={submit}><input aria-label={t('content.filterAria')} value={query} onChange={event => setQuery(event.target.value)} placeholder={t('content.filterPlaceholder')} /><select aria-label={t('content.categoryAria')} value={category} onChange={event => setCategory(event.target.value as Category | '')}><option value="">{t('common.allCategories')}</option>{CATEGORIES.map(value => <option key={value} value={value}>{categoryLabel(t, value)}</option>)}</select><button type="submit" className={css.primaryButton} disabled={loading}>{loading ? t('common.loading') : t('content.apply')}</button></form>
      <div className={css.listNotice}>{t('content.notice')}</div>
      {error !== null && <div className={css.inlineError} role="alert">{error}</div>}
      {!loading && view?.items.length === 0 && <EmptyState glyph="≡" title={t('content.emptyTitle')}>{t('content.emptyText')}</EmptyState>}
      <div className={css.memoryList}>{view?.items.map(insight => <InsightCard key={insightKey(insight)} insight={insight} writeEnabled={props.writeEnabled} onForget={forget} onClone={props.onClone} onRelated={() => props.onExplore(insight.content)} />)}</div>
    </div>
  )
}

function StatusPage(props: { status: StatusView | null; loading: boolean; onRefresh: () => void }): JSX.Element {
  const t = useT()
  const status = props.status
  const lifecycle = status?.lifecycle
  const current = lifecycle?.current
  const workers = lifecycle?.subagents
  const catalogKnown = status?.memoryBodies !== undefined
  const memoryBodies = useMemo(() => status?.memoryBodies ?? [], [status])
  const activeBodies = memoryBodies.filter(body => body.active).length
  const latest = current?.lastAt === undefined ? t('status.noActivity') : new Date(current.lastAt).toLocaleString()
  const phase = current?.lastPhase === undefined || current.lastPhase === 'idle' ? t('status.phaseIdle') : current.lastPhase === 'supervised' ? t('status.phaseSupervised') : current.lastPhase === 'error' ? t('status.phaseError') : current.lastPhase === 'prime' ? t('status.prime') : current.lastPhase === 'recall' ? t('status.recallWorker') : t('status.writeWorker')
  return (
    <div className={css.page}>
      <PageHeader title={t('status.title')} description={t('status.description')} meta={status?.healthy === true && lifecycle?.sessionAvailable === true ? t('status.nominal') : t('status.checkRequired')} action={<button type="button" className={css.secondaryButton} onClick={props.onRefresh}>{props.loading ? t('status.rechecking') : t('status.recheck')}</button>} />

      <section className={css.healthStrip} aria-label={t('status.aria')}>
        <article><span className={`${css.healthIndicator} ${status?.healthy === true ? css.healthGood : css.healthBad}`} /><div><small>{t('status.engine')}</small><strong>{status?.healthy === true ? t('status.engineConnected') : t('status.engineUnavailable')}</strong><p>{status?.version === undefined ? t('status.versionWaiting') : `CLI ${status.version}`}</p></div></article>
        <article><span className={`${css.healthIndicator} ${activeBodies > 0 ? css.healthGood : css.healthMuted}`} /><div><small>{t('status.spaces')}</small><strong>{catalogKnown ? t('status.activeRatio', { active: activeBodies, total: memoryBodies.length }) : t('status.directoryUnsynced')}</strong><p>{t('status.activeMemories', { count: status?.stats?.totalInsights ?? 0 })}</p></div></article>
        <article><span className={`${css.healthIndicator} ${lifecycle?.sessionAvailable === true ? css.healthGood : css.healthBad}`} /><div><small>{t('status.router')}</small><strong>{lifecycle?.sessionAvailable === true ? t('status.routerReady') : t('status.sessionMissing')}</strong><p>{workers === undefined ? t('status.orchestrationWaiting') : t('status.workerCounts', { recalls: workers.recalls, writes: workers.writes })}</p></div></article>
      </section>

      <div className={css.statusLayout}>
        <section className={css.lifecyclePanel}>
          <div className={css.statusSectionHeader}><div><h3>{t('status.lifecycle')}</h3><p>{t('status.lifecycleText')}</p></div><span className={css.phaseBadge}>{phase}</span></div>
          <div className={css.lifecycleFlow}>
            <article><span>01</span><div><strong>{t('status.prime')}</strong><p>{t('status.primeText')}</p></div><code>{lifecycle?.counters.primes ?? 0}</code></article>
            <article data-disabled={lifecycle?.recallMode === 'off' || undefined}><span>02</span><div><strong>{t('status.recallWorker')}</strong><p>{lifecycle?.recallMode === 'guided' ? t('status.recallText') : t('status.recallOff')}</p></div><code>{workers?.recalls ?? 0}</code></article>
            <article data-disabled={lifecycle?.writebackMode === 'off' || undefined}><span>03</span><div><strong>{t('status.writeWorker')}</strong><p>{lifecycle?.writebackMode === 'guided' ? t('status.writeText') : t('status.writeOff')}</p></div><code>{workers?.writes ?? 0}</code></article>
          </div>
          <div className={css.lifecycleFoot}><span>{t('status.latestPhase')} <strong>{phase}</strong></span><span>{t('status.latestActivity')} <strong>{latest}</strong></span><span>{t('status.supervisedRequests')} <strong>{lifecycle?.counters.supervisedRequests ?? 0}</strong></span><span>{t('status.workerFailures')} <strong>{workers?.failures ?? 0}</strong></span></div>
          {current?.lastError !== undefined && <div className={css.inlineError} role="alert">Lifecycle：{current.lastError}</div>}
        </section>

        <aside className={css.diagnosticsPanel}>
          <div className={css.statusSectionHeader}><div><h3>{t('status.quickDiagnostics')}</h3></div></div>
          <ul className={css.diagnosticList}>
            <li data-ok={status?.commandFound || undefined}><span />{status?.commandFound ? t('status.cliExecutable') : t('status.cliMissing')}</li>
            <li data-ok={catalogKnown && activeBodies > 0 || undefined}><span />{catalogKnown ? t('status.readingSpaces', { count: activeBodies }) : t('status.directoryWaiting')}</li>
            <li data-ok={lifecycle?.sessionAvailable || undefined}><span />{lifecycle?.sessionAvailable ? t('status.webAgentReady') : t('status.liveSessionMissing')}</li>
            <li data-ok={(lifecycle?.counters.failures ?? 0) === 0 || undefined}><span />{t('status.lifecycleFailures', { count: lifecycle?.counters.failures ?? 0 })}</li>
          </ul>
          <div className={css.nativeAccess}><h3>{t('status.nativeAccess')}</h3><code>/mnemon status</code><code>/mnemon recall &lt;query&gt;</code><p>{t('status.nativeAccessText')}</p></div>
        </aside>
      </div>

      <section className={css.runtimeDetails}>
        <div className={css.statusSectionHeader}><div><h3>{t('status.engineStorage')}</h3></div><span className={`${css.runtimeBadge} ${status?.healthy === true ? css.runtimeOnline : css.runtimeOffline}`}>{status?.healthy === true ? t('status.online') : t('status.offline')}</span></div>
        <dl><div><dt>CLI</dt><dd><code>{status?.cliPath ?? 'mnemon'}</code></dd></div><div><dt>{t('status.mnemonVersion')}</dt><dd>{status?.version ?? '—'}</dd></div><div><dt>{t('status.directory')}</dt><dd><code>{status?.memoryBodyDirectory ?? '—'}</code></dd></div><div><dt>{t('status.activeDbSize')}</dt><dd>{status?.stats === undefined ? '—' : humanBytes(status.stats.dbSizeBytes)}</dd></div><div><dt>{t('term.spaces')}</dt><dd>{catalogKnown ? t('common.count', { count: memoryBodies.length }) : '—'}</dd></div><div><dt>{t('status.activeCount')}</dt><dd>{catalogKnown ? t('common.count', { count: activeBodies }) : '—'}</dd></div><div><dt>{t('telemetry.memories')}</dt><dd>{status?.stats?.totalInsights ?? '—'}</dd></div><div><dt>{t('status.activeGraphEdges')}</dt><dd>{status?.stats?.edgeCount ?? '—'}</dd></div></dl>
      </section>
    </div>
  )
}

export function MnemonView(props: MnemonViewProps): JSX.Element {
  return <I18nContext.Provider value={props.t ?? translateZh}><MnemonWorkspace {...props} /></I18nContext.Provider>
}

function MnemonWorkspace({ connection, sessionId }: MnemonViewProps): JSX.Element {
  const t = useT()
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
  const catalogKnown = status?.memoryBodies !== undefined
  const memoryBodies = useMemo(() => status?.memoryBodies ?? [], [status])
  const activeBodies = memoryBodies.filter(body => body.active).length

  return (
    <main className={css.shell}>
      <header className={css.masthead}>
        <div className={css.brand}><MnemonLogo className={css.brandLogo} /><div><h1>Mnemon</h1><p>LLM-supervised 4-graph persistent memory for AI agents.</p></div></div>
        <div className={css.statusCluster}><span className={`${css.statusDot} ${status?.healthy === true ? css.online : css.offline}`} /><span>{statusLoading ? t('header.checking') : status?.healthy === true ? catalogKnown ? t('header.connected', { count: activeBodies }) : t('header.directoryPending') : t('header.unavailable')}</span><button type="button" className={css.iconButton} onClick={refreshAll} aria-label={t('common.refresh')}>↻</button></div>
      </header>
      {(statusError !== null || status?.healthy === false) && <div className={css.alert} role="alert"><strong>{t('header.notReady')}</strong><span>{statusError ?? status?.error}</span></div>}
      <section className={css.telemetry} aria-label={t('telemetry.aria')}><div className={css.telemetryLead}><span className={css.telemetryPulse} />{t('telemetry.title')}</div><div className={css.telemetryMetric}><span>{t('telemetry.memories')}</span><strong>{stats?.totalInsights ?? '—'}</strong></div><div className={css.telemetryMetric}><span>{t('telemetry.graph')}</span><strong>{stats?.edgeCount ?? '—'}</strong></div><div className={css.telemetryMetric}><span>{t('telemetry.entities')}</span><strong>{stats?.topEntities.length ?? '—'}</strong></div><div className={css.telemetryMetric}><span>{t('telemetry.spaces')}</span><strong>{status === null || !catalogKnown ? '—' : activeBodies}</strong></div></section>
      <div className={css.workspace}>
        <div className={css.topNavigation}><nav className={css.nav} aria-label={t('nav.aria')}>{PAGE_NAV.map(item => <button key={item.id} type="button" aria-current={page === item.id ? 'page' : undefined} onClick={() => setPage(item.id)}><span className={css.navGlyph} aria-hidden="true">{item.glyph}</span><span><strong>{t(item.label)}</strong><small>{t(item.detail)}</small></span></button>)}</nav><div className={css.spaceSummary}><span>{t('sidebar.activeSpaces')}</span><code>{catalogKnown ? `${activeBodies} / ${memoryBodies.length}` : '— / —'}</code><small>{writeEnabled ? t('common.agentSupervised') : t('common.readOnly')}</small></div></div>
        <section className={css.canvas}>
          {page === 'overview' && <OverviewPage client={client} revision={revision} writeEnabled={writeEnabled} fallbackBodies={memoryBodies} fallbackDirectory={status?.memoryBodyDirectory} catalogKnown={catalogKnown} onMutate={mutate} onExplore={explore} />}
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
