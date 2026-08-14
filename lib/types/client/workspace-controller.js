/** Small framework-neutral state holder shared by the sidebar row and panel. */
export class MnemonWorkspaceController {
    snapshot = { open: false };
    listeners = new Set();
    getSnapshot = () => this.snapshot;
    subscribe = (listener) => {
        this.listeners.add(listener);
        return () => { this.listeners.delete(listener); };
    };
    open() { this.setOpen(true); }
    close() { this.setOpen(false); }
    toggle() { this.setOpen(!this.snapshot.open); }
    setOpen(open) {
        if (this.snapshot.open === open)
            return;
        this.snapshot = { open };
        for (const listener of this.listeners)
            listener();
    }
}
//# sourceMappingURL=workspace-controller.js.map