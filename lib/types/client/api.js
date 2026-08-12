import { MNEMON_READ_CHANNEL, MNEMON_WRITE_CHANNEL } from "../rpc.js";
export class MnemonClient {
    connection;
    constructor(connection) {
        this.connection = connection;
    }
    async call(channel, endpoint, payload) {
        const response = await this.connection.rpc.call(channel, endpoint, payload);
        if (!response.ok)
            throw new Error(response.error.message);
        return response.value;
    }
    status() {
        return this.call(MNEMON_READ_CHANNEL, 'status', {});
    }
    graph() {
        return this.call(MNEMON_READ_CHANNEL, 'graph', {});
    }
    list(request = {}) {
        return this.call(MNEMON_READ_CHANNEL, 'list', request);
    }
    entities(entity, limit) {
        return this.call(MNEMON_READ_CHANNEL, 'entities', {
            ...(entity === undefined ? {} : { entity }),
            ...(limit === undefined ? {} : { limit }),
        });
    }
    search(request) {
        return this.call(MNEMON_READ_CHANNEL, 'search', request);
    }
    related(id) {
        return this.call(MNEMON_READ_CHANNEL, 'related', { id, depth: 2 });
    }
    remember(request) {
        return this.call(MNEMON_WRITE_CHANNEL, 'remember', request);
    }
    forget(id) {
        return this.call(MNEMON_WRITE_CHANNEL, 'forget', { id });
    }
}
//# sourceMappingURL=api.js.map