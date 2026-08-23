#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

function sum(values) {
  return values.reduce((total, value) => total + (Number(value) || 0), 0)
}

function round(value, digits = 2) {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

function percentile(values, fraction) {
  if (values.length === 0) return undefined
  const sorted = [...values].sort((left, right) => left - right)
  return sorted[Math.max(0, Math.ceil(sorted.length * fraction) - 1)]
}

function distribution(values) {
  const selected = values.map(Number).filter(Number.isFinite)
  if (selected.length === 0) return { n: 0 }
  return {
    n: selected.length,
    min: Math.min(...selected),
    median: percentile(selected, 0.5),
    mean: round(sum(selected) / selected.length),
    p95: percentile(selected, 0.95),
    max: Math.max(...selected),
  }
}

function firstRoot(analysis) {
  return analysis.requests.find(request => request.agentRole === 'root')
}

function runMetrics(record, analysis) {
  const first = firstRoot(analysis) ?? {}
  const requests = analysis.requests.filter(request => request.providerUsage !== undefined)
  const ttft = requests.map(request => request.ttftMs).filter(Number.isFinite)
  const toolMetrics = analysis.turns.flatMap(turn => turn.toolMetrics ?? []).filter(tool => tool.name.startsWith('mnemon_'))
  return {
    id: record.id,
    caseId: record.caseId,
    version: record.version,
    sample: record.sample,
    passedTurns: analysis.totals.passedTurns,
    totalTurns: analysis.turns.length,
    modelCalls: analysis.totals.modelCalls,
    rootCalls: analysis.totals.rootCalls,
    childCalls: analysis.totals.childCalls,
    promptTokens: analysis.totals.promptTokens,
    completionTokens: analysis.totals.completionTokens,
    totalTokens: analysis.totals.totalTokens,
    cacheHitTokens: analysis.totals.cacheHitTokens,
    cacheMissTokens: analysis.totals.cacheMissTokens,
    providerLatencyMs: analysis.totals.latencyMs,
    turnWallMs: analysis.totals.turnWallMs,
    medianTtftMs: percentile(ttft, 0.5),
    p95TtftMs: percentile(ttft, 0.95),
    memoryToolCalls: analysis.totals.memoryToolCalls,
    memoryToolLatencyMs: analysis.totals.memoryToolLatencyMs,
    memoryToolResultCharacters: analysis.totals.memoryToolResultCharacters,
    failedMemoryToolCalls: analysis.totals.failedMemoryToolCalls,
    unexpectedMemoryToolTurns: analysis.totals.unexpectedMemoryToolTurns,
    medianMemoryToolLatencyMs: percentile(toolMetrics.map(tool => tool.durationMs).filter(Number.isFinite), 0.5),
    firstPromptTokens: first.providerUsage?.prompt_tokens,
    firstRequestCharacters: first.requestCharacters,
    firstMnemonCharacters: first.latestMnemonCharacters,
    firstProtocolCharacters: first.latestProtocolCharacters,
    firstDataCharacters: first.latestDataCharacters,
    firstRoutedCharacters: first.latestRoutedCharacters,
    firstMnemonToolCharacters: first.mnemonToolCharacters,
    firstMnemonToolCount: first.mnemonToolCount,
  }
}

function groupMetrics(runs) {
  const groups = new Map()
  for (const run of runs) {
    const key = `${run.caseId}|${run.version}`
    const group = groups.get(key) ?? { caseId: run.caseId, version: run.version, runs: [] }
    group.runs.push(run)
    groups.set(key, group)
  }
  return [...groups.values()].map(group => ({
    caseId: group.caseId,
    version: group.version,
    samples: group.runs.length,
    passedRuns: group.runs.filter(run => run.passedTurns === run.totalTurns).length,
    passedTurns: sum(group.runs.map(run => run.passedTurns)),
    totalTurns: sum(group.runs.map(run => run.totalTurns)),
    distributions: Object.fromEntries([
      'modelCalls', 'rootCalls', 'childCalls', 'promptTokens', 'completionTokens', 'totalTokens',
      'cacheHitTokens', 'cacheMissTokens', 'providerLatencyMs', 'turnWallMs', 'medianTtftMs',
      'memoryToolCalls', 'memoryToolLatencyMs', 'memoryToolResultCharacters', 'failedMemoryToolCalls',
      'unexpectedMemoryToolTurns', 'firstPromptTokens', 'firstRequestCharacters', 'firstMnemonCharacters',
      'firstProtocolCharacters', 'firstDataCharacters', 'firstRoutedCharacters', 'firstMnemonToolCharacters',
      'firstMnemonToolCount',
    ].map(field => [field, distribution(group.runs.map(run => run[field]))])),
  })).sort((left, right) => left.caseId.localeCompare(right.caseId) || left.version.localeCompare(right.version))
}

function comparison(groups) {
  const byCase = new Map()
  for (const group of groups) {
    const item = byCase.get(group.caseId) ?? {}
    item[group.version] = group
    byCase.set(group.caseId, item)
  }
  return [...byCase].flatMap(([caseId, versions]) => {
    if (versions.baseline === undefined || versions.current === undefined) return []
    const fields = ['totalTokens', 'modelCalls', 'childCalls', 'cacheMissTokens', 'providerLatencyMs', 'turnWallMs', 'memoryToolCalls', 'memoryToolResultCharacters', 'firstPromptTokens', 'firstMnemonCharacters']
    return [{
      caseId,
      metrics: Object.fromEntries(fields.map(field => {
        const baseline = versions.baseline.distributions[field]?.median
        const current = versions.current.distributions[field]?.median
        const delta = Number.isFinite(baseline) && Number.isFinite(current) ? current - baseline : undefined
        return [field, {
          baseline,
          current,
          delta,
          percent: Number.isFinite(delta) && baseline !== 0 ? round(delta / baseline * 100) : undefined,
        }]
      })),
    }]
  })
}

function markdown(groups, comparisons, suite) {
  const lines = [
    '# v0.2.16 vs v0.3 release benchmark aggregate',
    '',
    `Baseline: \`${suite.commits.baseline}\``,
    '',
    `Current: \`${suite.commits.current}\``,
    '',
    '| Case | Version | n | Passed | Total tokens median/p95 | Calls root/child median | Cache miss median | Turn wall median/p95 ms | Memory tools/result chars median | First prompt/Wake |',
    '|---|---|---:|---:|---:|---:|---:|---:|---:|---:|',
  ]
  for (const group of groups) {
    const d = group.distributions
    lines.push(`| ${group.caseId} | ${group.version} | ${group.samples} | ${group.passedTurns}/${group.totalTurns} | ${d.totalTokens.median ?? '?'}/${d.totalTokens.p95 ?? '?'} | ${d.rootCalls.median ?? '?'}/${d.childCalls.median ?? '?'} | ${d.cacheMissTokens.median ?? '?'} | ${d.turnWallMs.median ?? '?'}/${d.turnWallMs.p95 ?? '?'} | ${d.memoryToolCalls.median ?? '?'}/${d.memoryToolResultCharacters.median ?? '?'}c | ${d.firstPromptTokens.median ?? '?'}/${d.firstMnemonCharacters.median ?? '?'}c |`)
  }
  lines.push('', '## Median deltas (v0.3 - v0.2.16)', '', '| Case | Tokens | Calls | Child | Cache miss | Turn wall | Memory result chars | First prompt |', '|---|---:|---:|---:|---:|---:|---:|---:|')
  for (const item of comparisons) {
    const metric = name => {
      const value = item.metrics[name]
      return value.delta === undefined ? '?' : `${value.delta >= 0 ? '+' : ''}${value.delta}${value.percent === undefined ? '' : ` (${value.percent >= 0 ? '+' : ''}${value.percent}%)`}`
    }
    lines.push(`| ${item.caseId} | ${metric('totalTokens')} | ${metric('modelCalls')} | ${metric('childCalls')} | ${metric('cacheMissTokens')} | ${metric('turnWallMs')} | ${metric('memoryToolResultCharacters')} | ${metric('firstPromptTokens')} |`)
  }
  return `${lines.join('\n')}\n`
}

async function main() {
  const root = resolve(process.argv[2] ?? '')
  if (root === resolve('')) throw new Error('usage: node aggregate.mjs <suite-directory>')
  const suite = JSON.parse(await readFile(join(root, 'suite.json'), 'utf8'))
  const completed = suite.runs.filter(record => record.status === 'completed')
  const runs = []
  for (const record of completed) {
    const analysis = JSON.parse(await readFile(join(root, record.directory, 'analysis.json'), 'utf8'))
    runs.push(runMetrics(record, analysis))
  }
  const groups = groupMetrics(runs)
  const comparisons = comparison(groups)
  const aggregate = {
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    commits: suite.commits,
    completedRuns: runs.length,
    failedRuns: suite.runs.filter(record => record.status !== 'completed').length,
    runs,
    groups,
    comparisons,
  }
  await Promise.all([
    writeFile(join(root, 'aggregate.json'), `${JSON.stringify(aggregate, null, 2)}\n`),
    writeFile(join(root, 'aggregate.md'), markdown(groups, comparisons, suite)),
  ])
  process.stdout.write(`${join(root, 'aggregate.md')}\n`)
}

await main()
