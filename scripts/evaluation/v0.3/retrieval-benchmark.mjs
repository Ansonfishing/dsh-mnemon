#!/usr/bin/env node

import { randomUUID } from 'node:crypto'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { memorySpaces } from './fixtures.mjs'

const QUERIES = [
  { id: 'rollout-natural', query: '哪次演练让我们增加了 35% 和 65% 两个灰度阶段？直接从 12% 升到 100% 暴露了什么？', expected: '2026-06-02' },
  { id: 'rollout-fault-wording', query: '哪次演练或事故导致灰度增加 35% 和 65% 阶段？直接从 12% 升到 100% 暴露了什么故障？', expected: '2026-06-02' },
  { id: 'rollout-sparse', query: '12% 35% 65% 100% 租户倾斜 演练', expected: '2026-06-02' },
  { id: 'rollout-english', query: 'tenant skew rehearsal direct rollout from 12 percent to 100 percent', expected: '2026-06-02' },
  { id: 'redis-natural', query: '为什么否决 Redis Streams 作为审计事实源？ORCHID-31 的 17 条缺口是什么？', expected: '17 条' },
  { id: 'redis-sparse', query: 'Redis consumer group pending claim trim late consumer 17 audit events', expected: '17 条' },
  { id: 'zoom-cost', query: '旧版 Zoom 树平均增加了多少次前台模型调用？', expected: '1.7' },
  { id: 'cordis-boundary', query: 'Cordis isolate 的生命周期与不可信代码沙箱边界是什么？', expected: '不可信代码沙箱' },
  { id: 'view-user-correction', query: '普通用户是否应该选择或理解 View id？过去的明确纠正是什么？', expected: '普通用户' },
  { id: 'vendor-renewal', query: 'Nebula Storage 续约检查点和业务 owner、法务复核人是谁？', expected: '2026-10-08' },
  { id: 'absent-quantum-key', query: 'Project Lantern 量子加密密钥轮换日期', expected: undefined },
  { id: 'absent-cfo', query: 'Project Lantern CFO 姓名和任命日期', expected: undefined },
]

function argumentsFrom(argv) {
  const options = {
    baselineRoot: undefined,
    currentRoot: resolve(import.meta.dirname, '../../..'),
    mnemonBinary: '/private/tmp/dsh-mnemon-v03-eval-mnemon',
    repetitions: 5,
    output: '/private/tmp/dsh-mnemon-v03-retrieval-benchmark.json',
  }
  for (let index = 0; index < argv.length; index += 2) {
    const name = argv[index]
    const value = argv[index + 1]
    if (value === undefined) throw new Error(`${name} requires a value`)
    if (name === '--baseline-root') options.baselineRoot = resolve(value)
    else if (name === '--current-root') options.currentRoot = resolve(value)
    else if (name === '--mnemon-binary') options.mnemonBinary = resolve(value)
    else if (name === '--repetitions') options.repetitions = Number(value)
    else if (name === '--output') options.output = resolve(value)
    else throw new Error(`unknown argument: ${name}`)
  }
  if (options.baselineRoot === undefined) throw new Error('--baseline-root is required')
  if (!Number.isInteger(options.repetitions) || options.repetitions < 1 || options.repetitions > 50) throw new Error('--repetitions must be within 1..50')
  return options
}

async function loadPackage(root, label) {
  return import(`${pathToFileURL(join(root, 'lib', 'index.js')).href}?retrieval=${label}-${randomUUID()}`)
}

async function seed(pkg, dataDir, workspace, mnemonBinary) {
  const graph = pkg.createRuntimeGraph(pkg.resolveConfig({ storageScope: 'custom', dataDir, cliPath: mnemonBinary }), workspace)
  try {
    for (const space of memorySpaces) {
      const body = await graph.service.createBody({ name: space.name, description: space.description, providerId: 'mnemon-native', active: true })
      for (const [content, category, importance, tags, entities] of space.memories) {
        await graph.service.remember({ content, category, importance, tags, entities, source: 'external', memoryBodyId: body.id })
      }
    }
  } finally {
    graph.dispose?.()
  }
}

