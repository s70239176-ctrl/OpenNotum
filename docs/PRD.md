# OpenNotum — Product Requirements Document

## Summary

OpenNotum is a public web-attestation desk built on GenLayer Studionet. A
filer submits a case — a URL and a claim, a set of URLs and a question, or a
built-in template — and any account can trigger resolution: GenLayer
validators independently fetch the live page(s), judge them with an LLM under
the network's Equivalence Principle, and the contract records a verdict.
Every case is a durable, shareable, on-chain receipt.

OpenNotum is **not** a licensed notarial act and is **not legally binding**.
Studionet is a development network; its state can and does reset.

## Problem

Claims about the live web ("the release is out", "the sources disagree",
"the flight is delayed") are asserted constantly and verified rarely. There
is no lightweight, neutral, timestamped way to say "as of this moment, here
is what independent observers found when they actually looked" without
standing up your own infrastructure or trusting a single centralized
checker.

## Users

- A person who wants a timestamped, shareable record that a specific claim
  about a specific URL was true (or false, or unverifiable) at a specific
  moment.
- A person comparing two or three sources that may disagree and wants a
  neutral read on whether they agree.
- A person checking a narrow, well-defined fact against a known-shape source
  (a GitHub release tag, an investor-relations page, a public status page).

## Scope

### In scope — three filing modes, one contract, mutually exclusive

**Mode A — Snapshot**
- Inputs: exactly one `https` URL, one plain-English claim.
- Verdict: `CONFIRMED | CHANGED | GONE | INSUFFICIENT`.

**Mode B — Conflict**
- Inputs: two or three distinct `https` URLs, one question.
- Verdict: `AGREED | CONFLICT | INSUFFICIENT`.

**Mode C — Template**
- Inputs: a `template_id` plus that template's fields. No free-form URLs.
- Built-in templates only, exactly three:
  1. `github_release` — repo URL (`https://github.com/{owner}/{repo}`) +
     expected tag. Verdict is judged against the repo's releases page.
  2. `company_ir` — official investor-relations/news URL + a claim about an
     announcement.
  3. `status_page` — public status/ops/airline page + a claim about current
     status.
- Verdict: `PASS | FAIL | INSUFFICIENT`.

A case has exactly one mode for its whole lifetime. The contract rejects
mixed or malformed inputs deterministically, before any network or LLM call.

### Out of scope (explicitly, do not build)

- Escrow, payments beyond GenLayer transaction fees, tokens, NFTs.
- Legal notary language, e-signatures, identity/KYC.
- TLS Notary / zkTLS proof marketplace.
- User-defined custom templates (only the three built-ins).
- A backend database — the contract is the sole source of truth.
- Deployment to Bradbury, Asimov, or mainnet.
- Admin backdoors that rewrite verdicts.
- Storing raw HTML, full page text, or screenshots on-chain.
- Hardcoded or faked verdicts in the frontend. Sample *inputs* are allowed,
  and must be visibly labeled "Sample".

## Functional requirements

- Anyone can create a case in any of the three modes.
- Anyone can call `resolve` on an `OPEN` case (permissionless resolution).
- Resolution is idempotent: resolving an already-`FINAL` (or `FAILED`) case
  is rejected, not silently reprocessed.
- All verdicts are produced by fetching the live page(s) inside the
  contract's nondeterministic block and judging them with an LLM, reconciled
  across validators via GenLayer's Equivalence Principle. No verdict is ever
  invented in the frontend.
- Every case is readable by id, and the latest cases and a filer's cases are
  listable, without needing off-chain indexing.
- The UI must make every write's pending/success/error state visible, and
  must re-read the contract after finalization rather than optimistically
  painting a result.

## Non-functional requirements

- Studionet only. Network identity (RPC, chain id, explorer, contract
  address) driven entirely by environment variables, never hardcoded per
  environment.
- No secrets committed. No raw page bodies stored on-chain — only short,
  bounded extracted facts (`source_notes`).
- Input caps (claim/question length, URL count) to bound state growth and
  gas/LLM cost per case.
- Accessible, mobile-usable UI with a persistent Studionet/non-legal
  disclaimer banner.

## Verdict semantics (authoritative)

| Mode | Verdict | Meaning |
|---|---|---|
| Snapshot | `CONFIRMED` | Live page substantively supports the claim. |
| Snapshot | `CHANGED` | Page is reachable but does not support the claim. |
| Snapshot | `GONE` | URL returns missing/unavailable (404, hard fail, empty body). |
| Snapshot | `INSUFFICIENT` | Reachable but not judgeable (paywall, block, captcha, ambiguous, unrelated). |
| Conflict | `AGREED` | Sources give a compatible answer to the question. |
| Conflict | `CONFLICT` | Sources give incompatible answers. |
| Conflict | `INSUFFICIENT` | Cannot retrieve or interpret enough evidence to decide. |
| Template | `PASS` | The template-specific condition holds. |
| Template | `FAIL` | The template-specific condition does not hold. |
| Template | `INSUFFICIENT` | Cannot determine (fetch failure, ambiguous source). |

## Success criteria

- A user can file a case in each of the three modes, resolve it, and get a
  verdict that traces to a real fetch of a real live page — demonstrable
  live against a deployed Studionet address, not a mock.
- Deterministic validation rejects every malformed input class listed in the
  TRD before any nondet/LLM call is made.
- `npm run build` (frontend) and the contract test suite both pass with a
  documented test list covering the failure states above.
- README carries a live demo link, the deployed Studionet address, and an
  honest limitations section.

## Risks / limitations (must be stated in the UI and README)

- LLM judgement has irreducible variance; verdicts are a good-faith read, not
  a legal fact.
- Pages change or disappear after a case is filed; a verdict reflects the
  page at resolution time only.
- Studionet is a development network and can reset, deleting all case
  history.
- This is not a licensed notarial act and creates no legal effect.
