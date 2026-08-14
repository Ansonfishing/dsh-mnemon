import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import css from './MnemonSettingsCard.module.css';
import { translateZh } from "./locales.js";
const FIELD_ORDER = ['storageScope', 'dataDir'];
const INTERACTION_ORDER = ['interactionToolviews', 'interactionTurnBar', 'interactionSaveAction'];
/** Nested settings paths of the live interaction toggles. */
const INTERACTION_PATHS = {
    interactionToolviews: ['conversationInteraction', 'toolviews'],
    interactionTurnBar: ['conversationInteraction', 'turnBar'],
    interactionSaveAction: ['conversationInteraction', 'saveAction'],
};
function record(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
        ? value
        : {};
}
function draftOf(value) {
    const resolved = value ?? {};
    const interaction = record(resolved.conversationInteraction);
    return {
        storageScope: resolved.storageScope ?? (resolved.dataDir?.trim() ? 'custom' : 'global'),
        dataDir: resolved.dataDir?.trim() ?? '',
        interactionToolviews: interaction.toolviews === true,
        interactionTurnBar: interaction.turnBar === true,
        interactionSaveAction: interaction.saveAction === true,
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
    const controlsDisabled = !snapshot.writable || saving;
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
            const order = [...(draft.storageScope === 'custom' ? [...FIELD_ORDER].reverse() : FIELD_ORDER), ...INTERACTION_ORDER];
            for (const field of order) {
                if (!dirty.has(field))
                    continue;
                const booleanPath = INTERACTION_PATHS[field];
                if (booleanPath !== undefined) {
                    if (reset.has(field))
                        await scope.unsetPath(booleanPath);
                    else
                        await scope.setPath(booleanPath, draft[field] === true);
                    continue;
                }
                const stringField = field;
                if (reset.has(stringField) || (stringField === 'dataDir' && draft.dataDir.trim() === '')) {
                    await scope.unset(stringField);
                }
                else {
                    await scope.set(stringField, draft[stringField].trim());
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
    const interactionMeta = (field) => {
        const group = record(overridden.conversationInteraction);
        const path = INTERACTION_PATHS[field];
        return Object.hasOwn(group, path[path.length - 1]) && !reset.has(field);
    };
    const errorId = error === null ? undefined : 'mnemon-settings-validation';
    const loading = snapshot.status === 'loading';
    return (_jsxs("section", { className: css.card, "aria-label": t('config.aria'), "aria-busy": saving || loading, children: [_jsxs("div", { className: css.panelHeader, children: [_jsxs("div", { className: css.headerCopy, children: [_jsx("h3", { children: "Mnemon" }), _jsx("p", { children: t('config.description') })] }), _jsx("span", { className: `${css.status} ${dirty.size > 0 ? css.statusDirty : ''}`, "aria-live": "polite", children: loading ? t('common.loading') : dirty.size > 0 ? t('config.unsaved') : t('config.restart') })] }), _jsx("div", { className: css.body, children: loading ? _jsx("p", { className: css.loading, role: "status", children: t('common.loading') }) : _jsxs(_Fragment, { children: [_jsxs("p", { className: css.notice, children: [t('config.noticeBefore'), " ", _jsx("code", { children: ".dsh/settings.yaml" }), t('config.noticeAfter')] }), _jsxs("div", { className: css.primarySettings, children: [_jsx(SettingField, { controlId: "mnemon-storage-scope", t: t, label: t('config.scope'), hint: t('config.scopeHint'), overridden: fieldMeta('storageScope'), resetDisabled: controlsDisabled, onReset: () => resetField('storageScope'), children: _jsxs("select", { id: "mnemon-storage-scope", "aria-label": t('config.scopeAria'), "aria-describedby": "mnemon-storage-scope-hint", value: draft.storageScope, onChange: event => edit('storageScope', event.target.value), disabled: controlsDisabled, children: [_jsxs("option", { value: "global", children: [t('config.global'), " \u00B7 ~/.mnemon"] }), _jsxs("option", { value: "workspace", children: [t('config.workspace'), " \u00B7 <workspace>/.mnemon"] }), _jsx("option", { value: "custom", children: t('config.custom') })] }) }), draft.storageScope === 'custom' && _jsx(SettingField, { controlId: "mnemon-custom-directory", t: t, label: t('config.customDirectory'), hint: t('config.customHint'), overridden: fieldMeta('dataDir'), resetDisabled: controlsDisabled, onReset: () => resetField('dataDir'), children: _jsx("input", { id: "mnemon-custom-directory", "aria-label": t('config.customAria'), "aria-describedby": `mnemon-custom-directory-hint${errorId === undefined ? '' : ` ${errorId}`}`, "aria-invalid": error !== null, value: draft.dataDir, onChange: event => edit('dataDir', event.target.value), placeholder: "~/mnemon-data", spellCheck: false, autoComplete: "off", disabled: controlsDisabled }) })] }), _jsxs("div", { className: css.interactionGroup, children: [_jsxs("div", { className: css.interactionHeader, children: [_jsx("strong", { children: t('config.interactionTitle') }), _jsx("span", { children: t('config.interactionLive') })] }), _jsx("p", { className: css.interactionHint, children: t('config.interactionHint') }), _jsx(SettingField, { controlId: "mnemon-interaction-toolviews", t: t, label: t('config.interactionToolviews'), hint: t('config.interactionToolviewsHint'), overridden: interactionMeta('interactionToolviews'), resetDisabled: controlsDisabled, onReset: () => resetField('interactionToolviews'), children: _jsxs("label", { className: css.checkboxLine, children: [_jsx("input", { id: "mnemon-interaction-toolviews", type: "checkbox", checked: draft.interactionToolviews, onChange: event => edit('interactionToolviews', event.target.checked), disabled: controlsDisabled }), _jsx("span", { children: t('config.interactionOn') })] }) }), _jsx(SettingField, { controlId: "mnemon-interaction-turn-bar", t: t, label: t('config.interactionTurnBar'), hint: t('config.interactionTurnBarHint'), overridden: interactionMeta('interactionTurnBar'), resetDisabled: controlsDisabled, onReset: () => resetField('interactionTurnBar'), children: _jsxs("label", { className: css.checkboxLine, children: [_jsx("input", { id: "mnemon-interaction-turn-bar", type: "checkbox", checked: draft.interactionTurnBar, onChange: event => edit('interactionTurnBar', event.target.checked), disabled: controlsDisabled }), _jsx("span", { children: t('config.interactionOn') })] }) }), _jsx(SettingField, { controlId: "mnemon-interaction-save-action", t: t, label: t('config.interactionSaveAction'), hint: t('config.interactionSaveActionHint'), overridden: interactionMeta('interactionSaveAction'), resetDisabled: controlsDisabled, onReset: () => resetField('interactionSaveAction'), children: _jsxs("label", { className: css.checkboxLine, children: [_jsx("input", { id: "mnemon-interaction-save-action", type: "checkbox", checked: draft.interactionSaveAction, onChange: event => edit('interactionSaveAction', event.target.checked), disabled: controlsDisabled }), _jsx("span", { children: t('config.interactionOn') })] }) })] }), _jsxs("div", { className: css.feedback, "aria-live": "polite", children: [error !== null && _jsx("p", { id: "mnemon-settings-validation", className: css.error, role: "alert", children: error }), failed !== null && _jsx("p", { className: css.error, role: "alert", children: t('config.saveFailed', { error: failed }) }), !snapshot.writable && _jsx("p", { className: css.readOnly, children: t('config.readOnly') })] }), _jsxs("div", { className: css.actions, children: [_jsx("button", { type: "button", className: css.discard, disabled: dirty.size === 0 || saving, onClick: discard, children: t('config.discard') }), _jsx("button", { type: "button", className: css.save, disabled: dirty.size === 0 || saving || error !== null || !snapshot.writable, onClick: () => void save(), children: saving ? t('config.saving') : t('config.save') })] })] }) })] }));
}
function SettingField(props) {
    return (_jsxs("div", { className: css.field, children: [_jsxs("div", { className: css.fieldHeading, children: [_jsx("label", { className: css.fieldTitle, htmlFor: props.controlId, children: props.label }), props.overridden && _jsx("em", { className: css.overridden, children: props.t('config.overridden') }), props.overridden && _jsx("button", { className: css.reset, type: "button", disabled: props.resetDisabled, onClick: props.onReset, children: props.t('config.reset') })] }), props.children, _jsx("p", { id: `${props.controlId}-hint`, className: css.fieldHint, children: props.hint })] }));
}
//# sourceMappingURL=MnemonSettingsCard.js.map