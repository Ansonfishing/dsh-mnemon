#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import { createServer } from 'node:http'
import { existsSync } from 'node:fs'
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import {
  autonomousRecallScenario,
  capacityMaintenanceScenario,
  contextOnlyScenario,
  deterministicScenario,
  documents,
  idleReviewScenario,
  memorySpaces,
  realConversationScenario,
  recallMatrixScenario,
  runtimeEntries,
  runtimeMutationScenario,
  singleRecallFaultWordingScenario,
  singleRecallScenario,
  steadyStateScenario,
} from './fixtures.mjs'

const harnessRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const runnerPluginRoot = join(dirname(fileURLToPath(import.meta.url)), 'runner-plugin')
const dshBin = join(harnessRoot, 'node_modules', '@deepseek-ai', 'dsh', 'lib', 'bin.js')
const defaultMnemonBinary = '/private/tmp/dsh-mnemon-v03-eval-mnemon'
const defaultCredentialFile = resolve(process.env.DSH_HOME ?? join(process.env.HOME ?? '', '.dsh'), '.credentials.yaml')

function parseArguments(argv) {
  const options = {
    provider: 'mock',
    scenario: 'deterministic',
    packageRoot: harnessRoot,
    output: resolve(harnessRoot, 'evaluation-results', 'v0.3', new Date().toISOString().replaceAll(/[:.]/gu, '-')),
    mnemonBinary: defaultMnemonBinary,
    credentialFile: defaultCredentialFile,
    toolSurface: 'memory-only',
    idleReviewMs: 600_000,
    corpus: 'realistic',
    mnemon: 'on',
    routingGuidance: 'on',
    recallMode: 'guided',
    writebackMode: 'guided',
    executionTimeoutMs: undefined,
    maxTokens: undefined,
  }
  for (let index = 0; index < argv.length; index += 1) {
    const name = argv[index]
    const value = argv[index + 1]
    if (name === '--provider' || name === '--scenario' || name === '--package-root' || name === '--output' || name === '--mnemon-binary' || name === '--credential-file' || name === '--tool-surface' || name === '--idle-review-ms' || name === '--execution-timeout-ms' || name === '--max-tokens' || name === '--corpus' || name === '--mnemon' || name === '--routing-guidance' || name === '--recall-mode' || name === '--writeback-mode') {
      if (value === undefined) throw new Error(`${name} requires a value`)
      const key = {
        '--package-root': 'packageRoot',
        '--mnemon-binary': 'mnemonBinary',
        '--credential-file': 'credentialFile',
        '--tool-surface': 'toolSurface',
        '--idle-review-ms': 'idleReviewMs',
        '--execution-timeout-ms': 'executionTimeoutMs',
        '--max-tokens': 'maxTokens',
        '--routing-guidance': 'routingGuidance',
        '--recall-mode': 'recallMode',
        '--writeback-mode': 'writebackMode',
      }[name] ?? name.slice(2)
      options[key] = key === 'idleReviewMs' || key === 'executionTimeoutMs' || key === 'maxTokens' ? Number(value) : value
      index += 1
      continue
    }
    throw new Error(`unknown argument: ${name}`)
  }
  if (!['mock', 'real'].includes(options.provider)) throw new Error('--provider must be mock or real')
  if (!['deterministic', 'real-conversation', 'idle-review', 'context-only', 'autonomous-recall', 'single-recall', 'single-recall-fault', 'capacity-maintenance', 'steady-state', 'recall-matrix', 'runtime-mutations'].includes(options.scenario)) throw new Error('--scenario is unsupported')
  if (!['memory-only', 'full'].includes(options.toolSurface)) throw new Error('--tool-surface must be memory-only or full')
  if (!['empty', 'realistic', 'max-runtime', 'capacity', 'scale'].includes(options.corpus)) throw new Error('--corpus is unsupported')
  if (!['on', 'off'].includes(options.mnemon)) throw new Error('--mnemon must be on or off')
  if (!['on', 'off'].includes(options.routingGuidance)) throw new Error('--routing-guidance must be on or off')
  if (!['guided', 'off'].includes(options.recallMode)) throw new Error('--recall-mode must be guided or off')
  if (!['guided', 'off'].includes(options.writebackMode)) throw new Error('--writeback-mode must be guided or off')
  if (options.mnemon === 'off' && (options.scenario !== 'context-only' || options.corpus !== 'empty')) throw new Error('--mnemon off requires --scenario context-only --corpus empty')
  if (!Number.isInteger(options.idleReviewMs) || options.idleReviewMs < 5_000 || options.idleReviewMs > 600_000) throw new Error('--idle-review-ms must be within 5000..600000')
  if (options.executionTimeoutMs !== undefined && (!Number.isInteger(options.executionTimeoutMs) || options.executionTimeoutMs < 60_000 || options.executionTimeoutMs > 900_000)) throw new Error('--execution-timeout-ms must be within 60000..900000')
  if (options.maxTokens !== undefined && (!Number.isInteger(options.maxTokens) || options.maxTokens < 64 || options.maxTokens > 32_768)) throw new Error('--max-tokens must be within 64..32768')
  options.packageRoot = resolve(options.packageRoot)
  options.output = resolve(options.output)
  options.mnemonBinary = resolve(options.mnemonBinary)
  options.credentialFile = resolve(options.credentialFile)
  return options
}

