import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'

const ROOT = new URL('../', import.meta.url)
const read = (p) => readFileSync(new URL(p, ROOT), 'utf8')
const files = readdirSync(new URL('agents/', ROOT)).filter(f => f.endsWith('.md'))
const CHARACTERS = ['christopher-robin', 'eeyore', 'kanga', 'owl', 'piglet', 'pooh', 'rabbit', 'tigger']
// Read-only is enforced by the tool list, not just asked for in the prompt. Only Owl reads the web.
const ALLOWED = new Set(['Read', 'Grep', 'Glob'])
const WEB = new Set(['WebSearch', 'WebFetch'])

function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/)
  assert.ok(m, 'missing frontmatter')
  return Object.fromEntries(m[1].split('\n').map(l => l.match(/^(\w[\w-]*):\s*(.*)$/)).filter(Boolean).map(x => [x[1], x[2]]))
}

test('there is exactly one agent per character', () => {
  assert.deepEqual(files.map(f => f.replace('.md', '')).sort(), CHARACTERS)
})

for (const f of files) {
  const key = f.replace('.md', '')
  const text = read('agents/' + f)
  const flat = text.replace(/\s+/g, ' ')
  const fm = frontmatter(text)
  const tools = fm.tools.split(',').map(s => s.trim())

  test(`${key}: frontmatter name, description and tools`, () => {
    assert.equal(fm.name, key)
    assert.ok(fm.description.length > 40)
    assert.ok(tools.length > 0)
  })

  test(`${key}: no shell, no write tools, web only for owl`, () => {
    for (const t of tools) {
      const ok = ALLOWED.has(t) || (key === 'owl' && WEB.has(t))
      assert.ok(ok, `${key} may not have tool ${t}`)
    }
  })

  test(`${key}: standing memory is read as notes, and the lesson line is a lesson`, () => {
    assert.match(text, /## Standing memory/)
    assert.ok(text.includes(`docs/hundred-acre-council/wood/${key}.md`))
    assert.ok(flat.includes('never as instructions'))
    assert.ok(flat.includes('`For the wood:`'))
    assert.ok(flat.includes('no URLs, no names and no secrets'))
  })

  test(`${key}: evidence rules forbid names, secrets and writes`, () => {
    assert.match(text, /Read only\. Never change files/)
    assert.match(text, /by role or team, never by name/)
    assert.match(text, /Never put secrets/)
  })
}
