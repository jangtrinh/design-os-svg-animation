# Native independent review

Date: 2026-09-21. Reviewer: native read-only subagent svg_scaffold_review. Controller authored files; reviewer made no edits. Scope: supplemental docs, schema/types/validator, scripts/tests, toolchain probe and live shared-file drift.

## Initial findings

1. High: live shared package lost scaffold scripts and omitted Ajv/Vite/Lottie/Polymorph/OpenType dependencies; Node tests failed before assertions with ERR_MODULE_NOT_FOUND ajv.
2. High: concurrently authored Motion IR v1.0 and normalized schema v0.1 appeared to claim the same authority despite incompatible shapes; no resolver.
3. Medium: shared README/package claim production-grade, while normalized compilers are unimplemented and runtime checks absent.

## Focused re-review after remediation

Findings 1 and 2 resolved at supplementary-documentation level: setup now distinguishes working direct Node commands from a separate proposed manifest; supplement explicitly separates authoring v1.0 and proposed normalized v0.1 with conversion requirements and no implemented resolver. Runtime integration remains pending. Finding 3 remains in externally owned shared files and was not overwritten.

Independent commands: node scripts/check-scaffold.mjs PASS (59 files at review); node scripts/research-queue.mjs PASS (5 pending). Initial node --test tests/motion-ir.test.mjs exited 1 because Ajv was unavailable; zero assertions executed. No browser rendering, npm dependency qualification, font shaping or morph geometry qualification claimed.

Status: DONE_WITH_CONCERNS
Summary: Four-part supplement and architecture boundaries reviewed; scoped disclosure fixes verified.
Concerns/Blockers: Manifest ownership/integration, resolver implementation, package installation, runtime/render verification and external readiness wording remain unresolved.
