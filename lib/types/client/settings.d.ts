import type { ClientConnectionHandle, ClientSettingsScope, ClientSettingsSnapshot } from '../contracts.ts';
import type { Config } from '../config.ts';
export declare class MnemonSettingsScope implements ClientSettingsScope<Config> {
    private readonly connection;
    private snapshot;
    private readonly listeners;
    private tail;
    constructor(connection: ClientConnectionHandle);
    getSnapshot: () => ClientSettingsSnapshot<Config>;
    subscribe: (listener: () => void) => (() => void);
    set(field: string, value: unknown): Promise<void>;
    unset(field: string): Promise<void>;
    /** Set a nested field (e.g. ['conversationInteraction', 'toolviews']). */
    setPath(path: string[], value: unknown): Promise<void>;
    /** Unset a nested field, falling back to its schema default. */
    unsetPath(path: string[]): Promise<void>;
    private load;
    private write;
    private publish;
}
//# sourceMappingURL=settings.d.ts.map