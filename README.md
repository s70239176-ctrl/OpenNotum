# OpenNotum

Public web attestation on GenLayer Studionet. File a case. Validators fetch
live pages. The network issues a shareable receipt.

> **Not a licensed notarial act. Not legally binding.** Studionet is a
> development network — recorded cases may reset.

## Live demo

https://opennotum.vercel.app/

## Network

| | Value |
|---|---|
| Network | GenLayer Studionet |
| RPC | `https://studio.genlayer.com/api` |
| Chain ID | `61999` |
| Explorer | `https://explorer-studio.genlayer.com` |
| Contract address | [`0xd162391B0EB47dD06D3eB0E5b92974E03B0e6c34`](https://explorer-studio.genlayer.com/address/0xd162391B0EB47dD06D3eB0E5b92974E03B0e6c34) |

## How it works

1. **File a case** in one of three modes:
   - **Snapshot** — one URL, one claim. Verdict: `CONFIRMED / CHANGED / GONE / INSUFFICIENT`.
   - **Conflict** — two or three URLs, one question. Verdict: `AGREED / CONFLICT / INSUFFICIENT`.
   - **Template** — a built-in template (`github_release`, `company_ir`,
     `status_page`) plus its fields. Verdict: `PASS / FAIL / INSUFFICIENT`.
2. **Resolve** the case (any account can trigger this). GenLayer validators
   independently fetch the live page(s) inside the contract's
   nondeterministic block, judge the evidence with an LLM, and reconcile
   across validators via the Equivalence Principle.
3. **Read the receipt.** The verdict, reasons, risk flags, and short source
   notes are recorded on-chain and viewable at `/cases/[id]`, permanently
   linkable.

No verdict is ever computed or faked in the frontend — every verdict traces
to a real on-chain resolution.

## Local run

```bash
npm install
cp .env.example .env.local   # fill in NEXT_PUBLIC_CONTRACT_ADDRESS after deploy
npm run dev
```

## Sample evidence

The app's create form includes "Sample" buttons that pre-fill known-good
inputs for each mode (clearly labeled as samples, never submitted silently).

## Contract tests

```bash
pip install pytest
python -m pytest tests/ -v
```

21 direct-mode tests cover every deterministic-validation rejection plus
`resolve()`'s status transitions (dead page → `GONE`, ambiguous page →
`INSUFFICIENT`, resolving twice → rejected, malformed model output →
`FAILED`). See [`docs/SDLC.md`](docs/SDLC.md) Phase 4 for how these stub the
GenVM-only parts.

## Limitations

- LLM judgement carries irreducible variance — a verdict is a good-faith
  read, not a legal fact.
- A verdict reflects the page(s) at resolution time; pages can change or
  disappear afterward.
- Studionet is a development network and can reset, deleting case history.
- This is a decentralized attestation tool, not a licensed notary and not
  legal advice.
- `created_at`/`resolved_at` are currently always empty — the contract's
  `hasattr(gl.message, "timestamp")` check never finds a timestamp on
  Studionet, so no date is recorded. Needs a redeploy with the correct
  GenVM timestamp accessor (not yet confirmed) to fix; the UI shows "—"
  rather than a fabricated date in the meantime.

## Roadmap

- Phase 0 — Definition (this repo's docs) — done.
- Phase 1 — Contract MVP (create + views, full validation) — done.
- Phase 2 — Resolve (live fetch + LLM + consensus) — verified live for
  Snapshot mode (see the contract address above); Conflict and Template
  modes not yet exercised on Studionet.
- Phase 3 — Frontend MVP against the deployed contract — done.
- Phase 4 — Hardening (documented failure-state tests) — done, 21 tests.
- Phase 5 — Deploy + package — contract deployed and verified; frontend
  deployment in progress.

See [`docs/PRD.md`](docs/PRD.md), [`docs/TRD.md`](docs/TRD.md), and
[`docs/SDLC.md`](docs/SDLC.md) for the full spec.
