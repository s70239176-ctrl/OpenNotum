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
- Deployed to Studionet (`0xd162391B0EB47dD06D3eB0E5b92974E03B0e6c34`);
  fixed several live bugs found afterward: RPC transport broken by a
  manual chain-object override, missing wallet network switch, "[object
  Object]" error messages, MetaMask-only wallet restriction (reverted to
  support any injected wallet), and explorer links resolving against our
  own domain instead of GenLayer's explorer when an env var was blank.
- Premium 2026 UI redesign (light/editorial design system, navbar +
  mobile nav, hero + smart quick-input, verdict/evidence/receipt cards
  with a real QR code, restyled records/templates pages, an honest
  Network page with no fabricated validator stats) plus a favicon/logo
  mark.
- Phase 4: 21 direct-mode pytest tests against the real contract (see
  `tests/`), covering every deterministic-validation rejection and
  resolve()'s status transitions including forced `GONE`, `INSUFFICIENT`,
  double-resolve rejection, and malformed-model-output `FAILED`.