function run(command, args, { cwd = harnessRoot, env = process.env, timeoutMs = 120_000 } = {}) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(command, args, { cwd, env, shell: false, stdio: ['ignore', 'pipe', 'pipe'] })
    let stdout = ''
    let stderr = ''
    let timedOut = false
    let forceTimer
    child.stdout.setEncoding('utf8').on('data', chunk => { stdout += chunk })
    child.stderr.setEncoding('utf8').on('data', chunk => { stderr += chunk })
    const timeout = setTimeout(() => {
      timedOut = true
      child.kill('SIGTERM')
      forceTimer = setTimeout(() => child.kill('SIGKILL'), 5_000)
    }, timeoutMs)
    child.once('error', error => {
      clearTimeout(timeout)
      clearTimeout(forceTimer)
      reject(error)
    })
    child.once('exit', (code, signal) => {
      clearTimeout(timeout)
      clearTimeout(forceTimer)
      resolveRun({ code, signal, stdout, stderr, timedOut })
    })
  })
}

function assertSuccess(label, result) {
  if (result.code === 0 && !result.timedOut) return
  throw new Error([`${label} failed with code ${String(result.code)}${result.signal === null ? '' : ` (${result.signal})`}${result.timedOut ? ' after timeout' : ''}`, result.stdout.trim(), result.stderr.trim()].filter(Boolean).join('\n'))
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function memoryId(value) {
  if (typeof value !== 'object' || value === null) return undefined
  for (const key of ['id', 'insightId', 'memoryId']) {
    const candidate = value[key]
    if (typeof candidate === 'string' && candidate.trim() !== '') return candidate.trim()
  }
  for (const child of Object.values(value)) {
    const candidate = memoryId(child)
    if (candidate !== undefined) return candidate
  }
  return undefined
}

function scaledDocuments() {
  return Array.from({ length: 80 }, (_, index) => index < documents.length ? documents[index] : {
    title: `Scale document ${String(index + 1).padStart(3, '0')}`,
    description: 'Synthetic catalog-scale record whose title and body must stay out of Wake.',
    sourcePaths: [`scale/document-${index + 1}.md`],
    content: `# Scale document ${index + 1}\n\nHidden catalog sentinel DOC-SCALE-${index + 1}.`,
  })
}

function scaledSpaces() {
  return Array.from({ length: 80 }, (_, index) => index < memorySpaces.length ? memorySpaces[index] : {
    key: `scale-${index + 1}`,
    name: `Scale Space ${String(index + 1).padStart(3, '0')}`,
    description: 'Synthetic catalog-scale Memory Space whose metadata must stay Host-only.',
    memories: [],
  })
}

function capacityRuntimeEntry(label, marker) {
  const prefix = `${label}: retained migration source ${marker}; `
  return { target: 'memory', importance: 'normal', content: `${prefix}${marker.repeat(3_375 - prefix.length)}` }
}

function runtimeProjection(graph) {
  if (typeof graph.runtimeMemory.contextProjection === 'function') return graph.runtimeMemory.contextProjection()
  const snapshot = graph.runtimeMemory.snapshot()
  return { revision: snapshot.revision, text: graph.runtimeMemory.contextText() }
}

async function publishedProjection(graph, workspaceRoot, sessionId) {
  if (graph.memoryViews !== undefined) {
    const view = await graph.memoryViews.publish({ storage: 'custom', workspaceId: workspaceRoot, sessionId })
    const wake = graph.memoryViews.wake(view.id)
    return {
      kind: 'turn-view',
      id: view.id,
      digest: view.digest,
      sources: view.sources.map(source => ({ layerId: source.layerId, mode: source.mode, revision: source.revision, digest: source.digest })),
      wakeCharacters: wake.text.length,
      wakeHash: sha256(wake.text),
      wake: wake.text,
    }
  }
  const projection = runtimeProjection(graph)
  return {
    kind: 'legacy-runtime',
    digest: sha256(projection.text),
    sources: [{ layerId: 'runtime', mode: 'eager', revision: projection.revision, digest: sha256(projection.text) }],
    wakeCharacters: projection.text.length,
    wakeHash: sha256(projection.text),
    wake: projection.text,
  }
}

async function seedData(packageRoot, dataDir, workspaceRoot, mnemonBinary, corpus) {
  const modulePath = `${pathToFileURL(join(packageRoot, 'lib', 'index.js')).href}?eval=${randomUUID()}`
  const { createRuntimeGraph, resolveConfig } = await import(modulePath)
  const config = resolveConfig({
    storageScope: 'custom',
    dataDir,
    cliPath: mnemonBinary,
    writeEnabled: true,
    recallMode: 'guided',
    writebackMode: 'guided',
  })
  const graph = createRuntimeGraph(config, workspaceRoot)
  const seed = { runtime: [], documents: [], memorySpaces: [] }
  try {
    const selectedRuntime = corpus === 'empty' ? [] : corpus === 'max-runtime' ? [
      { target: 'user', importance: 'normal', content: `MAX-RUNTIME-USER ${'U'.repeat(3_700)}` },
      { target: 'memory', importance: 'normal', content: `MAX-RUNTIME-MEMORY-A ${'A'.repeat(7_700)}` },
      { target: 'memory', importance: 'normal', content: `MAX-RUNTIME-MEMORY-B ${'B'.repeat(2_300)}` },
    ] : corpus === 'capacity' ? [
      capacityRuntimeEntry('CAPACITY-SOURCE-A', 'A'),
      capacityRuntimeEntry('CAPACITY-SOURCE-B', 'B'),
      capacityRuntimeEntry('CAPACITY-SOURCE-C', 'C'),
    ] : runtimeEntries
    const selectedDocuments = corpus === 'empty' || corpus === 'max-runtime' ? [] : corpus === 'scale' ? scaledDocuments() : documents
    const selectedSpaces = corpus === 'empty' || corpus === 'max-runtime' ? [] : corpus === 'scale' ? scaledSpaces() : memorySpaces
    for (const entry of selectedRuntime) {
      const result = await graph.runtimeMemory.mutate({ action: 'add', ...entry })
      seed.runtime.push({ ...entry, action: result.action })
    }
    const documentController = graph.documents.forWorkspace(workspaceRoot)
    for (const document of selectedDocuments) {
      const result = await documentController.mutate({ action: 'create', ...document })
      seed.documents.push({ title: document.title, id: result.id, revision: result.revision, contentHash: sha256(document.content) })
    }
    for (const space of selectedSpaces) {
      const body = await graph.service.createBody({
        name: space.name,
        description: space.description,
        providerId: 'mnemon-native',
        active: true,
      })
      const remembered = []
      for (const [content, category, importance, tags, entities] of space.memories) {
        const result = await graph.service.remember({
          content,
          category,
          importance,
          tags,
          entities,
          source: 'external',
          memoryBodyId: body.id,
        })
        remembered.push({ id: memoryId(result), contentHash: sha256(content), category, importance })
      }
      seed.memorySpaces.push({ key: space.key, id: body.id, name: body.name, count: remembered.length, memories: remembered })
    }
    seed.initialView = await publishedProjection(graph, workspaceRoot, 'seed-check')
    return seed
  } finally {
    graph.dispose?.()
  }
}

async function inspectData(packageRoot, dataDir, workspaceRoot, mnemonBinary) {
  const modulePath = `${pathToFileURL(join(packageRoot, 'lib', 'index.js')).href}?inspect=${randomUUID()}`
  const { createRuntimeGraph, resolveConfig } = await import(modulePath)
  const graph = createRuntimeGraph(resolveConfig({ storageScope: 'custom', dataDir, cliPath: mnemonBinary }), workspaceRoot)
  try {
    const runtime = graph.runtimeMemory.snapshot()
    const documentSnapshot = graph.documents.forWorkspace(workspaceRoot).snapshot()
    const bodies = graph.service.memoryBodies.list()
    const projection = await publishedProjection(graph, workspaceRoot, 'final-state')
    const capacityArchiveEvidence = []
    for (const marker of ['CAPACITY-SOURCE-A', 'CAPACITY-SOURCE-B', 'CAPACITY-SOURCE-C']) {
      const recalled = await graph.service.search({ query: marker, mode: 'basic', limit: 10 })
      capacityArchiveEvidence.push({
        marker,
        matches: recalled.results.map(result => ({
          id: result.id,
          memoryBodyId: result.memoryBodyId,
          contentHash: sha256(result.content),
          contentCharacters: result.content.length,
          containsMarker: result.content.includes(marker),
        })),
      })
    }
    return {
      runtime: {
        revision: runtime.revision,
        entries: runtime.entries.map(entry => ({ target: entry.target, importance: entry.importance, content: entry.content })),
        targets: runtime.targets,
      },
      documents: {
        revision: documentSnapshot.revision,
        items: documentSnapshot.documents.map(document => ({ id: document.id, title: document.title, status: document.status, contentHash: document.contentHash })),
      },
      memorySpaces: bodies.map(body => ({ id: body.id, name: body.name, description: body.description, active: body.active, providerId: body.provider.id })),
      capacityArchiveEvidence,
      finalView: {
        kind: projection.kind,
        ...(projection.id === undefined ? {} : { id: projection.id }),
        digest: projection.digest,
        wakeCharacters: projection.wakeCharacters,
        wakeHash: projection.wakeHash,
      },
    }
  } finally {
    graph.dispose?.()
  }
}

function scenarioFixture(name, workspaceRoot) {
  const selected = {
    deterministic: deterministicScenario,
    'real-conversation': realConversationScenario,
    'idle-review': idleReviewScenario,
    'context-only': contextOnlyScenario,
    'autonomous-recall': autonomousRecallScenario,
    'single-recall': singleRecallScenario,
    'single-recall-fault': singleRecallFaultWordingScenario,
    'capacity-maintenance': capacityMaintenanceScenario,
    'steady-state': steadyStateScenario,
    'recall-matrix': recallMatrixScenario,
    'runtime-mutations': runtimeMutationScenario,
  }[name]
  if (selected === undefined) throw new Error(`evaluation scenario is unavailable: ${name}`)
  return { ...structuredClone(selected), workspaceRoot, sessionId: `mnemon-eval-${name}-${randomUUID()}` }
}

function profilePatch(options, dataDir) {
  const rows = options.mnemon === 'off' ? [] : [
    `- id: mnemon`,
    `  config:`,
    `    storageScope: custom`,
    `    dataDir: ${JSON.stringify(dataDir)}`,
    `    cliPath: ${JSON.stringify(options.mnemonBinary)}`,
    `    routingGuidance: ${options.routingGuidance === 'on'}`,
    `    displayMode: sidebar`,
    `    lifecycleEnabled: true`,
    `    recallMode: ${options.recallMode}`,
    `    writebackMode: ${options.writebackMode}`,
    `    idleReviewMs: ${options.idleReviewMs}`,
    `    tabEnabled: true`,
    `    writeEnabled: true`,
    `    remoteAccess: read-only`,
    `    timeoutMs: 30000`,
    `    defaultRecallLimit: 10`,
  ]
  if (options.toolSurface === 'memory-only') {
    rows.push(
      '- id: subprocess', '  disabled: true',
      '- id: bash-sandbox', '  disabled: true',
      '- id: pwsh-sandbox', '  disabled: true',
      '- id: tool-bash', '  disabled: true',
      '- id: tool-pwsh', '  disabled: true',
      '- id: permission', '  disabled: true',
      '- id: tool-fs-search', '  disabled: true',
    )
  }
  return `${rows.join('\n')}\n`
}

function textContent(content) {
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''
  return content.map(block => typeof block === 'string' ? block : typeof block?.text === 'string' ? block.text : '').join('\n')
}

function currentMarker(body) {
  const messages = Array.isArray(body.messages) ? body.messages : []
  for (const message of messages.toReversed()) {
    const match = textContent(message.content).match(/\[EVAL:[^\]]+\]/u)
    if (match !== null) return match[0]
  }
  return '[EVAL:unknown]'
}

