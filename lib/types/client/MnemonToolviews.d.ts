import type { MnemonKey } from './locales.ts';
export interface MnemonToolViewProps {
    callId: string;
    toolName: string;
    /** RunningToolCall while live, ToolResultNode once settled; both are opaque wire slices. */
    block: unknown;
    openFile?: (path: string) => void;
    cwd?: string;
    inspect: () => void;
    /** Session the call belongs to; injected by the slot host. */
    sessionId?: string;
    t: (key: MnemonKey, params?: Record<string, unknown>) => string;
}
/** Render one mnemon_* tool call as a memory-flavoured row with expandable evidence. */
export declare const MnemonToolView: import("react").NamedExoticComponent<MnemonToolViewProps>;
/** Tool name → toolview component, registered as keyed `tool.call.toolview` entries. */
export declare const MNEMON_TOOLVIEW_NAMES: readonly string[];
//# sourceMappingURL=MnemonToolviews.d.ts.map