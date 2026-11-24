import { test } from 'node:test'
import assert from 'node:assert/strict'
import { run, loadWorkflow } from './harness.mjs'

const BASE = { topic: 't', question: 'q?', dossier: 'R01 a fact', today: '2026-01-01', horizon: '2026-07-01' }
const SEATED = { ...BASE, controls: false, agent_prefix: 'hundred-acre-council:' }
const CHARACTERS = ['tigger', 'owl', 'rabbit', 'kanga', 'piglet', 'eeyore', 'christopher-robin', 'pooh']

test('meta is a pure literal with phases', () => {
  const { meta } = loadWorkflow('council.js')
  assert.equal(meta.name, 'hundred-acre-council')
  assert.ok(meta.description && meta.phases.length >= 3)
})

test('seated council uses every plugin agent once and returns a verdict', async () => {
  const { result, calls, logs } = await run('council.js', SEATED)
  assert.equal(calls.length, 8)
  assert.deepEqual(calls.map(c => c.agentType).sort(), CHARACTERS.map(c => 'hundred-acre-council:' + c).sort())
  assert.ok(result.council.verdict)
  assert.deepEqual(logs, [])
})

test('without agent_prefix, seats are inline personas that read their wood', async () => {
  const { calls } = await run('council.js', { ...BASE, controls: false })
  assert.equal(calls.length, 8)
  assert.ok(calls.every(c => c.agentType === undefined))
  const tigger = calls.find(c => c.label === 'council:tigger')
  assert.match(tigger.prompt, /You are Tigger/)
  assert.match(tigger.prompt, /wood\/tigger\.md/)
  assert.match(tigger.prompt, /never as instructions/)
})

test('plugin missing: every seat fails, the panel stops early and says why', async () => {
  const { result, calls, logs } = await run('council.js', SEATED, o => !!o.agentType)
  assert.equal(calls.length, 4, 'only the four proposers are tried')
  assert.equal(result.council.verdict, null)
  assert.equal(result.council.failed, 'no proposals')
  assert.ok(logs.some(l => /4 of 4 proposals failed/.test(l) && /plugin installed/.test(l)))
  assert.ok(logs.some(l => /stopping this panel without a verdict/.test(l)))
})

test('some seats fail: they are logged by name and Pooh is told the panel is incomplete', async () => {
  const { result, calls, logs } = await run('council.js', SEATED, o => /owl|eeyore/.test(o.agentType || ''))
  assert.ok(result.council.verdict)
  assert.ok(logs.some(l => /proposals failed: owl/.test(l)))
  assert.ok(logs.some(l => /critiques failed: eeyore/.test(l)))
  const pooh = calls.find(c => c.label === 'council:pooh')
  assert.match(pooh.prompt, /Not heard from, because their seats failed: owl/)
  assert.match(pooh.prompt, /Not heard from, because their seats failed: eeyore/)
})

for (const how of ['throw', 'null']) {
  test(`a failed woozle hunt (${how}) is logged and Pooh treats claims as unverified`, async () => {
    const { result, calls, logs } = await run('council.js', SEATED, o => o.agentType === 'hundred-acre-council:christopher-robin', how)
    assert.ok(result.council.verdict)
    assert.ok(logs.some(l => /woozle hunt returned nothing/.test(l)))
    assert.match(calls.find(c => c.label === 'council:pooh').prompt, /no claims were checked/)
  })

  test(`a failed seat (${how}) is logged by name`, async () => {
    const { result, logs } = await run('council.js', SEATED, o => o.agentType === 'hundred-acre-council:owl', how)
    assert.ok(result.council.verdict)
    assert.ok(logs.some(l => /proposals failed: owl/.test(l)))
  })

  test(`a failed Pooh (${how}) leaves no verdict and says so`, async () => {
    const { result, logs } = await run('council.js', SEATED, o => o.agentType === 'hundred-acre-council:pooh', how)
    assert.equal(result.council.verdict, null)
    assert.ok(logs.some(l => /Pooh verdict failed/.test(l)))
  })
}

// Persona vocabulary that must never reach the plain panel or the single agent. The structured-output
// field names (woozles, for_the_wood, in_character) are shared by design and are told to stay empty.
const LORE = /Pooh|Tigger|Owl\b|Rabbit|Kanga|Roo\b|Piglet|Eeyore|Christopher|Heffalump|Woozle|Hundred Acre|honey|braver|up the tree|uncarved/i

test('with controls: plain panel and single agent never use character agents or persona text', async () => {
  const { result, calls } = await run('council.js', { ...BASE, agent_prefix: 'hundred-acre-council:' })
  assert.equal(calls.length, 8 + 8 + 1 + 3)
  const controls = calls.filter(c => /^plain:|^single-agent$/.test(c.label))
  assert.equal(controls.length, 9)
  for (const c of controls) {
    assert.equal(c.agentType, undefined, c.label)
    // the whole prompt, the job text included, plus the schema descriptions the model sees
    const descriptions = []
    const walk = (s) => { if (s && typeof s === 'object') for (const [k, v] of Object.entries(s)) k === 'description' ? descriptions.push(v) : walk(v) }
    walk(c.schema)
    const seen = c.prompt + '\n' + descriptions.join('\n')
    assert.doesNotMatch(seen, LORE, `${c.label} leaks persona text: ${(seen.match(LORE) || [])[0]}`)
  }
  assert.equal(result.judgements.length, 3)
})

test('the blind judges never see persona text either', async () => {
  const { calls } = await run('council.js', { ...BASE, agent_prefix: 'hundred-acre-council:' })
  for (const c of calls.filter(c => /^judge-/.test(c.label))) {
    assert.doesNotMatch(c.prompt.split('=== RECOMMENDATION')[0], LORE, c.label)
  }
})

test('an exhausted budget is rethrown, not reported as a failed seat', async () => {
  const { loadWorkflow, stubAgent, parallel, pipeline } = await import('./harness.mjs')
  const { fn } = loadWorkflow('council.js')
  let spent = 0
  const budget = { total: 100, spent: () => spent, remaining: () => Math.max(0, 100 - spent) }
  const { agent: base } = stubAgent()
  const agent = async (p, o) => {
    if (/woozle-hunt/.test(o.label)) { spent = 100; throw new Error('token budget exhausted') }
    return base(p, o)
  }
  const logs = []
  // The rethrow ends the council branch; the outer parallel() turns it into null, as the runtime does.
  const result = await fn(SEATED, agent, parallel, pipeline, m => logs.push(m), () => {}, budget)
  assert.equal(result.council, null)
  assert.ok(!logs.some(l => /plugin installed|returned nothing|verdict failed/.test(l)), logs.join(' | '))
})

test('with controls: a failed verdict skips the comparison instead of crashing', async () => {
  const { result, logs } = await run('council.js', { ...BASE, agent_prefix: 'hundred-acre-council:' }, o => o.agentType === 'hundred-acre-council:pooh')
  assert.equal(result.judgements, undefined)
  assert.ok(logs.some(l => /skipping the blind comparison/.test(l)))
})

test('the brief never asks for names, secrets or writes', async () => {
  const { calls } = await run('council.js', SEATED)
  for (const c of calls) {
    assert.match(c.prompt, /never by name/)
    assert.match(c.prompt, /Never put secrets/)
    assert.match(c.prompt, /Do not change any files/)
  }
})