function toolResultAfterMarker(body) {
  const messages = Array.isArray(body.messages) ? body.messages : []
  let markerIndex = -1
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (/\[EVAL:[^\]]+\]/u.test(textContent(messages[index]?.content))) {
      markerIndex = index
      break
    }
  }
  return messages.slice(markerIndex + 1).some(message => message?.role === 'tool')
}

function mockDecision(body) {
  const marker = currentMarker(body)
  const completedTool = toolResultAfterMarker(body)
  if (completedTool) return { kind: 'text', text: `DONE ${marker}` }
  const calls = {
    '[EVAL:MOCK:status]': ['mnemon_status', {}],
    '[EVAL:MOCK:document]': ['mnemon_document_search', { query: 'ORCHID-47 schema digest', limit: 3 }],
    '[EVAL:MOCK:recall]': ['mnemon_recall', { query: 'Redis Streams ORCHID-31 17 entries', mode: 'smart', limit: 5 }],
    '[EVAL:MOCK:write]': ['mnemon_runtime_memory', { action: 'add', target: 'memory', content: 'Deterministic receipt sentinel ECHO-731 persists to the next TurnView.', importance: 'normal' }],
  }
  const call = calls[marker]
  if (call !== undefined) return { kind: 'tool', name: call[0], arguments: call[1] }
  if (marker === '[EVAL:MOCK:runtime]') return { kind: 'text', text: '12% at Tuesday 21:30 Asia/Shanghai.' }
  if (marker === '[EVAL:MOCK:receipt]') return { kind: 'text', text: 'ECHO-731' }
  if (marker === '[EVAL:context-only]') return { kind: 'text', text: 'OK' }
  return { kind: 'text', text: `MOCK_UNHANDLED ${marker}` }
}

