import { Config, resolveConfig, type Config as MnemonConfig } from './config.ts'
import type { HostContextShape } from './contracts.ts'
import { registerGuidance } from './guidance.ts'
import { registerRpc } from './rpc.ts'
import { createRunner } from './runner.ts'
import { MnemonService } from './service.ts'
import { registerTools } from './tools.ts'

export const name = 'dsh-mnemon'
export const inject = ['tools']
export { Config, resolveConfig, MnemonService, createRunner }
export type { MnemonConfig }

/** Mount native model tools on every DSH surface and UI RPC only when Web connection exists. */
export function apply(rawContext: unknown, config: MnemonConfig = {}): void {
  const ctx = rawContext as unknown as HostContextShape
  const resolved = resolveConfig(config)
  const service = new MnemonService(createRunner(resolved), resolved)
  registerTools(ctx, service)
  if (resolved.routingGuidance) registerGuidance(ctx)
  if (resolved.tabEnabled) {
    ctx.inject(['connection'], (webContext) => {
      registerRpc(webContext.connection, service)
    })
  }
}
