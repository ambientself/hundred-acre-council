import { test } from 'node:test'
import assert from 'node:assert/strict'
import { run, loadWorkflow } from './harness.mjs'

test('meta is a pure literal', () => {
  const { meta } = loadWorkflow('expotition.js')
  assert.equal(meta.name, 'hundred-acre-expotition')
})

test('one read-only gatherer per beat; a failed gatherer is dropped and logged', async () => {
  const gatherers = [
    { key: 'repo', prefix: 'R', title: 'Code', beat: 'read the code' },
    { key: 'usage', prefix: 'U', title: 'Usage', beat: 'read the logs' },
  ]
  const { result, calls, logs } = await run('expotition.js', { topic: 't', today: '2026-01-01', gatherers }, o => /usage/.test(o.label || ''))
  assert.equal(calls.length, 2)
  for (const c of calls) assert.match(c.prompt, /Read only/)
  assert.equal(result.length, 1)
  assert.equal(result[0].key, 'repo')
  assert.ok(logs.some(l => /1 gatherer\(s\) returned nothing/.test(l)))
})
