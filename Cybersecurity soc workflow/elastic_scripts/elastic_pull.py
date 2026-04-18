"""Elastic SIEM alert retrieval for SOC workflow."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import requests

from soc_workflow.config import Settings, get_settings
from soc_workflow.models import Alert


def _normalize_hit(hit: dict[str, Any]) -> Alert:
    source = hit.get("_source", {})
    alert_id = str(hit.get("_id") or source.get("event", {}).get("id") or "unknown-id")
    rule_name = (
        source.get("kibana", {}).get("alert", {}).get("rule", {}).get("name")
        or source.get("signal", {}).get("rule", {}).get("name")
        or source.get("rule", {}).get("name")
        or "Unknown Rule"
    )
    severity = (
        source.get("kibana", {}).get("alert", {}).get("severity")
        or source.get("event", {}).get("severity")
        or source.get("log", {}).get("level")
        or "unknown"
    )
    timestamp = source.get("@timestamp") or source.get("event", {}).get("created")
    host_name = source.get("host", {}).get("name")
    raw_message = source.get("message") or source.get("event", {}).get("original")

    return Alert(
        id=alert_id,
        timestamp=timestamp,
        rule_name=str(rule_name),
        severity=str(severity),
        host_name=str(host_name) if host_name else None,
        raw_message=str(raw_message) if raw_message else None,
        source=source,
    )


def _load_query_from_file(path: str | None) -> dict[str, Any]:
    if not path:
        return {"size": 10, "query": {"match_all": {}}}
    query_path = Path(path)
    if not query_path.exists():
        raise FileNotFoundError(f"Elastic query file not found: {query_path}")
    return json.loads(query_path.read_text(encoding="utf-8"))


def fetch_alerts(settings: Settings, max_alerts: int | None = None) -> list[Alert]:
    """Fetch alerts from Elastic or return local mock data."""
    limit = max_alerts or settings.pipeline_max_alerts

    if settings.mode == "mock":
        mock_alerts = [
            Alert(
                id="mock-1",
                timestamp="2026-01-15T08:42:00Z",
                rule_name="Multiple Failed Logins",
                severity="medium",
                host_name="dc-01",
                raw_message="5 failed login attempts from 10.11.2.56 in 4 minutes.",
                source={"src_ip": "10.11.2.56", "event_type": "auth_failure"},
            ),
            Alert(
                id="mock-2",
                timestamp="2026-01-15T09:17:00Z",
                rule_name="PowerShell Encoded Command",
                severity="high",
                host_name="wkstn-14",
                raw_message="EncodedCommand observed in powershell.exe invocation.",
                source={"user": "analyst-temp", "process": "powershell.exe"},
            ),
        ]
        return mock_alerts[:limit]

    url = f"{settings.elastic_base_url.rstrip('/')}/{settings.elastic_index}/_search"
    headers = {
        "Authorization": f"ApiKey {settings.elastic_api_key}",
        "Content-Type": "application/json",
    }
    payload = _load_query_from_file(settings.elastic_query_file)
    payload["size"] = limit

    response = requests.post(
        url,
        headers=headers,
        json=payload,
        timeout=settings.http_timeout_seconds,
        verify=settings.elastic_verify_ssl,
    )
    response.raise_for_status()
    data = response.json()
    hits = data.get("hits", {}).get("hits", [])
    return [_normalize_hit(hit) for hit in hits]


def _cli() -> None:
    settings = get_settings()
    alerts = fetch_alerts(settings)
    for alert in alerts:
        print(f"[{alert.severity}] {alert.rule_name} ({alert.id})")


if __name__ == "__main__":
    _cli()
