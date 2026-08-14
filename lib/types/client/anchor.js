/**
 * Lightweight anchor channel between conversation-scoped Mnemon surfaces
 * (toolviews, turnTail bar, assistant actions) and the Mnemon workspace view.
 *
 * A dispatch asks the Mnemon view to open a page (optionally with a seed) in
 * the session the dispatch came from. The view may not be mounted when the
 * user clicks — the dispatch is then held per session and consumed the next
 * time that session's Mnemon view mounts, so switching to the Memory System
 * tab afterwards still lands on the requested page.
 */
export const MNEMON_ANCHOR_EVENT = 'mnemon:anchor';
const pendingBySession = new Map();
function keyOf(sessionId) {
    return sessionId === undefined || sessionId === '' ? '*' : sessionId;
}
/** Ask the Mnemon view to open a page; held until a matching view consumes it. */
export function dispatchMnemonAnchor(anchor) {
    pendingBySession.set(keyOf(anchor.sessionId), anchor);
    window.dispatchEvent(new CustomEvent(MNEMON_ANCHOR_EVENT, { detail: anchor }));
}
/** Take the anchor held for this session (usually at mount time), or null. */
export function consumeMnemonAnchor(sessionId) {
    const key = keyOf(sessionId);
    const anchor = pendingBySession.get(key);
    if (anchor === undefined)
        return null;
    pendingBySession.delete(key);
    return anchor;
}
/** Subscribe to anchors addressed to this session; returns an unsubscribe. */
export function subscribeMnemonAnchor(sessionId, onAnchor) {
    const key = keyOf(sessionId);
    const handler = (event) => {
        const anchor = event.detail;
        if (anchor !== undefined && keyOf(anchor.sessionId) === key)
            onAnchor(anchor);
    };
    window.addEventListener(MNEMON_ANCHOR_EVENT, handler);
    return () => window.removeEventListener(MNEMON_ANCHOR_EVENT, handler);
}
//# sourceMappingURL=anchor.js.map