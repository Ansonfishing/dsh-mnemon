import type { Config } from '../config.ts';
import type { ClientSettingsScope } from '../contracts.ts';
import type { MnemonClientContext } from './dsh-compat.ts';
import type { MnemonTranslate } from './locales.ts';
export declare const MNEMON_VIEW_SELECTOR = "[data-dsh-mnemon-view]";
/** Mount the sidebar row and its stateful center-column workspace as one unit. */
export declare function mountMnemonWorkspace(ctx: MnemonClientContext, settings: ClientSettingsScope<Config>, t: MnemonTranslate): () => void;
//# sourceMappingURL=workspace-mount.d.ts.map