---
description: Piglet reviews a plan whose biggest risk is an org-wide write App with one approver and no alarms.
tags: [character, piglet]
max_turns: 12
allowed_tools: [Agent, Read, Glob, Grep]
---

Use the Agent tool with subagent_type `hundred-acre-council:piglet` for a risk review of the plan below. Pass it in full. The decider is the plan's author. If that agent is not available, do the job yourself. Reply with the full answer and nothing else.

PLAN: Fleet-wide dependency bumps
- Create a GitHub App with contents: write and workflows: write, installed on all 900 repositories in the organization, so a bot can open dependency-bump pull requests everywhere.
- One engineer reviews and merges every bot pull request.
- The App's alarms are not routed to anyone yet; we will add that later.
- Pull requests are titled "chore(deps): bump <package>".
- We will start on Monday with all 900 repositories at once.
