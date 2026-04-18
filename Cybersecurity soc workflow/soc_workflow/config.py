"""Environment-driven settings for SOC pipeline."""

from __future__ import annotations

import os
from dataclasses import dataclass


def _as_bool(value: str | None, default: bool = False) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "y", "on"}


@dataclass(frozen=True)
class Settings:
    mode: str
    http_timeout_seconds: int
    pipeline_max_alerts: int
    dry_run: bool

    elastic_base_url: str
    elastic_api_key: str
    elastic_index: str
    elastic_query_file: str | None
    elastic_verify_ssl: bool

    openai_base_url: str
    openai_api_key: str
    openai_model: str

    jira_base_url: str
    jira_email: str
    jira_api_token: str
    jira_project_key: str
    jira_issue_type: str
    jira_default_priority: str
    jira_assignee_account_id: str | None


def get_settings() -> Settings:
    return Settings(
        mode=os.getenv("SOC_MODE", "mock").strip().lower(),
        http_timeout_seconds=int(os.getenv("HTTP_TIMEOUT_SECONDS", "30")),
        pipeline_max_alerts=int(os.getenv("PIPELINE_MAX_ALERTS", "5")),
        dry_run=_as_bool(os.getenv("DRY_RUN"), default=True),
        elastic_base_url=os.getenv("ELASTIC_BASE_URL", "https://localhost:9200"),
        elastic_api_key=os.getenv("ELASTIC_API_KEY", ""),
        elastic_index=os.getenv("ELASTIC_INDEX", ".alerts-security.alerts-default"),
        elastic_query_file=os.getenv("ELASTIC_QUERY_FILE"),
        elastic_verify_ssl=_as_bool(os.getenv("ELASTIC_VERIFY_SSL"), default=True),
        openai_base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
        openai_api_key=os.getenv("OPENAI_API_KEY", ""),
        openai_model=os.getenv("OPENAI_MODEL", "gpt-4.1-mini"),
        jira_base_url=os.getenv("JIRA_BASE_URL", "https://your-domain.atlassian.net"),
        jira_email=os.getenv("JIRA_EMAIL", ""),
        jira_api_token=os.getenv("JIRA_API_TOKEN", ""),
        jira_project_key=os.getenv("JIRA_PROJECT_KEY", "SOC"),
        jira_issue_type=os.getenv("JIRA_ISSUE_TYPE", "Task"),
        jira_default_priority=os.getenv("JIRA_DEFAULT_PRIORITY", "Medium"),
        jira_assignee_account_id=os.getenv("JIRA_ASSIGNEE_ACCOUNT_ID"),
    )

