#!/usr/bin/env node

import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { basename, join, resolve } from 'node:path'

const GUIDED_PREFIX = '[MNEMON]'
const RUNTIME_START = 'MNEMON RUNTIME MEMORY PROTOCOL'
const USER_CONTENTS = 'Contents of USER.md'
const IMPORTANT = '\nIMPORTANT:'
const ROUTED_START = 'MNEMON ROUTES ('
const LEGACY_ROUTED_START = 'MNEMON ROUTED MEMORY SOURCES'
const ROUTED_END = 'END MNEMON ROUTED MEMORY SOURCES'

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function textContent(content) {
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''
  return content.map(block => typeof block === 'string' ? block : typeof block?.text === 'string' ? block.text : '').join('\n')
}

function deepTextContent(value) {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.map(deepTextContent).filter(Boolean).join('\n')
  if (typeof value !== 'object' || value === null) return ''
  if (typeof value.text === 'string') return value.text
  return deepTextContent(value.content)
}

function elapsedMs(startedAt, finishedAt) {
  const started = Date.parse(startedAt)
  const finished = Date.parse(finishedAt)
  return Number.isFinite(started) && Number.isFinite(finished) ? finished - started : undefined
}

function titleRequest(request) {
  return request.body?.messages?.some(message => textContent(message.content).startsWith('Create a concise title for an AI coding-assistant session')) === true
}

function mnemonSlice(context) {
  const start = context.indexOf(RUNTIME_START)
  if (start < 0) return ''
  const legacyStart = context.indexOf(LEGACY_ROUTED_START, start)
  if (legacyStart >= 0) {
    const routedEnd = context.indexOf(ROUTED_END, legacyStart)
    return context.slice(start, routedEnd < 0 ? undefined : routedEnd + ROUTED_END.length)
  }
  const routedStart = context.indexOf(ROUTED_START, start)
  if (routedStart < 0) return context.slice(start)
  const routedEnd = context.indexOf('\n', routedStart)
  return context.slice(start, routedEnd < 0 ? undefined : routedEnd)
}

function splitMnemon(value) {
  if (value === '') return { protocol: '', data: '', routed: '' }
  const dataStart = value.indexOf(USER_CONTENTS)
  const importantStart = value.indexOf(IMPORTANT)
  const compactRoutedStart = value.indexOf(ROUTED_START)
  const legacyRoutedStart = value.indexOf(LEGACY_ROUTED_START)
  const routedStart = compactRoutedStart >= 0 ? compactRoutedStart : legacyRoutedStart
  const dataEnd = importantStart >= 0 ? importantStart : routedStart >= 0 ? routedStart : value.length
  return {
    protocol: dataStart < 0 ? value : value.slice(0, dataStart).trim(),
    data: dataStart < 0 ? '' : value.slice(dataStart, dataEnd).trim(),
    routed: routedStart < 0 ? '' : value.slice(routedStart).trim(),
  }
}

function requestContexts(request) {
  const messages = Array.isArray(request.body?.messages) ? request.body.messages : []
  return messages
    .filter(message => message.role === 'user' && textContent(message.content).startsWith('Current runtime context.'))
    .map(message => textContent(message.content))
}

