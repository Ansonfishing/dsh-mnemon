import { Config, resolveConfig, type Config as MnemonConfig } from './config.ts'
import { registerCommands } from './commands.ts'
import type { HostContextShape } from './contracts.ts'
import { registerGuidance } from './guidance.ts'
import { MnemonLifecycle } from './lifecycle.ts'
import { registerRpc } from './rpc.ts'
import { createRunner } from './runner.ts'
import { MnemonService } from './service.ts'
import { registerSettingsRpc } from './settings.ts'
import { registerTools } from './tools.ts'

export const name = 'dsh-mnemon'
export const inject = ['tools', 'settings', 'commands', 'agents']
export { Config, resolveConfig, MnemonLifecycle, MnemonService, createRunner }
export type { MnemonConfig }

/** Mount native model tools on every DSH surface and UI RPC only when Web connection exists. */
export function apply(rawContext: unknown, config: MnemonConfig = {}): void {
  const ctx = rawContext as unknown as HostContextShape
  const settings = ctx.settings.register<Config>('mnemon', Config, {
    base: config,
    applies: 'restart',
    validate: value => { resolveConfig(value) },
  })
  const resolved = resolveConfig(settings.get())
  const service = new MnemonService(createRunner(resolved), resolved)
  const lifecycle = new MnemonLifecycle(ctx, service, resolved)
  ctx.effect(() => lifecycle.start(), 'dsh-mnemon.lifecycle-root()')
  registerTools(ctx, service)
  registerCommands(ctx.commands, service)
  if (resolved.routingGuidance) registerGuidance(ctx)
  ctx.inject(['connection'], (webContext) => {
    if (resolved.tabEnabled) registerRpc(webContext.connection, service, lifecycle)
    registerSettingsRpc(webContext.connection, ctx.settings)
  })
}
