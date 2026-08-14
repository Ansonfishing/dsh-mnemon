import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { memo, useEffect, useRef, useState } from 'react';
import { Button, IconDataOutline16, Modal, Tooltip } from '@deepseek-ai/dsh-client-ui-primitives';
import { MnemonClient } from "./api.js";
import css from './MnemonSaveAction.module.css';
const PREVIEW_LIMIT = 8000;
/** Save-to-memory action on finalized assistant messages, routed through the supervised writeback gate. */
export const MnemonSaveAction = memo(function MnemonSaveAction({ messageId, sessionId, connection, t }) {
    const [open, setOpen] = useState(false);
    const [writeEnabled, setWriteEnabled] = useState(undefined);
    const [candidate, setCandidate] = useState(undefined);
    const [truncated, setTruncated] = useState(false);
    const [missing, setMissing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [outcome, setOutcome] = useState(null);
    const [failure, setFailure] = useState(null);
    const textareaRef = useRef(null);
    const openRef = useRef(false);
    const requestVersionRef = useRef(0);
    const submitActiveRef = useRef(false);
    const setPanelOpen = (next) => {
        requestVersionRef.current += 1;
        openRef.current = next;
        setOpen(next);
    };
    useEffect(() => {
        if (!open) {
            setWriteEnabled(undefined);
            setCandidate(undefined);
            setTruncated(false);
            setMissing(false);
            setSubmitting(submitActiveRef.current);
            setOutcome(null);
            setFailure(null);
            return;
        }
        const requestVersion = ++requestVersionRef.current;
        let alive = true;
        setSubmitting(submitActiveRef.current);
        const client = new MnemonClient(connection, sessionId);
        client.status()
            .then(status => { if (alive && requestVersionRef.current === requestVersion)
            setWriteEnabled(status.writeEnabled); })
            .catch(() => { if (alive && requestVersionRef.current === requestVersion)
            setWriteEnabled(false); });
        client.assistantMessageText(messageId)
            .then(result => {
            if (!alive || requestVersionRef.current !== requestVersion)
                return;
            if (result === null || result.text === '')
                setMissing(true);
            else {
                setTruncated(result.text.length > PREVIEW_LIMIT);
                setCandidate(result.text.slice(0, PREVIEW_LIMIT));
            }
        })
            .catch(() => { if (alive && requestVersionRef.current === requestVersion)
            setMissing(true); });
        return () => { alive = false; };
    }, [open, connection, sessionId, messageId]);
    const submit = () => {
        const content = textareaRef.current?.value.trim() ?? '';
        if (content === '' || writeEnabled !== true || submitActiveRef.current)
            return;
        const requestVersion = requestVersionRef.current;
        submitActiveRef.current = true;
        setSubmitting(true);
        setFailure(null);
        setOutcome(null);
        const client = new MnemonClient(connection, sessionId);
        client.supervise(content, messageId)
            .then(result => {
            if (!openRef.current || requestVersionRef.current !== requestVersion)
                return;
            setOutcome({ summary: result.summary, action: result.action });
            setCandidate(content);
        })
            .catch(reason => {
            if (openRef.current && requestVersionRef.current === requestVersion)
                setFailure(reason instanceof Error ? reason.message : String(reason));
        })
            .finally(() => {
            submitActiveRef.current = false;
            if (openRef.current)
                setSubmitting(false);
        });
    };
    return (_jsxs("div", { className: css.wrap, children: [_jsx(Tooltip, { label: t('saveAction.tooltip'), side: "bottom", disabled: open, children: _jsx("button", { type: "button", className: css.button, "aria-label": t('saveAction.button'), "aria-haspopup": "dialog", "aria-expanded": open, onClick: () => setPanelOpen(!openRef.current), children: _jsx(IconDataOutline16, { size: 16, className: css.icon }) }) }), _jsxs(Modal, { open: open, onClose: () => setPanelOpen(false), title: t('saveAction.title'), closeLabel: t('saveAction.close'), description: t('saveAction.hint'), className: css.modal, contentClassName: css.modalContent, footer: (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "outline", className: css.modalAction, disabled: submitting, onClick: () => setPanelOpen(false), children: t('common.cancel') }), _jsx(Button, { variant: "primary", className: css.modalAction, disabled: candidate === undefined || submitting || writeEnabled !== true, onClick: submit, children: submitting ? t('saveAction.submitting') : t('saveAction.submit') })] })), children: [writeEnabled === false && _jsx("div", { className: css.readOnly, role: "status", children: t('saveAction.readOnly') }), candidate === undefined && !missing && _jsx("div", { className: css.status, children: t('saveAction.fetching') }), missing && _jsx("div", { className: css.status, role: "status", children: t('saveAction.missing') }), candidate !== undefined && (_jsxs("label", { className: css.candidate, children: [_jsx("span", { children: t('saveAction.candidate') }), _jsx("textarea", { ref: textareaRef, rows: 12, defaultValue: candidate, autoFocus: true }), truncated && _jsx("small", { className: css.truncated, children: t('saveAction.truncated', { limit: PREVIEW_LIMIT }) })] })), outcome !== null && _jsx("div", { className: css.outcome, role: "status", children: t('saveAction.result', { summary: outcome.summary }) }), failure !== null && _jsx("div", { className: css.failure, role: "alert", children: t('saveAction.failed', { error: failure }) })] })] }));
});
//# sourceMappingURL=MnemonSaveAction.js.map