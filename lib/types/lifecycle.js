import { MnemonSubagentCoordinator } from "./subagent.js";
import { scoreReviewActivity } from "./review-activity.js";
export const MNEMON_PLUGIN_SOURCE = 'dsh-mnemon';
function createPluginMessage(text, form, summary) {
    return structuredClone({
        id: crypto.randomUUID(),
        role: 'user',
        content: [{ type: 'text', text }],
        source: {
            kind: 'plugin',
            plugin: MNEMON_PLUGIN_SOURCE,
            form,
            ...(summary === undefined ? {} : { summary }),
        },
    });
}
function sourceOf(message) {
    return message.source;
}
function eventTurn(event) {
    return typeof event.data.turn === 'number' ? event.data.turn : undefined;
}
function memoryToolCalls(events, turn) {
    return events.filter(event => event.type === 'tool/call'
        && (turn === undefined || eventTurn(event) === turn)
        && typeof event.data.name === 'string'
        && event.data.name.startsWith('mnemon_')).length;
}
function textLength(messages) {
    return messages
        .filter(message => message.source.kind === 'user')
        .map(message => message.content.map(block => block.text).join('\n').trim().length)
        .reduce((total, length) => total + length, 0);
}
function completedToolActivity(events, turn) {
    const count = events.filter(event => event.type === 'tool/result' && eventTurn(event) === turn).length;
    const names = new Set(events
        .filter(event => event.type === 'tool/call' && eventTurn(event) === turn && typeof event.data.name === 'string')
        .map(event => String(event.data.name)));
    return { count, names };
}
function guidedReminder(config) {
    if (config.recallMode === 'guided' && config.writebackMode === 'guided')
        return '[MNEMON] Search active Documents for substantial project knowledge before deep recall; call mnemon_recall only when durable history or an exact prior detail matters, and use mnemon_runtime_memory only for new explicit reusable facts. Otherwise call none.';
    if (config.recallMode === 'guided')
        return '[MNEMON] Search active Documents for substantial project knowledge before deep recall; call mnemon_recall only when durable history or an exact prior detail matters. Otherwise call neither.';
    if (config.writebackMode === 'guided')
        return '[MNEMON] Use mnemon_runtime_memory only for new, explicit, reusable information; otherwise continue without writing memory.';
    return undefined;
}
class MnemonAgentLifecycle {
    agent;
    coordinator;
    config;
    counters;
    primePending = true;
    startSource;
    guidedTurns = new Set();
    turnActivity = new Map();
    idleReviewTimer;
    reviewController;
    reviewRunning = false;
    lastReviewAt;
    lastReviewAction;
    lastReviewScore;
    lastReviewDocumentIds;
    lastPhase = 'idle';
    lastAt;
    lastError;
    constructor(agent, coordinator, config, counters, source) {
        this.agent = agent;
        this.coordinator = coordinator;
        this.config = config;
        this.counters = counters;
        this.startSource = source;
    }
    start() {
        const disposers = [
            this.agent.ctx.on('agent/session-start', ((payload) => {
                this.cancelIdleReview(true);
                this.turnActivity.clear();
                this.startSource = payload.source;
                this.primePending = true;
                this.mark('prime');
            })),
            this.agent.ctx.on('agent/pre-step', ((payload, next) => this.preStep(payload, next))),
            this.agent.ctx.on('agent/turn-stopping', ((payload) => { this.scheduleIdleReview(payload.turn); })),
        ];
        return () => {
            this.cancelIdleReview(true);
            for (const dispose of disposers.reverse())
                dispose();
        };
    }
    snapshot() {
        return {
            sessionId: this.agent.id,
            status: this.agent.status,
            startSource: this.startSource,
            primePending: this.primePending,
            guidedTurns: this.guidedTurns.size,
            memoryToolCalls: memoryToolCalls(this.agent.session.events),
            idleReviewPending: this.idleReviewTimer !== undefined,
            reviewRunning: this.reviewRunning,
            reviewActivity: this.reviewActivity(),
            lastPhase: this.lastPhase,
            ...(this.lastReviewAt === undefined ? {} : { lastReviewAt: this.lastReviewAt }),
            ...(this.lastReviewAction === undefined ? {} : { lastReviewAction: this.lastReviewAction }),
            ...(this.lastReviewScore === undefined ? {} : { lastReviewScore: this.lastReviewScore }),
            ...(this.lastReviewDocumentIds === undefined ? {} : { lastReviewDocumentIds: [...this.lastReviewDocumentIds] }),
            ...(this.lastAt === undefined ? {} : { lastAt: this.lastAt }),
            ...(this.lastError === undefined ? {} : { lastError: this.lastError }),
        };
    }
    markSupervised() {
        this.counters.supervisedRequests += 1;
        this.mark('supervised');
    }
    async preStep(payload, next) {
        if (payload.step === 1)
            this.cancelIdleReview(true);
        const decision = await next();
        if (decision.kind === 'reject' || payload.signal.aborted || !this.config.lifecycleEnabled)
            return decision;
        if (this.config.writeEnabled && this.config.writebackMode === 'guided') {
            this.recordTurnMessages(payload.turn, decision.messages);
        }
        if (payload.step !== 1)
            return decision;
        const ownRequest = decision.messages.some(message => {
            const source = sourceOf(message);
            return source.kind === 'plugin' && source.plugin === MNEMON_PLUGIN_SOURCE;
        });
        if (ownRequest) {
            return decision;
        }
        if (decision.messages.length === 0)
            return decision;
        if (this.primePending) {
            this.primePending = false;
            this.counters.primes += 1;
            this.mark('prime');
        }
        const reminder = guidedReminder(this.config);
        if (reminder === undefined)
            return decision;
        this.guidedTurns.add(payload.turn);
        if (this.config.recallMode === 'guided')
            this.counters.recallCues += 1;
        if (this.config.writebackMode === 'guided' && this.config.writeEnabled)
            this.counters.writebackCues += 1;
        this.mark(this.config.recallMode === 'guided' ? 'recall' : 'writeback');
        return { kind: 'enter', messages: [...decision.messages, createPluginMessage(reminder, 'instructions', 'Optional memory recall and remember reminder')] };
    }
    scheduleIdleReview(turn) {
        if (!this.config.lifecycleEnabled || !this.config.writeEnabled || this.config.writebackMode !== 'guided')
            return;
        this.cancelIdleReview(true);
        const activity = this.ensureTurnActivity(turn);
        const tools = completedToolActivity(this.agent.session.events, turn);
        activity.toolCallCount = tools.count;
        activity.toolNames = tools.names;
        if (!this.reviewActivity().eligible)
            return;
        this.idleReviewTimer = setTimeout(() => {
            this.idleReviewTimer = undefined;
            if (this.agent.status !== 'idle')
                return;
            const completed = this.agent.session.events.some(event => event.type === 'turn/end' && eventTurn(event) === turn);
            if (!completed || !this.reviewActivity().eligible)
                return;
            void this.runIdleReview();
        }, this.config.idleReviewMs);
    }
    async runIdleReview() {
        const controller = new AbortController();
        const triggeredScore = this.reviewActivity().score;
        this.reviewRunning = true;
        this.reviewController = controller;
        this.mark('review');
        try {
            const result = await this.coordinator.review(this.agent, controller.signal);
            if (controller.signal.aborted)
                return;
            this.lastReviewAt = new Date().toISOString();
            this.lastReviewAction = result.action;
            this.lastReviewScore = triggeredScore;
            this.lastReviewDocumentIds = result.documentIds;
            this.turnActivity.clear();
            this.mark('review');
        }
        catch (error) {
            if (!controller.signal.aborted)
                this.fail(error);
        }
        finally {
            if (this.reviewController === controller) {
                this.reviewRunning = false;
                this.reviewController = undefined;
            }
        }
    }
    cancelIdleReview(abortRunning) {
        if (this.idleReviewTimer !== undefined)
            clearTimeout(this.idleReviewTimer);
        this.idleReviewTimer = undefined;
        if (abortRunning)
            this.reviewController?.abort();
    }
    ensureTurnActivity(turn) {
        let activity = this.turnActivity.get(turn);
        if (activity === undefined) {
            activity = { messageIds: new Set(), userTextLength: 0, toolCallCount: 0, toolNames: new Set() };
            this.turnActivity.set(turn, activity);
        }
        return activity;
    }
    recordTurnMessages(turn, messages) {
        const activity = this.ensureTurnActivity(turn);
        for (const message of messages) {
            if (message.source.kind !== 'user' || activity.messageIds.has(message.id))
                continue;
            activity.messageIds.add(message.id);
            activity.userTextLength += textLength([message]);
        }
    }
    reviewActivity() {
        const toolNames = new Set();
        let totalUserTextLength = 0;
        let toolCallCount = 0;
        for (const activity of this.turnActivity.values()) {
            totalUserTextLength += activity.userTextLength;
            toolCallCount += activity.toolCallCount;
            for (const name of activity.toolNames)
                toolNames.add(name);
        }
        return scoreReviewActivity({
            totalUserTextLength,
            turnCount: this.turnActivity.size,
            toolCallCount,
            uniqueToolCount: toolNames.size,
        });
    }
    mark(phase) {
        this.lastPhase = phase;
        this.lastAt = new Date().toISOString();
        this.lastError = undefined;
    }
    fail(error) {
        this.counters.failures += 1;
        this.lastPhase = 'error';
        this.lastAt = new Date().toISOString();
        this.lastError = error instanceof Error ? error.message : String(error);
    }
}
/** DSH-native owner for per-agent Mnemon lifecycle hooks and UI-triggered LLM work. */
export class MnemonLifecycle {
    ctx;
    coordinator;
    config;
    owners = new Map();
    counters = { primes: 0, recallCues: 0, writebackCues: 0, supervisedRequests: 0, failures: 0 };
    constructor(ctx, coordinator, config) {
        this.ctx = ctx;
        this.coordinator = coordinator;
        this.config = config;
    }
    start() {
        const stopCreated = this.ctx.on('agent/created', (({ agent }) => { this.install(agent, 'startup'); }));
        for (const agent of this.ctx.agents.roots())
            this.install(agent, 'adopted');
        return () => {
            stopCreated();
            for (const owner of [...this.owners.values()].reverse())
                owner.dispose();
            this.owners.clear();
        };
    }
    snapshot(sessionId) {
        const agent = sessionId === undefined ? undefined : this.ctx.agents.get(sessionId);
        const owner = agent === undefined ? undefined : this.owners.get(agent)?.lifecycle;
        return {
            enabled: this.config.lifecycleEnabled,
            recallMode: this.config.recallMode,
            writebackMode: this.config.writebackMode,
            idleReviewMs: this.config.idleReviewMs,
            activeAgents: this.owners.size,
            sessionAvailable: agent !== undefined,
            counters: { ...this.counters },
            subagents: this.coordinator.snapshot(),
            ...(owner === undefined ? {} : { current: owner.snapshot() }),
        };
    }
    recall(sessionId, request, signal = new AbortController().signal) {
        return this.coordinator.recall(this.liveAgent(sessionId), request, signal);
    }
    related(sessionId, id, memoryBodyId, signal = new AbortController().signal) {
        return this.coordinator.related(this.liveAgent(sessionId), id, memoryBodyId, signal);
    }
    answer(sessionId, query, evidence, signal = new AbortController().signal) {
        return this.coordinator.answer(this.liveAgent(sessionId), query, evidence, signal);
    }
    remember(sessionId, request, signal = new AbortController().signal) {
        return this.coordinator.remember(this.liveAgent(sessionId), request, signal);
    }
    runtime(sessionId, request, signal = new AbortController().signal) {
        return this.coordinator.runtime(this.liveAgent(sessionId), request, signal);
    }
    documents(sessionId) {
        return this.coordinator.documentsSnapshot(this.liveAgent(sessionId));
    }
    document(sessionId, id) {
        return this.coordinator.documentGet(this.liveAgent(sessionId), id);
    }
    searchDocuments(sessionId, query, includeArchived = false, limit) {
        return this.coordinator.documentSearch(this.liveAgent(sessionId), query, includeArchived, limit);
    }
    mutateDocument(sessionId, request, signal = new AbortController().signal) {
        return this.coordinator.document(this.liveAgent(sessionId), request, signal);
    }
    archiveDocument(sessionId, id, signal = new AbortController().signal) {
        return this.coordinator.archiveDocument(this.liveAgent(sessionId), id, signal);
    }
    mutate(sessionId, operation, request, signal = new AbortController().signal) {
        return this.coordinator.write(this.liveAgent(sessionId), operation, request, signal);
    }
    async supervise(sessionId, content, signal = new AbortController().signal) {
        if (!this.config.writeEnabled)
            throw new Error('dsh-mnemon is configured read-only (writeEnabled: false)');
        const normalizedSessionId = sessionId.trim();
        const normalizedContent = content.trim();
        if (normalizedSessionId === '')
            throw new Error('current DSH session is unavailable');
        if (normalizedContent === '')
            throw new Error('memory candidate is required');
        if (normalizedContent.length > 8000)
            throw new Error('memory candidate is too long (max 8000 characters)');
        const agent = this.liveAgent(normalizedSessionId);
        const owner = this.owners.get(agent)?.lifecycle;
        if (owner === undefined)
            this.counters.supervisedRequests += 1;
        else
            owner.markSupervised();
        const result = await this.coordinator.write(agent, 'supervised-writeback', {
            content: normalizedContent,
            source: 'explicit Mnemon tab submission',
        }, signal);
        return { ...result, sessionId: normalizedSessionId };
    }
    liveAgent(sessionId) {
        const normalized = sessionId.trim();
        if (normalized === '')
            throw new Error('current DSH session is unavailable');
        const agent = this.ctx.agents.get(normalized);
        if (agent === undefined)
            throw new Error('current DSH agent is not live; reopen or resume the conversation and try again');
        return agent;
    }
    install(agent, source) {
        if (this.owners.has(agent) || !this.ctx.agents.roots().includes(agent))
            return;
        const lifecycle = new MnemonAgentLifecycle(agent, this.coordinator, this.config, this.counters, source);
        let dispose;
        dispose = agent.ctx.effect(() => {
            const stop = lifecycle.start();
            return () => {
                stop();
                if (this.owners.get(agent)?.dispose === dispose)
                    this.owners.delete(agent);
            };
        }, 'dsh-mnemon.lifecycle()');
        this.owners.set(agent, { lifecycle, dispose });
    }
}
//# sourceMappingURL=lifecycle.js.map