"""Phase 4 hardening tests for contracts/opennotum.py.

Deterministic-validation tests exercise create_case()'s real code directly.
resolve()-path tests stub gl.nondet.web.get / gl.nondet.exec_prompt (there is
no GenVM here) and run in "direct mode" — a single pass through the same
evaluate() function real validators would each run, without the actual
multi-validator consensus round. See tests/genlayer_stub.py.

This complements, not replaces, the Studionet integration checks already
performed against the live deployed contract (see README's "Live demo" and
recorded case #1/#2).
"""

import json

import pytest


# ---------------------------------------------------------------------------
# create_case: deterministic validation (TRD section 5.3)
# ---------------------------------------------------------------------------


def test_valid_snapshot_case_is_created(contract):
    case_id = contract.create_case("SNAPSHOT", "A real claim.", "https://example.com", "", "")
    assert case_id == "1"
    record = json.loads(contract.get_case(case_id))
    assert record["mode"] == "SNAPSHOT"
    assert record["status"] == "OPEN"
    assert record["urls"] == ["https://example.com"]


def test_valid_conflict_case_is_created(contract):
    case_id = contract.create_case(
        "CONFLICT", "Do these agree?", "https://a.example.com,https://b.example.com", "", ""
    )
    record = json.loads(contract.get_case(case_id))
    assert record["mode"] == "CONFLICT"
    assert record["urls"] == ["https://a.example.com", "https://b.example.com"]


def test_valid_template_case_is_created(contract):
    fields = json.dumps({"repo_url": "https://github.com/acme/repo", "expected_tag": "v1.0.0"})
    case_id = contract.create_case("TEMPLATE", "check the release", "", "github_release", fields)
    record = json.loads(contract.get_case(case_id))
    assert record["mode"] == "TEMPLATE"
    assert record["template_id"] == "github_release"
    assert record["template_fields"]["expected_tag"] == "v1.0.0"


def test_empty_claim_is_rejected(contract, UserError):
    with pytest.raises(UserError):
        contract.create_case("SNAPSHOT", "   ", "https://example.com", "", "")


def test_claim_over_length_cap_is_rejected(contract, UserError):
    with pytest.raises(UserError):
        contract.create_case("SNAPSHOT", "x" * 501, "https://example.com", "", "")


def test_non_https_url_is_rejected(contract, UserError):
    with pytest.raises(UserError):
        contract.create_case("SNAPSHOT", "claim", "http://example.com", "", "")


def test_snapshot_requires_exactly_one_url(contract, UserError):
    with pytest.raises(UserError):
        contract.create_case("SNAPSHOT", "claim", "https://a.com,https://b.com", "", "")


def test_conflict_requires_two_or_three_urls(contract, UserError):
    with pytest.raises(UserError):
        contract.create_case("CONFLICT", "question", "https://a.com", "", "")


def test_conflict_rejects_more_than_three_urls(contract, UserError):
    with pytest.raises(UserError):
        contract.create_case(
            "CONFLICT",
            "question",
            "https://a.com,https://b.com,https://c.com,https://d.com",
            "",
            "",
        )


def test_conflict_rejects_duplicate_urls(contract, UserError):
    with pytest.raises(UserError):
        contract.create_case(
            "CONFLICT", "question", "https://a.com,https://A.com", "", ""
        )


def test_unknown_mode_is_rejected(contract, UserError):
    with pytest.raises(UserError):
        contract.create_case("BOGUS", "claim", "https://example.com", "", "")


def test_template_requires_known_template_id(contract, UserError):
    with pytest.raises(UserError):
        contract.create_case("TEMPLATE", "claim", "", "not_a_real_template", "{}")


def test_template_requires_its_required_fields(contract, UserError):
    with pytest.raises(UserError):
        contract.create_case(
            "TEMPLATE", "claim", "", "github_release", json.dumps({"repo_url": "https://github.com/a/b"})
        )


def test_github_release_requires_github_host(contract, UserError):
    fields = json.dumps({"repo_url": "https://gitlab.com/acme/repo", "expected_tag": "v1.0.0"})
    with pytest.raises(UserError):
        contract.create_case("TEMPLATE", "claim", "", "github_release", fields)


