import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CATEGORIES, } from "../service.js";
import { MnemonClient } from "./api.js";
import { MnemonLogo } from "./MnemonLogo.js";
import { MnemonSettingsCard } from "./MnemonSettingsCard.js";
import css from './MnemonView.module.css';
const PAGE_NAV = [
    { id: 'overview', label: '总览', detail: '实时记忆图谱', glyph: '◇' },
    { id: 'explore', label: '检索', detail: '意图增强召回', glyph: '⌕' },
    { id: 'entities', label: '实体', detail: '关系与上下文', glyph: '◎' },
    { id: 'remember', label: '沉淀', detail: 'LLM 监督写回', glyph: '+' },
    { id: 'list', label: '记忆库', detail: '浏览与维护', glyph: '≡' },
    { id: 'status', label: '状态', detail: '配置与诊断', glyph: '⌘' },
];
const CATEGORY_LABELS = {
    decision: '决策',
    preference: '偏好',
    fact: '事实',
    insight: '洞察',
    context: '上下文',
    general: '通用',
};
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
function PageHeader(props) {
    return (_jsxs("div", { className: css.pageHeader, children: [_jsxs("div", { children: [_jsx("span", { children: props.kicker }), _jsx("h2", { children: props.title }), _jsx("p", { children: props.description })] }), _jsxs("div", { className: css.pageHeaderMeta, children: [props.meta !== undefined && _jsx("code", { children: props.meta }), props.action] })] }));
}
function EmptyState(props) {
    return (_jsxs("div", { className: css.emptyState, children: [_jsx("div", { className: css.emptyGlyph, "aria-hidden": "true", children: _jsx("span", { children: props.glyph }) }), _jsxs("div", { children: [_jsx("h3", { children: props.title }), _jsx("p", { children: props.children })] })] }));
}
function InsightCard(props) {
    const [confirming, setConfirming] = useState(false);
    const [forgetting, setForgetting] = useState(false);
    const { insight } = props;
    const meta = [
        insight.category !== undefined ? CATEGORY_LABELS[insight.category] ?? insight.category : undefined,
        insight.importance !== undefined ? `重要性 ${insight.importance}` : undefined,
        insight.score !== undefined ? `score ${insight.score.toFixed(3)}` : undefined,
        insight.depth !== undefined ? `${insight.depth} 跳` : undefined,
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
    return (_jsxs("article", { className: css.insightCard, children: [_jsxs("div", { className: css.cardTop, children: [_jsx("div", { className: css.badges, children: meta.map(entry => _jsx("span", { className: css.badge, children: entry }, entry)) }), _jsx("code", { className: css.id, title: insight.id, children: insight.id.slice(0, 8) })] }), _jsx("p", { className: css.content, children: insight.content }), (insight.tags?.length ?? 0) > 0 && _jsx("div", { className: css.tags, children: insight.tags.map(tag => _jsxs("span", { children: ["#", tag] }, tag)) }), (insight.entities?.length ?? 0) > 0 && _jsx("div", { className: css.entities, children: insight.entities.map(entity => _jsx("span", { children: entity }, entity)) }), _jsx("div", { className: css.cardActions, children: confirming ? (_jsxs("div", { className: css.confirmBar, role: "group", "aria-label": "\u786E\u8BA4\u5FD8\u8BB0\u8BB0\u5FC6", children: [_jsx("span", { children: "\u8F6F\u5220\u9664\u8FD9\u6761\u8BB0\u5FC6\uFF1F" }), _jsx("button", { type: "button", className: css.dangerSolidButton, disabled: forgetting, onClick: () => void forget(), children: forgetting ? '处理中…' : '确认忘记' }), _jsx("button", { type: "button", className: css.ghostButton, disabled: forgetting, onClick: () => setConfirming(false), children: "\u53D6\u6D88" })] })) : (_jsxs(_Fragment, { children: [props.onRelated !== undefined && _jsx("button", { type: "button", className: css.ghostButton, onClick: () => props.onRelated?.(insight), children: "\u67E5\u770B\u5173\u8054" }), props.onClone !== undefined && _jsx("button", { type: "button", className: css.ghostButton, onClick: () => props.onClone?.(insight), children: "\u57FA\u4E8E\u6B64\u65B0\u5EFA" }), _jsx("button", { type: "button", className: css.ghostButton, onClick: () => void navigator.clipboard?.writeText(insight.id), children: "\u590D\u5236 ID" }), props.writeEnabled && _jsx("button", { type: "button", className: css.dangerButton, onClick: () => setConfirming(true), children: "\u5FD8\u8BB0" })] })) })] }));
}
const GRAPH_WIDTH = 930;
const GRAPH_HEIGHT = 520;
const GRAPH_MARGIN_X = 58;
const GRAPH_MARGIN_Y = 58;
const CATEGORY_ORDER = ['preference', 'decision', 'fact', 'insight', 'context', 'general'];
function hash(value) {
    let result = 2166136261;
    for (const char of value)
        result = Math.imul(result ^ char.charCodeAt(0), 16777619);
    return result >>> 0;
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
            const seed = hash(node.id);
            const angle = index * 2.399963 + ((seed % 37) / 37) * .4;
            const radius = items.length === 1 ? 0 : 24 + Math.sqrt(index + 1) * 35;
            positions.set(node.id, clampGraphPosition({ x: anchor.x + Math.cos(angle) * radius, y: anchor.y + Math.sin(angle) * radius }));
        });
    }
    const velocities = new Map(nodes.map(node => [node.id, { x: 0, y: 0 }]));
    const visibleIds = new Set(nodes.map(node => node.id));
    const visibleEdges = edges.filter(edge => visibleIds.has(edge.sourceId) && visibleIds.has(edge.targetId));
    for (let iteration = 0; iteration < 150; iteration += 1) {
        const cooling = 1 - iteration / 180;
        for (let leftIndex = 0; leftIndex < nodes.length; leftIndex += 1) {
            const left = nodes[leftIndex];
            const leftPosition = positions.get(left.id);
            const leftVelocity = velocities.get(left.id);
            for (let rightIndex = leftIndex + 1; rightIndex < nodes.length; rightIndex += 1) {
                const right = nodes[rightIndex];
                const rightPosition = positions.get(right.id);
                const rightVelocity = velocities.get(right.id);
                let dx = leftPosition.x - rightPosition.x;
                let dy = leftPosition.y - rightPosition.y;
                if (dx === 0 && dy === 0) {
                    dx = ((hash(left.id) % 13) - 6) || 1;
                    dy = ((hash(right.id) % 11) - 5) || -1;
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
            const desired = (edge.type === 'entity' ? 94 : edge.type === 'semantic' ? 118 : 106) * sparseScale;
            const spring = (distance - desired) * .018 * cooling;
            const forceX = (dx / distance) * spring;
            const forceY = (dy / distance) * spring;
            sourceVelocity.x += forceX;
            sourceVelocity.y += forceY;
            targetVelocity.x -= forceX;
            targetVelocity.y -= forceY;
        }
        for (const node of nodes) {
            const position = positions.get(node.id);
            const velocity = velocities.get(node.id);
            const anchor = anchors.get(node.category ?? 'general') ?? { x: GRAPH_WIDTH / 2, y: GRAPH_HEIGHT / 2 };
            velocity.x += (anchor.x - position.x) * .0035 * cooling + (GRAPH_WIDTH / 2 - position.x) * .0008;
            velocity.y += (anchor.y - position.y) * .0035 * cooling + (GRAPH_HEIGHT / 2 - position.y) * .0008;
            velocity.x = Math.max(-12, Math.min(12, velocity.x * .76));
            velocity.y = Math.max(-12, Math.min(12, velocity.y * .76));
            positions.set(node.id, clampGraphPosition({ x: position.x + velocity.x, y: position.y + velocity.y }));
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
        positions.set(node.id, {
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
    const visibleNodes = useMemo(() => props.graph.nodes.slice(0, 60), [props.graph.nodes]);
    const visibleIds = useMemo(() => new Set(visibleNodes.map(node => node.id)), [visibleNodes]);
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
    const layoutKey = `${visibleNodes.map(node => `${node.id}:${node.category ?? 'general'}`).join('|')}::${edges.map(edge => `${edge.sourceId}>${edge.targetId}:${edge.type ?? 'temporal'}`).join('|')}`;
    const naturalLayout = useMemo(() => naturalGraphPositions(visibleNodes, edges), [layoutKey]);
    const [positions, setPositions] = useState(() => naturalLayout);
    const [layoutMode, setLayoutMode] = useState('natural');
    const positionsRef = useRef(positions);
    const animationRef = useRef(null);
    const dragRef = useRef(null);
    const suppressClickRef = useRef(false);
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
        event.preventDefault();
        cancelAnimation();
        dragRef.current = { nodeId, pointerId: event.pointerId, moved: false };
        event.currentTarget.setPointerCapture?.(event.pointerId);
    };
    const moveDrag = (event) => {
        const drag = dragRef.current;
        const svg = event.currentTarget.ownerSVGElement;
        if (drag === null || svg === null || drag.pointerId !== event.pointerId)
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
        suppressClickRef.current = drag.moved;
        dragRef.current = null;
        event.currentTarget.releasePointerCapture?.(event.pointerId);
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
    const layoutLabel = layoutMode === 'natural' ? '自然布局' : layoutMode === 'uniform' ? '均匀布局' : '自定义布局';
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: css.graphCanvasControls, role: "toolbar", "aria-label": "\u56FE\u8C31\u5E03\u5C40", children: [_jsxs("span", { role: "status", "aria-label": `布局状态：${layoutLabel}`, children: [_jsx("i", {}), layoutLabel, " \u00B7 \u53EF\u62D6\u62FD"] }), _jsx("button", { type: "button", "data-active": layoutMode === 'natural' || undefined, onClick: () => animateTo(naturalGraphPositions(visibleNodes, edges), 'natural'), children: "\u81EA\u7136\u94FA\u5F00" }), _jsx("button", { type: "button", "data-active": layoutMode === 'uniform' || undefined, onClick: () => animateTo(uniformGraphPositions(visibleNodes), 'uniform'), children: "\u5747\u5300\u91CD\u7F6E" })] }), _jsxs("svg", { className: css.graphSvg, viewBox: `0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`, role: "img", "data-layout": layoutMode, "data-density": visibleNodes.length <= 12 ? 'sparse' : 'dense', "aria-label": `Mnemon 实时记忆图谱，${props.graph.nodes.length} 个节点，${props.graph.edges.length} 条连接`, children: [_jsxs("defs", { children: [_jsx("pattern", { id: "mnemon-grid", width: "26", height: "26", patternUnits: "userSpaceOnUse", children: _jsx("path", { d: "M 26 0 L 0 0 0 26", className: css.graphGridLine, fill: "none" }) }), _jsxs("filter", { id: "mnemon-glow", x: "-100%", y: "-100%", width: "300%", height: "300%", children: [_jsx("feGaussianBlur", { stdDeviation: "4", result: "blur" }), _jsxs("feMerge", { children: [_jsx("feMergeNode", { in: "blur" }), _jsx("feMergeNode", { in: "SourceGraphic" })] })] })] }), _jsx("rect", { width: GRAPH_WIDTH, height: GRAPH_HEIGHT, className: css.graphBackdrop }), _jsx("rect", { width: GRAPH_WIDTH, height: GRAPH_HEIGHT, fill: "url(#mnemon-grid)" }), curvedEdges.map(({ edge, offset }, index) => {
                        const source = positions.get(edge.sourceId);
                        const target = positions.get(edge.targetId);
                        const dx = target.x - source.x;
                        const dy = target.y - source.y;
                        const distance = Math.max(1, Math.hypot(dx, dy));
                        const direction = edge.sourceId.localeCompare(edge.targetId) <= 0 ? 1 : -1;
                        const controlX = (source.x + target.x) / 2 - (dy / distance) * offset * direction;
                        const controlY = (source.y + target.y) / 2 + (dx / distance) * offset * direction;
                        return _jsx("path", { d: `M ${source.x} ${source.y} Q ${controlX} ${controlY} ${target.x} ${target.y}`, className: css.graphEdge, "data-edge": edge.type ?? 'temporal' }, `${edge.sourceId}-${edge.targetId}-${index}`);
                    }), visibleNodes.map((node, index) => {
                        const position = positions.get(node.id);
                        const selected = props.selectedId === node.id;
                        const showLabel = selected || visibleNodes.length < 22 || index % 3 === 0;
                        return (_jsxs("g", { className: css.graphNode, "data-category": node.category ?? 'general', "data-selected": selected || undefined, transform: `translate(${position.x} ${position.y})`, role: "button", tabIndex: 0, "aria-label": `${CATEGORY_LABELS[node.category ?? 'general'] ?? node.category}: ${short(node.content, 80)}`, "data-dragging": dragRef.current?.nodeId === node.id || undefined, onPointerDown: event => beginDrag(event, node.id), onPointerMove: moveDrag, onPointerUp: endDrag, onPointerCancel: cancelDrag, onLostPointerCapture: cancelDrag, onClick: () => { if (suppressClickRef.current) {
                                suppressClickRef.current = false;
                                return;
                            } ; props.onSelect(node); }, onKeyDown: event => {
                                if (event.key === 'Enter' || event.key === ' ')
                                    props.onSelect(node);
                                else if (event.key === 'ArrowLeft') {
                                    event.preventDefault();
                                    nudge(node.id, -12, 0);
                                }
                                else if (event.key === 'ArrowRight') {
                                    event.preventDefault();
                                    nudge(node.id, 12, 0);
                                }
                                else if (event.key === 'ArrowUp') {
                                    event.preventDefault();
                                    nudge(node.id, 0, -12);
                                }
                                else if (event.key === 'ArrowDown') {
                                    event.preventDefault();
                                    nudge(node.id, 0, 12);
                                }
                            }, children: [_jsx("circle", { r: selected ? 17 : visibleNodes.length <= 12 ? 14 : 11, className: css.nodeHalo, filter: selected ? 'url(#mnemon-glow)' : undefined }), _jsx("circle", { r: selected ? 7 : visibleNodes.length <= 12 ? 6 : 4.5, className: css.nodeCore }), showLabel && _jsx("text", { x: visibleNodes.length <= 12 ? 19 : 15, y: "4", className: css.nodeLabel, children: short(node.content.replace(/\s+/gu, ' '), selected ? 34 : visibleNodes.length <= 12 ? 26 : 19) })] }, node.id));
                    })] })] }));
}
function OverviewPage(props) {
    const [graph, setGraph] = useState(null);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const load = useCallback(async (quiet = false) => {
        if (!quiet)
            setLoading(true);
        setError(null);
        try {
            const next = await props.client.graph();
            setGraph(next);
            setSelected(current => current === null ? null : next.nodes.find(node => node.id === current.id) ?? null);
        }
        catch (reason) {
            setError(message(reason));
        }
        finally {
            setLoading(false);
        }
    }, [props.client]);
    useEffect(() => {
        void load();
        const timer = window.setInterval(() => void load(true), 15_000);
        return () => window.clearInterval(timer);
    }, [load, props.revision]);
    const generated = graph === null ? '等待首个快照' : `更新于 ${new Date(graph.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
    return (_jsxs("div", { className: css.page, children: [_jsx(PageHeader, { kicker: "LIVE OVERVIEW", title: "\u8BB0\u5FC6\u56FE\u8C31", description: "\u4EE5 Mnemon \u7684\u56DB\u7C7B\u56FE\u5173\u7CFB\u4E3A\u8109\u7EDC\uFF0C\u89C2\u5BDF\u5F53\u524D Store \u4E2D\u4ECD\u7136\u6D3B\u8DC3\u7684\u4E0A\u4E0B\u6587\u3002", meta: "AUTO \u00B7 15S", action: _jsx("button", { type: "button", className: css.secondaryButton, disabled: loading, onClick: () => void load(), children: loading ? '同步中…' : '立即同步' }) }), error !== null && _jsx("div", { className: css.inlineError, role: "alert", children: error }), graph !== null && graph.nodes.length > 0 ? (_jsxs("div", { className: css.graphLayout, children: [_jsxs("section", { className: css.graphPanel, children: [_jsxs("div", { className: css.graphToolbar, children: [_jsxs("div", { children: [_jsx("span", { className: css.liveDot }), "\u5B9E\u65F6\u5FEB\u7167 ", _jsx("small", { children: generated })] }), _jsxs("div", { className: css.graphLegend, children: [_jsx("span", { "data-edge": "temporal", children: "\u65F6\u95F4" }), _jsx("span", { "data-edge": "semantic", children: "\u8BED\u4E49" }), _jsx("span", { "data-edge": "causal", children: "\u56E0\u679C" }), _jsx("span", { "data-edge": "entity", children: "\u5B9E\u4F53" })] })] }), _jsx("div", { className: css.graphViewport, children: _jsx(MemoryGraph, { graph: graph, selectedId: selected?.id, onSelect: setSelected }) }), _jsxs("div", { className: css.graphFooter, children: [_jsxs("span", { children: ["\u5C55\u793A ", Math.min(graph.nodes.length, 60), " / ", graph.nodes.length, " \u4E2A\u8282\u70B9"] }), _jsxs("span", { children: [graph.edges.length, " \u6761\u56FE\u8C31\u8FDE\u63A5"] })] })] }), _jsx("aside", { className: css.graphInspector, children: selected === null ? (_jsxs("div", { className: css.inspectorEmpty, children: [_jsx(MnemonLogo, { className: css.inspectorLogo, title: "Mnemon node inspector" }), _jsx("span", { children: "NODE INSPECTOR" }), _jsx("h3", { children: "\u9009\u62E9\u4E00\u4E2A\u8BB0\u5FC6\u8282\u70B9" }), _jsx("p", { children: "\u67E5\u770B\u5B8C\u6574\u5185\u5BB9\u3001\u5206\u7C7B\u4E0E\u7CBE\u786E ID\u3002" })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: css.inspectorHeading, children: [_jsx("span", { children: "NODE INSPECTOR" }), _jsx("button", { type: "button", onClick: () => setSelected(null), "aria-label": "\u5173\u95ED\u8282\u70B9\u8BE6\u60C5", children: "\u00D7" })] }), _jsx("span", { className: css.categoryChip, children: CATEGORY_LABELS[selected.category ?? 'general'] ?? selected.category }), _jsx("h3", { children: selected.content }), _jsxs("dl", { className: css.inspectorMeta, children: [_jsxs("div", { children: [_jsx("dt", { children: "Memory ID" }), _jsx("dd", { children: _jsx("code", { children: selected.id }) })] }), _jsxs("div", { children: [_jsx("dt", { children: "Category" }), _jsx("dd", { children: selected.category ?? 'general' })] })] }), _jsxs("div", { className: css.inspectorActions, children: [_jsx("button", { type: "button", className: css.primaryButton, onClick: () => props.onExplore(selected.content), children: "\u56F4\u7ED5\u5B83\u68C0\u7D22" }), _jsx("button", { type: "button", className: css.secondaryButton, onClick: () => void navigator.clipboard?.writeText(selected.id), children: "\u590D\u5236 ID" })] })] })) })] })) : !loading && error === null ? (_jsx(EmptyState, { glyph: "\u25C7", title: "\u56FE\u8C31\u6B63\u5728\u7B49\u5F85\u7B2C\u4E00\u6761\u8BB0\u5FC6", children: "\u6C89\u6DC0\u4E00\u6761\u7A33\u5B9A\u3001\u53EF\u590D\u7528\u7684\u4E0A\u4E0B\u6587\u540E\uFF0C\u8FD9\u91CC\u4F1A\u5B9E\u65F6\u5448\u73B0\u8282\u70B9\u4E0E\u5173\u7CFB\u3002" })) : (_jsx("div", { className: css.loadingPanel, children: "\u6B63\u5728\u8BFB\u53D6 Mnemon active graph\u2026" }))] }));
}
function ExplorePage(props) {
    const [query, setQuery] = useState(props.seed);
    const [mode, setMode] = useState('smart');
    const [category, setCategory] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState(null);
    const [relatedTo, setRelatedTo] = useState(null);
    const [related, setRelated] = useState([]);
    const [relatedLoading, setRelatedLoading] = useState(false);
    useEffect(() => { if (props.seed !== '')
        setQuery(props.seed); }, [props.seed]);
    const search = async (event) => {
        event.preventDefault();
        if (query.trim() === '')
            return;
        setSearching(true);
        setSearched(true);
        setError(null);
        setRelatedTo(null);
        try {
            const response = await props.client.search({ query, mode, ...(category === '' ? {} : { category }), limit: props.status?.defaultRecallLimit ?? 10 });
            setResults(response.results);
        }
        catch (reason) {
            setError(message(reason));
            setResults([]);
        }
        finally {
            setSearching(false);
        }
    };
    const showRelated = async (insight) => {
        setRelatedTo(insight);
        setRelated([]);
        setRelatedLoading(true);
        setError(null);
        try {
            setRelated(await props.client.related(insight.id));
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
        setResults(items => items.filter(item => item.id !== insight.id));
        setRelated(items => items.filter(item => item.id !== insight.id));
        if (relatedTo?.id === insight.id)
            setRelatedTo(null);
    };
    return (_jsxs("div", { className: css.page, children: [_jsx(PageHeader, { kicker: "INTENT RECALL", title: "\u68C0\u7D22\u8BB0\u5FC6", description: "\u7528\u660E\u786E\u95EE\u9898\u53EC\u56DE\u76F8\u5173\u4E0A\u4E0B\u6587\uFF0C\u518D\u6CBF\u56FE\u8C31\u5173\u7CFB\u7EE7\u7EED\u67E5\u9605\u3002", meta: `${props.status?.defaultRecallLimit ?? '—'} MAX RESULTS` }), _jsxs("form", { className: css.searchBar, onSubmit: event => void search(event), children: [_jsxs("div", { className: css.queryField, children: [_jsx("span", { "aria-hidden": "true", children: "\u2315" }), _jsx("input", { value: query, onChange: event => setQuery(event.target.value), placeholder: "\u4E3A\u4EC0\u4E48\u9009\u7528 SQLite\uFF1F\u8FD9\u4E2A\u9879\u76EE\u6709\u54EA\u4E9B\u53D1\u5E03\u7EA6\u5B9A\uFF1F", "aria-label": "\u8BB0\u5FC6\u67E5\u8BE2" }), _jsx("kbd", { children: "\u21B5" })] }), _jsxs("div", { className: css.searchControls, children: [_jsxs("label", { children: ["\u5206\u7C7B", _jsxs("select", { value: category, onChange: event => setCategory(event.target.value), "aria-label": "\u8BB0\u5FC6\u5206\u7C7B", children: [_jsx("option", { value: "", children: "\u5168\u90E8\u5206\u7C7B" }), CATEGORIES.map(value => _jsx("option", { value: value, children: CATEGORY_LABELS[value] }, value))] })] }), _jsxs("label", { children: ["\u7B56\u7565", _jsxs("select", { value: mode, onChange: event => setMode(event.target.value), "aria-label": "\u68C0\u7D22\u6A21\u5F0F", children: [_jsx("option", { value: "smart", children: "\u56FE\u589E\u5F3A\u53EC\u56DE" }), _jsx("option", { value: "keyword", children: "\u5173\u952E\u8BCD\u68C0\u7D22" }), _jsx("option", { value: "basic", children: "\u57FA\u7840\u5339\u914D" })] })] }), _jsx("button", { type: "submit", className: css.primaryButton, disabled: searching || query.trim() === '', children: searching ? '检索中…' : '开始召回' })] })] }), error !== null && _jsx("div", { className: css.inlineError, role: "alert", children: error }), !searched && _jsx(EmptyState, { glyph: "\u2315", title: "\u4ECE\u4E00\u4E2A\u660E\u786E\u95EE\u9898\u5F00\u59CB", children: "\u805A\u7126\u5B9E\u4F53\u3001\u51B3\u7B56\u6216\u65F6\u95F4\u7EBF\uFF0C\u6BD4\u6279\u91CF\u52A0\u8F7D\u6574\u5E93\u66F4\u53EF\u9760\u3002" }), searched && !searching && results.length === 0 && error === null && _jsx(EmptyState, { glyph: "0", title: "\u6CA1\u6709\u547D\u4E2D", children: "\u6362\u4E00\u4E2A\u66F4\u5177\u4F53\u7684\u5B9E\u4F53\u3001\u51B3\u7B56\u6216\u65F6\u95F4\u7EBF\u5173\u952E\u8BCD\u8BD5\u8BD5\u3002" }), results.length > 0 && (_jsxs("div", { className: relatedTo === null ? css.singleColumn : css.resultLayout, children: [_jsxs("section", { className: css.results, children: [_jsxs("div", { className: css.sectionHeading, children: [_jsxs("div", { children: [_jsx("span", { children: "RESULT SET" }), _jsx("h3", { children: "\u53EC\u56DE\u7ED3\u679C" })] }), _jsx("strong", { children: results.length })] }), results.map(insight => _jsx(InsightCard, { insight: insight, writeEnabled: props.writeEnabled, onForget: forget, onRelated: item => void showRelated(item) }, insight.id))] }), relatedTo !== null && _jsxs("aside", { className: css.relatedPane, children: [_jsxs("div", { className: css.sectionHeading, children: [_jsxs("div", { children: [_jsx("span", { children: "GRAPH INSPECTOR" }), _jsx("h3", { children: "\u5173\u8054\u8BB0\u5FC6" })] }), _jsx("button", { type: "button", onClick: () => setRelatedTo(null), "aria-label": "\u5173\u95ED\u5173\u8054\u8BB0\u5FC6", children: "\u00D7" })] }), _jsx("p", { className: css.relatedSource, children: relatedTo.content }), relatedLoading && _jsx("div", { className: css.loading, children: "\u6B63\u5728\u904D\u5386\u56FE\u8C31\u2026" }), !relatedLoading && related.length === 0 && _jsx("div", { className: css.muted, children: "\u6CA1\u6709\u627E\u5230\u4E24\u8DF3\u5185\u7684\u5173\u8054\u8282\u70B9\u3002" }), related.map(insight => _jsx(InsightCard, { insight: insight, writeEnabled: props.writeEnabled, onForget: forget, onRelated: item => void showRelated(item) }, insight.id))] })] }))] }));
}
function EntitiesPage(props) {
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
    return (_jsxs("div", { className: css.page, children: [_jsx(PageHeader, { kicker: "ENTITY LENS", title: "\u5B9E\u4F53\u67E5\u9605", description: "\u9009\u62E9 Mnemon \u8BC6\u522B\u51FA\u7684\u5B9E\u4F53\uFF0C\u53EC\u56DE\u5B83\u8DE8\u8D8A\u4E8B\u5B9E\u3001\u51B3\u7B56\u4E0E\u4E0A\u4E0B\u6587\u7684\u5173\u7CFB\u3002", meta: `${view.items.length} ACTIVE ENTITIES` }), _jsxs("div", { className: css.entityLayout, children: [_jsxs("aside", { className: css.entityRail, children: [_jsxs("form", { className: css.entitySearch, onSubmit: submit, children: [_jsx("input", { "aria-label": "\u5B9E\u4F53\u540D\u79F0", value: entity, onChange: event => setEntity(event.target.value), placeholder: "\u8F93\u5165\u4EFB\u610F\u5B9E\u4F53\u2026" }), _jsx("button", { type: "submit", className: css.primaryButton, disabled: loading || entity.trim() === '', children: "\u67E5\u9605" })] }), _jsxs("div", { className: css.entityHeading, children: [_jsx("span", { children: "TOP ENTITIES" }), _jsx("small", { children: "\u6309\u51FA\u73B0\u9891\u7387" })] }), _jsx("div", { className: css.entityList, children: view.items.map(item => _jsxs("button", { type: "button", "aria-pressed": view.selected === item.entity, onClick: () => { setEntity(item.entity); void load(item.entity); }, children: [_jsx("span", { children: item.entity }), _jsx("strong", { children: item.count })] }, item.entity)) }), !loading && view.items.length === 0 && _jsx("p", { className: css.muted, children: "\u5199\u5165\u5E26\u5B9E\u4F53\u7684\u8BB0\u5FC6\u540E\uFF0C\u8FD9\u91CC\u4F1A\u5F62\u6210\u5165\u53E3\u3002" })] }), _jsxs("section", { className: css.entityResults, children: [error !== null && _jsx("div", { className: css.inlineError, role: "alert", children: error }), loading && _jsx("div", { className: css.loadingPanel, children: "\u6B63\u5728\u6CBF\u5B9E\u4F53\u5173\u7CFB\u53EC\u56DE\u2026" }), !loading && view.selected === undefined && _jsx(EmptyState, { glyph: "\u25CE", title: "\u9009\u62E9\u6216\u8F93\u5165\u4E00\u4E2A\u5B9E\u4F53", children: "\u5B9E\u4F53\u89C6\u56FE\u4F1A\u805A\u5408\u4E0E\u5B83\u76F8\u5173\u7684\u8BB0\u5FC6\uFF0C\u800C\u4E0D\u662F\u53EA\u505A\u5B57\u9762\u5339\u914D\u3002" }), !loading && view.selected !== undefined && _jsxs(_Fragment, { children: [_jsxs("div", { className: css.sectionHeading, children: [_jsxs("div", { children: [_jsx("span", { children: "ENTITY CONTEXT" }), _jsx("h3", { children: view.selected })] }), _jsx("strong", { children: view.insights.length })] }), view.insights.length === 0 ? _jsx(EmptyState, { glyph: "0", title: "\u6CA1\u6709\u5173\u8054\u8BB0\u5FC6", children: "\u5C1D\u8BD5\u66F4\u5B8C\u6574\u7684\u540D\u79F0\u6216\u53E6\u4E00\u4E2A\u5B9E\u4F53\u522B\u540D\u3002" }) : view.insights.map(insight => _jsx(InsightCard, { insight: insight, writeEnabled: props.writeEnabled, onForget: props.onForget, onRelated: () => props.onExplore(insight.content) }, insight.id))] })] })] })] }));
}
function RememberPage(props) {
    const [content, setContent] = useState(props.seed);
    const [category, setCategory] = useState('general');
    const [importance, setImportance] = useState(3);
    const [tags, setTags] = useState('');
    const [entities, setEntities] = useState('');
    const [supervising, setSupervising] = useState(false);
    const [saving, setSaving] = useState(false);
    const [result, setResult] = useState(null);
    useEffect(() => { if (props.seed !== '')
        setContent(props.seed); }, [props.seed]);
    const supervise = async (event) => {
        event.preventDefault();
        if (content.trim() === '' || props.sessionId === undefined)
            return;
        setSupervising(true);
        setResult(null);
        try {
            const response = await props.client.supervise(props.sessionId, content);
            setResult(response.agentStatus === 'running'
                ? '已排入当前对话的下一轮，将由正在运行的 LLM 判断并调用 Mnemon。'
                : '已交给当前对话的 LLM；它会判断是否值得沉淀，并完成查重、分类和写入。');
            setContent('');
        }
        catch (reason) {
            setResult(`调度失败：${message(reason)}`);
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
            const response = await props.client.remember({ content, category, importance, tags: tags.split(',').map(value => value.trim()).filter(Boolean), entities: entities.split(',').map(value => value.trim()).filter(Boolean), source: 'user' });
            const action = typeof response.action === 'string' ? response.action : 'saved';
            setResult(action === 'skipped' ? 'Mnemon 判定为重复内容，已跳过。' : `记忆已处理：${action}`);
            if (action !== 'skipped') {
                setContent('');
                setTags('');
                setEntities('');
                props.onMutate();
            }
        }
        catch (reason) {
            setResult(`保存失败：${message(reason)}`);
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsxs("div", { className: css.page, children: [_jsx(PageHeader, { kicker: "LLM-SUPERVISED WRITEBACK", title: "\u6C89\u6DC0\u8BB0\u5FC6", description: "\u628A\u5019\u9009\u5185\u5BB9\u4EA4\u7ED9\u5F53\u524D DSH \u6A21\u578B\u5224\u65AD\uFF1B\u6A21\u578B\u8D1F\u8D23\u67E5\u91CD\u3001\u63D0\u70BC\u3001\u5206\u7C7B\uFF0C\u518D\u51B3\u5B9A\u662F\u5426\u5199\u5165 Mnemon\u3002", meta: props.writeEnabled ? 'AGENT SUPERVISED' : 'READ ONLY' }), !props.writeEnabled ? _jsx(EmptyState, { glyph: "\u2298", title: "\u5F53\u524D\u4E3A\u53EA\u8BFB\u6A21\u5F0F", children: "\u8BF7\u5728\u672C Tab \u7684\u201C\u72B6\u6001\u201D\u9875\u9762\u542F\u7528\u5199\u5165\uFF0C\u4FDD\u5B58 settings.yaml \u5E76\u91CD\u542F DSH\u3002" }) : (_jsxs("div", { className: css.writebackLayout, children: [_jsxs("aside", { className: css.writeGuide, children: [_jsx("span", { className: css.cardKicker, children: "SUPERVISION FLOW" }), _jsx("h3", { children: "\u6A21\u578B\u4F1A\u5B8C\u6210\u4EC0\u4E48" }), _jsxs("ol", { children: [_jsxs("li", { children: [_jsx("strong", { children: "\u5224\u65AD\u4EF7\u503C" }), _jsx("span", { children: "\u8FC7\u6EE4\u4E34\u65F6\u8FDB\u5EA6\u3001\u8F6C\u5F55\u4E0E\u53EF\u6062\u590D\u4E8B\u5B9E" })] }), _jsxs("li", { children: [_jsx("strong", { children: "\u68C0\u7D22\u67E5\u91CD" }), _jsx("span", { children: "\u8BC6\u522B\u91CD\u590D\u3001\u8865\u5145\u6216\u51B2\u7A81\u7684\u65E7\u8BB0\u5FC6" })] }), _jsxs("li", { children: [_jsx("strong", { children: "\u7ED3\u6784\u5316\u5199\u5165" }), _jsx("span", { children: "\u9009\u62E9\u5206\u7C7B\u3001\u91CD\u8981\u6027\u3001\u5B9E\u4F53\u4E0E\u5FC5\u8981\u5173\u7CFB" })] })] }), _jsx("p", { children: "\u8BF7\u6C42\u4F1A\u4F5C\u4E3A\u72EC\u7ACB DSH turn \u6392\u5165\u5F53\u524D\u4F1A\u8BDD\uFF0C\u5168\u7A0B\u4FDD\u7559\u5728\u4F1A\u8BDD\u65E5\u5FD7\u4E2D\u3002" })] }), _jsxs("section", { className: css.supervisedComposer, children: [_jsxs("form", { className: css.supervisedForm, onSubmit: event => void supervise(event), children: [_jsxs("div", { className: css.supervisedHeading, children: [_jsxs("div", { children: [_jsx("span", { className: css.cardKicker, children: "CURRENT DSH AGENT" }), _jsx("h3", { children: "\u4EA4\u7ED9 LLM \u5224\u65AD" })] }), _jsx("span", { className: props.sessionId === undefined ? css.sessionMissing : css.sessionReady, children: props.sessionId === undefined ? 'NO SESSION' : 'LIVE SESSION' })] }), _jsxs("label", { className: css.fieldWide, children: ["\u5019\u9009\u5185\u5BB9", _jsx("textarea", { "aria-label": "\u5F85\u6C89\u6DC0\u5185\u5BB9", value: content, onChange: event => setContent(event.target.value), maxLength: 8000, rows: 8, placeholder: "\u8F93\u5165\u5E0C\u671B\u8DE8\u4EFB\u52A1\u4FDD\u7559\u7684\u80CC\u666F\u3001\u504F\u597D\u3001\u51B3\u7B56\u6216\u6D1E\u5BDF\u3002\u6A21\u578B\u4F1A\u5148\u5224\u65AD\u5B83\u662F\u5426\u771F\u7684\u503C\u5F97\u6C89\u6DC0\u3002" })] }), props.sessionId === undefined && _jsx("p", { className: css.sessionHint, children: "\u5F53\u524D\u89C6\u56FE\u6CA1\u6709\u7ED1\u5B9A live session\uFF0C\u65E0\u6CD5\u8C03\u5EA6\u6A21\u578B\uFF1B\u4ECD\u53EF\u4F7F\u7528\u4E0B\u65B9\u4EBA\u5DE5\u9AD8\u7EA7\u5199\u5165\u3002" }), _jsxs("div", { className: css.formActions, children: [_jsx("button", { type: "submit", className: css.primaryButton, disabled: supervising || content.trim() === '' || props.sessionId === undefined, children: supervising ? '正在排入对话…' : '交给当前 LLM 判断并沉淀' }), result !== null && _jsx("span", { role: "status", children: result })] })] }), _jsxs("details", { className: css.advancedWrite, children: [_jsxs("summary", { children: [_jsxs("span", { children: [_jsx("strong", { children: "\u4EBA\u5DE5\u9AD8\u7EA7\u5199\u5165" }), _jsx("small", { children: "\u8DF3\u8FC7 LLM \u5224\u65AD\uFF0C\u6309\u6307\u5B9A\u5143\u6570\u636E\u76F4\u63A5\u8C03\u7528 mnemon remember" })] }), _jsx("span", { children: "\u5C55\u5F00" })] }), _jsxs("form", { className: css.manualForm, onSubmit: event => void manualSave(event), children: [_jsxs("div", { className: css.formGrid, children: [_jsxs("label", { children: ["\u5206\u7C7B", _jsx("select", { value: category, onChange: event => setCategory(event.target.value), children: CATEGORIES.map(value => _jsx("option", { value: value, children: CATEGORY_LABELS[value] }, value)) })] }), _jsxs("label", { children: ["\u91CD\u8981\u6027", _jsx("select", { value: importance, onChange: event => setImportance(Number(event.target.value)), children: [1, 2, 3, 4, 5].map(value => _jsxs("option", { value: value, children: [value, " / 5"] }, value)) })] }), _jsxs("label", { className: css.fieldWide, children: ["\u5B9E\u4F53\uFF08\u9017\u53F7\u5206\u9694\uFF09", _jsx("input", { value: entities, onChange: event => setEntities(event.target.value), placeholder: "SQLite, DSH" })] }), _jsxs("label", { className: css.fieldWide, children: ["\u6807\u7B7E\uFF08\u9017\u53F7\u5206\u9694\uFF09", _jsx("input", { value: tags, onChange: event => setTags(event.target.value), placeholder: "architecture, local-first" })] })] }), _jsxs("div", { className: css.manualActions, children: [_jsx("p", { children: "\u4EBA\u5DE5\u5199\u5165\u4E0D\u4F1A\u8BF7\u6C42\u6A21\u578B\u8BC4\u4F30\uFF0C\u4EC5\u4F7F\u7528 Mnemon \u81EA\u5E26\u7684\u91CD\u590D\u4E0E\u51B2\u7A81\u5904\u7406\u3002" }), _jsx("button", { type: "submit", className: css.secondaryButton, disabled: saving || content.trim() === '', children: saving ? '写入中…' : '按高级选项直接写入' })] })] })] })] })] }))] }));
}
function ListPage(props) {
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
    const forget = async (insight) => { await props.onForget(insight); setView(current => current === null ? current : { ...current, total: Math.max(0, current.total - 1), items: current.items.filter(item => item.id !== insight.id) }); };
    return (_jsxs("div", { className: css.page, children: [_jsx(PageHeader, { kicker: "ACTIVE MEMORY LIST", title: "\u8BB0\u5FC6\u5E93", description: "\u65E0\u526F\u4F5C\u7528\u6D4F\u89C8 active memory\uFF1B\u67E5\u9605\u3001\u590D\u5236\u3001\u57FA\u4E8E\u65E7\u5185\u5BB9\u65B0\u5EFA\u6216\u8F6F\u5220\u9664\u3002", meta: `${view?.total ?? '—'} MEMORIES` }), _jsxs("form", { className: css.listToolbar, onSubmit: submit, children: [_jsx("input", { "aria-label": "\u7B5B\u9009\u8BB0\u5FC6\u5E93", value: query, onChange: event => setQuery(event.target.value), placeholder: "\u6309\u5185\u5BB9\u6216\u7CBE\u786E ID \u7B5B\u9009\u2026" }), _jsxs("select", { "aria-label": "\u8BB0\u5FC6\u5E93\u5206\u7C7B", value: category, onChange: event => setCategory(event.target.value), children: [_jsx("option", { value: "", children: "\u5168\u90E8\u5206\u7C7B" }), CATEGORIES.map(value => _jsx("option", { value: value, children: CATEGORY_LABELS[value] }, value))] }), _jsx("button", { type: "submit", className: css.primaryButton, disabled: loading, children: loading ? '载入中…' : '应用筛选' })] }), _jsxs("div", { className: css.listNotice, children: [_jsx("span", { children: "NON-MUTATING READ" }), " List \u8BFB\u53D6 Mnemon active graph\uFF0C\u4E0D\u4F1A\u589E\u52A0 recall \u8BBF\u95EE\u8BA1\u6570\u3002"] }), error !== null && _jsx("div", { className: css.inlineError, role: "alert", children: error }), !loading && view?.items.length === 0 && _jsx(EmptyState, { glyph: "\u2261", title: "\u6CA1\u6709\u7B26\u5408\u6761\u4EF6\u7684\u8BB0\u5FC6", children: "\u6E05\u7A7A\u7B5B\u9009\uFF0C\u6216\u524D\u5F80\u201C\u6C89\u6DC0\u201D\u5199\u5165\u7B2C\u4E00\u6761\u7A33\u5B9A\u4E0A\u4E0B\u6587\u3002" }), _jsx("div", { className: css.memoryList, children: view?.items.map(insight => _jsx(InsightCard, { insight: insight, writeEnabled: props.writeEnabled, onForget: forget, onClone: props.onClone, onRelated: () => props.onExplore(insight.content) }, insight.id)) })] }));
}
function StatusPage(props) {
    const status = props.status;
    const lifecycle = status?.lifecycle;
    const current = lifecycle?.current;
    const latest = current?.lastAt === undefined ? '尚无运行记录' : new Date(current.lastAt).toLocaleString();
    const phase = current?.lastPhase === undefined ? 'idle' : { idle: '待命', prime: 'Prime', recall: 'Recall', writeback: 'Writeback', supervised: '受监督请求', error: '异常' }[current.lastPhase];
    return (_jsxs("div", { className: css.page, children: [_jsx(PageHeader, { kicker: "RUNTIME OBSERVABILITY", title: "\u72B6\u6001\u4E0E\u914D\u7F6E", description: "\u5148\u770B\u8BB0\u5FC6\u5F15\u64CE\u3001\u751F\u547D\u5468\u671F\u4E0E\u5F53\u524D\u4F1A\u8BDD\u662F\u5426\u8FDE\u901A\uFF1B\u9700\u8981\u65F6\u518D\u5C55\u5F00\u8BCA\u65AD\u548C\u914D\u7F6E\u3002", meta: status?.healthy === true && lifecycle?.sessionAvailable === true ? 'SYSTEM NOMINAL' : 'CHECK REQUIRED', action: _jsx("button", { type: "button", className: css.secondaryButton, onClick: props.onRefresh, children: props.loading ? '检查中…' : '重新检查' }) }), _jsxs("section", { className: css.healthStrip, "aria-label": "Mnemon \u8FD0\u884C\u72B6\u6001", children: [_jsxs("article", { children: [_jsx("span", { className: `${css.healthIndicator} ${status?.healthy === true ? css.healthGood : css.healthBad}` }), _jsxs("div", { children: [_jsx("small", { children: "MEMORY ENGINE" }), _jsx("strong", { children: status?.healthy === true ? 'Mnemon 已连接' : 'Mnemon 不可用' }), _jsx("p", { children: status?.version === undefined ? '等待版本信息' : `CLI ${status.version}` })] })] }), _jsxs("article", { children: [_jsx("span", { className: `${css.healthIndicator} ${lifecycle?.enabled === true ? css.healthGood : css.healthMuted}` }), _jsxs("div", { children: [_jsx("small", { children: "LIFECYCLE" }), _jsx("strong", { children: lifecycle?.enabled === true ? '生命周期编排已启用' : '生命周期编排未启用' }), _jsx("p", { children: lifecycle === undefined ? '等待 DSH 状态' : `${lifecycle.activeAgents} 个根 Agent` })] })] }), _jsxs("article", { children: [_jsx("span", { className: `${css.healthIndicator} ${lifecycle?.sessionAvailable === true ? css.healthGood : css.healthBad}` }), _jsxs("div", { children: [_jsx("small", { children: "CURRENT SESSION" }), _jsx("strong", { children: lifecycle?.sessionAvailable === true ? '当前会话已绑定' : '当前会话未绑定' }), _jsx("p", { children: current === undefined ? '无法调度受监督沉淀' : `${current.status === 'running' ? '运行中' : '空闲'} · ${short(current.sessionId, 18)}` })] })] })] }), _jsxs("div", { className: css.statusLayout, children: [_jsxs("section", { className: css.lifecyclePanel, children: [_jsxs("div", { className: css.statusSectionHeader, children: [_jsxs("div", { children: [_jsx("span", { className: css.cardKicker, children: "AGENT LIFECYCLE" }), _jsx("h3", { children: "\u8BB0\u5FC6\u751F\u547D\u5468\u671F" }), _jsx("p", { children: "Hook \u53EA\u4FDD\u8BC1\u6A21\u578B\u5728\u6B63\u786E\u8FB9\u754C\u4F5C\u51FA\u5224\u65AD\uFF0C\u6700\u7EC8\u8BFB\u5199\u4ECD\u7531\u5F53\u524D DSH LLM \u51B3\u5B9A\u3002" })] }), _jsx("span", { className: css.phaseBadge, children: phase })] }), _jsxs("div", { className: css.lifecycleFlow, children: [_jsxs("article", { children: [_jsx("span", { children: "01" }), _jsxs("div", { children: [_jsx("strong", { children: "Prime" }), _jsx("p", { children: "\u9996\u6B21\u6A21\u578B\u8BF7\u6C42\u524D\u8BFB\u53D6 Store \u72B6\u6001" })] }), _jsx("code", { children: lifecycle?.counters.primes ?? 0 })] }), _jsxs("article", { "data-disabled": lifecycle?.recallMode === 'off' || undefined, children: [_jsx("span", { children: "02" }), _jsxs("div", { children: [_jsx("strong", { children: "Recall Gate" }), _jsx("p", { children: lifecycle?.recallMode === 'guided' ? '每轮首步由模型判断是否召回' : '已关闭，仅保留手动召回' })] }), _jsx("code", { children: lifecycle?.counters.recallCues ?? 0 })] }), _jsxs("article", { "data-disabled": lifecycle?.writebackMode === 'off' || undefined, children: [_jsx("span", { children: "03" }), _jsxs("div", { children: [_jsx("strong", { children: "Writeback Gate" }), _jsx("p", { children: lifecycle?.writebackMode === 'guided' ? 'turn 关闭前至多检查一次' : '已关闭，仅保留主动沉淀' })] }), _jsx("code", { children: lifecycle?.counters.writebackChecks ?? 0 })] })] }), _jsxs("div", { className: css.lifecycleFoot, children: [_jsxs("span", { children: ["\u6700\u8FD1\u9636\u6BB5 ", _jsx("strong", { children: phase })] }), _jsxs("span", { children: ["\u6700\u8FD1\u6D3B\u52A8 ", _jsx("strong", { children: latest })] }), _jsxs("span", { children: ["\u53D7\u76D1\u7763\u8BF7\u6C42 ", _jsx("strong", { children: lifecycle?.counters.supervisedRequests ?? 0 })] }), _jsxs("span", { children: ["\u8BB0\u5FC6\u5DE5\u5177\u8C03\u7528 ", _jsx("strong", { children: current?.memoryToolCalls ?? 0 })] })] }), current?.lastError !== undefined && _jsxs("div", { className: css.inlineError, role: "alert", children: ["Lifecycle\uFF1A", current.lastError] })] }), _jsxs("aside", { className: css.diagnosticsPanel, children: [_jsx("div", { className: css.statusSectionHeader, children: _jsxs("div", { children: [_jsx("span", { className: css.cardKicker, children: "QUICK DIAGNOSTICS" }), _jsx("h3", { children: "\u5FEB\u901F\u8BCA\u65AD" })] }) }), _jsxs("ul", { className: css.diagnosticList, children: [_jsxs("li", { "data-ok": status?.commandFound || undefined, children: [_jsx("span", {}), "Mnemon CLI ", status?.commandFound ? '可执行' : '未找到'] }), _jsxs("li", { "data-ok": status?.writeEnabled || undefined, children: [_jsx("span", {}), status?.writeEnabled ? '允许读取与写入' : '当前为只读模式'] }), _jsxs("li", { "data-ok": lifecycle?.sessionAvailable || undefined, children: [_jsx("span", {}), lifecycle?.sessionAvailable ? 'WebUI 可调度当前 Agent' : '缺少 live session'] }), _jsxs("li", { "data-ok": (lifecycle?.counters.failures ?? 0) === 0 || undefined, children: [_jsx("span", {}), "Lifecycle \u5931\u8D25 ", lifecycle?.counters.failures ?? 0, " \u6B21"] })] }), _jsxs("div", { className: css.nativeAccess, children: [_jsx("span", { className: css.cardKicker, children: "NATIVE ACCESS" }), _jsx("code", { children: "/mnemon status" }), _jsx("code", { children: "/mnemon recall <query>" }), _jsxs("p", { children: ["\u6A21\u578B\u4FA7\u4F7F\u7528\u539F\u751F ", _jsx("code", { children: "mnemon_*" }), " \u5DE5\u5177\uFF1B\u4EBA\u5DE5\u547D\u4EE4\u4E0D\u4F1A\u7ED5\u5165\u6A21\u578B\u3002"] })] })] })] }), _jsxs("section", { className: css.runtimeDetails, children: [_jsxs("div", { className: css.statusSectionHeader, children: [_jsxs("div", { children: [_jsx("span", { className: css.cardKicker, children: "RUNTIME DETAILS" }), _jsx("h3", { children: "\u5F15\u64CE\u4E0E\u5B58\u50A8" })] }), _jsx("span", { className: `${css.runtimeBadge} ${status?.healthy === true ? css.runtimeOnline : css.runtimeOffline}`, children: status?.healthy === true ? 'ONLINE' : 'OFFLINE' })] }), _jsxs("dl", { children: [_jsxs("div", { children: [_jsx("dt", { children: "CLI" }), _jsx("dd", { children: _jsx("code", { children: status?.cliPath ?? 'mnemon' }) })] }), _jsxs("div", { children: [_jsx("dt", { children: "Store" }), _jsx("dd", { children: _jsx("code", { children: status?.store ?? 'default' }) })] }), _jsxs("div", { children: [_jsx("dt", { children: "\u6570\u636E\u76EE\u5F55" }), _jsx("dd", { children: _jsx("code", { children: status?.dataDir ?? '~/.mnemon' }) })] }), _jsxs("div", { children: [_jsx("dt", { children: "\u6570\u636E\u5E93" }), _jsx("dd", { children: status?.stats === undefined ? '—' : humanBytes(status.stats.dbSizeBytes) })] }), _jsxs("div", { children: [_jsx("dt", { children: "\u8D85\u65F6" }), _jsxs("dd", { children: [status?.timeoutMs ?? '—', " ms"] })] }), _jsxs("div", { children: [_jsx("dt", { children: "\u9ED8\u8BA4\u53EC\u56DE" }), _jsxs("dd", { children: [status?.defaultRecallLimit ?? '—', " \u6761"] })] }), _jsxs("div", { children: [_jsx("dt", { children: "\u6709\u6548\u8BB0\u5FC6" }), _jsx("dd", { children: status?.stats?.totalInsights ?? '—' })] }), _jsxs("div", { children: [_jsx("dt", { children: "\u56FE\u8C31\u8FDE\u63A5" }), _jsx("dd", { children: status?.stats?.edgeCount ?? '—' })] })] })] }), _jsxs("details", { className: css.configDisclosure, children: [_jsxs("summary", { children: [_jsxs("span", { children: [_jsx("span", { className: css.cardKicker, children: "PLUGIN CONFIG" }), _jsx("strong", { children: "\u8FDE\u63A5\u4E0E\u884C\u4E3A\u914D\u7F6E" }), _jsx("small", { children: "\u4FDD\u5B58\u5230 .dsh/settings.yaml\uFF0C\u91CD\u542F DSH \u540E\u751F\u6548" })] }), _jsx("span", { children: "\u5C55\u5F00\u914D\u7F6E" })] }), _jsx("div", { className: css.settingsPanel, children: _jsx(MnemonSettingsCard, { scope: props.settingsScope }) })] })] }));
}
export function MnemonView({ connection, settingsScope, sessionId }) {
    const client = useMemo(() => new MnemonClient(connection), [connection]);
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
            setStatus(await client.status(sessionId));
        }
        catch (reason) {
            setStatusError(message(reason));
        }
        finally {
            setStatusLoading(false);
        }
    }, [client, sessionId]);
    useEffect(() => { void loadStatus(); }, [loadStatus]);
    const mutate = useCallback(() => { setRevision(value => value + 1); void loadStatus(); }, [loadStatus]);
    const forget = useCallback(async (insight) => { await client.forget(insight.id); mutate(); }, [client, mutate]);
    const explore = useCallback((query) => { setSearchSeed(query); setPage('explore'); }, []);
    const clone = useCallback((insight) => { setRememberSeed(insight.content); setPage('remember'); }, []);
    const refreshAll = () => { setRevision(value => value + 1); void loadStatus(); };
    const writeEnabled = status?.writeEnabled === true;
    const stats = status?.stats;
    return (_jsxs("main", { className: css.shell, children: [_jsxs("header", { className: css.masthead, children: [_jsxs("div", { className: css.brand, children: [_jsx(MnemonLogo, { className: css.brandLogo }), _jsxs("div", { children: [_jsx("div", { className: css.eyebrow, children: "PERSISTENT AGENT MEMORY" }), _jsx("h1", { children: "Mnemon" }), _jsx("p", { children: "LLM-supervised 4-graph persistent memory for AI agents." })] })] }), _jsxs("div", { className: css.statusCluster, children: [_jsx("span", { className: `${css.statusDot} ${status?.healthy === true ? css.online : css.offline}` }), _jsx("span", { children: statusLoading ? '检查中' : status?.healthy === true ? `已连接 · ${status.store}` : '不可用' }), _jsx("button", { type: "button", className: css.iconButton, onClick: refreshAll, "aria-label": "\u5237\u65B0\u72B6\u6001", children: "\u21BB" })] })] }), (statusError !== null || status?.healthy === false) && _jsxs("div", { className: css.alert, role: "alert", children: [_jsx("strong", { children: "Mnemon \u5C1A\u672A\u5C31\u7EEA" }), _jsx("span", { children: statusError ?? status?.error })] }), _jsxs("section", { className: css.telemetry, "aria-label": "\u8BB0\u5FC6\u7EDF\u8BA1", children: [_jsxs("div", { className: css.telemetryLead, children: [_jsx("span", { className: css.telemetryPulse }), "Memory telemetry"] }), _jsxs("div", { className: css.telemetryMetric, children: [_jsx("span", { children: "\u6709\u6548\u8BB0\u5FC6" }), _jsx("strong", { children: stats?.totalInsights ?? '—' })] }), _jsxs("div", { className: css.telemetryMetric, children: [_jsx("span", { children: "\u56FE\u8C31\u8FDE\u63A5" }), _jsx("strong", { children: stats?.edgeCount ?? '—' })] }), _jsxs("div", { className: css.telemetryMetric, children: [_jsx("span", { children: "\u5DF2\u8BC6\u522B\u5B9E\u4F53" }), _jsx("strong", { children: stats?.topEntities.length ?? '—' })] }), _jsxs("div", { className: css.telemetryMetric, children: [_jsx("span", { children: "\u6570\u636E\u5E93" }), _jsx("strong", { children: stats === undefined ? '—' : humanBytes(stats.dbSizeBytes) })] })] }), _jsxs("div", { className: css.workspace, children: [_jsxs("aside", { className: css.sidebar, children: [_jsx("nav", { className: css.nav, "aria-label": "Mnemon \u9875\u9762", children: PAGE_NAV.map(item => _jsxs("button", { type: "button", "aria-current": page === item.id ? 'page' : undefined, onClick: () => setPage(item.id), children: [_jsx("span", { className: css.navGlyph, "aria-hidden": "true", children: item.glyph }), _jsxs("span", { children: [_jsx("strong", { children: item.label }), _jsx("small", { children: item.detail })] })] }, item.id)) }), _jsxs("div", { className: css.sidebarFooter, children: [_jsx("span", { children: "ACTIVE STORE" }), _jsx("code", { children: status?.store ?? '—' }), _jsx("small", { children: writeEnabled ? 'Read / Write' : 'Read only' })] })] }), _jsxs("section", { className: css.canvas, children: [page === 'overview' && _jsx(OverviewPage, { client: client, revision: revision, onExplore: explore }), page === 'explore' && _jsx(ExplorePage, { client: client, status: status, seed: searchSeed, writeEnabled: writeEnabled, onForget: forget }), page === 'entities' && _jsx(EntitiesPage, { client: client, revision: revision, writeEnabled: writeEnabled, onForget: forget, onExplore: explore }), page === 'remember' && _jsx(RememberPage, { client: client, sessionId: sessionId, writeEnabled: writeEnabled, seed: rememberSeed, onMutate: mutate }), page === 'list' && _jsx(ListPage, { client: client, revision: revision, writeEnabled: writeEnabled, onForget: forget, onClone: clone, onExplore: explore }), page === 'status' && _jsx(StatusPage, { status: status, loading: statusLoading, onRefresh: () => void loadStatus(), settingsScope: settingsScope })] })] })] }));
}
//# sourceMappingURL=MnemonView.js.map