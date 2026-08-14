import { type JSX } from 'react';
import type { Config, InteractionConfig } from '../config.ts';
import type { ClientConnectionHandle, ClientSettingsScope } from '../contracts.ts';
import { type MnemonTranslate } from './locales.ts';
export interface MnemonSettingsCardProps {
    scope: ClientSettingsScope<Config>;
    /** Separate live namespace; falls back to the core scope for older hosts. */
    interactionScope?: ClientSettingsScope<InteractionConfig>;
    /** Loopback RPC used for whole-directory ZIP backup and restore. */
    connection?: ClientConnectionHandle;
    /** DSH's native host directory chooser. */
    pickDirectory?: () => Promise<string | null>;
    t?: MnemonTranslate;
}
/** Dedicated Mnemon page contributed directly to DSH's settings navigation. */
export declare function MnemonSettingsCard({ scope, interactionScope: suppliedInteractionScope, connection, pickDirectory, t }: MnemonSettingsCardProps): JSX.Element | null;
//# sourceMappingURL=MnemonSettingsCard.d.ts.map