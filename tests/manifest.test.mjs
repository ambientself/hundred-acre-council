import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

const ROOT = new URL('../', import.meta.url)
const json = (p) => JSON.parse(readFileSync(new URL(p, ROOT), 'utf8'))

test('plugin and marketplace manifests agree', () => {
  const plugin = json('.claude-plugin/plugin.json')
  const market = json('.claude-plugin/marketplace.json')
  assert.equal(plugin.name, 'hundred-acre-council')
  assert.ok(market.plugins.some(p => p.name === plugin.name && p.source === './'))
  assert.equal(plugin.license, 'MIT')
  assert.ok(existsSync(new URL('LICENSE', ROOT)))
  assert.ok(existsSync(new URL(plugin.icon, ROOT)))
})

test('the skill documents the agent prefix the plugin actually provides', () => {
  const plugin = json('.claude-plugin/plugin.json')
  const skill = readFileSync(new URL('skills/hundred-acre-council/SKILL.md', ROOT), 'utf8')
  assert.ok(skill.includes(`agent_prefix: "${plugin.name}:"`))
})
