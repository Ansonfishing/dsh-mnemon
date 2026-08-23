import { randomUUID } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

export const name = 'mnemon-evaluation-runner'
export const inject = ['agentDefaultModel', 'agents', 'sessions']

function requiredEnvironment(name) {
  const value = process.env[name]?.trim()
  if (value === undefined || value === '') throw new Error(`${name} is required`)
  return value
}

function jsonSafe(value) {
  return JSON.parse(JSON.stringify(value, (_key, item) => {
    if (typeof item === 'bigint') return String(item)
    if (item instanceof Error) return { name: item.name, message: item.message, stack: item.stack }
    return item
  }))
}

function assistantText(events) {
  return events
    .filter(event => event.type === 'assistant/message')
    .flatMap(event => event.data?.message?.content ?? [])
    .filter(block => block?.type === 'text' && typeof block.text === 'string')
    .map(block => block.text)
    .join('\n')
    .trim()
}

function turnReason(events) {
  return events.findLast(event => event.type === 'turn/end')?.data?.reason
}

async function delay(milliseconds) {
  if (milliseconds <= 0) return
  await new Promise(resolveDelay => setTimeout(resolveDelay, milliseconds))
}

async function run(ctx, io) {
  const scenarioPath = requiredEnvironment('MNEMON_EVAL_SCENARIO_PATH')
  const resultPath = requiredEnvironment('MNEMON_EVAL_RESULT_PATH')
  const scenario = JSON.parse(await readFile(scenarioPath, 'utf8'))
  if (!Array.isArray(scenario.turns) || scenario.turns.length === 0) throw new Error('evaluation scenario must contain at least one turn')

  await ctx.get('loader')?.await()
  const agents = ctx.get('agents')
  const defaultModel = ctx.get('agentDefaultModel')
  const sessions = ctx.get('sessions')
  if (agents === undefined || defaultModel === undefined || sessions === undefined) throw new Error('DSH Agent services are unavailable')

  const selection = defaultModel.currentSelection()
  const sessionId = scenario.sessionId ?? `mnemon-eval-${randomUUID()}`
  const { agent } = await agents.create({
    sessionId,
    meta: { cwd: resolve(scenario.workspaceRoot ?? process.cwd()) },
    agentOptions: {
      provider: selection.provider,
      model: selection.model,
      ...(scenario.maxTokens === undefined ? {} : { maxTokens: scenario.maxTokens }),
    },
  })

  await agent.whenIdle()
  const startedAt = new Date().toISOString()
  const turns = []
  for (const [index, turn] of scenario.turns.entries()) {
    if (typeof turn.prompt !== 'string' || turn.prompt.trim() === '') throw new Error(`scenario turn ${index + 1} has no prompt`)
    const firstSeq = agent.session.seq
    const turnStartedAt = new Date().toISOString()
    agent.followup({
      id: randomUUID(),
      role: 'user',
      content: [{ type: 'text', text: turn.prompt }],
      source: { kind: 'user' },
    })
    await agent.whenIdle()
    await delay(Number.isFinite(turn.waitAfterMs) ? Math.max(0, turn.waitAfterMs) : 0)
    await agent.whenIdle()
    const events = agent.session.events.filter(event => event.seq >= firstSeq)
    turns.push({
      id: turn.id ?? `turn-${index + 1}`,
      prompt: turn.prompt,
      firstSeq,
      lastSeq: agent.session.seq,
      startedAt: turnStartedAt,
      finishedAt: new Date().toISOString(),
      assistantText: assistantText(events),
      reason: turnReason(events),
      events: jsonSafe(events),
    })
  }

  await sessions.flush(agent.session)
  const result = {
    schemaVersion: 1,
    scenarioId: scenario.id ?? 'unnamed',
    sessionId: agent.id,
    selection,
    startedAt,
    finishedAt: new Date().toISOString(),
    turns,
  }
  await mkdir(dirname(resultPath), { recursive: true })
  await writeFile(resultPath, `${JSON.stringify(result, null, 2)}\n`)
  io.stdout.write(`MNEMON_EVAL_COMPLETE ${scenario.id ?? 'unnamed'} ${turns.length}\n`)
  io.exit(turns.every(turn => turn.reason?.kind === 'completed') ? 0 : 1)
}

export function apply(ctx) {
  const exit = ctx.get('appExit')
  if (exit === undefined) throw new Error('evaluation runner requires appExit')
  const io = { stdout: process.stdout, stderr: process.stderr, exit }
  run(ctx, io).catch(async error => {
    io.stderr.write(`dsh-mnemon evaluation runner: ${error instanceof Error ? error.stack ?? error.message : String(error)}\n`)
    try {
      const resultPath = process.env.MNEMON_EVAL_RESULT_PATH?.trim()
      if (resultPath !== undefined && resultPath !== '') {
        await mkdir(dirname(resultPath), { recursive: true })
        await writeFile(resultPath, `${JSON.stringify({ schemaVersion: 1, error: error instanceof Error ? error.message : String(error) }, null, 2)}\n`)
      }
    } finally {
      io.exit(1)
    }
  })
}
