import type { ClientConnectionHandle, ClientContextShape } from '../contracts.ts'
import { MnemonView } from './MnemonView.tsx'
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
    inject: (): { connection: ClientConnectionHandle; settingsScope: MnemonSettingsScope } => ({
      connection: ctx.connection,
      settingsScope: settings,
    }),
  }, MnemonView as never))
}
