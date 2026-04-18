"""Guardrails and remediation decision helpers."""

from __future__ import annotations

from dataclasses import asdict, dataclass
import json

from soc_workflow.models import EnrichedAlert


@dataclass
class GuardrailDecision:
    should_create_ticket: bool
    remediation_actions: list[str]
    flags: list[str]
    reason: str

    def to_json(self) -> str:
        return json.dumps(asdict(self), ensure_ascii=True, indent=2)


def evaluate_guardrails(enriched: EnrichedAlert) -> GuardrailDecision:
    """Apply simple deterministic guardrails before ticket creation."""
    severity = enriched.alert.severity.lower()
    confidence = enriched.confidence
    flags: list[str] = []

    if severity in {"critical", "high"} and confidence < 0.35:
        flags.append("high_severity_low_confidence")

    if not enriched.recommended_actions:
        flags.append("missing_recommended_actions")

    should_create_ticket = True
    reason = "Eligible for Jira ticket creation."
    if "high_severity_low_confidence" in flags:
        should_create_ticket = False
        reason = (
            "Guardrail blocked auto-ticket: high severity alert has low AI confidence. "
            "Manual SOC review required."
        )

    remediation_actions = [
        "Pull correlated endpoint and authentication events for the same host.",
        "Validate whether activity matches approved change windows.",
    ]
    if severity in {"critical", "high"}:
        remediation_actions.append("Prepare host isolation if malicious execution is confirmed.")
    if "login" in enriched.alert.rule_name.lower():
        remediation_actions.append("Reset affected credentials and enforce MFA if compromise is suspected.")

    return GuardrailDecision(
        should_create_ticket=should_create_ticket,
        remediation_actions=remediation_actions,
        flags=flags,
        reason=reason,
    )