function mockSse(body, requestIndex) {
  const decision = mockDecision(body)
  const id = `chatcmpl-mnemon-eval-${requestIndex}`
  const chunks = []
  if (decision.kind === 'tool') {
    chunks.push({
      id,
      choices: [{
        index: 0,
        delta: {
          role: 'assistant',
          tool_calls: [{ index: 0, id: `call-${requestIndex}`, type: 'function', function: { name: decision.name, arguments: JSON.stringify(decision.arguments) } }],
        },
        finish_reason: null,
      }],
    })
    chunks.push({ id, choices: [{ index: 0, delta: {}, finish_reason: 'tool_calls' }] })
  } else {
    chunks.push({ id, choices: [{ index: 0, delta: { role: 'assistant', content: decision.text }, finish_reason: null }] })
    chunks.push({ id, choices: [{ index: 0, delta: {}, finish_reason: 'stop' }] })
  }
  const promptTokens = Math.ceil(JSON.stringify(body).length / 4)
  const completionTokens = Math.ceil(JSON.stringify(decision).length / 4)
  chunks.push({ id, choices: [], usage: { prompt_tokens: promptTokens, completion_tokens: completionTokens, total_tokens: promptTokens + completionTokens } })
  return `${chunks.map(chunk => `data: ${JSON.stringify(chunk)}\n\n`).join('')}data: [DONE]\n\n`
}

