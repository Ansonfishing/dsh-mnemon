import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
import { MnemonClient } from "./api.js";
import css from './MnemonSettingsCard.module.css';
const PACK_ACCEPT = '.mnemonpack,application/vnd.mnemon.pack+zip,application/zip';
function fileBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(reader.error ?? new Error('Could not read Pack file'));
        reader.onload = () => {
            const value = reader.result;
            if (typeof value !== 'string')
                return reject(new Error('Could not read Pack file'));
            const separator = value.indexOf(',');
            if (separator < 0)
                return reject(new Error('Pack file encoding is invalid'));
            resolve(value.slice(separator + 1));
        };
        reader.readAsDataURL(file);
    });
}
function bytesFromBase64(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1)
        bytes[index] = binary.charCodeAt(index);
    return bytes;
}
function download(result) {
    const bytes = bytesFromBase64(result.base64);
    const buffer = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(buffer).set(bytes);
    const blob = new Blob([buffer], { type: result.mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = result.fileName;
    anchor.hidden = true;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
function formatBytes(bytes) {
    if (bytes < 1024)
        return `${bytes} B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
export function MnemonPackSection({ connection, configuredScope, configuredDirectory, storageDirty, t }) {
    const client = useMemo(() => connection === undefined ? null : new MnemonClient(connection), [connection]);
    const inputs = useRef({});
    const [target, setTarget] = useState(null);
    const [targetFailed, setTargetFailed] = useState(null);
    const [pending, setPending] = useState(null);
    const [busy, setBusy] = useState(null);
    const [failed, setFailed] = useState(null);
    const [notice, setNotice] = useState(null);
    const [confirmReplace, setConfirmReplace] = useState(false);
    useEffect(() => {
        let active = true;
        if (client === null)
            return;
        setTargetFailed(null);
        void client.packTarget().then(value => {
            if (active)
                setTarget(value);
        }).catch(reason => {
            if (active)
                setTargetFailed(reason instanceof Error ? reason.message : String(reason));
        });
        return () => { active = false; };
    }, [client]);
    const scopeLabel = (scope) => scope === 'global' ? t('config.global') : scope === 'workspace' ? t('config.workspace') : t('config.custom');
    const componentLabel = (component) => component === 'runtime'
        ? t('config.packRuntime')
        : component === 'documents' ? t('config.packDocuments') : t('config.packMemorySpaces');
    const absoluteConfiguredDirectory = configuredDirectory.trim().startsWith('/') ? configuredDirectory.trim() : null;
    const restartPending = target !== null && (storageDirty || configuredScope !== target.scope || (configuredScope === 'custom' && absoluteConfiguredDirectory !== null && absoluteConfiguredDirectory !== target.root));
    const unavailable = client === null || targetFailed !== null;
    const scopes = [
        { scope: 'full', glyph: 'PK', title: t('config.packFull'), hint: t('config.packFullHint') },
        { scope: 'runtime', glyph: 'RT', title: t('config.packRuntime'), hint: t('config.packRuntimeHint') },
        { scope: 'documents', glyph: 'DC', title: t('config.packDocuments'), hint: t('config.packDocumentsHint') },
        { scope: 'memory-spaces', glyph: 'DB', title: t('config.packMemorySpaces'), hint: t('config.packMemorySpacesHint') },
    ];
    const exportScope = async (scope) => {
        if (client === null || busy !== null)
            return;
        setBusy(`export:${scope}`);
        setFailed(null);
        setNotice(null);
        try {
            const result = await client.exportPack(scope);
            download(result);
            setNotice(t('config.packExported', { file: result.fileName, size: formatBytes(result.bytes) }));
        }
        catch (reason) {
            setFailed(reason instanceof Error ? reason.message : String(reason));
        }
        finally {
            setBusy(null);
        }
    };
    const inspectFile = async (requestedScope, file) => {
        if (client === null || busy !== null)
            return;
        setBusy(`inspect:${requestedScope}`);
        setFailed(null);
        setNotice(null);
        setPending(null);
        setConfirmReplace(false);
        try {
            const base64 = await fileBase64(file);
            const preview = await client.inspectPack(base64, file.name);
            const components = requestedScope === 'full'
                ? [...preview.manifest.components]
                : preview.manifest.components.includes(requestedScope) ? [requestedScope] : [];
            if (components.length === 0)
                throw new Error(t('config.packComponentMissing'));
            setPending({ requestedScope, base64, preview, components });
        }
        catch (reason) {
            setFailed(reason instanceof Error ? reason.message : String(reason));
        }
        finally {
            setBusy(null);
        }
    };
    const chooseFile = (scope, event) => {
        const file = event.currentTarget.files?.[0];
        event.currentTarget.value = '';
        if (file !== undefined)
            void inspectFile(scope, file);
    };
    const toggleComponent = (component) => {
        setPending(current => {
            if (current === null || current.requestedScope !== 'full')
                return current;
            const components = current.components.includes(component)
                ? current.components.filter(value => value !== component)
                : current.preview.manifest.components.filter(value => value === component || current.components.includes(value));
            return { ...current, components };
        });
        setConfirmReplace(false);
    };
    const importPending = async (mode) => {
        if (client === null || pending === null || pending.components.length === 0 || busy !== null)
            return;
        setBusy(`import:${mode}`);
        setFailed(null);
        setNotice(null);
        try {
            const result = await client.importPack(pending.base64, mode, pending.components);
            setNotice(t('config.packImported', { components: result.components.map(componentLabel).join('、'), root: result.targetRoot }));
            setPending(null);
            setConfirmReplace(false);
        }
        catch (reason) {
            setFailed(reason instanceof Error ? reason.message : String(reason));
        }
        finally {
            setBusy(null);
        }
    };
    return (_jsxs("section", { className: css.section, "aria-labelledby": "mnemon-pack-heading", children: [_jsx("div", { className: css.sectionHeading, children: _jsxs("div", { children: [_jsx("h2", { id: "mnemon-pack-heading", children: t('config.packTitle') }), _jsx("p", { children: t('config.packDescription') })] }) }), _jsxs("div", { className: css.packTarget, "data-pending-restart": restartPending || undefined, children: [_jsx("span", { className: css.packTargetGlyph, "aria-hidden": "true", children: "\u2302" }), _jsxs("div", { children: [_jsx("strong", { children: t('config.packActiveTarget') }), target !== null ? _jsxs(_Fragment, { children: [_jsx("code", { children: target.root }), _jsxs("small", { children: [scopeLabel(target.scope), target.customPackId === undefined ? '' : ` · ${target.customPackId}`] })] }) : _jsx("small", { children: targetFailed === null ? t('config.packTargetLoading') : t('config.packUnavailable') })] }), restartPending && _jsx("em", { children: t('config.packRestartPending') })] }), _jsx("div", { className: css.packGrid, children: scopes.map(item => _jsxs("article", { className: css.packCard, children: [_jsxs("div", { className: css.packCardHeading, children: [_jsx("span", { "aria-hidden": "true", children: item.glyph }), _jsxs("div", { children: [_jsx("strong", { children: item.title }), _jsx("small", { children: item.hint })] })] }), _jsxs("div", { className: css.packCardActions, children: [_jsx("button", { type: "button", disabled: unavailable || busy !== null, onClick: () => void exportScope(item.scope), children: busy === `export:${item.scope}` ? t('config.packExporting') : t('config.packExport') }), _jsx("button", { type: "button", disabled: unavailable || busy !== null, onClick: () => inputs.current[item.scope]?.click(), children: busy === `inspect:${item.scope}` ? t('config.packInspecting') : t('config.packImport') })] }), _jsx("input", { ref: element => { inputs.current[item.scope] = element; }, className: css.visuallyHidden, type: "file", accept: PACK_ACCEPT, "aria-label": t('config.packChooseFile', { component: item.title }), onChange: event => chooseFile(item.scope, event) })] }, item.scope)) }), _jsx("p", { className: css.packFormatHint, children: t('config.packFormatHint') }), pending !== null && _jsxs("section", { className: css.packPreview, "aria-labelledby": "mnemon-pack-preview-heading", children: [_jsxs("header", { children: [_jsxs("div", { children: [_jsx("span", { children: t('config.packPreviewEyebrow') }), _jsx("strong", { id: "mnemon-pack-preview-heading", children: pending.preview.fileName ?? t('config.packUnnamed') })] }), _jsx("button", { type: "button", disabled: busy !== null, "aria-label": t('common.cancel'), onClick: () => { setPending(null); setConfirmReplace(false); }, children: "\u00D7" })] }), _jsxs("dl", { children: [_jsxs("div", { children: [_jsx("dt", { children: t('config.packSource') }), _jsxs("dd", { children: [pending.preview.manifest.source.plugin, " ", pending.preview.manifest.source.pluginVersion, " \u00B7 ", new Date(pending.preview.manifest.exportedAt).toLocaleString()] })] }), _jsxs("div", { children: [_jsx("dt", { children: t('config.packDestination') }), _jsx("dd", { children: _jsx("code", { children: pending.preview.targetRoot }) })] }), _jsxs("div", { children: [_jsx("dt", { children: t('config.packArchiveSize') }), _jsxs("dd", { children: [formatBytes(pending.preview.archiveBytes), " / ", formatBytes(pending.preview.expandedBytes)] })] })] }), _jsx("div", { className: css.packComponentChoices, "aria-label": t('config.packComponents'), children: pending.preview.manifest.summary.map(summary => {
                            const selected = pending.components.includes(summary.component);
                            const disabled = pending.requestedScope !== 'full';
                            return _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: selected, disabled: disabled || busy !== null, onChange: () => toggleComponent(summary.component) }), _jsxs("span", { children: [_jsx("strong", { children: componentLabel(summary.component) }), _jsx("small", { children: t('config.packComponentSummary', { items: summary.items, files: summary.files, size: formatBytes(summary.bytes) }) })] }), pending.preview.occupied[summary.component] && _jsx("em", { children: t('config.packHasData') })] }, summary.component);
                        }) }), _jsxs("div", { className: css.packImportActions, children: [_jsxs("div", { children: [_jsx("strong", { children: t('config.packMerge') }), _jsx("small", { children: t('config.packMergeHint') })] }), _jsx("button", { type: "button", className: css.packPrimary, disabled: busy !== null || pending.components.length === 0, onClick: () => void importPending('merge'), children: busy === 'import:merge' ? t('config.packImporting') : t('config.packMergeAction') }), _jsx("button", { type: "button", className: css.packDangerLink, disabled: busy !== null || pending.components.length === 0, onClick: () => setConfirmReplace(true), children: t('config.packReplaceAction') })] }), confirmReplace && _jsxs("div", { className: css.packReplaceConfirm, role: "alert", children: [_jsxs("div", { children: [_jsx("strong", { children: t('config.packReplace') }), _jsx("span", { children: t('config.packReplaceHint') })] }), _jsx("button", { type: "button", disabled: busy !== null, onClick: () => setConfirmReplace(false), children: t('common.cancel') }), _jsx("button", { type: "button", className: css.packDanger, disabled: busy !== null, onClick: () => void importPending('replace'), children: busy === 'import:replace' ? t('config.packImporting') : t('config.packConfirmReplace') })] })] }), _jsxs("div", { className: css.packFeedback, "aria-live": "polite", children: [targetFailed !== null && _jsx("p", { className: css.error, children: t('config.packFailed', { error: targetFailed }) }), failed !== null && _jsx("p", { className: css.error, role: "alert", children: t('config.packFailed', { error: failed }) }), notice !== null && _jsx("p", { className: css.packSuccess, children: notice }), client === null && _jsx("p", { className: css.readOnly, children: t('config.packUnavailable') })] })] }));
}
//# sourceMappingURL=MnemonPackSection.js.map