async function probe(pkg, version, dataDir, workspace, mnemonBinary, repetition) {
  const graph = pkg.createRuntimeGraph(pkg.resolveConfig({ storageScope: 'custom', dataDir, cliPath: mnemonBinary, defaultRecallLimit: 6 }), workspace)
  const rows = []
  try {
    for (const query of QUERIES) {
      const started = performance.now()
      const response = await graph.service.search({ query: query.query, mode: 'smart', limit: 6 })
      const durationMs = Math.round((performance.now() - started) * 100) / 100
      const rank = query.expected === undefined ? undefined : response.results.findIndex(result => result.content.includes(query.expected)) + 1
      rows.push({
        repetition,
        version,
        queryId: query.id,
        query: query.query,
        expected: query.expected,
        durationMs,
        resultCount: response.results.length,
        resultCharacters: response.results.reduce((total, result) => total + result.content.length, 0),
        hitAt1: query.expected === undefined ? undefined : rank === 1,
        hitAt6: query.expected === undefined ? undefined : rank > 0,
        rank: rank || undefined,
        absentEmpty: query.expected === undefined ? response.results.length === 0 : undefined,
        topContents: response.results.slice(0, 3).map(result => result.content),
      })
    }
  } finally {
    graph.dispose?.()
  }
  return rows
}

function percentile(values, fraction) {
  if (values.length === 0) return undefined
  const sorted = [...values].sort((left, right) => left - right)
  return sorted[Math.max(0, Math.ceil(sorted.length * fraction) - 1)]
}

function summary(rows, version) {
  const selected = rows.filter(row => row.version === version)
  const expected = selected.filter(row => row.expected !== undefined)
  const absent = selected.filter(row => row.expected === undefined)
  return {
    samples: selected.length,
    expectedSamples: expected.length,
    hitAt1: expected.filter(row => row.hitAt1).length,
    hitAt6: expected.filter(row => row.hitAt6).length,
    absentSamples: absent.length,
    absentEmpty: absent.filter(row => row.absentEmpty).length,
    resultCharactersMedian: percentile(selected.map(row => row.resultCharacters), 0.5),
    durationMsMedian: percentile(selected.map(row => row.durationMs), 0.5),
    durationMsP95: percentile(selected.map(row => row.durationMs), 0.95),
  }
}

async function main() {
  const options = argumentsFrom(process.argv.slice(2))
  const [baseline, current] = await Promise.all([
    loadPackage(options.baselineRoot, 'baseline'),
    loadPackage(options.currentRoot, 'current'),
  ])
  const rows = []
  for (let repetition = 1; repetition <= options.repetitions; repetition += 1) {
    const temporaryRoot = await mkdtemp(join(tmpdir(), 'dsh-mnemon-retrieval-'))
    const dataDir = join(temporaryRoot, 'data')
    const workspace = join(temporaryRoot, 'workspace')
    await Promise.all([mkdir(dataDir), mkdir(workspace)])
    try {
      await seed(baseline, dataDir, workspace, options.mnemonBinary)
      const versions = repetition % 2 === 0
        ? [['current', current], ['baseline', baseline]]
        : [['baseline', baseline], ['current', current]]
      for (const [version, pkg] of versions) {
        rows.push(...await probe(pkg, version, dataDir, workspace, options.mnemonBinary, repetition))
      }
    } finally {
      await rm(temporaryRoot, { recursive: true, force: true })
    }
  }
  const report = {
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    repetitions: options.repetitions,
    queries: QUERIES,
    summaries: {
      baseline: summary(rows, 'baseline'),
      current: summary(rows, 'current'),
    },
    rows,
  }
  await mkdir(dirname(options.output), { recursive: true })
  await writeFile(options.output, `${JSON.stringify(report, null, 2)}\n`)
  process.stdout.write(`${options.output}\n`)
}

await main()
