---
name: hundred-acre-council
description: Run a decision or plan past a council of Winnie-the-Pooh character agents (Tigger ideas, Owl prior art, Rabbit plan, Kanga people, Piglet risk, Eeyore pre-mortem, a Woozle hunt that checks every claim against evidence, and Pooh, who decides by cutting). The characters are durable agents with standing memory, consultable one at a time ("ask Eeyore for a pre-mortem", "have Piglet look at this PR") or convened in full; a full council cites a shared evidence dossier gathered first. Optionally runs a plain no-persona panel and a single agent on the same evidence and has blind judges compare all three. Use when the user wants a plan, project or strategy "taken to the council", "run past the Hundred Acre Wood", "Pooh panel", "tao of pooh review", wants one character's take, or wants several agent perspectives to argue a decision down to its simplest form.
---

# Hundred Acre Council

Agents with personas only disagree in useful ways when each one has a different
job, a required output and the same hard evidence. The book (The Tao of Pooh)
supplies the bias: Pooh's simplicity beats everyone else's cleverness, so the
council's final step removes things rather than adding them.

The characters are not prompt costumes; they are durable agents, in the way a
contact list beats a dial tone. Each lives in the plugin's `agents/` directory
with a fixed identity, one job, its own tool access, and standing memory per
project (the wood, below). The same Eeyore who sat at last month's council
answers today's one-off pre-mortem, and remembers what the wood taught him.

| Character | Agent | Job | Output |
|---|---|---|---|
| Tigger | `hundred-acre-council:tigger` | 4-6 bold directions, including one that does much less | ideas, each with how it gets stuck up the tree |
| Owl | `hundred-acre-council:owl` | Prior art, internal and external (WebSearch, cites URLs) | what the prior art implies |
| Rabbit | `hundred-acre-council:rabbit` | Dated plan to the next real milestone, plus what to stop | steps with owner role and "done when" |
| Kanga | `hundred-acre-council:kanga` | The people: builder, helpers, first adopter (Roo), keepers | what each needs, what makes them give up |
| Piglet | `hundred-acre-council:piglet` | Risks attached to proposals, evidence required | smallest fix that makes him braver |
| Eeyore | `hundred-acre-council:eeyore` | Pre-mortem from six months out, plus the missing tail | most likely failure story, causes |
| Woozle hunt | `hundred-acre-council:christopher-robin` | Checks every load-bearing claim: unsupported, misread, stale, circular (footprints), overstated | woozles and the solid claims |
| Pooh | `hundred-acre-council:pooh` | Chooses and cuts, may add nothing new; Poohsticks between finalists | one thing, stop, keep, next step, one question for the decider |

The decider is the user, who in this story is Christopher Robin's player. The
council advises; it never acts.

## Consulting one character

Any character can be called alone with the Agent tool, subagent_type as in the
table (requires the plugin; bare names like `eeyore` work only if nothing else
claims them). Give them what the council would give them: the question, where
the evidence lives, and who decides. They gather their own footing when no
dossier exists, cite what they read, and work read-only. Use this for the
small occasions — a pre-mortem on a design doc, Piglet on a risky PR, a Woozle
hunt over a strategy memo, Pooh over a pile of options — and save the full
council for decisions. After a standalone answer, append its `For the wood:`
line, dated, to `docs/hundred-acre-council/wood/<agent-name>.md` — the
characters cannot write it themselves.

## The wood (standing memory)

A character's memory for a project lives in that project at
`docs/hundred-acre-council/wood/<agent-name>.md`. Each character reads their
own file before answering, if it exists, and ends every answer with a one-line
lesson (`For the wood:` standalone; the `for_the_wood` field at council).
Append those lines to the files when writing minutes, dated, one line each.
Keep each file under a page; prune it like Pooh would. The user may edit or
empty a file at any time — it is theirs, as a Bird's MEMORY.md belongs to the
owner, not the Bird.

## Running a full council

1. **Frame the question** with the user: the decision, who decides, the date of
   the next real deadline, the pre-mortem horizon (about six months out).
2. **Expotition (evidence).** Choose 3-5 source beats that cover different
   ground (the code, live usage and cost, tickets and docs, history and
   promises). Run `expotition.js` with the Workflow tool (`scriptPath` = this
   skill directory's expotition.js) and `args`:
   `{topic, context, today, gatherers: [{key, prefix, title, beat}]}`.
   Gatherers are read-only and return cited facts plus gaps.
3. **Read the dossier yourself** before the council sees it. Build it with
   `python3 -I <this skill directory>/make_dossier.py <task output file>
   <run dir>/dossier.md` and
   save it under `docs/hundred-acre-council/<date>-<topic>/`. Look for wrong
   numbers or one-sided beats. Re-run a beat rather than hand-editing facts.
4. **Council.** Run `council.js` with `args`:
   `{topic, question, dossier_path, today, horizon, controls, agent_prefix}`.
   Set `agent_prefix: "hundred-acre-council:"` when the plugin is installed:
   the council then seats the durable character agents (identity, method and
   wood memory from their definitions). Omit it when only the skill is
   available; inline personas are used instead and nothing else changes.
   `controls: true` (the default) also runs a plain panel (same jobs, no
   personas, an ordinary synthesizer) and a single agent, then three blind
   judges score all three answers in rotated order. Set `controls: false` for
   a cheaper council-only run (8 agents instead of 20).
5. **Write the minutes** next to the dossier: Pooh's verdict first, then each
   character's headline, the woozles caught, and (with controls) the judges'
   scores. Say plainly where the controls beat the council. Then append each
   character's `for_the_wood` line to their file under
   `docs/hundred-acre-council/wood/`, dated.

## Notes

- Every character reads the whole dossier file; keep it under about 100 KB.
- People other than the decider are named by role or team, never by name.
- The plain panel differs from the council in two ways at once: no personas,
  and a synthesizer that is not told to only cut. Report it as a comparison of
  the whole Pooh package against a normal panel, not of costumes alone.
- `expotition.js` holds generic evidence-gatherer prompts; replace or extend
  them with gatherers that fit the decision.
- The characters never write anything. Minutes, dossiers and wood files are
  written by you, the convener, so everything that persists passed through
  one pair of hands.
