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
function enabledOf(value, key) {
    const group = value?.conversationInteraction;
    return group === undefined || group[key] !== false;
}
/** Add one standard conversation.view entry; unloading the plugin removes it with the slot effect. */
export function apply(rawContext) {
    const ctx = rawContext;
    const settings = new MnemonSettingsScope(ctx.connection);
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
    ctx.slots.inject('settings.plugin.item', () => ctx.slots.register({
        name: 'settings.plugin.item',
        id: 'mnemon',
        order: 30,
        locale: namespace,
        inject: () => ({
            scope: settings,
            t: translate,
        }),
    }, MnemonSettingsCard));
    // In-conversation interaction surfaces are bound live: each settings change
    // registers or disposes the slot contributions without a reload. While the
    // snapshot is still loading, the defaults apply (all enabled).
    const active = new Map();
    const reconcile = () => {
        const value = settings.getSnapshot().value;
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
        const unsubscribe = settings.subscribe(reconcile);
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