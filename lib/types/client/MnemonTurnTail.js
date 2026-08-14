import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo, useEffect, useState } from 'react';
import { MnemonClient } from "./api.js";
import { dispatchMnemonAnchor } from "./anchor.js";
import css from './MnemonTurnTail.module.css';
function turnNumber(turn) {
    const value = turn?.turn;
    return typeof value === 'number' ? value : undefined;
}
/** Whether this entry renders for the owner; chain selectors decline quietly. */
export function selectMnemonTurnTail(owner) {
    const turn = owner.turn;
    return turn.status === 'closed' ? {} : null;
}
/** One-line memory-activity bar under a completed turn; hides when the turn touched no memory. */
export const MnemonTurnTail = memo(function MnemonTurnTail({ turn, seq, sessionId, connection, t }) {
    const [activity, setActivity] = useState(undefined);
    const [open, setOpen] = useState(false);
    const number = turnNumber(turn);
    useEffect(() => {
        if (number === undefined) {
            setActivity(null);
            return;
        }
        let alive = true;
        const client = new MnemonClient(connection, sessionId);
        client.turnActivity(number, seq)
            .then(result => { if (alive)
            setActivity(result); })
            .catch(() => { if (alive)
            setActivity(null); });
        return () => { alive = false; };
    }, [connection, sessionId, number, seq]);
    if (activity === undefined || activity === null)
        return null;
    if (number === undefined)
        return null;
    const openView = (event) => {
        event.stopPropagation();
        dispatchMnemonAnchor({ page: 'status', ...(sessionId === undefined ? {} : { sessionId }) });
    };
    return (_jsxs("div", { className: css.root, "data-open": open || undefined, children: [_jsxs("button", { type: "button", className: css.bar, "aria-expanded": open, onClick: () => setOpen(value => !value), children: [_jsx("span", { className: css.mark, "aria-hidden": "true", children: "\u25C8" }), _jsx("span", { className: css.label, children: t('turnTail.label') }), _jsxs("span", { className: css.metrics, children: [activity.recalls > 0 && _jsx("span", { children: t('turnTail.recall', { count: activity.recalls }) }), activity.writes > 0 && _jsx("span", { children: t('turnTail.write', { count: activity.writes }) }), activity.documentSearches > 0 && _jsx("span", { children: t('turnTail.documents', { count: activity.documentSearches }) }), activity.inspections > 0 && _jsx("span", { children: t('turnTail.inspect', { count: activity.inspections }) }), activity.failures > 0 && _jsx("span", { className: css.failureMetric, children: t('turnTail.failed', { count: activity.failures }) })] }), _jsx("span", { className: `${css.chevron} ${open ? css.chevronOpen : ''}`, "aria-hidden": "true" })] }), open && (_jsxs("div", { className: css.details, children: [_jsx("span", { className: css.detailLabel, children: t('turnTail.toolList') }), _jsx("div", { className: css.tools, children: activity.names.map((name, index) => _jsx("code", { className: css.toolChip, children: name }, `${name}-${index}`)) }), _jsx("button", { type: "button", className: css.viewButton, onClick: openView, children: t('turnTail.openView') })] }))] }));
});
//# sourceMappingURL=MnemonTurnTail.js.map