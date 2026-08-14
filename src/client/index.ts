import type { ClientConnectionHandle, ClientContextShape } from '../contracts.ts'
import { MnemonSettingsCard } from './MnemonSettingsCard.tsx'
import { MnemonView } from './MnemonView.tsx'
import { MnemonToolView, MNEMON_TOOLVIEW_NAMES } from './MnemonToolviews.tsx'
import { MnemonTurnTail, selectMnemonTurnTail } from './MnemonTurnTail.tsx'
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
  ctx.slots.inject('settings.plugin.item', () => ctx.slots.register({
    name: 'settings.plugin.item',
    id: 'mnemon',
    order: 30,
    locale: namespace,
    inject: (): { scope: MnemonSettingsScope; t: (key: MnemonKey, params?: Record<string, unknown>) => string } => ({
      scope: settings,
      t: translate as (key: MnemonKey, params?: Record<string, unknown>) => string,
    }),
  }, MnemonSettingsCard as never))
  // Memory-flavoured rows for every mnemon_* tool call in the chat flow; a
  // keyed hit replaces the generic tool row.
  for (const toolName of MNEMON_TOOLVIEW_NAMES) {
    ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
      name: 'tool.call.toolview',
      key: toolName,
      locale: namespace,
      inject: (sessionId: unknown): { sessionId?: string; t: (key: MnemonKey, params?: Record<string, unknown>) => string } => ({
        ...(typeof sessionId === 'string' && sessionId !== '' ? { sessionId } : {}),
        t: translate as (key: MnemonKey, params?: Record<string, unknown>) => string,
      }),
    }, MnemonToolView as never))
  }
  // Per-turn memory activity bar under completed turns; the chain selector
  // declines open turns and the component hides when the turn touched no memory.
  ctx.slots.inject('conversation.chat.turnTail', () => ctx.slots.register({
    name: 'conversation.chat.turnTail',
    locale: namespace,
    select: selectMnemonTurnTail as never,
    inject: (sessionId: unknown): { sessionId?: string; connection: ClientConnectionHandle; t: (key: MnemonKey, params?: Record<string, unknown>) => string } => ({
      ...(typeof sessionId === 'string' && sessionId !== '' ? { sessionId } : {}),
      connection: ctx.connection,
      t: translate as (key: MnemonKey, params?: Record<string, unknown>) => string,
    }),
  }, MnemonTurnTail as never))
}
