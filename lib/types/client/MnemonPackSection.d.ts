import { type JSX } from 'react';
import type { ClientConnectionHandle } from '../contracts.ts';
import type { MnemonTranslate } from './locales.ts';
interface MnemonPackSectionProps {
    connection?: ClientConnectionHandle;
    configuredScope: string;
    configuredDirectory: string;
    storageDirty: boolean;
    t: MnemonTranslate;
}
export declare function MnemonPackSection({ connection, configuredScope, configuredDirectory, storageDirty, t }: MnemonPackSectionProps): JSX.Element;
export {};
//# sourceMappingURL=MnemonPackSection.d.ts.map