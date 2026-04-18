"""Data models for SOC workflow pipeline."""

from __future__ import annotations

from dataclasses import asdict, dataclass
import json
from typing import Any


@dataclass
class Alert:
    id: str
    timestamp: str | None
    rule_name: str
    severity: str
    host_name: str | None
    raw_message: str | None
    source: dict[str, Any]

    def to_json(self) -> str:
        return json.dumps(asdict(self), indent=2, ensure_ascii=True)


@dataclass
class EnrichedAlert:
    alert: Alert
    summary: str
    likely_attack_stage: str
    confidence: float
    recommended_actions: list[str]
    escalation_priority: str
    rationale: str
    raw_model_output: dict[str, Any]

    def to_json(self) -> str:
        return json.dumps(asdict(self), indent=2, ensure_ascii=True)


@dataclass
class JiraTicketResult:
    issue_key: str
    issue_url: str
    created: bool
    response: dict[str, Any]

    def to_json(self) -> str:
        return json.dumps(asdict(self), indent=2, ensure_ascii=True)