function responseUsage(text) {
  for (const line of text.split(/\r?\n/u).toReversed()) {
    if (!line.startsWith('data: ') || line === 'data: [DONE]') continue
    try {
      const value = JSON.parse(line.slice(6))
      if (value?.usage !== undefined) return value.usage
    } catch {}
  }
  return undefined
}

function responseFinishReasons(text) {
  const reasons = []
  for (const line of text.split(/\r?\n/u)) {
    if (!line.startsWith('data: ') || line === 'data: [DONE]') continue
    try {
      const value = JSON.parse(line.slice(6))
      for (const choice of value?.choices ?? []) {
        if (typeof choice?.finish_reason === 'string' && !reasons.includes(choice.finish_reason)) reasons.push(choice.finish_reason)
      }
    } catch {}
  }
  return reasons
}

function responseToolCalls(text) {
  const calls = new Map()
  for (const line of text.split(/\r?\n/u)) {
    if (!line.startsWith('data: ') || line === 'data: [DONE]') continue
    try {
      const value = JSON.parse(line.slice(6))
      for (const choice of value?.choices ?? []) {
        for (const call of choice?.delta?.tool_calls ?? []) {
          // Providers commonly send the id/name in the first delta and only
          // the numeric index plus argument fragments afterwards. Key by the
          // stable stream index so one logical tool call is not split in two.
          const key = Number.isInteger(call.index)
            ? `index:${call.index}`
            : typeof call.id === 'string'
              ? `id:${call.id}`
              : `unknown:${calls.size}`
          const current = calls.get(key) ?? { id: call.id, index: call.index, name: '', arguments: '' }
          if (typeof call.id === 'string') current.id = call.id
          if (typeof call.function?.name === 'string') current.name += call.function.name
          if (typeof call.function?.arguments === 'string') current.arguments += call.function.arguments
          calls.set(key, current)
        }
      }
    } catch {}
  }
  return [...calls.values()].map(call => ({
    ...call,
    parsedArguments: (() => {
      try { return JSON.parse(call.arguments) } catch { return undefined }
    })(),
  }))
}

