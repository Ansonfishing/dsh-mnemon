import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react';
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
    const wrapRef = useRef(null);
    const buttonRef = useRef(null);
    const panelRef = useRef(null);
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
    useEffect(() => {
        if (!open)
            return;
        const closeOnEscape = (event) => {
            if (event.key === 'Escape')
                setPanelOpen(false);
        };
        const closeOutside = (event) => {
            if (event.target instanceof Node && !wrapRef.current?.contains(event.target))
                setPanelOpen(false);
        };
        document.addEventListener('keydown', closeOnEscape);
        document.addEventListener('pointerdown', closeOutside);
        return () => {
            document.removeEventListener('keydown', closeOnEscape);
            document.removeEventListener('pointerdown', closeOutside);
        };
    }, [open]);
    useLayoutEffect(() => {
        if (!open)
            return;
        const panel = panelRef.current;
        const button = buttonRef.current;
        if (panel === null || button === null || typeof panel.showPopover !== 'function')
            return;
        const reposition = () => {
            const anchor = button.getBoundingClientRect();
            const padding = 16;
            const width = Math.min(340, Math.max(240, window.innerWidth - padding * 2));
            panel.style.setProperty('--mn-save-panel-width', `${width}px`);
            const left = Math.min(Math.max(padding, anchor.right - width), Math.max(padding, window.innerWidth - width - padding));
            panel.style.setProperty('--mn-save-panel-left', `${left}px`);
            const below = anchor.bottom + 4;
            const above = anchor.top - panel.getBoundingClientRect().height - 4;
            const top = below + panel.getBoundingClientRect().height <= window.innerHeight - padding || above < padding ? below : above;
            panel.style.setProperty('--mn-save-panel-top', `${Math.max(padding, top)}px`);
        };
        panel.setAttribute('popover', 'manual');
        panel.showPopover();
        reposition();
        window.addEventListener('resize', reposition);
        document.addEventListener('scroll', reposition, true);
        return () => {
            window.removeEventListener('resize', reposition);
            document.removeEventListener('scroll', reposition, true);
            if (panel.matches(':popover-open'))
                panel.hidePopover();
        };
    }, [open]);
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
    return (_jsxs("div", { ref: wrapRef, className: css.wrap, children: [_jsxs("button", { ref: buttonRef, type: "button", className: css.button, "aria-expanded": open, title: t('saveAction.button'), onClick: () => setPanelOpen(!openRef.current), children: [_jsx("span", { className: css.glyph, "aria-hidden": "true", children: "\u25C8" }), _jsx("span", { className: css.label, children: t('saveAction.button') })] }), open && (_jsxs("div", { ref: panelRef, className: css.panel, role: "dialog", "aria-label": t('saveAction.title'), children: [_jsxs("header", { className: css.panelHeader, children: [_jsx("strong", { children: t('saveAction.title') }), _jsx("button", { type: "button", className: css.close, "aria-label": t('saveAction.close'), onClick: () => setPanelOpen(false), children: "\u00D7" })] }), _jsx("p", { className: css.hint, children: t('saveAction.hint') }), writeEnabled === false && _jsx("div", { className: css.readOnly, role: "status", children: t('saveAction.readOnly') }), candidate === undefined && !missing && _jsx("div", { className: css.status, children: t('saveAction.fetching') }), missing && _jsx("div", { className: css.status, role: "status", children: t('saveAction.missing') }), candidate !== undefined && (_jsxs("label", { className: css.candidate, children: [_jsx("span", { children: t('saveAction.candidate') }), _jsx("textarea", { ref: textareaRef, rows: 5, defaultValue: candidate }), truncated && _jsx("small", { className: css.truncated, children: t('saveAction.truncated', { limit: PREVIEW_LIMIT }) })] })), outcome !== null && _jsx("div", { className: css.outcome, role: "status", children: t('saveAction.result', { summary: outcome.summary }) }), failure !== null && _jsx("div", { className: css.failure, role: "alert", children: t('saveAction.failed', { error: failure }) }), candidate !== undefined && (_jsx("button", { type: "button", className: css.submit, disabled: submitting || writeEnabled !== true, onClick: submit, children: submitting ? t('saveAction.submitting') : t('saveAction.submit') }))] }))] }));
});
//# sourceMappingURL=MnemonSaveAction.js.map