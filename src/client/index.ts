import type { ClientConnectionHandle, ClientContextShape } from '../contracts.ts'
import type { Config, InteractionConfig } from '../config.ts'
import { MNEMON_SETTINGS_NAMESPACE, MNEMON_UI_SETTINGS_NAMESPACE } from '../settings.ts'
import { MnemonSettingsCard } from './MnemonSettingsCard.tsx'
import { MnemonView } from './MnemonView.tsx'
import { MnemonToolView, MNEMON_TOOLVIEW_NAMES } from './MnemonToolviews.tsx'
import { MnemonTurnTail, selectMnemonTurnTail } from './MnemonTurnTail.tsx'
import { MnemonSaveAction } from './MnemonSaveAction.tsx'
import { en, zh, type MnemonKey } from './locales.ts'
import { MnemonSettingsScope } from './settings.ts'

export const inject = ['slots', 'connection', 'locale']

/** Interaction surfaces: slot name, settings toggle, and the registrations it owns. */
type InteractionRegister = (ctx: ClientContextShape, namespace: string, translate: (key: MnemonKey, params?: Record<string, unknown>) => string) => () => void

interface InteractionUnit {
  slot: string
  enabled: (value: unknown) => boolean
  register: InteractionRegister
}

const INTERACTION_UNITS: Record<'toolviews' | 'turnBar' | 'saveAction', InteractionUnit> = {
  toolviews: {
    slot: 'tool.call.toolview',
    enabled: (value: unknown): boolean => enabledOf(value, 'toolviews'),
    register(ctx: ClientContextShape, namespace: string, translate: (key: MnemonKey, params?: Record<string, unknown>) => string): () => void {
      const disposers: Array<() => void> = []
      for (const toolName of MNEMON_TOOLVIEW_NAMES) {
        disposers.push(ctx.slots.register({
          name: 'tool.call.toolview',
          key: toolName,
          locale: namespace,
          inject: (sessionId: unknown): { sessionId?: string; t: (key: MnemonKey, params?: Record<string, unknown>) => string } => ({
            ...(typeof sessionId === 'string' && sessionId !== '' ? { sessionId } : {}),
            t: translate as (key: MnemonKey, params?: Record<string, unknown>) => string,
          }),
        }, MnemonToolView as never) as () => void)
      }
      return () => { for (const dispose of disposers.reverse()) dispose() }
    },
  },
  turnBar: {
    slot: 'conversation.chat.turnTail',
    enabled: (value: unknown): boolean => enabledOf(value, 'turnBar'),
    register(ctx: ClientContextShape, namespace: string, translate: (key: MnemonKey, params?: Record<string, unknown>) => string): () => void {
      return ctx.slots.register({
        name: 'conversation.chat.turnTail',
        locale: namespace,
        select: selectMnemonTurnTail as never,
        inject: (sessionId: unknown): { sessionId?: string; connection: ClientConnectionHandle; t: (key: MnemonKey, params?: Record<string, unknown>) => string } => ({
          ...(typeof sessionId === 'string' && sessionId !== '' ? { sessionId } : {}),
          connection: ctx.connection,
          t: translate as (key: MnemonKey, params?: Record<string, unknown>) => string,
        }),
      }, MnemonTurnTail as never) as () => void
    },
  },
  saveAction: {
    slot: 'conversation.chat.assistant-actions',
    enabled: (value: unknown): boolean => enabledOf(value, 'saveAction'),
    register(ctx: ClientContextShape, namespace: string, translate: (key: MnemonKey, params?: Record<string, unknown>) => string): () => void {
      return ctx.slots.register({
        name: 'conversation.chat.assistant-actions',
        id: 'mnemon-save',
        order: 90,
        locale: namespace,
        inject: (sessionId: unknown): { sessionId?: string; connection: ClientConnectionHandle; t: (key: MnemonKey, params?: Record<string, unknown>) => string } => ({
          ...(typeof sessionId === 'string' && sessionId !== '' ? { sessionId } : {}),
          connection: ctx.connection,
          t: translate as (key: MnemonKey, params?: Record<string, unknown>) => string,
        }),
      }, MnemonSaveAction as never) as () => void
    },
  },
}

type InteractionUnitKey = keyof typeof INTERACTION_UNITS

/** Interaction surfaces are opt-in: an explicit `true` in settings enables one. */
function enabledOf(value: unknown, key: 'toolviews' | 'turnBar' | 'saveAction'): boolean {
  return (value as Partial<Record<typeof key, boolean>> | undefined)?.[key] === true
}

/** Add one standard conversation.view entry; unloading the plugin removes it with the slot effect. */
export function apply(rawContext: unknown): void {
  const ctx = rawContext as unknown as ClientContextShape
  const settings = new MnemonSettingsScope<Config>(ctx.connection, MNEMON_SETTINGS_NAMESPACE)
  const interactionSettings = new MnemonSettingsScope<InteractionConfig>(ctx.connection, MNEMON_UI_SETTINGS_NAMESPACE)
  const namespace = 'mnemon'
  ctx.effect(() => ctx.locale.register(namespace, { zh, en }), 'dsh-mnemon: locale dictionaries')
  const translate = ctx.locale.bind(namespace)
  ctx.slots.inject('conversation.view', () => ctx.slots.register({
    name: 'conversation.view',
    id: 'mnemon',
    order: 30,
    label: () => translate('tab.label'),
    locale: namespace,
    inject: (): { connection: ClientConnectionHandle; settingsScope: MnemonSettingsScope<Config>; t: (key: MnemonKey, params?: Record<string, unknown>) => string } => ({
      connection: ctx.connection,
      settingsScope: settings,
      t: translate as (key: MnemonKey, params?: Record<string, unknown>) => string,
    }),
  }, MnemonView as never))
  ctx.slots.inject('settings.plugins.tab', () => ctx.slots.register({
    name: 'settings.plugins.tab',
    id: 'mnemon',
    order: 20,
    label: () => translate('config.tab'),
    locale: namespace,
    inject: (): { scope: MnemonSettingsScope<Config>; interactionScope: MnemonSettingsScope<InteractionConfig>; t: (key: MnemonKey, params?: Record<string, unknown>) => string } => ({
      scope: settings,
      interactionScope: interactionSettings,
      t: translate as (key: MnemonKey, params?: Record<string, unknown>) => string,
    }),
  }, MnemonSettingsCard as never))

  // In-conversation interaction surfaces are opt-in and bound live: each
  // settings change registers or disposes the slot contributions without a
  // reload. Until the snapshot loads, nothing registers (conservative default).
  const active = new Map<InteractionUnitKey, () => void>()
  const reconcile = (): void => {
    const value = interactionSettings.getSnapshot().value
    for (const key of Object.keys(INTERACTION_UNITS) as InteractionUnitKey[]) {
      const unit = INTERACTION_UNITS[key]
      const enabled = unit.enabled(value)
      if (enabled && !active.has(key)) {
        active.set(key, ctx.slots.inject(unit.slot, () => unit.register(ctx, namespace, translate)) as () => void)
      } else if (!enabled && active.has(key)) {
        active.get(key)!()
        active.delete(key)
      }
    }
  }
  ctx.effect(() => {
    const unsubscribe = interactionSettings.subscribe(reconcile)
    reconcile()
    return () => {
      unsubscribe()
      for (const dispose of [...active.values()].reverse()) dispose()
      active.clear()
    }
  }, 'dsh-mnemon: interaction surfaces')
}
