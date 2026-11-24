// Runs a Workflow-tool script (plain JS with `export const meta` and a body that
// uses agent/parallel/log/phase/args) under stubs, with no model calls.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export const SKILL_DIR = fileURLToPath(new URL('../skills/hundred-acre-council/', import.meta.url))

export function loadWorkflow(file) {
  const src = readFileSync(SKILL_DIR + file, 'utf8')
  if (!/^export const meta = \{/m.test(src)) throw new Error(`${file}: must begin its meta with "export const meta = {"`)
  const body = src.replace(/^export const meta =/m, 'const meta =')
  const AsyncFunction = (async () => {}).constructor
  // Workflow scripts may not read the clock or randomness (they break resume).
  for (const banned of ['Date.now(', 'Math.random(', 'new Date()']) {
    if (src.includes(banned)) throw new Error(`${file}: uses ${banned}, which the Workflow tool forbids`)
  }
  const fn = new AsyncFunction('args', 'agent', 'parallel', 'pipeline', 'log', 'phase', 'budget', body)
  const meta = new Function(src.match(/export const meta = (\{[\s\S]*?\n\})/)[1].replace(/^/, 'return '))()
  return { fn, meta }
}

// A fake agent() that fills any schema with minimal valid data. `fail(opts)`
// decides which calls fail. A real agent() can fail either way: it returns null
// (a skipped or dead subagent) or throws (e.g. an unknown agentType).
export function stubAgent(fail = () => false, how = 'throw') {
  const calls = []
  const fill = (schema) => {
    if (!schema) return 'text'
    if (schema.type === 'object') {
      const o = {}
      for (const [k, v] of Object.entries(schema.properties || {})) o[k] = fill(v)
      return o
    }
    if (schema.type === 'array') return []
    if (schema.type === 'integer' || schema.type === 'number') return 3
    if (schema.type === 'boolean') return true
    if (schema.enum) return schema.enum[0]
    return 'x'
  }
  const agent = async (prompt, opts = {}) => {
    calls.push({ prompt, ...opts })
    if (fail(opts)) {
      if (how === 'null') return null
      throw new Error(`Agent type '${opts.agentType}' not found`)
    }
    return fill(opts.schema)
  }
  return { agent, calls }
}

export const parallel = async (thunks) => Promise.all(thunks.map(t => Promise.resolve().then(t).catch(() => null)))
export const pipeline = async (items, ...stages) => Promise.all(items.map(async (it, i) => {
  let v = it
  for (const s of stages) { try { v = await s(v, it, i) } catch { return null } }
  return v
}))

export async function run(file, args, fail, how) {
  const { fn } = loadWorkflow(file)
  const { agent, calls } = stubAgent(fail, how)
  const logs = []
  const budget = { total: null, spent: () => 0, remaining: () => Infinity }
  const result = await fn(args, agent, parallel, pipeline, m => logs.push(m), () => {}, budget)
  return { result, calls, logs }
}
