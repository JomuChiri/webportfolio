"""Jira ticket automation for enriched SOC alerts."""

from __future__ import annotations

import base64
import hashlib
from datetime import datetime, timezone

import requests

from soc_workflow.config import Settings, get_settings
from soc_workflow.models import EnrichedAlert, JiraTicketResult


def _build_description(enriched: EnrichedAlert) -> str:
    alert = enriched.alert
    actions = "\n".join(f"- {item}" for item in enriched.recommended_actions) or "- None"
    return (
        f"h3. SOC Alert Enrichment\n"
        f"*Alert ID:* {alert.id}\n"
        f"*Timestamp:* {alert.timestamp}\n"
        f"*Rule:* {alert.rule_name}\n"
        f"*Severity:* {alert.severity}\n"
        f"*Host:* {alert.host_name or 'n/a'}\n\n"
        f"h4. AI Summary\n{enriched.summary}\n\n"
        f"*Likely Attack Stage:* {enriched.likely_attack_stage}\n"
        f"*Confidence:* {enriched.confidence}\n"
        f"*Escalation Priority:* {enriched.escalation_priority}\n\n"
        f"h4. Recommended Actions\n{actions}\n\n"
        f"h4. Rationale\n{enriched.rationale}\n"
    )


def _auth_header(email: str, token: str) -> str:
    value = f"{email}:{token}".encode("utf-8")
    return base64.b64encode(value).decode("utf-8")


def create_jira_ticket(enriched: EnrichedAlert, settings: Settings) -> JiraTicketResult:
    """Create Jira ticket for one enriched alert."""
    if settings.mode == "mock" or settings.dry_run:
        digest = hashlib.sha1(enriched.alert.id.encode("utf-8")).hexdigest()[:6].upper()
        fake_key = f"MOCK-{datetime.now(timezone.utc).strftime('%H%M%S')}-{digest}"
        return JiraTicketResult(
            issue_key=fake_key,
            issue_url=f"{settings.jira_base_url.rstrip('/')}/browse/{fake_key}",
            created=False,
            response={"mode": "mock_or_dry_run"},
        )

    url = settings.jira_base_url.rstrip("/") + "/rest/api/3/issue"
    headers = {
        "Authorization": f"Basic {_auth_header(settings.jira_email, settings.jira_api_token)}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }

    fields: dict = {
        "project": {"key": settings.jira_project_key},
        "summary": f"[SOC] {enriched.alert.rule_name} ({enriched.alert.severity})",
        "description": _build_description(enriched),
        "issuetype": {"name": settings.jira_issue_type},
        "priority": {"name": settings.jira_default_priority},
        "labels": ["soc", "ai-enriched"],
    }
    if settings.jira_assignee_account_id:
        fields["assignee"] = {"accountId": settings.jira_assignee_account_id}

    payload = {"fields": fields}
    response = requests.post(
        url,
        headers=headers,
        json=payload,
        timeout=settings.http_timeout_seconds,
    )
    response.raise_for_status()
    body = response.json()
    issue_key = body.get("key", "UNKNOWN")
    return JiraTicketResult(
        issue_key=issue_key,
        issue_url=f"{settings.jira_base_url.rstrip('/')}/browse/{issue_key}",
        created=True,
        response=body,
    )


def _cli() -> None:
    from soc_workflow.models import Alert, EnrichedAlert

    settings = get_settings()
    alert = Alert(
        id="demo-alert",
        timestamp="2026-01-01T00:00:00Z",
        rule_name="Demo Alert",
        severity="medium",
        host_name="demo",
        raw_message="Demo message",
        source={},
    )
    enriched = EnrichedAlert(
        alert=alert,
        summary="Demo summary",
        likely_attack_stage="Execution",
        confidence=0.5,
        recommended_actions=["Investigate process tree."],
        escalation_priority="P2",
        rationale="Demo rationale",
        raw_model_output={"demo": True},
    )
    print(create_jira_ticket(enriched, settings).to_json())


if __name__ == "__main__":
    _cli()
