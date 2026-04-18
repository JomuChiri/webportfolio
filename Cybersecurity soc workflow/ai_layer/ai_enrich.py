"""AI enrichment for SOC alerts."""

from __future__ import annotations

import json

import requests

from soc_workflow.config import Settings, get_settings
from soc_workflow.models import Alert, EnrichedAlert


def _build_prompt(alert: Alert) -> str:
    return (
        "You are a SOC triage assistant. Analyze this alert and return JSON with keys: "
        "summary, likely_attack_stage, confidence, recommended_actions (array of strings), "
        "escalation_priority (P1/P2/P3/P4), and rationale.\n\n"
        f"Alert ID: {alert.id}\n"
        f"Timestamp: {alert.timestamp}\n"
        f"Rule Name: {alert.rule_name}\n"
        f"Severity: {alert.severity}\n"
        f"Host Name: {alert.host_name}\n"
        f"Raw Message: {alert.raw_message}\n"
        f"Source JSON: {json.dumps(alert.source, ensure_ascii=True)}\n"
    )


def _mock_enrichment(alert: Alert) -> EnrichedAlert:
    severity_map = {"critical": "P1", "high": "P1", "medium": "P2", "low": "P3"}
    priority = severity_map.get(alert.severity.lower(), "P3")
    return EnrichedAlert(
        alert=alert,
        summary=f"Potential security event detected: {alert.rule_name}.",
        likely_attack_stage="Initial Access" if "login" in alert.rule_name.lower() else "Execution",
        confidence=0.72,
        recommended_actions=[
            "Validate source account and host context in SIEM timeline.",
            "Correlate with recent endpoint process activity.",
            "Isolate affected host if malicious behavior is confirmed.",
        ],
        escalation_priority=priority,
        rationale="Mock enrichment based on rule name and severity heuristic.",
        raw_model_output={"mode": "mock"},
    )


def _parse_model_json(text: str) -> dict:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        cleaned = cleaned.replace("json", "", 1).strip()
    return json.loads(cleaned)


def enrich_alert(alert: Alert, settings: Settings) -> EnrichedAlert:
    """Enrich a single alert with model-generated SOC context."""
    if settings.mode == "mock" or not settings.openai_api_key:
        return _mock_enrichment(alert)

    payload = {
        "model": settings.openai_model,
        "input": _build_prompt(alert),
    }
    headers = {
        "Authorization": f"Bearer {settings.openai_api_key}",
        "Content-Type": "application/json",
    }
    response = requests.post(
        settings.openai_base_url.rstrip("/") + "/responses",
        headers=headers,
        json=payload,
        timeout=settings.http_timeout_seconds,
    )
    response.raise_for_status()
    body = response.json()

    output_text = body.get("output_text", "").strip()
    if not output_text:
        # Fallback: capture output content shape if output_text is unavailable.
        output_text = json.dumps(body, ensure_ascii=True)

    try:
        parsed = _parse_model_json(output_text)
        return EnrichedAlert(
            alert=alert,
            summary=str(parsed.get("summary", "No summary provided.")),
            likely_attack_stage=str(parsed.get("likely_attack_stage", "Unknown")),
            confidence=float(parsed.get("confidence", 0.5)),
            recommended_actions=[
                str(item) for item in parsed.get("recommended_actions", []) if item
            ][:6],
            escalation_priority=str(parsed.get("escalation_priority", "P3")),
            rationale=str(parsed.get("rationale", "No rationale provided.")),
            raw_model_output=body,
        )
    except Exception:
        return EnrichedAlert(
            alert=alert,
            summary=output_text[:500],
            likely_attack_stage="Unknown",
            confidence=0.4,
            recommended_actions=[
                "Review raw model output in pipeline logs.",
                "Perform manual triage before escalation.",
            ],
            escalation_priority="P3",
            rationale="Model output could not be parsed as strict JSON.",
            raw_model_output=body,
        )


def _cli() -> None:
    settings = get_settings()
    test_alert = Alert(
        id="demo-alert",
        timestamp="2026-01-01T00:00:00Z",
        rule_name="Suspicious Command Execution",
        severity="high",
        host_name="demo-host",
        raw_message="Potential command-and-control activity.",
        source={"demo": True},
    )
    print(enrich_alert(test_alert, settings).to_json())


if __name__ == "__main__":
    _cli()
