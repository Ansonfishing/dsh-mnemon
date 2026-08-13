/**
 * QoderWork 0.9.12's deterministic post-turn review gate.
 *
 * The upstream implementation scores user text length rather than provider
 * token usage, which keeps the gate stable when an adapter omits usage data.
 */
export declare const QODERWORK_REVIEW_POLICY: Readonly<{
    reviewThreshold: 5;
    textLengthScoreUnit: 50;
    textLengthScoreCap: 3;
    toolCountScoreUnit: 5;
    toolCountScoreCap: 2;
    toolDiversityThreshold: 3;
    toolDiversityScoreCap: 2;
    turnScore: 1;
}>;
export interface ReviewActivity {
    totalUserTextLength: number;
    turnCount: number;
    toolCallCount: number;
    uniqueToolCount: number;
}
export interface ReviewActivityScore extends ReviewActivity {
    textLengthScore: number;
    turnScore: number;
    toolCallScore: number;
    toolDiversityScore: number;
    score: number;
    threshold: number;
    eligible: boolean;
}
export declare function scoreReviewActivity(activity: ReviewActivity): ReviewActivityScore;
//# sourceMappingURL=review-activity.d.ts.map