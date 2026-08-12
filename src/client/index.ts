import type { ClientConnectionHandle, ClientContextShape } from '../contracts.ts'
import { MnemonView } from './MnemonView.tsx'
import { en, zh, type MnemonKey } from './locales.ts'
import { MnemonSettingsScope } from './settings.ts'

export const inject = ['slots', 'connection', 'locale']

/** Add one standard conversation.view entry; unloading the plugin removes it with the slot effect. */
export function apply(rawContext: unknown): void {
  const ctx = rawContext as unknown as ClientContextShape
  const settings = new MnemonSettingsScope(ctx.connection)
  const namespace = 'mnemon'
  ctx.effect(() => ctx.locale.register(namespace, { zh, en }), 'dsh-mnemon: locale dictionaries')
  const translate = ctx.locale.bind(namespace)
  ctx.slots.inject('conversation.view', () => ctx.slots.register({
    name: 'conversation.view',
    id: 'mnemon',
    order: 30,
    label: () => translate('tab.label'),
    locale: namespace,
    inject: (): { connection: ClientConnectionHandle; settingsScope: MnemonSettingsScope; t: (key: MnemonKey, params?: Record<string, unknown>) => string } => ({
      connection: ctx.connection,
      settingsScope: settings,
      t: translate as (key: MnemonKey, params?: Record<string, unknown>) => string,
    }),
  }, MnemonView as never))
}
