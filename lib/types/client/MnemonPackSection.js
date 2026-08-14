import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
import { MnemonClient } from "./api.js";
import css from './MnemonSettingsCard.module.css';
const ZIP_ACCEPT = '.zip,application/zip';
function fileBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(reader.error ?? new Error('Could not read ZIP file'));
        reader.onload = () => {
            const value = reader.result;
            if (typeof value !== 'string')
                return reject(new Error('Could not read ZIP file'));
            const separator = value.indexOf(',');
            if (separator < 0)
                return reject(new Error('ZIP file encoding is invalid'));
            resolve(value.slice(separator + 1));
        };
        reader.readAsDataURL(file);
    });
}
function bytesFromBase64(base64) {
    const binary = atob(base64);
    const buffer = new ArrayBuffer(binary.length);
    const bytes = new Uint8Array(buffer);
    for (let index = 0; index < binary.length; index += 1)
        bytes[index] = binary.charCodeAt(index);
    return buffer;
}
function download(result) {
    const blob = new Blob([bytesFromBase64(result.base64)], { type: result.mimeType });
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
export function MnemonPackSection({ connection, refreshKey, t }) {
    const client = useMemo(() => connection === undefined ? null : new MnemonClient(connection), [connection]);
    const input = useRef(null);
    const [target, setTarget] = useState(null);
    const [pending, setPending] = useState(null);
    const [busy, setBusy] = useState(client === null ? null : 'target');
    const [failed, setFailed] = useState(null);
    const [notice, setNotice] = useState(null);
    useEffect(() => {
        let active = true;
        if (client === null)
            return;
        setBusy('target');
        setFailed(null);
        void client.packTarget().then(value => { if (active)
            setTarget(value); }).catch(reason => {
            if (active)
                setFailed(reason instanceof Error ? reason.message : String(reason));
        }).finally(() => { if (active)
            setBusy(null); });
        return () => { active = false; };
    }, [client, refreshKey]);
    const scopeLabel = (scope) => scope === 'global' ? t('config.global') : scope === 'workspace' ? t('config.workspace') : t('config.custom');
    const exportZip = async () => {
        if (client === null || busy !== null)
            return;
        setBusy('export');
        setFailed(null);
        setNotice(null);
        try {
            const result = await client.exportPack();
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
    const inspectZip = async (file) => {
        if (client === null || busy !== null)
            return;
        setBusy('inspect');
        setFailed(null);
        setNotice(null);
        setPending(null);
        try {
            const base64 = await fileBase64(file);
            const preview = await client.inspectPack(base64, file.name);
            setPending({ base64, preview });
        }
        catch (reason) {
            setFailed(reason instanceof Error ? reason.message : String(reason));
        }
        finally {
            setBusy(null);
        }
    };
    const chooseFile = (event) => {
        const file = event.currentTarget.files?.[0];
        event.currentTarget.value = '';
        if (file !== undefined)
            void inspectZip(file);
    };
    const importZip = async () => {
        if (client === null || pending === null || busy !== null)
            return;
        setBusy('import');
        setFailed(null);
        setNotice(null);
        try {
            const result = await client.importPack(pending.base64);
            setNotice(t('config.packImportedWhole', { root: result.targetRoot }));
            setPending(null);
        }
        catch (reason) {
            setFailed(reason instanceof Error ? reason.message : String(reason));
        }
        finally {
            setBusy(null);
        }
    };
    const items = pending?.preview.manifest.summary.reduce((sum, component) => sum + component.items, 0) ?? 0;
    return _jsxs("section", { className: css.section, "aria-labelledby": "mnemon-pack-heading", children: [_jsx("div", { className: css.sectionHeading, children: _jsxs("div", { children: [_jsx("h2", { id: "mnemon-pack-heading", children: t('config.packTitle') }), _jsx("p", { children: t('config.packSimpleDescription') })] }) }), _jsxs("div", { className: css.settingRow, children: [_jsxs("div", { className: css.settingCopy, children: [_jsx("strong", { children: t('config.packWholeZip') }), _jsx("small", { children: t('config.packWholeZipHint') }), _jsx("code", { className: css.activePath, title: target?.root, children: target?.root ?? t('config.packTargetLoading') }), target !== null && _jsx("em", { className: css.scopeMeta, children: scopeLabel(target.scope) })] }), _jsxs("div", { className: css.rowActions, children: [_jsx("button", { type: "button", className: css.pillButton, disabled: client === null || busy !== null, onClick: () => input.current?.click(), children: busy === 'inspect' ? t('config.packInspecting') : t('config.packImportZip') }), _jsx("button", { type: "button", className: css.pillButton, disabled: client === null || busy !== null || target === null, onClick: () => void exportZip(), children: busy === 'export' ? t('config.packExporting') : t('config.packExportZip') })] }), _jsx("input", { ref: input, className: css.visuallyHidden, type: "file", accept: ZIP_ACCEPT, "aria-label": t('config.packChooseZip'), onChange: chooseFile })] }), pending !== null && _jsxs("div", { className: css.importBar, role: "status", children: [_jsxs("div", { children: [_jsx("strong", { children: pending.preview.fileName ?? t('config.packUnnamedZip') }), _jsx("small", { children: t('config.packZipReady', { components: pending.preview.manifest.components.length, items, size: formatBytes(pending.preview.archiveBytes) }) })] }), _jsx("button", { type: "button", className: css.textButton, disabled: busy !== null, onClick: () => setPending(null), children: t('common.cancel') }), _jsx("button", { type: "button", className: css.primaryPill, disabled: busy !== null, onClick: () => void importZip(), children: busy === 'import' ? t('config.packImporting') : t('config.packImportZipAction') })] }), _jsxs("div", { className: css.packFeedback, "aria-live": "polite", children: [failed !== null && _jsx("p", { className: css.error, role: "alert", children: t('config.packFailed', { error: failed }) }), notice !== null && _jsx("p", { className: css.packSuccess, children: notice }), client === null && _jsx("p", { className: css.readOnly, children: t('config.packUnavailable') })] })] });
}
//# sourceMappingURL=MnemonPackSection.js.map