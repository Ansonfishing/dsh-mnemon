import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { DEFAULT_IDLE_REVIEW_MS, DEFAULT_RECALL_LIMIT, DEFAULT_TIMEOUT_MS } from "../config-values.js";
import css from './MnemonSettingsCard.module.css';
const FIELD_ORDER = [
    'cliPath',
    'dataDir',
    'store',
    'timeoutMs',
    'defaultRecallLimit',
    'routingGuidance',
    'lifecycleEnabled',
    'recallMode',
    'writebackMode',
    'idleReviewMs',
    'tabEnabled',
    'writeEnabled',
];
function record(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
        ? value
        : {};
}
function draftOf(value) {
    const resolved = value ?? {};
    return {
        cliPath: resolved.cliPath?.trim() ?? '',
        dataDir: resolved.dataDir?.trim() ?? '',
        store: resolved.store?.trim() ?? '',
        timeoutMs: String(resolved.timeoutMs ?? DEFAULT_TIMEOUT_MS),
        defaultRecallLimit: String(resolved.defaultRecallLimit ?? DEFAULT_RECALL_LIMIT),
        routingGuidance: resolved.routingGuidance ?? true,
        lifecycleEnabled: resolved.lifecycleEnabled ?? true,
        recallMode: resolved.recallMode ?? 'guided',
        writebackMode: resolved.writebackMode ?? 'guided',
        idleReviewMs: String(resolved.idleReviewMs ?? DEFAULT_IDLE_REVIEW_MS),
        tabEnabled: resolved.tabEnabled ?? true,
        writeEnabled: resolved.writeEnabled ?? true,
    };
}
function inheritedDraft(base) {
    return draftOf(record(base));
}
function isBooleanField(field) {
    return field === 'routingGuidance' || field === 'lifecycleEnabled' || field === 'tabEnabled' || field === 'writeEnabled';
}
function parsed(field, value) {
    if (isBooleanField(field))
        return value;
    if (field === 'timeoutMs' || field === 'defaultRecallLimit' || field === 'idleReviewMs')
        return Number(value);
    return String(value).trim();
}
function validation(draft) {
    const timeout = Number(draft.timeoutMs);
    if (!Number.isInteger(timeout) || timeout < 100 || timeout > 120_000)
        return 'CLI 超时需为 100–120000 之间的整数。';
    const limit = Number(draft.defaultRecallLimit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 50)
        return '默认召回条数需为 1–50 之间的整数。';
    const idleReview = Number(draft.idleReviewMs);
    if (!Number.isInteger(idleReview) || idleReview < 5_000 || idleReview > 600_000)
        return '空闲审查阈值需为 5000–600000 ms 之间的整数。';
    const store = String(draft.store).trim();
    if (store !== '' && !/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(store))
        return 'Store 仅支持字母、数字、下划线和连字符。';
    if (!['guided', 'off'].includes(String(draft.recallMode)))
        return '召回 Hook 模式无效。';
    if (!['guided', 'off'].includes(String(draft.writebackMode)))
        return '沉淀 Hook 模式无效。';
    return null;
}
export function MnemonSettingsCard({ scope }) {
    const subscribe = useMemo(() => scope.subscribe.bind(scope), [scope]);
    const getSnapshot = useMemo(() => scope.getSnapshot.bind(scope), [scope]);
    const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    const [draft, setDraft] = useState(() => draftOf(snapshot.value));
    const [dirty, setDirty] = useState(() => new Set());
    const [reset, setReset] = useState(() => new Set());
    const [saving, setSaving] = useState(false);
    const [failed, setFailed] = useState(null);
    useEffect(() => {
        if (dirty.size === 0)
            setDraft(draftOf(snapshot.value));
    }, [dirty.size, snapshot.value]);
    const overridden = useMemo(() => record(snapshot.user), [snapshot.user]);
    const inherited = useMemo(() => inheritedDraft(snapshot.base), [snapshot.base]);
    const error = validation(draft);
    if (snapshot.status === 'unavailable')
        return null;
    const edit = (field, value) => {
        setDraft(current => ({ ...current, [field]: value }));
        setDirty(current => new Set(current).add(field));
        setReset(current => {
            const next = new Set(current);
            next.delete(field);
            return next;
        });
        setFailed(null);
    };
    const resetField = (field) => {
        setDraft(current => ({ ...current, [field]: inherited[field] }));
        setDirty(current => new Set(current).add(field));
        setReset(current => new Set(current).add(field));
        setFailed(null);
    };
    const discard = () => {
        setDraft(draftOf(snapshot.value));
        setDirty(new Set());
        setReset(new Set());
        setFailed(null);
    };
    const save = async () => {
        if (error !== null || dirty.size === 0 || saving)
            return;
        setSaving(true);
        setFailed(null);
        try {
            for (const field of FIELD_ORDER) {
                if (!dirty.has(field))
                    continue;
                if (reset.has(field) || (!isBooleanField(field) && String(draft[field]).trim() === '' && (field === 'cliPath' || field === 'dataDir' || field === 'store'))) {
                    await scope.unset(field);
                }
                else {
                    await scope.set(field, parsed(field, draft[field]));
                }
            }
            setDirty(new Set());
            setReset(new Set());
        }
        catch (reason) {
            setFailed(reason instanceof Error ? reason.message : String(reason));
        }
        finally {
            setSaving(false);
        }
    };
    const fieldMeta = (field) => Object.hasOwn(overridden, field) && !reset.has(field);
    return (_jsxs("section", { className: css.card, "aria-label": "Mnemon \u914D\u7F6E", children: [_jsxs("div", { className: css.panelHeader, children: [_jsxs("div", { children: [_jsx("span", { children: "PLUGIN CONFIG" }), _jsx("h3", { children: "\u8FDE\u63A5\u4E0E\u884C\u4E3A" }), _jsx("p", { children: "\u914D\u7F6E Mnemon CLI\u3001Store\u3001\u53EC\u56DE\u4E0A\u9650\u4E0E\u8BFB\u5199\u7B56\u7565\u3002" })] }), _jsx("strong", { children: dirty.size > 0 ? '未保存' : '重启后生效' })] }), _jsxs("div", { className: css.body, children: [_jsxs("div", { className: css.notice, children: [_jsx("span", { children: "RESTART" }), " \u4FDD\u5B58\u5230 ", _jsx("code", { children: ".dsh/settings.yaml" }), "\uFF0C\u91CD\u542F DSH \u540E\u5E94\u7528\u3002"] }), _jsxs("div", { className: css.grid, children: [_jsx(SettingField, { label: "Mnemon CLI", hint: "\u7559\u7A7A\u65F6\u6309\u73AF\u5883\u53D8\u91CF\u3001PATH \u4E0E\u5E38\u89C1\u5B89\u88C5\u8DEF\u5F84\u81EA\u52A8\u53D1\u73B0\u3002", overridden: fieldMeta('cliPath'), onReset: () => resetField('cliPath'), children: _jsx("input", { "aria-label": "Mnemon CLI", value: String(draft.cliPath), onChange: event => edit('cliPath', event.target.value), placeholder: "\u81EA\u52A8\u53D1\u73B0", disabled: !snapshot.writable }) }), _jsx(SettingField, { label: "\u6570\u636E\u76EE\u5F55", hint: "Mnemon \u6839\u76EE\u5F55\uFF1B\u7559\u7A7A\u6CBF\u7528 MNEMON_DATA_DIR \u6216 ~/.mnemon\u3002", overridden: fieldMeta('dataDir'), onReset: () => resetField('dataDir'), children: _jsx("input", { "aria-label": "Mnemon \u6570\u636E\u76EE\u5F55", value: String(draft.dataDir), onChange: event => edit('dataDir', event.target.value), placeholder: "~/.mnemon", disabled: !snapshot.writable }) }), _jsx(SettingField, { label: "\u547D\u540D Store", hint: "\u591A\u4E2A Agent \u5171\u4EAB\u65F6\u7559\u7A7A\uFF1B\u9700\u8981\u9694\u79BB\u65F6\u6307\u5B9A\u7A33\u5B9A\u540D\u79F0\u3002", overridden: fieldMeta('store'), onReset: () => resetField('store'), children: _jsx("input", { "aria-label": "Mnemon Store", value: String(draft.store), onChange: event => edit('store', event.target.value), placeholder: "active / default", disabled: !snapshot.writable }) }), _jsx(SettingField, { label: "CLI \u8D85\u65F6", hint: `单次命令上限，默认 ${DEFAULT_TIMEOUT_MS} ms。`, overridden: fieldMeta('timeoutMs'), onReset: () => resetField('timeoutMs'), children: _jsx("input", { "aria-label": "Mnemon CLI \u8D85\u65F6", type: "number", min: 100, max: 120000, step: 100, value: String(draft.timeoutMs), onChange: event => edit('timeoutMs', event.target.value), disabled: !snapshot.writable }) }), _jsx(SettingField, { label: "\u9ED8\u8BA4\u53EC\u56DE\u6761\u6570", hint: `模型工具与 WebUI 的默认上限，默认 ${DEFAULT_RECALL_LIMIT}。`, overridden: fieldMeta('defaultRecallLimit'), onReset: () => resetField('defaultRecallLimit'), children: _jsx("input", { "aria-label": "Mnemon \u9ED8\u8BA4\u53EC\u56DE\u6761\u6570", type: "number", min: 1, max: 50, value: String(draft.defaultRecallLimit), onChange: event => edit('defaultRecallLimit', event.target.value), disabled: !snapshot.writable }) }), _jsx(SettingField, { label: "\u53EC\u56DE Hook", hint: "guided \u4F1A\u5728\u6BCF\u8F6E\u9996\u4E2A\u6A21\u578B\u8BF7\u6C42\u524D\u6CE8\u5165\u4E00\u6B21\u53EC\u56DE\u5224\u65AD\uFF1Boff \u4EC5\u4FDD\u7559\u624B\u52A8\u5DE5\u5177\u3002", overridden: fieldMeta('recallMode'), onReset: () => resetField('recallMode'), children: _jsxs("select", { "aria-label": "Mnemon \u53EC\u56DE Hook", value: String(draft.recallMode), onChange: event => edit('recallMode', event.target.value), disabled: !snapshot.writable, children: [_jsx("option", { value: "guided", children: "guided \u00B7 LLM \u5224\u65AD" }), _jsx("option", { value: "off", children: "off \u00B7 \u5173\u95ED" })] }) }), _jsx(SettingField, { label: "\u6C89\u6DC0 Hook", hint: "guided \u63D0\u9192\u4E3B\u6A21\u578B\u6309\u9700 remember\uFF0C\u5E76\u5728\u6301\u7EED\u7A7A\u95F2\u540E fork \u5B8C\u6574 checkpoint \u505A\u4E00\u6B21\u5BA1\u67E5\u3002", overridden: fieldMeta('writebackMode'), onReset: () => resetField('writebackMode'), children: _jsxs("select", { "aria-label": "Mnemon \u6C89\u6DC0 Hook", value: String(draft.writebackMode), onChange: event => edit('writebackMode', event.target.value), disabled: !snapshot.writable, children: [_jsx("option", { value: "guided", children: "guided \u00B7 \u81EA\u4E3B\u5224\u65AD + \u7A7A\u95F2\u5BA1\u67E5" }), _jsx("option", { value: "off", children: "off \u00B7 \u5173\u95ED" })] }) }), _jsx(SettingField, { label: "\u7A7A\u95F2\u5BA1\u67E5\u9608\u503C", hint: `根 Agent 连续空闲多久后 fork 完整 checkpoint，默认 ${DEFAULT_IDLE_REVIEW_MS} ms。`, overridden: fieldMeta('idleReviewMs'), onReset: () => resetField('idleReviewMs'), children: _jsx("input", { "aria-label": "Mnemon \u7A7A\u95F2\u5BA1\u67E5\u9608\u503C", type: "number", min: 5000, max: 600000, step: 1000, value: String(draft.idleReviewMs), onChange: event => edit('idleReviewMs', event.target.value), disabled: !snapshot.writable }) })] }), _jsxs("div", { className: css.switches, children: [_jsx(SettingToggle, { label: "\u8BB0\u5FC6\u8DEF\u7531\u6307\u5F15", hint: "\u6307\u5BFC Agent \u6309\u9700\u53EC\u56DE\u3001\u5BA1\u614E\u5199\u56DE\u3002", checked: Boolean(draft.routingGuidance), overridden: fieldMeta('routingGuidance'), disabled: !snapshot.writable, onChange: value => edit('routingGuidance', value), onReset: () => resetField('routingGuidance') }), _jsx(SettingToggle, { label: "\u751F\u547D\u5468\u671F\u7F16\u6392", hint: "\u4E3A DSH \u6839 Agent \u542F\u7528 Prime\u3001\u77ED\u63D0\u793A\u4E0E\u7A7A\u95F2 checkpoint \u5BA1\u67E5\u3002", checked: Boolean(draft.lifecycleEnabled), overridden: fieldMeta('lifecycleEnabled'), disabled: !snapshot.writable, onChange: value => edit('lifecycleEnabled', value), onReset: () => resetField('lifecycleEnabled') }), _jsx(SettingToggle, { label: "\u4F1A\u8BDD\u8BB0\u5FC6 Tab", hint: "\u5728\u4F1A\u8BDD\u9875\u5C55\u793A Mnemon \u68C0\u7D22\u4E0E\u7BA1\u7406\u754C\u9762\u3002", checked: Boolean(draft.tabEnabled), overridden: fieldMeta('tabEnabled'), disabled: !snapshot.writable, onChange: value => edit('tabEnabled', value), onReset: () => resetField('tabEnabled') }), _jsx(SettingToggle, { label: "\u5141\u8BB8\u5199\u5165", hint: "\u63A7\u5236 Agent \u4E0E\u672C\u673A WebUI \u7684 remember/link/forget \u80FD\u529B\u3002", checked: Boolean(draft.writeEnabled), overridden: fieldMeta('writeEnabled'), disabled: !snapshot.writable, onChange: value => edit('writeEnabled', value), onReset: () => resetField('writeEnabled') })] }), error !== null && _jsx("p", { className: css.error, role: "alert", children: error }), failed !== null && _jsxs("p", { className: css.error, role: "alert", children: ["\u4FDD\u5B58\u5931\u8D25\uFF1A", failed] }), !snapshot.writable && _jsx("p", { className: css.readOnly, children: "\u5F53\u524D\u90E8\u7F72\u7684 settings \u4E3A\u53EA\u8BFB\u3002" }), _jsxs("div", { className: css.actions, children: [_jsx("button", { type: "button", className: css.discard, disabled: dirty.size === 0 || saving, onClick: discard, children: "\u653E\u5F03\u4FEE\u6539" }), _jsx("button", { type: "button", className: css.save, disabled: dirty.size === 0 || saving || error !== null || !snapshot.writable, onClick: () => void save(), children: saving ? '保存中…' : '保存到 settings.yaml' })] })] })] }));
}
function SettingField(props) {
    return (_jsxs("label", { className: css.field, children: [_jsxs("span", { className: css.fieldTitle, children: [props.label, props.overridden && _jsx("em", { children: "\u5DF2\u8986\u76D6" }), props.overridden && _jsx("button", { type: "button", onClick: event => { event.preventDefault(); props.onReset(); }, children: "\u6062\u590D\u9ED8\u8BA4" })] }), props.children, _jsx("small", { children: props.hint })] }));
}
function SettingToggle(props) {
    return (_jsxs("div", { className: css.toggleRow, children: [_jsxs("span", { children: [_jsxs("strong", { children: [props.label, props.overridden && _jsx("em", { children: "\u5DF2\u8986\u76D6" })] }), _jsx("small", { children: props.hint })] }), props.overridden && _jsx("button", { type: "button", className: css.resetLink, onClick: props.onReset, children: "\u6062\u590D\u9ED8\u8BA4" }), _jsxs("label", { className: css.switch, children: [_jsx("input", { type: "checkbox", "aria-label": props.label, checked: props.checked, disabled: props.disabled, onChange: event => props.onChange(event.target.checked) }), _jsx("span", {})] })] }));
}
//# sourceMappingURL=MnemonSettingsCard.js.map