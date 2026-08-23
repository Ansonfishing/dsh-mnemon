#!/usr/bin/env node

import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')

function argumentsFrom(argv) {
  const options = { packageRoot: root, mnemonBinary: '/private/tmp/dsh-mnemon-v03-eval-mnemon', output: '/private/tmp/dsh-mnemon-v03-components.json' }
  for (let index = 0; index < argv.length; index += 2) {
    const name = argv[index]
    const value = argv[index + 1]
    if (value === undefined) throw new Error(`${name} requires a value`)
    if (name === '--package-root') options.packageRoot = resolve(value)
    else if (name === '--mnemon-binary') options.mnemonBinary = resolve(value)
    else if (name === '--output') options.output = resolve(value)
    else throw new Error(`unknown argument: ${name}`)
  }
  return options
}

function nestedId(value) {
  if (typeof value !== 'object' || value === null) return undefined
  for (const key of ['id', 'insightId', 'memoryId']) {
    if (typeof value[key] === 'string' && value[key].trim() !== '') return value[key].trim()
  }
  for (const child of Object.values(value)) {
    const candidate = nestedId(child)
    if (candidate !== undefined) return candidate
  }
  return undefined
}

async function main() {
  const options = argumentsFrom(process.argv.slice(2))
  const temporaryRoot = await mkdtemp(join(tmpdir(), 'dsh-mnemon-v03-components-'))
  const dataDir = join(temporaryRoot, 'data')
  const workspace = join(temporaryRoot, 'workspace')
  await Promise.all([mkdir(dataDir), mkdir(workspace)])
  const moduleUrl = `${pathToFileURL(join(options.packageRoot, 'lib', 'index.js')).href}?components=${randomUUID()}`
  const { createRuntimeGraph, resolveConfig } = await import(moduleUrl)
  const graph = createRuntimeGraph(resolveConfig({ storageScope: 'custom', dataDir, cliPath: options.mnemonBinary }), workspace)
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

  try {
    await check('runtime add/replace/remove and exact projection', async () => {
      await graph.runtimeMemory.mutate({ action: 'add', target: 'memory', content: 'COMPONENT-RUNTIME-OLD reusable fact.', importance: 'normal' })
      await graph.runtimeMemory.mutate({ action: 'replace', target: 'memory', oldText: 'COMPONENT-RUNTIME-OLD', content: 'COMPONENT-RUNTIME-NEW reusable fact.', importance: 'critical' })
      await graph.runtimeMemory.mutate({ action: 'add', target: 'user', content: 'COMPONENT-USER temporary preference.', importance: 'normal' })
      await graph.runtimeMemory.mutate({ action: 'remove', target: 'user', oldText: 'COMPONENT-USER' })
      const projection = graph.runtimeMemory.contextProjection()
      assert.match(projection.text, /COMPONENT-RUNTIME-NEW/u)
      assert.doesNotMatch(projection.text, /COMPONENT-RUNTIME-OLD|COMPONENT-USER/u)
      evidence.runtimeRevision = projection.revision
    })

    const documents = graph.documents.forWorkspace(workspace)
    const activeDocument = await check('document create/update/search', async () => {
      const created = await documents.mutate({ action: 'create', title: 'Component document', description: 'Initial component document.', content: '# Component\n\nDOC-OLD.', sourcePaths: ['component-source.md'] })
      const updated = await documents.mutate({ action: 'update', id: created.document.id, title: 'Component document', description: 'Updated component document.', content: '# Component\n\nDOC-NEW searchable sentinel.' })
      const searched = await documents.search('DOC-NEW')
      assert.equal(searched.results[0]?.id, created.document.id)
      assert.equal(updated.document.revision, 2)
      return updated.document
    })

    await check('document archive and cold search boundary', async () => {
      const archived = await documents.archive(activeDocument.id, activeDocument.revision, { summary: 'Component archive index is durable.', memoryBodyIds: ['component-placeholder'] })
      assert.equal(archived.document.status, 'archived')
      assert.equal((await documents.search('DOC-NEW')).results.length, 0)
      assert.equal((await documents.search('DOC-NEW', { includeArchived: true })).results[0]?.id, activeDocument.id)
    })

    const targetBody = await check('Memory Space create and metadata update', async () => {
      const body = await graph.service.createBody({ name: 'Component Target', description: 'Target for component merge and recall.', providerId: 'mnemon-native', active: true })
      const updated = graph.service.updateBody(body.id, { description: 'Updated target for component merge and recall.' })
      assert.equal(updated.description, 'Updated target for component merge and recall.')
      return updated
    })
    const sourceBody = await graph.service.createBody({ name: 'Component Source', description: 'Source with linked component evidence.', providerId: 'mnemon-native', active: true })

    const sourceIds = await check('remember, recall, link, and related traversal', async () => {
      const first = await graph.service.remember({ content: 'COMPONENT-ALPHA caused COMPONENT-BETA during the rehearsal.', category: 'fact', importance: 5, entities: ['COMPONENT-ALPHA', 'COMPONENT-BETA'], memoryBodyId: sourceBody.id })
      const second = await graph.service.remember({ content: 'COMPONENT-BETA required the rollback checklist.', category: 'decision', importance: 4, entities: ['COMPONENT-BETA'], memoryBodyId: sourceBody.id })
      const firstId = nestedId(first)
      const secondId = nestedId(second)
      assert.ok(firstId)
      assert.ok(secondId)
      const recalled = await graph.service.search({ query: 'COMPONENT-ALPHA rehearsal', mode: 'smart', limit: 5, memoryBodyIds: [sourceBody.id] })
      assert.ok(recalled.results.some(item => item.id === firstId))
      await graph.service.link(firstId, secondId, 'causal', 0.9, 'Component causal test.', undefined, sourceBody.id)
      const related = await graph.service.related(firstId, 2, 'causal', undefined, sourceBody.id)
      assert.ok(related.some(item => item.id === secondId))
      return { firstId, secondId }
    })

    await check('forget excludes soft-deleted evidence', async () => {
      await graph.service.forget(sourceIds.secondId, undefined, sourceBody.id)
      const result = await graph.service.search({ query: 'rollback checklist', mode: 'basic', limit: 10, memoryBodyIds: [sourceBody.id] })
      assert.ok(result.results.every(item => item.id !== sourceIds.secondId))
    })

    await check('Memory Space merge and source deactivation', async () => {
      const merged = await graph.service.mergeBodies(targetBody.id, [sourceBody.id], true)
      assert.ok(typeof merged === 'object' && merged !== null)
      assert.equal(graph.service.memoryBodies.get(sourceBody.id).active, false)
      const targetRecall = await graph.service.search({ query: 'COMPONENT-ALPHA', mode: 'basic', limit: 10, memoryBodyIds: [targetBody.id] })
      assert.ok(targetRecall.results.some(item => item.content.includes('COMPONENT-ALPHA')))
    })

    await check('status and Memory Space directory', async () => {
      const status = await graph.service.status()
      const directory = await graph.service.bodies()
      assert.equal(status.healthy, true)
      assert.ok(directory.items.some(item => item.id === targetBody.id))
      evidence.status = { healthy: status.healthy, activeStores: status.dshActiveStores, totalInsights: status.stats?.totalInsights }
    })

    await check('TurnView pin, receipt isolation, and next-turn publication', async () => {
      const scope = { storage: 'custom', workspaceId: workspace, sessionId: 'component-session', agentId: 'component-agent' }
      const firstTurn = await graph.memoryViews.beginTurn('component-session:1', scope)
      const firstWake = graph.memoryViews.wake(firstTurn.viewId)
      await graph.runtimeMemory.mutate({ action: 'add', target: 'memory', content: 'COMPONENT-NEXT-VIEW receipt sentinel.', importance: 'normal' })
      assert.ok(graph.memoryViews.pendingReceiptCount() > 0)
      assert.deepEqual(graph.memoryViews.wake(firstTurn.viewId), firstWake)
      assert.equal((await graph.memoryViews.beginTurn('component-session:1', scope)).viewId, firstTurn.viewId)
      graph.memoryViews.endTurn('component-session:1')
      const secondTurn = await graph.memoryViews.beginTurn('component-session:2', scope)
      const secondWake = graph.memoryViews.wake(secondTurn.viewId)
      assert.notEqual(secondTurn.viewId, firstTurn.viewId)
      assert.match(secondWake.text, /COMPONENT-NEXT-VIEW/u)
      assert.equal(graph.memoryViews.pendingReceiptCount(), 0)
      evidence.turnViews = { firstViewId: firstTurn.viewId, secondViewId: secondTurn.viewId, firstWakeCharacters: firstWake.text.length, secondWakeCharacters: secondWake.text.length }
      graph.memoryViews.endTurn('component-session:2')
    })

    await check('runtime capacity rejects overflow before mutation', async () => {
      const before = graph.runtimeMemory.snapshot().revision
      await assert.rejects(
        graph.runtimeMemory.mutate({ action: 'add', target: 'user', content: `COMPONENT-OVERSIZE ${'X'.repeat(4_100)}`, importance: 'normal' }),
        /capacity/u,
      )
      assert.equal(graph.runtimeMemory.snapshot().revision, before)
    })
  } finally {
    graph.dispose()
    await rm(temporaryRoot, { recursive: true, force: true })
  }

  const report = {
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    packageRoot: options.packageRoot,
    checks,
    evidence,
    totals: { passed: checks.filter(check => check.status === 'passed').length, failed: checks.filter(check => check.status === 'failed').length },
  }
  await mkdir(dirname(options.output), { recursive: true })
  await writeFile(options.output, `${JSON.stringify(report, null, 2)}\n`)
  process.stdout.write(`${options.output}\n`)
}

await main()