function requestMetrics(request, rootSessionId, attribution) {
  const messages = Array.isArray(request.body?.messages) ? request.body.messages : []
  const tools = Array.isArray(request.body?.tools) ? request.body.tools : []
  const contexts = requestContexts(request)
  const mnemonContexts = contexts.map(mnemonSlice).filter(Boolean)
  const latest = splitMnemon(mnemonContexts.at(-1) ?? '')
  const system = messages.filter(message => message.role === 'system').map(message => textContent(message.content)).join('\n')
  const reminders = messages.filter(message => message.role === 'user' && textContent(message.content).startsWith(GUIDED_PREFIX)).map(message => textContent(message.content))
  const mnemonTools = tools.filter(tool => String(tool?.function?.name ?? '').startsWith('mnemon_'))
  const otherTools = tools.filter(tool => !String(tool?.function?.name ?? '').startsWith('mnemon_'))
  return {
    index: request.index,
    marker: attribution.marker,
    rawMarker: request.marker,
    markerAttribution: attribution.kind,
    sessionId: request.sessionId,
    agentRole: request.sessionId === rootSessionId ? 'root' : 'child-or-background',
    status: request.status,
    requestCharacters: JSON.stringify(request.body).length,
    messageCharacters: messages.reduce((total, message) => total + textContent(message.content).length, 0),
    toolCharacters: tools.reduce((total, tool) => total + JSON.stringify(tool).length, 0),
    mnemonToolCharacters: mnemonTools.reduce((total, tool) => total + JSON.stringify(tool).length, 0),
    otherToolCharacters: otherTools.reduce((total, tool) => total + JSON.stringify(tool).length, 0),
    toolCount: tools.length,
    mnemonToolCount: mnemonTools.length,
    contextSnapshotCount: contexts.length,
    contextSnapshotCharacters: contexts.reduce((total, context) => total + context.length, 0),
    mnemonSnapshotCharacters: mnemonContexts.reduce((total, context) => total + context.length, 0),
    latestMnemonHash: mnemonContexts.length === 0 ? undefined : sha256(mnemonContexts.at(-1)),
    latestMnemonCharacters: mnemonContexts.at(-1)?.length ?? 0,
    latestProtocolCharacters: latest.protocol.length,
    latestDataCharacters: latest.data.length,
    latestRoutedCharacters: latest.routed.length,
    guidedReminderCount: reminders.length,
    guidedReminderCharacters: reminders.reduce((total, reminder) => total + reminder.length, 0),
    routingGuidancePresent: system.includes('Use memory only when needed.') || system.includes('Use memory only by need.'),
    providerUsage: request.usage,
    usageKind: request.usageKind,
    finishReasons: request.finishReasons ?? [],
    responseToolCalls: request.responseToolCalls ?? [],
    latencyMs: elapsedMs(request.startedAt, request.finishedAt),
    headersLatencyMs: request.headersLatencyMs,
    ttftMs: request.ttftMs,
  }
}

function requestAttribution(request, index, requests, rootSessionId) {
  if (request.marker !== '[EVAL:unknown]') return { marker: request.marker, kind: 'request-body' }
  if (request.sessionId === rootSessionId) return { marker: request.marker, kind: 'unattributed-root' }
  const previousRoot = requests.slice(0, index).findLast(candidate => candidate.sessionId === rootSessionId && !titleRequest(candidate))
  return previousRoot === undefined
    ? { marker: request.marker, kind: 'unattributed-child' }
    : { marker: previousRoot.marker, kind: 'nearest-prior-root' }
}

function sum(values) {
  return values.reduce((total, value) => total + (Number(value) || 0), 0)
}

function cacheHitTokens(request) {
  return request.providerUsage?.prompt_cache_hit_tokens
    ?? request.providerUsage?.prompt_tokens_details?.cached_tokens
    ?? 0
}

function cacheMissTokens(request) {
  return request.providerUsage?.prompt_cache_miss_tokens
    ?? Math.max(0, (request.providerUsage?.prompt_tokens ?? 0) - cacheHitTokens(request))
}

function toolNames(turn) {
  return turn.events
    .filter(event => event.type === 'tool/call' && typeof event.data?.name === 'string')
    .map(event => event.data.name)
}

function parseJson(value) {
  try { return JSON.parse(value) } catch { return undefined }
}

function nestedError(value) {
  if (typeof value !== 'object' || value === null) return false
  if (value.isError === true) return true
  return Object.values(value).some(nestedError)
}

function toolMetrics(turn) {
  const calls = new Map()
  const metrics = []
  for (const event of turn.events) {
    if (event.type === 'tool/call' && typeof event.data?.callId === 'string') {
      calls.set(event.data.callId, event)
      continue
    }
    if (event.type !== 'tool/result') continue
    const callId = event.data?.message?.source?.callId
    if (typeof callId !== 'string') continue
    const call = calls.get(callId)
    const resultText = deepTextContent(event.data?.message?.content)
    const parsedResult = parseJson(resultText)
    const started = Number(call?.time)
    const finished = Number(event.time)
    metrics.push({
      callId,
      name: call?.data?.name ?? 'unknown',
      argumentsCharacters: typeof call?.data?.arguments === 'string' ? call.data.arguments.length : 0,
      resultCharacters: resultText.length,
      durationMs: Number.isFinite(started) && Number.isFinite(finished) ? Math.max(0, finished - started) : undefined,
      isError: nestedError(event.data?.message?.content),
      evidenceCount: Array.isArray(parsedResult?.results) ? parsedResult.results.length : undefined,
    })
  }
  return metrics
}

