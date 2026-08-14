import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { createContext, Fragment, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { consumeMnemonAnchor, subscribeMnemonAnchor } from "./anchor.js";
import Markdown from 'markdown-to-jsx';
import { CATEGORIES, } from "../service.js";
import { MnemonClient } from "./api.js";
import { translateZh } from "./locales.js";
import { MnemonLogo } from "./MnemonLogo.js";
import { appearanceClass, MnemonViewAppearanceProvider, resolveMnemonViewAppearance, useMnemonViewAppearance, } from "./MnemonViewAppearance.js";
import css from './MnemonView.module.css';
/** 系统 → 三层存储 → 读写工具；组间以分隔线呈现。 */
const PAGE_NAV = [
    {
        aria: 'nav.group.system',
        entries: [
            { id: 'status', label: 'nav.status', detail: 'nav.status.detail', glyph: '⌘' },
        ],
    },
    {
        aria: 'nav.group.storage',
        entries: [
            { id: 'runtime', label: 'nav.runtime', detail: 'nav.runtime.detail', glyph: '◫' },
            { id: 'overview', label: 'nav.bodies', detail: 'nav.bodies.detail', glyph: '◇' },
            { id: 'documents', label: 'nav.documents', detail: 'nav.documents.detail', glyph: '▤' },
        ],
    },
    {
        aria: 'nav.group.tools',
        entries: [
            { id: 'remember', label: 'nav.remember', detail: 'nav.remember.detail', glyph: '+' },
            { id: 'explore', label: 'nav.search', detail: 'nav.search.detail', glyph: '⌕' },
            { id: 'entities', label: 'nav.entities', detail: 'nav.entities.detail', glyph: '◎' },
            { id: 'list', label: 'nav.content', detail: 'nav.content.detail', glyph: '≡' },
        ],
    },
];
const SIDEBAR_PAGE_TABS = [
    { id: 'status', label: 'nav.status', detail: 'nav.status.detail', glyph: '⌘' },
    { id: 'runtime', label: 'nav.runtime', detail: 'nav.runtime.detail', glyph: '◫' },
    { id: 'overview', label: 'nav.bodies', detail: 'nav.bodies.detail', glyph: '◇' },
    { id: 'documents', label: 'nav.documents', detail: 'nav.documents.detail', glyph: '▤' },
];
const MEMORY_PAGE_TABS = [
    { id: 'overview', label: 'nav.overview' },
    { id: 'explore', label: 'nav.search' },
    { id: 'list', label: 'nav.content' },
    { id: 'entities', label: 'nav.entities' },
];
const MEMORY_PAGES = new Set(MEMORY_PAGE_TABS.map(item => item.id));
function isMemoryPage(page) {
    return MEMORY_PAGES.has(page);
}
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
    const appearance = useMnemonViewAppearance();
    return (_jsxs("div", { className: appearanceClass(css.pageHeader, appearance.classes.pageHeader), children: [_jsxs("div", { children: [_jsx("h2", { children: props.title }), _jsx("p", { children: props.description })] }), _jsxs("div", { className: css.pageHeaderMeta, children: [props.meta !== undefined && _jsx("code", { children: props.meta }), props.action] })] }));
}
function ProgressiveFooter(props) {
    const t = useT();
    if (props.total === 0)
        return null;
    const remaining = Math.max(0, props.total - props.visible);
    return _jsxs("div", { className: props.compact === true ? css.compactListProgress : css.listProgress, children: [_jsx("span", { children: t('common.showing', { visible: props.visible, total: props.total }) }), remaining > 0 && _jsx("button", { type: "button", className: css.secondaryButton, onClick: props.onMore, children: t('common.showMore', { count: Math.min(props.pageSize, remaining) }) })] });
}
/** DSH-style action dialog shared by Sidebar add/write flows. */
function SidebarModal(props) {
    const t = useT();
    const appearance = useMnemonViewAppearance();
    const dialogRef = useRef(null);
    const returnFocusRef = useRef(null);
    const close = useCallback(() => { if (props.busy !== true)
        props.onClose(); }, [props.busy, props.onClose]);
    useLayoutEffect(() => {
        returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const firstControl = dialogRef.current?.querySelector('[data-autofocus]')
            ?? dialogRef.current?.querySelector('input:not(:disabled), textarea:not(:disabled), select:not(:disabled)')
            ?? dialogRef.current?.querySelector('div:last-child button:not(:disabled)');
        firstControl?.focus({ preventScroll: true });
        return () => { if (returnFocusRef.current?.isConnected === true)
            returnFocusRef.current.focus({ preventScroll: true }); };
    }, []);
    useEffect(() => {
        const onKey = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                close();
                return;
            }
            if (event.key !== 'Tab')
                return;
            const controls = Array.from(dialogRef.current?.querySelectorAll('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])') ?? []).filter(control => control.getAttribute('aria-hidden') !== 'true');
            const first = controls[0];
            const last = controls.at(-1);
            if (first === undefined || last === undefined) {
                event.preventDefault();
                return;
            }
            const active = document.activeElement;
            if (event.shiftKey && (active === first || !dialogRef.current?.contains(active))) {
                event.preventDefault();
                last.focus();
            }
            else if (!event.shiftKey && (active === last || !dialogRef.current?.contains(active))) {
                event.preventDefault();
                first.focus();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [close]);
    return (_jsx("div", { className: appearance.classes.modalBackdrop, onPointerDown: event => { if (event.target === event.currentTarget)
            close(); }, children: _jsxs("section", { ref: dialogRef, className: appearance.classes.modal, role: "dialog", "aria-modal": "true", "aria-label": props.title, children: [_jsxs("header", { children: [_jsxs("div", { children: [_jsx("h2", { children: props.title }), props.description !== undefined && _jsx("p", { children: props.description })] }), _jsx("button", { type: "button", className: css.iconButton, disabled: props.busy, onClick: close, "aria-label": t('common.cancel'), children: "\u00D7" })] }), _jsx("div", { children: props.children })] }) }));
}
function EmptyState(props) {
    return (_jsxs("div", { className: css.emptyState, children: [_jsx("div", { className: css.emptyGlyph, "aria-hidden": "true", children: _jsx("span", { children: props.glyph }) }), _jsxs("div", { children: [_jsx("h3", { children: props.title }), _jsx("p", { children: props.children })] })] }));
}
/** Sidebar mirrors the SSH panel's flat tab model; Buildin keeps the grouped navigation unchanged. */
function WorkspaceNavigation(props) {
    const t = useT();
    const appearance = useMnemonViewAppearance();
    return (_jsxs("div", { className: appearanceClass(css.topNavigation, appearance.classes.topNavigation), children: [appearance.surface === 'sidebar'
                ? _jsx("div", { className: appearanceClass(css.nav, appearance.classes.nav), role: "tablist", "aria-label": t('nav.aria'), children: SIDEBAR_PAGE_TABS.map(item => {
                        const active = item.id === 'overview' ? isMemoryPage(props.page) : props.page === item.id;
                        return _jsx("button", { type: "button", role: "tab", "aria-selected": active, "data-active": active ? '' : undefined, onClick: () => props.onSelect(item.id), children: t(item.label) }, item.id);
                    }) })
                : _jsx("nav", { className: appearanceClass(css.nav, appearance.classes.nav), "aria-label": t('nav.aria'), children: PAGE_NAV.map((group, groupIndex) => _jsxs(Fragment, { children: [_jsx("div", { className: appearanceClass(css.navGroup, appearance.classes.navGroup), role: "group", "aria-label": t(group.aria), children: group.entries.map(item => _jsxs("button", { type: "button", "aria-current": props.page === item.id ? 'page' : undefined, onClick: () => props.onSelect(item.id), children: [appearance.showNavigationGlyphs && _jsx("span", { className: css.navGlyph, "aria-hidden": "true", children: item.glyph }), _jsxs("span", { children: [_jsx("strong", { children: t(item.label) }), appearance.showNavigationDetails && _jsx("small", { children: t(item.detail) })] })] }, item.id)) }), appearance.showNavigationDividers && groupIndex < PAGE_NAV.length - 1 && _jsx("span", { className: css.navGroupDivider, "aria-hidden": "true" })] }, group.aria)) }), appearance.showSpaceSummary && _jsxs("div", { className: css.spaceSummary, children: [_jsx("span", { children: t('sidebar.activeSpaces') }), _jsx("code", { children: props.catalogKnown ? `${props.activeBodies} / ${props.bodyCount}` : '— / —' }), _jsx("small", { children: props.writeEnabled ? t('common.agentSupervised') : t('common.readOnly') })] })] }));
}
/** Memory tools become a focused second-level tab set on the Sidebar surface. */
function MemoryNavigation(props) {
    const t = useT();
    const appearance = useMnemonViewAppearance();
    if (appearance.surface !== 'sidebar' || !isMemoryPage(props.page))
        return null;
    return (_jsxs("section", { className: appearance.classes.memoryWorkspace, children: [_jsx(PageHeader, { title: t('nav.bodies'), description: t('overview.description'), action: _jsx("button", { type: "button", className: appearanceClass(css.primaryButton, appearance.classes.memoryWriteButton), disabled: !props.writeEnabled, onClick: props.onRemember, children: t('nav.rememberAction') }) }), _jsx("div", { className: appearance.classes.memoryNavigation, children: _jsx("div", { className: appearance.classes.memoryTabs, role: "tablist", "aria-label": t('nav.memory.aria'), children: MEMORY_PAGE_TABS.map(item => {
                        const active = props.page === item.id;
                        return _jsx("button", { type: "button", role: "tab", "aria-selected": active, "data-active": active ? '' : undefined, onClick: () => props.onSelect(item.id), children: t(item.label) }, item.id);
                    }) }) })] }));
}
/** Full-text popup for a selected graph node whose inspector preview is clamped. */
function ContentPreview(props) {
    const t = useT();
    const close = useCallback(() => props.onClose(), [props]);
    useEffect(() => {
        const onKey = (event) => { if (event.key === 'Escape')
            props.onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [props]);
    const meta = [props.kind, props.node.id, props.node.memoryBodyName].filter((entry) => entry !== undefined).join(' · ');
    return (_jsx("div", { className: css.previewOverlay, onPointerDown: event => { if (event.target === event.currentTarget)
            props.onClose(); }, children: _jsxs("div", { className: css.previewDialog, role: "dialog", "aria-modal": "true", "aria-label": t('overview.previewTitle'), children: [_jsxs("header", { className: css.previewHeading, children: [_jsx("span", { children: t('overview.previewTitle') }), _jsx("button", { type: "button", onClick: close, "aria-label": t('common.cancel'), children: "\u00D7" })] }), _jsx("div", { className: css.previewMeta, children: meta }), _jsx("div", { className: css.previewBody, children: _jsx("p", { children: props.node.content }) })] }) }));
}
const SAFE_LINK_PATTERN = /^(?:https?:|mailto:|#|\/)/iu;
function safeLink(href) {
    if (href == null)
        return undefined;
    const value = href.trim();
    return SAFE_LINK_PATTERN.test(value) ? value : undefined;
}
/** Render managed Markdown without raw HTML and with a deliberately small link surface. */
function DocumentMarkdown(props) {
    return (_jsx("div", { className: css.markdownBody, children: _jsx(Markdown, { options: {
                disableParsingRawHTML: true,
                forceBlock: true,
                overrides: {
                    a: {
                        component: ({ href, children, ...rest }) => {
                            const target = safeLink(href);
                            return target === undefined
                                ? _jsx("span", { children: children })
                                : _jsx("a", { ...rest, href: target, target: target.startsWith('http') ? '_blank' : undefined, rel: target.startsWith('http') ? 'noreferrer noopener' : undefined, children: children });
                        },
                    },
                },
            }, children: props.content }) }));
}
function InsightCard(props) {
    const t = useT();
    const appearance = useMnemonViewAppearance();
    const [confirming, setConfirming] = useState(false);
    const [forgetting, setForgetting] = useState(false);
    const { insight } = props;
    const neutralActionClass = appearance.surface === 'sidebar'
        ? appearanceClass(css.ghostButton, appearance.classes.itemActionButton)
        : css.ghostButton;
    const forgetActionClass = appearance.surface === 'sidebar'
        ? appearanceClass(css.dangerButton, appearanceClass(appearance.classes.itemActionButton, appearance.classes.itemDangerAction))
        : css.dangerButton;
    const inlineConfirming = appearance.surface === 'buildin' && confirming;
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
    return (_jsxs(_Fragment, { children: [_jsxs("article", { className: css.insightCard, children: [_jsxs("div", { className: css.cardTop, children: [_jsx("div", { className: css.badges, children: meta.map(entry => _jsx("span", { className: css.badge, children: entry }, entry)) }), _jsx("code", { className: css.id, title: insight.id, children: insight.id.slice(0, 8) })] }), _jsx("p", { className: css.content, children: insight.content }), (insight.tags?.length ?? 0) > 0 && _jsx("div", { className: css.tags, children: insight.tags.map(tag => _jsxs("span", { children: ["#", tag] }, tag)) }), (insight.entities?.length ?? 0) > 0 && _jsx("div", { className: css.entities, children: insight.entities.map(entity => _jsx("span", { children: entity }, entity)) }), _jsx("div", { className: css.cardActions, children: inlineConfirming ? (_jsxs("div", { className: css.confirmBar, role: "group", "aria-label": t('card.confirmAria'), children: [_jsx("span", { children: t('card.confirmText') }), _jsx("button", { type: "button", className: css.dangerSolidButton, disabled: forgetting, onClick: () => void forget(), children: forgetting ? t('card.processing') : t('card.confirmForget') }), _jsx("button", { type: "button", className: css.ghostButton, disabled: forgetting, onClick: () => setConfirming(false), children: t('common.cancel') })] })) : (_jsxs(_Fragment, { children: [props.onRelated !== undefined && _jsx("button", { type: "button", className: neutralActionClass, onClick: () => props.onRelated?.(insight), children: t('card.related') }), props.onClone !== undefined && _jsx("button", { type: "button", className: neutralActionClass, onClick: () => props.onClone?.(insight), children: t('card.clone') }), _jsx("button", { type: "button", className: neutralActionClass, onClick: () => void navigator.clipboard?.writeText(insight.id), children: t('common.copyId') }), props.writeEnabled && _jsx("button", { type: "button", className: forgetActionClass, onClick: () => setConfirming(true), children: t('card.forget') })] })) })] }), appearance.surface === 'sidebar' && confirming && _jsx(SidebarModal, { title: t('card.confirmText'), description: `${insight.memoryBodyName ?? insight.memoryBodyId ?? ''}${insight.memoryBodyName === undefined && insight.memoryBodyId === undefined ? '' : ' · '}${insight.id}`, busy: forgetting, onClose: () => setConfirming(false), children: _jsxs("div", { className: css.bodyDeleteConfirm, children: [_jsxs("div", { className: css.bodyDeleteSummary, children: [_jsx("strong", { children: insight.content }), _jsx("span", { children: meta.join(' · ') })] }), _jsxs("div", { className: css.bodyEditActions, children: [_jsx("button", { type: "button", "data-autofocus": true, className: css.ghostButton, disabled: forgetting, onClick: () => setConfirming(false), children: t('common.cancel') }), _jsx("button", { type: "button", className: css.dangerSolidButton, disabled: forgetting, onClick: () => void forget(), children: forgetting ? t('card.processing') : t('card.confirmForget') })] })] }) })] }));
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
    return `entity:${encodeURIComponent(normalizeEntity(entity))}`;
}
function normalizeEntity(entity) {
    return entity.normalize('NFKC').trim().toLocaleLowerCase();
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
    // Native Mnemon entity edges connect two memories. This overview renders
    // entities as first-class nodes, so retaining those edges would falsely make
    // a memory-to-memory edge look like an entity-to-memory association.
    const edges = graph.edges.filter(edge => edge.type !== 'entity');
    for (const body of activeBodies) {
        for (const memory of memoriesByBody.get(body.id) ?? []) {
            edges.push({ sourceId: spaceGraphId(body.id), targetId: graphNodeKey(memory), label: 'scope', color: '#708199', type: 'scope' });
        }
    }
    const bodiesById = new Map(activeBodies.map(body => [body.id, body]));
    const indexedEntities = new Map();
    for (const memory of memories) {
        const body = memory.memoryBodyId === undefined ? undefined : bodiesById.get(memory.memoryBodyId);
        if (body === undefined)
            continue;
        const seen = new Set();
        for (const rawEntity of memory.entities ?? []) {
            const entity = rawEntity.trim();
            const key = normalizeEntity(entity);
            if (key === '' || seen.has(key))
                continue;
            seen.add(key);
            const current = indexedEntities.get(key);
            if (current === undefined)
                indexedEntities.set(key, { entity, memories: [memory], bodies: [body] });
            else {
                current.memories.push(memory);
                if (!current.bodies.some(candidate => candidate.id === body.id))
                    current.bodies.push(body);
            }
        }
    }
    const entities = [...indexedEntities.values()].sort((left, right) => right.memories.length - left.memories.length || left.entity.localeCompare(right.entity)).slice(0, 24);
    const entityNodes = entities.map(item => ({
        id: item.entity,
        graphId: entityGraphId(item.entity),
        kind: 'entity',
        category: 'entity',
        content: item.entity,
        color: '#2b9db9',
        occurrenceCount: item.memories.length,
        memoryBodyIds: item.bodies.map(body => body.id),
        memoryBodyNames: item.bodies.map(body => body.name),
    }));
    for (const item of entities) {
        const key = entityGraphId(item.entity);
        for (const memory of item.memories)
            edges.push({ sourceId: key, targetId: graphNodeKey(memory), label: item.entity, color: '#22a879', type: 'entity' });
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
    const visibleKinds = useMemo(() => new Map(visibleNodes.map(node => [graphNodeKey(node), graphNodeKind(node)])), [visibleNodes]);
    const edges = useMemo(() => {
        const priority = new Map([['entity', 0], ['scope', 1], ['causal', 2], ['semantic', 3], ['temporal', 4]]);
        return props.graph.edges
            .filter(edge => visibleIds.has(edge.sourceId) && visibleIds.has(edge.targetId))
            .map((edge, index) => ({ edge, index }))
            .sort((left, right) => (priority.get(left.edge.type ?? 'temporal') ?? 5) - (priority.get(right.edge.type ?? 'temporal') ?? 5) || left.index - right.index)
            .slice(0, 180)
            .map(({ edge }) => edge);
    }, [props.graph.edges, visibleIds]);
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
                        return _jsx("path", { d: `M ${source.x} ${source.y} Q ${controlX} ${controlY} ${target.x} ${target.y}`, className: css.graphEdge, "data-edge": edge.type ?? 'temporal', "data-source-id": edge.sourceId, "data-target-id": edge.targetId, "data-source-kind": visibleKinds.get(edge.sourceId), "data-target-kind": visibleKinds.get(edge.targetId) }, `${edge.sourceId}-${edge.targetId}-${index}`);
                    }), visibleNodes.map((node, index) => {
                        const nodeKey = graphNodeKey(node);
                        const position = positions.get(nodeKey) ?? naturalLayout.get(nodeKey) ?? { x: GRAPH_WIDTH / 2, y: GRAPH_HEIGHT / 2 };
                        const selected = props.selectedId === nodeKey;
                        const showLabel = selected || visibleNodes.length < 22 || index % 3 === 0;
                        return (_jsxs("g", { className: css.graphNode, "data-node-id": nodeKey, "data-category": node.category ?? 'general', "data-kind": graphNodeKind(node), "data-selected": selected || undefined, transform: `translate(${position.x} ${position.y})`, role: "button", tabIndex: 0, "aria-label": `${graphKindLabel(t, node)}: ${short(node.content, 80)}`, "data-dragging": dragRef.current?.nodeId === nodeKey || undefined, onPointerDown: event => beginDrag(event, nodeKey), onPointerMove: moveDrag, onPointerUp: endDrag, onPointerCancel: cancelDrag, onLostPointerCapture: cancelDrag, onClick: () => props.onSelect(node), onKeyDown: event => {
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
    const appearance = useMnemonViewAppearance();
    const [graph, setGraph] = useState(null);
    const [catalog, setCatalog] = useState(null);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [changing, setChanging] = useState(null);
    const [creating, setCreating] = useState(false);
    const [creatingBodyOpen, setCreatingBodyOpen] = useState(false);
    const [bodyName, setBodyName] = useState('');
    const [bodyDescription, setBodyDescription] = useState('');
    const [catalogUnavailable, setCatalogUnavailable] = useState(false);
    const [editingBody, setEditingBody] = useState(null);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [savingBody, setSavingBody] = useState(null);
    const [confirmingDeleteBody, setConfirmingDeleteBody] = useState(null);
    const [deletingBody, setDeletingBody] = useState(null);
    const [preview, setPreview] = useState(null);
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
    const beginEdit = (body) => {
        setEditingBody(body.id);
        setEditName(body.name);
        setEditDescription(body.description ?? '');
        setError(null);
    };
    const saveEdit = async (event, body) => {
        event.preventDefault();
        if (editName.trim() === '')
            return;
        setSavingBody(body.id);
        setError(null);
        try {
            await props.client.updateBody(body.id, { name: editName, description: editDescription });
            setEditingBody(null);
            await load(true);
            props.onMutate();
        }
        catch (reason) {
            setError(message(reason));
        }
        finally {
            setSavingBody(null);
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
            if (appearance.surface === 'sidebar')
                setCreatingBodyOpen(false);
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
    const deleteBody = async (body) => {
        setDeletingBody(body.id);
        setError(null);
        try {
            await props.client.deleteBody(body.id);
            setConfirmingDeleteBody(null);
            await load(true);
            props.onMutate();
        }
        catch (reason) {
            setError(message(reason));
        }
        finally {
            setDeletingBody(null);
        }
    };
    const generated = graph === null ? t('overview.waitingSnapshot') : t('overview.updatedAt', { time: new Date(graph.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) });
    const graphSpaces = graph?.nodes.filter(node => graphNodeKind(node) === 'space').length ?? 0;
    const graphEntities = graph?.nodes.filter(node => graphNodeKind(node) === 'entity').length ?? 0;
    const graphMemories = graph?.nodes.filter(node => graphNodeKind(node) === 'memory').length ?? 0;
    const selectedKind = selected === null ? null : graphNodeKind(selected);
    const editingBodyView = editingBody === null ? undefined : catalog?.items.find(body => body.id === editingBody);
    const deletingBodyView = confirmingDeleteBody === null ? undefined : catalog?.items.find(body => body.id === confirmingDeleteBody);
    const bodyEditForm = (body) => _jsxs("form", { className: css.bodyEdit, onSubmit: event => void saveEdit(event, body), children: [_jsxs("label", { children: [t('overview.editName'), _jsx("input", { "aria-label": t('overview.editName'), value: editName, onChange: event => setEditName(event.target.value), maxLength: 100, required: true })] }), _jsxs("label", { children: [t('overview.editDescription'), _jsx("textarea", { "aria-label": t('overview.editDescription'), value: editDescription, onChange: event => setEditDescription(event.target.value), rows: 4, maxLength: 1000 })] }), _jsxs("div", { className: css.bodyEditActions, children: [appearance.surface === 'sidebar' && _jsx("button", { type: "button", className: css.ghostButton, disabled: savingBody === body.id, onClick: () => setEditingBody(null), children: t('common.cancel') }), _jsx("button", { type: "submit", className: css.primaryButton, disabled: savingBody === body.id || editName.trim() === '', children: savingBody === body.id ? t('overview.savingBody') : t('overview.saveBody') }), appearance.surface === 'buildin' && _jsx("button", { type: "button", className: css.ghostButton, onClick: () => setEditingBody(null), children: t('common.cancel') })] })] });
    const bodyCreateForm = _jsxs("form", { className: css.bodyEdit, onSubmit: event => void create(event), children: [_jsxs("label", { children: [t('overview.createName'), _jsx("input", { "aria-label": t('overview.createName'), value: bodyName, onChange: event => setBodyName(event.target.value), placeholder: t('overview.createNamePlaceholder'), maxLength: 100, required: true })] }), _jsxs("label", { children: [t('overview.createDescription'), _jsx("textarea", { "aria-label": t('overview.createDescription'), value: bodyDescription, onChange: event => setBodyDescription(event.target.value), placeholder: t('overview.createDescriptionPlaceholder'), rows: 5, maxLength: 1000, required: true })] }), _jsxs("div", { className: css.bodyEditActions, children: [_jsx("button", { type: "button", className: css.ghostButton, disabled: creating, onClick: () => setCreatingBodyOpen(false), children: t('common.cancel') }), _jsx("button", { type: "submit", className: css.primaryButton, disabled: creating || bodyName.trim() === '' || bodyDescription.trim() === '', children: creating ? t('overview.creating') : t('overview.createAction') })] })] });
    const bodyToggle = (body) => _jsxs("button", { type: "button", className: css.bodySwitch, role: "switch", "aria-checked": body.active, "aria-label": t('overview.toggleAria', { name: body.name }), disabled: !props.writeEnabled || changing === body.id || deletingBody === body.id, onClick: () => void toggle(body), children: [_jsx("span", { className: css.bodySwitchTrack, "aria-hidden": "true", children: _jsx("i", {}) }), _jsx("span", { children: changing === body.id ? t('overview.toggling') : body.active ? t('common.active') : t('common.inactive') })] });
    const bodyEditActionClass = appearanceClass(css.ghostButton, appearanceClass(appearance.classes.itemActionButton, appearance.classes.itemEditAction));
    const bodyDeleteActionClass = appearanceClass(css.dangerButton, appearanceClass(appearance.classes.itemActionButton, appearance.classes.itemDangerAction));
    return (_jsxs("div", { className: css.page, children: [_jsx(PageHeader, { title: appearance.surface === 'sidebar' ? t('nav.overview') : t('overview.title'), description: t(appearance.surface === 'sidebar' ? 'overview.pageDescription' : 'overview.description'), meta: t('overview.interval'), action: _jsx("button", { type: "button", className: css.secondaryButton, disabled: loading, onClick: () => void load(), children: loading ? t('overview.syncing') : t('overview.syncNow') }) }), error !== null && _jsx("div", { className: css.inlineError, role: "alert", children: error }), _jsxs("section", { className: css.bodyDirectory, "aria-label": t('overview.directory'), children: [_jsxs("div", { className: css.bodyDirectoryHeader, children: [_jsxs("div", { children: [_jsx("h3", { children: t('overview.directory') }), _jsx("p", { children: t('overview.directory.description') }), _jsx("code", { className: css.bodyDirectoryPath, children: catalogUnavailable ? t('overview.directory.unsynced') : catalog?.directory || props.fallbackDirectory || t('overview.directory.waiting') })] }), appearance.surface === 'sidebar' ? _jsxs("div", { className: appearance.classes.bodyDirectoryActions, children: [_jsx("strong", { children: catalogUnavailable ? t('overview.directory.unsyncedBadge') : `${catalog?.activeCount ?? '—'} / ${catalog?.total ?? '—'} ${t('common.active')}` }), props.writeEnabled && !catalogUnavailable && _jsx("button", { type: "button", className: bodyEditActionClass, onClick: () => setCreatingBodyOpen(true), children: t('overview.createTitle') })] }) : _jsx("strong", { children: catalogUnavailable ? t('overview.directory.unsyncedBadge') : `${catalog?.activeCount ?? '—'} / ${catalog?.total ?? '—'} ${t('common.active')}` })] }), _jsxs("div", { className: css.bodyGrid, children: [catalog?.items.map(body => (_jsx("article", { className: css.bodyCard, "data-active": body.active || undefined, "data-healthy": body.healthy || undefined, "data-editing": (appearance.surface === 'buildin' && editingBody === body.id) || undefined, title: body.error, children: appearance.surface === 'buildin'
                                    ? editingBody === body.id
                                        ? bodyEditForm(body)
                                        : _jsxs(_Fragment, { children: [_jsxs("div", { className: css.bodyCardTop, children: [_jsx("span", { className: css.bodySignal }), _jsxs("div", { children: [_jsx("strong", { children: body.name }), _jsx("code", { children: body.id }), _jsx("small", { className: css.bodyHealth, children: body.healthy ? t('overview.storageHealthy') : t('overview.storageUnhealthy') })] }), _jsxs("div", { className: css.bodyCardActions, children: [bodyToggle(body), _jsx("button", { type: "button", className: css.bodyEditButton, "aria-label": t('overview.editBodyAria', { name: body.name }), title: t('overview.editBody'), disabled: !props.writeEnabled, onClick: () => beginEdit(body), children: "\u270E" })] })] }), _jsx("p", { children: body.description || t('overview.noDescription') }), _jsxs("footer", { children: [_jsx("span", { children: t('common.memories', { count: body.stats?.totalInsights ?? 0 }) }), _jsx("span", { children: t('common.edges', { count: body.stats?.edgeCount ?? 0 }) }), _jsx("span", { children: humanBytes(body.stats?.dbSizeBytes ?? 0) })] })] })
                                    : _jsxs(_Fragment, { children: [_jsxs("div", { className: appearance.classes.bodyCardHeader, children: [_jsxs("div", { className: appearance.classes.bodyCardIdentity, children: [_jsx("span", { className: css.bodySignal }), _jsxs("div", { children: [_jsx("strong", { children: body.name }), _jsxs("div", { className: appearance.classes.bodyCardMeta, children: [_jsx("code", { children: body.id }), _jsx("small", { className: css.bodyHealth, children: body.healthy ? t('overview.storageHealthy') : t('overview.storageUnhealthy') })] })] })] }), bodyToggle(body)] }), _jsx("p", { title: body.description || t('overview.noDescription'), children: body.description || t('overview.noDescription') }), _jsxs("footer", { className: appearance.classes.bodyCardFooter, children: [_jsxs("div", { className: appearance.classes.bodyCardStats, children: [_jsx("span", { children: t('common.memories', { count: body.stats?.totalInsights ?? 0 }) }), _jsx("span", { children: t('common.edges', { count: body.stats?.edgeCount ?? 0 }) }), _jsx("span", { children: humanBytes(body.stats?.dbSizeBytes ?? 0) })] }), _jsxs("div", { className: css.bodyCardActions, children: [_jsx("button", { type: "button", className: bodyEditActionClass, "aria-label": t('overview.editBodyAria', { name: body.name }), disabled: !props.writeEnabled || deletingBody === body.id, onClick: () => beginEdit(body), children: t('overview.editBody') }), _jsx("button", { type: "button", className: bodyDeleteActionClass, "aria-label": t('overview.deleteBodyAria', { name: body.name }), disabled: !props.writeEnabled || deletingBody === body.id, onClick: () => setConfirmingDeleteBody(body.id), children: t('overview.deleteBody') })] })] })] }) }, body.id))), catalog?.total === 0 && _jsxs("div", { className: css.bodyDirectoryEmpty, children: [_jsx("span", { children: "\u25C7" }), _jsxs("div", { children: [_jsx("strong", { children: catalogUnavailable ? t('overview.unsyncedTitle') : t('overview.emptyTitle') }), _jsx("p", { children: catalogUnavailable ? t('overview.unsyncedShort') : t('overview.emptyShort') })] })] })] }), appearance.surface === 'buildin' && props.writeEnabled && !catalogUnavailable && _jsxs("details", { className: css.bodyCreate, open: catalog?.total === 0 ? true : undefined, children: [_jsx("summary", { children: t('overview.create') }), _jsxs("form", { onSubmit: event => void create(event), children: [_jsx("input", { "aria-label": t('overview.createName'), value: bodyName, onChange: event => setBodyName(event.target.value), placeholder: t('overview.createNamePlaceholder'), required: true }), _jsx("input", { "aria-label": t('overview.createDescription'), value: bodyDescription, onChange: event => setBodyDescription(event.target.value), placeholder: t('overview.createDescriptionPlaceholder'), required: true }), _jsx("button", { type: "submit", className: css.secondaryButton, disabled: creating, children: creating ? t('overview.creating') : t('overview.createAction') })] })] })] }), appearance.surface === 'sidebar' && creatingBodyOpen && _jsx(SidebarModal, { title: t('overview.createTitle'), description: catalog?.directory || props.fallbackDirectory || t('overview.directory.waiting'), busy: creating, onClose: () => setCreatingBodyOpen(false), children: bodyCreateForm }), appearance.surface === 'sidebar' && editingBodyView !== undefined && _jsx(SidebarModal, { title: t('overview.editBodyAria', { name: editingBodyView.name }), description: editingBodyView.id, busy: savingBody === editingBodyView.id, onClose: () => setEditingBody(null), children: bodyEditForm(editingBodyView) }), appearance.surface === 'sidebar' && deletingBodyView !== undefined && _jsx(SidebarModal, { title: t('overview.deleteTitle', { name: deletingBodyView.name }), description: deletingBodyView.id, busy: deletingBody === deletingBodyView.id, onClose: () => setConfirmingDeleteBody(null), children: _jsxs("div", { className: css.bodyDeleteConfirm, children: [_jsx("p", { children: t('overview.deleteWarning') }), _jsxs("div", { className: css.bodyDeleteSummary, children: [_jsx("strong", { children: deletingBodyView.name }), _jsxs("span", { children: [t('common.memories', { count: deletingBodyView.stats?.totalInsights ?? 0 }), " \u00B7 ", t('common.edges', { count: deletingBodyView.stats?.edgeCount ?? 0 }), " \u00B7 ", humanBytes(deletingBodyView.stats?.dbSizeBytes ?? 0)] })] }), _jsxs("div", { className: css.bodyEditActions, children: [_jsx("button", { type: "button", "data-autofocus": true, className: css.ghostButton, disabled: deletingBody === deletingBodyView.id, onClick: () => setConfirmingDeleteBody(null), children: t('common.cancel') }), _jsx("button", { type: "button", className: css.dangerSolidButton, disabled: deletingBody === deletingBodyView.id, onClick: () => void deleteBody(deletingBodyView), children: deletingBody === deletingBodyView.id ? t('overview.deletingBody') : t('overview.deleteAction') })] })] }) }), !catalogUnavailable && graph !== null && graph.nodes.length > 0 ? (_jsxs("div", { className: css.graphLayout, children: [_jsxs("section", { className: css.graphPanel, children: [_jsxs("div", { className: css.graphToolbar, children: [_jsxs("div", { children: [_jsx("span", { className: css.liveDot }), t('overview.snapshot'), " ", _jsx("small", { children: generated })] }), _jsxs("div", { className: css.graphLegend, children: [_jsx("span", { "data-edge": "scope", children: t('overview.edgeScope') }), _jsx("span", { "data-edge": "temporal", children: t('overview.edgeTemporal') }), _jsx("span", { "data-edge": "semantic", children: t('overview.edgeSemantic') }), _jsx("span", { "data-edge": "causal", children: t('overview.edgeCausal') }), _jsx("span", { "data-edge": "entity", children: t('overview.edgeEntity') })] })] }), _jsx("div", { className: css.graphViewport, children: _jsx(MemoryGraph, { graph: graph, selectedId: selected === null ? undefined : graphNodeKey(selected), onSelect: setSelected }) }), _jsxs("div", { className: css.graphFooter, children: [_jsx("span", { children: t('overview.graphComposition', { spaces: graphSpaces, memories: graphMemories, entities: graphEntities }) }), _jsxs("span", { children: [t('overview.graphCount', { visible: Math.min(graph.nodes.length, 60), total: graph.nodes.length }), " \u00B7 ", t('overview.graphEdges', { count: graph.edges.length })] })] })] }), _jsx("aside", { className: css.graphInspector, "data-empty": selected === null || undefined, children: selected === null ? (_jsxs("div", { className: css.inspectorEmpty, children: [appearance.showLogo ? _jsx(MnemonLogo, { className: css.inspectorLogo, title: t('overview.inspector') }) : _jsx("span", { className: appearanceClass(css.inspectorLogo, appearance.classes.inspectorGlyph), "aria-hidden": "true", children: "\u25C7" }), _jsx("h3", { children: t('overview.selectNode') }), _jsx("p", { children: t('overview.selectNodeText') })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: css.inspectorHeading, children: [_jsx("span", { children: t(selectedKind === 'space' ? 'overview.inspectorSpace' : selectedKind === 'entity' ? 'overview.inspectorEntity' : 'overview.inspector') }), _jsx("button", { type: "button", onClick: () => setSelected(null), "aria-label": t('overview.closeInspector'), children: "\u00D7" })] }), _jsx("span", { className: css.categoryChip, children: graphKindLabel(t, selected) }), _jsxs("div", { className: css.inspectorTitleRow, children: [_jsx("h3", { className: css.inspectorTitle, children: selected.content }), selectedKind === 'memory' && selected.content.length > 140 && _jsx("button", { type: "button", className: css.inspectorEye, onClick: () => setPreview(selected), "aria-label": t('overview.previewAria'), title: t('overview.previewAria'), children: _jsxs("svg", { viewBox: "0 0 16 16", width: "13", height: "13", "aria-hidden": "true", children: [_jsx("path", { d: "M1 8s2.6-4.4 7-4.4S15 8 15 8s-2.6 4.4-7 4.4S1 8 1 8z", fill: "none", stroke: "currentColor", strokeWidth: "1.5" }), _jsx("circle", { cx: "8", cy: "8", r: "2.1", fill: "currentColor" })] }) })] }), selectedKind === 'space'
                                    ? _jsxs("dl", { className: css.inspectorMeta, children: [_jsxs("div", { children: [_jsx("dt", { children: t('overview.spaceId') }), _jsx("dd", { children: _jsx("code", { children: selected.memoryBodyId ?? selected.id }) })] }), _jsxs("div", { children: [_jsx("dt", { children: t('overview.containedMemories') }), _jsx("dd", { children: selected.occurrenceCount ?? 0 })] })] })
                                    : selectedKind === 'entity'
                                        ? _jsxs("dl", { className: css.inspectorMeta, children: [_jsxs("div", { children: [_jsx("dt", { children: t('overview.entityMentions') }), _jsx("dd", { children: selected.occurrenceCount ?? 0 })] }), _jsxs("div", { children: [_jsx("dt", { children: t('term.spaces') }), _jsx("dd", { children: selected.memoryBodyNames?.join(' · ') || '—' })] })] })
                                        : _jsxs("dl", { className: css.inspectorMeta, children: [_jsxs("div", { children: [_jsx("dt", { children: t('term.space') }), _jsxs("dd", { children: [selected.memoryBodyName ?? '—', " ", _jsx("code", { children: selected.memoryBodyId ?? '' })] })] }), _jsxs("div", { children: [_jsx("dt", { children: t('overview.memoryId') }), _jsx("dd", { children: _jsx("code", { children: selected.id }) })] }), _jsxs("div", { children: [_jsx("dt", { children: t('common.category') }), _jsx("dd", { children: categoryLabel(t, selected.category ?? 'general') })] })] }), _jsxs("div", { className: css.inspectorActions, children: [selectedKind !== 'space' && _jsx("button", { type: "button", className: css.primaryButton, onClick: () => props.onExplore(selected.content), children: t('overview.exploreNode') }), _jsx("button", { type: "button", className: css.secondaryButton, onClick: () => void navigator.clipboard?.writeText(selected.id), children: t('common.copyId') })] })] })) })] })) : !loading && error === null ? (catalogUnavailable
                ? _jsx(EmptyState, { glyph: "\u25C7", title: t('overview.unsyncedTitle'), children: t('overview.unsyncedLong') })
                : catalog?.total === 0
                    ? _jsx(EmptyState, { glyph: "\u25C7", title: t('overview.emptyTitle'), children: t('overview.emptyLong') })
                    : catalog?.activeCount === 0
                        ? _jsx(EmptyState, { glyph: "\u25C7", title: t('overview.noActiveTitle'), children: t('overview.noActiveText') })
                        : _jsx(EmptyState, { glyph: "\u25C7", title: t('overview.noContentTitle'), children: t('overview.noContentText') })) : (_jsx("div", { className: css.loadingPanel, children: t('overview.loading') })), preview !== null && _jsx(ContentPreview, { node: preview, kind: graphKindLabel(t, preview), onClose: () => setPreview(null) })] }));
}
function ExplorePage(props) {
    const t = useT();
    const appearance = useMnemonViewAppearance();
    const pageSize = appearance.surface === 'sidebar' ? 6 : Number.MAX_SAFE_INTEGER;
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
    const [visibleResultLimit, setVisibleResultLimit] = useState(pageSize);
    const [visibleRelatedLimit, setVisibleRelatedLimit] = useState(pageSize);
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
        setVisibleResultLimit(pageSize);
        setVisibleRelatedLimit(pageSize);
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
        setVisibleRelatedLimit(pageSize);
        if (typeof window.requestAnimationFrame === 'function')
            window.requestAnimationFrame(() => document.getElementById('mnemon-related-pane')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
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
    const visibleResults = results.slice(0, visibleResultLimit);
    const visibleRelated = related.slice(0, visibleRelatedLimit);
    return (_jsxs("div", { className: css.page, children: [_jsx(PageHeader, { title: t('search.title'), description: t('search.description'), meta: t('search.maxResults', { count: props.status?.defaultRecallLimit ?? '—' }) }), _jsxs("form", { className: css.searchBar, onSubmit: event => void search(event), children: [_jsxs("div", { className: css.queryField, children: [_jsx("span", { "aria-hidden": "true", children: "\u2315" }), _jsx("input", { value: query, onChange: event => setQuery(event.target.value), placeholder: t('search.placeholder'), "aria-label": t('search.queryAria') }), _jsx("kbd", { children: "\u21B5" })] }), _jsxs("div", { className: css.searchControls, children: [_jsxs("label", { children: [t('common.category'), _jsxs("select", { value: category, onChange: event => setCategory(event.target.value), "aria-label": t('search.categoryAria'), children: [_jsx("option", { value: "", children: t('common.allCategories') }), CATEGORIES.map(value => _jsx("option", { value: value, children: categoryLabel(t, value) }, value))] })] }), _jsxs("label", { children: [t('search.strategy'), _jsxs("select", { value: mode, onChange: event => setMode(event.target.value), "aria-label": t('search.modeAria'), children: [_jsx("option", { value: "smart", children: t('search.modeSmart') }), _jsx("option", { value: "keyword", children: t('search.modeKeyword') }), _jsx("option", { value: "basic", children: t('search.modeBasic') })] })] }), _jsxs("div", { className: css.searchActions, children: [_jsx("button", { type: "submit", className: css.secondaryButton, disabled: searching || query.trim() === '', children: searchKind === 'direct' ? t('search.searching') : t('search.action') }), _jsx("button", { type: "button", className: css.primaryButton, disabled: searching || query.trim() === '' || props.status?.lifecycle?.sessionAvailable !== true, onClick: () => void runSearch(true), children: searchKind === 'agent' ? t('search.agentSearching') : t('search.agentAction') })] })] })] }), agentAnswer !== null && _jsxs("section", { className: css.agentAnswer, "aria-label": t('search.agentAnswer'), children: [_jsxs("div", { className: css.agentAnswerHeading, children: [_jsxs("div", { children: [_jsx("span", { children: t('search.agentAnswerHint') }), _jsx("h3", { children: t('search.agentAnswer') })] }), _jsx("code", { children: agentAnswer.runId.slice(0, 8) })] }), _jsx("p", { children: agentAnswer.answer }), agentAnswer.citations.length > 0 && _jsx("div", { className: css.agentCitations, children: agentAnswer.citations.map(citation => _jsx("code", { children: citation }, citation)) })] }), error !== null && _jsx("div", { className: css.inlineError, role: "alert", children: error }), !searched && _jsx(EmptyState, { glyph: "\u2315", title: t('search.startTitle'), children: t('search.startText') }), searched && !searching && results.length === 0 && error === null && _jsx(EmptyState, { glyph: "0", title: t('search.emptyTitle'), children: t('search.emptyText') }), results.length > 0 && (_jsxs("div", { className: relatedTo === null ? css.singleColumn : css.resultLayout, children: [_jsxs("section", { className: css.results, children: [_jsxs("div", { className: css.sectionHeading, children: [_jsx("div", { children: _jsx("h3", { children: t('search.results') }) }), _jsx("strong", { children: results.length })] }), visibleResults.map(insight => _jsx(InsightCard, { insight: insight, writeEnabled: props.writeEnabled, onForget: forget, onRelated: item => void showRelated(item) }, insightKey(insight))), appearance.surface === 'sidebar' && _jsx(ProgressiveFooter, { visible: visibleResults.length, total: results.length, pageSize: pageSize, onMore: () => setVisibleResultLimit(value => value + pageSize) })] }), relatedTo !== null && _jsxs("aside", { id: "mnemon-related-pane", className: css.relatedPane, children: [_jsxs("div", { className: css.sectionHeading, children: [_jsx("div", { children: _jsx("h3", { children: t('search.related') }) }), _jsx("button", { type: "button", onClick: () => setRelatedTo(null), "aria-label": t('search.closeRelated'), children: "\u00D7" })] }), _jsx("p", { className: css.relatedSource, children: relatedTo.content }), relatedLoading && _jsx("div", { className: css.loading, children: t('search.traversing') }), !relatedLoading && related.length === 0 && _jsx("div", { className: css.muted, children: t('search.noRelated') }), visibleRelated.map(insight => _jsx(InsightCard, { insight: insight, writeEnabled: props.writeEnabled, onForget: forget, onRelated: item => void showRelated(item) }, insightKey(insight))), appearance.surface === 'sidebar' && !relatedLoading && _jsx(ProgressiveFooter, { visible: visibleRelated.length, total: related.length, pageSize: pageSize, onMore: () => setVisibleRelatedLimit(value => value + pageSize) })] })] }))] }));
}
function EntitiesPage(props) {
    const t = useT();
    const appearance = useMnemonViewAppearance();
    const entityPageSize = appearance.surface === 'sidebar' ? 10 : Number.MAX_SAFE_INTEGER;
    const insightPageSize = appearance.surface === 'sidebar' ? 6 : Number.MAX_SAFE_INTEGER;
    const [view, setView] = useState({ items: [], insights: [] });
    const [entity, setEntity] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [visibleEntityLimit, setVisibleEntityLimit] = useState(entityPageSize);
    const [visibleInsightLimit, setVisibleInsightLimit] = useState(insightPageSize);
    const load = useCallback(async (selected) => {
        setLoading(true);
        setError(null);
        setVisibleInsightLimit(insightPageSize);
        if (selected === undefined)
            setVisibleEntityLimit(entityPageSize);
        try {
            setView(await props.client.entities(selected, 20));
        }
        catch (reason) {
            setError(message(reason));
        }
        finally {
            setLoading(false);
        }
    }, [entityPageSize, insightPageSize, props.client]);
    useEffect(() => { void load(); }, [load, props.revision]);
    const submit = (event) => { event.preventDefault(); if (entity.trim() !== '')
        void load(entity); };
    const visibleEntities = view.items.slice(0, visibleEntityLimit);
    const visibleInsights = view.insights.slice(0, visibleInsightLimit);
    return (_jsxs("div", { className: css.page, children: [_jsx(PageHeader, { title: t('entities.title'), description: t('entities.description'), meta: t('entities.count', { count: view.items.length }) }), _jsxs("div", { className: css.entityLayout, children: [_jsxs("aside", { className: css.entityRail, children: [_jsxs("form", { className: css.entitySearch, onSubmit: submit, children: [_jsx("input", { "aria-label": t('entities.nameAria'), value: entity, onChange: event => setEntity(event.target.value), placeholder: t('entities.placeholder') }), _jsx("button", { type: "submit", className: css.primaryButton, disabled: loading || entity.trim() === '', children: t('entities.action') })] }), _jsxs("div", { className: css.entityHeading, children: [_jsx("span", { children: t('entities.top') }), _jsx("small", { children: t('entities.frequency') })] }), _jsx("div", { className: css.entityList, children: visibleEntities.map(item => _jsxs("button", { type: "button", "aria-pressed": view.selected === item.entity, onClick: () => { setEntity(item.entity); void load(item.entity); }, children: [_jsx("span", { children: item.entity }), _jsx("strong", { children: item.count })] }, item.entity)) }), appearance.surface === 'sidebar' && _jsx(ProgressiveFooter, { compact: true, visible: visibleEntities.length, total: view.items.length, pageSize: entityPageSize, onMore: () => setVisibleEntityLimit(value => value + entityPageSize) }), !loading && view.items.length === 0 && _jsx("p", { className: css.muted, children: t('entities.emptyRail') })] }), _jsxs("section", { className: css.entityResults, children: [error !== null && _jsx("div", { className: css.inlineError, role: "alert", children: error }), loading && _jsx("div", { className: css.loadingPanel, children: t('entities.loading') }), !loading && view.selected === undefined && _jsx(EmptyState, { glyph: "\u25CE", title: t('entities.selectTitle'), children: t('entities.selectText') }), !loading && view.selected !== undefined && _jsxs(_Fragment, { children: [_jsxs("div", { className: css.sectionHeading, children: [_jsx("div", { children: _jsx("h3", { children: view.selected }) }), _jsx("strong", { children: view.insights.length })] }), view.insights.length === 0 ? _jsx(EmptyState, { glyph: "0", title: t('entities.emptyTitle'), children: t('entities.emptyText') }) : _jsxs(_Fragment, { children: [visibleInsights.map(insight => _jsx(InsightCard, { insight: insight, writeEnabled: props.writeEnabled, onForget: props.onForget, onRelated: () => props.onExplore(insight.content) }, insightKey(insight))), appearance.surface === 'sidebar' && _jsx(ProgressiveFooter, { visible: visibleInsights.length, total: view.insights.length, pageSize: insightPageSize, onMore: () => setVisibleInsightLimit(value => value + insightPageSize) })] })] })] })] })] }));
}
function RuntimePage(props) {
    const t = useT();
    const appearance = useMnemonViewAppearance();
    const pageSize = 10;
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
    const [adding, setAdding] = useState(false);
    const [filterTarget, setFilterTarget] = useState('all');
    const [filterQuery, setFilterQuery] = useState('');
    const [visibleLimit, setVisibleLimit] = useState(pageSize);
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
    useEffect(() => { setVisibleLimit(pageSize); }, [filterQuery, filterTarget]);
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
            if (appearance.surface === 'sidebar')
                setAdding(false);
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
    const runtimeEditActionClass = appearance.surface === 'sidebar'
        ? appearanceClass(css.ghostButton, appearanceClass(appearance.classes.itemActionButton, appearance.classes.itemEditAction))
        : css.ghostButton;
    const runtimeRemoveActionClass = appearance.surface === 'sidebar'
        ? appearanceClass(css.dangerButton, appearanceClass(appearance.classes.itemActionButton, appearance.classes.itemDangerAction))
        : css.dangerButton;
    const runtimeEntry = (entry, showTarget = false) => {
        const key = entryKey(entry);
        const isEditing = editing === key;
        const isInlineEditing = appearance.surface === 'buildin' && isEditing;
        const isRemoving = removing === key;
        const isInlineRemoving = appearance.surface === 'buildin' && isRemoving;
        return _jsxs("article", { className: css.runtimeEntry, "data-importance": entry.importance, "data-target": entry.target, children: [_jsxs("div", { className: css.runtimeEntryMeta, children: [showTarget ? _jsxs("div", { className: css.runtimeEntryBadges, children: [_jsx("span", { className: css.runtimeEntryTarget, children: entry.target === 'user' ? 'USER.md' : 'MEMORY.md' }), _jsx("span", { children: t(`runtime.importance.${entry.importance}`) })] }) : _jsx("span", { children: t(`runtime.importance.${entry.importance}`) }), _jsx("time", { dateTime: entry.updated_at, children: new Date(entry.updated_at).toLocaleString() })] }), isInlineEditing ? _jsx("textarea", { "aria-label": t('runtime.editContent'), value: editContent, onChange: event => setEditContent(event.target.value), rows: 4 }) : _jsx("p", { children: entry.content }), isInlineEditing && _jsxs("select", { "aria-label": t('runtime.importance'), value: editImportance, onChange: event => setEditImportance(event.target.value), children: [_jsx("option", { value: "critical", children: t('runtime.importance.critical') }), _jsx("option", { value: "normal", children: t('runtime.importance.normal') }), _jsx("option", { value: "low", children: t('runtime.importance.low') })] }), _jsx("footer", { children: isInlineRemoving ? _jsxs(_Fragment, { children: [_jsx("span", { children: t('runtime.removeConfirm') }), _jsx("button", { type: "button", className: css.dangerSolidButton, disabled: saving, onClick: () => void remove(entry), children: t('runtime.removeAction') }), _jsx("button", { type: "button", className: css.ghostButton, onClick: () => setRemoving(null), children: t('common.cancel') })] }) : isInlineEditing ? _jsxs(_Fragment, { children: [_jsx("button", { type: "button", className: css.primaryButton, disabled: saving || editContent.trim() === '', onClick: () => void replace(entry), children: t('runtime.saveEdit') }), _jsx("button", { type: "button", className: css.ghostButton, onClick: () => setEditing(null), children: t('common.cancel') })] }) : props.writeEnabled ? _jsxs(_Fragment, { children: [_jsx("button", { type: "button", className: runtimeEditActionClass, disabled: saving && isRemoving, onClick: () => beginEdit(entry), children: t('runtime.editAction') }), _jsx("button", { type: "button", className: runtimeRemoveActionClass, disabled: saving && isRemoving, onClick: () => { setRemoving(key); setEditing(null); }, children: t('runtime.removeAction') })] }) : null })] }, key);
    };
    const targetPanel = (value) => {
        const view = snapshot?.targets[value];
        const entries = snapshot?.entries.filter(entry => entry.target === value) ?? [];
        const percentage = view === undefined || view.limit === 0 ? 0 : Math.min(100, Math.round(view.used / view.limit * 100));
        return (_jsxs("section", { className: css.runtimeTarget, "aria-label": t(`runtime.target.${value}`), children: [_jsxs("header", { className: css.runtimeTargetHeader, children: [_jsxs("div", { children: [_jsx("span", { children: value === 'user' ? 'USER.md' : 'MEMORY.md' }), _jsx("h3", { children: t(`runtime.target.${value}`) })] }), _jsx("strong", { children: view?.entryCount ?? 0 })] }), _jsxs("div", { className: css.capacityLine, children: [_jsx("div", { children: _jsx("i", { style: { width: `${percentage}%` } }) }), _jsx("span", { children: view === undefined ? '—' : `${humanBytes(view.used)} / ${humanBytes(view.limit)}` })] }), _jsx("p", { className: css.runtimeTargetDescription, children: t(`runtime.target.${value}.description`) }), _jsxs("div", { className: css.runtimeEntries, children: [entries.map(entry => runtimeEntry(entry)), !loading && entries.length === 0 && _jsxs("div", { className: css.runtimeEmpty, children: [_jsx("span", { children: "\u25CB" }), _jsx("p", { children: t('runtime.empty') })] })] })] }));
    };
    const targetSummary = (value) => {
        const view = snapshot?.targets[value];
        const percentage = view === undefined || view.limit === 0 ? 0 : Math.min(100, Math.round(view.used / view.limit * 100));
        return _jsxs("section", { className: css.runtimeSummaryCard, "aria-label": t(`runtime.target.${value}`), children: [_jsxs("header", { className: css.runtimeTargetHeader, children: [_jsxs("div", { children: [_jsx("span", { children: value === 'user' ? 'USER.md' : 'MEMORY.md' }), _jsx("h3", { children: t(`runtime.target.${value}`) })] }), _jsx("strong", { children: view?.entryCount ?? 0 })] }), _jsxs("div", { className: css.capacityLine, children: [_jsx("div", { children: _jsx("i", { style: { width: `${percentage}%` } }) }), _jsx("span", { children: view === undefined ? '—' : `${humanBytes(view.used)} / ${humanBytes(view.limit)}` })] }), _jsx("p", { className: css.runtimeTargetDescription, children: t(`runtime.target.${value}.description`) })] });
    };
    const normalizedQuery = filterQuery.trim().toLocaleLowerCase();
    const filteredEntries = (snapshot?.entries ?? []).filter(entry => (filterTarget === 'all' || entry.target === filterTarget) && (normalizedQuery === '' || entry.content.toLocaleLowerCase().includes(normalizedQuery)));
    const visibleEntries = filteredEntries.slice(0, visibleLimit);
    const closeComposer = () => {
        setContent('');
        setAdding(false);
    };
    const composer = _jsxs("form", { className: css.runtimeComposer, onSubmit: event => void add(event), children: [_jsxs("div", { className: css.runtimeComposerHeading, children: [_jsxs("div", { children: [_jsx("h3", { children: t('runtime.addTitle') }), _jsx("p", { children: t('runtime.addDescription') })] }), _jsx("span", { children: t('runtime.hotContext') })] }), _jsx("textarea", { "aria-label": t('runtime.content'), value: content, onChange: event => setContent(event.target.value), rows: 3, placeholder: t('runtime.placeholder') }), _jsxs("div", { className: css.runtimeComposerActions, children: [_jsxs("label", { children: [t('runtime.target'), _jsxs("select", { value: target, onChange: event => setTarget(event.target.value), children: [_jsx("option", { value: "memory", children: t('runtime.target.memory') }), _jsx("option", { value: "user", children: t('runtime.target.user') })] })] }), _jsxs("label", { children: [t('runtime.importance'), _jsxs("select", { value: importance, onChange: event => setImportance(event.target.value), children: [_jsx("option", { value: "critical", children: t('runtime.importance.critical') }), _jsx("option", { value: "normal", children: t('runtime.importance.normal') }), _jsx("option", { value: "low", children: t('runtime.importance.low') })] })] }), appearance.surface === 'sidebar' && _jsx("button", { type: "button", className: css.ghostButton, disabled: saving, onClick: closeComposer, children: t('common.cancel') }), _jsx("button", { type: "submit", className: css.primaryButton, disabled: saving || content.trim() === '', children: saving ? t('runtime.saving') : t('runtime.addAction') })] })] });
    const editingEntry = editing === null ? undefined : snapshot?.entries.find(entry => entryKey(entry) === editing);
    const removingEntry = removing === null ? undefined : snapshot?.entries.find(entry => entryKey(entry) === removing);
    const editForm = editingEntry === undefined ? null : _jsxs("form", { className: css.bodyEdit, onSubmit: event => { event.preventDefault(); void replace(editingEntry); }, children: [_jsxs("label", { children: [t('runtime.editContent'), _jsx("textarea", { "aria-label": t('runtime.editContent'), value: editContent, onChange: event => setEditContent(event.target.value), rows: 7 })] }), _jsxs("label", { children: [t('runtime.importance'), _jsxs("select", { "aria-label": t('runtime.importance'), value: editImportance, onChange: event => setEditImportance(event.target.value), children: [_jsx("option", { value: "critical", children: t('runtime.importance.critical') }), _jsx("option", { value: "normal", children: t('runtime.importance.normal') }), _jsx("option", { value: "low", children: t('runtime.importance.low') })] })] }), _jsxs("div", { className: css.bodyEditActions, children: [_jsx("button", { type: "button", className: css.ghostButton, disabled: saving, onClick: () => setEditing(null), children: t('common.cancel') }), _jsx("button", { type: "submit", className: css.primaryButton, disabled: saving || editContent.trim() === '', children: t('runtime.saveEdit') })] })] });
    return (_jsxs("div", { className: css.page, children: [_jsx(PageHeader, { title: t('runtime.title'), description: t('runtime.description'), meta: snapshot === null ? t('common.loading') : t('runtime.total', { count: snapshot.entries.length }), action: _jsxs(_Fragment, { children: [_jsx("button", { type: "button", className: css.secondaryButton, disabled: loading, onClick: () => void load(), children: t('runtime.refresh') }), appearance.surface === 'sidebar' && props.writeEnabled && _jsx("button", { type: "button", className: css.primaryButton, onClick: () => setAdding(true), children: t('runtime.addButton') })] }) }), error !== null && _jsx("div", { className: css.inlineError, role: "alert", children: error }), notice !== null && _jsx("div", { className: css.runtimeNotice, role: "status", children: notice }), props.writeEnabled && appearance.surface === 'buildin' && composer, !props.writeEnabled && _jsx("div", { className: css.runtimeReadOnly, children: t('runtime.readOnly') }), appearance.surface === 'buildin' ? _jsxs("div", { className: css.runtimeGrid, children: [targetPanel('user'), targetPanel('memory')] }) : _jsxs(_Fragment, { children: [_jsxs("div", { className: css.runtimeSummaryGrid, children: [targetSummary('user'), targetSummary('memory')] }), _jsxs("section", { className: css.runtimeBrowser, "aria-label": t('runtime.entriesAria'), children: [_jsxs("div", { className: css.runtimeBrowserToolbar, children: [_jsxs("div", { className: css.runtimeScopeFilter, role: "group", "aria-label": t('runtime.scopeAria'), children: [_jsxs("button", { type: "button", "data-active": filterTarget === 'all' || undefined, onClick: () => setFilterTarget('all'), children: [t('runtime.scopeAll'), " ", _jsx("b", { children: snapshot?.entries.length ?? 0 })] }), _jsxs("button", { type: "button", "data-active": filterTarget === 'user' || undefined, onClick: () => setFilterTarget('user'), children: [t('runtime.target.user'), " ", _jsx("b", { children: snapshot?.targets.user.entryCount ?? 0 })] }), _jsxs("button", { type: "button", "data-active": filterTarget === 'memory' || undefined, onClick: () => setFilterTarget('memory'), children: [t('runtime.target.memory'), " ", _jsx("b", { children: snapshot?.targets.memory.entryCount ?? 0 })] })] }), _jsxs("div", { className: css.runtimeFilterQuery, children: [_jsx("span", { "aria-hidden": "true", children: "\u2315" }), _jsx("input", { "aria-label": t('runtime.filterAria'), value: filterQuery, onChange: event => setFilterQuery(event.target.value), placeholder: t('runtime.filterPlaceholder') })] })] }), _jsxs("div", { className: css.runtimeUnifiedList, children: [visibleEntries.map(entry => runtimeEntry(entry, true)), !loading && filteredEntries.length === 0 && _jsxs("div", { className: css.runtimeEmpty, children: [_jsx("span", { children: "\u25CB" }), _jsx("p", { children: t('runtime.noMatch') })] })] }), !loading && _jsx(ProgressiveFooter, { visible: visibleEntries.length, total: filteredEntries.length, pageSize: pageSize, onMore: () => setVisibleLimit(value => value + pageSize) })] })] }), _jsx("p", { className: css.runtimeFootnote, children: t('runtime.footnote') }), appearance.surface === 'sidebar' && adding && _jsx(SidebarModal, { title: t('runtime.addTitle'), description: t('runtime.addDescription'), busy: saving, onClose: closeComposer, children: composer }), appearance.surface === 'sidebar' && editingEntry !== undefined && _jsx(SidebarModal, { title: t('runtime.editContent'), description: t(`runtime.target.${editingEntry.target}`), busy: saving, onClose: () => setEditing(null), children: editForm }), appearance.surface === 'sidebar' && removingEntry !== undefined && _jsx(SidebarModal, { title: t('runtime.removeTitle'), description: t(`runtime.target.${removingEntry.target}`), busy: saving, onClose: () => setRemoving(null), children: _jsxs("div", { className: css.bodyDeleteConfirm, children: [_jsx("p", { children: t('runtime.removeWarning') }), _jsxs("div", { className: css.bodyDeleteSummary, children: [_jsx("strong", { children: removingEntry.content }), _jsx("span", { children: t(`runtime.importance.${removingEntry.importance}`) })] }), _jsxs("div", { className: css.bodyEditActions, children: [_jsx("button", { type: "button", "data-autofocus": true, className: css.ghostButton, disabled: saving, onClick: () => setRemoving(null), children: t('common.cancel') }), _jsx("button", { type: "button", className: css.dangerSolidButton, disabled: saving, onClick: () => void remove(removingEntry), children: t('runtime.removeAction') })] })] }) })] }));
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
            props.onMutate();
            if (response.action !== 'skipped') {
                setContent('');
                props.onComplete?.();
            }
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
                props.onComplete?.();
            }
        }
        catch (reason) {
            setResult(t('remember.saveFailed', { error: message(reason) }));
        }
        finally {
            setSaving(false);
        }
    };
    const composer = _jsxs("section", { className: css.supervisedComposer, children: [_jsxs("form", { className: css.supervisedForm, onSubmit: event => void supervise(event), children: [_jsxs("div", { className: css.supervisedHeading, children: [_jsx("div", { children: _jsx("h3", { children: t('remember.delegateTitle') }) }), _jsx("span", { className: props.sessionId === undefined ? css.sessionMissing : css.sessionReady, children: props.sessionId === undefined ? t('remember.noSession') : t('remember.ready') })] }), _jsxs("label", { className: css.fieldWide, children: [t('remember.candidate'), _jsx("textarea", { "aria-label": t('remember.candidateAria'), value: content, onChange: event => setContent(event.target.value), maxLength: 8000, rows: 8, placeholder: t('remember.placeholder') })] }), props.sessionId === undefined && _jsx("p", { className: css.sessionHint, children: t('remember.sessionHint') }), _jsxs("div", { className: css.formActions, children: [props.onClose !== undefined && _jsx("button", { type: "button", className: css.ghostButton, disabled: supervising || saving, onClick: props.onClose, children: t('common.cancel') }), _jsx("button", { type: "submit", className: css.primaryButton, disabled: supervising || content.trim() === '' || props.sessionId === undefined, children: supervising ? t('remember.processing') : t('remember.action') }), result !== null && _jsx("span", { role: "status", children: result })] })] }), _jsxs("details", { className: css.advancedWrite, children: [_jsxs("summary", { children: [_jsxs("span", { children: [_jsx("strong", { children: t('remember.advanced') }), _jsx("small", { children: t('remember.advancedHint') })] }), _jsx("span", { children: t('remember.expand') })] }), _jsxs("form", { className: css.manualForm, onSubmit: event => void manualSave(event), children: [_jsxs("div", { className: css.formGrid, children: [_jsxs("label", { className: css.fieldWide, children: [t('remember.target'), _jsx("select", { "aria-label": t('remember.target'), value: memoryBodyId, onChange: event => setMemoryBodyId(event.target.value), children: props.memoryBodies.map(body => _jsxs("option", { value: body.id, children: [body.name, " \u00B7 ", body.id, body.active ? ` · ${t('common.active')}` : ''] }, body.id)) })] }), _jsxs("label", { children: [t('common.category'), _jsx("select", { value: category, onChange: event => setCategory(event.target.value), children: CATEGORIES.map(value => _jsx("option", { value: value, children: categoryLabel(t, value) }, value)) })] }), _jsxs("label", { children: [t('common.importanceLabel'), _jsx("select", { value: importance, onChange: event => setImportance(Number(event.target.value)), children: [1, 2, 3, 4, 5].map(value => _jsxs("option", { value: value, children: [value, " / 5"] }, value)) })] }), _jsxs("label", { className: css.fieldWide, children: [t('remember.entities'), _jsx("input", { value: entities, onChange: event => setEntities(event.target.value), placeholder: "SQLite, DSH" })] }), _jsxs("label", { className: css.fieldWide, children: [t('remember.tags'), _jsx("input", { value: tags, onChange: event => setTags(event.target.value), placeholder: "architecture, local-first" })] })] }), _jsxs("div", { className: css.manualActions, children: [_jsx("p", { children: t('remember.advancedText') }), _jsx("button", { type: "submit", className: css.secondaryButton, disabled: saving || content.trim() === '' || props.sessionId === undefined || memoryBodyId === '', children: saving ? t('remember.saving') : t('remember.advancedAction') })] })] })] })] });
    if (props.onClose !== undefined) {
        return _jsx(SidebarModal, { title: t('remember.title'), description: t('remember.description'), busy: supervising || saving, onClose: props.onClose, children: props.writeEnabled ? composer : _jsx(EmptyState, { glyph: "\u2298", title: t('remember.readOnlyTitle'), children: t('remember.readOnlyText') }) });
    }
    return _jsxs("div", { className: css.page, children: [_jsx(PageHeader, { title: t('remember.title'), description: t('remember.description'), meta: props.writeEnabled ? t('remember.worker') : t('common.readOnly') }), !props.writeEnabled ? _jsx(EmptyState, { glyph: "\u2298", title: t('remember.readOnlyTitle'), children: t('remember.readOnlyText') }) : _jsxs("div", { className: css.writebackLayout, children: [_jsxs("aside", { className: css.writeGuide, children: [_jsx("h3", { children: t('remember.flowTitle') }), _jsxs("ol", { children: [_jsxs("li", { children: [_jsx("strong", { children: t('remember.routeTitle') }), _jsx("span", { children: t('remember.routeText') })] }), _jsxs("li", { children: [_jsx("strong", { children: t('remember.dedupeTitle') }), _jsx("span", { children: t('remember.dedupeText') })] }), _jsxs("li", { children: [_jsx("strong", { children: t('remember.writeTitle') }), _jsx("span", { children: t('remember.writeText') })] })] }), _jsx("p", { children: t('remember.flowText') })] }), composer] })] });
}
function ListPage(props) {
    const t = useT();
    const appearance = useMnemonViewAppearance();
    const pageSize = appearance.surface === 'sidebar' ? 12 : 48;
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('');
    const [view, setView] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [visibleLimit, setVisibleLimit] = useState(pageSize);
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
    useEffect(() => { setVisibleLimit(pageSize); void load(); }, [pageSize, props.revision]);
    const submit = (event) => { event.preventDefault(); setVisibleLimit(pageSize); void load(); };
    const forget = async (insight) => { await props.onForget(insight); setView(current => current === null ? current : { ...current, total: Math.max(0, current.total - 1), items: current.items.filter(item => insightKey(item) !== insightKey(insight)) }); };
    const visibleItems = view?.items.slice(0, visibleLimit) ?? [];
    return (_jsxs("div", { className: css.page, children: [_jsx(PageHeader, { title: t('content.title'), description: t('content.description'), meta: t('content.count', { count: view?.total ?? '—' }) }), _jsxs("form", { className: css.listToolbar, onSubmit: submit, children: [_jsx("input", { "aria-label": t('content.filterAria'), value: query, onChange: event => setQuery(event.target.value), placeholder: t('content.filterPlaceholder') }), _jsxs("select", { "aria-label": t('content.categoryAria'), value: category, onChange: event => setCategory(event.target.value), children: [_jsx("option", { value: "", children: t('common.allCategories') }), CATEGORIES.map(value => _jsx("option", { value: value, children: categoryLabel(t, value) }, value))] }), _jsx("button", { type: "submit", className: css.primaryButton, disabled: loading, children: loading ? t('common.loading') : t('content.apply') })] }), _jsx("div", { className: css.listNotice, children: t('content.notice') }), error !== null && _jsx("div", { className: css.inlineError, role: "alert", children: error }), !loading && view?.items.length === 0 && _jsx(EmptyState, { glyph: "\u2261", title: t('content.emptyTitle'), children: t('content.emptyText') }), _jsx("div", { className: css.memoryList, children: visibleItems.map(insight => _jsx(InsightCard, { insight: insight, writeEnabled: props.writeEnabled, onForget: forget, onClone: props.onClone, onRelated: () => props.onExplore(insight.content) }, insightKey(insight))) }), view !== null && _jsx(ProgressiveFooter, { visible: visibleItems.length, total: view.items.length, pageSize: pageSize, onMore: () => setVisibleLimit(value => value + pageSize) })] }));
}
function DocumentsPage(props) {
    const t = useT();
    const appearance = useMnemonViewAppearance();
    const pageSize = appearance.surface === 'sidebar' ? 8 : Number.MAX_SAFE_INTEGER;
    const readerRef = useRef(null);
    const [snapshot, setSnapshot] = useState(null);
    const [items, setItems] = useState([]);
    const [visibleLimit, setVisibleLimit] = useState(pageSize);
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
        setVisibleLimit(pageSize);
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
    }, [pageSize, props.client]);
    useEffect(() => { void display(query, status); }, [display, props.revision, status]);
    useEffect(() => {
        setSelected(null);
        if (selectedId === null)
            return;
        let active = true;
        void props.client.document(selectedId).then(value => { if (active)
            setSelected(value); }).catch(reason => { if (active)
            setError(message(reason)); });
        return () => { active = false; };
    }, [props.client, selectedId, props.revision]);
    useLayoutEffect(() => {
        if (appearance.surface === 'sidebar' && readerRef.current !== null)
            readerRef.current.scrollTop = 0;
    }, [appearance.surface, selectedId]);
    useEffect(() => {
        if (appearance.surface !== 'sidebar' || selectedId === null)
            return;
        const index = items.findIndex(item => item.id === selectedId);
        if (index >= visibleLimit)
            setVisibleLimit(Math.ceil((index + 1) / pageSize) * pageSize);
    }, [appearance.surface, items, pageSize, selectedId, visibleLimit]);
    const resetComposer = () => { setTitle(''); setDescription(''); setContent(''); setSources(''); setComposing(false); };
    const startComposer = () => { setTitle(''); setDescription(''); setContent(''); setSources(''); setEditing(false); setComposing(true); };
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
    const composer = _jsxs("form", { className: css.documentEditor, onSubmit: event => void create(event), children: [_jsxs("header", { children: [_jsxs("div", { children: [_jsx("h3", { children: t('documents.newTitle') }), _jsx("p", { children: t('documents.editorHint') })] }), _jsx("span", { children: t('documents.managedCopy') })] }), _jsxs("div", { className: css.documentEditorMeta, children: [_jsxs("label", { children: [t('documents.name'), _jsx("input", { value: title, onChange: event => setTitle(event.target.value), required: true })] }), _jsxs("label", { children: [t('documents.routing'), _jsx("input", { value: description, onChange: event => setDescription(event.target.value) })] })] }), _jsxs("label", { children: [t('documents.sources'), _jsx("input", { value: sources, onChange: event => setSources(event.target.value), placeholder: t('documents.sourcesPlaceholder') })] }), _jsxs("label", { children: [t('documents.markdown'), _jsx("textarea", { value: content, onChange: event => setContent(event.target.value), rows: 10, required: true })] }), _jsxs("footer", { children: [_jsx("button", { type: "button", className: css.ghostButton, disabled: saving, onClick: resetComposer, children: t('common.cancel') }), _jsx("button", { type: "submit", className: css.primaryButton, disabled: saving || title.trim() === '' || content.trim() === '', children: saving ? t('documents.saving') : t('documents.create') })] })] });
    const editComposer = selected === null ? null : _jsxs("form", { className: css.documentEditor, onSubmit: event => void update(event), children: [_jsxs("header", { children: [_jsxs("div", { children: [_jsx("h3", { children: t('documents.editTitle') }), _jsx("p", { children: t('documents.editorHint') })] }), _jsx("code", { children: selected.id })] }), _jsxs("div", { className: css.documentEditorMeta, children: [_jsxs("label", { children: [t('documents.name'), _jsx("input", { value: title, onChange: event => setTitle(event.target.value), required: true })] }), _jsxs("label", { children: [t('documents.routing'), _jsx("input", { value: description, onChange: event => setDescription(event.target.value) })] })] }), _jsxs("label", { children: [t('documents.sources'), _jsx("input", { value: sources, onChange: event => setSources(event.target.value) })] }), _jsxs("label", { children: [t('documents.markdown'), _jsx("textarea", { value: content, onChange: event => setContent(event.target.value), rows: 18, required: true })] }), _jsxs("footer", { children: [_jsx("button", { type: "button", className: css.ghostButton, disabled: saving, onClick: () => setEditing(false), children: t('common.cancel') }), _jsx("button", { type: "submit", className: css.primaryButton, disabled: saving, children: saving ? t('documents.saving') : t('documents.save') })] })] });
    const documentEditActionClass = appearance.surface === 'sidebar'
        ? appearanceClass(css.ghostButton, appearanceClass(appearance.classes.itemActionButton, appearance.classes.itemEditAction))
        : css.secondaryButton;
    const documentArchiveActionClass = appearance.surface === 'sidebar'
        ? appearanceClass(css.dangerButton, appearanceClass(appearance.classes.itemActionButton, appearance.classes.itemDangerAction))
        : css.dangerButton;
    const visibleItems = items.slice(0, visibleLimit);
    return (_jsxs("div", { className: css.page, children: [_jsx(PageHeader, { title: t('documents.title'), description: t('documents.description'), meta: snapshot === null ? t('common.loading') : t('documents.capacity', { used: humanBytes(snapshot.activeBytes), limit: humanBytes(snapshot.limitBytes) }), action: _jsxs(_Fragment, { children: [_jsx("button", { type: "button", className: css.secondaryButton, disabled: loading, onClick: () => void display(query, status), children: t('documents.refresh') }), appearance.surface === 'sidebar' && props.writeEnabled && props.sessionId !== undefined && _jsx("button", { type: "button", className: css.primaryButton, onClick: startComposer, children: t('documents.new') })] }) }), error !== null && _jsx("div", { className: css.inlineError, role: "alert", children: error }), notice !== null && _jsx("div", { className: css.runtimeNotice, role: "status", children: notice }), _jsxs("section", { className: css.documentSummary, "aria-label": t('documents.summary'), children: [_jsxs("article", { children: [_jsx("span", { children: t('documents.active') }), _jsx("strong", { children: activeCount }), _jsx("small", { children: t('documents.activeHint') })] }), _jsxs("article", { children: [_jsx("span", { children: t('documents.archivedCount') }), _jsx("strong", { children: archivedCount }), _jsx("small", { children: t('documents.archivedHint') })] }), _jsxs("article", { className: css.documentCapacity, children: [_jsx("span", { children: t('documents.activeCapacity') }), _jsx("strong", { children: snapshot === null ? '—' : `${usage.toFixed(1)}%` }), _jsx("div", { children: _jsx("i", { style: { width: `${usage}%` } }) }), _jsx("small", { children: t('documents.capacityHint') })] })] }), _jsxs("section", { className: css.documentToolbar, children: [_jsxs("form", { onSubmit: event => { event.preventDefault(); void display(query, status); }, children: [_jsx("span", { "aria-hidden": "true", children: "\u2315" }), _jsx("input", { "aria-label": t('documents.searchAria'), value: query, onChange: event => setQuery(event.target.value), placeholder: t('documents.searchPlaceholder') }), _jsx("button", { type: "submit", className: css.secondaryButton, children: t('documents.search') })] }), _jsxs("div", { role: "group", "aria-label": t('documents.scope'), children: [_jsxs("button", { type: "button", "data-active": status === 'active' || undefined, onClick: () => setStatus('active'), children: [t('documents.active'), " ", _jsx("b", { children: activeCount })] }), _jsxs("button", { type: "button", "data-active": status === 'archived' || undefined, onClick: () => setStatus('archived'), children: [t('documents.archivedCount'), " ", _jsx("b", { children: archivedCount })] })] }), appearance.surface === 'buildin' && props.writeEnabled && props.sessionId !== undefined && _jsx("button", { type: "button", className: css.primaryButton, onClick: () => { if (composing)
                            resetComposer();
                        else
                            startComposer(); }, children: composing ? t('common.cancel') : t('documents.new') })] }), composing && appearance.surface === 'buildin' && composer, _jsxs("div", { className: css.documentWorkspace, children: [_jsxs("aside", { className: css.documentList, "aria-label": t('documents.list'), children: [_jsxs("header", { children: [_jsx("span", { children: status === 'active' ? t('documents.activeList') : t('documents.archiveList') }), _jsx("code", { children: items.length })] }), visibleItems.map(document => _jsxs("button", { type: "button", "data-selected": selectedId === document.id || undefined, onClick: () => { setSelected(null); setSelectedId(document.id); setEditing(false); setConfirmArchive(false); }, children: [_jsxs("div", { children: [_jsx("strong", { children: document.title }), _jsx("time", { dateTime: document.updatedAt, children: new Date(document.updatedAt).toLocaleDateString() })] }), _jsx("p", { children: document.description || document.excerpt || t('documents.noDescription') }), _jsxs("footer", { children: [_jsx("span", { children: humanBytes(document.sizeBytes) }), _jsx("code", { children: document.id.slice(0, 8) }), document.healthy === false && _jsx("em", { children: t('documents.missing') })] })] }, document.id)), appearance.surface === 'sidebar' && !loading && _jsx(ProgressiveFooter, { compact: true, visible: visibleItems.length, total: items.length, pageSize: pageSize, onMore: () => setVisibleLimit(value => value + pageSize) }), !loading && items.length === 0 && _jsxs("div", { className: css.documentListEmpty, children: [_jsx("span", { children: "\u25A4" }), _jsx("strong", { children: status === 'active' ? t('documents.emptyActive') : t('documents.emptyArchived') }), _jsx("p", { children: status === 'active' ? t('documents.emptyActiveText') : t('documents.emptyArchivedText') })] }), loading && _jsx("div", { className: css.loading, children: t('common.loading') })] }), _jsx("section", { ref: readerRef, className: css.documentReader, "aria-label": t('documents.reader'), "data-scroll-region": appearance.surface === 'sidebar' ? '' : undefined, children: selected === null ? _jsx(EmptyState, { glyph: "\u25A4", title: t('documents.selectTitle'), children: t('documents.selectText') }) : editing && appearance.surface === 'buildin' ? editComposer : _jsxs("article", { className: css.documentDetail, children: [_jsxs("header", { children: [_jsxs("div", { children: [_jsx("span", { children: selected.status === 'active' ? t('documents.active') : t('documents.coldArchive') }), _jsx("h3", { children: selected.title }), _jsx("p", { children: selected.description || t('documents.noDescription') })] }), _jsx("div", { children: props.writeEnabled && selected.status === 'active' && _jsx("button", { type: "button", className: documentEditActionClass, onClick: beginEdit, children: t('documents.edit') }) })] }), _jsxs("dl", { children: [_jsxs("div", { children: [_jsx("dt", { children: t('documents.path') }), _jsx("dd", { children: _jsx("code", { children: selected.relativePath }) })] }), _jsxs("div", { children: [_jsx("dt", { children: t('documents.revision') }), _jsx("dd", { children: selected.revision })] }), _jsxs("div", { children: [_jsx("dt", { children: t('documents.hash') }), _jsx("dd", { children: _jsx("code", { children: selected.contentHash.slice(0, 16) }) })] }), _jsxs("div", { children: [_jsx("dt", { children: t('documents.size') }), _jsx("dd", { children: humanBytes(selected.sizeBytes) })] })] }), selected.sourcePaths.length > 0 && _jsxs("div", { className: css.documentSources, children: [_jsx("span", { children: t('documents.sources') }), selected.sourcePaths.map(path => _jsx("code", { children: path }, path))] }), selected.status === 'archived' && _jsxs("div", { className: css.documentArchiveReceipt, children: [_jsx("strong", { children: t('documents.archiveReceipt') }), _jsx("p", { children: selected.archiveSummary }), _jsx("div", { children: selected.memoryBodyIds.map(id => _jsx("code", { children: id }, id)) })] }), _jsx(DocumentMarkdown, { content: selected.content }), props.writeEnabled && selected.status === 'active' && _jsx("footer", { className: css.documentDanger, children: appearance.surface === 'buildin' && confirmArchive ? _jsxs(_Fragment, { children: [_jsx("span", { children: t('documents.archiveConfirm') }), _jsx("button", { type: "button", className: css.dangerSolidButton, disabled: saving, onClick: () => void archive(), children: saving ? t('documents.archiving') : t('documents.archiveNow') }), _jsx("button", { type: "button", className: css.ghostButton, onClick: () => setConfirmArchive(false), children: t('common.cancel') })] }) : _jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("strong", { children: t('documents.archiveTitle') }), _jsx("p", { children: t('documents.archiveDescription') })] }), _jsx("button", { type: "button", className: documentArchiveActionClass, onClick: () => setConfirmArchive(true), children: t('documents.archive') })] }) })] }) })] }), _jsx("p", { className: css.runtimeFootnote, children: t('documents.footnote') }), composing && appearance.surface === 'sidebar' && _jsx(SidebarModal, { title: t('documents.newTitle'), description: t('documents.editorHint'), busy: saving, onClose: resetComposer, children: composer }), editing && appearance.surface === 'sidebar' && selected !== null && _jsx(SidebarModal, { title: t('documents.editTitle'), description: selected.title, busy: saving, onClose: () => setEditing(false), children: editComposer }), confirmArchive && appearance.surface === 'sidebar' && selected !== null && _jsx(SidebarModal, { title: t('documents.archiveConfirm'), description: selected.title, busy: saving, onClose: () => setConfirmArchive(false), children: _jsxs("div", { className: css.bodyDeleteConfirm, children: [_jsx("p", { children: t('documents.archiveDescription') }), _jsxs("div", { className: css.bodyDeleteSummary, children: [_jsx("strong", { children: selected.title }), _jsxs("span", { children: [selected.relativePath, " \u00B7 ", humanBytes(selected.sizeBytes)] })] }), _jsxs("div", { className: css.bodyEditActions, children: [_jsx("button", { type: "button", "data-autofocus": true, className: css.ghostButton, disabled: saving, onClick: () => setConfirmArchive(false), children: t('common.cancel') }), _jsx("button", { type: "button", className: css.dangerSolidButton, disabled: saving, onClick: () => void archive(), children: saving ? t('documents.archiving') : t('documents.archiveNow') })] })] }) })] }));
}
function StatusPage(props) {
    const t = useT();
    const status = props.status;
    const documents = status?.documents;
    const catalogKnown = status?.memoryBodies !== undefined;
    const memoryBodies = useMemo(() => status?.memoryBodies ?? [], [status]);
    const activeBodies = memoryBodies.filter(body => body.active).length;
    const storage = status?.storage;
    const selectedScopeKind = storage?.activeKind ?? 'global';
    const selectedScope = storage?.scopes.find(scope => scope.kind === selectedScopeKind);
    const runtimeArea = selectedScope?.areas.find(area => area.kind === 'runtime');
    const runtimeUserEntries = runtimeArea === undefined ? 0 : Number(runtimeArea.details.userEntries ?? 0);
    const runtimeMemoryEntries = runtimeArea === undefined ? 0 : Number(runtimeArea.details.memoryEntries ?? 0);
    return (_jsxs("div", { className: css.page, children: [_jsx(PageHeader, { title: t('status.title'), description: t('status.description'), meta: status === null && props.loading ? t('common.loading') : status?.healthy === true ? t('status.nominal') : t('status.checkRequired'), action: _jsx("button", { type: "button", className: css.secondaryButton, disabled: props.loading, onClick: props.onRefresh, children: props.loading ? t('status.rechecking') : t('status.recheck') }) }), _jsxs("section", { className: css.healthStrip, "aria-label": t('status.aria'), children: [_jsxs("article", { children: [_jsx("span", { className: `${css.healthIndicator} ${status === null ? css.healthMuted : status.healthy ? css.healthGood : css.healthBad}` }), _jsxs("div", { children: [_jsx("small", { children: t('status.engine') }), _jsx("strong", { children: status === null ? t('status.engineChecking') : status.healthy ? t('status.engineConnected') : t('status.engineUnavailable') }), _jsx("p", { children: status?.version === undefined ? t('status.versionWaiting') : `CLI ${status.version}` })] })] }), _jsxs("article", { children: [_jsx("span", { className: `${css.healthIndicator} ${runtimeArea === undefined ? css.healthMuted : runtimeArea.status === 'invalid' ? css.healthBad : css.healthGood}` }), _jsxs("div", { children: [_jsx("small", { children: t('status.runtime') }), _jsx("strong", { children: runtimeArea === undefined ? t('status.runtimeWaiting') : t('status.runtimeRatio', { user: runtimeUserEntries, memory: runtimeMemoryEntries }) }), _jsx("p", { children: runtimeArea === undefined ? t('status.runtimeWaitingDetail') : t('status.runtimeBytes', { bytes: humanBytes(runtimeArea.bytes) }) })] })] }), _jsxs("article", { children: [_jsx("span", { className: `${css.healthIndicator} ${activeBodies > 0 ? css.healthGood : css.healthMuted}` }), _jsxs("div", { children: [_jsx("small", { children: t('status.spaces') }), _jsx("strong", { children: catalogKnown ? t('status.activeRatio', { active: activeBodies, total: memoryBodies.length }) : t('status.directoryUnsynced') }), _jsx("p", { children: t('status.activeMemories', { count: status?.stats?.totalInsights ?? 0 }) })] })] }), _jsxs("article", { children: [_jsx("span", { className: `${css.healthIndicator} ${documents === undefined ? css.healthMuted : css.healthGood}` }), _jsxs("div", { children: [_jsx("small", { children: t('status.documents') }), _jsx("strong", { children: documents === undefined ? t('status.documentsWaiting') : t('status.documentRatio', { active: documents.activeCount, archived: documents.archivedCount }) }), _jsx("p", { children: documents === undefined ? t('status.documentsSession') : t('status.documentUsage', { used: humanBytes(documents.activeBytes), limit: humanBytes(documents.limitBytes) }) })] })] })] }), _jsx(StorageDomains, { catalog: storage, selected: selectedScope, selectedKind: selectedScopeKind })] }));
}
function storageScopeLabel(t, kind) {
    return t(kind === 'global' ? 'status.storageGlobal' : kind === 'workspace' ? 'status.storageWorkspace' : 'status.storageCustom');
}
/** Resolve the configured scope before the first status round-trip to keep the Sidebar header stable. */
function configuredStorageScope(config) {
    return config?.storageScope ?? (config?.dataDir?.trim() ? 'custom' : 'global');
}
function storageAreaLabel(t, kind) {
    return t(kind === 'runtime' ? 'status.storageRuntime' : kind === 'memory-bodies' ? 'status.storageBodies' : kind === 'documents' ? 'status.storageDocuments' : 'status.storageState');
}
function storageAreaDetails(t, area) {
    if (area.kind === 'runtime')
        return t('status.storageRuntimeDetail', { user: area.details.userEntries ?? 0, memory: area.details.memoryEntries ?? 0 });
    if (area.kind === 'memory-bodies')
        return t('status.storageBodiesDetail', { active: area.details.activeBodies ?? 0, databases: area.details.databases ?? 0 });
    if (area.kind === 'documents')
        return t('status.storageDocumentsDetail', { active: area.details.activeDocuments ?? 0, archived: area.details.archivedDocuments ?? 0 });
    return area.details.reviewLedger === true ? t('status.storageStateReady') : t('status.storageStateVolatile');
}
function StorageDomains(props) {
    const t = useT();
    const areaStatus = (status) => t(status === 'ready' ? 'status.storageReady' : status === 'empty' ? 'status.storageEmpty' : status === 'missing' ? 'status.storageMissing' : 'status.storageInvalid');
    return (_jsxs("section", { className: css.storageDomains, "aria-label": t('status.storageDomains'), children: [_jsxs("div", { className: css.statusSectionHeader, children: [_jsxs("div", { children: [_jsx("h3", { children: t('status.storageDomains') }), _jsx("p", { children: t('status.storageDomainsText') })] }), _jsx("span", { className: css.phaseBadge, children: storageScopeLabel(t, props.selectedKind) })] }), props.catalog === undefined ? _jsx("div", { className: css.storageUnavailable, children: t('status.storageWaiting') }) : props.selected?.root === undefined ? _jsxs("div", { className: css.storageUnavailable, children: [_jsx("strong", { children: storageScopeLabel(t, props.selectedKind) }), _jsx("p", { children: props.selectedKind === 'custom' ? t('status.storageCustomUnset') : t('status.storageWorkspaceUnavailable') })] }) : _jsxs(_Fragment, { children: [_jsxs("div", { className: css.storageRoot, children: [_jsxs("div", { children: [_jsxs("span", { children: [storageScopeLabel(t, props.selectedKind), " \u00B7 ", t('status.storageActiveRoot')] }), _jsx("code", { children: props.selected.root })] }), _jsxs("div", { children: [_jsx("strong", { children: humanBytes(props.selected.totalBytes) }), _jsx("small", { children: props.selected.available ? t('status.storageAvailable') : t('status.storageNotCreated') })] })] }), _jsx("div", { className: css.storageAreaGrid, children: props.selected.areas.filter(area => area.kind !== 'state').map(area => _jsxs("article", { "data-status": area.status, children: [_jsxs("header", { children: [_jsxs("div", { children: [_jsx("span", {}), " ", _jsx("strong", { children: storageAreaLabel(t, area.kind) })] }), _jsx("em", { children: areaStatus(area.status) })] }), _jsxs("div", { className: css.storageAreaMetric, children: [_jsx("strong", { children: area.itemCount }), _jsx("span", { children: t('status.storageItems') }), _jsx("code", { children: humanBytes(area.bytes) })] }), _jsx("p", { children: storageAreaDetails(t, area) }), _jsx("code", { className: css.storagePath, children: area.path }), area.issue !== undefined && _jsx("small", { children: area.issue })] }, area.kind)) })] }), props.catalog !== undefined && _jsx("p", { className: css.storageFootnote, children: t('status.storageFootnote', { root: props.catalog.activeRoot }) })] }));
}
export function MnemonView(props) {
    const t = props.t ?? translateZh;
    const appearance = resolveMnemonViewAppearance(props.surface ?? 'buildin', t);
    return _jsx(I18nContext.Provider, { value: t, children: _jsx(MnemonViewAppearanceProvider, { value: appearance, children: _jsx(MnemonWorkspace, { ...props }) }) });
}
function MnemonWorkspace({ connection, settingsScope, sessionId, workspaceId, workspaceSelection }) {
    const t = useT();
    const appearance = useMnemonViewAppearance();
    const settingsSnapshot = useSyncExternalStore(settingsScope.subscribe, settingsScope.getSnapshot, settingsScope.getSnapshot);
    const client = useMemo(() => new MnemonClient(connection, sessionId, workspaceId), [connection, sessionId, workspaceId]);
    const clientContextKey = `${sessionId ?? ''}\u0000${workspaceId ?? ''}`;
    const [page, setPage] = useState('status');
    const lastMemoryPage = useRef('overview');
    const canvasRef = useRef(null);
    const selectPage = useCallback((next) => {
        if (isMemoryPage(next))
            lastMemoryPage.current = next;
        setPage(next);
    }, []);
    const selectPrimaryPage = useCallback((next) => {
        selectPage(appearance.surface === 'sidebar' && next === 'overview' ? lastMemoryPage.current : next);
    }, [appearance.surface, selectPage]);
    /** Pages share one plugin-owned scroll container; never mutate DSH ancestor scrollports. */
    const resetViewportScroll = useCallback(() => {
        const canvas = canvasRef.current;
        if (canvas !== null)
            canvas.scrollTop = 0;
    }, []);
    // Reset before paint so a newly selected page never flashes at the previous
    // page's scroll offset for one frame. The host still owns every ancestor.
    useLayoutEffect(() => { resetViewportScroll(); }, [clientContextKey, page, resetViewportScroll]);
    const [statusState, setStatusState] = useState(() => ({ contextKey: clientContextKey, value: null, loading: true, error: null }));
    const currentStatusState = statusState.contextKey === clientContextKey
        ? statusState
        : { contextKey: clientContextKey, value: null, loading: true, error: null };
    const status = currentStatusState.value;
    const statusLoading = currentStatusState.loading;
    const statusError = currentStatusState.error;
    const statusRequest = useRef(0);
    const [revision, setRevision] = useState(0);
    const [searchSeed, setSearchSeed] = useState('');
    const [rememberSeed, setRememberSeed] = useState('');
    const [rememberOpen, setRememberOpen] = useState(false);
    // A newly inspected workspace must never inherit visible cards, open editors,
    // search seeds, or scroll position from the previous workspace.
    useLayoutEffect(() => {
        setRememberOpen(false);
        setRememberSeed('');
        setSearchSeed('');
    }, [clientContextKey]);
    const openRemember = useCallback((seed = '') => {
        setRememberSeed(seed);
        setRememberOpen(true);
    }, []);
    /** Conversation surfaces ask this view to open a page (optionally with a seed). */
    const applyAnchor = useCallback((anchor) => {
        if (anchor.page === 'remember' && appearance.surface === 'sidebar') {
            openRemember(anchor.seed ?? '');
            selectPage(lastMemoryPage.current);
            return;
        }
        if (anchor.seed !== undefined && anchor.seed !== '') {
            if (anchor.page === 'explore')
                setSearchSeed(anchor.seed);
            if (anchor.page === 'remember')
                setRememberSeed(anchor.seed);
        }
        selectPage(anchor.page);
    }, [appearance.surface, openRemember, selectPage]);
    useEffect(() => {
        const held = consumeMnemonAnchor(sessionId);
        if (held !== null)
            applyAnchor(held);
        return subscribeMnemonAnchor(sessionId, applyAnchor);
    }, [sessionId, applyAnchor]);
    const loadStatus = useCallback(async () => {
        const request = ++statusRequest.current;
        setStatusState(current => ({ contextKey: clientContextKey, value: current.contextKey === clientContextKey ? current.value : null, loading: true, error: null }));
        try {
            const next = await client.status();
            if (request === statusRequest.current)
                setStatusState({ contextKey: clientContextKey, value: next, loading: false, error: null });
        }
        catch (reason) {
            if (request === statusRequest.current)
                setStatusState({ contextKey: clientContextKey, value: null, loading: false, error: message(reason) });
        }
    }, [client, clientContextKey]);
    useEffect(() => { void loadStatus(); }, [loadStatus, settingsSnapshot.revision]);
    const mutate = useCallback(() => { setRevision(value => value + 1); void loadStatus(); }, [loadStatus]);
    const forget = useCallback(async (insight) => { await client.forget(insight.id, insight.memoryBodyId); mutate(); }, [client, mutate]);
    const explore = useCallback((query) => { setSearchSeed(query); selectPage('explore'); }, [selectPage]);
    const clone = useCallback((insight) => {
        if (appearance.surface === 'sidebar')
            openRemember(insight.content);
        else {
            setRememberSeed(insight.content);
            selectPage('remember');
        }
    }, [appearance.surface, openRemember, selectPage]);
    const refreshAll = () => { setRevision(value => value + 1); void loadStatus(); };
    const writeEnabled = status?.writeEnabled === true;
    const stats = status?.stats;
    const catalogKnown = status?.memoryBodies !== undefined;
    const memoryBodies = useMemo(() => status?.memoryBodies ?? [], [status]);
    const activeBodies = memoryBodies.filter(body => body.active).length;
    const workspaceContext = status?.workspaceContext;
    const storageMode = workspaceContext?.mode ?? status?.storage?.activeKind ?? configuredStorageScope(settingsSnapshot.value);
    const storageModeText = storageScopeLabel(t, storageMode);
    const showWorkspacePicker = storageMode === 'workspace' && workspaceSelection !== undefined && workspaceSelection.options.length > 0;
    const workspaceDiverged = workspaceContext?.mode === 'workspace' && !workspaceContext.aligned;
    const canAlignWorkspace = workspaceDiverged && workspaceSelection?.effectiveWorkspaceId !== undefined;
    const workspaceDifference = workspaceContext === undefined
        ? ''
        : `${t('workspace.selectedRoot', { root: workspaceContext.selectedRoot })}; ${t('workspace.effectiveRoot', { root: workspaceContext.effectiveRoot })}`;
    const workspacePicker = showWorkspacePicker && _jsxs("label", { className: appearanceClass(css.workspacePicker, appearance.classes.workspacePicker), children: [_jsx("span", { children: t('workspace.viewing') }), _jsx("select", { "aria-label": t('workspace.selectorAria'), value: workspaceSelection.selectedWorkspaceId ?? '', onChange: event => workspaceSelection.onSelect(event.target.value), children: workspaceSelection.options.map(workspace => _jsx("option", { value: workspace.id, children: workspace.title }, workspace.id)) })] });
    const connectionLabel = statusLoading
        ? t('header.checking')
        : status?.healthy !== true
            ? t('header.unavailable')
            : appearance.surface === 'sidebar'
                ? t('header.connected')
                : catalogKnown
                    ? t('header.connectedWithCount', { count: activeBodies })
                    : t('header.directoryPending');
    return (_jsxs("main", { className: appearanceClass(css.shell, appearance.classes.shell), "data-mnemon-surface": appearance.surface, children: [_jsxs("header", { className: appearanceClass(css.masthead, appearance.classes.masthead), children: [_jsxs("div", { className: appearanceClass(css.brand, appearance.classes.brand), children: [appearance.showLogo && _jsx(MnemonLogo, { className: css.brandLogo }), _jsx("h1", { children: appearance.title }), appearance.surface === 'sidebar' && _jsxs("span", { className: css.storageMode, "aria-label": t('workspace.storageModeAria', { mode: storageModeText }), children: [_jsx("span", { children: t('workspace.storageMode') }), _jsx("strong", { children: storageModeText })] }), appearance.surface === 'sidebar' && workspacePicker, appearance.surface === 'sidebar' && canAlignWorkspace && _jsxs("div", { className: appearanceClass(css.workspaceMismatch, appearance.classes.workspaceMismatch), role: "status", "aria-label": `${t('workspace.mismatchTitle')}. ${workspaceDifference}`, title: workspaceDifference, children: [_jsx("span", { children: t('workspace.mismatchShort') }), _jsx("button", { type: "button", onClick: workspaceSelection.onAlign, children: t('workspace.align') })] })] }), appearance.showTelemetry && _jsxs("section", { className: css.telemetry, "aria-label": t('telemetry.aria'), children: [_jsxs("div", { className: css.telemetryMetric, children: [_jsx("span", { children: t('telemetry.memories') }), _jsx("strong", { children: stats?.totalInsights ?? '—' })] }), _jsxs("div", { className: css.telemetryMetric, children: [_jsx("span", { children: t('telemetry.graph') }), _jsx("strong", { children: stats?.edgeCount ?? '—' })] }), _jsxs("div", { className: css.telemetryMetric, children: [_jsx("span", { children: t('telemetry.entities') }), _jsx("strong", { children: stats?.topEntities.length ?? '—' })] }), _jsxs("div", { className: css.telemetryMetric, children: [_jsx("span", { children: t('telemetry.spaces') }), _jsx("strong", { children: status === null || !catalogKnown ? '—' : activeBodies })] })] }), _jsxs("div", { className: appearanceClass(css.headerActions, appearance.classes.headerActions), children: [appearance.surface === 'buildin' && workspacePicker, _jsxs("div", { className: appearanceClass(css.statusCluster, appearance.classes.statusCluster), children: [_jsx("span", { className: `${css.statusDot} ${statusLoading && status === null ? css.checking : status?.healthy === true ? css.online : css.offline}` }), _jsx("span", { children: connectionLabel }), _jsx("button", { type: "button", className: css.iconButton, disabled: statusLoading, onClick: refreshAll, "aria-label": t('common.refresh'), children: "\u21BB" })] })] })] }), (statusError !== null || status?.healthy === false) && _jsxs("div", { className: css.alert, role: "alert", children: [_jsx("strong", { children: t('header.notReady') }), _jsx("span", { children: statusError ?? status?.error })] }), appearance.surface === 'buildin' && workspaceDiverged && _jsxs("div", { className: css.workspaceMismatch, role: "status", children: [_jsxs("div", { children: [_jsx("strong", { children: t('workspace.mismatchTitle') }), _jsx("span", { children: t('workspace.mismatchDescription') }), _jsxs("div", { children: [_jsx("code", { children: t('workspace.selectedRoot', { root: workspaceContext.selectedRoot }) }), _jsx("code", { children: t('workspace.effectiveRoot', { root: workspaceContext.effectiveRoot }) })] })] }), canAlignWorkspace && _jsx("button", { type: "button", className: css.secondaryButton, onClick: workspaceSelection.onAlign, children: t('workspace.align') })] }), _jsxs("div", { className: css.workspace, children: [_jsx(WorkspaceNavigation, { page: page, onSelect: selectPrimaryPage, activeBodies: activeBodies, bodyCount: memoryBodies.length, catalogKnown: catalogKnown, writeEnabled: writeEnabled }), _jsx(MemoryNavigation, { page: page, writeEnabled: writeEnabled, onSelect: selectPage, onRemember: () => openRemember() }), _jsxs("section", { className: appearanceClass(css.canvas, appearance.classes.canvas), ref: canvasRef, "data-testid": "mnemon-canvas", "data-lock-page-header": !isMemoryPage(page) ? '' : undefined, children: [page === 'overview' && _jsx(OverviewPage, { client: client, revision: revision, writeEnabled: writeEnabled, fallbackBodies: memoryBodies, fallbackDirectory: status?.memoryBodyDirectory, catalogKnown: catalogKnown, onMutate: mutate, onExplore: explore }), page === 'runtime' && _jsx(RuntimePage, { client: client, revision: revision, writeEnabled: writeEnabled, onMutate: mutate }), page === 'documents' && _jsx(DocumentsPage, { client: client, revision: revision, writeEnabled: writeEnabled, ...(sessionId === undefined ? {} : { sessionId }), onMutate: mutate }), page === 'explore' && _jsx(ExplorePage, { client: client, status: status, seed: searchSeed, writeEnabled: writeEnabled, onForget: forget }), page === 'entities' && _jsx(EntitiesPage, { client: client, revision: revision, writeEnabled: writeEnabled, onForget: forget, onExplore: explore }), page === 'remember' && appearance.surface === 'buildin' && _jsx(RememberPage, { client: client, sessionId: sessionId, memoryBodies: memoryBodies, writeEnabled: writeEnabled, seed: rememberSeed, onMutate: mutate }), page === 'list' && _jsx(ListPage, { client: client, revision: revision, writeEnabled: writeEnabled, onForget: forget, onClone: clone, onExplore: explore }), page === 'status' && _jsx(StatusPage, { status: status, loading: statusLoading, onRefresh: () => void loadStatus() })] }, clientContextKey), appearance.surface === 'sidebar' && rememberOpen && _jsx(RememberPage, { client: client, sessionId: sessionId, memoryBodies: memoryBodies, writeEnabled: writeEnabled, seed: rememberSeed, onMutate: mutate, onClose: () => setRememberOpen(false), onComplete: () => setRememberOpen(false) })] })] }));
}
//# sourceMappingURL=MnemonView.js.map