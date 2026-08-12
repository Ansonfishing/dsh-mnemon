import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CATEGORIES } from "../service.js";
import { MnemonClient } from "./api.js";
import css from './MnemonView.module.css';
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
function InsightCard(props) {
    const { insight } = props;
    const meta = [
        insight.category !== undefined ? CATEGORY_LABELS[insight.category] ?? insight.category : undefined,
        insight.importance !== undefined ? `重要性 ${insight.importance}` : undefined,
        insight.confidence !== undefined ? `${insight.confidence} confidence` : undefined,
        insight.score !== undefined ? `score ${insight.score.toFixed(3)}` : undefined,
        insight.depth !== undefined ? `${insight.depth} 跳` : undefined,
    ].filter((entry) => entry !== undefined);
    return (_jsxs("article", { className: css.insightCard, children: [_jsxs("div", { className: css.cardTop, children: [_jsx("div", { className: css.badges, children: meta.map(entry => _jsx("span", { className: css.badge, children: entry }, entry)) }), _jsx("code", { className: css.id, title: insight.id, children: insight.id.slice(0, 8) })] }), _jsx("p", { className: css.content, children: insight.content }), (insight.tags?.length ?? 0) > 0 && (_jsx("div", { className: css.tags, children: insight.tags.map(tag => _jsxs("span", { children: ["#", tag] }, tag)) })), _jsxs("div", { className: css.cardActions, children: [_jsx("button", { type: "button", className: css.ghostButton, onClick: () => props.onRelated(insight), children: "\u67E5\u770B\u5173\u8054" }), _jsx("button", { type: "button", className: css.ghostButton, onClick: () => void navigator.clipboard?.writeText(insight.id), children: "\u590D\u5236 ID" }), props.writeEnabled && (_jsx("button", { type: "button", className: css.dangerButton, onClick: () => props.onForget(insight), children: "\u5FD8\u8BB0" }))] })] }));
}
export function MnemonView({ connection }) {
    const client = useMemo(() => new MnemonClient(connection), [connection]);
    const [page, setPage] = useState('explore');
    const [status, setStatus] = useState(null);
    const [statusLoading, setStatusLoading] = useState(true);
    const [statusError, setStatusError] = useState(null);
    const [query, setQuery] = useState('');
    const [mode, setMode] = useState('smart');
    const [category, setCategory] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [searched, setSearched] = useState(false);
    const [relatedTo, setRelatedTo] = useState(null);
    const [related, setRelated] = useState([]);
    const [relatedLoading, setRelatedLoading] = useState(false);
    const [content, setContent] = useState('');
    const [rememberCategory, setRememberCategory] = useState('general');
    const [importance, setImportance] = useState(3);
    const [tags, setTags] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveResult, setSaveResult] = useState(null);
    const loadStatus = useCallback(async () => {
        setStatusLoading(true);
        setStatusError(null);
        try {
            setStatus(await client.status());
        }
        catch (error) {
            setStatusError(message(error));
        }
        finally {
            setStatusLoading(false);
        }
    }, [client]);
    useEffect(() => { void loadStatus(); }, [loadStatus]);
    const performSearch = useCallback(async (event) => {
        event?.preventDefault();
        if (query.trim() === '')
            return;
        setSearching(true);
        setSearchError(null);
        setSearched(true);
        setRelatedTo(null);
        try {
            const response = await client.search({
                query,
                mode,
                ...(category === '' ? {} : { category }),
                limit: status?.defaultRecallLimit ?? 10,
            });
            setResults(response.results);
        }
        catch (error) {
            setSearchError(message(error));
            setResults([]);
        }
        finally {
            setSearching(false);
        }
    }, [category, client, mode, query, status?.defaultRecallLimit]);
    const showRelated = useCallback(async (insight) => {
        setRelatedTo(insight);
        setRelated([]);
        setRelatedLoading(true);
        try {
            setRelated(await client.related(insight.id));
        }
        catch (error) {
            setSearchError(message(error));
        }
        finally {
            setRelatedLoading(false);
        }
    }, [client]);
    const forget = useCallback(async (insight) => {
        if (!window.confirm(`确定要软删除这条记忆吗？\n\n${insight.content}`))
            return;
        try {
            await client.forget(insight.id);
            setResults(items => items.filter(item => item.id !== insight.id));
            if (relatedTo?.id === insight.id)
                setRelatedTo(null);
            void loadStatus();
        }
        catch (error) {
            setSearchError(message(error));
        }
    }, [client, loadStatus, relatedTo?.id]);
    const saveMemory = useCallback(async (event) => {
        event.preventDefault();
        if (content.trim() === '')
            return;
        setSaving(true);
        setSaveResult(null);
        try {
            const response = await client.remember({
                content,
                category: rememberCategory,
                importance,
                tags: tags.split(',').map(value => value.trim()).filter(value => value !== ''),
                source: 'user',
            });
            const action = typeof response.action === 'string' ? response.action : 'saved';
            setSaveResult(action === 'skipped' ? 'Mnemon 判定为重复内容，已跳过。' : `记忆已处理：${action}`);
            if (action !== 'skipped') {
                setContent('');
                setTags('');
            }
            void loadStatus();
        }
        catch (error) {
            setSaveResult(`保存失败：${message(error)}`);
        }
        finally {
            setSaving(false);
        }
    }, [client, content, importance, loadStatus, rememberCategory, tags]);
    const writeEnabled = status?.writeEnabled === true;
    const stats = status?.stats;
    return (_jsxs("main", { className: css.shell, children: [_jsxs("header", { className: css.header, children: [_jsxs("div", { children: [_jsx("div", { className: css.eyebrow, children: "EXTERNAL MEMORY" }), _jsx("h1", { children: "Mnemon \u8BB0\u5FC6" }), _jsx("p", { children: "\u5171\u4EAB\u7684\u6301\u4E45\u8BB0\u5FC6\u56FE\u8C31\uFF1B\u6309\u9700\u53EC\u56DE\uFF0C\u5BA1\u614E\u6C89\u6DC0\u3002" })] }), _jsxs("div", { className: css.statusCluster, children: [_jsx("span", { className: `${css.statusDot} ${status?.healthy === true ? css.online : css.offline}` }), _jsx("span", { children: statusLoading ? '检查中' : status?.healthy === true ? `已连接 · ${status.store}` : '不可用' }), _jsx("button", { type: "button", className: css.iconButton, onClick: () => void loadStatus(), "aria-label": "\u5237\u65B0\u72B6\u6001", children: "\u21BB" })] })] }), (statusError !== null || status?.healthy === false) && (_jsxs("div", { className: css.alert, role: "alert", children: [_jsx("strong", { children: "Mnemon \u5C1A\u672A\u5C31\u7EEA" }), _jsx("span", { children: statusError ?? status?.error })] })), _jsxs("section", { className: css.metrics, "aria-label": "\u8BB0\u5FC6\u7EDF\u8BA1", children: [_jsxs("div", { className: css.metric, children: [_jsx("span", { children: "\u6709\u6548\u8BB0\u5FC6" }), _jsx("strong", { children: stats?.totalInsights ?? '—' })] }), _jsxs("div", { className: css.metric, children: [_jsx("span", { children: "\u56FE\u8C31\u8FDE\u63A5" }), _jsx("strong", { children: stats?.edgeCount ?? '—' })] }), _jsxs("div", { className: css.metric, children: [_jsx("span", { children: "\u5B9E\u4F53" }), _jsx("strong", { children: stats?.topEntities.length ?? '—' })] }), _jsxs("div", { className: css.metric, children: [_jsx("span", { children: "\u6570\u636E\u5E93" }), _jsx("strong", { children: stats === undefined ? '—' : humanBytes(stats.dbSizeBytes) })] })] }), _jsx("nav", { className: css.nav, "aria-label": "Mnemon \u9875\u9762", children: [['explore', '检索'], ['remember', '记住'], ['config', '配置']].map(([id, label]) => (_jsx("button", { type: "button", "aria-current": page === id ? 'page' : undefined, onClick: () => setPage(id), children: label }, id))) }), page === 'explore' && (_jsxs("section", { className: css.page, children: [_jsxs("form", { className: css.searchBar, onSubmit: event => void performSearch(event), children: [_jsx("span", { className: css.searchIcon, children: "\u2315" }), _jsx("input", { value: query, onChange: event => setQuery(event.target.value), placeholder: "\u641C\u7D22\u51B3\u7B56\u3001\u504F\u597D\u3001\u7ECF\u9A8C\u3001\u9879\u76EE\u7EA6\u5B9A\u2026\u2026", "aria-label": "\u8BB0\u5FC6\u67E5\u8BE2" }), _jsxs("select", { value: category, onChange: event => setCategory(event.target.value), "aria-label": "\u8BB0\u5FC6\u5206\u7C7B", children: [_jsx("option", { value: "", children: "\u5168\u90E8\u5206\u7C7B" }), CATEGORIES.map(value => _jsx("option", { value: value, children: CATEGORY_LABELS[value] }, value))] }), _jsxs("select", { value: mode, onChange: event => setMode(event.target.value), "aria-label": "\u68C0\u7D22\u6A21\u5F0F", children: [_jsx("option", { value: "smart", children: "\u56FE\u589E\u5F3A\u53EC\u56DE" }), _jsx("option", { value: "keyword", children: "\u5173\u952E\u8BCD\u68C0\u7D22" }), _jsx("option", { value: "basic", children: "\u57FA\u7840\u5339\u914D" })] }), _jsx("button", { type: "submit", className: css.primaryButton, disabled: searching || query.trim() === '', children: searching ? '检索中…' : '召回' })] }), searchError !== null && _jsx("div", { className: css.inlineError, children: searchError }), !searched && (_jsxs("div", { className: css.emptyState, children: [_jsx("div", { className: css.orbit, children: "\u25CE" }), _jsx("h2", { children: "\u4ECE\u4E00\u4E2A\u660E\u786E\u95EE\u9898\u5F00\u59CB" }), _jsx("p", { children: "\u4F8B\u5982\u201C\u4E3A\u4EC0\u4E48\u9009\u7528 SQLite\uFF1F\u201D\u6216\u201C\u8FD9\u4E2A\u9879\u76EE\u6709\u54EA\u4E9B\u53D1\u5E03\u7EA6\u5B9A\uFF1F\u201D\u3002\u805A\u7126\u7684\u67E5\u8BE2\u4F1A\u6BD4\u6279\u91CF\u52A0\u8F7D\u6574\u5E93\u66F4\u53EF\u9760\u3002" })] })), searched && !searching && results.length === 0 && searchError === null && (_jsxs("div", { className: css.emptyState, children: [_jsx("h2", { children: "\u6CA1\u6709\u547D\u4E2D" }), _jsx("p", { children: "\u6362\u4E00\u4E2A\u66F4\u5177\u4F53\u7684\u5B9E\u4F53\u3001\u51B3\u7B56\u6216\u65F6\u95F4\u7EBF\u5173\u952E\u8BCD\u8BD5\u8BD5\u3002" })] })), results.length > 0 && (_jsxs("div", { className: css.resultLayout, children: [_jsxs("div", { className: css.results, children: [_jsxs("div", { className: css.sectionHeading, children: [_jsx("h2", { children: "\u53EC\u56DE\u7ED3\u679C" }), _jsxs("span", { children: [results.length, " \u6761"] })] }), results.map(insight => _jsx(InsightCard, { insight: insight, writeEnabled: writeEnabled, onRelated: insight => void showRelated(insight), onForget: insight => void forget(insight) }, insight.id))] }), relatedTo !== null && (_jsxs("aside", { className: css.relatedPane, children: [_jsxs("div", { className: css.sectionHeading, children: [_jsx("h2", { children: "\u5173\u8054\u8BB0\u5FC6" }), _jsx("button", { type: "button", onClick: () => setRelatedTo(null), children: "\u00D7" })] }), _jsx("p", { className: css.relatedSource, children: relatedTo.content }), relatedLoading && _jsx("div", { className: css.loading, children: "\u6B63\u5728\u904D\u5386\u56FE\u8C31\u2026" }), !relatedLoading && related.length === 0 && _jsx("div", { className: css.muted, children: "\u6CA1\u6709\u627E\u5230\u4E24\u8DF3\u5185\u7684\u5173\u8054\u8282\u70B9\u3002" }), related.map(insight => _jsx(InsightCard, { insight: insight, writeEnabled: writeEnabled, onRelated: insight => void showRelated(insight), onForget: insight => void forget(insight) }, insight.id))] }))] }))] })), page === 'remember' && (_jsx("section", { className: css.page, children: !writeEnabled ? (_jsxs("div", { className: css.emptyState, children: [_jsx("h2", { children: "\u5F53\u524D\u4E3A\u53EA\u8BFB\u6A21\u5F0F" }), _jsxs("p", { children: ["\u5728 DSH profile \u914D\u7F6E\u4E2D\u5C06 ", _jsx("code", { children: "writeEnabled" }), " \u8BBE\u4E3A ", _jsx("code", { children: "true" }), " \u540E\u91CD\u542F\u3002"] })] })) : (_jsxs("form", { className: css.rememberForm, onSubmit: event => void saveMemory(event), children: [_jsxs("div", { className: css.formIntro, children: [_jsx("span", { children: "WRITEBACK" }), _jsx("h2", { children: "\u6C89\u6DC0\u4E00\u6761\u503C\u5F97\u5E26\u8D70\u7684\u8BB0\u5FC6" }), _jsx("p", { children: "\u5199\u6E05\u4E8B\u5B9E\u3001\u539F\u56E0\u548C\u9002\u7528\u8303\u56F4\u3002Mnemon \u4F1A\u5728\u5199\u5165\u524D\u505A\u91CD\u590D\u4E0E\u51B2\u7A81\u68C0\u67E5\u3002" })] }), _jsxs("label", { className: css.fieldWide, children: ["\u5185\u5BB9", _jsx("textarea", { value: content, onChange: event => setContent(event.target.value), maxLength: 8000, rows: 8, placeholder: "\u793A\u4F8B\uFF1A\u9879\u76EE\u9009\u62E9 SQLite\uFF0C\u56E0\u4E3A\u9700\u8981\u5355\u6587\u4EF6\u90E8\u7F72\u548C\u672C\u5730\u4F18\u5148\uFF1B\u82E5\u5E76\u53D1\u5199\u5165\u6210\u4E3A\u74F6\u9888\u518D\u8BC4\u4F30 PostgreSQL\u3002" })] }), _jsxs("div", { className: css.formGrid, children: [_jsxs("label", { children: ["\u5206\u7C7B", _jsx("select", { value: rememberCategory, onChange: event => setRememberCategory(event.target.value), children: CATEGORIES.map(value => _jsx("option", { value: value, children: CATEGORY_LABELS[value] }, value)) })] }), _jsxs("label", { children: ["\u91CD\u8981\u6027", _jsx("select", { value: importance, onChange: event => setImportance(Number(event.target.value)), children: [1, 2, 3, 4, 5].map(value => _jsxs("option", { value: value, children: [value, " / 5"] }, value)) })] }), _jsxs("label", { className: css.fieldWide, children: ["\u6807\u7B7E\uFF08\u9017\u53F7\u5206\u9694\uFF09", _jsx("input", { value: tags, onChange: event => setTags(event.target.value), placeholder: "architecture, sqlite" })] })] }), _jsxs("div", { className: css.formActions, children: [_jsx("button", { type: "submit", className: css.primaryButton, disabled: saving || content.trim() === '', children: saving ? '保存中…' : '写入 Mnemon' }), saveResult !== null && _jsx("span", { children: saveResult })] })] })) })), page === 'config' && (_jsx("section", { className: css.page, children: _jsxs("div", { className: css.configGrid, children: [_jsxs("article", { className: css.configCard, children: [_jsx("span", { className: css.cardKicker, children: "RUNTIME" }), _jsx("h2", { children: "\u8FDE\u63A5\u914D\u7F6E" }), _jsxs("dl", { children: [_jsxs("div", { children: [_jsx("dt", { children: "CLI" }), _jsx("dd", { children: _jsx("code", { children: status?.cliPath ?? 'mnemon' }) })] }), _jsxs("div", { children: [_jsx("dt", { children: "\u7248\u672C" }), _jsx("dd", { children: status?.version ?? '—' })] }), _jsxs("div", { children: [_jsx("dt", { children: "Store" }), _jsx("dd", { children: _jsx("code", { children: status?.store ?? 'default' }) })] }), _jsxs("div", { children: [_jsx("dt", { children: "\u6570\u636E\u76EE\u5F55" }), _jsx("dd", { children: _jsx("code", { children: status?.dataDir ?? '~/.mnemon' }) })] }), _jsxs("div", { children: [_jsx("dt", { children: "\u8D85\u65F6" }), _jsxs("dd", { children: [status?.timeoutMs ?? '—', " ms"] })] }), _jsxs("div", { children: [_jsx("dt", { children: "\u9ED8\u8BA4\u53EC\u56DE" }), _jsxs("dd", { children: [status?.defaultRecallLimit ?? '—', " \u6761"] })] }), _jsxs("div", { children: [_jsx("dt", { children: "\u5199\u5165" }), _jsx("dd", { children: writeEnabled ? '已启用（本机页面）' : '只读' })] })] })] }), _jsxs("article", { className: css.configCard, children: [_jsx("span", { className: css.cardKicker, children: "PROFILE" }), _jsx("h2", { children: "DSH \u914D\u7F6E\u793A\u4F8B" }), _jsx("pre", { children: `- id: mnemon\n  config:\n    cliPath: /opt/homebrew/bin/mnemon\n    dataDir: ~/.mnemon\n    store: default\n    routingGuidance: true\n    tabEnabled: true\n    writeEnabled: true\n    timeoutMs: 10000\n    defaultRecallLimit: 10` }), _jsxs("p", { children: ["\u672A\u586B\u5199 ", _jsx("code", { children: "dataDir" }), " / ", _jsx("code", { children: "store" }), " \u65F6\uFF0C\u4FDD\u7559 Mnemon \u81EA\u8EAB\u7684\u73AF\u5883\u53D8\u91CF\u4E0E active store \u89E3\u6790\u89C4\u5219\u3002"] })] }), _jsxs("article", { className: css.configCard, children: [_jsx("span", { className: css.cardKicker, children: "PRINCIPLE" }), _jsx("h2", { children: "\u5DE5\u4F5C\u65B9\u5F0F" }), _jsxs("ul", { children: [_jsx("li", { children: "\u4EFB\u52A1\u5F00\u59CB\u53EA\u5728\u8BB0\u5FC6\u53EF\u80FD\u6539\u53D8\u7ED3\u679C\u65F6\u53EC\u56DE\u3002" }), _jsx("li", { children: "\u5F53\u524D\u7528\u6237\u6307\u4EE4\u548C\u4ED3\u5E93\u4E8B\u5B9E\u9AD8\u4E8E\u65E7\u8BB0\u5FC6\u3002" }), _jsx("li", { children: "\u4EFB\u52A1\u7ED3\u675F\u53EA\u6C89\u6DC0\u7A33\u5B9A\u3001\u53EF\u590D\u7528\u3001\u672A\u6765\u503C\u5F97\u68C0\u7D22\u7684\u6D1E\u5BDF\u3002" }), _jsx("li", { children: "Tab \u4E0D\u4F1A\u81EA\u52A8\u628A\u6574\u4E2A\u8BB0\u5FC6\u5E93\u6CE8\u5165\u6A21\u578B\u4E0A\u4E0B\u6587\u3002" })] })] })] }) }))] }));
}
//# sourceMappingURL=MnemonView.js.map