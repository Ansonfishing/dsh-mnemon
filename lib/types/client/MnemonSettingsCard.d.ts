import type { Config } from '../config.ts';
import type { ClientSettingsScope } from '../contracts.ts';
import { type MnemonTranslate } from './locales.ts';
export interface MnemonSettingsCardProps {
    scope: ClientSettingsScope<Config>;
    t?: MnemonTranslate;
}
export declare function MnemonSettingsCard({ scope, t }: MnemonSettingsCardProps): JSX.Element | null;
//# sourceMappingURL=MnemonSettingsCard.d.ts.map