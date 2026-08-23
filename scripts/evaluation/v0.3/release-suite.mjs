#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { access, mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const harnessRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const runner = join(dirname(fileURLToPath(import.meta.url)), 'run.mjs')
const analyzer = join(dirname(fileURLToPath(import.meta.url)), 'analyze.mjs')
const aggregator = join(dirname(fileURLToPath(import.meta.url)), 'aggregate.mjs')

const CASES = [
  { id: 'deterministic', provider: 'mock', scenario: 'deterministic', repetitions: 1 },
  { id: 'context-dsh-only', provider: 'real', scenario: 'context-only', corpus: 'empty', mnemon: 'off', versions: ['current'], repetitions: 1 },
  { id: 'context-empty-guided', provider: 'real', scenario: 'context-only', corpus: 'empty', repetitions: 1 },
  { id: 'context-empty-minimal', provider: 'real', scenario: 'context-only', corpus: 'empty', routingGuidance: 'off', recallMode: 'off', writebackMode: 'off', repetitions: 1 },
  { id: 'context-realistic', provider: 'real', scenario: 'context-only', corpus: 'realistic', repetitions: 2 },
  { id: 'context-scale', provider: 'real', scenario: 'context-only', corpus: 'scale', repetitions: 1 },
  { id: 'context-max-runtime', provider: 'real', scenario: 'context-only', corpus: 'max-runtime', repetitions: 1 },
  { id: 'steady-state', provider: 'real', scenario: 'steady-state', repetitions: 2 },
  { id: 'continuous-conversation', provider: 'real', scenario: 'real-conversation', repetitions: 2 },
  { id: 'autonomous-recall', provider: 'real', scenario: 'autonomous-recall', repetitions: 2 },
  { id: 'isolated-recall', provider: 'real', scenario: 'single-recall', repetitions: 5 },
  { id: 'recall-matrix', provider: 'real', scenario: 'recall-matrix', repetitions: 1 },
  { id: 'runtime-mutations', provider: 'real', scenario: 'runtime-mutations', repetitions: 2 },
  { id: 'idle-no-write', provider: 'real', scenario: 'idle-review', idleReviewMs: 5_000, repetitions: 2 },
  { id: 'capacity-maintenance', provider: 'real', scenario: 'capacity-maintenance', corpus: 'capacity', repetitions: 3 },
]

function argumentsFrom(argv) {
  const options = {
    baselineRoot: undefined,
    currentRoot: harnessRoot,
    output: '/private/tmp/dsh-mnemon-v03-release-benchmark-20260824',
    credentialFile: resolve(process.env.DSH_HOME ?? join(process.env.HOME ?? '', '.dsh'), '.credentials.yaml'),
    mnemonBinary: '/private/tmp/dsh-mnemon-v03-eval-mnemon',
    mode: 'full',
    only: undefined,
  }
  for (let index = 0; index < argv.length; index += 2) {
    const name = argv[index]
    const value = argv[index + 1]
    if (value === undefined) throw new Error(`${name} requires a value`)
    if (name === '--baseline-root') options.baselineRoot = resolve(value)
    else if (name === '--current-root') options.currentRoot = resolve(value)
    else if (name === '--output') options.output = resolve(value)
    else if (name === '--credential-file') options.credentialFile = resolve(value)
    else if (name === '--mnemon-binary') options.mnemonBinary = resolve(value)
    else if (name === '--mode') options.mode = value
    else if (name === '--only') options.only = new Set(value.split(',').map(item => item.trim()).filter(Boolean))
    else throw new Error(`unknown argument: ${name}`)
  }
  if (options.baselineRoot === undefined) throw new Error('--baseline-root is required')
  if (!['full', 'smoke'].includes(options.mode)) throw new Error('--mode must be full or smoke')
  return options
}

function run(command, args, cwd = harnessRoot) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(command, args, { cwd, env: process.env, shell: false, stdio: 'inherit' })
    child.once('error', reject)
    child.once('exit', (code, signal) => resolveRun({ code, signal }))
  })
}

async function gitCommit(root) {
  return new Promise((resolveCommit, reject) => {
    const child = spawn('git', ['rev-parse', 'HEAD'], { cwd: root, shell: false, stdio: ['ignore', 'pipe', 'inherit'] })
    let output = ''
    child.stdout.setEncoding('utf8').on('data', chunk => { output += chunk })
    child.once('error', reject)
    child.once('exit', code => code === 0 ? resolveCommit(output.trim()) : reject(new Error(`git rev-parse failed in ${root}`)))
  })
}

function planCases(options) {
  let cases = options.only === undefined ? CASES : CASES.filter(item => options.only.has(item.id))
  if (options.only !== undefined) {
    const unknown = [...options.only].filter(id => !CASES.some(item => item.id === id))
    if (unknown.length > 0) throw new Error(`unknown benchmark case(s): ${unknown.join(', ')}`)
  }
  if (options.mode === 'smoke') {
    const smoke = new Set(['deterministic', 'context-realistic', 'steady-state', 'isolated-recall', 'runtime-mutations', 'capacity-maintenance'])
    cases = cases.filter(item => smoke.has(item.id)).map(item => ({ ...item, repetitions: 1 }))
  }
  return cases
}

