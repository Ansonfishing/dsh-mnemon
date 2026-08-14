import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
const REGISTRY_VERSION = 1;
const ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/;
function requiredText(value, label, max) {
    const normalized = value.trim();
    if (normalized === '')
        throw new Error(`${label} is required`);
    if (normalized.length > max)
        throw new Error(`${label} is too long (max ${max} characters)`);
    return normalized;
}
function optionalText(value, label, max) {
    const normalized = value?.trim() ?? '';
    if (normalized.length > max)
        throw new Error(`${label} is too long (max ${max} characters)`);
    return normalized;
}
export function validateMemoryBodyId(value) {
    const normalized = value.trim();
    if (!ID_PATTERN.test(normalized))
        throw new Error('memoryBodyId must match [a-zA-Z0-9][a-zA-Z0-9_-]*');
    return normalized;
}
/**
 * Persistent metadata layered over Mnemon's native named stores.
 *
 * The registry lives beside the store directories, while each body keeps using
 * Mnemon's stable `<dataDir>/data/<id>/mnemon.db` layout.
 */
export class MemoryBodyRegistry {
    runner;
    persistent;
    now;
    directory;
    registryPath;
    bodies = [];
    constructor(runner, persistent = runner.commandFound, now = () => new Date()) {
        this.runner = runner;
        this.persistent = persistent;
        this.now = now;
        this.directory = join(runner.effectiveDataDir(), 'data');
        this.registryPath = join(this.directory, '.dsh-memory-bodies.json');
        this.loadAndReconcile();
    }
    list() {
        this.reconcileDiscoveredStores();
        return this.bodies.map(body => this.view(body));
    }
    active() {
        return this.list().filter(body => body.active);
    }
    get(id) {
        const normalized = validateMemoryBodyId(id);
        const body = this.list().find(entry => entry.id === normalized);
        if (body === undefined)
            throw new Error(`unknown memory body: ${normalized}`);
        return body;
    }
    async create(request, signal) {
        const name = requiredText(request.name, 'name', 100);
        const description = requiredText(request.description, 'description', 1000);
        let id = validateMemoryBodyId(randomUUID());
        while (this.list().some(body => body.id === id))
            id = validateMemoryBodyId(randomUUID());
        await this.runner.runText(['store', 'create', id], { ...(signal === undefined ? {} : { signal }), store: id });
        const timestamp = this.now().toISOString();
        const body = {
            id,
            name,
            description,
            active: request.active ?? false,
            createdAt: timestamp,
            updatedAt: timestamp,
        };
        this.bodies.push(body);
        this.save();
        return this.view(body);
    }
    update(id, request) {
        const normalized = validateMemoryBodyId(id);
        const index = this.bodies.findIndex(body => body.id === normalized);
        if (index < 0)
            throw new Error(`unknown memory body: ${normalized}`);
        const current = this.bodies[index];
        const body = {
            ...current,
            ...(request.name === undefined ? {} : { name: requiredText(request.name, 'name', 100) }),
            ...(request.description === undefined ? {} : { description: optionalText(request.description, 'description', 1000) }),
            ...(request.active === undefined ? {} : { active: request.active }),
            updatedAt: this.now().toISOString(),
        };
        this.bodies[index] = body;
        this.save();
        return this.view(body);
    }
    async remove(id, signal) {
        const body = this.get(id);
        await this.runner.runText(['store', 'remove', body.id], { ...(signal === undefined ? {} : { signal }), store: body.id });
        this.bodies = this.bodies.filter(entry => entry.id !== body.id);
        this.save();
        return body;
    }
    setActive(id, active) {
        return this.update(id, { active });
    }
    /** Refresh metadata after an atomic Pack import replaced the data component. */
    reload() {
        this.bodies = [];
        this.loadAndReconcile();
    }
    loadAndReconcile() {
        let migratedSyntheticDefault = false;
        if (this.persistent && existsSync(this.registryPath)) {
            try {
                const parsed = JSON.parse(readFileSync(this.registryPath, 'utf8'));
                if (parsed.version === REGISTRY_VERSION && Array.isArray(parsed.bodies)) {
                    this.bodies = parsed.bodies.filter(body => ID_PATTERN.test(body.id)).map(body => {
                        // Earlier dsh-mnemon builds gave an already-existing upstream
                        // `default` Store a synthetic Chinese product name. That made a
                        // compatibility import look like a newly-created default Memory
                        // Space. Preserve the Store and its activation state, but restore
                        // its neutral on-disk identity.
                        const syntheticDefault = body.id === 'default'
                            && body.name === '默认记忆体'
                            && body.description === '从现有 Mnemon Store 自动接入。';
                        migratedSyntheticDefault ||= syntheticDefault;
                        return {
                            id: body.id,
                            name: requiredText(syntheticDefault ? body.id : body.name || body.id, 'name', 100),
                            description: optionalText(syntheticDefault ? 'Existing Mnemon Store discovered on disk.' : body.description, 'description', 1000),
                            active: body.active === true,
                            createdAt: body.createdAt,
                            updatedAt: body.updatedAt,
                        };
                    });
                }
            }
            catch {
                // Rebuild a valid catalog from native stores without touching their DBs.
                this.bodies = [];
            }
        }
        this.reconcileDiscoveredStores();
        if (migratedSyntheticDefault)
            this.save();
    }
    reconcileDiscoveredStores() {
        if (!this.persistent || !existsSync(this.directory))
            return;
        const timestamp = this.now().toISOString();
        const legacyActive = this.runner.effectiveStore();
        let changed = false;
        for (const entry of readdirSync(this.directory, { withFileTypes: true })) {
            if (!entry.isDirectory() || !ID_PATTERN.test(entry.name) || !existsSync(join(this.directory, entry.name, 'mnemon.db')))
                continue;
            if (this.bodies.some(body => body.id === entry.name))
                continue;
            this.bodies.push({
                id: entry.name,
                name: entry.name,
                description: 'Existing Mnemon Store discovered on disk.',
                active: this.bodies.length === 0 || entry.name === legacyActive,
                createdAt: timestamp,
                updatedAt: timestamp,
            });
            changed = true;
        }
        if (changed)
            this.save();
    }
    view(body) {
        return { ...body, dbPath: join(this.directory, body.id, 'mnemon.db') };
    }
    save() {
        if (!this.persistent)
            return;
        mkdirSync(this.directory, { recursive: true });
        const file = { version: REGISTRY_VERSION, bodies: this.bodies };
        const temporary = join(this.directory, `.${basename(this.registryPath)}.${process.pid}.tmp`);
        writeFileSync(temporary, `${JSON.stringify(file, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
        renameSync(temporary, this.registryPath);
    }
}
//# sourceMappingURL=memory-bodies.js.map