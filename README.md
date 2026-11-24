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
Disney. This project uses the characters only as personas for agents, has no
artwork, and is not affiliated with or endorsed by the Milne estate,
E. H. Shepard's estate, Disney or Benjamin Hoff.