function proxyHeaders(headers) {
  const forwarded = {}
  for (const name of ['authorization', 'content-type', 'user-agent', 'x-deepseek-harness-user-id', 'x-deepseek-harness-session-id']) {
    const value = headers[name]
    if (typeof value === 'string') forwarded[name] = value
  }
  return forwarded
}

async function startCaptureServer(provider) {
  const requests = []
  const server = createServer(async (request, response) => {
    const index = requests.length + 1
    const startedAt = new Date().toISOString()
    let rawBody = ''
    request.setEncoding('utf8')
    for await (const chunk of request) rawBody += chunk
    let body
    try {
      body = rawBody === '' ? {} : JSON.parse(rawBody)
    } catch (error) {
      response.writeHead(400, { 'content-type': 'application/json' })
      response.end(JSON.stringify({ error: { message: `invalid JSON: ${error instanceof Error ? error.message : String(error)}` } }))
      return
    }
    const record = {
      index,
      startedAt,
      method: request.method,
      path: request.url,
      sessionId: typeof request.headers['x-deepseek-harness-session-id'] === 'string' ? request.headers['x-deepseek-harness-session-id'] : undefined,
      marker: currentMarker(body),
      body,
    }
    requests.push(record)
    try {
      if (provider === 'mock') {
        const payload = mockSse(body, index)
        response.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' })
        response.end(payload)
        Object.assign(record, { finishedAt: new Date().toISOString(), status: 200, headersLatencyMs: 0, ttftMs: 0, usage: responseUsage(payload), finishReasons: responseFinishReasons(payload), responseToolCalls: responseToolCalls(payload), usageKind: 'mock-character-estimate' })
        return
      }
      const upstream = new URL(request.url ?? '/', 'https://api.deepseek.com')
      const upstreamResponse = await fetch(upstream, {
        method: request.method,
        headers: proxyHeaders(request.headers),
        body: request.method === 'GET' || request.method === 'HEAD' ? undefined : rawBody,
      })
      const headersAt = new Date().toISOString()
      response.writeHead(upstreamResponse.status, {
        'content-type': upstreamResponse.headers.get('content-type') ?? 'application/octet-stream',
        'cache-control': upstreamResponse.headers.get('cache-control') ?? 'no-cache',
      })
      response.flushHeaders()
      const decoder = new TextDecoder()
      let responseBody = ''
      let firstByteAt
      if (upstreamResponse.body !== null) {
        const reader = upstreamResponse.body.getReader()
        while (true) {
          const chunk = await reader.read()
          if (chunk.done) break
          if (firstByteAt === undefined) firstByteAt = new Date().toISOString()
          responseBody += decoder.decode(chunk.value, { stream: true })
          response.write(chunk.value)
        }
        responseBody += decoder.decode()
      }
      response.end()
      const finishedAt = new Date().toISOString()
      Object.assign(record, {
        headersAt,
        firstByteAt,
        finishedAt,
        status: upstreamResponse.status,
        headersLatencyMs: Math.max(0, Date.parse(headersAt) - Date.parse(startedAt)),
        ttftMs: firstByteAt === undefined ? undefined : Math.max(0, Date.parse(firstByteAt) - Date.parse(startedAt)),
        usage: responseUsage(responseBody),
        finishReasons: responseFinishReasons(responseBody),
        responseToolCalls: responseToolCalls(responseBody),
        usageKind: 'provider-reported',
        responseBytes: Buffer.byteLength(responseBody),
      })
      if (!upstreamResponse.ok) record.error = responseBody.slice(0, 2_000)
    } catch (error) {
      record.finishedAt = new Date().toISOString()
      record.error = error instanceof Error ? error.message : String(error)
      response.writeHead(502, { 'content-type': 'application/json' })
      response.end(JSON.stringify({ error: { message: record.error } }))
    }
  })
  await new Promise((resolveListen, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolveListen)
  })
  const address = server.address()
  if (address === null || typeof address === 'string') throw new Error('capture server did not expose a TCP port')
  return {
    baseURL: `http://127.0.0.1:${address.port}`,
    requests,
    close: () => new Promise(resolveClose => server.close(resolveClose)),
  }
}

