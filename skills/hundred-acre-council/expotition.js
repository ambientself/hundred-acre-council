export const meta = {
  name: 'hundred-acre-expotition',
  description: 'Gather a cited evidence dossier for the Hundred Acre council: one gatherer per source beat',
  whenToUse: 'First step of the hundred-acre-council skill, before council.js.',
  phases: [{ title: 'Expotition', detail: 'one gatherer per beat, each returns cited facts and gaps' }],
}

// args: { topic, context, today, gatherers: [{ key, prefix, title, beat }] }
//   topic     what the council will decide about
//   context   two or three sentences every gatherer needs (repo names, where the clone lives, known traps)
//   gatherers one per source beat; prefix is the fact-id letter (R, U, J, H...), beat is the brief
// Returns [{ key, prefix, title, facts, gaps }]. Number the facts (prefix + two digits) when writing dossier.md.
const A = args || {}

const FACTS = {
  type: 'object',
  properties: {
    facts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          claim: { type: 'string', description: 'One checkable statement, plain words, numbers where possible' },
          source: { type: 'string', description: 'Exactly where it came from: path@commit, ticket key, PR number, command and output, doc URL' },
          as_of: { type: 'string', description: 'Date the fact was true (YYYY-MM-DD)' },
          confidence: { type: 'string', enum: ['verified', 'reported', 'inferred'] },
        },
        required: ['claim', 'source', 'as_of', 'confidence'],
      },
    },
    gaps: { type: 'array', items: { type: 'string' }, description: 'Things you tried to establish but could not, and why' },
  },
  required: ['facts', 'gaps'],
}

const COMMON = `You are one gatherer on an evidence expedition about ${A.topic}. Today is ${A.today}. A council will later debate a decision about it and may ONLY use the facts you return, so facts must be checkable and cited.
${A.context || ''}

Rules:
- Read only. Never commit, push, comment, transition tickets, apply, or change any cloud, GitHub or Jira state. Do not switch branches or stash in a checkout other sessions may use.
- Prefer MCP tools (GitHub, Atlassian, internal knowledge bases, cost tools) over gh/curl. Load them with ToolSearch.
- Refer to people other than the decider by role or team, never by name or email. No secrets, tokens, account ids or endpoint URLs in claims.
- Return 20 to 45 facts. Favour facts that bear on: is it working, who uses it, what it costs, how fast it moves, what is risky, what was promised vs delivered. Include surprising and uncomfortable facts, not just flattering ones. Each claim stands alone.
- confidence: verified = you saw it in the source yourself just now; reported = a note or doc says so and you could not check it live; inferred = your own deduction from verified facts (say from which).
- Put what you could not establish in gaps.`

phase('Expotition')
const results = await parallel((A.gatherers || []).map(g => () =>
  agent(`${COMMON}\n\nYOUR BEAT: ${g.beat}`, { label: `expotition:${g.key}`, phase: 'Expotition', schema: FACTS })
    .then(r => r ? { key: g.key, prefix: g.prefix, title: g.title, ...r } : null)))

const ok = results.filter(Boolean)
if (ok.length < (A.gatherers || []).length) log(`${(A.gatherers || []).length - ok.length} gatherer(s) returned nothing`)
return ok
