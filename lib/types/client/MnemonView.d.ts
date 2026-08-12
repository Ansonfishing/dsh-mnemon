import type { ClientConnectionHandle, ClientSettingsScope } from '../contracts.ts';
import type { Config } from '../config.ts';
import { type MnemonTranslate } from './locales.ts';
export interface MnemonViewProps {
    connection: ClientConnectionHandle;
    settingsScope: ClientSettingsScope<Config>;
    sessionId?: string;
    t?: MnemonTranslate;
}
export declare function MnemonView(props: MnemonViewProps): JSX.Element;
//# sourceMappingURL=MnemonView.d.ts.map