async function gitMetadata(packageRoot) {
  const [commit, branch, status] = await Promise.all([
    run('git', ['rev-parse', 'HEAD'], { cwd: packageRoot }),
    run('git', ['branch', '--show-current'], { cwd: packageRoot }),
    run('git', ['status', '--short'], { cwd: packageRoot }),
  ])
  return { commit: commit.stdout.trim(), branch: branch.stdout.trim(), status: status.stdout.trim() }
}

async function main() {
  const options = parseArguments(process.argv.slice(2))
  if (!existsSync(dshBin)) throw new Error(`DSH binary is unavailable: ${dshBin}`)
  if (!existsSync(join(options.packageRoot, 'lib', 'index.js'))) throw new Error(`build output is unavailable: ${options.packageRoot}/lib/index.js`)
  if (!existsSync(options.mnemonBinary)) throw new Error(`Mnemon binary is unavailable: ${options.mnemonBinary}`)
  if (options.provider === 'real' && !existsSync(options.credentialFile)) throw new Error(`DSH credential file is unavailable: ${options.credentialFile}`)

  await mkdir(options.output, { recursive: true })
  const temporaryRoot = await mkdtemp(join(tmpdir(), 'dsh-mnemon-v03-eval-'))
  const dshHome = join(temporaryRoot, 'dsh-home')
  const dataDir = join(temporaryRoot, 'mnemon-data')
  const workspaceRoot = join(temporaryRoot, 'workspace')
  const scenarioPath = join(temporaryRoot, 'scenario.json')
  const sessionResultPath = join(options.output, 'session.json')
  await Promise.all([mkdir(dshHome), mkdir(dataDir), mkdir(workspaceRoot)])
  let capture
  try {
    if (options.provider === 'real') await copyFile(options.credentialFile, join(dshHome, '.credentials.yaml'))
    const seed = options.mnemon === 'off'
      ? { runtime: [], documents: [], memorySpaces: [], mnemonDisabled: true }
      : await seedData(options.packageRoot, dataDir, workspaceRoot, options.mnemonBinary, options.corpus)
    await writeFile(join(options.output, 'seed.json'), `${JSON.stringify(seed, null, 2)}\n`)
    const scenario = scenarioFixture(options.scenario, workspaceRoot)
    if (options.maxTokens !== undefined) scenario.maxTokens = options.maxTokens
    await writeFile(scenarioPath, `${JSON.stringify(scenario, null, 2)}\n`)
    await writeFile(join(options.output, 'scenario.json'), `${JSON.stringify({ ...scenario, workspaceRoot: '<isolated-workspace>' }, null, 2)}\n`)

    capture = await startCaptureServer(options.provider)
    const env = {
      ...process.env,
      DSH_HOME: dshHome,
      DSH_TELEMETRY_DISABLED: '1',
      DEEPSEEK_BASE_URL: capture.baseURL,
      MNEMON_DATA_DIR: dataDir,
      MNEMON_EVAL_SCENARIO_PATH: scenarioPath,
      MNEMON_EVAL_RESULT_PATH: sessionResultPath,
      ...(options.provider === 'mock' ? { DEEPSEEK_API_KEY: 'mnemon-evaluation-mock-key' } : {}),
    }

    if (options.mnemon === 'on') {
      const installMnemon = await run(process.execPath, [dshBin, 'plugin', '--profile', 'headless', 'add', `link:${options.packageRoot}`], { env })
      assertSuccess('installing dsh-mnemon', installMnemon)
    }
    const installRunner = await run(process.execPath, [dshBin, 'plugin', '--profile', 'headless', 'add', `link:${runnerPluginRoot}`], { env })
    assertSuccess('installing evaluation runner', installRunner)
    const patch = profilePatch(options, dataDir)
    const profilePatchPath = join(dshHome, 'profiles', 'headless', 'cordis.patch.yml')
    await writeFile(profilePatchPath, patch)
    await writeFile(join(options.output, 'profile.patch.yml'), patch.replaceAll(dataDir, '<isolated-data-dir>').replaceAll(options.mnemonBinary, '<mnemon-binary>'))

    const execution = await run(process.execPath, [dshBin, '--profile', 'headless', 'mnemon-evaluation'], {
      cwd: workspaceRoot,
      env,
      timeoutMs: options.executionTimeoutMs ?? (options.scenario === 'idle-review' ? 180_000 : 300_000),
    })
    await Promise.all([
      writeFile(join(options.output, 'dsh.stdout.log'), execution.stdout),
      writeFile(join(options.output, 'dsh.stderr.log'), execution.stderr),
      writeFile(join(options.output, 'requests.json'), `${JSON.stringify(capture.requests, null, 2)}\n`),
    ])
    assertSuccess('running evaluation scenario', execution)
    if (options.mnemon === 'on') {
      const finalState = await inspectData(options.packageRoot, dataDir, workspaceRoot, options.mnemonBinary)
      await writeFile(join(options.output, 'final-state.json'), `${JSON.stringify(finalState, null, 2)}\n`)
    }
    const metadata = await gitMetadata(options.packageRoot)
    const manifest = {
      schemaVersion: 1,
      createdAt: new Date().toISOString(),
      provider: options.provider,
      scenario: options.scenario,
      corpus: options.corpus,
      mnemon: options.mnemon,
      routingGuidance: options.routingGuidance,
      recallMode: options.recallMode,
      writebackMode: options.writebackMode,
      toolSurface: options.toolSurface,
      idleReviewMs: options.idleReviewMs,
      executionTimeoutMs: options.executionTimeoutMs ?? (options.scenario === 'idle-review' ? 180_000 : 300_000),
      maxTokens: scenario.maxTokens,
      package: metadata,
      dshVersion: '0.1.1-rc.2',
      mnemonBinary: options.mnemonBinary,
      artifacts: ['scenario.json', 'seed.json', 'profile.patch.yml', 'session.json', 'requests.json', ...(options.mnemon === 'on' ? ['final-state.json'] : []), 'dsh.stdout.log', 'dsh.stderr.log'],
    }
    await writeFile(join(options.output, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
    process.stdout.write(`${options.output}\n`)
  } finally {
    await capture?.close()
    await rm(temporaryRoot, { recursive: true, force: true })
  }
}

await main()
