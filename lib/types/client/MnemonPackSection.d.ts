import { type JSX } from 'react';
import type { ClientConnectionHandle } from '../contracts.ts';
import type { MnemonTranslate } from './locales.ts';
interface MnemonPackSectionProps {
    connection?: ClientConnectionHandle;
    refreshKey: number;
    t: MnemonTranslate;
}
export declare function MnemonPackSection({ connection, refreshKey, t }: MnemonPackSectionProps): JSX.Element;
export {};
//# sourceMappingURL=MnemonPackSection.d.ts.map