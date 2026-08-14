import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import css from './MnemonSettingsCard.module.css';
import { translateZh } from "./locales.js";
import { MnemonPackSection } from "./MnemonPackSection.js";
const CORE_FIELDS = ['displayMode', 'storageScope', 'dataDir'];
const INTERACTION_FIELDS = ['turnBar', 'saveAction'];
function record(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value) ? value : {};
}
function legacyPackDirectory(value) {
    const packs = value.customPacks ?? [];
    return packs.find(pack => pack.id === value.customPackId)?.dataDir?.trim()
        ?? (packs.length === 1 ? packs[0]?.dataDir?.trim() : undefined)
        ?? '';
}
function coreDraft(value) {
    const resolved = value ?? {};
    const dataDir = resolved.dataDir?.trim() || legacyPackDirectory(resolved);
    return {
        displayMode: resolved.displayMode ?? 'sidebar',
        storageScope: resolved.storageScope ?? (dataDir === '' ? 'global' : 'custom'),
        dataDir,
    };
}
function interactionDraft(value) {
    return {
        turnBar: value?.turnBar !== false,
        saveAction: value?.saveAction !== false,
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
    const posixAbsolute = directory.startsWith('/');
    const homeRelative = directory === '~' || directory.startsWith('~/');
    const windowsDriveAbsolute = /^[a-zA-Z]:[\\/]/.test(directory);
    const windowsUncAbsolute = /^\\\\[^\\/]+[\\/][^\\/]+/.test(directory);
    if (!posixAbsolute && !homeRelative && !windowsDriveAbsolute && !windowsUncAbsolute)
        return t('config.customAbsolute');
    return null;
}
function useScope(scope) {
    const subscribe = useMemo(() => scope.subscribe.bind(scope), [scope]);
    const getSnapshot = useMemo(() => scope.getSnapshot.bind(scope), [scope]);
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
function operations(fields, dirty, draft) {
    return fields.flatMap((field) => {
        if (!dirty.has(field))
            return [];
        if (field === 'dataDir' && draft.dataDir.trim() === '')
            return [{ op: 'unset', path: [field] }];
        const value = draft[field];
        return [{ op: 'set', path: [field], value: typeof value === 'string' ? value.trim() : value }];
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
export function MnemonSettingsCard({ scope, interactionScope: suppliedInteractionScope, connection, t = translateZh }) {
    const interactionScope = suppliedInteractionScope ?? scope;
    const coreSnapshot = useScope(scope);
    const interactionSnapshot = useScope(interactionScope);
    const [draft, setDraft] = useState(() => draftOf(coreSnapshot.value, interactionSnapshot.value));
    const [dirty, setDirty] = useState(() => new Set());
    const [saving, setSaving] = useState(false);
    const [failed, setFailed] = useState(null);
    const [applied, setApplied] = useState(false);
    const [targetRevision, setTargetRevision] = useState(0);
    useEffect(() => {
        if (dirty.size === 0)
            setDraft(draftOf(coreSnapshot.value, interactionSnapshot.value));
    }, [dirty.size, coreSnapshot.value, interactionSnapshot.value]);
    const coreUser = useMemo(() => record(coreSnapshot.user), [coreSnapshot.user]);
    const error = validation(t, draft);
    const loading = coreSnapshot.status === 'loading' || interactionSnapshot.status === 'loading';
    const writable = coreSnapshot.writable && interactionSnapshot.writable;
    if (coreSnapshot.status === 'unavailable' && interactionSnapshot.status === 'unavailable')
        return null;
    const edit = (field, value) => {
        setDraft(current => ({ ...current, [field]: value }));
        setDirty(current => new Set(current).add(field));
        setFailed(null);
        setApplied(false);
    };
    const discard = () => {
        setDraft(draftOf(coreSnapshot.value, interactionSnapshot.value));
        setDirty(new Set());
        setFailed(null);
        setApplied(false);
    };
    const save = async () => {
        if (error !== null || dirty.size === 0 || saving || !writable)
            return;
        setSaving(true);
        setFailed(null);
        try {
            const coreOps = operations(CORE_FIELDS, dirty, draft);
            if (coreOps.length > 0) {
                if (Object.hasOwn(coreUser, 'customPackId'))
                    coreOps.push({ op: 'unset', path: ['customPackId'] });
                if (Object.hasOwn(coreUser, 'customPacks'))
                    coreOps.push({ op: 'unset', path: ['customPacks'] });
            }
            const interactionOps = operations(INTERACTION_FIELDS, dirty, draft);
            await Promise.all([
                ...(coreOps.length === 0 ? [] : [commit(scope, coreOps)]),
                ...(interactionOps.length === 0 ? [] : [commit(interactionScope, interactionOps)]),
            ]);
            setDirty(new Set());
            setApplied(true);
            if (coreOps.length > 0)
                setTargetRevision(revision => revision + 1);
        }
        catch (reason) {
            setFailed(reason instanceof Error ? reason.message : String(reason));
        }
        finally {
            setSaving(false);
        }
    };
    const coreDisabled = loading || saving || !coreSnapshot.writable;
    const interactionDisabled = loading || saving || !interactionSnapshot.writable;
    return (_jsx("section", { className: css.page, "aria-label": t('config.aria'), "aria-busy": saving || loading, children: loading ? _jsx("p", { className: css.loading, role: "status", children: t('common.loading') }) : _jsxs(_Fragment, { children: [_jsxs("header", { className: css.pageHeader, children: [_jsx("h1", { children: t('config.title') }), _jsx("p", { children: t('config.description') })] }), _jsxs("section", { className: css.section, "aria-labelledby": "mnemon-display-heading", children: [_jsx("div", { className: css.sectionHeading, children: _jsxs("div", { children: [_jsx("h2", { id: "mnemon-display-heading", children: t('config.displayTitle') }), _jsx("p", { children: t('config.displayDescription') })] }) }), _jsxs("div", { className: `${css.choiceGrid} ${css.displayGrid}`, role: "radiogroup", "aria-label": t('config.displayAria'), children: [_jsx(ChoiceCard, { id: "mnemon-display-sidebar", name: "mnemon-display", label: t('config.displaySidebar'), detail: t('config.displaySidebarHint'), checked: draft.displayMode === 'sidebar', disabled: coreDisabled, onChange: () => edit('displayMode', 'sidebar') }), _jsx(ChoiceCard, { id: "mnemon-display-buildin", name: "mnemon-display", label: t('config.displayBuildin'), detail: t('config.displayBuildinHint'), checked: draft.displayMode === 'buildin', disabled: coreDisabled, onChange: () => edit('displayMode', 'buildin') })] })] }), _jsxs("section", { className: css.section, "aria-labelledby": "mnemon-storage-heading", children: [_jsx("div", { className: css.sectionHeading, children: _jsxs("div", { children: [_jsx("h2", { id: "mnemon-storage-heading", children: t('config.storageTitle') }), _jsx("p", { children: t('config.storageDescription') })] }) }), _jsxs("div", { className: css.choiceGrid, role: "radiogroup", "aria-label": t('config.scopeAria'), children: [_jsx(ChoiceCard, { id: "mnemon-storage-global", name: "mnemon-storage", label: t('config.global'), detail: "~/.mnemon", checked: draft.storageScope === 'global', disabled: coreDisabled, onChange: () => edit('storageScope', 'global') }), _jsx(ChoiceCard, { id: "mnemon-storage-workspace", name: "mnemon-storage", label: t('config.workspace'), detail: "<workspace>/.mnemon", checked: draft.storageScope === 'workspace', disabled: coreDisabled, onChange: () => edit('storageScope', 'workspace') }), _jsx(ChoiceCard, { id: "mnemon-storage-custom", name: "mnemon-storage", label: t('config.custom'), detail: draft.dataDir === '' ? t('config.customHintShort') : t('config.customSelected'), checked: draft.storageScope === 'custom', disabled: coreDisabled, onChange: () => edit('storageScope', 'custom') })] }), draft.storageScope === 'custom' && _jsxs("div", { className: css.settingRow, children: [_jsxs("div", { className: css.settingCopy, children: [_jsx("strong", { children: t('config.customDirectory') }), _jsx("small", { children: t('config.customDirectoryHint') })] }), _jsx("div", { className: css.directoryControl, children: _jsx("input", { id: "mnemon-custom-directory", name: "mnemon-custom-directory", type: "text", className: css.directoryInput, "aria-label": t('config.customAria'), "aria-invalid": error !== null, placeholder: t('config.customPlaceholder'), value: draft.dataDir, disabled: coreDisabled, autoComplete: "off", spellCheck: false, autoCapitalize: "none", autoCorrect: "off", onChange: event => edit('dataDir', event.target.value) }) })] })] }), _jsxs("section", { className: css.section, "aria-labelledby": "mnemon-interaction-heading", children: [_jsx("div", { className: css.sectionHeading, children: _jsxs("div", { children: [_jsx("h2", { id: "mnemon-interaction-heading", children: t('config.interactionTitle') }), _jsx("p", { children: t('config.interactionHint') })] }) }), _jsxs("div", { className: css.rowGroup, children: [_jsx(ToggleRow, { id: "mnemon-interaction-turn-bar", label: t('config.interactionTurnBar'), hint: t('config.interactionTurnBarHint'), checked: draft.turnBar, disabled: interactionDisabled, onChange: value => edit('turnBar', value) }), _jsx(ToggleRow, { id: "mnemon-interaction-save-action", label: t('config.interactionSaveAction'), hint: t('config.interactionSaveActionHint'), checked: draft.saveAction, disabled: interactionDisabled, onChange: value => edit('saveAction', value) })] })] }), _jsx(MnemonPackSection, { ...(connection === undefined ? {} : { connection }), refreshKey: targetRevision, t: t }), _jsxs("div", { className: css.feedback, "aria-live": "polite", children: [error !== null && _jsx("p", { className: css.error, role: "alert", children: error }), failed !== null && _jsx("p", { className: css.error, role: "alert", children: t('config.saveFailed', { error: failed }) }), applied && _jsx("p", { className: css.success, role: "status", children: t('config.ready') }), !writable && _jsx("p", { className: css.readOnly, children: t('config.readOnly') })] }), _jsxs("footer", { className: `${css.actions} ${dirty.size > 0 ? css.actionsVisible : ''}`, "aria-live": "polite", children: [_jsx("span", { children: t('config.unsaved') }), _jsxs("div", { children: [_jsx("button", { type: "button", className: css.discard, disabled: saving, onClick: discard, children: t('config.discard') }), _jsx("button", { type: "button", className: css.save, disabled: saving || error !== null || !writable, onClick: () => void save(), children: saving ? t('config.saving') : t('config.save') })] })] }), _jsxs("p", { className: css.settingsNote, children: [t('config.noticeBefore'), " ", _jsx("code", { children: ".dsh/settings.yaml" }), t('config.noticeAfter')] })] }) }));
}
function ChoiceCard(props) {
    return _jsxs("label", { className: css.choiceCard, htmlFor: props.id, children: [_jsx("input", { id: props.id, name: props.name, type: "radio", "aria-label": props.label, checked: props.checked, disabled: props.disabled, onChange: props.onChange }), _jsxs("span", { className: css.choiceFace, children: [_jsx("strong", { children: props.label }), _jsx("small", { children: props.detail }), _jsx("span", { className: css.check, "aria-hidden": "true", children: "\u2713" })] })] });
}
function ToggleRow(props) {
    return _jsxs("label", { className: css.toggleRow, htmlFor: props.id, children: [_jsxs("span", { className: css.settingCopy, children: [_jsx("strong", { children: props.label }), _jsx("small", { children: props.hint })] }), _jsx("input", { id: props.id, type: "checkbox", "aria-label": props.label, checked: props.checked, disabled: props.disabled, onChange: event => props.onChange(event.target.checked) }), _jsx("span", { className: css.switch, "aria-hidden": "true", children: _jsx("i", {}) })] });
}
//# sourceMappingURL=MnemonSettingsCard.js.map