def test_snapshot_mode_rejects_template_fields(contract, UserError):
    with pytest.raises(UserError):
        contract.create_case(
            "SNAPSHOT", "claim", "https://example.com", "github_release", json.dumps({"a": "b"})
        )


# ---------------------------------------------------------------------------
# resolve(): status transitions and the nondet-dependent verdict paths
# ---------------------------------------------------------------------------


def _stub_llm(monkeypatch, gl, verdict, **overrides):
    body = {
        "verdict": verdict,
        "confidence": "high",
        "reasons": ["stubbed reason"],
        "risk_flags": [],
        "source_notes": ["stubbed note"],
    }
    body.update(overrides)
    monkeypatch.setattr(gl.nondet, "exec_prompt", lambda *a, **kw: body)


def test_resolve_on_reachable_page_uses_llm_verdict(contract, gl, monkeypatch):
    case_id = contract.create_case("SNAPSHOT", "claim", "https://example.com", "", "")
    monkeypatch.setattr(gl.nondet.web, "get", lambda url: "<html>a real page</html>")
    _stub_llm(monkeypatch, gl, "CONFIRMED")

    verdict = contract.resolve(case_id)

    assert verdict == "CONFIRMED"
    record = json.loads(contract.get_case(case_id))
    assert record["status"] == "FINAL"
    assert record["verdict"] == "CONFIRMED"


def test_resolve_on_dead_snapshot_url_forces_gone(contract, gl, monkeypatch):
    """A missing/unreachable page must resolve to GONE, not whatever the LLM guessed."""
    case_id = contract.create_case("SNAPSHOT", "claim", "https://dead.example.com", "", "")

    def failing_fetch(url):
        raise RuntimeError("404 not found")

    monkeypatch.setattr(gl.nondet.web, "get", failing_fetch)
    _stub_llm(monkeypatch, gl, "CONFIRMED")  # LLM never gets real evidence — GONE must win anyway

    verdict = contract.resolve(case_id)

    assert verdict == "GONE"
    record = json.loads(contract.get_case(case_id))
    assert record["status"] == "FINAL"
    assert "fetch_failed" in record["risk_flags"]


def test_resolve_on_ambiguous_page_is_insufficient(contract, gl, monkeypatch):
    case_id = contract.create_case("SNAPSHOT", "claim", "https://example.com", "", "")
    monkeypatch.setattr(gl.nondet.web, "get", lambda url: "<html>unrelated content</html>")
    _stub_llm(monkeypatch, gl, "INSUFFICIENT")

    verdict = contract.resolve(case_id)

    assert verdict == "INSUFFICIENT"
    record = json.loads(contract.get_case(case_id))
    assert record["status"] == "FINAL"


def test_resolving_a_final_case_again_is_rejected(contract, gl, monkeypatch, UserError):
    case_id = contract.create_case("SNAPSHOT", "claim", "https://example.com", "", "")
    monkeypatch.setattr(gl.nondet.web, "get", lambda url: "<html>ok</html>")
    _stub_llm(monkeypatch, gl, "CONFIRMED")
    contract.resolve(case_id)

    with pytest.raises(UserError):
        contract.resolve(case_id)


def test_resolving_unknown_case_is_rejected(contract, UserError):
    with pytest.raises(UserError):
        contract.resolve("999")


def test_malformed_llm_output_fails_the_case(contract, gl, monkeypatch, UserError):
    """An LLM response missing a valid verdict field must FAIL the case, not silently pass."""
    case_id = contract.create_case("SNAPSHOT", "claim", "https://example.com", "", "")
    monkeypatch.setattr(gl.nondet.web, "get", lambda url: "<html>ok</html>")
    monkeypatch.setattr(gl.nondet, "exec_prompt", lambda *a, **kw: {"verdict": "NOT_A_REAL_VERDICT"})

    with pytest.raises(UserError):
        contract.resolve(case_id)

    record = json.loads(contract.get_case(case_id))
    assert record["status"] == "FAILED"
