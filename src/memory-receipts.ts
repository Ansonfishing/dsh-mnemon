import { randomUUID } from 'node:crypto'
import type { MemoryCapability, MemoryJsonValue, MemoryReceipt } from '../packages/contracts/src/index.ts'
import type { MemoryKernel, MemoryReceiptSink } from '../packages/kernel/src/index.ts'
import type { MemoryViewManager } from '../packages/kernel/src/index.ts'

export interface CommittedAuthorityOperation {
  layerId: string
  capability: MemoryCapability
  operation: string
  adapterId?: string
  checkpoint?: MemoryJsonValue
}

export type AuthorityCommitRecorder = (operation: CommittedAuthorityOperation) => MemoryReceipt

/** Converts already-committed compatibility-controller writes into the one receipt contract. */
export class MemoryReceiptBridge implements MemoryReceiptSink {
  constructor(
    private readonly kernel: Pick<MemoryKernel, 'descriptor' | 'guardGeneration'>,
    private readonly views: Pick<MemoryViewManager, 'apply'>,
    private readonly now: () => Date = () => new Date(),
    private readonly id: () => string = randomUUID,
  ) {}

  append(receipt: MemoryReceipt): void {
    this.views.apply(receipt)
  }

  record(operation: CommittedAuthorityOperation): MemoryReceipt {
    const descriptor = this.kernel.descriptor()
    const id = this.id()
    const timestamp = this.now().toISOString()
    const receipt: MemoryReceipt = {
      id,
      planId: `committed-${id}`,
      topologyId: descriptor.topology.id,
      topologyGeneration: descriptor.topology.generation,
      catalogGeneration: descriptor.catalog.generation,
      guardGeneration: this.kernel.guardGeneration,
      strategyId: 'host-authority-bridge',
      strategyVersion: '1',
      operation: operation.operation,
      capability: operation.capability,
      status: 'succeeded',
      startedAt: timestamp,
      finishedAt: timestamp,
      steps: [{
        stepId: `committed-step-${id}`,
        layerId: operation.layerId,
        ...(operation.adapterId === undefined ? {} : { adapterId: operation.adapterId }),
        status: 'succeeded',
        startedAt: timestamp,
        finishedAt: timestamp,
        ...(operation.checkpoint === undefined ? {} : { output: operation.checkpoint }),
      }],
    }
    this.append(receipt)
    return receipt
  }
}