function expectedAssessment(turn, scenarioTurn) {
  const expected = scenarioTurn?.expected ?? {}
  const tools = toolNames(turn).filter(name => name.startsWith('mnemon_'))
  const expectedTools = expected.memoryTools ?? []
  const missingTools = expectedTools.filter(name => !tools.includes(name))
  const unexpectedTools = expectedTools.length === 0 ? tools : []
  const answer = turn.assistantText.toLocaleLowerCase()
  const missingText = (expected.mustContain ?? []).filter(text => !answer.includes(String(text).toLocaleLowerCase()))
  const missingAnyText = (expected.mustContainAny ?? []).filter(group => !group.some(text => answer.includes(String(text).toLocaleLowerCase())))
  const forbiddenText = (expected.mustNotContain ?? []).filter(text => answer.includes(String(text).toLocaleLowerCase()))
  return {
    passed: missingTools.length === 0 && unexpectedTools.length === 0 && missingText.length === 0 && missingAnyText.length === 0 && forbiddenText.length === 0,
    memoryTools: tools,
    expectedTools,
    missingTools,
    unexpectedTools,
    missingText,
    missingAnyText,
    forbiddenText,
  }
}

function leakage(latestMnemon) {
  return {
    viewId: /\bview-[a-f0-9]{8,}\b/iu.test(latestMnemon),
    generationMetadata: /\b(?:catalog|topology|guard)Generation\b/iu.test(latestMnemon),
    uuid: /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/iu.test(latestMnemon),
    secretLike: /(?:api[_-]?key|bearer\s+[a-z0-9_-]{8,}|projection-secret)/iu.test(latestMnemon),
    bodyNames: /Lantern Architecture Decisions|Lantern Operations and Incidents|Lantern Collaboration History/u.test(latestMnemon),
    documentTitles: /Project Lantern 发布运行手册|ADR-027|ORCHID-47 事故复盘/u.test(latestMnemon),
  }
}

function markdownTable(rows, columns) {
  const header = `| ${columns.map(column => column.label).join(' | ')} |`
  const separator = `| ${columns.map(() => '---').join(' | ')} |`
  const body = rows.map(row => `| ${columns.map(column => String(column.value(row) ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ')).join(' | ')} |`)
  return [header, separator, ...body].join('\n')
}

