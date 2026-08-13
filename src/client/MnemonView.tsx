import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type FormEvent, type PointerEvent as ReactPointerEvent } from 'react'
import Markdown from 'markdown-to-jsx'
import type { ClientConnectionHandle, ClientSettingsScope } from '../contracts.ts'
import type { Config } from '../config.ts'
import type { DocumentRecord, DocumentSnapshot, DocumentView } from '../documents.ts'
import { QODERWORK_REVIEW_POLICY } from '../review-activity.ts'
import type { RuntimeMemoryEntry, RuntimeMemoryImportance, RuntimeMemorySnapshot, RuntimeMemoryTarget } from '../runtime-memory.ts'
import type { StorageAreaInventory, StorageScopeInventory, StorageScopeKind } from '../storage-scope.ts'
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

type Page = 'overview' | 'runtime' | 'documents' | 'explore' | 'entities' | 'remember' | 'list' | 'status'

const PAGE_NAV: Array<{ id: Page; label: MnemonKey; detail: MnemonKey; glyph: string }> = [
  { id: 'overview', label: 'nav.overview', detail: 'nav.overview.detail', glyph: '◇' },
  { id: 'runtime', label: 'nav.runtime', detail: 'nav.runtime.detail', glyph: '◫' },
  { id: 'documents', label: 'nav.documents', detail: 'nav.documents.detail', glyph: '▤' },
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

const SAFE_LINK_PATTERN = /^(?:https?:|mailto:|#|\/)/iu

function safeLink(href: string | null | undefined): string | undefined {
  if (href == null) return undefined
  const value = href.trim()
  return SAFE_LINK_PATTERN.test(value) ? value : undefined
}

/** Render managed Markdown without raw HTML and with a deliberately small link surface. */
function DocumentMarkdown(props: { content: string }): JSX.Element {
  return (
    <div className={css.markdownBody}>
      <Markdown options={{
        disableParsingRawHTML: true,
        forceBlock: true,
        overrides: {
          a: {
            component: ({ href, children, ...rest }: { href?: string; children?: JSX.Element | string }) => {
              const target = safeLink(href)
              return target === undefined
                ? <span>{children}</span>
                : <a {...rest} href={target} target={target.startsWith('http') ? '_blank' : undefined} rel={target.startsWith('http') ? 'noreferrer noopener' : undefined}>{children}</a>
            },
          },
        },
      }}>{props.content}</Markdown>
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
const CATEGORY_ORDER = ['space', 'entity', 'preference', 'decision', 'fact', 'insight', 'context', 'general']

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

function graphNodeKind(node: MemoryGraphNode): NonNullable<MemoryGraphNode['kind']> {
  return node.kind ?? 'memory'
}

function spaceGraphId(id: string): string {
  return `space:${id}`
}

function entityGraphId(entity: string): string {
  return `entity:${encodeURIComponent(normalizeEntity(entity))}`
}

function normalizeEntity(entity: string): string {
  return entity.normalize('NFKC').trim().toLocaleLowerCase()
}

/** Add routing scopes and entity indexes without issuing another recall. */
function enrichMultiSpaceGraph(graph: MemoryGraphSnapshot, bodies: MemoryBodyView[]): MemoryGraphSnapshot {
  if (graph.nodes.length === 0) return graph
  const memories = graph.nodes.map(node => ({ ...node, kind: 'memory' as const }))
  const memoriesByBody = new Map<string, MemoryGraphNode[]>()
  for (const node of memories) {
    if (node.memoryBodyId === undefined) continue
    memoriesByBody.set(node.memoryBodyId, [...(memoriesByBody.get(node.memoryBodyId) ?? []), node])
  }

  const activeBodies = bodies.filter(body => body.active && ((memoriesByBody.get(body.id)?.length ?? 0) > 0 || (body.stats?.topEntities.length ?? 0) > 0))
  const spaceNodes: MemoryGraphNode[] = activeBodies.map(body => ({
    id: body.id,
    graphId: spaceGraphId(body.id),
    kind: 'space',
    category: 'space',
    content: body.name,
    color: '#22a879',
    memoryBodyId: body.id,
    memoryBodyName: body.name,
    occurrenceCount: body.stats?.totalInsights ?? memoriesByBody.get(body.id)?.length ?? 0,
  }))

  // Native Mnemon entity edges connect two memories. This overview renders
  // entities as first-class nodes, so retaining those edges would falsely make
  // a memory-to-memory edge look like an entity-to-memory association.
  const edges: MemoryGraphSnapshot['edges'] = graph.edges.filter(edge => edge.type !== 'entity')
  for (const body of activeBodies) {
    for (const memory of memoriesByBody.get(body.id) ?? []) {
      edges.push({ sourceId: spaceGraphId(body.id), targetId: graphNodeKey(memory), label: 'scope', color: '#708199', type: 'scope' })
    }
  }

  const bodiesById = new Map(activeBodies.map(body => [body.id, body]))
  const indexedEntities = new Map<string, { entity: string; memories: MemoryGraphNode[]; bodies: MemoryBodyView[] }>()
  for (const memory of memories) {
    const body = memory.memoryBodyId === undefined ? undefined : bodiesById.get(memory.memoryBodyId)
    if (body === undefined) continue
    const seen = new Set<string>()
    for (const rawEntity of memory.entities ?? []) {
      const entity = rawEntity.trim()
      const key = normalizeEntity(entity)
      if (key === '' || seen.has(key)) continue
      seen.add(key)
      const current = indexedEntities.get(key)
      if (current === undefined) indexedEntities.set(key, { entity, memories: [memory], bodies: [body] })
      else {
        current.memories.push(memory)
        if (!current.bodies.some(candidate => candidate.id === body.id)) current.bodies.push(body)
      }
    }
  }
  const entities = [...indexedEntities.values()].sort((left, right) => right.memories.length - left.memories.length || left.entity.localeCompare(right.entity)).slice(0, 24)
  const entityNodes: MemoryGraphNode[] = entities.map(item => ({
    id: item.entity,
    graphId: entityGraphId(item.entity),
    kind: 'entity',
    category: 'entity',
    content: item.entity,
    color: '#2b9db9',
    occurrenceCount: item.memories.length,
    memoryBodyIds: item.bodies.map(body => body.id),
    memoryBodyNames: item.bodies.map(body => body.name),
  }))
  for (const item of entities) {
    const key = entityGraphId(item.entity)
    for (const memory of item.memories) edges.push({ sourceId: key, targetId: graphNodeKey(memory), label: item.entity, color: '#22a879', type: 'entity' })
  }

  return { ...graph, nodes: [...spaceNodes, ...entityNodes, ...memories], edges }
}

function graphKindLabel(t: MnemonTranslate, node: MemoryGraphNode): string {
  const kind = graphNodeKind(node)
  return kind === 'space' ? t('graph.kindSpace') : kind === 'entity' ? t('graph.kindEntity') : categoryLabel(t, node.category ?? 'general')
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
      const desired = (edge.type === 'scope' ? 138 : edge.type === 'entity' ? 94 : edge.type === 'semantic' ? 118 : 106) * sparseScale
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
  const visibleNodes = useMemo(() => {
    const spaces = props.graph.nodes.filter(node => graphNodeKind(node) === 'space')
    const entities = props.graph.nodes.filter(node => graphNodeKind(node) === 'entity').slice(0, 20)
    const memories = props.graph.nodes.filter(node => graphNodeKind(node) === 'memory').slice(0, Math.max(0, 60 - spaces.length - entities.length))
    return [...spaces, ...entities, ...memories].slice(0, 60)
  }, [props.graph.nodes])
  const visibleIds = useMemo(() => new Set(visibleNodes.map(graphNodeKey)), [visibleNodes])
  const visibleKinds = useMemo(() => new Map(visibleNodes.map(node => [graphNodeKey(node), graphNodeKind(node)])), [visibleNodes])
  const edges = useMemo(() => {
    const priority = new Map<string, number>([['entity', 0], ['scope', 1], ['causal', 2], ['semantic', 3], ['temporal', 4]])
    return props.graph.edges
      .filter(edge => visibleIds.has(edge.sourceId) && visibleIds.has(edge.targetId))
      .map((edge, index) => ({ edge, index }))
      .sort((left, right) => (priority.get(left.edge.type ?? 'temporal') ?? 5) - (priority.get(right.edge.type ?? 'temporal') ?? 5) || left.index - right.index)
      .slice(0, 180)
      .map(({ edge }) => edge)
  }, [props.graph.edges, visibleIds])
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
  const layoutKey = `${visibleNodes.map(node => `${graphNodeKey(node)}:${graphNodeKind(node)}:${node.category ?? 'general'}`).join('|')}::${edges.map(edge => `${edge.sourceId}>${edge.targetId}:${edge.type ?? 'temporal'}`).join('|')}`
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
        const source = positions.get(edge.sourceId) ?? naturalLayout.get(edge.sourceId) ?? { x: GRAPH_WIDTH / 2, y: GRAPH_HEIGHT / 2 }
        const target = positions.get(edge.targetId) ?? naturalLayout.get(edge.targetId) ?? { x: GRAPH_WIDTH / 2, y: GRAPH_HEIGHT / 2 }
        const dx = target.x - source.x
        const dy = target.y - source.y
        const distance = Math.max(1, Math.hypot(dx, dy))
        const direction = edge.sourceId.localeCompare(edge.targetId) <= 0 ? 1 : -1
        const controlX = (source.x + target.x) / 2 - (dy / distance) * offset * direction
        const controlY = (source.y + target.y) / 2 + (dx / distance) * offset * direction
        return <path key={`${edge.sourceId}-${edge.targetId}-${index}`} d={`M ${source.x} ${source.y} Q ${controlX} ${controlY} ${target.x} ${target.y}`} className={css.graphEdge} data-edge={edge.type ?? 'temporal'} data-source-id={edge.sourceId} data-target-id={edge.targetId} data-source-kind={visibleKinds.get(edge.sourceId)} data-target-kind={visibleKinds.get(edge.targetId)} />
      })}
      {visibleNodes.map((node, index) => {
        const nodeKey = graphNodeKey(node)
        const position = positions.get(nodeKey) ?? naturalLayout.get(nodeKey) ?? { x: GRAPH_WIDTH / 2, y: GRAPH_HEIGHT / 2 }
        const selected = props.selectedId === nodeKey
        const showLabel = selected || visibleNodes.length < 22 || index % 3 === 0
        return (
          <g key={nodeKey} className={css.graphNode} data-node-id={nodeKey} data-category={node.category ?? 'general'} data-kind={graphNodeKind(node)} data-selected={selected || undefined}
            transform={`translate(${position.x} ${position.y})`} role="button" tabIndex={0} aria-label={`${graphKindLabel(t, node)}: ${short(node.content, 80)}`}
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
            {graphNodeKind(node) === 'space'
              ? <><rect x={selected ? -20 : -17} y={selected ? -15 : -13} width={selected ? 40 : 34} height={selected ? 30 : 26} rx="9" className={css.nodeHalo} filter={selected ? 'url(#mnemon-glow)' : undefined} /><circle r={selected ? 6 : 5} className={css.nodeCore} /></>
              : graphNodeKind(node) === 'entity'
                ? <><path d={selected ? 'M 0 -18 L 18 0 L 0 18 L -18 0 Z' : 'M 0 -14 L 14 0 L 0 14 L -14 0 Z'} className={css.nodeHalo} filter={selected ? 'url(#mnemon-glow)' : undefined} /><circle r={selected ? 5 : 4} className={css.nodeCore} /></>
                : <><circle r={selected ? 17 : visibleNodes.length <= 12 ? 14 : 11} className={css.nodeHalo} filter={selected ? 'url(#mnemon-glow)' : undefined} /><circle r={selected ? 7 : visibleNodes.length <= 12 ? 6 : 4.5} className={css.nodeCore} /></>}
            {(selected || visibleNodes.length <= 12) && graphNodeKind(node) === 'memory' && node.memoryBodyName !== undefined && <text x="0" y="-18" textAnchor="middle" className={css.nodeBodyLabel}>{short(node.memoryBodyName, 12)}</text>}
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
      const enriched = enrichMultiSpaceGraph(next, nextCatalog.items)
      setCatalog(nextCatalog)
      setGraph(enriched)
      setSelected(current => current === null ? null : enriched.nodes.find(node => graphNodeKey(node) === graphNodeKey(current)) ?? null)
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
      await props.client.createBody({ name: bodyName, description: bodyDescription })
      setBodyName(''); setBodyDescription('')
      await load(true)
      props.onMutate()
    } catch (reason) { setError(message(reason)) } finally { setCreating(false) }
  }

  const generated = graph === null ? t('overview.waitingSnapshot') : t('overview.updatedAt', { time: new Date(graph.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) })
  const graphSpaces = graph?.nodes.filter(node => graphNodeKind(node) === 'space').length ?? 0
  const graphEntities = graph?.nodes.filter(node => graphNodeKind(node) === 'entity').length ?? 0
  const graphMemories = graph?.nodes.filter(node => graphNodeKind(node) === 'memory').length ?? 0
  const selectedKind = selected === null ? null : graphNodeKind(selected)
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
          {catalog?.items.map(body => (
            <article key={body.id} className={css.bodyCard} data-active={body.active || undefined} data-healthy={body.healthy || undefined} title={body.error}>
              <div className={css.bodyCardTop}><span className={css.bodySignal} /><div><strong>{body.name}</strong><code>{body.id}</code><small className={css.bodyHealth}>{body.healthy ? t('overview.storageHealthy') : t('overview.storageUnhealthy')}</small></div><button type="button" className={css.bodySwitch} role="switch" aria-checked={body.active} aria-label={t('overview.toggleAria', { name: body.name })} disabled={!props.writeEnabled || changing === body.id} onClick={() => void toggle(body)}><span className={css.bodySwitchTrack} aria-hidden="true"><i /></span><span>{changing === body.id ? t('overview.toggling') : body.active ? t('common.active') : t('common.inactive')}</span></button></div>
              <p>{body.description || t('overview.noDescription')}</p>
              <footer><span>{t('common.memories', { count: body.stats?.totalInsights ?? 0 })}</span><span>{t('common.edges', { count: body.stats?.edgeCount ?? 0 })}</span><span>{humanBytes(body.stats?.dbSizeBytes ?? 0)}</span></footer>
            </article>
          ))}
          {catalog?.total === 0 && <div className={css.bodyDirectoryEmpty}><span>◇</span><div><strong>{catalogUnavailable ? t('overview.unsyncedTitle') : t('overview.emptyTitle')}</strong><p>{catalogUnavailable ? t('overview.unsyncedShort') : t('overview.emptyShort')}</p></div></div>}
        </div>
        {props.writeEnabled && !catalogUnavailable && <details className={css.bodyCreate} open={catalog?.total === 0 ? true : undefined}><summary>{t('overview.create')}</summary><form onSubmit={event => void create(event)}><input aria-label={t('overview.createName')} value={bodyName} onChange={event => setBodyName(event.target.value)} placeholder={t('overview.createNamePlaceholder')} required /><input aria-label={t('overview.createDescription')} value={bodyDescription} onChange={event => setBodyDescription(event.target.value)} placeholder={t('overview.createDescriptionPlaceholder')} required /><button type="submit" className={css.secondaryButton} disabled={creating}>{creating ? t('overview.creating') : t('overview.createAction')}</button></form></details>}
      </section>
      {!catalogUnavailable && graph !== null && graph.nodes.length > 0 ? (
        <div className={css.graphLayout}>
          <section className={css.graphPanel}>
            <div className={css.graphToolbar}>
              <div><span className={css.liveDot} />{t('overview.snapshot')} <small>{generated}</small></div>
              <div className={css.graphLegend}><span data-edge="scope">{t('overview.edgeScope')}</span><span data-edge="temporal">{t('overview.edgeTemporal')}</span><span data-edge="semantic">{t('overview.edgeSemantic')}</span><span data-edge="causal">{t('overview.edgeCausal')}</span><span data-edge="entity">{t('overview.edgeEntity')}</span></div>
            </div>
            <div className={css.graphViewport}><MemoryGraph graph={graph} selectedId={selected === null ? undefined : graphNodeKey(selected)} onSelect={setSelected} /></div>
            <div className={css.graphFooter}><span>{t('overview.graphComposition', { spaces: graphSpaces, memories: graphMemories, entities: graphEntities })}</span><span>{t('overview.graphCount', { visible: Math.min(graph.nodes.length, 60), total: graph.nodes.length })} · {t('overview.graphEdges', { count: graph.edges.length })}</span></div>
          </section>
          <aside className={css.graphInspector} data-empty={selected === null || undefined}>
            {selected === null ? (
              <div className={css.inspectorEmpty}><MnemonLogo className={css.inspectorLogo} title={t('overview.inspector')} /><h3>{t('overview.selectNode')}</h3><p>{t('overview.selectNodeText')}</p></div>
            ) : (
              <>
                <div className={css.inspectorHeading}><span>{t(selectedKind === 'space' ? 'overview.inspectorSpace' : selectedKind === 'entity' ? 'overview.inspectorEntity' : 'overview.inspector')}</span><button type="button" onClick={() => setSelected(null)} aria-label={t('overview.closeInspector')}>×</button></div>
                <span className={css.categoryChip}>{graphKindLabel(t, selected)}</span>
                <h3>{selected.content}</h3>
                {selectedKind === 'space'
                  ? <dl className={css.inspectorMeta}><div><dt>{t('overview.spaceId')}</dt><dd><code>{selected.memoryBodyId ?? selected.id}</code></dd></div><div><dt>{t('overview.containedMemories')}</dt><dd>{selected.occurrenceCount ?? 0}</dd></div></dl>
                  : selectedKind === 'entity'
                    ? <dl className={css.inspectorMeta}><div><dt>{t('overview.entityMentions')}</dt><dd>{selected.occurrenceCount ?? 0}</dd></div><div><dt>{t('term.spaces')}</dt><dd>{selected.memoryBodyNames?.join(' · ') || '—'}</dd></div></dl>
                    : <dl className={css.inspectorMeta}><div><dt>{t('term.space')}</dt><dd>{selected.memoryBodyName ?? '—'} <code>{selected.memoryBodyId ?? ''}</code></dd></div><div><dt>{t('overview.memoryId')}</dt><dd><code>{selected.id}</code></dd></div><div><dt>{t('common.category')}</dt><dd>{categoryLabel(t, selected.category ?? 'general')}</dd></div></dl>}
                <div className={css.inspectorActions}>{selectedKind !== 'space' && <button type="button" className={css.primaryButton} onClick={() => props.onExplore(selected.content)}>{t('overview.exploreNode')}</button>}<button type="button" className={css.secondaryButton} onClick={() => void navigator.clipboard?.writeText(selected.id)}>{t('common.copyId')}</button></div>
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
  const [searchKind, setSearchKind] = useState<'direct' | 'agent' | null>(null)
  const [agentAnswer, setAgentAnswer] = useState<{ answer: string; citations: string[]; runId: string } | null>(null)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [relatedTo, setRelatedTo] = useState<Insight | null>(null)
  const [related, setRelated] = useState<Insight[]>([])
  const [relatedLoading, setRelatedLoading] = useState(false)

  useEffect(() => { if (props.seed !== '') setQuery(props.seed) }, [props.seed])

  const runSearch = async (withAgent: boolean) => {
    if (query.trim() === '') return
    setSearchKind(withAgent ? 'agent' : 'direct'); setSearched(true); setError(null); setRelatedTo(null); setAgentAnswer(null)
    try {
      const request = { query, mode, ...(category === '' ? {} : { category }), limit: props.status?.defaultRecallLimit ?? 10 }
      if (withAgent) {
        const response = await props.client.agentSearch(request)
        setResults(response.results)
        setAgentAnswer({ answer: response.answer, citations: response.citations, runId: response.delegation.runId })
      } else {
        setResults((await props.client.search(request)).results)
      }
    } catch (reason) {
      setError(message(reason)); setResults([]); setAgentAnswer(null)
    } finally {
      setSearchKind(null)
    }
  }

  const search = (event: FormEvent) => { event.preventDefault(); void runSearch(false) }
  const searching = searchKind !== null

  const showRelated = async (insight: Insight) => {
    setRelatedTo(insight); setRelated([]); setRelatedLoading(true); setError(null)
    if (typeof window.requestAnimationFrame === 'function') window.requestAnimationFrame(() => document.getElementById('mnemon-related-pane')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }))
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
          <div className={css.searchActions}><button type="submit" className={css.secondaryButton} disabled={searching || query.trim() === ''}>{searchKind === 'direct' ? t('search.searching') : t('search.action')}</button><button type="button" className={css.primaryButton} disabled={searching || query.trim() === '' || props.status?.lifecycle?.sessionAvailable !== true} onClick={() => void runSearch(true)}>{searchKind === 'agent' ? t('search.agentSearching') : t('search.agentAction')}</button></div>
        </div>
      </form>
      {agentAnswer !== null && <section className={css.agentAnswer} aria-label={t('search.agentAnswer')}><div className={css.agentAnswerHeading}><div><span>{t('search.agentAnswerHint')}</span><h3>{t('search.agentAnswer')}</h3></div><code>{agentAnswer.runId.slice(0, 8)}</code></div><p>{agentAnswer.answer}</p>{agentAnswer.citations.length > 0 && <div className={css.agentCitations}>{agentAnswer.citations.map(citation => <code key={citation}>{citation}</code>)}</div>}</section>}
      {error !== null && <div className={css.inlineError} role="alert">{error}</div>}
      {!searched && <EmptyState glyph="⌕" title={t('search.startTitle')}>{t('search.startText')}</EmptyState>}
      {searched && !searching && results.length === 0 && error === null && <EmptyState glyph="0" title={t('search.emptyTitle')}>{t('search.emptyText')}</EmptyState>}
      {results.length > 0 && (
        <div className={relatedTo === null ? css.singleColumn : css.resultLayout}>
          <section className={css.results}><div className={css.sectionHeading}><div><h3>{t('search.results')}</h3></div><strong>{results.length}</strong></div>{results.map(insight => <InsightCard key={insightKey(insight)} insight={insight} writeEnabled={props.writeEnabled} onForget={forget} onRelated={item => void showRelated(item)} />)}</section>
          {relatedTo !== null && <aside id="mnemon-related-pane" className={css.relatedPane}><div className={css.sectionHeading}><div><h3>{t('search.related')}</h3></div><button type="button" onClick={() => setRelatedTo(null)} aria-label={t('search.closeRelated')}>×</button></div><p className={css.relatedSource}>{relatedTo.content}</p>{relatedLoading && <div className={css.loading}>{t('search.traversing')}</div>}{!relatedLoading && related.length === 0 && <div className={css.muted}>{t('search.noRelated')}</div>}{related.map(insight => <InsightCard key={insightKey(insight)} insight={insight} writeEnabled={props.writeEnabled} onForget={forget} onRelated={item => void showRelated(item)} />)}</aside>}
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

function RuntimePage(props: { client: MnemonClient; revision: number; writeEnabled: boolean; onMutate: () => void }): JSX.Element {
  const t = useT()
  const [snapshot, setSnapshot] = useState<RuntimeMemorySnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [target, setTarget] = useState<RuntimeMemoryTarget>('memory')
  const [importance, setImportance] = useState<RuntimeMemoryImportance>('normal')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editImportance, setEditImportance] = useState<RuntimeMemoryImportance>('normal')
  const [removing, setRemoving] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try { setSnapshot(await props.client.runtimeMemory()) } catch (reason) { setError(message(reason)) } finally { setLoading(false) }
  }, [props.client])
  useEffect(() => { void load() }, [load, props.revision])

  const entryKey = (entry: RuntimeMemoryEntry) => `${entry.target}:${entry.created_at}:${entry.content}`
  const mutate = async (request: Parameters<MnemonClient['mutateRuntimeMemory']>[0]) => {
    setNotice(null); setError(null)
    const result = await props.client.mutateRuntimeMemory(request)
    setNotice(result.maintenance === undefined
      ? t(`runtime.result.${request.action}` as MnemonKey, { target: t(`runtime.target.${request.target}` as MnemonKey), count: result.entryCount })
      : result.maintenance.kind === 'local-compaction'
        ? t('runtime.result.localCompaction', { target: t(`runtime.target.${request.target}` as MnemonKey), count: result.entryCount })
        : t('runtime.result.maintenance', { target: t(`runtime.target.${request.target}` as MnemonKey), count: result.entryCount, spaces: result.maintenance.memoryBodyIds.join(', ') || '—' }))
    await load()
    props.onMutate()
  }
  const add = async (event: FormEvent) => {
    event.preventDefault()
    if (content.trim() === '') return
    setSaving(true)
    try {
      await mutate({ action: 'add', target, content, importance })
      setContent('')
    } catch (reason) { setError(message(reason)) } finally { setSaving(false) }
  }
  const beginEdit = (entry: RuntimeMemoryEntry) => {
    setEditing(entryKey(entry)); setEditContent(entry.content); setEditImportance(entry.importance); setRemoving(null)
  }
  const replace = async (entry: RuntimeMemoryEntry) => {
    if (editContent.trim() === '') return
    setSaving(true)
    try {
      await mutate({ action: 'replace', target: entry.target, old_text: entry.content, content: editContent, importance: editImportance })
      setEditing(null)
    } catch (reason) { setError(message(reason)) } finally { setSaving(false) }
  }
  const remove = async (entry: RuntimeMemoryEntry) => {
    setSaving(true)
    try {
      await mutate({ action: 'remove', target: entry.target, old_text: entry.content })
      setRemoving(null)
    } catch (reason) { setError(message(reason)) } finally { setSaving(false) }
  }

  const targetPanel = (value: RuntimeMemoryTarget) => {
    const view = snapshot?.targets[value]
    const entries = snapshot?.entries.filter(entry => entry.target === value) ?? []
    const percentage = view === undefined || view.limit === 0 ? 0 : Math.min(100, Math.round(view.used / view.limit * 100))
    return (
      <section className={css.runtimeTarget} aria-label={t(`runtime.target.${value}` as MnemonKey)}>
        <header className={css.runtimeTargetHeader}>
          <div><span>{value === 'user' ? 'USER.md' : 'MEMORY.md'}</span><h3>{t(`runtime.target.${value}` as MnemonKey)}</h3></div>
          <strong>{view?.entryCount ?? 0}</strong>
        </header>
        <div className={css.capacityLine}><div><i style={{ width: `${percentage}%` }} /></div><span>{view === undefined ? '—' : `${humanBytes(view.used)} / ${humanBytes(view.limit)}`}</span></div>
        <p className={css.runtimeTargetDescription}>{t(`runtime.target.${value}.description` as MnemonKey)}</p>
        <div className={css.runtimeEntries}>
          {entries.map(entry => {
            const key = entryKey(entry)
            const isEditing = editing === key
            const isRemoving = removing === key
            return <article key={key} className={css.runtimeEntry} data-importance={entry.importance}>
              <div className={css.runtimeEntryMeta}><span>{t(`runtime.importance.${entry.importance}` as MnemonKey)}</span><time dateTime={entry.updated_at}>{new Date(entry.updated_at).toLocaleString()}</time></div>
              {isEditing ? <textarea aria-label={t('runtime.editContent')} value={editContent} onChange={event => setEditContent(event.target.value)} rows={4} /> : <p>{entry.content}</p>}
              {isEditing && <select aria-label={t('runtime.importance')} value={editImportance} onChange={event => setEditImportance(event.target.value as RuntimeMemoryImportance)}><option value="critical">{t('runtime.importance.critical')}</option><option value="normal">{t('runtime.importance.normal')}</option><option value="low">{t('runtime.importance.low')}</option></select>}
              <footer>
                {isRemoving ? <><span>{t('runtime.removeConfirm')}</span><button type="button" className={css.dangerSolidButton} disabled={saving} onClick={() => void remove(entry)}>{t('runtime.removeAction')}</button><button type="button" className={css.ghostButton} onClick={() => setRemoving(null)}>{t('common.cancel')}</button></> : isEditing ? <><button type="button" className={css.primaryButton} disabled={saving || editContent.trim() === ''} onClick={() => void replace(entry)}>{t('runtime.saveEdit')}</button><button type="button" className={css.ghostButton} onClick={() => setEditing(null)}>{t('common.cancel')}</button></> : props.writeEnabled ? <><button type="button" className={css.ghostButton} onClick={() => beginEdit(entry)}>{t('runtime.editAction')}</button><button type="button" className={css.dangerButton} onClick={() => { setRemoving(key); setEditing(null) }}>{t('runtime.removeAction')}</button></> : null}
              </footer>
            </article>
          })}
          {!loading && entries.length === 0 && <div className={css.runtimeEmpty}><span>○</span><p>{t('runtime.empty')}</p></div>}
        </div>
      </section>
    )
  }

  return (
    <div className={css.page}>
      <PageHeader title={t('runtime.title')} description={t('runtime.description')} meta={snapshot === null ? t('common.loading') : t('runtime.total', { count: snapshot.entries.length })} action={<button type="button" className={css.secondaryButton} disabled={loading} onClick={() => void load()}>{t('runtime.refresh')}</button>} />
      {error !== null && <div className={css.inlineError} role="alert">{error}</div>}
      {notice !== null && <div className={css.runtimeNotice} role="status">{notice}</div>}
      {props.writeEnabled && <form className={css.runtimeComposer} onSubmit={event => void add(event)}>
        <div className={css.runtimeComposerHeading}><div><h3>{t('runtime.addTitle')}</h3><p>{t('runtime.addDescription')}</p></div><span>{t('runtime.hotContext')}</span></div>
        <textarea aria-label={t('runtime.content')} value={content} onChange={event => setContent(event.target.value)} rows={3} placeholder={t('runtime.placeholder')} />
        <div className={css.runtimeComposerActions}><label>{t('runtime.target')}<select value={target} onChange={event => setTarget(event.target.value as RuntimeMemoryTarget)}><option value="memory">{t('runtime.target.memory')}</option><option value="user">{t('runtime.target.user')}</option></select></label><label>{t('runtime.importance')}<select value={importance} onChange={event => setImportance(event.target.value as RuntimeMemoryImportance)}><option value="critical">{t('runtime.importance.critical')}</option><option value="normal">{t('runtime.importance.normal')}</option><option value="low">{t('runtime.importance.low')}</option></select></label><button type="submit" className={css.primaryButton} disabled={saving || content.trim() === ''}>{saving ? t('runtime.saving') : t('runtime.addAction')}</button></div>
      </form>}
      {!props.writeEnabled && <div className={css.runtimeReadOnly}>{t('runtime.readOnly')}</div>}
      <div className={css.runtimeGrid}>{targetPanel('user')}{targetPanel('memory')}</div>
      <p className={css.runtimeFootnote}>{t('runtime.footnote')}</p>
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
  const PAGE_SIZE = 48
  const t = useT()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | ''>('')
  const [view, setView] = useState<MemoryListView | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [visibleLimit, setVisibleLimit] = useState(PAGE_SIZE)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try { setView(await props.client.list({ ...(query.trim() === '' ? {} : { query }), ...(category === '' ? {} : { category }), limit: 1000 })) } catch (reason) { setError(message(reason)) } finally { setLoading(false) }
  }, [category, props.client, query])
  useEffect(() => { void load() }, [props.revision])
  const submit = (event: FormEvent) => { event.preventDefault(); setVisibleLimit(PAGE_SIZE); void load() }
  const forget = async (insight: Insight) => { await props.onForget(insight); setView(current => current === null ? current : { ...current, total: Math.max(0, current.total - 1), items: current.items.filter(item => insightKey(item) !== insightKey(insight)) }) }
  const visibleItems = view?.items.slice(0, visibleLimit) ?? []
  const remaining = Math.max(0, (view?.items.length ?? 0) - visibleItems.length)

  return (
    <div className={css.page}>
      <PageHeader title={t('content.title')} description={t('content.description')} meta={t('content.count', { count: view?.total ?? '—' })} />
      <form className={css.listToolbar} onSubmit={submit}><input aria-label={t('content.filterAria')} value={query} onChange={event => setQuery(event.target.value)} placeholder={t('content.filterPlaceholder')} /><select aria-label={t('content.categoryAria')} value={category} onChange={event => setCategory(event.target.value as Category | '')}><option value="">{t('common.allCategories')}</option>{CATEGORIES.map(value => <option key={value} value={value}>{categoryLabel(t, value)}</option>)}</select><button type="submit" className={css.primaryButton} disabled={loading}>{loading ? t('common.loading') : t('content.apply')}</button></form>
      <div className={css.listNotice}>{t('content.notice')}</div>
      {error !== null && <div className={css.inlineError} role="alert">{error}</div>}
      {!loading && view?.items.length === 0 && <EmptyState glyph="≡" title={t('content.emptyTitle')}>{t('content.emptyText')}</EmptyState>}
      <div className={css.memoryList}>{visibleItems.map(insight => <InsightCard key={insightKey(insight)} insight={insight} writeEnabled={props.writeEnabled} onForget={forget} onClone={props.onClone} onRelated={() => props.onExplore(insight.content)} />)}</div>
      {view !== null && view.items.length > 0 && <div className={css.listProgress}><span>{t('content.showing', { visible: visibleItems.length, total: view.items.length })}</span>{remaining > 0 && <button type="button" className={css.secondaryButton} onClick={() => setVisibleLimit(value => value + PAGE_SIZE)}>{t('content.showMore', { count: Math.min(PAGE_SIZE, remaining) })}</button>}</div>}
    </div>
  )
}

type DocumentListItem = DocumentRecord & { healthy?: boolean; excerpt: string }

function DocumentsPage(props: { client: MnemonClient; revision: number; writeEnabled: boolean; sessionId?: string; onMutate: () => void }): JSX.Element {
  const t = useT()
  const [snapshot, setSnapshot] = useState<DocumentSnapshot | null>(null)
  const [items, setItems] = useState<DocumentListItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selected, setSelected] = useState<DocumentView | null>(null)
  const [status, setStatus] = useState<'active' | 'archived'>('active')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [composing, setComposing] = useState(false)
  const [editing, setEditing] = useState(false)
  const [confirmArchive, setConfirmArchive] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [sources, setSources] = useState('')

  const display = useCallback(async (nextQuery: string, nextStatus: 'active' | 'archived') => {
    setLoading(true); setError(null)
    try {
      const current = await props.client.documents()
      const records = nextQuery.trim() === ''
        ? current.documents
        : (await props.client.searchDocuments(nextQuery, nextStatus === 'archived')).results
      const filtered = records.filter(record => record.status === nextStatus)
      setSnapshot(current)
      setItems(filtered)
      setSelectedId(previous => previous !== null && filtered.some(record => record.id === previous) ? previous : filtered[0]?.id ?? null)
    } catch (reason) {
      setError(message(reason)); setSnapshot(null); setItems([]); setSelectedId(null)
    } finally {
      setLoading(false)
    }
  }, [props.client])

  useEffect(() => { void display(query, status) }, [display, props.revision, status])
  useEffect(() => {
    setSelected(null)
    if (selectedId === null) return
    let active = true
    void props.client.document(selectedId).then(value => { if (active) setSelected(value) }).catch(reason => { if (active) setError(message(reason)) })
    return () => { active = false }
  }, [props.client, selectedId, props.revision])

  const resetComposer = () => { setTitle(''); setDescription(''); setContent(''); setSources(''); setComposing(false) }
  const sourcePaths = (value: string) => value.split(/\r?\n|,/gu).map(path => path.trim()).filter(Boolean)

  const create = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setError(null); setNotice(null)
    try {
      const result = await props.client.mutateDocument({ action: 'create', title, description, content, sourcePaths: sourcePaths(sources) })
      setNotice(result.maintenance === undefined ? t('documents.created') : t('documents.createdAfterArchive', { count: result.maintenance.archivedDocumentIds.length }))
      setStatus('active'); setQuery(''); resetComposer(); props.onMutate(); await display('', 'active'); setSelectedId(result.document.id)
    } catch (reason) { setError(message(reason)) } finally { setSaving(false) }
  }

  const beginEdit = () => {
    if (selected === null) return
    setTitle(selected.title); setDescription(selected.description); setContent(selected.content); setSources(selected.sourcePaths.join('\n')); setEditing(true); setComposing(false); setConfirmArchive(false)
  }

  const update = async (event: FormEvent) => {
    event.preventDefault()
    if (selected === null) return
    setSaving(true); setError(null); setNotice(null)
    try {
      const result = await props.client.mutateDocument({ action: 'update', id: selected.id, title, description, content, sourcePaths: sourcePaths(sources) })
      setNotice(result.maintenance === undefined ? t('documents.updated') : t('documents.updatedAfterArchive', { count: result.maintenance.archivedDocumentIds.length }))
      setEditing(false); props.onMutate(); await display(query, status); setSelectedId(result.document.id)
    } catch (reason) { setError(message(reason)) } finally { setSaving(false) }
  }

  const archive = async () => {
    if (selected === null) return
    setSaving(true); setError(null); setNotice(null)
    try {
      const result = await props.client.archiveDocument(selected.id)
      setNotice(t('documents.archived', { spaces: result.maintenance?.memoryBodyIds.join(', ') || '—' }))
      setConfirmArchive(false); setStatus('archived'); setQuery(''); props.onMutate(); await display('', 'archived'); setSelectedId(result.document.id)
    } catch (reason) { setError(message(reason)) } finally { setSaving(false) }
  }

  const usage = snapshot === null ? 0 : Math.min(100, snapshot.activeBytes / snapshot.limitBytes * 100)
  const activeCount = snapshot?.activeCount ?? 0
  const archivedCount = snapshot?.archivedCount ?? 0

  return (
    <div className={css.page}>
      <PageHeader title={t('documents.title')} description={t('documents.description')} meta={snapshot === null ? t('common.loading') : t('documents.capacity', { used: humanBytes(snapshot.activeBytes), limit: humanBytes(snapshot.limitBytes) })} action={<button type="button" className={css.secondaryButton} disabled={loading} onClick={() => void display(query, status)}>{t('documents.refresh')}</button>} />
      {error !== null && <div className={css.inlineError} role="alert">{error}</div>}
      {notice !== null && <div className={css.runtimeNotice} role="status">{notice}</div>}

      <section className={css.documentSummary} aria-label={t('documents.summary')}>
        <article><span>{t('documents.active')}</span><strong>{activeCount}</strong><small>{t('documents.activeHint')}</small></article>
        <article><span>{t('documents.archivedCount')}</span><strong>{archivedCount}</strong><small>{t('documents.archivedHint')}</small></article>
        <article className={css.documentCapacity}><span>{t('documents.activeCapacity')}</span><strong>{snapshot === null ? '—' : `${usage.toFixed(1)}%`}</strong><div><i style={{ width: `${usage}%` }} /></div><small>{t('documents.capacityHint')}</small></article>
      </section>

      <section className={css.documentToolbar}>
        <form onSubmit={event => { event.preventDefault(); void display(query, status) }}><span aria-hidden="true">⌕</span><input aria-label={t('documents.searchAria')} value={query} onChange={event => setQuery(event.target.value)} placeholder={t('documents.searchPlaceholder')} /><button type="submit" className={css.secondaryButton}>{t('documents.search')}</button></form>
        <div role="group" aria-label={t('documents.scope')}><button type="button" data-active={status === 'active' || undefined} onClick={() => setStatus('active')}>{t('documents.active')} <b>{activeCount}</b></button><button type="button" data-active={status === 'archived' || undefined} onClick={() => setStatus('archived')}>{t('documents.archivedCount')} <b>{archivedCount}</b></button></div>
        {props.writeEnabled && props.sessionId !== undefined && <button type="button" className={css.primaryButton} onClick={() => { setComposing(value => !value); setEditing(false) }}>{composing ? t('common.cancel') : t('documents.new')}</button>}
      </section>

      {composing && <form className={css.documentEditor} onSubmit={event => void create(event)}>
        <header><div><h3>{t('documents.newTitle')}</h3><p>{t('documents.editorHint')}</p></div><span>{t('documents.managedCopy')}</span></header>
        <div className={css.documentEditorMeta}><label>{t('documents.name')}<input value={title} onChange={event => setTitle(event.target.value)} required /></label><label>{t('documents.routing')}<input value={description} onChange={event => setDescription(event.target.value)} /></label></div>
        <label>{t('documents.sources')}<input value={sources} onChange={event => setSources(event.target.value)} placeholder={t('documents.sourcesPlaceholder')} /></label>
        <label>{t('documents.markdown')}<textarea value={content} onChange={event => setContent(event.target.value)} rows={10} required /></label>
        <footer><button type="button" className={css.ghostButton} onClick={resetComposer}>{t('common.cancel')}</button><button type="submit" className={css.primaryButton} disabled={saving || title.trim() === '' || content.trim() === ''}>{saving ? t('documents.saving') : t('documents.create')}</button></footer>
      </form>}

      <div className={css.documentWorkspace}>
        <aside className={css.documentList} aria-label={t('documents.list')}>
          <header><span>{status === 'active' ? t('documents.activeList') : t('documents.archiveList')}</span><code>{items.length}</code></header>
          {items.map(document => <button type="button" key={document.id} data-selected={selectedId === document.id || undefined} onClick={() => { setSelected(null); setSelectedId(document.id); setEditing(false); setConfirmArchive(false) }}><div><strong>{document.title}</strong><time dateTime={document.updatedAt}>{new Date(document.updatedAt).toLocaleDateString()}</time></div><p>{document.description || document.excerpt || t('documents.noDescription')}</p><footer><span>{humanBytes(document.sizeBytes)}</span><code>{document.id.slice(0, 8)}</code>{document.healthy === false && <em>{t('documents.missing')}</em>}</footer></button>)}
          {!loading && items.length === 0 && <div className={css.documentListEmpty}><span>▤</span><strong>{status === 'active' ? t('documents.emptyActive') : t('documents.emptyArchived')}</strong><p>{status === 'active' ? t('documents.emptyActiveText') : t('documents.emptyArchivedText')}</p></div>}
          {loading && <div className={css.loading}>{t('common.loading')}</div>}
        </aside>

        <section className={css.documentReader} aria-label={t('documents.reader')}>
          {selected === null ? <EmptyState glyph="▤" title={t('documents.selectTitle')}>{t('documents.selectText')}</EmptyState> : editing ? <form className={css.documentEditor} onSubmit={event => void update(event)}>
            <header><div><h3>{t('documents.editTitle')}</h3><p>{t('documents.editorHint')}</p></div><code>{selected.id}</code></header>
            <div className={css.documentEditorMeta}><label>{t('documents.name')}<input value={title} onChange={event => setTitle(event.target.value)} required /></label><label>{t('documents.routing')}<input value={description} onChange={event => setDescription(event.target.value)} /></label></div>
            <label>{t('documents.sources')}<input value={sources} onChange={event => setSources(event.target.value)} /></label><label>{t('documents.markdown')}<textarea value={content} onChange={event => setContent(event.target.value)} rows={18} required /></label>
            <footer><button type="button" className={css.ghostButton} onClick={() => setEditing(false)}>{t('common.cancel')}</button><button type="submit" className={css.primaryButton} disabled={saving}>{saving ? t('documents.saving') : t('documents.save')}</button></footer>
          </form> : <article className={css.documentDetail}>
            <header><div><span>{selected.status === 'active' ? t('documents.active') : t('documents.coldArchive')}</span><h3>{selected.title}</h3><p>{selected.description || t('documents.noDescription')}</p></div><div>{props.writeEnabled && selected.status === 'active' && <button type="button" className={css.secondaryButton} onClick={beginEdit}>{t('documents.edit')}</button>}</div></header>
            <dl><div><dt>{t('documents.path')}</dt><dd><code>{selected.relativePath}</code></dd></div><div><dt>{t('documents.revision')}</dt><dd>{selected.revision}</dd></div><div><dt>{t('documents.hash')}</dt><dd><code>{selected.contentHash.slice(0, 16)}</code></dd></div><div><dt>{t('documents.size')}</dt><dd>{humanBytes(selected.sizeBytes)}</dd></div></dl>
            {selected.sourcePaths.length > 0 && <div className={css.documentSources}><span>{t('documents.sources')}</span>{selected.sourcePaths.map(path => <code key={path}>{path}</code>)}</div>}
            {selected.status === 'archived' && <div className={css.documentArchiveReceipt}><strong>{t('documents.archiveReceipt')}</strong><p>{selected.archiveSummary}</p><div>{selected.memoryBodyIds.map(id => <code key={id}>{id}</code>)}</div></div>}
            <DocumentMarkdown content={selected.content} />
            {props.writeEnabled && selected.status === 'active' && <footer className={css.documentDanger}>{confirmArchive ? <><span>{t('documents.archiveConfirm')}</span><button type="button" className={css.dangerSolidButton} disabled={saving} onClick={() => void archive()}>{saving ? t('documents.archiving') : t('documents.archiveNow')}</button><button type="button" className={css.ghostButton} onClick={() => setConfirmArchive(false)}>{t('common.cancel')}</button></> : <><div><strong>{t('documents.archiveTitle')}</strong><p>{t('documents.archiveDescription')}</p></div><button type="button" className={css.dangerButton} onClick={() => setConfirmArchive(true)}>{t('documents.archive')}</button></>}</footer>}
          </article>}
        </section>
      </div>
      <p className={css.runtimeFootnote}>{t('documents.footnote')}</p>
    </div>
  )
}

function StatusPage(props: { status: StatusView | null; loading: boolean; onRefresh: () => void }): JSX.Element {
  const t = useT()
  const status = props.status
  const lifecycle = status?.lifecycle
  const current = lifecycle?.current
  const workers = lifecycle?.subagents
  const documents = status?.documents
  const reviewActivity = current?.reviewActivity
  const reviewThreshold = reviewActivity?.threshold ?? QODERWORK_REVIEW_POLICY.reviewThreshold
  const catalogKnown = status?.memoryBodies !== undefined
  const memoryBodies = useMemo(() => status?.memoryBodies ?? [], [status])
  const activeBodies = memoryBodies.filter(body => body.active).length
  const phase = current?.lastPhase === undefined || current.lastPhase === 'idle' ? t('status.phaseIdle') : current.lastPhase === 'supervised' ? t('status.phaseSupervised') : current.lastPhase === 'error' ? t('status.phaseError') : current.lastPhase === 'prime' ? t('status.prime') : current.lastPhase === 'recall' ? t('status.recallWorker') : current.lastPhase === 'review' ? t('status.phaseReview') : t('status.writeWorker')
  const reviewState = current?.reviewRunning === true
    ? t('status.reviewRunning')
    : current?.idleReviewPending === true
      ? t('status.reviewPending')
      : reviewActivity?.eligible === true
        ? t('status.reviewQualified')
        : t('status.reviewAccumulating')
  const lastReview = current?.lastReviewAt === undefined ? t('status.noReview') : t('status.reviewAt', { time: new Date(current.lastReviewAt).toLocaleTimeString(), action: current.lastReviewAction ?? '—', score: current.lastReviewScore ?? '—' })
  const storage = status?.storage
  const selectedScopeKind = storage?.activeKind ?? 'global'
  const selectedScope = storage?.scopes.find(scope => scope.kind === selectedScopeKind)
  return (
    <div className={css.page}>
      <PageHeader title={t('status.title')} description={t('status.description')} meta={status === null && props.loading ? t('common.loading') : status?.healthy === true && lifecycle?.sessionAvailable === true ? t('status.nominal') : t('status.checkRequired')} action={<button type="button" className={css.secondaryButton} disabled={props.loading} onClick={props.onRefresh}>{props.loading ? t('status.rechecking') : t('status.recheck')}</button>} />

      <section className={css.healthStrip} aria-label={t('status.aria')}>
        <article><span className={`${css.healthIndicator} ${status === null ? css.healthMuted : status.healthy ? css.healthGood : css.healthBad}`} /><div><small>{t('status.engine')}</small><strong>{status === null ? t('status.engineChecking') : status.healthy ? t('status.engineConnected') : t('status.engineUnavailable')}</strong><p>{status?.version === undefined ? t('status.versionWaiting') : `CLI ${status.version}`}</p></div></article>
        <article><span className={`${css.healthIndicator} ${activeBodies > 0 ? css.healthGood : css.healthMuted}`} /><div><small>{t('status.spaces')}</small><strong>{catalogKnown ? t('status.activeRatio', { active: activeBodies, total: memoryBodies.length }) : t('status.directoryUnsynced')}</strong><p>{t('status.activeMemories', { count: status?.stats?.totalInsights ?? 0 })}</p></div></article>
        <article><span className={`${css.healthIndicator} ${documents === undefined ? css.healthMuted : css.healthGood}`} /><div><small>{t('status.documents')}</small><strong>{documents === undefined ? t('status.documentsWaiting') : t('status.documentRatio', { active: documents.activeCount, archived: documents.archivedCount })}</strong><p>{documents === undefined ? t('status.documentsSession') : t('status.documentUsage', { used: humanBytes(documents.activeBytes), limit: humanBytes(documents.limitBytes) })}</p></div></article>
        <article><span className={`${css.healthIndicator} ${lifecycle === undefined ? css.healthMuted : lifecycle.sessionAvailable ? css.healthGood : css.healthBad}`} /><div><small>{t('status.router')}</small><strong>{lifecycle === undefined ? t('status.routerChecking') : lifecycle.sessionAvailable ? t('status.routerReady') : t('status.sessionMissing')}</strong><p>{workers === undefined ? t('status.orchestrationWaiting') : t('status.workerSummary', { recalls: workers.recalls, reviews: workers.reviews ?? 0, writes: workers.writes, failures: workers.failures ?? 0 })}</p></div></article>
      </section>

      <MemorySystemFlow status={status} reviewState={reviewState} />

      <StorageDomains catalog={storage} selected={selectedScope} selectedKind={selectedScopeKind} />

      <section className={css.lifecyclePanel}>
          <div className={css.statusSectionHeader}><div><h3>{t('status.lifecycle')}</h3><p>{t('status.lifecycleText')}</p></div><span className={css.phaseBadge}>{phase}</span></div>
          <div className={css.lifecycleFlow}>
            <article><span>01</span><div><strong>{t('status.prime')}</strong><p>{t('status.primeText')}</p></div><code>{lifecycle?.counters.primes ?? 0}</code></article>
            <article data-disabled={lifecycle?.recallMode === 'off' || undefined}><span>02</span><div><strong>{t('status.recallWorker')}</strong><p>{lifecycle?.recallMode === 'guided' ? t('status.recallText') : t('status.recallOff')}</p></div><code>{workers?.recalls ?? 0}</code></article>
            <article data-disabled={lifecycle?.writebackMode === 'off' || undefined}><span>03</span><div><strong>{t('status.writeWorker')}</strong><p>{lifecycle?.writebackMode === 'guided' ? t('status.writeText', { threshold: reviewThreshold, seconds: Math.round((lifecycle.idleReviewMs ?? 0) / 1000) }) : t('status.writeOff')}</p></div><code>{workers?.reviews ?? 0}</code></article>
          </div>
          <div className={css.lifecycleFoot}><span>{t('status.activitySignals')} <strong>{t('status.activitySignalValues', { chars: reviewActivity?.totalUserTextLength ?? 0, turns: reviewActivity?.turnCount ?? 0, tools: reviewActivity?.toolCallCount ?? 0, unique: reviewActivity?.uniqueToolCount ?? 0 })}</strong></span><span>{t('status.lastReview')} <strong>{lastReview}</strong></span><span>{t('status.workerFailures')} <strong>{workers?.failures ?? 0}</strong></span></div>
          {current?.lastError !== undefined && <div className={css.inlineError} role="alert">Lifecycle：{current.lastError}</div>}
      </section>

    </div>
  )
}

function storageScopeLabel(t: MnemonTranslate, kind: StorageScopeKind): string {
  return t(kind === 'global' ? 'status.storageGlobal' : kind === 'workspace' ? 'status.storageWorkspace' : 'status.storageCustom')
}

function storageAreaLabel(t: MnemonTranslate, kind: StorageAreaInventory['kind']): string {
  return t(kind === 'runtime' ? 'status.storageRuntime' : kind === 'memory-bodies' ? 'status.storageBodies' : kind === 'documents' ? 'status.storageDocuments' : 'status.storageState')
}

function storageAreaDetails(t: MnemonTranslate, area: StorageAreaInventory): string {
  if (area.kind === 'runtime') return t('status.storageRuntimeDetail', { user: area.details.userEntries ?? 0, memory: area.details.memoryEntries ?? 0 })
  if (area.kind === 'memory-bodies') return t('status.storageBodiesDetail', { active: area.details.activeBodies ?? 0, databases: area.details.databases ?? 0 })
  if (area.kind === 'documents') return t('status.storageDocumentsDetail', { active: area.details.activeDocuments ?? 0, archived: area.details.archivedDocuments ?? 0 })
  return area.details.reviewLedger === true ? t('status.storageStateReady') : t('status.storageStateVolatile')
}

function StorageDomains(props: {
  catalog: StatusView['storage']
  selected: StorageScopeInventory | undefined
  selectedKind: StorageScopeKind
}): JSX.Element {
  const t = useT()
  const areaStatus = (status: StorageAreaInventory['status']) => t(status === 'ready' ? 'status.storageReady' : status === 'empty' ? 'status.storageEmpty' : status === 'missing' ? 'status.storageMissing' : 'status.storageInvalid')
  return (
    <section className={css.storageDomains} aria-label={t('status.storageDomains')}>
      <div className={css.statusSectionHeader}>
        <div><h3>{t('status.storageDomains')}</h3><p>{t('status.storageDomainsText')}</p></div>
        <span className={css.phaseBadge}>{storageScopeLabel(t, props.selectedKind)}</span>
      </div>
      {props.catalog === undefined ? <div className={css.storageUnavailable}>{t('status.storageWaiting')}</div> : props.selected?.root === undefined ? <div className={css.storageUnavailable}><strong>{storageScopeLabel(t, props.selectedKind)}</strong><p>{props.selectedKind === 'custom' ? t('status.storageCustomUnset') : t('status.storageWorkspaceUnavailable')}</p></div> : <>
        <div className={css.storageRoot}>
          <div><span>{storageScopeLabel(t, props.selectedKind)} · {t('status.storageActiveRoot')}</span><code>{props.selected.root}</code></div>
          <div><strong>{humanBytes(props.selected.totalBytes)}</strong><small>{props.selected.available ? t('status.storageAvailable') : t('status.storageNotCreated')}</small></div>
        </div>
        <div className={css.storageAreaGrid}>
          {props.selected.areas.map(area => <article key={area.kind} data-status={area.status}>
            <header><div><span /> <strong>{storageAreaLabel(t, area.kind)}</strong></div><em>{areaStatus(area.status)}</em></header>
            <div className={css.storageAreaMetric}><strong>{area.itemCount}</strong><span>{t('status.storageItems')}</span><code>{humanBytes(area.bytes)}</code></div>
            <p>{storageAreaDetails(t, area)}</p>
            <code className={css.storagePath}>{area.path}</code>
            {area.issue !== undefined && <small>{area.issue}</small>}
          </article>)}
        </div>
      </>}
      {props.catalog !== undefined && <p className={css.storageFootnote}>{t('status.storageFootnote', { root: props.catalog.activeRoot })}</p>}
    </section>
  )
}

function MemorySystemFlow(props: { status: StatusView | null; reviewState: string }): JSX.Element {
  const t = useT()
  const status = props.status
  const activeScope = status?.storage?.scopes.find(scope => scope.active)
  const runtime = activeScope?.areas.find(area => area.kind === 'runtime')
  const documentArea = activeScope?.areas.find(area => area.kind === 'documents')
  const documents = status?.documents
  const bodies = status?.memoryBodies ?? []
  const activeBodies = bodies.filter(body => body.active).length
  const score = status?.lifecycle?.current?.reviewActivity?.score ?? 0
  const threshold = status?.lifecycle?.current?.reviewActivity?.threshold ?? QODERWORK_REVIEW_POLICY.reviewThreshold
  const idleSeconds = Math.round((status?.lifecycle?.idleReviewMs ?? 30_000) / 1000)
  const hostReady = status?.lifecycle?.sessionAvailable === true
  const flowActive = status?.healthy === true && hostReady
  const areaState = (area: StorageAreaInventory | undefined): 'ready' | 'idle' | 'error' => area?.status === 'invalid' ? 'error' : area?.status === 'ready' ? 'ready' : 'idle'
  const current = status?.lifecycle?.current
  const workers = status?.lifecycle?.subagents
  const lastWorkerOperation = workers?.lastOperation
  const spawnRecent = lastWorkerOperation !== undefined && lastWorkerOperation !== 'review'
  const archiveRecent = lastWorkerOperation === 'document-archive' || lastWorkerOperation === 'migration'
  const reviewState = current?.reviewRunning === true ? 'running' : current?.idleReviewPending === true ? 'pending' : 'idle'
  const rootRunning = current?.status === 'running'
  const semanticActive = rootRunning && (current?.lastPhase === 'recall' || current?.lastPhase === 'supervised')
  const runtimeCount = runtime?.itemCount ?? 0
  const insights = status?.stats?.totalInsights ?? 0
  const flowNode = (title: string, meta: string, state: 'ready' | 'idle' | 'error' = 'idle', kind: 'host' | 'worker' | 'store' | 'task' = 'host', emphasis?: 'active' | 'recent' | 'pending') => (
    <article className={css.flowArchitectureNode} data-state={state} data-kind={kind} data-emphasis={emphasis}>
      <span className={css.flowArchitectureSignal} aria-hidden="true" />
      <div><strong>{title}</strong><small>{meta}</small></div>
    </article>
  )
  const connector = (label: string, kind: 'host' | 'worker' = 'host', active = false) => <div className={css.flowConnector} data-kind={kind} data-active={active || undefined}><span>{label}</span><i aria-hidden="true" /></div>
  return (
    <section className={css.memoryFlow} aria-label={t('status.flowTitle')}>
      <div className={css.statusSectionHeader}><div><h3>{t('status.flowTitle')}</h3><p>{t('status.flowDescription')}</p></div><span className={`${css.runtimeBadge} ${status === null ? css.runtimePending : flowActive ? css.runtimeOnline : css.runtimeOffline}`}>{status === null ? t('common.loading') : flowActive ? t('status.flowLive') : t('status.flowDegraded')}</span></div>
      <div className={css.memoryFlowCanvas}>
        <div className={css.flowArchitecture} role="img" aria-label={`${t('status.flowTitle')}：${t('status.flowDescription')}`}>
          <section className={css.flowLane} data-lane="context">
            <header><span>01</span><div><strong>{t('status.flowLaneContext')}</strong><small>{t('status.flowLaneContextDetail')}</small></div></header>
            <div className={css.flowTrack}>
              {flowNode(t('status.storageRuntime'), t('status.flowRuntimeMeta', { count: runtimeCount }), areaState(runtime), 'store')}
              {connector(t('status.flowPromptAssembly'), 'host')}
              {flowNode(t('status.flowSupervisor'), t('status.flowRootMeta'), hostReady ? 'ready' : 'idle', 'host', rootRunning ? 'active' : undefined)}
              {connector('↔', 'host', rootRunning)}
              {flowNode(t('status.flowConversation'), t('status.flowTurns'), hostReady ? 'ready' : 'idle', 'task')}
            </div>
            <div className={`${css.flowTrack} ${css.flowSecondaryTrack}`}>
              {flowNode(t('status.flowSupervisor'), t('status.flowRootMeta'), hostReady ? 'ready' : 'idle', 'host')}
              {connector(t('status.flowOnDemand'), 'host')}
              {flowNode(t('status.flowDocumentSearch'), t('status.flowOnDemand'), areaState(documentArea), 'host')}
              {connector('→', 'host')}
              {flowNode(t('status.storageDocuments'), t('status.flowDocuments', { active: documents?.activeCount ?? 0, archived: documents?.archivedCount ?? 0 }), areaState(documentArea), 'store')}
              {connector('↩', 'host')}
              {flowNode(t('status.flowContext'), t('status.flowEvidenceMeta'), hostReady ? 'ready' : 'idle', 'task')}
            </div>
          </section>

          <section className={css.flowLane} data-lane="semantic">
            <header><span>02</span><div><strong>{t('status.flowLaneSemantic')}</strong><small>{t('status.flowLaneSemanticDetail')}</small></div></header>
            <div className={css.flowTrack}>
              {flowNode(t('status.flowSupervisor'), t('status.flowSemanticRequest'), hostReady ? 'ready' : 'idle', 'task')}
              {connector('→', 'worker', semanticActive)}
              {flowNode(t('status.flowSpawnWorker'), `${t('status.flowSpawnMeta')}${spawnRecent ? ` · ${t('status.flowRecent')}` : ''}`, hostReady ? 'ready' : 'idle', 'worker', semanticActive ? 'active' : spawnRecent ? 'recent' : undefined)}
              {connector('→', 'worker', semanticActive)}
              {flowNode(t('status.flowHostBridge'), t('status.flowHostBridgeMeta'), status?.healthy === false ? 'error' : status?.healthy === true ? 'ready' : 'idle', 'host')}
              {connector('↔', 'host', semanticActive)}
              {flowNode(t('term.spaces'), t('status.flowSpacesMeta', { active: activeBodies, total: bodies.length, insights }), status?.healthy === false ? 'error' : activeBodies > 0 ? 'ready' : 'idle', 'store')}
              {connector('↩', 'host', semanticActive)}
              {flowNode(t('status.flowContext'), t('status.flowEvidenceMeta'), hostReady ? 'ready' : 'idle', 'task')}
            </div>
          </section>

          <section className={css.flowLane} data-lane="maintenance">
            <header><span>03</span><div><strong>{t('status.flowLaneMaintenance')}</strong><small>{t('status.flowLaneMaintenanceDetail')}</small></div></header>
            <div className={`${css.flowTrack} ${css.flowMaintenanceTrack}`}>
              {flowNode(t('status.flowDeterministicWrites'), t('status.flowDeterministicWritesMeta'), hostReady ? 'ready' : 'idle', 'task')}
              {connector('→', 'host')}
              {flowNode(t('status.flowControlPlane'), t('status.flowControlPlaneMeta'), areaState(runtime), 'host')}
              {connector('→', 'host')}
              {flowNode(t('status.storageRuntime'), t('status.storageDocuments'), areaState(documentArea), 'store')}
            </div>
            <div className={`${css.flowTrack} ${css.flowReviewTrack}`}>
              {flowNode(t('status.flowReviewGate'), t('status.flowReviewGateMeta', { score, threshold, seconds: idleSeconds }), current?.reviewActivity?.eligible === true ? 'ready' : 'idle', 'task', reviewState === 'pending' ? 'pending' : undefined)}
              {connector('→', 'worker', reviewState === 'running')}
              {flowNode(t('status.flowForkReview'), t('status.flowForkReviewMeta', { state: props.reviewState }), current?.lastError === undefined ? hostReady ? 'ready' : 'idle' : 'error', 'worker', reviewState === 'running' ? 'active' : reviewState === 'pending' ? 'pending' : undefined)}
              {connector('→', 'host', reviewState === 'running')}
              {flowNode(t('status.flowReviewTargets'), t('status.flowReviewTargetsMeta'), areaState(documentArea), 'host')}
              {connector('↩', 'host', reviewState === 'running')}
              {flowNode(t('status.flowContext'), t('status.flowEvidenceMeta'), hostReady ? 'ready' : 'idle', 'task')}
            </div>
            <div className={`${css.flowTrack} ${css.flowArchiveTrack}`}>
              {flowNode(t('status.storageDocuments'), t('status.flowDocuments', { active: documents?.activeCount ?? 0, archived: documents?.archivedCount ?? 0 }), areaState(documentArea), 'store')}
              {connector('→', 'worker')}
              {flowNode(t('status.flowColdArchive'), `${t('status.flowColdArchiveMeta')}${archiveRecent ? ` · ${t('status.flowRecent')}` : ''}`, hostReady ? 'ready' : 'idle', 'worker', archiveRecent ? 'recent' : undefined)}
              {connector('→', 'worker')}
              {flowNode(t('status.flowHostBridge'), t('status.flowHostBridgeMeta'), status?.healthy === false ? 'error' : status?.healthy === true ? 'ready' : 'idle', 'host')}
              {connector('→', 'host')}
              {flowNode(t('status.flowIndexFirst'), t('term.spaces'), status?.healthy === false ? 'error' : activeBodies > 0 ? 'ready' : 'idle', 'store')}
              {connector('→', 'host')}
              {flowNode(t('status.flowRevisionMove'), t('status.flowRevisionMoveMeta', { archived: documents?.archivedCount ?? 0 }), areaState(documentArea), 'store')}
            </div>
          </section>
        </div>
      </div>
      <div className={css.flowLegend}><span><i />{t('status.flowReadWrite')}</span><span><i />{t('status.flowArchive')}</span><span><b />{t('status.flowLegendRecent')}</span><span>{t('status.flowCurrentScope', { scope: storageScopeLabel(t, status?.storage?.activeKind ?? 'global') })}</span></div>
    </section>
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
        <div className={css.brand}><MnemonLogo className={css.brandLogo} /><h1>Mnemon</h1></div>
        <section className={css.telemetry} aria-label={t('telemetry.aria')}><div className={css.telemetryMetric}><span>{t('telemetry.memories')}</span><strong>{stats?.totalInsights ?? '—'}</strong></div><div className={css.telemetryMetric}><span>{t('telemetry.graph')}</span><strong>{stats?.edgeCount ?? '—'}</strong></div><div className={css.telemetryMetric}><span>{t('telemetry.entities')}</span><strong>{stats?.topEntities.length ?? '—'}</strong></div><div className={css.telemetryMetric}><span>{t('telemetry.spaces')}</span><strong>{status === null || !catalogKnown ? '—' : activeBodies}</strong></div></section>
        <div className={css.statusCluster}><span className={`${css.statusDot} ${statusLoading && status === null ? css.checking : status?.healthy === true ? css.online : css.offline}`} /><span>{statusLoading ? t('header.checking') : status?.healthy === true ? catalogKnown ? t('header.connected', { count: activeBodies }) : t('header.directoryPending') : t('header.unavailable')}</span><button type="button" className={css.iconButton} disabled={statusLoading} onClick={refreshAll} aria-label={t('common.refresh')}>↻</button></div>
      </header>
      {(statusError !== null || status?.healthy === false) && <div className={css.alert} role="alert"><strong>{t('header.notReady')}</strong><span>{statusError ?? status?.error}</span></div>}
      <div className={css.workspace}>
        <div className={css.topNavigation}><nav className={css.nav} aria-label={t('nav.aria')}>{PAGE_NAV.map(item => <button key={item.id} type="button" aria-current={page === item.id ? 'page' : undefined} onClick={() => setPage(item.id)}><span className={css.navGlyph} aria-hidden="true">{item.glyph}</span><span><strong>{t(item.label)}</strong><small>{t(item.detail)}</small></span></button>)}</nav><div className={css.spaceSummary}><span>{t('sidebar.activeSpaces')}</span><code>{catalogKnown ? `${activeBodies} / ${memoryBodies.length}` : '— / —'}</code><small>{writeEnabled ? t('common.agentSupervised') : t('common.readOnly')}</small></div></div>
        <section className={css.canvas}>
          {page === 'overview' && <OverviewPage client={client} revision={revision} writeEnabled={writeEnabled} fallbackBodies={memoryBodies} fallbackDirectory={status?.memoryBodyDirectory} catalogKnown={catalogKnown} onMutate={mutate} onExplore={explore} />}
          {page === 'runtime' && <RuntimePage client={client} revision={revision} writeEnabled={writeEnabled} onMutate={mutate} />}
          {page === 'documents' && <DocumentsPage client={client} revision={revision} writeEnabled={writeEnabled} {...(sessionId === undefined ? {} : { sessionId })} onMutate={mutate} />}
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
