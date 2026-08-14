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
/** Dedicated Mnemon page contributed directly to DSH's settings navigation. */
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
    const resetFields = (fields) => {
        for (const field of fields) {
            if (overridden(field))
                resetField(field);
        }
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
    const storageOverridden = CORE_FIELDS.some(overridden);
    const interactionOverridden = INTERACTION_FIELDS.some(overridden);
    return (_jsx("section", { className: css.page, "aria-label": t('config.aria'), "aria-busy": saving || loading, children: loading ? _jsx("p", { className: css.loading, role: "status", children: t('common.loading') }) : _jsxs(_Fragment, { children: [_jsxs("section", { className: css.section, "aria-labelledby": "mnemon-storage-heading", children: [_jsxs("div", { className: css.sectionHeading, children: [_jsxs("div", { children: [_jsx("h2", { id: "mnemon-storage-heading", children: t('config.storageTitle') }), _jsxs("p", { children: [t('config.storageDescription'), " ", t('config.restart')] })] }), storageOverridden && _jsx("button", { className: css.reset, type: "button", disabled: coreDisabled, onClick: () => resetFields(CORE_FIELDS), children: t('config.reset') })] }), _jsxs("div", { className: css.choiceGrid, role: "radiogroup", "aria-label": t('config.scopeAria'), children: [_jsx(ChoiceCard, { id: "mnemon-storage-global", name: "mnemon-storage", label: t('config.global'), detail: "~/.mnemon", checked: draft.storageScope === 'global', disabled: coreDisabled, onChange: () => edit('storageScope', 'global') }), _jsx(ChoiceCard, { id: "mnemon-storage-workspace", name: "mnemon-storage", label: t('config.workspace'), detail: "<workspace>/.mnemon", checked: draft.storageScope === 'workspace', disabled: coreDisabled, onChange: () => edit('storageScope', 'workspace') }), _jsx(ChoiceCard, { id: "mnemon-storage-custom", name: "mnemon-storage", label: t('config.custom'), detail: draft.dataDir.trim() || t('config.customHintShort'), checked: draft.storageScope === 'custom', disabled: coreDisabled, onChange: () => edit('storageScope', 'custom') })] }), draft.storageScope === 'custom' && _jsxs("div", { className: css.customField, children: [_jsxs("div", { className: css.fieldHeading, children: [_jsx("label", { htmlFor: "mnemon-custom-directory", children: t('config.customDirectory') }), overridden('dataDir') && _jsx("button", { className: css.reset, type: "button", disabled: coreDisabled, onClick: () => resetField('dataDir'), children: t('config.reset') })] }), _jsx("input", { id: "mnemon-custom-directory", "aria-label": t('config.customAria'), "aria-describedby": `mnemon-custom-directory-hint${errorId === undefined ? '' : ` ${errorId}`}`, "aria-invalid": error !== null, value: draft.dataDir, onChange: event => edit('dataDir', event.target.value), placeholder: "~/mnemon-data", spellCheck: false, autoComplete: "off", disabled: coreDisabled }), _jsx("p", { id: "mnemon-custom-directory-hint", children: t('config.customHint') })] })] }), _jsxs("section", { className: css.section, "aria-labelledby": "mnemon-interaction-heading", children: [_jsxs("div", { className: css.sectionHeading, children: [_jsxs("div", { children: [_jsx("h2", { id: "mnemon-interaction-heading", children: t('config.interactionTitle') }), _jsx("p", { children: t('config.interactionHint') })] }), interactionOverridden && _jsx("button", { className: css.reset, type: "button", disabled: interactionDisabled, onClick: () => resetFields(INTERACTION_FIELDS), children: t('config.reset') })] }), _jsxs("div", { className: css.choiceGrid, children: [_jsx(ToggleCard, { id: "mnemon-interaction-toolviews", label: t('config.interactionToolviews'), hint: t('config.interactionToolviewsHint'), checked: draft.toolviews, disabled: interactionDisabled, onChange: value => edit('toolviews', value) }), _jsx(ToggleCard, { id: "mnemon-interaction-turn-bar", label: t('config.interactionTurnBar'), hint: t('config.interactionTurnBarHint'), checked: draft.turnBar, disabled: interactionDisabled, onChange: value => edit('turnBar', value) }), _jsx(ToggleCard, { id: "mnemon-interaction-save-action", label: t('config.interactionSaveAction'), hint: t('config.interactionSaveActionHint'), checked: draft.saveAction, disabled: interactionDisabled, onChange: value => edit('saveAction', value) })] })] }), _jsxs("div", { className: css.feedback, "aria-live": "polite", children: [error !== null && _jsx("p", { id: "mnemon-settings-validation", className: css.error, role: "alert", children: error }), failed !== null && _jsx("p", { className: css.error, role: "alert", children: t('config.saveFailed', { error: failed }) }), !writable && _jsx("p", { className: css.readOnly, children: t('config.readOnly') })] }), _jsxs("footer", { className: `${css.actions} ${dirty.size > 0 ? css.actionsVisible : ''}`, "aria-live": "polite", children: [_jsx("span", { children: t('config.unsaved') }), _jsxs("div", { children: [_jsx("button", { type: "button", className: css.discard, disabled: dirty.size === 0 || saving, onClick: discard, children: t('config.discard') }), _jsx("button", { type: "button", className: css.save, disabled: dirty.size === 0 || saving || error !== null || !writable, onClick: () => void save(), children: saving ? t('config.saving') : t('config.save') })] })] }), _jsxs("p", { className: css.settingsNote, children: [t('config.noticeBefore'), " ", _jsx("code", { children: ".dsh/settings.yaml" }), t('config.noticeAfter')] })] }) }));
}
function ChoiceCard(props) {
    return (_jsxs("label", { className: css.choiceCard, htmlFor: props.id, children: [_jsx("input", { id: props.id, name: props.name, type: "radio", "aria-label": props.label, checked: props.checked, disabled: props.disabled, onChange: props.onChange }), _jsxs("span", { className: css.choiceFace, children: [_jsx("strong", { children: props.label }), _jsx("small", { children: props.detail }), _jsx("span", { className: css.check, "aria-hidden": "true", children: "\u2713" })] })] }));
}
function ToggleCard(props) {
    return (_jsxs("label", { className: css.choiceCard, htmlFor: props.id, children: [_jsx("input", { id: props.id, type: "checkbox", "aria-label": props.label, checked: props.checked, disabled: props.disabled, onChange: event => props.onChange(event.target.checked) }), _jsxs("span", { className: css.choiceFace, children: [_jsx("strong", { children: props.label }), _jsx("small", { children: props.hint }), _jsx("span", { className: css.check, "aria-hidden": "true", children: "\u2713" })] })] }));
}
//# sourceMappingURL=MnemonSettingsCard.js.map