import { MnemonView } from "./MnemonView.js";
import { en, zh } from "./locales.js";
import { MnemonSettingsScope } from "./settings.js";
export const inject = ['slots', 'connection', 'locale'];
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
}
//# sourceMappingURL=index.js.map