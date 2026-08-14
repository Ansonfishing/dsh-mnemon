import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo, useEffect, useRef, useState } from 'react';
import { MnemonClient } from "./api.js";
import css from './MnemonSaveAction.module.css';
const PREVIEW_LIMIT = 8000;
/** Save-to-memory action on finalized assistant messages, routed through the supervised writeback gate. */
export const MnemonSaveAction = memo(function MnemonSaveAction({ messageId, sessionId, connection, t }) {
    const [open, setOpen] = useState(false);
    const [writeEnabled, setWriteEnabled] = useState(undefined);
    const [candidate, setCandidate] = useState(undefined);
    const [missing, setMissing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [outcome, setOutcome] = useState(null);
    const [failure, setFailure] = useState(null);
    const textareaRef = useRef(null);
    useEffect(() => {
        if (!open) {
            setWriteEnabled(undefined);
            setCandidate(undefined);
            setMissing(false);
            setSubmitting(false);
            setOutcome(null);
            setFailure(null);
            return;
        }
        let alive = true;
        const client = new MnemonClient(connection, sessionId);
        client.status()
            .then(status => { if (alive)
            setWriteEnabled(status.writeEnabled); })
            .catch(() => { if (alive)
            setWriteEnabled(false); });
        client.assistantMessageText(messageId)
            .then(result => {
            if (!alive)
                return;
            if (result === null || result.text === '')
                setMissing(true);
            else
                setCandidate(result.text.slice(0, PREVIEW_LIMIT));
        })
            .catch(() => { if (alive)
            setMissing(true); });
        return () => { alive = false; };
    }, [open, connection, sessionId, messageId]);
    const submit = () => {
        const content = textareaRef.current?.value.trim() ?? '';
        if (content === '' || submitting)
            return;
        setSubmitting(true);
        setFailure(null);
        setOutcome(null);
        const client = new MnemonClient(connection, sessionId);
        client.supervise(content)
            .then(result => {
            setOutcome({ summary: result.summary, action: result.action });
            setCandidate(content);
        })
            .catch(reason => { setFailure(reason instanceof Error ? reason.message : String(reason)); })
            .finally(() => setSubmitting(false));
    };
    return (_jsxs("div", { className: css.wrap, children: [_jsxs("button", { type: "button", className: css.button, "aria-expanded": open, title: t('saveAction.button'), onClick: () => setOpen(value => !value), children: [_jsx("span", { className: css.glyph, "aria-hidden": "true", children: "\u25C8" }), _jsx("span", { className: css.label, children: t('saveAction.button') })] }), open && (_jsxs("div", { className: css.panel, role: "dialog", "aria-label": t('saveAction.title'), children: [_jsxs("header", { className: css.panelHeader, children: [_jsx("strong", { children: t('saveAction.title') }), _jsx("button", { type: "button", className: css.close, "aria-label": t('saveAction.close'), onClick: () => setOpen(false), children: "\u00D7" })] }), _jsx("p", { className: css.hint, children: t('saveAction.hint') }), writeEnabled === false && _jsx("div", { className: css.readOnly, role: "status", children: t('saveAction.readOnly') }), candidate === undefined && !missing && _jsx("div", { className: css.status, children: t('saveAction.fetching') }), missing && _jsx("div", { className: css.status, role: "status", children: t('saveAction.missing') }), candidate !== undefined && (_jsxs("label", { className: css.candidate, children: [_jsx("span", { children: t('saveAction.candidate') }), _jsx("textarea", { ref: textareaRef, rows: 5, defaultValue: candidate })] })), outcome !== null && _jsx("div", { className: css.outcome, role: "status", children: t('saveAction.result', { summary: outcome.summary }) }), failure !== null && _jsx("div", { className: css.failure, role: "alert", children: t('saveAction.failed', { error: failure }) }), candidate !== undefined && (_jsx("button", { type: "button", className: css.submit, disabled: submitting || writeEnabled === false, onClick: submit, children: submitting ? t('saveAction.submitting') : t('saveAction.submit') }))] }))] }));
});
//# sourceMappingURL=MnemonSaveAction.js.map