import { Config, resolveConfig, type Config as MnemonConfig } from './config.ts'
import { registerCommands } from './commands.ts'
import type { HostContextShape } from './contracts.ts'
import { DocumentManager } from './documents.ts'
import { registerGuidance, registerRuntimeMemoryContext } from './guidance.ts'
import { MnemonLifecycle } from './lifecycle.ts'
import { registerRpc } from './rpc.ts'
import { createRunner } from './runner.ts'
import { RuntimeMemoryController } from './runtime-memory.ts'
import { MnemonService } from './service.ts'
import { registerSettingsRpc } from './settings.ts'
import { MnemonSubagentCoordinator } from './subagent.ts'
import { registerTools } from './tools.ts'

export const name = 'dsh-mnemon'
export const inject = ['tools', 'settings', 'commands', 'agents', 'subagents']
export { Config, resolveConfig, DocumentManager, MnemonLifecycle, MnemonService, MnemonSubagentCoordinator, RuntimeMemoryController, createRunner }
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
  const runner = createRunner(resolved)
  const service = new MnemonService(runner, resolved)
  const runtimeMemory = new RuntimeMemoryController(runner)
  const documents = new DocumentManager()
  const coordinator = new MnemonSubagentCoordinator(ctx.subagents, runtimeMemory, documents)
  const lifecycle = new MnemonLifecycle(ctx, coordinator, resolved)
  ctx.effect(() => lifecycle.start(), 'dsh-mnemon.lifecycle-root()')
  registerTools(ctx, service, coordinator, runtimeMemory, documents)
  registerCommands(ctx.commands, service, coordinator)
  if (resolved.routingGuidance) registerGuidance(ctx)
  registerRuntimeMemoryContext(ctx, runtimeMemory)
  ctx.inject(['connection'], (webContext) => {
    if (resolved.tabEnabled) registerRpc(webContext.connection, service, lifecycle, runtimeMemory)
    registerSettingsRpc(webContext.connection, ctx.settings)
  })
}
