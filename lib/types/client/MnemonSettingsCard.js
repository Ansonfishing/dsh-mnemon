import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import css from './MnemonSettingsCard.module.css';
import { translateZh } from "./locales.js";
const CORE_FIELDS = ['storageScope', 'dataDir'];
const INTERACTION_FIELDS = ['toolviews', 'turnBar', 'saveAction'];
function record(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value) ? value : {};
}
function coreDraft(value) {
    const resolved = value ?? {};
    return {
        storageScope: resolved.storageScope ?? (resolved.dataDir?.trim() ? 'custom' : 'global'),
        dataDir: resolved.dataDir?.trim() ?? '',
    };
}
function interactionDraft(value) {
    return {
        toolviews: value?.toolviews === true,
        turnBar: value?.turnBar === true,
        saveAction: value?.saveAction === true,
    };
}
function draftOf(core, interaction) {
    return { ...coreDraft(core), ...interactionDraft(interaction) };
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
function useScope(scope) {
    const subscribe = useMemo(() => scope.subscribe.bind(scope), [scope]);
    const getSnapshot = useMemo(() => scope.getSnapshot.bind(scope), [scope]);
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
function operations(fields, dirty, reset, draft) {
    return fields.flatMap((field) => {
        if (!dirty.has(field))
            return [];
        if (reset.has(field) || (field === 'dataDir' && draft.dataDir.trim() === ''))
            return [{ op: 'unset', path: [field] }];
        return [{ op: 'set', path: [field], value: typeof draft[field] === 'string' ? draft[field].trim() : draft[field] }];
    });
}
async function commit(scope, edits) {
    if (scope.mutate !== undefined)
        return scope.mutate(edits);
    for (const edit of edits) {
        if (edit.path.length === 1) {
            if (edit.op === 'set')
                await scope.set(edit.path[0], edit.value);
            else
                await scope.unset(edit.path[0]);
        }
        else if (edit.op === 'set')
            await scope.setPath(edit.path, edit.value);
        else
            await scope.unsetPath(edit.path);
    }
}
/** Dedicated Mnemon page contributed to DSH's Plugins settings tabs. */
export function MnemonSettingsCard({ scope, interactionScope: suppliedInteractionScope, t = translateZh }) {
    const interactionScope = suppliedInteractionScope ?? scope;
    const coreSnapshot = useScope(scope);
    const interactionSnapshot = useScope(interactionScope);
    const [draft, setDraft] = useState(() => draftOf(coreSnapshot.value, interactionSnapshot.value));
    const [dirty, setDirty] = useState(() => new Set());
    const [reset, setReset] = useState(() => new Set());
    const [saving, setSaving] = useState(false);
    const [failed, setFailed] = useState(null);
    useEffect(() => {
        if (dirty.size === 0)
            setDraft(draftOf(coreSnapshot.value, interactionSnapshot.value));
    }, [dirty.size, coreSnapshot.value, interactionSnapshot.value]);
    const inherited = useMemo(() => draftOf(record(coreSnapshot.base), record(interactionSnapshot.base)), [coreSnapshot.base, interactionSnapshot.base]);
    const coreUser = useMemo(() => record(coreSnapshot.user), [coreSnapshot.user]);
    const interactionUser = useMemo(() => record(interactionSnapshot.user), [interactionSnapshot.user]);
    const error = validation(t, draft);
    const loading = coreSnapshot.status === 'loading' || interactionSnapshot.status === 'loading';
    const writable = coreSnapshot.writable && interactionSnapshot.writable;
    if (coreSnapshot.status === 'unavailable' && interactionSnapshot.status === 'unavailable')
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
        setDraft(draftOf(coreSnapshot.value, interactionSnapshot.value));
        setDirty(new Set());
        setReset(new Set());
        setFailed(null);
    };
    const save = async () => {
        if (error !== null || dirty.size === 0 || saving || !writable)
            return;
        setSaving(true);
        setFailed(null);
        try {
            const coreOrder = draft.storageScope === 'custom' ? ['dataDir', 'storageScope'] : CORE_FIELDS;
            const coreOps = operations(coreOrder, dirty, reset, draft);
            const interactionOps = operations(INTERACTION_FIELDS, dirty, reset, draft);
            await Promise.all([
                ...(coreOps.length === 0 ? [] : [commit(scope, coreOps)]),
                ...(interactionOps.length === 0 ? [] : [commit(interactionScope, interactionOps)]),
            ]);
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
    const overridden = (field) => Object.hasOwn(INTERACTION_FIELDS.includes(field) ? interactionUser : coreUser, field) && !reset.has(field);
    const coreDisabled = loading || saving || !coreSnapshot.writable;
    const interactionDisabled = loading || saving || !interactionSnapshot.writable;
    const errorId = error === null ? undefined : 'mnemon-settings-validation';
    return (_jsxs("section", { className: css.page, "aria-label": t('config.aria'), "aria-busy": saving || loading, children: [_jsxs("header", { className: css.pageHeader, children: [_jsxs("div", { className: css.headerCopy, children: [_jsx("span", { className: css.eyebrow, children: "MNEMON" }), _jsx("h2", { children: t('config.title') }), _jsx("p", { children: t('config.description') })] }), _jsx("span", { className: `${css.status} ${dirty.size > 0 ? css.statusDirty : ''}`, "aria-live": "polite", children: loading ? t('common.loading') : dirty.size > 0 ? t('config.unsaved') : t('config.ready') })] }), loading ? _jsx("p", { className: css.loading, role: "status", children: t('common.loading') }) : _jsxs(_Fragment, { children: [_jsxs("p", { className: css.notice, children: [t('config.noticeBefore'), " ", _jsx("code", { children: ".dsh/settings.yaml" }), t('config.noticeAfter')] }), _jsxs("section", { className: css.group, "aria-labelledby": "mnemon-storage-heading", children: [_jsxs("div", { className: css.groupHeader, children: [_jsxs("div", { children: [_jsx("h3", { id: "mnemon-storage-heading", children: t('config.storageTitle') }), _jsx("p", { children: t('config.storageDescription') })] }), _jsx("span", { className: css.restartBadge, children: t('config.restart') })] }), _jsxs("div", { className: css.fields, children: [_jsx(SettingField, { controlId: "mnemon-storage-scope", t: t, label: t('config.scope'), hint: t('config.scopeHint'), overridden: overridden('storageScope'), resetDisabled: coreDisabled, onReset: () => resetField('storageScope'), children: _jsxs("select", { id: "mnemon-storage-scope", "aria-label": t('config.scopeAria'), "aria-describedby": "mnemon-storage-scope-hint", value: draft.storageScope, onChange: event => edit('storageScope', event.target.value), disabled: coreDisabled, children: [_jsxs("option", { value: "global", children: [t('config.global'), " \u00B7 ~/.mnemon"] }), _jsxs("option", { value: "workspace", children: [t('config.workspace'), " \u00B7 <workspace>/.mnemon"] }), _jsx("option", { value: "custom", children: t('config.custom') })] }) }), draft.storageScope === 'custom' && _jsx(SettingField, { controlId: "mnemon-custom-directory", t: t, label: t('config.customDirectory'), hint: t('config.customHint'), overridden: overridden('dataDir'), resetDisabled: coreDisabled, onReset: () => resetField('dataDir'), children: _jsx("input", { id: "mnemon-custom-directory", "aria-label": t('config.customAria'), "aria-describedby": `mnemon-custom-directory-hint${errorId === undefined ? '' : ` ${errorId}`}`, "aria-invalid": error !== null, value: draft.dataDir, onChange: event => edit('dataDir', event.target.value), placeholder: "~/mnemon-data", spellCheck: false, autoComplete: "off", disabled: coreDisabled }) })] })] }), _jsxs("section", { className: css.group, "aria-labelledby": "mnemon-interaction-heading", children: [_jsxs("div", { className: css.groupHeader, children: [_jsxs("div", { children: [_jsx("h3", { id: "mnemon-interaction-heading", children: t('config.interactionTitle') }), _jsx("p", { children: t('config.interactionHint') })] }), _jsx("span", { className: css.liveBadge, children: t('config.interactionLive') })] }), _jsxs("div", { className: css.switches, children: [_jsx(SwitchRow, { id: "mnemon-interaction-toolviews", label: t('config.interactionToolviews'), hint: t('config.interactionToolviewsHint'), checked: draft.toolviews, disabled: interactionDisabled, overridden: overridden('toolviews'), t: t, onReset: () => resetField('toolviews'), onChange: value => edit('toolviews', value) }), _jsx(SwitchRow, { id: "mnemon-interaction-turn-bar", label: t('config.interactionTurnBar'), hint: t('config.interactionTurnBarHint'), checked: draft.turnBar, disabled: interactionDisabled, overridden: overridden('turnBar'), t: t, onReset: () => resetField('turnBar'), onChange: value => edit('turnBar', value) }), _jsx(SwitchRow, { id: "mnemon-interaction-save-action", label: t('config.interactionSaveAction'), hint: t('config.interactionSaveActionHint'), checked: draft.saveAction, disabled: interactionDisabled, overridden: overridden('saveAction'), t: t, onReset: () => resetField('saveAction'), onChange: value => edit('saveAction', value) })] })] }), _jsxs("div", { className: css.feedback, "aria-live": "polite", children: [error !== null && _jsx("p", { id: "mnemon-settings-validation", className: css.error, role: "alert", children: error }), failed !== null && _jsx("p", { className: css.error, role: "alert", children: t('config.saveFailed', { error: failed }) }), !writable && _jsx("p", { className: css.readOnly, children: t('config.readOnly') })] }), _jsxs("footer", { className: `${css.actions} ${dirty.size > 0 ? css.actionsVisible : ''}`, children: [_jsx("span", { children: dirty.size > 0 ? t('config.unsaved') : t('config.ready') }), _jsxs("div", { children: [_jsx("button", { type: "button", className: css.discard, disabled: dirty.size === 0 || saving, onClick: discard, children: t('config.discard') }), _jsx("button", { type: "button", className: css.save, disabled: dirty.size === 0 || saving || error !== null || !writable, onClick: () => void save(), children: saving ? t('config.saving') : t('config.save') })] })] })] })] }));
}
function SettingField(props) {
    return (_jsxs("div", { className: css.field, children: [_jsxs("div", { className: css.fieldHeading, children: [_jsx("label", { className: css.fieldTitle, htmlFor: props.controlId, children: props.label }), props.overridden && _jsx("em", { className: css.overridden, children: props.t('config.overridden') }), props.overridden && _jsx("button", { className: css.reset, type: "button", disabled: props.resetDisabled, onClick: props.onReset, children: props.t('config.reset') })] }), props.children, _jsx("p", { id: `${props.controlId}-hint`, className: css.fieldHint, children: props.hint })] }));
}
function SwitchRow(props) {
    return (_jsxs("div", { className: css.switchRow, children: [_jsxs("label", { htmlFor: props.id, className: css.switchCopy, children: [_jsx("strong", { children: props.label }), _jsx("span", { children: props.hint })] }), _jsxs("div", { className: css.switchControl, children: [props.overridden && _jsx("button", { className: css.reset, type: "button", disabled: props.disabled, onClick: props.onReset, children: props.t('config.reset') }), _jsxs("label", { className: css.switch, children: [_jsx("input", { id: props.id, type: "checkbox", "aria-label": props.label, checked: props.checked, disabled: props.disabled, onChange: event => props.onChange(event.target.checked) }), _jsx("span", { "aria-hidden": "true" })] })] })] }));
}
//# sourceMappingURL=MnemonSettingsCard.js.map