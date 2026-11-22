---
name: hundred-acre-council
description: Run a decision or plan past a council of Winnie-the-Pooh persona agents (Tigger ideas, Owl prior art, Rabbit plan, Kanga people, Piglet risk, Eeyore pre-mortem, a Woozle hunt that checks every claim against evidence, and Pooh, who decides by cutting). Each character has a distinct job and must cite a shared evidence dossier gathered first. Optionally runs a plain no-persona panel and a single agent on the same evidence and has blind judges compare all three. Use when the user wants a plan, project or strategy "taken to the council", "run past the Hundred Acre Wood", "Pooh panel", "tao of pooh review", or wants several agent perspectives to argue a decision down to its simplest form.
---

# Hundred Acre Council

Agents with personas only disagree in useful ways when each one has a different
job, a required output and the same hard evidence. The book (The Tao of Pooh)
supplies the bias: Pooh's simplicity beats everyone else's cleverness, so the
council's final step removes things rather than adding them.

| Character | Job | Output |
|---|---|---|
| Tigger | 4-6 bold directions, including one that does much less | ideas, each with how it gets stuck up the tree |
| Owl | Prior art, internal and external (WebSearch, cites URLs) | what the prior art implies |
| Rabbit | Dated plan to the next real milestone, plus what to stop | steps with owner role and "done when" |
| Kanga | The people: builder, helpers, first adopter (Roo), keepers | what each needs, what makes them give up |
| Piglet | Risks attached to proposals, evidence required | smallest fix that makes him braver |
| Eeyore | Pre-mortem from six months out, plus the missing tail | most likely failure story, causes |
| Woozle hunt | Christopher Robin checks every load-bearing claim: unsupported, misread, stale, circular (footprints), overstated | woozles and the solid claims |
| Pooh | Chooses and cuts, may add nothing new; Poohsticks between finalists | one thing, stop, keep, next step, one question for the decider |

The decider is Christopher Robin. The council advises; it never acts.

## How to run it

1. **Frame the question** with the user: the decision, who decides, the date of
   the next real deadline, the pre-mortem horizon (about six months out).
2. **Expotition (evidence).** Choose 3-5 source beats that cover different
   ground (the code, live usage and cost, tickets and docs, history and
   promises). Run `expotition.js` with the Workflow tool (`scriptPath` = this
   directory's expotition.js) and `args`:
   `{topic, context, today, gatherers: [{key, prefix, title, beat}]}`.
   Gatherers are read-only and return cited facts plus gaps.
3. **Read the dossier yourself** before the council sees it. Build it with
   `python3 -I make_dossier.py <task output file> <run dir>/dossier.md` and
   save it under `docs/hundred-acre-council/<date>-<topic>/`. Look for wrong
   numbers or one-sided beats. Re-run a beat rather than hand-editing facts.
4. **Council.** Run `council.js` with `args`:
   `{topic, question, dossier_path, today, horizon, controls}`.
   `controls: true` (the default) also runs a plain panel (same jobs, no
   personas, an ordinary synthesizer) and a single agent, then three blind
   judges score all three answers in rotated order. Set `controls: false` for
   a cheaper council-only run (8 agents instead of 20).
5. **Write the minutes** next to the dossier: Pooh's verdict first, then each
   character's headline, the woozles caught, and (with controls) the judges'
   scores. Say plainly where the controls beat the council.

## Notes

- Every character reads the whole dossier file; keep it under about 100 KB.
- People other than the decider are named by role or team, never by name.
- The plain panel differs from the council in two ways at once: no personas,
  and a synthesizer that is not told to only cut. Report it as a comparison of
  the whole Pooh package against a normal panel, not of costumes alone.
- `expotition.js` holds generic evidence-gatherer prompts; replace or extend
  them with gatherers that fit the decision.
