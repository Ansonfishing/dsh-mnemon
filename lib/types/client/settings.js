import { MNEMON_SETTINGS_CHANNEL, MNEMON_SETTINGS_NAMESPACE } from "../settings.js";
export class MnemonSettingsScope {
    connection;
    namespace;
    snapshot = { status: 'loading', writable: false, mode: 'host' };
    listeners = new Set();
    tail = Promise.resolve();
    constructor(connection, namespace = MNEMON_SETTINGS_NAMESPACE) {
        this.connection = connection;
        this.namespace = namespace;
        void this.load();
    }
    getSnapshot = () => this.snapshot;
    subscribe = (listener) => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    };
    set(field, value) {
        return this.mutate([{ op: 'set', path: [field], value }]);
    }
    unset(field) {
        return this.mutate([{ op: 'unset', path: [field] }]);
    }
    /** Set a nested field. */
    setPath(path, value) {
        return this.mutate([{ op: 'set', path, value }]);
    }
    /** Unset a nested field, falling back to its schema default. */
    unsetPath(path) {
        return this.mutate([{ op: 'unset', path }]);
    }
    mutate(ops) {
        return this.write(ops);
    }
    async load() {
        try {
            const response = await this.connection.rpc.call(MNEMON_SETTINGS_CHANNEL, 'get', { namespace: this.namespace });
            if (!response.ok) {
                this.publish({ status: 'unavailable', writable: false, mode: 'host' });
                return;
            }
            this.publish(response.value);
        }
        catch {
            this.publish({ status: 'unavailable', writable: false, mode: 'host' });
        }
    }
    write(ops) {
        const task = this.tail.then(async () => {
            const response = await this.connection.rpc.call(MNEMON_SETTINGS_CHANNEL, 'mutate', {
                namespace: this.namespace,
                ops,
                ...(this.snapshot.revision === undefined ? {} : { expectedRevision: this.snapshot.revision }),
            });
            if (!response.ok) {
                await this.load();
                throw new Error(response.error.message);
            }
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