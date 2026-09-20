# Jev-inspired project context anticipation

## Objective
Add an optional, read-only Gentle Shell capability that sends a bounded project snapshot to TypeSafe Jev and returns typed context-routing recommendations, with a personal Pi extension for immediate Windows testing.

## Scope
- Add a reusable package-side context anticipation module/tool in `gentle-shell`.
- Keep TypeSafe integration opt-in and environment-key based (`TYPESAFE_API_KEY`); never persist secrets.
- Reuse existing project/skill/profile context where available, with bounded payloads and redaction.
- Return structured Choice/Score/Noul results with confidence and a deterministic local fallback.
- Add a personal global Pi extension/shortcut only after package behavior is validated.
- Document setup, safety limits, and profile/skill routing usage.

## Non-goals
- Do not let Jev edit files, run commands, choose delivery, or bypass review/approval.
- Do not replace the main coding model; use Jev only for fast typed classification/scoring.
- Do not commit API keys or send raw credentials/secrets.

## Tasks
- [x] Map existing Gentle tool/extension registration and project-context surfaces.
- [x] Design a bounded Jev adapter and typed anticipation schema.
- [x] Implement package-side read-only anticipation command/tool with fallback.
- [x] Add tests for payload redaction, confidence gates, and unavailable-key fallback.
- [x] Add a Pi extension tool (`anticipate_context`) for quick anticipation.
- [x] Add a local workflow performance benchmark (100 iterations, p95 guard).
- [x] Add a bounded JEV-selected read-only tool plan with max-three steps and parallel execution.
- [x] Install missing package skills into the Codex skills directory without overwriting existing skills.
- [x] Add a shared project-context skill with bounded-read and cost-aware rules.
- [ ] Update docs and skill registry if a new skill is added.
- [x] Run targeted checks and record evidence, including the end-to-end fake-JEV workflow.
