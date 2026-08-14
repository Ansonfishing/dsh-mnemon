import { MNEMON_SETTINGS_NAMESPACE, MNEMON_UI_SETTINGS_NAMESPACE } from "../settings.js";
import { MnemonSettingsCard } from "./MnemonSettingsCard.js";
import { MnemonView } from "./MnemonView.js";
import { MnemonToolView, MNEMON_TOOLVIEW_NAMES } from "./MnemonToolviews.js";
import { MnemonTurnTail, selectMnemonTurnTail } from "./MnemonTurnTail.js";
import { MnemonSaveAction } from "./MnemonSaveAction.js";
import { en, zh } from "./locales.js";
import { MnemonSettingsScope } from "./settings.js";
export const inject = ['slots', 'connection', 'locale'];
const INTERACTION_UNITS = {
    toolviews: {
        slot: 'tool.call.toolview',
        enabled: (value) => enabledOf(value, 'toolviews'),
        register(ctx, namespace, translate) {
            const disposers = [];
            for (const toolName of MNEMON_TOOLVIEW_NAMES) {
                disposers.push(ctx.slots.register({
                    name: 'tool.call.toolview',
                    key: toolName,
                    locale: namespace,
                    inject: (sessionId) => ({
                        ...(typeof sessionId === 'string' && sessionId !== '' ? { sessionId } : {}),
                        t: translate,
                    }),
                }, MnemonToolView));
            }
            return () => { for (const dispose of disposers.reverse())
                dispose(); };
        },
    },
    turnBar: {
        slot: 'conversation.chat.turnTail',
        enabled: (value) => enabledOf(value, 'turnBar'),
        register(ctx, namespace, translate) {
            return ctx.slots.register({
                name: 'conversation.chat.turnTail',
                locale: namespace,
                select: selectMnemonTurnTail,
                inject: (sessionId) => ({
                    ...(typeof sessionId === 'string' && sessionId !== '' ? { sessionId } : {}),
                    connection: ctx.connection,
                    t: translate,
                }),
            }, MnemonTurnTail);
        },
    },
    saveAction: {
        slot: 'conversation.chat.assistant-actions',
        enabled: (value) => enabledOf(value, 'saveAction'),
        register(ctx, namespace, translate) {
            return ctx.slots.register({
                name: 'conversation.chat.assistant-actions',
                id: 'mnemon-save',
                order: 90,
                locale: namespace,
                inject: (sessionId) => ({
                    ...(typeof sessionId === 'string' && sessionId !== '' ? { sessionId } : {}),
                    connection: ctx.connection,
                    t: translate,
                }),
            }, MnemonSaveAction);
        },
    },
};
/** Interaction surfaces are opt-in: an explicit `true` in settings enables one. */
function enabledOf(value, key) {
    return value?.[key] === true;
}
/** Add one standard conversation.view entry; unloading the plugin removes it with the slot effect. */
export function apply(rawContext) {
    const ctx = rawContext;
    const settings = new MnemonSettingsScope(ctx.connection, MNEMON_SETTINGS_NAMESPACE);
    const interactionSettings = new MnemonSettingsScope(ctx.connection, MNEMON_UI_SETTINGS_NAMESPACE);
    const namespace = 'mnemon';
    ctx.effect(() => ctx.locale.register(namespace, { zh, en }), 'dsh-mnemon: locale dictionaries');
    const translate = ctx.locale.bind(namespace);
    ctx.slots.inject('conversation.view', () => ctx.slots.register({
        name: 'conversation.view',
        id: 'mnemon',
        order: 30,
        label: () => translate('tab.label'),
        locale: namespace,
        inject: () => ({
            connection: ctx.connection,
            settingsScope: settings,
            t: translate,
        }),
    }, MnemonView));
    ctx.slots.inject('settings.section', () => ctx.slots.register({
        name: 'settings.section',
        id: 'mnemon',
        order: 20,
        label: () => translate('tab.label'),
        locale: namespace,
        inject: () => ({
            scope: settings,
            interactionScope: interactionSettings,
            connection: ctx.connection,
            t: translate,
        }),
    }, MnemonSettingsCard));
    // In-conversation interaction surfaces are opt-in and bound live: each
    // settings change registers or disposes the slot contributions without a
    // reload. Until the snapshot loads, nothing registers (conservative default).
    const active = new Map();
    const reconcile = () => {
        const value = interactionSettings.getSnapshot().value;
        for (const key of Object.keys(INTERACTION_UNITS)) {
            const unit = INTERACTION_UNITS[key];
            const enabled = unit.enabled(value);
            if (enabled && !active.has(key)) {
                active.set(key, ctx.slots.inject(unit.slot, () => unit.register(ctx, namespace, translate)));
            }
            else if (!enabled && active.has(key)) {
                active.get(key)();
                active.delete(key);
            }
        }
    };
    ctx.effect(() => {
        const unsubscribe = interactionSettings.subscribe(reconcile);
        reconcile();
        return () => {
            unsubscribe();
            for (const dispose of [...active.values()].reverse())
                dispose();
            active.clear();
        };
    }, 'dsh-mnemon: interaction surfaces');
}
//# sourceMappingURL=index.js.map