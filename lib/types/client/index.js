import { MnemonView } from "./MnemonView.js";
import { MnemonSettingsScope } from "./settings.js";
export const inject = ['slots', 'connection'];
/** Add one standard conversation.view entry; unloading the plugin removes it with the slot effect. */
export function apply(rawContext) {
    const ctx = rawContext;
    const settings = new MnemonSettingsScope(ctx.connection);
    ctx.slots.inject('conversation.view', () => ctx.slots.register({
        name: 'conversation.view',
        id: 'mnemon',
        order: 30,
        label: '记忆',
        inject: () => ({
            connection: ctx.connection,
            settingsScope: settings,
        }),
    }, MnemonView));
}
//# sourceMappingURL=index.js.map