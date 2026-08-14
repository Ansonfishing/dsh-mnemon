import { MNEMON_SETTINGS_CHANNEL } from "../settings.js";
export class MnemonSettingsScope {
    connection;
    snapshot = { status: 'loading', writable: false, mode: 'host' };
    listeners = new Set();
    tail = Promise.resolve();
    constructor(connection) {
        this.connection = connection;
        void this.load();
    }
    getSnapshot = () => this.snapshot;
    subscribe = (listener) => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    };
    set(field, value) {
        return this.write({ op: 'set', path: [field], value });
    }
    unset(field) {
        return this.write({ op: 'unset', path: [field] });
    }
    /** Set a nested field (e.g. ['conversationInteraction', 'toolviews']). */
    setPath(path, value) {
        return this.write({ op: 'set', path, value });
    }
    /** Unset a nested field, falling back to its schema default. */
    unsetPath(path) {
        return this.write({ op: 'unset', path });
    }
    async load() {
        const response = await this.connection.rpc.call(MNEMON_SETTINGS_CHANNEL, 'get', {});
        if (!response.ok) {
            this.publish({ status: 'unavailable', writable: false, mode: 'host' });
            return;
        }
        this.publish(response.value);
    }
    write(op) {
        const task = this.tail.then(async () => {
            const response = await this.connection.rpc.call(MNEMON_SETTINGS_CHANNEL, 'mutate', {
                ops: [op],
                ...(this.snapshot.revision === undefined ? {} : { expectedRevision: this.snapshot.revision }),
            });
            if (!response.ok)
                throw new Error(response.error.message);
            this.publish(response.value);
        });
        this.tail = task.catch(() => { });
        return task;
    }
    publish(snapshot) {
        this.snapshot = snapshot;
        for (const listener of this.listeners)
            listener();
    }
}
//# sourceMappingURL=settings.js.map