# Changelog

## Unreleased

- Phase 0: initial PRD, TRD, SDLC, README skeleton, `.env.example`.
- Phase 1+2: `contracts/opennotum.py` — create_case/resolve/views, all three
  modes, full deterministic validation, live fetch + LLM judgement reconciled
  via `gl.eq_principle.prompt_comparative`. Not yet deployed to Studionet.
- Phase 3: Next.js 15 frontend (create form, docket, receipt, templates,
  how-it-works) wired to `lib/genlayer.ts`/`lib/cases.ts`. `npm run
  typecheck` and `npm run build` pass; verified in-browser against an
  unconfigured contract.
