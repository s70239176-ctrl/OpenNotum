# OpenNotum — SDLC

Phases run in order. Each phase has an explicit exit condition. Do not start
the next phase with a red build, and do not skip a phase to "simplify"
unless genuinely blocked — if blocked, say so and stop rather than silently
descoping.

## Phase 0 — Definition

Deliverables: `docs/PRD.md`, `docs/TRD.md`, `docs/SDLC.md` (this file),
`README.md` skeleton.

Exit: all four exist and match the product/technical rules in the build
brief; no implementation code yet.

## Phase 1 — Contract MVP

Deliverables: contract module with `create_case` and the view methods, full
deterministic validation, no nondet/LLM logic wired yet (or stubbed clearly
as not-yet-implemented).

Exit: contract loads in GenLayer Studio; `create_case` + `get_case` work end
to end for a valid case in each mode; every validation rule in the TRD is
individually rejected with a distinct error.

## Phase 2 — Resolve

Deliverables: `resolve` wired to live `gl.nondet.web` fetch + LLM judgement
+ Equivalence Principle consensus, for all three modes.

Exit: one happy-path resolution per mode (Snapshot, Conflict, Template)
verified against Studio/Studionet, producing a real verdict traceable to a
real fetch — not a stub.

## Phase 3 — Frontend MVP

Deliverables: Next.js app — create form, case list, receipt page, write
pending/success/error states — wired to the real deployed Studionet
address.

Exit: `npm run build` passes; a user can file a case and see the resulting
contract state reflected in the UI after finalization.

## Phase 4 — Hardening

Deliverables: contract tests for empty input, bad URL, duplicate Conflict
URLs, resolving twice, a missing/404 page, and an ambiguous page; frontend
error states for wrong network/env.

Exit: the test list above is documented with pass/fail status, and every
failure state is visibly reachable in the UI (not just logged to console).

## Phase 5 — Deploy + package

Deliverables: Studionet contract address recorded in `README.md` and
`.env.example`; frontend deployed (Vercel-ready); limitations section
written honestly.

Exit: live demo link + explorer link + labeled sample evidence all present
and working from a cold README read.

## After each phase

Summarize: what changed (diff-level), what was actually verified (not
assumed), and what remains broken or unimplemented. A phase is not "done"
if its exit condition hasn't been checked.

## Non-negotiables (apply across all phases)

- This build brief is the source of truth for product scope; official
  GenLayer docs are the source of truth for SDK syntax.
- Never mix filing modes; never add a fourth template; never add escrow,
  payments, or tokens.
- Verdict logic lives in the contract only, never in the frontend.
- If forced to choose between adding a feature and polishing the three
  existing modes, polish wins.
