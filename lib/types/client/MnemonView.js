import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { QODERWORK_REVIEW_POLICY } from "../review-activity.js";
import { CATEGORIES, } from "../service.js";
import { MnemonClient } from "./api.js";
import { translateZh } from "./locales.js";
import { MnemonLogo } from "./MnemonLogo.js";
import css from './MnemonView.module.css';
const PAGE_NAV = [
    { id: 'overview', label: 'nav.overview', detail: 'nav.overview.detail', glyph: '◇' },
    { id: 'runtime', label: 'nav.runtime', detail: 'nav.runtime.detail', glyph: '◫' },
    { id: 'documents', label: 'nav.documents', detail: 'nav.documents.detail', glyph: '▤' },
    { id: 'explore', label: 'nav.search', detail: 'nav.search.detail', glyph: '⌕' },
    { id: 'entities', label: 'nav.entities', detail: 'nav.entities.detail', glyph: '◎' },
    { id: 'remember', label: 'nav.remember', detail: 'nav.remember.detail', glyph: '+' },
    { id: 'list', label: 'nav.content', detail: 'nav.content.detail', glyph: '≡' },
    { id: 'status', label: 'nav.status', detail: 'nav.status.detail', glyph: '⌘' },
];
const CATEGORY_KEYS = {
    decision: 'category.decision',
    preference: 'category.preference',
    fact: 'category.fact',
    insight: 'category.insight',
    context: 'category.context',
    general: 'category.general',
};
const I18nContext = createContext(translateZh);
function useT() { return useContext(I18nContext); }
function categoryLabel(t, category) { return CATEGORY_KEYS[category] === undefined ? category : t(CATEGORY_KEYS[category]); }
function humanBytes(bytes) {
    if (bytes < 1024)
        return `${bytes} B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
function message(error) {
    return error instanceof Error ? error.message : String(error);
}
function short(value, max) {
    return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}
function insightKey(insight) {
    return `${insight.memoryBodyId ?? 'memory'}:${insight.id}`;
}
function PageHeader(props) {
    return (_jsxs("div", { className: css.pageHeader, children: [_jsxs("div", { children: [_jsx("h2", { children: props.title }), _jsx("p", { children: props.description })] }), _jsxs("div", { className: css.pageHeaderMeta, children: [props.meta !== undefined && _jsx("code", { children: props.meta }), props.action] })] }));
}
function EmptyState(props) {
    return (_jsxs("div", { className: css.emptyState, children: [_jsx("div", { className: css.emptyGlyph, "aria-hidden": "true", children: _jsx("span", { children: props.glyph }) }), _jsxs("div", { children: [_jsx("h3", { children: props.title }), _jsx("p", { children: props.children })] })] }));
}
function InsightCard(props) {
    const t = useT();
    const [confirming, setConfirming] = useState(false);
    const [forgetting, setForgetting] = useState(false);
    const { insight } = props;
    const meta = [
        insight.memoryBodyName,
        insight.category !== undefined ? categoryLabel(t, insight.category) : undefined,
        insight.importance !== undefined ? t('common.importance', { value: insight.importance }) : undefined,
        insight.score !== undefined ? `score ${insight.score.toFixed(3)}` : undefined,
        insight.depth !== undefined ? t('common.hops', { count: insight.depth }) : undefined,
    ].filter((entry) => entry !== undefined);
    const forget = async () => {
        setForgetting(true);
        try {
            await props.onForget(insight);
        }
        finally {
            setForgetting(false);
            setConfirming(false);
        }
    };
    return (_jsxs("article", { className: css.insightCard, children: [_jsxs("div", { className: css.cardTop, children: [_jsx("div", { className: css.badges, children: meta.map(entry => _jsx("span", { className: css.badge, children: entry }, entry)) }), _jsx("code", { className: css.id, title: insight.id, children: insight.id.slice(0, 8) })] }), _jsx("p", { className: css.content, children: insight.content }), (insight.tags?.length ?? 0) > 0 && _jsx("div", { className: css.tags, children: insight.tags.map(tag => _jsxs("span", { children: ["#", tag] }, tag)) }), (insight.entities?.length ?? 0) > 0 && _jsx("div", { className: css.entities, children: insight.entities.map(entity => _jsx("span", { children: entity }, entity)) }), _jsx("div", { className: css.cardActions, children: confirming ? (_jsxs("div", { className: css.confirmBar, role: "group", "aria-label": t('card.confirmAria'), children: [_jsx("span", { children: t('card.confirmText') }), _jsx("button", { type: "button", className: css.dangerSolidButton, disabled: forgetting, onClick: () => void forget(), children: forgetting ? t('card.processing') : t('card.confirmForget') }), _jsx("button", { type: "button", className: css.ghostButton, disabled: forgetting, onClick: () => setConfirming(false), children: t('common.cancel') })] })) : (_jsxs(_Fragment, { children: [props.onRelated !== undefined && _jsx("button", { type: "button", className: css.ghostButton, onClick: () => props.onRelated?.(insight), children: t('card.related') }), props.onClone !== undefined && _jsx("button", { type: "button", className: css.ghostButton, onClick: () => props.onClone?.(insight), children: t('card.clone') }), _jsx("button", { type: "button", className: css.ghostButton, onClick: () => void navigator.clipboard?.writeText(insight.id), children: t('common.copyId') }), props.writeEnabled && _jsx("button", { type: "button", className: css.dangerButton, onClick: () => setConfirming(true), children: t('card.forget') })] })) })] }));
}
const GRAPH_WIDTH = 930;
const GRAPH_HEIGHT = 520;
const GRAPH_MARGIN_X = 58;
const GRAPH_MARGIN_Y = 58;
const CATEGORY_ORDER = ['space', 'entity', 'preference', 'decision', 'fact', 'insight', 'context', 'general'];
function hash(value) {
    let result = 2166136261;
    for (const char of value)
        result = Math.imul(result ^ char.charCodeAt(0), 16777619);
    return result >>> 0;
}
function graphNodeKey(node) {
    return node.graphId ?? node.id;
}
function graphNodeKind(node) {
    return node.kind ?? 'memory';
}
function spaceGraphId(id) {
    return `space:${id}`;
}
function entityGraphId(entity) {
    return `entity:${encodeURIComponent(entity.normalize('NFKC').toLocaleLowerCase())}`;
}
/** Add routing scopes and entity indexes without issuing another recall. */
function enrichMultiSpaceGraph(graph, bodies) {
    if (graph.nodes.length === 0)
        return graph;
    const memories = graph.nodes.map(node => ({ ...node, kind: 'memory' }));
    const memoriesByBody = new Map();
    for (const node of memories) {
        if (node.memoryBodyId === undefined)
            continue;
        memoriesByBody.set(node.memoryBodyId, [...(memoriesByBody.get(node.memoryBodyId) ?? []), node]);
    }
    const activeBodies = bodies.filter(body => body.active && ((memoriesByBody.get(body.id)?.length ?? 0) > 0 || (body.stats?.topEntities.length ?? 0) > 0));
    const spaceNodes = activeBodies.map(body => ({
        id: body.id,
        graphId: spaceGraphId(body.id),
        kind: 'space',
        category: 'space',
        content: body.name,
        color: '#22a879',
        memoryBodyId: body.id,
        memoryBodyName: body.name,
        occurrenceCount: body.stats?.totalInsights ?? memoriesByBody.get(body.id)?.length ?? 0,
    }));
    const edges = [...graph.edges];
    for (const body of activeBodies) {
        for (const memory of memoriesByBody.get(body.id) ?? []) {
            edges.push({ sourceId: spaceGraphId(body.id), targetId: graphNodeKey(memory), label: 'scope', color: '#708199', type: 'scope' });
        }
    }
    const indexedEntities = new Map();
    for (const body of activeBodies) {
        for (const item of body.stats?.topEntities ?? []) {
            const entity = item.entity.trim();
            if (entity === '')
                continue;
            const key = entity.normalize('NFKC').toLocaleLowerCase();
            const current = indexedEntities.get(key);
            if (current === undefined)
                indexedEntities.set(key, { entity, count: item.count, bodies: [body] });
            else {
                current.count += item.count;
                if (!current.bodies.some(candidate => candidate.id === body.id))
                    current.bodies.push(body);
            }
        }
    }
    const entities = [...indexedEntities.values()].sort((left, right) => right.count - left.count || left.entity.localeCompare(right.entity)).slice(0, 24);
    const entityNodes = entities.map(item => ({
        id: item.entity,
        graphId: entityGraphId(item.entity),
        kind: 'entity',
        category: 'entity',
        content: item.entity,
        color: '#2b9db9',
        occurrenceCount: item.count,
        memoryBodyIds: item.bodies.map(body => body.id),
        memoryBodyNames: item.bodies.map(body => body.name),
    }));
    for (const item of entities) {
        const key = entityGraphId(item.entity);
        const needle = item.entity.normalize('NFKC').toLocaleLowerCase();
        for (const body of item.bodies) {
            const matching = (memoriesByBody.get(body.id) ?? []).filter(memory => memory.content.normalize('NFKC').toLocaleLowerCase().includes(needle));
            if (matching.length === 0)
                edges.push({ sourceId: spaceGraphId(body.id), targetId: key, label: item.entity, color: '#708199', type: 'scope' });
            else
                for (const memory of matching)
                    edges.push({ sourceId: key, targetId: graphNodeKey(memory), label: item.entity, color: '#22a879', type: 'entity' });
        }
    }
    return { ...graph, nodes: [...spaceNodes, ...entityNodes, ...memories], edges };
}
function graphKindLabel(t, node) {
    const kind = graphNodeKind(node);
    return kind === 'space' ? t('graph.kindSpace') : kind === 'entity' ? t('graph.kindEntity') : categoryLabel(t, node.category ?? 'general');
}
function activeCategoryAnchors(grouped) {
    const categories = [...grouped.keys()].sort((left, right) => {
        const leftIndex = CATEGORY_ORDER.indexOf(left);
        const rightIndex = CATEGORY_ORDER.indexOf(right);
        return (leftIndex < 0 ? CATEGORY_ORDER.length : leftIndex) - (rightIndex < 0 ? CATEGORY_ORDER.length : rightIndex);
    });
    const anchors = new Map();
    if (categories.length === 1) {
        anchors.set(categories[0], { x: GRAPH_WIDTH / 2, y: GRAPH_HEIGHT / 2 });
        return anchors;
    }
    categories.forEach((category, index) => {
        const angle = -Math.PI / 2 + (index / categories.length) * Math.PI * 2;
        anchors.set(category, {
            x: GRAPH_WIDTH / 2 + Math.cos(angle) * Math.min(250, 115 + categories.length * 23),
            y: GRAPH_HEIGHT / 2 + Math.sin(angle) * Math.min(165, 78 + categories.length * 15),
        });
    });
    return anchors;
}
function clampGraphPosition(position) {
    return {
        x: Math.min(GRAPH_WIDTH - GRAPH_MARGIN_X, Math.max(GRAPH_MARGIN_X, position.x)),
        y: Math.min(GRAPH_HEIGHT - GRAPH_MARGIN_Y, Math.max(GRAPH_MARGIN_Y, position.y)),
    };
}
function naturalGraphPositions(nodes, edges) {
    const positions = new Map();
    const grouped = new Map();
    for (const node of nodes) {
        const category = node.category ?? 'general';
        grouped.set(category, [...(grouped.get(category) ?? []), node]);
    }
    const anchors = activeCategoryAnchors(grouped);
    for (const [category, items] of grouped) {
        const anchor = anchors.get(category) ?? { x: GRAPH_WIDTH / 2, y: GRAPH_HEIGHT / 2 };
        items.forEach((node, index) => {
            const seed = hash(graphNodeKey(node));
            const angle = index * 2.399963 + ((seed % 37) / 37) * .4;
            const radius = items.length === 1 ? 0 : 24 + Math.sqrt(index + 1) * 35;
            positions.set(graphNodeKey(node), clampGraphPosition({ x: anchor.x + Math.cos(angle) * radius, y: anchor.y + Math.sin(angle) * radius }));
        });
    }
    const velocities = new Map(nodes.map(node => [graphNodeKey(node), { x: 0, y: 0 }]));
    const visibleIds = new Set(nodes.map(graphNodeKey));
    const visibleEdges = edges.filter(edge => visibleIds.has(edge.sourceId) && visibleIds.has(edge.targetId));
    for (let iteration = 0; iteration < 150; iteration += 1) {
        const cooling = 1 - iteration / 180;
        for (let leftIndex = 0; leftIndex < nodes.length; leftIndex += 1) {
            const left = nodes[leftIndex];
            const leftPosition = positions.get(graphNodeKey(left));
            const leftVelocity = velocities.get(graphNodeKey(left));
            for (let rightIndex = leftIndex + 1; rightIndex < nodes.length; rightIndex += 1) {
                const right = nodes[rightIndex];
                const rightPosition = positions.get(graphNodeKey(right));
                const rightVelocity = velocities.get(graphNodeKey(right));
                let dx = leftPosition.x - rightPosition.x;
                let dy = leftPosition.y - rightPosition.y;
                if (dx === 0 && dy === 0) {
                    dx = ((hash(graphNodeKey(left)) % 13) - 6) || 1;
                    dy = ((hash(graphNodeKey(right)) % 11) - 5) || -1;
                }
                const distanceSquared = Math.max(100, dx * dx + dy * dy);
                const distance = Math.sqrt(distanceSquared);
                const repulsion = Math.min(9, 18_000 / distanceSquared) * cooling;
                const collision = distance < 66 ? (66 - distance) * .08 : 0;
                const force = repulsion + collision;
                const forceX = (dx / distance) * force;
                const forceY = (dy / distance) * force;
                leftVelocity.x += forceX;
                leftVelocity.y += forceY;
                rightVelocity.x -= forceX;
                rightVelocity.y -= forceY;
            }
        }
        for (const edge of visibleEdges) {
            const source = positions.get(edge.sourceId);
            const target = positions.get(edge.targetId);
            const sourceVelocity = velocities.get(edge.sourceId);
            const targetVelocity = velocities.get(edge.targetId);
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const distance = Math.max(1, Math.hypot(dx, dy));
            const sparseScale = nodes.length <= 3 ? 2 : nodes.length <= 8 ? 1.45 : 1;
            const desired = (edge.type === 'scope' ? 138 : edge.type === 'entity' ? 94 : edge.type === 'semantic' ? 118 : 106) * sparseScale;
            const spring = (distance - desired) * .018 * cooling;
            const forceX = (dx / distance) * spring;
            const forceY = (dy / distance) * spring;
            sourceVelocity.x += forceX;
            sourceVelocity.y += forceY;
            targetVelocity.x -= forceX;
            targetVelocity.y -= forceY;
        }
        for (const node of nodes) {
            const key = graphNodeKey(node);
            const position = positions.get(key);
            const velocity = velocities.get(key);
            const anchor = anchors.get(node.category ?? 'general') ?? { x: GRAPH_WIDTH / 2, y: GRAPH_HEIGHT / 2 };
            velocity.x += (anchor.x - position.x) * .0035 * cooling + (GRAPH_WIDTH / 2 - position.x) * .0008;
            velocity.y += (anchor.y - position.y) * .0035 * cooling + (GRAPH_HEIGHT / 2 - position.y) * .0008;
            velocity.x = Math.max(-12, Math.min(12, velocity.x * .76));
            velocity.y = Math.max(-12, Math.min(12, velocity.y * .76));
            positions.set(key, clampGraphPosition({ x: position.x + velocity.x, y: position.y + velocity.y }));
        }
    }
    return positions;
}
function uniformGraphPositions(nodes) {
    const positions = new Map();
    const ordered = [...nodes].sort((left, right) => {
        const categoryDifference = CATEGORY_ORDER.indexOf(left.category ?? 'general') - CATEGORY_ORDER.indexOf(right.category ?? 'general');
        return categoryDifference === 0 ? left.id.localeCompare(right.id) : categoryDifference;
    });
    const columns = Math.max(1, Math.ceil(Math.sqrt(ordered.length * 1.65)));
    const rows = Math.max(1, Math.ceil(ordered.length / columns));
    const cellWidth = (GRAPH_WIDTH - GRAPH_MARGIN_X * 2) / columns;
    const cellHeight = (GRAPH_HEIGHT - GRAPH_MARGIN_Y * 2) / rows;
    ordered.forEach((node, index) => {
        const row = Math.floor(index / columns);
        const column = index % columns;
        const rowLength = Math.min(columns, ordered.length - row * columns);
        const rowOffset = (columns - rowLength) * cellWidth / 2;
        positions.set(graphNodeKey(node), {
            x: GRAPH_MARGIN_X + rowOffset + cellWidth * (column + .5),
            y: GRAPH_MARGIN_Y + cellHeight * (row + .5),
        });
    });
    return positions;
}
function graphPoint(svg, clientX, clientY) {
    const matrix = svg.getScreenCTM?.();
    if (matrix !== null && matrix !== undefined && typeof svg.createSVGPoint === 'function') {
        const point = svg.createSVGPoint();
        point.x = clientX;
        point.y = clientY;
        return clampGraphPosition(point.matrixTransform(matrix.inverse()));
    }
    const bounds = svg.getBoundingClientRect();
    const width = bounds.width || GRAPH_WIDTH;
    const height = bounds.height || GRAPH_HEIGHT;
    return clampGraphPosition({ x: (clientX - bounds.left) * GRAPH_WIDTH / width, y: (clientY - bounds.top) * GRAPH_HEIGHT / height });
}
function MemoryGraph(props) {
    const t = useT();
    const visibleNodes = useMemo(() => {
        const spaces = props.graph.nodes.filter(node => graphNodeKind(node) === 'space');
        const entities = props.graph.nodes.filter(node => graphNodeKind(node) === 'entity').slice(0, 20);
        const memories = props.graph.nodes.filter(node => graphNodeKind(node) === 'memory').slice(0, Math.max(0, 60 - spaces.length - entities.length));
        return [...spaces, ...entities, ...memories].slice(0, 60);
    }, [props.graph.nodes]);
    const visibleIds = useMemo(() => new Set(visibleNodes.map(graphNodeKey)), [visibleNodes]);
    const edges = useMemo(() => props.graph.edges.filter(edge => visibleIds.has(edge.sourceId) && visibleIds.has(edge.targetId)).slice(0, 180), [props.graph.edges, visibleIds]);
    const curvedEdges = useMemo(() => {
        const groups = new Map();
        edges.forEach((edge, index) => {
            const key = [edge.sourceId, edge.targetId].sort().join('::');
            groups.set(key, [...(groups.get(key) ?? []), index]);
        });
        return edges.map((edge, index) => {
            const key = [edge.sourceId, edge.targetId].sort().join('::');
            const group = groups.get(key) ?? [index];
            const groupIndex = group.indexOf(index);
            return { edge, offset: (groupIndex - (group.length - 1) / 2) * 12 };
        });
    }, [edges]);
    const layoutKey = `${visibleNodes.map(node => `${graphNodeKey(node)}:${graphNodeKind(node)}:${node.category ?? 'general'}`).join('|')}::${edges.map(edge => `${edge.sourceId}>${edge.targetId}:${edge.type ?? 'temporal'}`).join('|')}`;
    const naturalLayout = useMemo(() => naturalGraphPositions(visibleNodes, edges), [layoutKey]);
    const [positions, setPositions] = useState(() => naturalLayout);
    const [layoutMode, setLayoutMode] = useState('natural');
    const positionsRef = useRef(positions);
    const animationRef = useRef(null);
    const dragRef = useRef(null);
    const commitPositions = useCallback((next) => {
        positionsRef.current = next;
        setPositions(next);
    }, []);
    const cancelAnimation = useCallback(() => {
        if (animationRef.current !== null && typeof window.cancelAnimationFrame === 'function')
            window.cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
    }, []);
    const animateTo = useCallback((target, mode) => {
        cancelAnimation();
        setLayoutMode(mode);
        if (typeof window.requestAnimationFrame !== 'function') {
            commitPositions(target);
            return;
        }
        const start = new Map(positionsRef.current);
        const startedAt = performance.now();
        const tick = (time) => {
            const progress = Math.min(1, (time - startedAt) / 620);
            const eased = 1 - Math.pow(1 - progress, 3);
            const next = new Map();
            for (const [id, destination] of target) {
                const origin = start.get(id) ?? { x: GRAPH_WIDTH / 2, y: GRAPH_HEIGHT / 2 };
                next.set(id, { x: origin.x + (destination.x - origin.x) * eased, y: origin.y + (destination.y - origin.y) * eased });
            }
            commitPositions(next);
            if (progress < 1)
                animationRef.current = window.requestAnimationFrame(tick);
            else
                animationRef.current = null;
        };
        animationRef.current = window.requestAnimationFrame(tick);
    }, [cancelAnimation, commitPositions]);
    useEffect(() => { animateTo(naturalLayout, 'natural'); }, [layoutKey]);
    useEffect(() => () => cancelAnimation(), [cancelAnimation]);
    const beginDrag = (event, nodeId) => {
        cancelAnimation();
        dragRef.current = { nodeId, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, moved: false };
        event.currentTarget.setPointerCapture?.(event.pointerId);
    };
    const moveDrag = (event) => {
        const drag = dragRef.current;
        const svg = event.currentTarget.ownerSVGElement;
        if (drag === null || svg === null || drag.pointerId !== event.pointerId)
            return;
        if (!drag.moved && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 4)
            return;
        drag.moved = true;
        const point = graphPoint(svg, event.clientX, event.clientY);
        const next = new Map(positionsRef.current);
        next.set(drag.nodeId, point);
        commitPositions(next);
        setLayoutMode('custom');
    };
    const endDrag = (event) => {
        const drag = dragRef.current;
        if (drag === null || drag.pointerId !== event.pointerId)
            return;
        const svg = event.currentTarget.ownerSVGElement;
        if (drag.moved && svg !== null) {
            const next = new Map(positionsRef.current);
            next.set(drag.nodeId, graphPoint(svg, event.clientX, event.clientY));
            commitPositions(next);
        }
        dragRef.current = null;
        event.currentTarget.releasePointerCapture?.(event.pointerId);
        if (!drag.moved) {
            const node = visibleNodes.find(candidate => graphNodeKey(candidate) === drag.nodeId);
            if (node !== undefined)
                props.onSelect(node);
        }
    };
    const cancelDrag = (event) => {
        if (dragRef.current?.pointerId === event.pointerId)
            dragRef.current = null;
    };
    const nudge = (nodeId, dx, dy) => {
        cancelAnimation();
        const current = positionsRef.current.get(nodeId);
        if (current === undefined)
            return;
        const next = new Map(positionsRef.current);
        next.set(nodeId, clampGraphPosition({ x: current.x + dx, y: current.y + dy }));
        commitPositions(next);
        setLayoutMode('custom');
    };
    const layoutLabel = t(layoutMode === 'natural' ? 'graph.layoutNatural' : layoutMode === 'uniform' ? 'graph.layoutUniform' : 'graph.layoutCustom');
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: css.graphCanvasControls, role: "toolbar", "aria-label": t('graph.layoutAria'), children: [_jsxs("span", { role: "status", "aria-label": t('graph.layoutStatus', { layout: layoutLabel }), children: [_jsx("i", {}), t('graph.draggable', { layout: layoutLabel })] }), _jsx("button", { type: "button", "data-active": layoutMode === 'natural' || undefined, onClick: () => animateTo(naturalGraphPositions(visibleNodes, edges), 'natural'), children: t('graph.naturalAction') }), _jsx("button", { type: "button", "data-active": layoutMode === 'uniform' || undefined, onClick: () => animateTo(uniformGraphPositions(visibleNodes), 'uniform'), children: t('graph.uniformAction') })] }), _jsxs("svg", { className: css.graphSvg, viewBox: `0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`, role: "img", "data-layout": layoutMode, "data-density": visibleNodes.length <= 12 ? 'sparse' : 'dense', "aria-label": t('graph.aria', { nodes: props.graph.nodes.length, edges: props.graph.edges.length }), children: [_jsxs("defs", { children: [_jsx("pattern", { id: "mnemon-grid", width: "26", height: "26", patternUnits: "userSpaceOnUse", children: _jsx("path", { d: "M 26 0 L 0 0 0 26", className: css.graphGridLine, fill: "none" }) }), _jsxs("filter", { id: "mnemon-glow", x: "-100%", y: "-100%", width: "300%", height: "300%", children: [_jsx("feGaussianBlur", { stdDeviation: "4", result: "blur" }), _jsxs("feMerge", { children: [_jsx("feMergeNode", { in: "blur" }), _jsx("feMergeNode", { in: "SourceGraphic" })] })] })] }), _jsx("rect", { width: GRAPH_WIDTH, height: GRAPH_HEIGHT, className: css.graphBackdrop }), _jsx("rect", { width: GRAPH_WIDTH, height: GRAPH_HEIGHT, fill: "url(#mnemon-grid)" }), curvedEdges.map(({ edge, offset }, index) => {
                        const source = positions.get(edge.sourceId) ?? naturalLayout.get(edge.sourceId) ?? { x: GRAPH_WIDTH / 2, y: GRAPH_HEIGHT / 2 };
                        const target = positions.get(edge.targetId) ?? naturalLayout.get(edge.targetId) ?? { x: GRAPH_WIDTH / 2, y: GRAPH_HEIGHT / 2 };
                        const dx = target.x - source.x;
                        const dy = target.y - source.y;
                        const distance = Math.max(1, Math.hypot(dx, dy));
                        const direction = edge.sourceId.localeCompare(edge.targetId) <= 0 ? 1 : -1;
                        const controlX = (source.x + target.x) / 2 - (dy / distance) * offset * direction;
                        const controlY = (source.y + target.y) / 2 + (dx / distance) * offset * direction;
                        return _jsx("path", { d: `M ${source.x} ${source.y} Q ${controlX} ${controlY} ${target.x} ${target.y}`, className: css.graphEdge, "data-edge": edge.type ?? 'temporal' }, `${edge.sourceId}-${edge.targetId}-${index}`);
                    }), visibleNodes.map((node, index) => {
                        const nodeKey = graphNodeKey(node);
                        const position = positions.get(nodeKey) ?? naturalLayout.get(nodeKey) ?? { x: GRAPH_WIDTH / 2, y: GRAPH_HEIGHT / 2 };
                        const selected = props.selectedId === nodeKey;
                        const showLabel = selected || visibleNodes.length < 22 || index % 3 === 0;
                        return (_jsxs("g", { className: css.graphNode, "data-category": node.category ?? 'general', "data-kind": graphNodeKind(node), "data-selected": selected || undefined, transform: `translate(${position.x} ${position.y})`, role: "button", tabIndex: 0, "aria-label": `${graphKindLabel(t, node)}: ${short(node.content, 80)}`, "data-dragging": dragRef.current?.nodeId === nodeKey || undefined, onPointerDown: event => beginDrag(event, nodeKey), onPointerMove: moveDrag, onPointerUp: endDrag, onPointerCancel: cancelDrag, onLostPointerCapture: cancelDrag, onClick: () => props.onSelect(node), onKeyDown: event => {
                                if (event.key === 'Enter' || event.key === ' ')
                                    props.onSelect(node);
                                else if (event.key === 'ArrowLeft') {
                                    event.preventDefault();
                                    nudge(nodeKey, -12, 0);
                                }
                                else if (event.key === 'ArrowRight') {
                                    event.preventDefault();
                                    nudge(nodeKey, 12, 0);
                                }
                                else if (event.key === 'ArrowUp') {
                                    event.preventDefault();
                                    nudge(nodeKey, 0, -12);
                                }
                                else if (event.key === 'ArrowDown') {
                                    event.preventDefault();
                                    nudge(nodeKey, 0, 12);
                                }
                            }, children: [graphNodeKind(node) === 'space'
                                    ? _jsxs(_Fragment, { children: [_jsx("rect", { x: selected ? -20 : -17, y: selected ? -15 : -13, width: selected ? 40 : 34, height: selected ? 30 : 26, rx: "9", className: css.nodeHalo, filter: selected ? 'url(#mnemon-glow)' : undefined }), _jsx("circle", { r: selected ? 6 : 5, className: css.nodeCore })] })
                                    : graphNodeKind(node) === 'entity'
                                        ? _jsxs(_Fragment, { children: [_jsx("path", { d: selected ? 'M 0 -18 L 18 0 L 0 18 L -18 0 Z' : 'M 0 -14 L 14 0 L 0 14 L -14 0 Z', className: css.nodeHalo, filter: selected ? 'url(#mnemon-glow)' : undefined }), _jsx("circle", { r: selected ? 5 : 4, className: css.nodeCore })] })
                                        : _jsxs(_Fragment, { children: [_jsx("circle", { r: selected ? 17 : visibleNodes.length <= 12 ? 14 : 11, className: css.nodeHalo, filter: selected ? 'url(#mnemon-glow)' : undefined }), _jsx("circle", { r: selected ? 7 : visibleNodes.length <= 12 ? 6 : 4.5, className: css.nodeCore })] }), (selected || visibleNodes.length <= 12) && graphNodeKind(node) === 'memory' && node.memoryBodyName !== undefined && _jsx("text", { x: "0", y: "-18", textAnchor: "middle", className: css.nodeBodyLabel, children: short(node.memoryBodyName, 12) }), showLabel && _jsx("text", { x: visibleNodes.length <= 12 ? 19 : 15, y: "4", className: css.nodeLabel, children: short(node.content.replace(/\s+/gu, ' '), selected ? 34 : visibleNodes.length <= 12 ? 26 : 19) })] }, nodeKey));
                    })] })] }));
}
function OverviewPage(props) {
    const t = useT();
    const [graph, setGraph] = useState(null);
    const [catalog, setCatalog] = useState(null);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [changing, setChanging] = useState(null);
    const [creating, setCreating] = useState(false);
    const [bodyName, setBodyName] = useState('');
    const [bodyDescription, setBodyDescription] = useState('');
    const [catalogUnavailable, setCatalogUnavailable] = useState(false);
    const load = useCallback(async (quiet = false) => {
        if (!quiet)
            setLoading(true);
        setError(null);
        try {
            const [nextCatalog, next] = await Promise.all([
                props.client.bodies().then(next => { setCatalogUnavailable(false); return next; }).catch(() => {
                    setCatalogUnavailable(!props.catalogKnown);
                    return {
                        items: props.fallbackBodies,
                        total: props.fallbackBodies.length,
                        activeCount: props.fallbackBodies.filter(body => body.active).length,
                        directory: props.fallbackDirectory ?? '',
                        generatedAt: new Date().toISOString(),
                    };
                }),
                props.client.graph(),
            ]);
            const enriched = enrichMultiSpaceGraph(next, nextCatalog.items);
            setCatalog(nextCatalog);
            setGraph(enriched);
            setSelected(current => current === null ? null : enriched.nodes.find(node => graphNodeKey(node) === graphNodeKey(current)) ?? null);
        }
        catch (reason) {
            setError(message(reason));
        }
        finally {
            setLoading(false);
        }
    }, [props.catalogKnown, props.client, props.fallbackBodies, props.fallbackDirectory]);
    useEffect(() => {
        void load();
        const timer = window.setInterval(() => void load(true), 15_000);
        return () => window.clearInterval(timer);
    }, [load, props.revision]);
    const toggle = async (body) => {
        setChanging(body.id);
        setError(null);
        try {
            await props.client.updateBody(body.id, { active: !body.active });
            await load(true);
            props.onMutate();
        }
        catch (reason) {
            setError(message(reason));
        }
        finally {
            setChanging(null);
        }
    };
    const create = async (event) => {
        event.preventDefault();
        if (bodyName.trim() === '' || bodyDescription.trim() === '')
            return;
        setCreating(true);
        setError(null);
        try {
            await props.client.createBody({ name: bodyName, description: bodyDescription });
            setBodyName('');
            setBodyDescription('');
            await load(true);
            props.onMutate();
        }
        catch (reason) {
            setError(message(reason));
        }
        finally {
            setCreating(false);
        }
    };
    const generated = graph === null ? t('overview.waitingSnapshot') : t('overview.updatedAt', { time: new Date(graph.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) });
    const graphSpaces = graph?.nodes.filter(node => graphNodeKind(node) === 'space').length ?? 0;
    const graphEntities = graph?.nodes.filter(node => graphNodeKind(node) === 'entity').length ?? 0;
    const graphMemories = graph?.nodes.filter(node => graphNodeKind(node) === 'memory').length ?? 0;
    const selectedKind = selected === null ? null : graphNodeKind(selected);
    return (_jsxs("div", { className: css.page, children: [_jsx(PageHeader, { title: t('overview.title'), description: t('overview.description'), meta: t('overview.interval'), action: _jsx("button", { type: "button", className: css.secondaryButton, disabled: loading, onClick: () => void load(), children: loading ? t('overview.syncing') : t('overview.syncNow') }) }), error !== null && _jsx("div", { className: css.inlineError, role: "alert", children: error }), _jsxs("section", { className: css.bodyDirectory, "aria-label": t('overview.directory'), children: [_jsxs("div", { className: css.bodyDirectoryHeader, children: [_jsxs("div", { children: [_jsx("h3", { children: t('overview.directory') }), _jsx("p", { children: t('overview.directory.description') }), _jsx("code", { className: css.bodyDirectoryPath, children: catalogUnavailable ? t('overview.directory.unsynced') : catalog?.directory || props.fallbackDirectory || t('overview.directory.waiting') })] }), _jsx("strong", { children: catalogUnavailable ? t('overview.directory.unsyncedBadge') : `${catalog?.activeCount ?? '—'} / ${catalog?.total ?? '—'} ${t('common.active')}` })] }), _jsxs("div", { className: css.bodyGrid, children: [catalog?.items.map(body => (_jsxs("article", { className: css.bodyCard, "data-active": body.active || undefined, "data-healthy": body.healthy || undefined, title: body.error, children: [_jsxs("div", { className: css.bodyCardTop, children: [_jsx("span", { className: css.bodySignal }), _jsxs("div", { children: [_jsx("strong", { children: body.name }), _jsx("code", { children: body.id }), _jsx("small", { className: css.bodyHealth, children: body.healthy ? t('overview.storageHealthy') : t('overview.storageUnhealthy') })] }), _jsxs("button", { type: "button", className: css.bodySwitch, role: "switch", "aria-checked": body.active, "aria-label": t('overview.toggleAria', { name: body.name }), disabled: !props.writeEnabled || changing === body.id, onClick: () => void toggle(body), children: [_jsx("span", { className: css.bodySwitchTrack, "aria-hidden": "true", children: _jsx("i", {}) }), _jsx("span", { children: changing === body.id ? t('overview.toggling') : body.active ? t('common.active') : t('common.inactive') })] })] }), _jsx("p", { children: body.description || t('overview.noDescription') }), _jsxs("footer", { children: [_jsx("span", { children: t('common.memories', { count: body.stats?.totalInsights ?? 0 }) }), _jsx("span", { children: t('common.edges', { count: body.stats?.edgeCount ?? 0 }) }), _jsx("span", { children: humanBytes(body.stats?.dbSizeBytes ?? 0) })] })] }, body.id))), catalog?.total === 0 && _jsxs("div", { className: css.bodyDirectoryEmpty, children: [_jsx("span", { children: "\u25C7" }), _jsxs("div", { children: [_jsx("strong", { children: catalogUnavailable ? t('overview.unsyncedTitle') : t('overview.emptyTitle') }), _jsx("p", { children: catalogUnavailable ? t('overview.unsyncedShort') : t('overview.emptyShort') })] })] })] }), props.writeEnabled && !catalogUnavailable && _jsxs("details", { className: css.bodyCreate, open: catalog?.total === 0 ? true : undefined, children: [_jsx("summary", { children: t('overview.create') }), _jsxs("form", { onSubmit: event => void create(event), children: [_jsx("input", { "aria-label": t('overview.createName'), value: bodyName, onChange: event => setBodyName(event.target.value), placeholder: t('overview.createNamePlaceholder'), required: true }), _jsx("input", { "aria-label": t('overview.createDescription'), value: bodyDescription, onChange: event => setBodyDescription(event.target.value), placeholder: t('overview.createDescriptionPlaceholder'), required: true }), _jsx("button", { type: "submit", className: css.secondaryButton, disabled: creating, children: creating ? t('overview.creating') : t('overview.createAction') })] })] })] }), !catalogUnavailable && graph !== null && graph.nodes.length > 0 ? (_jsxs("div", { className: css.graphLayout, children: [_jsxs("section", { className: css.graphPanel, children: [_jsxs("div", { className: css.graphToolbar, children: [_jsxs("div", { children: [_jsx("span", { className: css.liveDot }), t('overview.snapshot'), " ", _jsx("small", { children: generated })] }), _jsxs("div", { className: css.graphLegend, children: [_jsx("span", { "data-edge": "scope", children: t('overview.edgeScope') }), _jsx("span", { "data-edge": "temporal", children: t('overview.edgeTemporal') }), _jsx("span", { "data-edge": "semantic", children: t('overview.edgeSemantic') }), _jsx("span", { "data-edge": "causal", children: t('overview.edgeCausal') }), _jsx("span", { "data-edge": "entity", children: t('overview.edgeEntity') })] })] }), _jsx("div", { className: css.graphViewport, children: _jsx(MemoryGraph, { graph: graph, selectedId: selected === null ? undefined : graphNodeKey(selected), onSelect: setSelected }) }), _jsxs("div", { className: css.graphFooter, children: [_jsx("span", { children: t('overview.graphComposition', { spaces: graphSpaces, memories: graphMemories, entities: graphEntities }) }), _jsxs("span", { children: [t('overview.graphCount', { visible: Math.min(graph.nodes.length, 60), total: graph.nodes.length }), " \u00B7 ", t('overview.graphEdges', { count: graph.edges.length })] })] })] }), _jsx("aside", { className: css.graphInspector, "data-empty": selected === null || undefined, children: selected === null ? (_jsxs("div", { className: css.inspectorEmpty, children: [_jsx(MnemonLogo, { className: css.inspectorLogo, title: t('overview.inspector') }), _jsx("h3", { children: t('overview.selectNode') }), _jsx("p", { children: t('overview.selectNodeText') })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: css.inspectorHeading, children: [_jsx("span", { children: t(selectedKind === 'space' ? 'overview.inspectorSpace' : selectedKind === 'entity' ? 'overview.inspectorEntity' : 'overview.inspector') }), _jsx("button", { type: "button", onClick: () => setSelected(null), "aria-label": t('overview.closeInspector'), children: "\u00D7" })] }), _jsx("span", { className: css.categoryChip, children: graphKindLabel(t, selected) }), _jsx("h3", { children: selected.content }), selectedKind === 'space'
                                    ? _jsxs("dl", { className: css.inspectorMeta, children: [_jsxs("div", { children: [_jsx("dt", { children: t('overview.spaceId') }), _jsx("dd", { children: _jsx("code", { children: selected.memoryBodyId ?? selected.id }) })] }), _jsxs("div", { children: [_jsx("dt", { children: t('overview.containedMemories') }), _jsx("dd", { children: selected.occurrenceCount ?? 0 })] })] })
                                    : selectedKind === 'entity'
                                        ? _jsxs("dl", { className: css.inspectorMeta, children: [_jsxs("div", { children: [_jsx("dt", { children: t('overview.entityMentions') }), _jsx("dd", { children: selected.occurrenceCount ?? 0 })] }), _jsxs("div", { children: [_jsx("dt", { children: t('term.spaces') }), _jsx("dd", { children: selected.memoryBodyNames?.join(' · ') || '—' })] })] })
                                        : _jsxs("dl", { className: css.inspectorMeta, children: [_jsxs("div", { children: [_jsx("dt", { children: t('term.space') }), _jsxs("dd", { children: [selected.memoryBodyName ?? '—', " ", _jsx("code", { children: selected.memoryBodyId ?? '' })] })] }), _jsxs("div", { children: [_jsx("dt", { children: t('overview.memoryId') }), _jsx("dd", { children: _jsx("code", { children: selected.id }) })] }), _jsxs("div", { children: [_jsx("dt", { children: t('common.category') }), _jsx("dd", { children: categoryLabel(t, selected.category ?? 'general') })] })] }), _jsxs("div", { className: css.inspectorActions, children: [selectedKind !== 'space' && _jsx("button", { type: "button", className: css.primaryButton, onClick: () => props.onExplore(selected.content), children: t('overview.exploreNode') }), _jsx("button", { type: "button", className: css.secondaryButton, onClick: () => void navigator.clipboard?.writeText(selected.id), children: t('common.copyId') })] })] })) })] })) : !loading && error === null ? (catalogUnavailable
                ? _jsx(EmptyState, { glyph: "\u25C7", title: t('overview.unsyncedTitle'), children: t('overview.unsyncedLong') })
                : catalog?.total === 0
                    ? _jsx(EmptyState, { glyph: "\u25C7", title: t('overview.emptyTitle'), children: t('overview.emptyLong') })
                    : catalog?.activeCount === 0
                        ? _jsx(EmptyState, { glyph: "\u25C7", title: t('overview.noActiveTitle'), children: t('overview.noActiveText') })
                        : _jsx(EmptyState, { glyph: "\u25C7", title: t('overview.noContentTitle'), children: t('overview.noContentText') })) : (_jsx("div", { className: css.loadingPanel, children: t('overview.loading') }))] }));
}
function ExplorePage(props) {
    const t = useT();
    const [query, setQuery] = useState(props.seed);
    const [mode, setMode] = useState('smart');
    const [category, setCategory] = useState('');
    const [results, setResults] = useState([]);
    const [searchKind, setSearchKind] = useState(null);
    const [agentAnswer, setAgentAnswer] = useState(null);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState(null);
    const [relatedTo, setRelatedTo] = useState(null);
    const [related, setRelated] = useState([]);
    const [relatedLoading, setRelatedLoading] = useState(false);
    useEffect(() => { if (props.seed !== '')
        setQuery(props.seed); }, [props.seed]);
    const runSearch = async (withAgent) => {
        if (query.trim() === '')
            return;
        setSearchKind(withAgent ? 'agent' : 'direct');
        setSearched(true);
        setError(null);
        setRelatedTo(null);
        setAgentAnswer(null);
        try {
            const request = { query, mode, ...(category === '' ? {} : { category }), limit: props.status?.defaultRecallLimit ?? 10 };
            if (withAgent) {
                const response = await props.client.agentSearch(request);
                setResults(response.results);
                setAgentAnswer({ answer: response.answer, citations: response.citations, runId: response.delegation.runId });
            }
            else {
                setResults((await props.client.search(request)).results);
            }
        }
        catch (reason) {
            setError(message(reason));
            setResults([]);
            setAgentAnswer(null);
        }
        finally {
            setSearchKind(null);
        }
    };
    const search = (event) => { event.preventDefault(); void runSearch(false); };
    const searching = searchKind !== null;
    const showRelated = async (insight) => {
        setRelatedTo(insight);
        setRelated([]);
        setRelatedLoading(true);
        setError(null);
        try {
            setRelated(await props.client.related(insight.id, insight.memoryBodyId));
        }
        catch (reason) {
            setError(message(reason));
        }
        finally {
            setRelatedLoading(false);
        }
    };
    const forget = async (insight) => {
        await props.onForget(insight);
        setResults(items => items.filter(item => insightKey(item) !== insightKey(insight)));
        setRelated(items => items.filter(item => insightKey(item) !== insightKey(insight)));
        if (relatedTo !== null && insightKey(relatedTo) === insightKey(insight))
            setRelatedTo(null);
    };
    return (_jsxs("div", { className: css.page, children: [_jsx(PageHeader, { title: t('search.title'), description: t('search.description'), meta: t('search.maxResults', { count: props.status?.defaultRecallLimit ?? '—' }) }), _jsxs("form", { className: css.searchBar, onSubmit: event => void search(event), children: [_jsxs("div", { className: css.queryField, children: [_jsx("span", { "aria-hidden": "true", children: "\u2315" }), _jsx("input", { value: query, onChange: event => setQuery(event.target.value), placeholder: t('search.placeholder'), "aria-label": t('search.queryAria') }), _jsx("kbd", { children: "\u21B5" })] }), _jsxs("div", { className: css.searchControls, children: [_jsxs("label", { children: [t('common.category'), _jsxs("select", { value: category, onChange: event => setCategory(event.target.value), "aria-label": t('search.categoryAria'), children: [_jsx("option", { value: "", children: t('common.allCategories') }), CATEGORIES.map(value => _jsx("option", { value: value, children: categoryLabel(t, value) }, value))] })] }), _jsxs("label", { children: [t('search.strategy'), _jsxs("select", { value: mode, onChange: event => setMode(event.target.value), "aria-label": t('search.modeAria'), children: [_jsx("option", { value: "smart", children: t('search.modeSmart') }), _jsx("option", { value: "keyword", children: t('search.modeKeyword') }), _jsx("option", { value: "basic", children: t('search.modeBasic') })] })] }), _jsxs("div", { className: css.searchActions, children: [_jsx("button", { type: "submit", className: css.secondaryButton, disabled: searching || query.trim() === '', children: searchKind === 'direct' ? t('search.searching') : t('search.action') }), _jsx("button", { type: "button", className: css.primaryButton, disabled: searching || query.trim() === '' || props.status?.lifecycle?.sessionAvailable !== true, onClick: () => void runSearch(true), children: searchKind === 'agent' ? t('search.agentSearching') : t('search.agentAction') })] })] })] }), agentAnswer !== null && _jsxs("section", { className: css.agentAnswer, "aria-label": t('search.agentAnswer'), children: [_jsxs("div", { className: css.agentAnswerHeading, children: [_jsxs("div", { children: [_jsx("span", { children: t('search.agentAnswerHint') }), _jsx("h3", { children: t('search.agentAnswer') })] }), _jsx("code", { children: agentAnswer.runId.slice(0, 8) })] }), _jsx("p", { children: agentAnswer.answer }), agentAnswer.citations.length > 0 && _jsx("div", { className: css.agentCitations, children: agentAnswer.citations.map(citation => _jsx("code", { children: citation }, citation)) })] }), error !== null && _jsx("div", { className: css.inlineError, role: "alert", children: error }), !searched && _jsx(EmptyState, { glyph: "\u2315", title: t('search.startTitle'), children: t('search.startText') }), searched && !searching && results.length === 0 && error === null && _jsx(EmptyState, { glyph: "0", title: t('search.emptyTitle'), children: t('search.emptyText') }), results.length > 0 && (_jsxs("div", { className: relatedTo === null ? css.singleColumn : css.resultLayout, children: [_jsxs("section", { className: css.results, children: [_jsxs("div", { className: css.sectionHeading, children: [_jsx("div", { children: _jsx("h3", { children: t('search.results') }) }), _jsx("strong", { children: results.length })] }), results.map(insight => _jsx(InsightCard, { insight: insight, writeEnabled: props.writeEnabled, onForget: forget, onRelated: item => void showRelated(item) }, insightKey(insight)))] }), relatedTo !== null && _jsxs("aside", { className: css.relatedPane, children: [_jsxs("div", { className: css.sectionHeading, children: [_jsx("div", { children: _jsx("h3", { children: t('search.related') }) }), _jsx("button", { type: "button", onClick: () => setRelatedTo(null), "aria-label": t('search.closeRelated'), children: "\u00D7" })] }), _jsx("p", { className: css.relatedSource, children: relatedTo.content }), relatedLoading && _jsx("div", { className: css.loading, children: t('search.traversing') }), !relatedLoading && related.length === 0 && _jsx("div", { className: css.muted, children: t('search.noRelated') }), related.map(insight => _jsx(InsightCard, { insight: insight, writeEnabled: props.writeEnabled, onForget: forget, onRelated: item => void showRelated(item) }, insightKey(insight)))] })] }))] }));
}
function EntitiesPage(props) {
    const t = useT();
    const [view, setView] = useState({ items: [], insights: [] });
    const [entity, setEntity] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const load = useCallback(async (selected) => {
        setLoading(true);
        setError(null);
        try {
            setView(await props.client.entities(selected, 20));
        }
        catch (reason) {
            setError(message(reason));
        }
        finally {
            setLoading(false);
        }
    }, [props.client]);
    useEffect(() => { void load(); }, [load, props.revision]);
    const submit = (event) => { event.preventDefault(); if (entity.trim() !== '')
        void load(entity); };
    return (_jsxs("div", { className: css.page, children: [_jsx(PageHeader, { title: t('entities.title'), description: t('entities.description'), meta: t('entities.count', { count: view.items.length }) }), _jsxs("div", { className: css.entityLayout, children: [_jsxs("aside", { className: css.entityRail, children: [_jsxs("form", { className: css.entitySearch, onSubmit: submit, children: [_jsx("input", { "aria-label": t('entities.nameAria'), value: entity, onChange: event => setEntity(event.target.value), placeholder: t('entities.placeholder') }), _jsx("button", { type: "submit", className: css.primaryButton, disabled: loading || entity.trim() === '', children: t('entities.action') })] }), _jsxs("div", { className: css.entityHeading, children: [_jsx("span", { children: t('entities.top') }), _jsx("small", { children: t('entities.frequency') })] }), _jsx("div", { className: css.entityList, children: view.items.map(item => _jsxs("button", { type: "button", "aria-pressed": view.selected === item.entity, onClick: () => { setEntity(item.entity); void load(item.entity); }, children: [_jsx("span", { children: item.entity }), _jsx("strong", { children: item.count })] }, item.entity)) }), !loading && view.items.length === 0 && _jsx("p", { className: css.muted, children: t('entities.emptyRail') })] }), _jsxs("section", { className: css.entityResults, children: [error !== null && _jsx("div", { className: css.inlineError, role: "alert", children: error }), loading && _jsx("div", { className: css.loadingPanel, children: t('entities.loading') }), !loading && view.selected === undefined && _jsx(EmptyState, { glyph: "\u25CE", title: t('entities.selectTitle'), children: t('entities.selectText') }), !loading && view.selected !== undefined && _jsxs(_Fragment, { children: [_jsxs("div", { className: css.sectionHeading, children: [_jsx("div", { children: _jsx("h3", { children: view.selected }) }), _jsx("strong", { children: view.insights.length })] }), view.insights.length === 0 ? _jsx(EmptyState, { glyph: "0", title: t('entities.emptyTitle'), children: t('entities.emptyText') }) : view.insights.map(insight => _jsx(InsightCard, { insight: insight, writeEnabled: props.writeEnabled, onForget: props.onForget, onRelated: () => props.onExplore(insight.content) }, insightKey(insight)))] })] })] })] }));
}
function RuntimePage(props) {
    const t = useT();
    const [snapshot, setSnapshot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notice, setNotice] = useState(null);
    const [target, setTarget] = useState('memory');
    const [importance, setImportance] = useState('normal');
    const [content, setContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [editImportance, setEditImportance] = useState('normal');
    const [removing, setRemoving] = useState(null);
    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setSnapshot(await props.client.runtimeMemory());
        }
        catch (reason) {
            setError(message(reason));
        }
        finally {
            setLoading(false);
        }
    }, [props.client]);
    useEffect(() => { void load(); }, [load, props.revision]);
    const entryKey = (entry) => `${entry.target}:${entry.created_at}:${entry.content}`;
    const mutate = async (request) => {
        setNotice(null);
        setError(null);
        const result = await props.client.mutateRuntimeMemory(request);
        setNotice(result.maintenance === undefined
            ? t(`runtime.result.${request.action}`, { target: t(`runtime.target.${request.target}`), count: result.entryCount })
            : result.maintenance.kind === 'local-compaction'
                ? t('runtime.result.localCompaction', { target: t(`runtime.target.${request.target}`), count: result.entryCount })
                : t('runtime.result.maintenance', { target: t(`runtime.target.${request.target}`), count: result.entryCount, spaces: result.maintenance.memoryBodyIds.join(', ') || '—' }));
        await load();
        props.onMutate();
    };
    const add = async (event) => {
        event.preventDefault();
        if (content.trim() === '')
            return;
        setSaving(true);
        try {
            await mutate({ action: 'add', target, content, importance });
            setContent('');
        }
        catch (reason) {
            setError(message(reason));
        }
        finally {
            setSaving(false);
        }
    };
    const beginEdit = (entry) => {
        setEditing(entryKey(entry));
        setEditContent(entry.content);
        setEditImportance(entry.importance);
        setRemoving(null);
    };
    const replace = async (entry) => {
        if (editContent.trim() === '')
            return;
        setSaving(true);
        try {
            await mutate({ action: 'replace', target: entry.target, old_text: entry.content, content: editContent, importance: editImportance });
            setEditing(null);
        }
        catch (reason) {
            setError(message(reason));
        }
        finally {
            setSaving(false);
        }
    };
    const remove = async (entry) => {
        setSaving(true);
        try {
            await mutate({ action: 'remove', target: entry.target, old_text: entry.content });
            setRemoving(null);
        }
        catch (reason) {
            setError(message(reason));
        }
        finally {
            setSaving(false);
        }
    };
    const targetPanel = (value) => {
        const view = snapshot?.targets[value];
        const entries = snapshot?.entries.filter(entry => entry.target === value) ?? [];
        const percentage = view === undefined || view.limit === 0 ? 0 : Math.min(100, Math.round(view.used / view.limit * 100));
        return (_jsxs("section", { className: css.runtimeTarget, "aria-label": t(`runtime.target.${value}`), children: [_jsxs("header", { className: css.runtimeTargetHeader, children: [_jsxs("div", { children: [_jsx("span", { children: value === 'user' ? 'USER.md' : 'MEMORY.md' }), _jsx("h3", { children: t(`runtime.target.${value}`) })] }), _jsx("strong", { children: view?.entryCount ?? 0 })] }), _jsxs("div", { className: css.capacityLine, children: [_jsx("div", { children: _jsx("i", { style: { width: `${percentage}%` } }) }), _jsx("span", { children: view === undefined ? '—' : `${humanBytes(view.used)} / ${humanBytes(view.limit)}` })] }), _jsx("p", { className: css.runtimeTargetDescription, children: t(`runtime.target.${value}.description`) }), _jsxs("div", { className: css.runtimeEntries, children: [entries.map(entry => {
                            const key = entryKey(entry);
                            const isEditing = editing === key;
                            const isRemoving = removing === key;
                            return _jsxs("article", { className: css.runtimeEntry, "data-importance": entry.importance, children: [_jsxs("div", { className: css.runtimeEntryMeta, children: [_jsx("span", { children: t(`runtime.importance.${entry.importance}`) }), _jsx("time", { dateTime: entry.updated_at, children: new Date(entry.updated_at).toLocaleString() })] }), isEditing ? _jsx("textarea", { "aria-label": t('runtime.editContent'), value: editContent, onChange: event => setEditContent(event.target.value), rows: 4 }) : _jsx("p", { children: entry.content }), isEditing && _jsxs("select", { "aria-label": t('runtime.importance'), value: editImportance, onChange: event => setEditImportance(event.target.value), children: [_jsx("option", { value: "critical", children: t('runtime.importance.critical') }), _jsx("option", { value: "normal", children: t('runtime.importance.normal') }), _jsx("option", { value: "low", children: t('runtime.importance.low') })] }), _jsx("footer", { children: isRemoving ? _jsxs(_Fragment, { children: [_jsx("span", { children: t('runtime.removeConfirm') }), _jsx("button", { type: "button", className: css.dangerSolidButton, disabled: saving, onClick: () => void remove(entry), children: t('runtime.removeAction') }), _jsx("button", { type: "button", className: css.ghostButton, onClick: () => setRemoving(null), children: t('common.cancel') })] }) : isEditing ? _jsxs(_Fragment, { children: [_jsx("button", { type: "button", className: css.primaryButton, disabled: saving || editContent.trim() === '', onClick: () => void replace(entry), children: t('runtime.saveEdit') }), _jsx("button", { type: "button", className: css.ghostButton, onClick: () => setEditing(null), children: t('common.cancel') })] }) : props.writeEnabled ? _jsxs(_Fragment, { children: [_jsx("button", { type: "button", className: css.ghostButton, onClick: () => beginEdit(entry), children: t('runtime.editAction') }), _jsx("button", { type: "button", className: css.dangerButton, onClick: () => { setRemoving(key); setEditing(null); }, children: t('runtime.removeAction') })] }) : null })] }, key);
                        }), !loading && entries.length === 0 && _jsxs("div", { className: css.runtimeEmpty, children: [_jsx("span", { children: "\u25CB" }), _jsx("p", { children: t('runtime.empty') })] })] })] }));
    };
    return (_jsxs("div", { className: css.page, children: [_jsx(PageHeader, { title: t('runtime.title'), description: t('runtime.description'), meta: snapshot === null ? t('common.loading') : t('runtime.total', { count: snapshot.entries.length }), action: _jsx("button", { type: "button", className: css.secondaryButton, disabled: loading, onClick: () => void load(), children: t('runtime.refresh') }) }), error !== null && _jsx("div", { className: css.inlineError, role: "alert", children: error }), notice !== null && _jsx("div", { className: css.runtimeNotice, role: "status", children: notice }), props.writeEnabled && _jsxs("form", { className: css.runtimeComposer, onSubmit: event => void add(event), children: [_jsxs("div", { className: css.runtimeComposerHeading, children: [_jsxs("div", { children: [_jsx("h3", { children: t('runtime.addTitle') }), _jsx("p", { children: t('runtime.addDescription') })] }), _jsx("span", { children: t('runtime.hotContext') })] }), _jsx("textarea", { "aria-label": t('runtime.content'), value: content, onChange: event => setContent(event.target.value), rows: 3, placeholder: t('runtime.placeholder') }), _jsxs("div", { className: css.runtimeComposerActions, children: [_jsxs("label", { children: [t('runtime.target'), _jsxs("select", { value: target, onChange: event => setTarget(event.target.value), children: [_jsx("option", { value: "memory", children: t('runtime.target.memory') }), _jsx("option", { value: "user", children: t('runtime.target.user') })] })] }), _jsxs("label", { children: [t('runtime.importance'), _jsxs("select", { value: importance, onChange: event => setImportance(event.target.value), children: [_jsx("option", { value: "critical", children: t('runtime.importance.critical') }), _jsx("option", { value: "normal", children: t('runtime.importance.normal') }), _jsx("option", { value: "low", children: t('runtime.importance.low') })] })] }), _jsx("button", { type: "submit", className: css.primaryButton, disabled: saving || content.trim() === '', children: saving ? t('runtime.saving') : t('runtime.addAction') })] })] }), !props.writeEnabled && _jsx("div", { className: css.runtimeReadOnly, children: t('runtime.readOnly') }), _jsxs("div", { className: css.runtimeGrid, children: [targetPanel('user'), targetPanel('memory')] }), _jsx("p", { className: css.runtimeFootnote, children: t('runtime.footnote') })] }));
}
function RememberPage(props) {
    const t = useT();
    const [content, setContent] = useState(props.seed);
    const [category, setCategory] = useState('general');
    const [importance, setImportance] = useState(3);
    const [tags, setTags] = useState('');
    const [entities, setEntities] = useState('');
    const [memoryBodyId, setMemoryBodyId] = useState('');
    const [supervising, setSupervising] = useState(false);
    const [saving, setSaving] = useState(false);
    const [result, setResult] = useState(null);
    useEffect(() => { if (props.seed !== '')
        setContent(props.seed); }, [props.seed]);
    useEffect(() => {
        if (memoryBodyId === '' && props.memoryBodies.length > 0)
            setMemoryBodyId((props.memoryBodies.find(body => body.active) ?? props.memoryBodies[0]).id);
    }, [memoryBodyId, props.memoryBodies]);
    const supervise = async (event) => {
        event.preventDefault();
        if (content.trim() === '' || props.sessionId === undefined)
            return;
        setSupervising(true);
        setResult(null);
        try {
            const response = await props.client.supervise(content);
            setResult(`${t(response.action === 'skipped' ? 'remember.skipped' : 'remember.completed')}${response.memoryBodyIds.length === 0 ? '' : ` · ${response.memoryBodyIds.join(', ')}`}${response.summary === '' ? '' : ` · ${response.summary}`}`);
            setContent('');
            props.onMutate();
        }
        catch (reason) {
            setResult(t('remember.dispatchFailed', { error: message(reason) }));
        }
        finally {
            setSupervising(false);
        }
    };
    const manualSave = async (event) => {
        event.preventDefault();
        if (content.trim() === '')
            return;
        setSaving(true);
        setResult(null);
        try {
            const response = await props.client.remember({ content, category, importance, tags: tags.split(',').map(value => value.trim()).filter(Boolean), entities: entities.split(',').map(value => value.trim()).filter(Boolean), source: 'user', ...(memoryBodyId === '' ? {} : { memoryBodyId }) });
            const action = typeof response.action === 'string' ? response.action : 'saved';
            const summary = typeof response.summary === 'string' ? response.summary : '';
            setResult(action === 'skipped' ? `${t('remember.skipped')}${summary === '' ? '' : ` · ${summary}`}` : `${t('remember.processed', { action })}${summary === '' ? '' : ` · ${summary}`}`);
            if (action !== 'skipped') {
                setContent('');
                setTags('');
                setEntities('');
                props.onMutate();
            }
        }
        catch (reason) {
            setResult(t('remember.saveFailed', { error: message(reason) }));
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsxs("div", { className: css.page, children: [_jsx(PageHeader, { title: t('remember.title'), description: t('remember.description'), meta: props.writeEnabled ? t('remember.worker') : t('common.readOnly') }), !props.writeEnabled ? _jsx(EmptyState, { glyph: "\u2298", title: t('remember.readOnlyTitle'), children: t('remember.readOnlyText') }) : (_jsxs("div", { className: css.writebackLayout, children: [_jsxs("aside", { className: css.writeGuide, children: [_jsx("h3", { children: t('remember.flowTitle') }), _jsxs("ol", { children: [_jsxs("li", { children: [_jsx("strong", { children: t('remember.routeTitle') }), _jsx("span", { children: t('remember.routeText') })] }), _jsxs("li", { children: [_jsx("strong", { children: t('remember.dedupeTitle') }), _jsx("span", { children: t('remember.dedupeText') })] }), _jsxs("li", { children: [_jsx("strong", { children: t('remember.writeTitle') }), _jsx("span", { children: t('remember.writeText') })] })] }), _jsx("p", { children: t('remember.flowText') })] }), _jsxs("section", { className: css.supervisedComposer, children: [_jsxs("form", { className: css.supervisedForm, onSubmit: event => void supervise(event), children: [_jsxs("div", { className: css.supervisedHeading, children: [_jsx("div", { children: _jsx("h3", { children: t('remember.delegateTitle') }) }), _jsx("span", { className: props.sessionId === undefined ? css.sessionMissing : css.sessionReady, children: props.sessionId === undefined ? t('remember.noSession') : t('remember.ready') })] }), _jsxs("label", { className: css.fieldWide, children: [t('remember.candidate'), _jsx("textarea", { "aria-label": t('remember.candidateAria'), value: content, onChange: event => setContent(event.target.value), maxLength: 8000, rows: 8, placeholder: t('remember.placeholder') })] }), props.sessionId === undefined && _jsx("p", { className: css.sessionHint, children: t('remember.sessionHint') }), _jsxs("div", { className: css.formActions, children: [_jsx("button", { type: "submit", className: css.primaryButton, disabled: supervising || content.trim() === '' || props.sessionId === undefined, children: supervising ? t('remember.processing') : t('remember.action') }), result !== null && _jsx("span", { role: "status", children: result })] })] }), _jsxs("details", { className: css.advancedWrite, children: [_jsxs("summary", { children: [_jsxs("span", { children: [_jsx("strong", { children: t('remember.advanced') }), _jsx("small", { children: t('remember.advancedHint') })] }), _jsx("span", { children: t('remember.expand') })] }), _jsxs("form", { className: css.manualForm, onSubmit: event => void manualSave(event), children: [_jsxs("div", { className: css.formGrid, children: [_jsxs("label", { className: css.fieldWide, children: [t('remember.target'), _jsx("select", { "aria-label": t('remember.target'), value: memoryBodyId, onChange: event => setMemoryBodyId(event.target.value), children: props.memoryBodies.map(body => _jsxs("option", { value: body.id, children: [body.name, " \u00B7 ", body.id, body.active ? ` · ${t('common.active')}` : ''] }, body.id)) })] }), _jsxs("label", { children: [t('common.category'), _jsx("select", { value: category, onChange: event => setCategory(event.target.value), children: CATEGORIES.map(value => _jsx("option", { value: value, children: categoryLabel(t, value) }, value)) })] }), _jsxs("label", { children: [t('common.importanceLabel'), _jsx("select", { value: importance, onChange: event => setImportance(Number(event.target.value)), children: [1, 2, 3, 4, 5].map(value => _jsxs("option", { value: value, children: [value, " / 5"] }, value)) })] }), _jsxs("label", { className: css.fieldWide, children: [t('remember.entities'), _jsx("input", { value: entities, onChange: event => setEntities(event.target.value), placeholder: "SQLite, DSH" })] }), _jsxs("label", { className: css.fieldWide, children: [t('remember.tags'), _jsx("input", { value: tags, onChange: event => setTags(event.target.value), placeholder: "architecture, local-first" })] })] }), _jsxs("div", { className: css.manualActions, children: [_jsx("p", { children: t('remember.advancedText') }), _jsx("button", { type: "submit", className: css.secondaryButton, disabled: saving || content.trim() === '' || props.sessionId === undefined || memoryBodyId === '', children: saving ? t('remember.saving') : t('remember.advancedAction') })] })] })] })] })] }))] }));
}
function ListPage(props) {
    const t = useT();
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('');
    const [view, setView] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setView(await props.client.list({ ...(query.trim() === '' ? {} : { query }), ...(category === '' ? {} : { category }), limit: 1000 }));
        }
        catch (reason) {
            setError(message(reason));
        }
        finally {
            setLoading(false);
        }
    }, [category, props.client, query]);
    useEffect(() => { void load(); }, [props.revision]);
    const submit = (event) => { event.preventDefault(); void load(); };
    const forget = async (insight) => { await props.onForget(insight); setView(current => current === null ? current : { ...current, total: Math.max(0, current.total - 1), items: current.items.filter(item => insightKey(item) !== insightKey(insight)) }); };
    return (_jsxs("div", { className: css.page, children: [_jsx(PageHeader, { title: t('content.title'), description: t('content.description'), meta: t('content.count', { count: view?.total ?? '—' }) }), _jsxs("form", { className: css.listToolbar, onSubmit: submit, children: [_jsx("input", { "aria-label": t('content.filterAria'), value: query, onChange: event => setQuery(event.target.value), placeholder: t('content.filterPlaceholder') }), _jsxs("select", { "aria-label": t('content.categoryAria'), value: category, onChange: event => setCategory(event.target.value), children: [_jsx("option", { value: "", children: t('common.allCategories') }), CATEGORIES.map(value => _jsx("option", { value: value, children: categoryLabel(t, value) }, value))] }), _jsx("button", { type: "submit", className: css.primaryButton, disabled: loading, children: loading ? t('common.loading') : t('content.apply') })] }), _jsx("div", { className: css.listNotice, children: t('content.notice') }), error !== null && _jsx("div", { className: css.inlineError, role: "alert", children: error }), !loading && view?.items.length === 0 && _jsx(EmptyState, { glyph: "\u2261", title: t('content.emptyTitle'), children: t('content.emptyText') }), _jsx("div", { className: css.memoryList, children: view?.items.map(insight => _jsx(InsightCard, { insight: insight, writeEnabled: props.writeEnabled, onForget: forget, onClone: props.onClone, onRelated: () => props.onExplore(insight.content) }, insightKey(insight))) })] }));
}
function DocumentsPage(props) {
    const t = useT();
    const [snapshot, setSnapshot] = useState(null);
    const [items, setItems] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [selected, setSelected] = useState(null);
    const [status, setStatus] = useState('active');
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [notice, setNotice] = useState(null);
    const [composing, setComposing] = useState(false);
    const [editing, setEditing] = useState(false);
    const [confirmArchive, setConfirmArchive] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('');
    const [sources, setSources] = useState('');
    const display = useCallback(async (nextQuery, nextStatus) => {
        setLoading(true);
        setError(null);
        try {
            const current = await props.client.documents();
            const records = nextQuery.trim() === ''
                ? current.documents
                : (await props.client.searchDocuments(nextQuery, nextStatus === 'archived')).results;
            const filtered = records.filter(record => record.status === nextStatus);
            setSnapshot(current);
            setItems(filtered);
            setSelectedId(previous => previous !== null && filtered.some(record => record.id === previous) ? previous : filtered[0]?.id ?? null);
        }
        catch (reason) {
            setError(message(reason));
            setSnapshot(null);
            setItems([]);
            setSelectedId(null);
        }
        finally {
            setLoading(false);
        }
    }, [props.client]);
    useEffect(() => { void display(query, status); }, [display, props.revision, status]);
    useEffect(() => {
        if (selectedId === null) {
            setSelected(null);
            return;
        }
        let active = true;
        void props.client.document(selectedId).then(value => { if (active)
            setSelected(value); }).catch(reason => { if (active)
            setError(message(reason)); });
        return () => { active = false; };
    }, [props.client, selectedId, props.revision]);
    const resetComposer = () => { setTitle(''); setDescription(''); setContent(''); setSources(''); setComposing(false); };
    const sourcePaths = (value) => value.split(/\r?\n|,/gu).map(path => path.trim()).filter(Boolean);
    const create = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);
        setNotice(null);
        try {
            const result = await props.client.mutateDocument({ action: 'create', title, description, content, sourcePaths: sourcePaths(sources) });
            setNotice(result.maintenance === undefined ? t('documents.created') : t('documents.createdAfterArchive', { count: result.maintenance.archivedDocumentIds.length }));
            setStatus('active');
            setQuery('');
            resetComposer();
            props.onMutate();
            await display('', 'active');
            setSelectedId(result.document.id);
        }
        catch (reason) {
            setError(message(reason));
        }
        finally {
            setSaving(false);
        }
    };
    const beginEdit = () => {
        if (selected === null)
            return;
        setTitle(selected.title);
        setDescription(selected.description);
        setContent(selected.content);
        setSources(selected.sourcePaths.join('\n'));
        setEditing(true);
        setComposing(false);
        setConfirmArchive(false);
    };
    const update = async (event) => {
        event.preventDefault();
        if (selected === null)
            return;
        setSaving(true);
        setError(null);
        setNotice(null);
        try {
            const result = await props.client.mutateDocument({ action: 'update', id: selected.id, title, description, content, sourcePaths: sourcePaths(sources) });
            setNotice(result.maintenance === undefined ? t('documents.updated') : t('documents.updatedAfterArchive', { count: result.maintenance.archivedDocumentIds.length }));
            setEditing(false);
            props.onMutate();
            await display(query, status);
            setSelectedId(result.document.id);
        }
        catch (reason) {
            setError(message(reason));
        }
        finally {
            setSaving(false);
        }
    };
    const archive = async () => {
        if (selected === null)
            return;
        setSaving(true);
        setError(null);
        setNotice(null);
        try {
            const result = await props.client.archiveDocument(selected.id);
            setNotice(t('documents.archived', { spaces: result.maintenance?.memoryBodyIds.join(', ') || '—' }));
            setConfirmArchive(false);
            setStatus('archived');
            setQuery('');
            props.onMutate();
            await display('', 'archived');
            setSelectedId(result.document.id);
        }
        catch (reason) {
            setError(message(reason));
        }
        finally {
            setSaving(false);
        }
    };
    const usage = snapshot === null ? 0 : Math.min(100, snapshot.activeBytes / snapshot.limitBytes * 100);
    const activeCount = snapshot?.activeCount ?? 0;
    const archivedCount = snapshot?.archivedCount ?? 0;
    return (_jsxs("div", { className: css.page, children: [_jsx(PageHeader, { title: t('documents.title'), description: t('documents.description'), meta: snapshot === null ? t('common.loading') : t('documents.capacity', { used: humanBytes(snapshot.activeBytes), limit: humanBytes(snapshot.limitBytes) }), action: _jsx("button", { type: "button", className: css.secondaryButton, disabled: loading, onClick: () => void display(query, status), children: t('documents.refresh') }) }), error !== null && _jsx("div", { className: css.inlineError, role: "alert", children: error }), notice !== null && _jsx("div", { className: css.runtimeNotice, role: "status", children: notice }), _jsxs("section", { className: css.documentSummary, "aria-label": t('documents.summary'), children: [_jsxs("article", { children: [_jsx("span", { children: t('documents.active') }), _jsx("strong", { children: activeCount }), _jsx("small", { children: t('documents.activeHint') })] }), _jsxs("article", { children: [_jsx("span", { children: t('documents.archivedCount') }), _jsx("strong", { children: archivedCount }), _jsx("small", { children: t('documents.archivedHint') })] }), _jsxs("article", { className: css.documentCapacity, children: [_jsx("span", { children: t('documents.activeCapacity') }), _jsx("strong", { children: snapshot === null ? '—' : `${usage.toFixed(1)}%` }), _jsx("div", { children: _jsx("i", { style: { width: `${usage}%` } }) }), _jsx("small", { children: t('documents.capacityHint') })] })] }), _jsxs("section", { className: css.documentToolbar, children: [_jsxs("form", { onSubmit: event => { event.preventDefault(); void display(query, status); }, children: [_jsx("span", { "aria-hidden": "true", children: "\u2315" }), _jsx("input", { "aria-label": t('documents.searchAria'), value: query, onChange: event => setQuery(event.target.value), placeholder: t('documents.searchPlaceholder') }), _jsx("button", { type: "submit", className: css.secondaryButton, children: t('documents.search') })] }), _jsxs("div", { role: "group", "aria-label": t('documents.scope'), children: [_jsxs("button", { type: "button", "data-active": status === 'active' || undefined, onClick: () => setStatus('active'), children: [t('documents.active'), " ", _jsx("b", { children: activeCount })] }), _jsxs("button", { type: "button", "data-active": status === 'archived' || undefined, onClick: () => setStatus('archived'), children: [t('documents.archivedCount'), " ", _jsx("b", { children: archivedCount })] })] }), props.writeEnabled && props.sessionId !== undefined && _jsx("button", { type: "button", className: css.primaryButton, onClick: () => { setComposing(value => !value); setEditing(false); }, children: composing ? t('common.cancel') : t('documents.new') })] }), composing && _jsxs("form", { className: css.documentEditor, onSubmit: event => void create(event), children: [_jsxs("header", { children: [_jsxs("div", { children: [_jsx("h3", { children: t('documents.newTitle') }), _jsx("p", { children: t('documents.editorHint') })] }), _jsx("span", { children: t('documents.managedCopy') })] }), _jsxs("div", { className: css.documentEditorMeta, children: [_jsxs("label", { children: [t('documents.name'), _jsx("input", { value: title, onChange: event => setTitle(event.target.value), required: true })] }), _jsxs("label", { children: [t('documents.routing'), _jsx("input", { value: description, onChange: event => setDescription(event.target.value) })] })] }), _jsxs("label", { children: [t('documents.sources'), _jsx("input", { value: sources, onChange: event => setSources(event.target.value), placeholder: t('documents.sourcesPlaceholder') })] }), _jsxs("label", { children: [t('documents.markdown'), _jsx("textarea", { value: content, onChange: event => setContent(event.target.value), rows: 10, required: true })] }), _jsxs("footer", { children: [_jsx("button", { type: "button", className: css.ghostButton, onClick: resetComposer, children: t('common.cancel') }), _jsx("button", { type: "submit", className: css.primaryButton, disabled: saving || title.trim() === '' || content.trim() === '', children: saving ? t('documents.saving') : t('documents.create') })] })] }), _jsxs("div", { className: css.documentWorkspace, children: [_jsxs("aside", { className: css.documentList, "aria-label": t('documents.list'), children: [_jsxs("header", { children: [_jsx("span", { children: status === 'active' ? t('documents.activeList') : t('documents.archiveList') }), _jsx("code", { children: items.length })] }), items.map(document => _jsxs("button", { type: "button", "data-selected": selectedId === document.id || undefined, onClick: () => { setSelectedId(document.id); setEditing(false); setConfirmArchive(false); }, children: [_jsxs("div", { children: [_jsx("strong", { children: document.title }), _jsx("time", { dateTime: document.updatedAt, children: new Date(document.updatedAt).toLocaleDateString() })] }), _jsx("p", { children: document.description || document.excerpt || t('documents.noDescription') }), _jsxs("footer", { children: [_jsx("span", { children: humanBytes(document.sizeBytes) }), _jsx("code", { children: document.id.slice(0, 8) }), document.healthy === false && _jsx("em", { children: t('documents.missing') })] })] }, document.id)), !loading && items.length === 0 && _jsxs("div", { className: css.documentListEmpty, children: [_jsx("span", { children: "\u25A4" }), _jsx("strong", { children: status === 'active' ? t('documents.emptyActive') : t('documents.emptyArchived') }), _jsx("p", { children: status === 'active' ? t('documents.emptyActiveText') : t('documents.emptyArchivedText') })] }), loading && _jsx("div", { className: css.loading, children: t('common.loading') })] }), _jsx("section", { className: css.documentReader, "aria-label": t('documents.reader'), children: selected === null ? _jsx(EmptyState, { glyph: "\u25A4", title: t('documents.selectTitle'), children: t('documents.selectText') }) : editing ? _jsxs("form", { className: css.documentEditor, onSubmit: event => void update(event), children: [_jsxs("header", { children: [_jsxs("div", { children: [_jsx("h3", { children: t('documents.editTitle') }), _jsx("p", { children: t('documents.editorHint') })] }), _jsx("code", { children: selected.id })] }), _jsxs("div", { className: css.documentEditorMeta, children: [_jsxs("label", { children: [t('documents.name'), _jsx("input", { value: title, onChange: event => setTitle(event.target.value), required: true })] }), _jsxs("label", { children: [t('documents.routing'), _jsx("input", { value: description, onChange: event => setDescription(event.target.value) })] })] }), _jsxs("label", { children: [t('documents.sources'), _jsx("input", { value: sources, onChange: event => setSources(event.target.value) })] }), _jsxs("label", { children: [t('documents.markdown'), _jsx("textarea", { value: content, onChange: event => setContent(event.target.value), rows: 18, required: true })] }), _jsxs("footer", { children: [_jsx("button", { type: "button", className: css.ghostButton, onClick: () => setEditing(false), children: t('common.cancel') }), _jsx("button", { type: "submit", className: css.primaryButton, disabled: saving, children: saving ? t('documents.saving') : t('documents.save') })] })] }) : _jsxs("article", { className: css.documentDetail, children: [_jsxs("header", { children: [_jsxs("div", { children: [_jsx("span", { children: selected.status === 'active' ? t('documents.active') : t('documents.coldArchive') }), _jsx("h3", { children: selected.title }), _jsx("p", { children: selected.description || t('documents.noDescription') })] }), _jsx("div", { children: props.writeEnabled && selected.status === 'active' && _jsx("button", { type: "button", className: css.secondaryButton, onClick: beginEdit, children: t('documents.edit') }) })] }), _jsxs("dl", { children: [_jsxs("div", { children: [_jsx("dt", { children: t('documents.path') }), _jsx("dd", { children: _jsx("code", { children: selected.relativePath }) })] }), _jsxs("div", { children: [_jsx("dt", { children: t('documents.revision') }), _jsx("dd", { children: selected.revision })] }), _jsxs("div", { children: [_jsx("dt", { children: t('documents.hash') }), _jsx("dd", { children: _jsx("code", { children: selected.contentHash.slice(0, 16) }) })] }), _jsxs("div", { children: [_jsx("dt", { children: t('documents.size') }), _jsx("dd", { children: humanBytes(selected.sizeBytes) })] })] }), selected.sourcePaths.length > 0 && _jsxs("div", { className: css.documentSources, children: [_jsx("span", { children: t('documents.sources') }), selected.sourcePaths.map(path => _jsx("code", { children: path }, path))] }), selected.status === 'archived' && _jsxs("div", { className: css.documentArchiveReceipt, children: [_jsx("strong", { children: t('documents.archiveReceipt') }), _jsx("p", { children: selected.archiveSummary }), _jsx("div", { children: selected.memoryBodyIds.map(id => _jsx("code", { children: id }, id)) })] }), _jsx("pre", { children: selected.content }), props.writeEnabled && selected.status === 'active' && _jsx("footer", { className: css.documentDanger, children: confirmArchive ? _jsxs(_Fragment, { children: [_jsx("span", { children: t('documents.archiveConfirm') }), _jsx("button", { type: "button", className: css.dangerSolidButton, disabled: saving, onClick: () => void archive(), children: saving ? t('documents.archiving') : t('documents.archiveNow') }), _jsx("button", { type: "button", className: css.ghostButton, onClick: () => setConfirmArchive(false), children: t('common.cancel') })] }) : _jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("strong", { children: t('documents.archiveTitle') }), _jsx("p", { children: t('documents.archiveDescription') })] }), _jsx("button", { type: "button", className: css.dangerButton, onClick: () => setConfirmArchive(true), children: t('documents.archive') })] }) })] }) })] }), _jsx("p", { className: css.runtimeFootnote, children: t('documents.footnote') })] }));
}
function StatusPage(props) {
    const t = useT();
    const status = props.status;
    const lifecycle = status?.lifecycle;
    const current = lifecycle?.current;
    const workers = lifecycle?.subagents;
    const documents = status?.documents;
    const reviewActivity = current?.reviewActivity;
    const reviewThreshold = reviewActivity?.threshold ?? QODERWORK_REVIEW_POLICY.reviewThreshold;
    const catalogKnown = status?.memoryBodies !== undefined;
    const memoryBodies = useMemo(() => status?.memoryBodies ?? [], [status]);
    const activeBodies = memoryBodies.filter(body => body.active).length;
    const latest = current?.lastAt === undefined ? t('status.noActivity') : new Date(current.lastAt).toLocaleString();
    const phase = current?.lastPhase === undefined || current.lastPhase === 'idle' ? t('status.phaseIdle') : current.lastPhase === 'supervised' ? t('status.phaseSupervised') : current.lastPhase === 'error' ? t('status.phaseError') : current.lastPhase === 'prime' ? t('status.prime') : current.lastPhase === 'recall' ? t('status.recallWorker') : current.lastPhase === 'review' ? t('status.phaseReview') : t('status.writeWorker');
    const reviewState = current?.reviewRunning === true
        ? t('status.reviewRunning')
        : current?.idleReviewPending === true
            ? t('status.reviewPending')
            : reviewActivity?.eligible === true
                ? t('status.reviewQualified')
                : t('status.reviewAccumulating');
    const lastReview = current?.lastReviewAt === undefined ? t('status.noReview') : t('status.reviewAt', { time: new Date(current.lastReviewAt).toLocaleTimeString(), action: current.lastReviewAction ?? '—', score: current.lastReviewScore ?? '—' });
    return (_jsxs("div", { className: css.page, children: [_jsx(PageHeader, { title: t('status.title'), description: t('status.description'), meta: status?.healthy === true && lifecycle?.sessionAvailable === true ? t('status.nominal') : t('status.checkRequired'), action: _jsx("button", { type: "button", className: css.secondaryButton, onClick: props.onRefresh, children: props.loading ? t('status.rechecking') : t('status.recheck') }) }), _jsxs("section", { className: css.healthStrip, "aria-label": t('status.aria'), children: [_jsxs("article", { children: [_jsx("span", { className: `${css.healthIndicator} ${status?.healthy === true ? css.healthGood : css.healthBad}` }), _jsxs("div", { children: [_jsx("small", { children: t('status.engine') }), _jsx("strong", { children: status?.healthy === true ? t('status.engineConnected') : t('status.engineUnavailable') }), _jsx("p", { children: status?.version === undefined ? t('status.versionWaiting') : `CLI ${status.version}` })] })] }), _jsxs("article", { children: [_jsx("span", { className: `${css.healthIndicator} ${activeBodies > 0 ? css.healthGood : css.healthMuted}` }), _jsxs("div", { children: [_jsx("small", { children: t('status.spaces') }), _jsx("strong", { children: catalogKnown ? t('status.activeRatio', { active: activeBodies, total: memoryBodies.length }) : t('status.directoryUnsynced') }), _jsx("p", { children: t('status.activeMemories', { count: status?.stats?.totalInsights ?? 0 }) })] })] }), _jsxs("article", { children: [_jsx("span", { className: `${css.healthIndicator} ${documents === undefined ? css.healthMuted : css.healthGood}` }), _jsxs("div", { children: [_jsx("small", { children: t('status.documents') }), _jsx("strong", { children: documents === undefined ? t('status.documentsWaiting') : t('status.documentRatio', { active: documents.activeCount, archived: documents.archivedCount }) }), _jsx("p", { children: documents === undefined ? t('status.documentsSession') : t('status.documentUsage', { used: humanBytes(documents.activeBytes), limit: humanBytes(documents.limitBytes) }) })] })] }), _jsxs("article", { children: [_jsx("span", { className: `${css.healthIndicator} ${lifecycle?.sessionAvailable === true ? css.healthGood : css.healthBad}` }), _jsxs("div", { children: [_jsx("small", { children: t('status.router') }), _jsx("strong", { children: lifecycle?.sessionAvailable === true ? t('status.routerReady') : t('status.sessionMissing') }), _jsx("p", { children: workers === undefined ? t('status.orchestrationWaiting') : t('status.workerCounts', { recalls: workers.recalls, answers: workers.answers ?? 0, reviews: workers.reviews ?? 0, documentArchives: workers.documentArchives ?? 0, compactions: workers.compactions ?? 0, migrations: workers.migrations ?? 0, writes: workers.writes }) })] })] })] }), _jsxs("div", { className: css.statusLayout, children: [_jsxs("section", { className: css.lifecyclePanel, children: [_jsxs("div", { className: css.statusSectionHeader, children: [_jsxs("div", { children: [_jsx("h3", { children: t('status.lifecycle') }), _jsx("p", { children: t('status.lifecycleText') })] }), _jsx("span", { className: css.phaseBadge, children: phase })] }), _jsxs("div", { className: css.lifecycleFlow, children: [_jsxs("article", { children: [_jsx("span", { children: "01" }), _jsxs("div", { children: [_jsx("strong", { children: t('status.prime') }), _jsx("p", { children: t('status.primeText') })] }), _jsx("code", { children: lifecycle?.counters.primes ?? 0 })] }), _jsxs("article", { "data-disabled": lifecycle?.recallMode === 'off' || undefined, children: [_jsx("span", { children: "02" }), _jsxs("div", { children: [_jsx("strong", { children: t('status.recallWorker') }), _jsx("p", { children: lifecycle?.recallMode === 'guided' ? t('status.recallText') : t('status.recallOff') })] }), _jsx("code", { children: workers?.recalls ?? 0 })] }), _jsxs("article", { "data-disabled": lifecycle?.writebackMode === 'off' || undefined, children: [_jsx("span", { children: "03" }), _jsxs("div", { children: [_jsx("strong", { children: t('status.writeWorker') }), _jsx("p", { children: lifecycle?.writebackMode === 'guided' ? t('status.writeText', { threshold: reviewThreshold, seconds: Math.round((lifecycle.idleReviewMs ?? 0) / 1000) }) : t('status.writeOff') })] }), _jsx("code", { children: workers?.reviews ?? 0 })] })] }), _jsxs("div", { className: css.lifecycleFoot, children: [_jsxs("span", { children: [t('status.activityScore'), " ", _jsxs("strong", { children: [reviewActivity?.score ?? 0, " / ", reviewThreshold] })] }), _jsxs("span", { children: [t('status.activitySignals'), " ", _jsx("strong", { children: t('status.activitySignalValues', { chars: reviewActivity?.totalUserTextLength ?? 0, turns: reviewActivity?.turnCount ?? 0, tools: reviewActivity?.toolCallCount ?? 0, unique: reviewActivity?.uniqueToolCount ?? 0 }) })] }), _jsxs("span", { children: [t('status.reviewState'), " ", _jsx("strong", { children: reviewState })] }), _jsxs("span", { children: [t('status.latestPhase'), " ", _jsx("strong", { children: phase })] }), _jsxs("span", { children: [t('status.lastReview'), " ", _jsx("strong", { children: lastReview })] }), _jsxs("span", { children: [t('status.reviewDocuments'), " ", _jsx("strong", { children: current?.lastReviewDocumentIds?.length ?? 0 })] }), _jsxs("span", { children: [t('status.workerFailures'), " ", _jsx("strong", { children: workers?.failures ?? 0 })] })] }), current?.lastError !== undefined && _jsxs("div", { className: css.inlineError, role: "alert", children: ["Lifecycle\uFF1A", current.lastError] })] }), _jsxs("aside", { className: css.diagnosticsPanel, children: [_jsx("div", { className: css.statusSectionHeader, children: _jsx("div", { children: _jsx("h3", { children: t('status.quickDiagnostics') }) }) }), _jsxs("ul", { className: css.diagnosticList, children: [_jsxs("li", { "data-ok": status?.commandFound || undefined, children: [_jsx("span", {}), status?.commandFound ? t('status.cliExecutable') : t('status.cliMissing')] }), _jsxs("li", { "data-ok": catalogKnown && activeBodies > 0 || undefined, children: [_jsx("span", {}), catalogKnown ? t('status.readingSpaces', { count: activeBodies }) : t('status.directoryWaiting')] }), _jsxs("li", { "data-ok": lifecycle?.sessionAvailable || undefined, children: [_jsx("span", {}), lifecycle?.sessionAvailable ? t('status.webAgentReady') : t('status.liveSessionMissing')] }), _jsxs("li", { "data-ok": documents !== undefined || undefined, children: [_jsx("span", {}), documents === undefined ? t('status.documentsUnavailable') : t('status.documentsHealthy', { count: documents.activeCount })] }), _jsxs("li", { "data-ok": (lifecycle?.counters.failures ?? 0) === 0 || undefined, children: [_jsx("span", {}), t('status.lifecycleFailures', { count: lifecycle?.counters.failures ?? 0 })] })] }), _jsxs("div", { className: css.nativeAccess, children: [_jsx("h3", { children: t('status.nativeAccess') }), _jsx("code", { children: "/mnemon status" }), _jsx("code", { children: "/mnemon recall <query>" }), _jsx("p", { children: t('status.nativeAccessText') })] })] })] }), _jsxs("section", { className: css.runtimeDetails, children: [_jsxs("div", { className: css.statusSectionHeader, children: [_jsx("div", { children: _jsx("h3", { children: t('status.engineStorage') }) }), _jsx("span", { className: `${css.runtimeBadge} ${status?.healthy === true ? css.runtimeOnline : css.runtimeOffline}`, children: status?.healthy === true ? t('status.online') : t('status.offline') })] }), _jsxs("dl", { children: [_jsxs("div", { children: [_jsx("dt", { children: "CLI" }), _jsx("dd", { children: _jsx("code", { children: status?.cliPath ?? 'mnemon' }) })] }), _jsxs("div", { children: [_jsx("dt", { children: t('status.mnemonVersion') }), _jsx("dd", { children: status?.version ?? '—' })] }), _jsxs("div", { children: [_jsx("dt", { children: t('status.directory') }), _jsx("dd", { children: _jsx("code", { children: status?.memoryBodyDirectory ?? '—' }) })] }), _jsxs("div", { children: [_jsx("dt", { children: t('status.activeDbSize') }), _jsx("dd", { children: status?.stats === undefined ? '—' : humanBytes(status.stats.dbSizeBytes) })] }), _jsxs("div", { children: [_jsx("dt", { children: t('term.spaces') }), _jsx("dd", { children: catalogKnown ? t('common.count', { count: memoryBodies.length }) : '—' })] }), _jsxs("div", { children: [_jsx("dt", { children: t('status.activeCount') }), _jsx("dd", { children: catalogKnown ? t('common.count', { count: activeBodies }) : '—' })] }), _jsxs("div", { children: [_jsx("dt", { children: t('telemetry.memories') }), _jsx("dd", { children: status?.stats?.totalInsights ?? '—' })] }), _jsxs("div", { children: [_jsx("dt", { children: t('status.activeGraphEdges') }), _jsx("dd", { children: status?.stats?.edgeCount ?? '—' })] }), _jsxs("div", { children: [_jsx("dt", { children: t('status.documentDirectory') }), _jsx("dd", { children: _jsx("code", { children: documents?.directory ?? '—' }) })] }), _jsxs("div", { children: [_jsx("dt", { children: t('status.activeDocuments') }), _jsx("dd", { children: documents?.activeCount ?? '—' })] }), _jsxs("div", { children: [_jsx("dt", { children: t('status.coldDocuments') }), _jsx("dd", { children: documents?.archivedCount ?? '—' })] }), _jsxs("div", { children: [_jsx("dt", { children: t('status.documentCapacity') }), _jsx("dd", { children: documents === undefined ? '—' : `${humanBytes(documents.activeBytes)} / ${humanBytes(documents.limitBytes)}` })] })] })] })] }));
}
export function MnemonView(props) {
    return _jsx(I18nContext.Provider, { value: props.t ?? translateZh, children: _jsx(MnemonWorkspace, { ...props }) });
}
function MnemonWorkspace({ connection, sessionId }) {
    const t = useT();
    const client = useMemo(() => new MnemonClient(connection, sessionId), [connection, sessionId]);
    const [page, setPage] = useState('overview');
    const [status, setStatus] = useState(null);
    const [statusLoading, setStatusLoading] = useState(true);
    const [statusError, setStatusError] = useState(null);
    const [revision, setRevision] = useState(0);
    const [searchSeed, setSearchSeed] = useState('');
    const [rememberSeed, setRememberSeed] = useState('');
    const loadStatus = useCallback(async () => {
        setStatusLoading(true);
        setStatusError(null);
        try {
            setStatus(await client.status());
        }
        catch (reason) {
            setStatusError(message(reason));
        }
        finally {
            setStatusLoading(false);
        }
    }, [client]);
    useEffect(() => { void loadStatus(); }, [loadStatus]);
    const mutate = useCallback(() => { setRevision(value => value + 1); void loadStatus(); }, [loadStatus]);
    const forget = useCallback(async (insight) => { await client.forget(insight.id, insight.memoryBodyId); mutate(); }, [client, mutate]);
    const explore = useCallback((query) => { setSearchSeed(query); setPage('explore'); }, []);
    const clone = useCallback((insight) => { setRememberSeed(insight.content); setPage('remember'); }, []);
    const refreshAll = () => { setRevision(value => value + 1); void loadStatus(); };
    const writeEnabled = status?.writeEnabled === true;
    const stats = status?.stats;
    const catalogKnown = status?.memoryBodies !== undefined;
    const memoryBodies = useMemo(() => status?.memoryBodies ?? [], [status]);
    const activeBodies = memoryBodies.filter(body => body.active).length;
    return (_jsxs("main", { className: css.shell, children: [_jsxs("header", { className: css.masthead, children: [_jsxs("div", { className: css.brand, children: [_jsx(MnemonLogo, { className: css.brandLogo }), _jsx("h1", { children: "Mnemon" })] }), _jsxs("section", { className: css.telemetry, "aria-label": t('telemetry.aria'), children: [_jsxs("div", { className: css.telemetryMetric, children: [_jsx("span", { children: t('telemetry.memories') }), _jsx("strong", { children: stats?.totalInsights ?? '—' })] }), _jsxs("div", { className: css.telemetryMetric, children: [_jsx("span", { children: t('telemetry.graph') }), _jsx("strong", { children: stats?.edgeCount ?? '—' })] }), _jsxs("div", { className: css.telemetryMetric, children: [_jsx("span", { children: t('telemetry.entities') }), _jsx("strong", { children: stats?.topEntities.length ?? '—' })] }), _jsxs("div", { className: css.telemetryMetric, children: [_jsx("span", { children: t('telemetry.spaces') }), _jsx("strong", { children: status === null || !catalogKnown ? '—' : activeBodies })] })] }), _jsxs("div", { className: css.statusCluster, children: [_jsx("span", { className: `${css.statusDot} ${status?.healthy === true ? css.online : css.offline}` }), _jsx("span", { children: statusLoading ? t('header.checking') : status?.healthy === true ? catalogKnown ? t('header.connected', { count: activeBodies }) : t('header.directoryPending') : t('header.unavailable') }), _jsx("button", { type: "button", className: css.iconButton, onClick: refreshAll, "aria-label": t('common.refresh'), children: "\u21BB" })] })] }), (statusError !== null || status?.healthy === false) && _jsxs("div", { className: css.alert, role: "alert", children: [_jsx("strong", { children: t('header.notReady') }), _jsx("span", { children: statusError ?? status?.error })] }), _jsxs("div", { className: css.workspace, children: [_jsxs("div", { className: css.topNavigation, children: [_jsx("nav", { className: css.nav, "aria-label": t('nav.aria'), children: PAGE_NAV.map(item => _jsxs("button", { type: "button", "aria-current": page === item.id ? 'page' : undefined, onClick: () => setPage(item.id), children: [_jsx("span", { className: css.navGlyph, "aria-hidden": "true", children: item.glyph }), _jsxs("span", { children: [_jsx("strong", { children: t(item.label) }), _jsx("small", { children: t(item.detail) })] })] }, item.id)) }), _jsxs("div", { className: css.spaceSummary, children: [_jsx("span", { children: t('sidebar.activeSpaces') }), _jsx("code", { children: catalogKnown ? `${activeBodies} / ${memoryBodies.length}` : '— / —' }), _jsx("small", { children: writeEnabled ? t('common.agentSupervised') : t('common.readOnly') })] })] }), _jsxs("section", { className: css.canvas, children: [page === 'overview' && _jsx(OverviewPage, { client: client, revision: revision, writeEnabled: writeEnabled, fallbackBodies: memoryBodies, fallbackDirectory: status?.memoryBodyDirectory, catalogKnown: catalogKnown, onMutate: mutate, onExplore: explore }), page === 'runtime' && _jsx(RuntimePage, { client: client, revision: revision, writeEnabled: writeEnabled, onMutate: mutate }), page === 'documents' && _jsx(DocumentsPage, { client: client, revision: revision, writeEnabled: writeEnabled, ...(sessionId === undefined ? {} : { sessionId }), onMutate: mutate }), page === 'explore' && _jsx(ExplorePage, { client: client, status: status, seed: searchSeed, writeEnabled: writeEnabled, onForget: forget }), page === 'entities' && _jsx(EntitiesPage, { client: client, revision: revision, writeEnabled: writeEnabled, onForget: forget, onExplore: explore }), page === 'remember' && _jsx(RememberPage, { client: client, sessionId: sessionId, memoryBodies: status?.memoryBodies ?? [], writeEnabled: writeEnabled, seed: rememberSeed, onMutate: mutate }), page === 'list' && _jsx(ListPage, { client: client, revision: revision, writeEnabled: writeEnabled, onForget: forget, onClone: clone, onExplore: explore }), page === 'status' && _jsx(StatusPage, { status: status, loading: statusLoading, onRefresh: () => void loadStatus() })] })] })] }));
}
//# sourceMappingURL=MnemonView.js.map