function runArguments(item, packageRoot, output, options) {
  return [
    runner,
    '--provider', item.provider,
    '--scenario', item.scenario,
    '--package-root', packageRoot,
    '--output', output,
    '--mnemon-binary', options.mnemonBinary,
    '--credential-file', options.credentialFile,
    '--corpus', item.corpus ?? 'realistic',
    '--mnemon', item.mnemon ?? 'on',
    '--routing-guidance', item.routingGuidance ?? 'on',
    '--recall-mode', item.recallMode ?? 'guided',
    '--writeback-mode', item.writebackMode ?? 'guided',
    '--idle-review-ms', String(item.idleReviewMs ?? 600_000),
  ]
}

async function completedRun(directory, expectedCommit) {
  try {
    const [manifest, analysis] = await Promise.all([
      readFile(join(directory, 'manifest.json'), 'utf8').then(JSON.parse),
      readFile(join(directory, 'analysis.json'), 'utf8').then(JSON.parse),
    ])
    return manifest.package?.commit === expectedCommit && analysis.totals?.completedModelCalls === analysis.totals?.modelCalls
  } catch {
    return false
  }
}

async function archivePartial(outputRoot, runDirectory, runId) {
  try {
    await access(runDirectory)
  } catch {
    return
  }
  const archiveRoot = join(outputRoot, '_partial')
  await mkdir(archiveRoot, { recursive: true })
  await rename(runDirectory, join(archiveRoot, `${runId}-${new Date().toISOString().replaceAll(/[:.]/gu, '-')}`))
}

async function main() {
  const options = argumentsFrom(process.argv.slice(2))
  const cases = planCases(options)
  await Promise.all([
    access(join(options.baselineRoot, 'lib', 'index.js')),
    access(join(options.currentRoot, 'lib', 'index.js')),
    access(options.mnemonBinary),
    ...(cases.some(item => item.provider === 'real') ? [access(options.credentialFile)] : []),
    mkdir(options.output, { recursive: true }),
  ])
  const commits = {
    baseline: await gitCommit(options.baselineRoot),
    current: await gitCommit(options.currentRoot),
  }
  const roots = { baseline: options.baselineRoot, current: options.currentRoot }
  const suitePath = join(options.output, 'suite.json')
  let previous = { runs: [] }
  try { previous = JSON.parse(await readFile(suitePath, 'utf8')) } catch {}
  const records = new Map((previous.runs ?? []).map(record => [record.id, record]))
  const plan = []
  for (const [caseIndex, item] of cases.entries()) {
    for (let sample = 1; sample <= item.repetitions; sample += 1) {
      const versions = [...(item.versions ?? ['baseline', 'current'])]
      if ((caseIndex + sample) % 2 === 0) versions.reverse()
      for (const version of versions) plan.push({ item, version, sample })
    }
  }
  const writeProgress = async () => writeFile(suitePath, `${JSON.stringify({
    schemaVersion: 1,
    objective: 'v0.2.16 versus v0.3 release benchmark',
    updatedAt: new Date().toISOString(),
    mode: options.mode,
    roots,
    commits,
    cases,
    runs: [...records.values()],
  }, null, 2)}\n`)

  let failures = 0
  for (const [index, entry] of plan.entries()) {
    const { item, version, sample } = entry
    const runId = `${item.id}__${version}__r${sample}`
    const directory = join(options.output, runId)
    process.stdout.write(`\n[release-benchmark ${index + 1}/${plan.length}] ${runId}\n`)
    if (await completedRun(directory, commits[version])) {
      records.set(runId, { id: runId, caseId: item.id, scenario: item.scenario, version, sample, directory: relative(options.output, directory), status: 'completed', resumed: true })
      await writeProgress()
      process.stdout.write(`[release-benchmark] reuse ${runId}\n`)
      continue
    }
    await archivePartial(options.output, directory, runId)
    const startedAt = new Date().toISOString()
    const execution = await run(process.execPath, runArguments(item, roots[version], directory, options))
    if (execution.code !== 0) {
      failures += 1
      records.set(runId, { id: runId, caseId: item.id, scenario: item.scenario, version, sample, directory: relative(options.output, directory), status: 'failed', startedAt, finishedAt: new Date().toISOString(), exitCode: execution.code, signal: execution.signal })
      await writeProgress()
      continue
    }
    const analysis = await run(process.execPath, [analyzer, directory])
    const status = analysis.code === 0 ? 'completed' : 'analysis-failed'
    if (status !== 'completed') failures += 1
    records.set(runId, { id: runId, caseId: item.id, scenario: item.scenario, version, sample, directory: relative(options.output, directory), status, startedAt, finishedAt: new Date().toISOString(), exitCode: analysis.code, signal: analysis.signal })
    await writeProgress()
  }
  const aggregation = await run(process.execPath, [aggregator, options.output])
  if (aggregation.code !== 0) failures += 1
  process.stdout.write(`\n[release-benchmark] ${plan.length - failures}/${plan.length} runs completed; failures=${failures}\n`)
  process.exitCode = failures === 0 ? 0 : 1
}

await main()
