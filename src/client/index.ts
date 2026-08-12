import type { ClientConnectionHandle, ClientContextShape } from '../contracts.ts'
import { MnemonView } from './MnemonView.tsx'
import { MnemonSettingsCard } from './MnemonSettingsCard.tsx'
import { MnemonSettingsScope } from './settings.ts'

export const inject = ['slots', 'connection']

/** Add one standard conversation.view entry; unloading the plugin removes it with the slot effect. */
export function apply(rawContext: unknown): void {
  const ctx = rawContext as unknown as ClientContextShape
  const settings = new MnemonSettingsScope(ctx.connection)
  ctx.slots.inject('conversation.view', () => ctx.slots.register({
    name: 'conversation.view',
    id: 'mnemon',
    order: 30,
    label: '记忆',
    inject: (): { connection: ClientConnectionHandle } => ({ connection: ctx.connection }),
  }, MnemonView as never))
  ctx.slots.inject('settings.plugin.item', () => ctx.slots.register({
    name: 'settings.plugin.item',
    id: 'mnemon',
    order: 20,
    inject: () => ({ scope: settings }),
  }, MnemonSettingsCard as never))
}
