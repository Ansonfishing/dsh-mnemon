import { Config, InteractionConfig, resolveConfig, resolveInteractionConfig, type Config as MnemonConfig } from './config.ts'
import { registerCommands } from './commands.ts'
import type { HostContextShape } from './contracts.ts'
import { DocumentManager } from './documents.ts'
import { registerGuidance, registerRuntimeMemoryContext } from './guidance.ts'
import { createRuntimeGraph, LiveMnemonRuntime, type MnemonRuntimeGraph } from './live-runtime.ts'
import { MnemonLifecycle } from './lifecycle.ts'
import { registerRpc } from './rpc.ts'
import { createRunner } from './runner.ts'
import { RuntimeMemoryController } from './runtime-memory.ts'
import { MnemonService } from './service.ts'
import { registerSettingsRpc } from './settings.ts'
import { MnemonSubagentCoordinator } from './subagent.ts'
import { registerTools } from './tools.ts'
import { StorageScopeInspector } from './storage-scope.ts'
import { MnemonPackManager } from './pack.ts'
import { VersionUpdateManager } from './version-updates.ts'

export const name = 'dsh-mnemon'
export const inject = ['tools', 'settings', 'commands', 'agents', 'subagents', 'workspaceRegistry']
export { Config, InteractionConfig, resolveConfig, resolveInteractionConfig, DocumentManager, LiveMnemonRuntime, MnemonLifecycle, MnemonService, MnemonSubagentCoordinator, RuntimeMemoryController, StorageScopeInspector, MnemonPackManager, VersionUpdateManager, createRunner, createRuntimeGraph }
export type { MnemonConfig }

/** Mount native model tools on every DSH surface and UI RPC only when Web connection exists. */
export function apply(rawContext: unknown, config: MnemonConfig = {}): void {
  const ctx = rawContext as unknown as HostContextShape
  const prepared = new WeakMap<object, MnemonRuntimeGraph>()
  const settings = ctx.settings.register<Config>('mnemon', Config, {
    base: config,
    applies: 'live',
    validate: value => {
      prepared.set(value, createRuntimeGraph(resolveConfig(value)))
    },
  })
  const initialSettings = settings.get()
  const runtime = new LiveMnemonRuntime(prepared.get(initialSettings) ?? createRuntimeGraph(resolveConfig(initialSettings)), ctx.workspaceRegistry, ctx.agents)
  const resolved = runtime.config
  ctx.on('settings/updated', ((namespace: string, next: Config) => {
    if (namespace !== 'mnemon') return
    runtime.swap(prepared.get(next) ?? createRuntimeGraph(resolveConfig(next)))
  }) as never)
  ctx.settings.register('mnemon-ui', InteractionConfig, {
    base: resolveInteractionConfig(resolved.conversationInteraction),
    applies: 'live',
  })
  const coordinator = new MnemonSubagentCoordinator(ctx.subagents, runtime)
  const lifecycle = new MnemonLifecycle(ctx, coordinator, runtime.config, runtime)
  ctx.effect(() => lifecycle.start(), 'dsh-mnemon.lifecycle-root()')
  registerTools(ctx, runtime, coordinator)
  registerCommands(ctx.commands, runtime, coordinator)
  registerGuidance(ctx, resolved)
  registerRuntimeMemoryContext(ctx, runtime.runtimeMemory)
  ctx.inject(['connection'], (webContext) => {
    registerRpc(webContext.connection, runtime, lifecycle)
    registerSettingsRpc(webContext.connection, ctx.settings)
  })
}
