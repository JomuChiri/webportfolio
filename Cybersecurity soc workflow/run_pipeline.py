"""End-to-end SOC pipeline runner.

Flow:
1) Pull alerts from Elastic
2) Enrich each alert with AI
3) Create Jira tickets
"""

from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
import argparse
import json
import os
import traceback

from ai_layer.ai_enrich import enrich_alert
from elastic_scripts.elastic_pull import fetch_alerts
from jira_integration.jira_ticket import create_jira_ticket
from soc_workflow.config import get_settings
from soc_workflow.guardrails import evaluate_guardrails


def _load_dotenv(dotenv_path: str = ".env") -> None:
    path = Path(dotenv_path)
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


def _serialize_result(item: dict) -> str:
    return json.dumps(item, ensure_ascii=True, indent=2)


def main() -> int:
    parser = argparse.ArgumentParser(description="Run SOC AI workflow pipeline.")
    parser.add_argument("--dotenv", default=".env", help="Path to .env file.")
    parser.add_argument(
        "--max-alerts",
        type=int,
        default=None,
        help="Override max alerts for this run.",
    )
    parser.add_argument(
        "--output",
        default="pipeline_run_output.json",
        help="Path to write run artifacts.",
    )
    args = parser.parse_args()

    _load_dotenv(args.dotenv)
    settings = get_settings()
    now = datetime.now(timezone.utc).isoformat()
    results: dict = {
        "run_started_utc": now,
        "mode": settings.mode,
        "dry_run": settings.dry_run,
        "processed_alerts": [],
        "errors": [],
    }

    print(f"Pipeline mode={settings.mode} dry_run={settings.dry_run}")
    try:
        alerts = fetch_alerts(settings, max_alerts=args.max_alerts)
        print(f"Fetched {len(alerts)} alert(s)")
    except Exception as exc:
        results["errors"].append(f"Elastic pull failed: {exc}")
        print(f"[ERROR] Elastic pull failed: {exc}")
        Path(args.output).write_text(_serialize_result(results), encoding="utf-8")
        return 1

    for alert in alerts:
        per_alert: dict = {
            "alert_id": alert.id,
            "rule_name": alert.rule_name,
            "severity": alert.severity,
        }
        try:
            enriched = enrich_alert(alert, settings)
            per_alert["enrichment"] = {
                "summary": enriched.summary,
                "likely_attack_stage": enriched.likely_attack_stage,
                "confidence": enriched.confidence,
                "escalation_priority": enriched.escalation_priority,
                "recommended_actions": enriched.recommended_actions,
            }
            print(f"[ENRICHED] {alert.id} -> {enriched.escalation_priority}")
        except Exception as exc:
            per_alert["error"] = f"AI enrichment failed: {exc}"
            results["errors"].append(per_alert["error"])
            print(f"[ERROR] AI enrichment failed for {alert.id}: {exc}")
            traceback.print_exc()
            results["processed_alerts"].append(per_alert)
            continue

        guardrail = evaluate_guardrails(enriched)
        per_alert["guardrails"] = {
            "should_create_ticket": guardrail.should_create_ticket,
            "flags": guardrail.flags,
            "reason": guardrail.reason,
            "remediation_actions": guardrail.remediation_actions,
        }

        if not guardrail.should_create_ticket:
            print(f"[GUARDRAIL] {alert.id} blocked auto-ticket: {guardrail.reason}")
            results["processed_alerts"].append(per_alert)
            continue

        try:
            ticket = create_jira_ticket(enriched, settings)
            per_alert["jira"] = {
                "issue_key": ticket.issue_key,
                "issue_url": ticket.issue_url,
                "created": ticket.created,
            }
            print(f"[JIRA] {alert.id} -> {ticket.issue_key} (created={ticket.created})")
        except Exception as exc:
            per_alert["error"] = f"Jira ticket creation failed: {exc}"
            results["errors"].append(per_alert["error"])
            print(f"[ERROR] Jira ticket creation failed for {alert.id}: {exc}")
            traceback.print_exc()

        results["processed_alerts"].append(per_alert)

    Path(args.output).write_text(_serialize_result(results), encoding="utf-8")
    print(f"Run artifacts written to {args.output}")
    print(f"Completed with {len(results['errors'])} error(s)")
    return 0 if not results["errors"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
