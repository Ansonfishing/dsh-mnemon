import type { ClientConnectionHandle, ClientSettingsScope, ClientSettingsSnapshot } from '../contracts.ts'
import type { Config } from '../config.ts'
import { MNEMON_SETTINGS_CHANNEL } from '../settings.ts'

type Operation = { op: 'set'; path: string[]; value: unknown } | { op: 'unset'; path: string[] }

export class MnemonSettingsScope implements ClientSettingsScope<Config> {
  private snapshot: ClientSettingsSnapshot<Config> = { status: 'loading', writable: false, mode: 'host' }
  private readonly listeners = new Set<() => void>()
  private tail = Promise.resolve()

  constructor(private readonly connection: ClientConnectionHandle) {
    void this.load()
  }

  getSnapshot = (): ClientSettingsSnapshot<Config> => this.snapshot

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  set(field: string, value: unknown): Promise<void> {
    return this.write({ op: 'set', path: [field], value })
  }

  unset(field: string): Promise<void> {
    return this.write({ op: 'unset', path: [field] })
  }

  /** Set a nested field (e.g. ['conversationInteraction', 'toolviews']). */
  setPath(path: string[], value: unknown): Promise<void> {
    return this.write({ op: 'set', path, value })
  }

  /** Unset a nested field, falling back to its schema default. */
  unsetPath(path: string[]): Promise<void> {
    return this.write({ op: 'unset', path })
  }

  private async load(): Promise<void> {
    const response = await this.connection.rpc.call(MNEMON_SETTINGS_CHANNEL, 'get', {})
    if (!response.ok) {
      this.publish({ status: 'unavailable', writable: false, mode: 'host' })
      return
    }
    this.publish(response.value as ClientSettingsSnapshot<Config>)
  }

  private write(op: Operation): Promise<void> {
    const task = this.tail.then(async () => {
      const response = await this.connection.rpc.call(MNEMON_SETTINGS_CHANNEL, 'mutate', {
        ops: [op],
        ...(this.snapshot.revision === undefined ? {} : { expectedRevision: this.snapshot.revision }),
      })
      if (!response.ok) throw new Error(response.error.message)
      this.publish(response.value as ClientSettingsSnapshot<Config>)
    })
    this.tail = task.catch(() => {})
    return task
  }

  private publish(snapshot: ClientSettingsSnapshot<Config>): void {
    this.snapshot = snapshot
    for (const listener of this.listeners) listener()
  }
}
