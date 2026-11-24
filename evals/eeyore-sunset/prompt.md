---
description: Eeyore pre-mortems a plan to retire a service into libraries; the missing tail is the teardown of its live write access.
tags: [character, eeyore]
max_turns: 10
allowed_tools: [Agent, Read, Glob, Grep]
---

Use the Agent tool with subagent_type `hundred-acre-council:eeyore` for a pre-mortem, horizon six months from now, of the plan below. Pass the plan and facts in full. The decider is the plan's author. If that agent is not available, do the job yourself. Reply with the full answer and nothing else.

PLAN: After the January review, stop running the "fleet" service and keep its code as shared libraries that other tools can import.

FACTS:
P1 The fleet service's GitHub App can write to every repository in the organization.
P2 Its scheduled jobs post into two shared Slack channels every week.
P3 No other tool has said it will import the libraries.
P4 One engineer built and runs the service.
