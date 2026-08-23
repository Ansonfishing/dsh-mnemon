#!/usr/bin/env node

import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

function argumentsFrom(argv) {
  const options = {
    baselineRoot: undefined,
    currentRoot: resolve(import.meta.dirname, '../../..'),
    mnemonBinary: '/private/tmp/dsh-mnemon-v03-eval-mnemon',
    output: '/private/tmp/dsh-mnemon-v0216-v03-compatibility.json',
  }
  for (let index = 0; index < argv.length; index += 2) {
    const name = argv[index]
    const value = argv[index + 1]
    if (value === undefined) throw new Error(`${name} requires a value`)
    if (name === '--baseline-root') options.baselineRoot = resolve(value)
    else if (name === '--current-root') options.currentRoot = resolve(value)
    else if (name === '--mnemon-binary') options.mnemonBinary = resolve(value)
    else if (name === '--output') options.output = resolve(value)
    else throw new Error(`unknown argument: ${name}`)
  }
  if (options.baselineRoot === undefined) throw new Error('--baseline-root is required')
  return options
}

async function loadPackage(root, label) {
  return import(`${pathToFileURL(join(root, 'lib', 'index.js')).href}?compat=${label}-${randomUUID()}`)
}

function insightId(value) {
  if (typeof value !== 'object' || value === null) return undefined
  for (const key of ['id', 'insightId', 'memoryId']) {
    if (typeof value[key] === 'string' && value[key].trim() !== '') return value[key].trim()
  }
  for (const child of Object.values(value)) {
    const id = insightId(child)
    if (id !== undefined) return id
  }
  return undefined
}

