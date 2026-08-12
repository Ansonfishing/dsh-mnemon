import type { ClientConnectionHandle, ClientSettingsScope } from '../contracts.ts';
import type { Config } from '../config.ts';
export interface MnemonViewProps {
    connection: ClientConnectionHandle;
    settingsScope: ClientSettingsScope<Config>;
    sessionId?: string;
}
export declare function MnemonView({ connection, sessionId }: MnemonViewProps): JSX.Element;
//# sourceMappingURL=MnemonView.d.ts.map