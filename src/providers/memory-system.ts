import type { MemoryCatalog } from '../memory-system/catalog.ts'
import type { MemoryAdapterDescriptor, MemoryCapability } from '../memory-system/contracts.ts'
import type { MemoryProviderDescriptor } from '../shared/contracts.ts'
import { MEMORY_PROVIDER_CATALOG } from './catalog.ts'

export function providerMemoryCapabilities(provider: MemoryProviderDescriptor): MemoryCapability[] {
  const capabilities: MemoryCapability[] = ['status']
  if (provider.capabilities.search) capabilities.push('recall', 'search')
  if (provider.capabilities.browse) capabilities.push('read', 'browse')
  if (provider.capabilities.remember) capabilities.push('write')
  if (provider.capabilities.graph) capabilities.push('graph')
  if (provider.capabilities.related) capabilities.push('related')
  if (provider.capabilities.link) capabilities.push('link')
  if (provider.capabilities.forget) capabilities.push('forget')
  return capabilities
}

export function providerMemoryAdapterDescriptor(provider: MemoryProviderDescriptor): MemoryAdapterDescriptor {
  const scopes: MemoryAdapterDescriptor['scopes'] = provider.workspaceBinding === 'provider-global'
    ? ['provider-owned']
    : ['global', 'workspace', 'custom']
  return {
    id: provider.id,
    label: provider.label,
    description: provider.summary,
    locality: provider.kind,
    scopes,
    capabilities: providerMemoryCapabilities(provider),
  }
}

export function registerBuiltinMemoryAdapters(catalog: MemoryCatalog): () => void {
  const disposers = MEMORY_PROVIDER_CATALOG.map(provider => catalog.registerAdapter({ descriptor: providerMemoryAdapterDescriptor(provider) }))
  return () => {
    for (const dispose of disposers.reverse()) dispose()
  }
}
