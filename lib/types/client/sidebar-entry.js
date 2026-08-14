import css from './MnemonWorkspace.module.css';
export const MNEMON_ENTRY_SELECTOR = '[data-dsh-mnemon-entry]';
const FAMILY_SELECTOR = '[data-dsh-taskboard-entry], [data-dsh-ssh-entry], [data-dsh-mnemon-entry]';
function sidebarRoot() {
    const column = document.querySelector('[data-pane="sidebar"], [class*="sidebarCol"]');
    if (column === null)
        return undefined;
    return column.querySelector('[class*="logoRow"]')?.parentElement
        ?? column.firstElementChild;
}
function newSessionButton(root) {
    const nested = root.querySelector('button[class*="newSession"]');
    if (nested !== null)
        return nested;
    for (const child of root.children) {
        if (child.tagName === 'BUTTON')
            return child;
    }
    return undefined;
}
function createIcon() {
    const namespace = 'http://www.w3.org/2000/svg';
    const icon = document.createElementNS(namespace, 'svg');
    icon.setAttribute('viewBox', '0 0 16 16');
    icon.setAttribute('width', '14');
    icon.setAttribute('height', '14');
    icon.setAttribute('fill', 'none');
    icon.setAttribute('stroke', 'currentColor');
    icon.setAttribute('stroke-width', '1.3');
    icon.setAttribute('stroke-linecap', 'round');
    icon.setAttribute('stroke-linejoin', 'round');
    icon.setAttribute('aria-hidden', 'true');
    const ellipse = document.createElementNS(namespace, 'ellipse');
    ellipse.setAttribute('cx', '8');
    ellipse.setAttribute('cy', '3.5');
    ellipse.setAttribute('rx', '5');
    ellipse.setAttribute('ry', '2');
    const path = document.createElementNS(namespace, 'path');
    path.setAttribute('d', 'M3 3.5v4c0 1.1 2.2 2 5 2s5-.9 5-2v-4M3 7.5v4c0 1.1 2.2 2 5 2s5-.9 5-2v-4');
    icon.append(ellipse, path);
    return icon;
}
function createEntry(controller) {
    const entry = document.createElement('button');
    entry.type = 'button';
    entry.dataset.dshMnemonEntry = '';
    entry.className = css.entry ?? '';
    const icon = document.createElement('span');
    icon.className = css.entryIcon ?? '';
    icon.append(createIcon());
    const label = document.createElement('span');
    label.className = css.entryLabel ?? '';
    entry.append(icon, label);
    entry.addEventListener('click', () => { controller.toggle(); });
    return { entry, label };
}
function placeEntry(root, entry) {
    const button = newSessionButton(root);
    if (button === undefined)
        return false;
    if (entry.parentElement === root)
        return true;
    const row = button.closest('[class*="logoRow"]');
    const base = row !== null && row.parentElement === root ? row : button;
    const family = Array.from(root.children).filter((element) => element instanceof HTMLElement && element.matches(FAMILY_SELECTOR));
    const anchor = family.at(-1)?.nextElementSibling ?? base.nextElementSibling;
    root.insertBefore(entry, anchor);
    return true;
}
/** Mount a self-healing official-style entry under the New Session row. */
export function mountMnemonSidebarEntry(controller, t, subscribeLocale) {
    const { entry, label } = createEntry(controller);
    let root;
    let placed = false;
    const syncLabel = () => {
        const text = t('tab.label');
        if (entry.getAttribute('aria-label') !== text)
            entry.setAttribute('aria-label', text);
        if (entry.title !== text)
            entry.title = text;
        if (label.textContent !== text)
            label.textContent = text;
    };
    const rootObserver = new MutationObserver(() => {
        if (root === undefined || !root.isConnected) {
            placed = false;
            tryPlace();
            return;
        }
        if (!root.contains(entry))
            placed = placeEntry(root, entry);
    });
    const tryPlace = () => {
        syncLabel();
        if (root !== undefined && !root.isConnected) {
            rootObserver.disconnect();
            root = undefined;
            placed = false;
        }
        if (placed && document.body.contains(entry))
            return;
        if (placed) {
            rootObserver.disconnect();
            root = undefined;
            placed = false;
        }
        root ??= sidebarRoot();
        if (root === undefined)
            return;
        placed = placeEntry(root, entry);
        if (placed)
            rootObserver.observe(root, { childList: true, subtree: true });
    };
    const waitObserver = new MutationObserver(tryPlace);
    waitObserver.observe(document.body, { childList: true, subtree: true });
    const syncActive = () => {
        if (controller.getSnapshot().open)
            entry.dataset.active = 'true';
        else
            delete entry.dataset.active;
    };
    const unsubscribe = controller.subscribe(syncActive);
    const unsubscribeLocale = subscribeLocale?.(syncLabel) ?? (() => { });
    syncActive();
    tryPlace();
    return () => {
        waitObserver.disconnect();
        rootObserver.disconnect();
        unsubscribe();
        unsubscribeLocale();
        entry.remove();
    };
}
//# sourceMappingURL=sidebar-entry.js.map