function summaryMarkdown(analysis, directory) {
  const first = analysis.requests.find(request => request.agentRole === 'root')
  const last = analysis.requests.findLast(request => request.agentRole === 'root')
  const turnTable = markdownTable(analysis.turns, [
    { label: 'Turn', value: row => row.id },
    { label: 'Memory tools', value: row => row.assessment.memoryTools.join(', ') || 'none' },
    { label: 'Check', value: row => row.assessment.passed ? 'pass' : 'FAIL' },
    { label: 'Model calls', value: row => row.requestCount },
    { label: 'Prompt tokens', value: row => row.promptTokens },
    { label: 'Completion tokens', value: row => row.completionTokens },
    { label: 'Wall ms', value: row => row.wallLatencyMs ?? '?' },
    { label: 'Tool result chars', value: row => row.memoryToolResultCharacters },
  ])
  const requestTable = markdownTable(analysis.requests, [
    { label: '#', value: row => row.index },
    { label: 'Marker', value: row => row.marker },
    { label: 'Role', value: row => row.agentRole },
    { label: 'Prompt tokens', value: row => row.providerUsage?.prompt_tokens ?? '?' },
    { label: 'Snapshots', value: row => `${row.contextSnapshotCount}/${row.contextSnapshotCharacters}c` },
    { label: 'Latest Mnemon', value: row => `${row.latestMnemonCharacters}c` },
    { label: 'Mnemon tools', value: row => `${row.mnemonToolCount}/${row.mnemonToolCharacters}c` },
    { label: 'Reminders', value: row => `${row.guidedReminderCount}/${row.guidedReminderCharacters}c` },
    { label: 'TTFT', value: row => row.ttftMs ?? '?' },
  ])
  return `# ${analysis.scenarioId} — evaluation summary

Evidence directory: \`${basename(directory)}\`

## Outcome

- Provider usage: ${analysis.totals.usageKind}; ${analysis.totals.modelCalls} evaluated model calls plus ${analysis.totals.titleCalls} DSH title call(s).
- Provider-reported/recorded tokens: ${analysis.totals.promptTokens} prompt + ${analysis.totals.completionTokens} completion = ${analysis.totals.totalTokens} total.
- Scenario checks: ${analysis.totals.passedTurns}/${analysis.turns.length} passed.
- User-visible turn wall time: ${analysis.totals.turnWallMs} ms; provider request time sums to ${analysis.totals.latencyMs} ms and can overlap.
- Memory tools: ${analysis.totals.memoryToolCalls} calls, ${analysis.totals.memoryToolResultCharacters} result chars, ${analysis.totals.failedMemoryToolCalls} failed results.
- First latest Mnemon payload: ${first?.latestMnemonCharacters ?? 0} chars; protocol ${first?.latestProtocolCharacters ?? 0}, memory data ${first?.latestDataCharacters ?? 0}, routed cover ${first?.latestRoutedCharacters ?? 0}.
- Last request carries ${last?.contextSnapshotCount ?? 0} runtime-context snapshot(s), totaling ${last?.contextSnapshotCharacters ?? 0} chars; superseded snapshots still count toward provider input.
- Mnemon tool schemas per ordinary root call: ${first?.mnemonToolCount ?? 0} tools / ${first?.mnemonToolCharacters ?? 0} serialized chars.
- Host-only leakage checks: ${Object.entries(analysis.leakage).filter(([, value]) => value).map(([name]) => name).join(', ') || 'none detected'}.

## Per turn

${turnTable}

## Per model request

${requestTable}
`
}