async function main() {
  const options = argumentsFrom(process.argv.slice(2))
  const temporaryRoot = await mkdtemp(join(tmpdir(), 'dsh-mnemon-compat-'))
  const dataDir = join(temporaryRoot, 'data')
  const workspace = join(temporaryRoot, 'workspace')
  await Promise.all([mkdir(dataDir), mkdir(workspace)])
  const [baseline, current] = await Promise.all([
    loadPackage(options.baselineRoot, 'baseline'),
    loadPackage(options.currentRoot, 'current'),
  ])
  const common = { storageScope: 'custom', dataDir, cliPath: options.mnemonBinary, writeEnabled: true, recallMode: 'guided', writebackMode: 'guided' }
  const checks = []
  const evidence = {}
  const check = async (name, operation) => {
    const started = performance.now()
    try {
      const value = await operation()
      checks.push({ name, status: 'passed', durationMs: Math.round((performance.now() - started) * 100) / 100 })
      return value
    } catch (error) {
      checks.push({ name, status: 'failed', durationMs: Math.round((performance.now() - started) * 100) / 100, error: error instanceof Error ? error.message : String(error) })
      throw error
    }
  }

  let baselineGraph
  let currentGraph
  let downgradeGraph
  try {
    const baselineConfig = baseline.resolveConfig(common)
    const currentConfig = current.resolveConfig(common)
    evidence.config = {
      baselineStorageScope: baselineConfig.storageScope,
      currentStorageScope: currentConfig.storageScope,
      currentDefaultTopology: currentConfig.memoryTopology,
      baselineHasTopology: baselineConfig.memoryTopology !== undefined,
    }

    const baselineWithV3Settings = baseline.resolveConfig({
      ...common,
      memoryTopology: {
        id: 'compat-topology',
        strategyId: 'default-three-tier',
        layers: { runtime: { enabled: false } },
      },
    })
    evidence.config.v3TopologyOnDowngrade = baselineWithV3Settings.memoryTopology ?? null

    baselineGraph = baseline.createRuntimeGraph(baselineConfig, workspace)
    const baselineDocumentController = baselineGraph.documents.forWorkspace(workspace)
    const seeded = await check('v0.2 writes canonical Runtime, Document, and Memory Space data', async () => {
      await baselineGraph.runtimeMemory.mutate({ action: 'add', target: 'memory', content: 'COMPAT-V0216-HOT canonical runtime fact.', importance: 'critical' })
      const document = await baselineDocumentController.mutate({ action: 'create', title: 'Compatibility document', description: 'Cross-version canonical document.', content: '# Compatibility\n\nCOMPAT-DOC-V0216 baseline body.' })
      const body = await baselineGraph.service.createBody({ name: 'Compatibility Space', description: 'Cross-version durable facts.', providerId: 'mnemon-native', active: true })
      const remembered = await baselineGraph.service.remember({ content: 'COMPAT-DURABLE-V0216 baseline durable fact.', category: 'fact', importance: 5, memoryBodyId: body.id })
      assert.ok(insightId(remembered))
      return { documentId: document.document.id, bodyId: body.id }
    })

    currentGraph = current.createRuntimeGraph(currentConfig, workspace)
    await check('v0.3 reads the unchanged v0.2 data root without migration', async () => {
      assert.match(currentGraph.runtimeMemory.contextText(), /COMPAT-V0216-HOT/u)
      assert.equal((await currentGraph.documents.forWorkspace(workspace).search('COMPAT-DOC-V0216')).results[0]?.id, seeded.documentId)
      const recalled = await currentGraph.service.search({ query: 'COMPAT-DURABLE-V0216', mode: 'basic', limit: 5, memoryBodyIds: [seeded.bodyId] })
      assert.ok(recalled.results.some(result => result.content.includes('COMPAT-DURABLE-V0216')))
    })

    await check('v0.3 writes data that remains canonical to v0.2', async () => {
      await currentGraph.runtimeMemory.mutate({ action: 'add', target: 'memory', content: 'COMPAT-V03-HOT current runtime fact.', importance: 'normal' })
      const documents = currentGraph.documents.forWorkspace(workspace)
      const currentDocument = documents.get(seeded.documentId)
      await documents.mutate({ action: 'update', id: seeded.documentId, content: '# Compatibility\n\nCOMPAT-DOC-V0216 baseline body.\n\nCOMPAT-DOC-V03 current addition.' })
      assert.equal(documents.get(seeded.documentId).revision, currentDocument.revision + 1)
      const remembered = await currentGraph.service.remember({ content: 'COMPAT-DURABLE-V03 current durable fact.', category: 'fact', importance: 4, memoryBodyId: seeded.bodyId })
      assert.ok(insightId(remembered))
      const view = await currentGraph.memoryViews.publish({ storage: 'custom', workspaceId: workspace, sessionId: 'compatibility' })
      const wake = currentGraph.memoryViews.wake(view.id)
      assert.match(wake.text, /COMPAT-V0216-HOT/u)
      assert.match(wake.text, /COMPAT-V03-HOT/u)
      assert.doesNotMatch(wake.text, /Compatibility Space|COMPAT-DOC-V03/u)
      evidence.v3View = { id: view.id, wakeCharacters: wake.text.length, sourceModes: view.sources.map(source => [source.layerId, source.mode]) }
    })

    currentGraph.dispose?.()
    currentGraph = undefined
    baselineGraph.dispose?.()
    baselineGraph = undefined
    downgradeGraph = baseline.createRuntimeGraph(baseline.resolveConfig(common), workspace)
    await check('v0.2 can reopen data last written by v0.3', async () => {
      const context = downgradeGraph.runtimeMemory.contextText()
      assert.match(context, /COMPAT-V0216-HOT/u)
      assert.match(context, /COMPAT-V03-HOT/u)
      assert.match((await downgradeGraph.documents.forWorkspace(workspace).search('COMPAT-DOC-V03')).results[0]?.content ?? '', /COMPAT-DOC-V03/u)
      const recalled = await downgradeGraph.service.search({ query: 'COMPAT-DURABLE', mode: 'basic', limit: 10, memoryBodyIds: [seeded.bodyId] })
      assert.ok(recalled.results.some(result => result.content.includes('COMPAT-DURABLE-V0216')))
      assert.ok(recalled.results.some(result => result.content.includes('COMPAT-DURABLE-V03')))
    })
  } finally {
    baselineGraph?.dispose?.()
    currentGraph?.dispose?.()
    downgradeGraph?.dispose?.()
    await rm(temporaryRoot, { recursive: true, force: true })
  }

  const report = {
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    baselineRoot: options.baselineRoot,
    currentRoot: options.currentRoot,
    checks,
    evidence,
    totals: { passed: checks.filter(item => item.status === 'passed').length, failed: checks.filter(item => item.status === 'failed').length },
  }
  await mkdir(dirname(options.output), { recursive: true })
  await writeFile(options.output, `${JSON.stringify(report, null, 2)}\n`)
  process.stdout.write(`${options.output}\n`)
}

await main()
