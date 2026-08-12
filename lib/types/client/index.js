import { MnemonView } from "./MnemonView.js";
export const inject = ['slots', 'connection'];
/** Add one standard conversation.view entry; unloading the plugin removes it with the slot effect. */
export function apply(rawContext) {
    const ctx = rawContext;
    ctx.slots.inject('conversation.view', () => ctx.slots.register({
        name: 'conversation.view',
        id: 'mnemon',
        order: 30,
        label: '记忆',
        inject: () => ({ connection: ctx.connection }),
    }, MnemonView));
}
//# sourceMappingURL=index.js.map