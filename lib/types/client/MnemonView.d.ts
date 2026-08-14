import type { ClientConnectionHandle, ClientSettingsScope } from '../contracts.ts';
import type { Config } from '../config.ts';
import { type MnemonTranslate } from './locales.ts';
import { type MnemonViewSurface } from './MnemonViewAppearance.tsx';
export interface MnemonViewProps {
    connection: ClientConnectionHandle;
    settingsScope: ClientSettingsScope<Config>;
    sessionId?: string;
    workspaceId?: string;
    workspaceSelection?: MnemonWorkspaceSelection;
    surface?: MnemonViewSurface;
    t?: MnemonTranslate;
    locale?: 'zh' | 'en';
}
export interface MnemonWorkspaceSelection {
    options: Array<{
        id: string;
        title: string;
        path: string;
    }>;
    selectedWorkspaceId?: string;
    effectiveWorkspaceId?: string;
    onSelect(workspaceId: string): void;
    onAlign(): void;
}
export declare function MnemonView(props: MnemonViewProps): JSX.Element;
//# sourceMappingURL=MnemonView.d.ts.map