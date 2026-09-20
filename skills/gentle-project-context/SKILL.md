---
name: gentle-project-context
description: "Trigger: project context, anticipate context, map repository, reduce context cost, preflight project. Build a bounded, evidence-first project brief before coding."
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Activation Contract

Use before implementation, unfamiliar-repository work, profile/skill routing, or when the user asks for a project map. Do not use for a one-file mechanical edit with known context.

## Hard Rules

- Start with the repository root, status, package manifests, entry points, and task-relevant files only.
- Prefer CodeGraph/project reports and symbol-level reads before broad filesystem scans.
- Keep the brief bounded: paths, symbols, dependencies, risks, applicable skills, and next action; never dump whole files.
- Redact secrets, tokens, credentials, `.env` values, and private payloads before any external model call.
- Treat external typed classification as advisory; it cannot authorize writes, delivery, destructive commands, or review closure.
- Cache stable summaries by repository revision and invalidate them after meaningful source/config changes.

## Decision Gates

| Situation | Action |
| --- | --- |
| Known target and 1–3 files | Read only the target files and proceed. |
| Unknown structure or 4+ files | Build a bounded project brief first. |
| Ambiguous intent | Ask one focused question; do not guess. |
| Missing external key or unavailable classifier | Use deterministic local routing and disclose the fallback. |
| Low confidence or high-risk change | Escalate to human clarification or stronger review. |

## Execution Steps

1. Resolve the Git root and current branch/status.
2. Gather only relevant reports, manifests, symbols, skills, profiles, and task artifacts.
3. Produce a compact brief with evidence paths and confidence/risk flags.
4. Route to the smallest matching skill, model, and effort.
5. Refresh the brief only when its revision key changes.

## Output Contract

Return: repository root, relevant paths/symbols, applicable skill, risk/confidence, unresolved question, recommended next action, and evidence commands.

## References

- `docs/readme-reference.md` — ODD, profiles, model/effort, and skill registry.
- `skills/skill-registry/SKILL.md` — registry refresh contract.