async function main() {
  const directory = resolve(process.argv[2] ?? '')
  if (directory === resolve('')) throw new Error('usage: node analyze.mjs <evaluation-directory>')
  const [requests, session, scenario] = await Promise.all([
    readFile(join(directory, 'requests.json'), 'utf8').then(JSON.parse),
    readFile(join(directory, 'session.json'), 'utf8').then(JSON.parse),
    readFile(join(directory, 'scenario.json'), 'utf8').then(JSON.parse),
  ])
  const titleRequests = requests.filter(titleRequest)
  const evaluatedRequests = requests.filter(request => !titleRequest(request))
  const metrics = evaluatedRequests.map((request, index) => requestMetrics(
    request,
    session.sessionId,
    requestAttribution(request, index, evaluatedRequests, session.sessionId),
  ))
  const scenarioById = new Map(scenario.turns.map(turn => [turn.id, turn]))
  const turns = session.turns.map(turn => {
    const related = metrics.filter(request => request.marker === turn.prompt.match(/\[EVAL:[^\]]+\]/u)?.[0])
    const tools = toolMetrics(turn)
    const memoryTools = tools.filter(tool => tool.name.startsWith('mnemon_'))
    return {
      id: turn.id,
      assistantText: turn.assistantText,
      reason: turn.reason,
      assessment: expectedAssessment(turn, scenarioById.get(turn.id)),
      requestCount: related.length,
      rootRequestCount: related.filter(request => request.agentRole === 'root').length,
      childRequestCount: related.filter(request => request.agentRole !== 'root').length,
      promptTokens: sum(related.map(request => request.providerUsage?.prompt_tokens)),
      completionTokens: sum(related.map(request => request.providerUsage?.completion_tokens)),
      latencyMs: sum(related.map(request => request.latencyMs)),
      wallLatencyMs: elapsedMs(turn.startedAt, turn.finishedAt),
      toolMetrics: tools,
      memoryToolCalls: memoryTools.length,
      memoryToolLatencyMs: sum(memoryTools.map(tool => tool.durationMs)),
      memoryToolResultCharacters: sum(memoryTools.map(tool => tool.resultCharacters)),
    }
  })
  const firstMnemonContext = requestContexts(evaluatedRequests.find(request => request.sessionId === session.sessionId) ?? { body: {} }).map(mnemonSlice).at(-1) ?? ''
  const usageKinds = [...new Set(metrics.map(request => request.usageKind).filter(Boolean))]
  const completeMetrics = metrics.filter(request => request.status !== undefined && request.providerUsage !== undefined)
  const incompleteCalls = metrics.length - completeMetrics.length
  const analysis = {
    schemaVersion: 2,
    scenarioId: session.scenarioId,
    sessionId: session.sessionId,
    requests: metrics,
    turns,
    leakage: leakage(firstMnemonContext),
    totals: {
      modelCalls: metrics.length,
      titleCalls: titleRequests.length,
      rootCalls: metrics.filter(request => request.agentRole === 'root').length,
      childCalls: metrics.filter(request => request.agentRole !== 'root').length,
      promptTokens: sum(metrics.map(request => request.providerUsage?.prompt_tokens)),
      completionTokens: sum(metrics.map(request => request.providerUsage?.completion_tokens)),
      totalTokens: sum(metrics.map(request => request.providerUsage?.total_tokens)),
      rootPromptTokens: sum(metrics.filter(request => request.agentRole === 'root').map(request => request.providerUsage?.prompt_tokens)),
      rootCompletionTokens: sum(metrics.filter(request => request.agentRole === 'root').map(request => request.providerUsage?.completion_tokens)),
      childPromptTokens: sum(metrics.filter(request => request.agentRole !== 'root').map(request => request.providerUsage?.prompt_tokens)),
      childCompletionTokens: sum(metrics.filter(request => request.agentRole !== 'root').map(request => request.providerUsage?.completion_tokens)),
      cacheHitTokens: sum(metrics.map(cacheHitTokens)),
      cacheMissTokens: sum(metrics.map(cacheMissTokens)),
      rootCacheHitTokens: sum(metrics.filter(request => request.agentRole === 'root').map(cacheHitTokens)),
      rootCacheMissTokens: sum(metrics.filter(request => request.agentRole === 'root').map(cacheMissTokens)),
      childCacheHitTokens: sum(metrics.filter(request => request.agentRole !== 'root').map(cacheHitTokens)),
      childCacheMissTokens: sum(metrics.filter(request => request.agentRole !== 'root').map(cacheMissTokens)),
      latencyMs: sum(metrics.map(request => request.latencyMs)),
      rootLatencyMs: sum(metrics.filter(request => request.agentRole === 'root').map(request => request.latencyMs)),
      childLatencyMs: sum(metrics.filter(request => request.agentRole !== 'root').map(request => request.latencyMs)),
      turnWallMs: sum(turns.map(turn => turn.wallLatencyMs)),
      memoryToolCalls: sum(turns.map(turn => turn.memoryToolCalls)),
      memoryToolLatencyMs: sum(turns.map(turn => turn.memoryToolLatencyMs)),
      memoryToolResultCharacters: sum(turns.map(turn => turn.memoryToolResultCharacters)),
      failedMemoryToolCalls: sum(turns.flatMap(turn => turn.toolMetrics).map(tool => tool.name.startsWith('mnemon_') && tool.isError ? 1 : 0)),
      unexpectedMemoryToolTurns: turns.filter(turn => turn.assessment.unexpectedTools.length > 0).length,
      titlePromptTokens: sum(titleRequests.map(request => request.usage?.prompt_tokens)),
      titleCompletionTokens: sum(titleRequests.map(request => request.usage?.completion_tokens)),
      completedModelCalls: completeMetrics.length,
      incompleteModelCalls: incompleteCalls,
      usageKind: [...usageKinds, ...(incompleteCalls > 0 ? ['missing'] : [])].join(', ') || 'missing',
      passedTurns: turns.filter(turn => turn.assessment.passed).length,
    },
  }
  await Promise.all([
    writeFile(join(directory, 'analysis.json'), `${JSON.stringify(analysis, null, 2)}\n`),
    writeFile(join(directory, 'summary.md'), summaryMarkdown(analysis, directory)),
  ])
  process.stdout.write(`${join(directory, 'summary.md')}\n`)
}

await main()
