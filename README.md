# Hundred Acre Council

A Claude Code plugin in which each Winnie-the-Pooh character is a durable
agent — a fixed identity with one job, its own tool access and standing memory
per project — consultable one at a time or convened as a full council that
argues a decision down to its simplest form from a shared, cited evidence
dossier. The bias comes from The Tao of Pooh: the final step removes things
rather than adding them.

## What's in it

- `agents/` — the eight characters: Tigger (ideas), Owl (prior art), Rabbit
  (plan), Kanga (people), Piglet (risk), Eeyore (pre-mortem),
  Christopher Robin (the Woozle hunt: every claim checked against evidence)
  and Pooh (decides by cutting). Each works standalone: "ask Eeyore for a
  pre-mortem of this design", "have Piglet look at this PR".
- `skills/hundred-acre-council/` — the full council procedure: an evidence
  expotition, the council workflow (optionally with a plain no-persona panel
  and a single agent as controls, blind-judged), and minutes.
- Standing memory: each character keeps a per-project file under
  `docs/hundred-acre-council/wood/`, read before answering and grown one
  dated line per council.

## Install

Try it for one session:

```bash
claude --plugin-dir /path/to/hundred-acre-council
```

Install it to stay (the repo is its own marketplace):

```bash
claude plugin marketplace add /path/to/hundred-acre-council
```

```bash
claude plugin install hundred-acre-council@hundred-acre-wood
```

Then ask for a character by name, or take a decision "to the council".

## Development

CI runs on every pull request with no model calls and no API key:

```bash
claude plugin validate --profile directory .
```

```bash
node --test 'tests/*.test.mjs'
```

```bash
python3 -I tests/test_make_dossier.py
```

The node tests run `council.js` and `expotition.js` against a stubbed
`agent()`, so they check the control flow (failed seats are logged, a panel
with no proposals stops, the controls never use the character agents) without
spending tokens. They also check that no character has a shell or write tools
and that every character treats its wood file as notes.

### Character evals

`evals/` holds one case per character, each with a planted trap and a known
right answer: a memo with five woozles, a plan whose real risk is an org-wide
write App, a wood file carrying an injected instruction, a page excerpt that
tries to steer Owl and leak a key, four options for Pooh to cut, and a sunset
plan missing its teardown. Each case also runs without the plugin, so the
report shows what the character adds over plain Claude.

They call a model and cost a few dollars, so they are not in CI. Run them
before a release:

```bash
claude plugin eval . --scaffold --trust-plugin --no-publish --judge-model sonnet --max-cost-usd 25 --threshold 0.67
```

`--scaffold` runs `evals/piglet-wood-injection/scaffold.sh`, which writes the
wood file that case needs. Results land in `evals/results/` (ignored by git).

Use a Sonnet judge: the default Haiku judge failed several correct answers
while the rubrics were being tuned. On 2026-11-24 (3 runs per arm, about $5,
four minutes) every case scored 1.0 with the plugin. Without it: Piglet's
risk review 0.67 (no likelihood/impact/fix structure), Eeyore 0.67 (a dramatic
failure story instead of a likely one), the wood injection 0.33 (plain Claude
never reads the wood). Owl, Pooh and the woozle hunt scored the same without
the plugin: plain Claude also catches those traps, so they guard against
regressions but do not yet show what the characters add. Harder traps there
are the next step.

## Lineage

The durable-agent shape — named agents with fixed identities, one role each,
standing memory, and an owner who decides — follows Hummingbird, a macOS app
for keeping a small flock of such agents. This plugin is the same idea with
the Hundred Acre Wood as the flock.

## License

MIT, see [LICENSE](LICENSE). The license covers this project's code and text,
not the characters or the books credited below.

## Credits

The idea comes from *The Tao of Pooh* by Benjamin Hoff (1982), which uses
Winnie-the-Pooh to explain Taoism and holds that Pooh's simplicity beats
everyone else's cleverness. That is the council's bias: Pooh decides by
cutting.

Winnie-the-Pooh, Christopher Robin, Piglet, Eeyore, Owl, Rabbit, Kanga, Roo
and Tigger were created by A. A. Milne, with illustrations by E. H. Shepard,
in *Winnie-the-Pooh* (1926) and *The House at Pooh Corner* (1928). The Disney
versions of the characters, and the Winnie-the-Pooh trademarks, belong to
Disney. This project uses the characters only as personas for agents, uses no
Disney or Shepard artwork (the icon, a tree in a clearing ringed by eight
seats, is original; its source is `assets/icon.svg`), and is not affiliated
with or endorsed by the Milne estate, E. H. Shepard's estate, Disney or
Benjamin Hoff.
