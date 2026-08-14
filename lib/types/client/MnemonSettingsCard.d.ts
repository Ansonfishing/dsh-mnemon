import { type JSX } from 'react';
import type { Config, InteractionConfig } from '../config.ts';
import type { ClientSettingsScope } from '../contracts.ts';
import { type MnemonTranslate } from './locales.ts';
export interface MnemonSettingsCardProps {
    scope: ClientSettingsScope<Config>;
    /** Separate live namespace; falls back to the core scope for older hosts. */
    interactionScope?: ClientSettingsScope<InteractionConfig>;
    t?: MnemonTranslate;
}
/** Dedicated Mnemon page contributed directly to DSH's settings navigation. */
export declare function MnemonSettingsCard({ scope, interactionScope: suppliedInteractionScope, t }: MnemonSettingsCardProps): JSX.Element | null;
//# sourceMappingURL=MnemonSettingsCard.d.ts.map