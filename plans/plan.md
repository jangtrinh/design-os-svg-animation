# SVG Animation Engine architecture + setup

Status: four-section supplement delivered; offline checks pass; integration and dependency/runtime gates pending.

Outcome: finish four requested architecture sections and create a concrete local package scaffold.
Scope: docs, normalized IR contract/validator, dependency/config/script setup, research queue and browser probe. Non-goals: five production compiler implementations, full geometry repair implementation, autonomous daemon, publishing.
Authority: user requested folder setup. Target initially absent. Concurrent writer subsequently created Git repo/AGENTS/CONTEXT, authoring v1.0 and prototype, replacing shared config. Preserve their changes; normalized v0.1 remains supplemental proposal until resolver/authority is reconciled.
Controller/implementer: root Codex. Final checks: direct local commands; independent review to be recorded separately if available. No external messages, public repo or issue created by this session. Native independent reviewer reads only.

## Acceptance

| ID | Check |
|---|---|
| A1 | Motion IR documented, schema+types+fixture, all five target mappings, semantics and unsupported features explicit |
| A2 | AI strengths labelled as inference; geometry/coordinate/physics failures + bounded deterministic repairs |
| A3 | KB modules, evidence lifecycle, retrieval, auto-research triggers/budgets/gates; actual seed/backlog files |
| A4 | Folder, package/config/scripts/toolchain probe exist; Node-only scaffold/queue checks pass; package/runtime blockers disclosed |

## Decisions

Canonical IR uses explicit cubic geometry and timeline; intent-level spring/constraints resolved upstream. Capability refusal before emit. Lottie JSON is rendered via SVG player; not a standalone animated SVG export. Exact baseline pins, no fabricated lockfile. No remote configured at latest read. Preserve concurrent Git commit; no commit/push by this session. Proposed package manifest kept separate to avoid overwrite.

## Work state

Four-part supplement and separate package proposal delivered. Offline static check and queue pass. Independent review rechecked disclosure fixes; no scoped new findings. Concurrent shared README/package remain untouched; integration unresolved. Runtime tests blocked by missing Ajv and npm DNS. Evidence: [verification](reports/verification.md), [independent review](reports/independent-review.md).

## Follow-up acceptance (not implemented)

1. Resolve install + dependency tree/advisories; lock; typecheck + schema/test/build + browser probe.
2. Import/sanitize and deterministic evaluator on real SVG, then portable opacity/transform emitters across five backends.
3. Geometry repair and backend conformance corpus; independent visual qualification.
4. Bounded research executor + independent promotion gate.
