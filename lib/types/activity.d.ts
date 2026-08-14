import type { HostSessionEvent } from './contracts.ts';
/** Settled per-turn Mnemon activity shown below a completed DSH turn. */
export interface TurnMemoryActivity {
    turn: number;
    /** Successful and failed settled Mnemon calls. Running calls are excluded. */
    count: number;
    names: string[];
    recalls: number;
    writes: number;
    documentSearches: number;
    inspections: number;
    failures: number;
}
export interface TurnMemoryActivitySnapshot {
    /** Last durable event represented by this snapshot. */
    cursor: number;
    activities: TurnMemoryActivity[];
}
/**
 * Incremental durable-log projection. Repeated UI reads process only events
 * appended since the previous snapshot instead of rescanning the full session.
 */
export declare class TurnActivityProjection {
    private eventCount;
    private lastEventSeq;
    private readonly pending;
    private readonly byTurn;
    reset(): void;
    snapshot(events: readonly HostSessionEvent[]): TurnMemoryActivitySnapshot;
    private consume;
}
//# sourceMappingURL=activity.d.ts.map