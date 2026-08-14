import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import css from './MnemonSettingsCard.module.css';
import { translateZh } from "./locales.js";
import { MnemonPackSection } from "./MnemonPackSection.js";
const CORE_FIELDS = ['storageScope', 'dataDir', 'customPackId', 'customPacks'];
const INTERACTION_FIELDS = ['toolviews', 'turnBar', 'saveAction'];
function record(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value) ? value : {};
}
function coreDraft(value) {
    const resolved = value ?? {};
    const customPacks = (resolved.customPacks ?? []).filter(pack => pack.id?.trim() && pack.name?.trim() && pack.dataDir?.trim()).map(pack => ({
        id: pack.id.trim(), name: pack.name.trim(), dataDir: pack.dataDir.trim(),
    }));
    const legacyDirectory = resolved.dataDir?.trim() ?? '';
    if (legacyDirectory !== '' && !customPacks.some(pack => pack.dataDir === legacyDirectory)) {
        let id = 'legacy';
        let suffix = 2;
        while (customPacks.some(pack => pack.id === id))
            id = `legacy-${suffix++}`;
        customPacks.push({ id, name: 'Custom Pack', dataDir: legacyDirectory });
    }
    const selected = customPacks.find(pack => pack.id === resolved.customPackId)
        ?? customPacks.find(pack => pack.dataDir === legacyDirectory)
        ?? (customPacks.length === 1 ? customPacks[0] : undefined);
    return {
        storageScope: resolved.storageScope ?? (legacyDirectory ? 'custom' : 'global'),
        dataDir: selected?.dataDir ?? legacyDirectory,
        customPackId: selected?.id ?? '',
        customPacks,
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
    if (draft.customPackId === '' || !draft.customPacks.some(pack => pack.id === draft.customPackId))
        return t('config.customPackRequired');
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
    const [reset, setReset] = useState(() => new Set());
    const [saving, setSaving] = useState(false);
    const [failed, setFailed] = useState(null);
    const [addingPack, setAddingPack] = useState(false);
    const [newPackName, setNewPackName] = useState('');
    const [newPackDirectory, setNewPackDirectory] = useState('');
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
    const stageCore = (next, fields) => {
        setDraft(current => ({ ...current, ...next }));
        setDirty(current => {
            const result = new Set(current);
            for (const field of fields)
                result.add(field);
            return result;
        });
        setReset(current => {
            const result = new Set(current);
            for (const field of fields)
                result.delete(field);
            return result;
        });
        setFailed(null);
    };
    const chooseScope = (storageScope) => {
        if (storageScope !== 'custom' || draft.customPackId !== '')
            return edit('storageScope', storageScope);
        let id = 'custom';
        let suffix = 2;
        while (draft.customPacks.some(pack => pack.id === id))
            id = `custom-${suffix++}`;
        const customPacks = [...draft.customPacks, { id, name: t('config.customDefaultName'), dataDir: '' }];
        stageCore({ storageScope, customPackId: id, customPacks }, ['storageScope', 'customPackId', 'customPacks']);
    };
    const chooseCustomPack = (customPackId) => {
        const pack = draft.customPacks.find(candidate => candidate.id === customPackId);
        if (pack === undefined)
            return;
        stageCore({ customPackId, dataDir: pack.dataDir }, ['customPackId', 'dataDir']);
    };
    const editCustomDirectory = (dataDir) => {
        const customPacks = draft.customPacks.map(pack => pack.id === draft.customPackId ? { ...pack, dataDir } : pack);
        stageCore({ dataDir, customPacks }, ['dataDir', 'customPacks']);
    };
    const addCustomPack = () => {
        const name = newPackName.trim();
        const dataDir = newPackDirectory.trim();
        if (name === '' || dataDir === '')
            return;
        const id = `pack-${globalThis.crypto.randomUUID()}`;
        const customPacks = [...draft.customPacks, { id, name, dataDir }];
        stageCore({ storageScope: 'custom', customPackId: id, dataDir, customPacks }, ['storageScope', 'customPackId', 'dataDir', 'customPacks']);
        setAddingPack(false);
        setNewPackName('');
        setNewPackDirectory('');
    };
    const removeCustomPack = () => {
        const customPacks = draft.customPacks.filter(pack => pack.id !== draft.customPackId);
        const selected = customPacks[0];
        stageCore({
            customPacks,
            customPackId: selected?.id ?? '',
            dataDir: selected?.dataDir ?? '',
        }, ['customPacks', 'customPackId', 'dataDir']);
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
            const coreOrder = draft.storageScope === 'custom' ? ['customPacks', 'customPackId', 'dataDir', 'storageScope'] : CORE_FIELDS;
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
    return (_jsx("section", { className: css.page, "aria-label": t('config.aria'), "aria-busy": saving || loading, children: loading ? _jsx("p", { className: css.loading, role: "status", children: t('common.loading') }) : _jsxs(_Fragment, { children: [_jsxs("section", { className: css.section, "aria-labelledby": "mnemon-storage-heading", children: [_jsxs("div", { className: css.sectionHeading, children: [_jsxs("div", { children: [_jsx("h2", { id: "mnemon-storage-heading", children: t('config.storageTitle') }), _jsxs("p", { children: [t('config.storageDescription'), " ", t('config.restart')] })] }), storageOverridden && _jsx("button", { className: css.reset, type: "button", disabled: coreDisabled, onClick: () => resetFields(CORE_FIELDS), children: t('config.reset') })] }), _jsxs("div", { className: css.choiceGrid, role: "radiogroup", "aria-label": t('config.scopeAria'), children: [_jsx(ChoiceCard, { id: "mnemon-storage-global", name: "mnemon-storage", label: t('config.global'), detail: "~/.mnemon", checked: draft.storageScope === 'global', disabled: coreDisabled, onChange: () => chooseScope('global') }), _jsx(ChoiceCard, { id: "mnemon-storage-workspace", name: "mnemon-storage", label: t('config.workspace'), detail: "<workspace>/.mnemon", checked: draft.storageScope === 'workspace', disabled: coreDisabled, onChange: () => chooseScope('workspace') }), _jsx(ChoiceCard, { id: "mnemon-storage-custom", name: "mnemon-storage", label: t('config.custom'), detail: draft.customPacks.find(pack => pack.id === draft.customPackId)?.name || t('config.customHintShort'), checked: draft.storageScope === 'custom', disabled: coreDisabled, onChange: () => chooseScope('custom') })] }), draft.storageScope === 'custom' && _jsxs("div", { className: css.customField, children: [_jsxs("div", { className: css.fieldHeading, children: [_jsx("label", { htmlFor: "mnemon-custom-pack", children: t('config.customPack') }), _jsxs("span", { className: css.inlineActions, children: [_jsx("button", { className: css.reset, type: "button", disabled: coreDisabled, onClick: () => setAddingPack(value => !value), children: addingPack ? t('config.cancelAddPack') : t('config.addPack') }), draft.customPacks.length > 0 && _jsx("button", { className: css.reset, type: "button", disabled: coreDisabled, onClick: removeCustomPack, children: t('config.removePack') })] })] }), _jsxs("select", { id: "mnemon-custom-pack", "aria-label": t('config.customPackAria'), value: draft.customPackId, onChange: event => chooseCustomPack(event.target.value), disabled: coreDisabled || draft.customPacks.length === 0, children: [draft.customPacks.length === 0 && _jsx("option", { value: "", children: t('config.noCustomPacks') }), draft.customPacks.map(pack => _jsx("option", { value: pack.id, children: pack.name }, pack.id))] }), _jsxs("div", { className: css.fieldHeading, children: [_jsx("label", { htmlFor: "mnemon-custom-directory", children: t('config.customDirectory') }), overridden('dataDir') && _jsx("button", { className: css.reset, type: "button", disabled: coreDisabled, onClick: () => resetField('dataDir'), children: t('config.reset') })] }), _jsx("input", { id: "mnemon-custom-directory", "aria-label": t('config.customAria'), "aria-describedby": `mnemon-custom-directory-hint${errorId === undefined ? '' : ` ${errorId}`}`, "aria-invalid": error !== null, value: draft.dataDir, onChange: event => editCustomDirectory(event.target.value), placeholder: "~/mnemon-data", spellCheck: false, autoComplete: "off", disabled: coreDisabled || draft.customPackId === '' }), _jsx("p", { id: "mnemon-custom-directory-hint", children: t('config.customHint') }), addingPack && _jsxs("div", { className: css.addPackFields, children: [_jsx("input", { "aria-label": t('config.customPackNameAria'), value: newPackName, onChange: event => setNewPackName(event.target.value), placeholder: t('config.customPackNamePlaceholder'), maxLength: 100, disabled: coreDisabled }), _jsx("input", { "aria-label": t('config.newPackDirectoryAria'), value: newPackDirectory, onChange: event => setNewPackDirectory(event.target.value), placeholder: "~/mnemon-packs/project", spellCheck: false, autoComplete: "off", disabled: coreDisabled }), _jsx("button", { type: "button", className: css.compactButton, disabled: coreDisabled || newPackName.trim() === '' || newPackDirectory.trim() === '', onClick: addCustomPack, children: t('config.confirmAddPack') })] })] })] }), _jsxs("section", { className: css.section, "aria-labelledby": "mnemon-interaction-heading", children: [_jsxs("div", { className: css.sectionHeading, children: [_jsxs("div", { children: [_jsx("h2", { id: "mnemon-interaction-heading", children: t('config.interactionTitle') }), _jsx("p", { children: t('config.interactionHint') })] }), interactionOverridden && _jsx("button", { className: css.reset, type: "button", disabled: interactionDisabled, onClick: () => resetFields(INTERACTION_FIELDS), children: t('config.reset') })] }), _jsxs("div", { className: css.choiceGrid, children: [_jsx(ToggleCard, { id: "mnemon-interaction-toolviews", label: t('config.interactionToolviews'), hint: t('config.interactionToolviewsHint'), checked: draft.toolviews, disabled: interactionDisabled, onChange: value => edit('toolviews', value) }), _jsx(ToggleCard, { id: "mnemon-interaction-turn-bar", label: t('config.interactionTurnBar'), hint: t('config.interactionTurnBarHint'), checked: draft.turnBar, disabled: interactionDisabled, onChange: value => edit('turnBar', value) }), _jsx(ToggleCard, { id: "mnemon-interaction-save-action", label: t('config.interactionSaveAction'), hint: t('config.interactionSaveActionHint'), checked: draft.saveAction, disabled: interactionDisabled, onChange: value => edit('saveAction', value) })] })] }), _jsx(MnemonPackSection, { ...(connection === undefined ? {} : { connection }), configuredScope: draft.storageScope, configuredDirectory: draft.dataDir, storageDirty: CORE_FIELDS.some(field => dirty.has(field)), t: t }), _jsxs("div", { className: css.feedback, "aria-live": "polite", children: [error !== null && _jsx("p", { id: "mnemon-settings-validation", className: css.error, role: "alert", children: error }), failed !== null && _jsx("p", { className: css.error, role: "alert", children: t('config.saveFailed', { error: failed }) }), !writable && _jsx("p", { className: css.readOnly, children: t('config.readOnly') })] }), _jsxs("footer", { className: `${css.actions} ${dirty.size > 0 ? css.actionsVisible : ''}`, "aria-live": "polite", children: [_jsx("span", { children: t('config.unsaved') }), _jsxs("div", { children: [_jsx("button", { type: "button", className: css.discard, disabled: dirty.size === 0 || saving, onClick: discard, children: t('config.discard') }), _jsx("button", { type: "button", className: css.save, disabled: dirty.size === 0 || saving || error !== null || !writable, onClick: () => void save(), children: saving ? t('config.saving') : t('config.save') })] })] }), _jsxs("p", { className: css.settingsNote, children: [t('config.noticeBefore'), " ", _jsx("code", { children: ".dsh/settings.yaml" }), t('config.noticeAfter')] })] }) }));
}
function ChoiceCard(props) {
    return (_jsxs("label", { className: css.choiceCard, htmlFor: props.id, children: [_jsx("input", { id: props.id, name: props.name, type: "radio", "aria-label": props.label, checked: props.checked, disabled: props.disabled, onChange: props.onChange }), _jsxs("span", { className: css.choiceFace, children: [_jsx("strong", { children: props.label }), _jsx("small", { children: props.detail }), _jsx("span", { className: css.check, "aria-hidden": "true", children: "\u2713" })] })] }));
}
function ToggleCard(props) {
    return (_jsxs("label", { className: css.choiceCard, htmlFor: props.id, children: [_jsx("input", { id: props.id, type: "checkbox", "aria-label": props.label, checked: props.checked, disabled: props.disabled, onChange: event => props.onChange(event.target.checked) }), _jsxs("span", { className: css.choiceFace, children: [_jsx("strong", { children: props.label }), _jsx("small", { children: props.hint }), _jsx("span", { className: css.check, "aria-hidden": "true", children: "\u2713" })] })] }));
}
//# sourceMappingURL=MnemonSettingsCard.js.map