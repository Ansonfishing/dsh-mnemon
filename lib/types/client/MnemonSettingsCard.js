import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import css from './MnemonSettingsCard.module.css';
import { translateZh } from "./locales.js";
const FIELD_ORDER = ['storageScope', 'dataDir'];
function record(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
        ? value
        : {};
}
function draftOf(value) {
    const resolved = value ?? {};
    return {
        storageScope: resolved.storageScope ?? (resolved.dataDir?.trim() ? 'custom' : 'global'),
        dataDir: resolved.dataDir?.trim() ?? '',
    };
}
function inheritedDraft(base) {
    return draftOf(record(base));
}
function validation(t, draft) {
    if (!['global', 'workspace', 'custom'].includes(draft.storageScope))
        return t('config.invalidScope');
    if (draft.storageScope !== 'custom')
        return null;
    const directory = draft.dataDir.trim();
    if (directory === '')
        return t('config.customRequired');
    if (!(directory === '~' || directory.startsWith('~/') || directory.startsWith('/')))
        return t('config.customAbsolute');
    return null;
}
export function MnemonSettingsCard({ scope, t = translateZh }) {
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
    const error = validation(t, draft);
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
            const order = draft.storageScope === 'custom' ? [...FIELD_ORDER].reverse() : FIELD_ORDER;
            for (const field of order) {
                if (!dirty.has(field))
                    continue;
                if (reset.has(field) || (field === 'dataDir' && draft.dataDir.trim() === '')) {
                    await scope.unset(field);
                }
                else {
                    await scope.set(field, draft[field].trim());
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
    return (_jsxs("section", { className: css.card, "aria-label": t('config.aria'), children: [_jsxs("div", { className: css.panelHeader, children: [_jsxs("div", { children: [_jsx("h3", { children: "Mnemon" }), _jsx("p", { children: t('config.description') })] }), _jsx("strong", { children: dirty.size > 0 ? t('config.unsaved') : t('config.restart') })] }), _jsxs("div", { className: css.body, children: [_jsxs("div", { className: css.notice, children: [t('config.noticeBefore'), " ", _jsx("code", { children: ".dsh/settings.yaml" }), t('config.noticeAfter')] }), _jsxs("div", { className: css.primarySettings, children: [_jsx(SettingField, { t: t, label: t('config.scope'), hint: t('config.scopeHint'), overridden: fieldMeta('storageScope'), onReset: () => resetField('storageScope'), children: _jsxs("select", { "aria-label": t('config.scopeAria'), value: draft.storageScope, onChange: event => edit('storageScope', event.target.value), disabled: !snapshot.writable, children: [_jsxs("option", { value: "global", children: [t('config.global'), " \u00B7 ~/.mnemon"] }), _jsxs("option", { value: "workspace", children: [t('config.workspace'), " \u00B7 <workspace>/.mnemon"] }), _jsx("option", { value: "custom", children: t('config.custom') })] }) }), draft.storageScope === 'custom' && _jsx(SettingField, { t: t, label: t('config.customDirectory'), hint: t('config.customHint'), overridden: fieldMeta('dataDir'), onReset: () => resetField('dataDir'), children: _jsx("input", { "aria-label": t('config.customAria'), value: draft.dataDir, onChange: event => edit('dataDir', event.target.value), placeholder: "~/mnemon-data", disabled: !snapshot.writable }) })] }), error !== null && _jsx("p", { className: css.error, role: "alert", children: error }), failed !== null && _jsx("p", { className: css.error, role: "alert", children: t('config.saveFailed', { error: failed }) }), !snapshot.writable && _jsx("p", { className: css.readOnly, children: t('config.readOnly') }), _jsxs("div", { className: css.actions, children: [_jsx("button", { type: "button", className: css.discard, disabled: dirty.size === 0 || saving, onClick: discard, children: t('config.discard') }), _jsx("button", { type: "button", className: css.save, disabled: dirty.size === 0 || saving || error !== null || !snapshot.writable, onClick: () => void save(), children: saving ? t('config.saving') : t('config.save') })] })] })] }));
}
function SettingField(props) {
    return (_jsxs("label", { className: css.field, children: [_jsxs("span", { className: css.fieldTitle, children: [props.label, props.overridden && _jsx("em", { children: props.t('config.overridden') }), props.overridden && _jsx("button", { type: "button", onClick: event => { event.preventDefault(); props.onReset(); }, children: props.t('config.reset') })] }), props.children, _jsx("small", { children: props.hint })] }));
}
//# sourceMappingURL=MnemonSettingsCard.js.map