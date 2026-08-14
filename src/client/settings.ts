import type { ClientConnectionHandle, ClientSettingsScope, ClientSettingsSnapshot, SettingsOperation } from '../contracts.ts'
import { MNEMON_SETTINGS_CHANNEL, MNEMON_SETTINGS_NAMESPACE } from '../settings.ts'

export class MnemonSettingsScope<T extends object> implements ClientSettingsScope<T> {
  private snapshot: ClientSettingsSnapshot<T> = { status: 'loading', writable: false, mode: 'host' }
  private readonly listeners = new Set<() => void>()
  private tail = Promise.resolve()

  constructor(private readonly connection: ClientConnectionHandle, private readonly namespace = MNEMON_SETTINGS_NAMESPACE) {
    void this.load()
  }

  getSnapshot = (): ClientSettingsSnapshot<T> => this.snapshot

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  set(field: string, value: unknown): Promise<void> {
    return this.mutate([{ op: 'set', path: [field], value }])
  }

  unset(field: string): Promise<void> {
    return this.mutate([{ op: 'unset', path: [field] }])
  }

  /** Set a nested field (e.g. ['conversationInteraction', 'toolviews']). */
  setPath(path: string[], value: unknown): Promise<void> {
    return this.mutate([{ op: 'set', path, value }])
  }

  /** Unset a nested field, falling back to its schema default. */
  unsetPath(path: string[]): Promise<void> {
    return this.mutate([{ op: 'unset', path }])
  }

  mutate(ops: SettingsOperation[]): Promise<void> {
    return this.write(ops)
  }

  private async load(): Promise<void> {
    try {
      const response = await this.connection.rpc.call(MNEMON_SETTINGS_CHANNEL, 'get', { namespace: this.namespace })
      if (!response.ok) {
        this.publish({ status: 'unavailable', writable: false, mode: 'host' })
        return
      }
      this.publish(response.value as ClientSettingsSnapshot<T>)
    } catch {
      this.publish({ status: 'unavailable', writable: false, mode: 'host' })
    }
  }

  private write(ops: SettingsOperation[]): Promise<void> {
    const task = this.tail.then(async () => {
      const response = await this.connection.rpc.call(MNEMON_SETTINGS_CHANNEL, 'mutate', {
        namespace: this.namespace,
        ops,
        ...(this.snapshot.revision === undefined ? {} : { expectedRevision: this.snapshot.revision }),
      })
      if (!response.ok) {
        await this.load()
        throw new Error(response.error.message)
      }
      this.publish(response.value as ClientSettingsSnapshot<T>)
    })
    this.tail = task.catch(() => {})
    return task
  }

  private publish(snapshot: ClientSettingsSnapshot<T>): void {
    this.snapshot = snapshot
    for (const listener of this.listeners) listener()
  }
}
