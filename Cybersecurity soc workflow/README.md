# SOC AI Workflow

AI-augmented SOC pipeline that executes:

1. Pull alerts from Elastic SIEM
2. Enrich alerts with an LLM
3. Apply guardrails and remediation recommendations
4. Create Jira issues for analyst triage

The project ships with a mock mode (no credentials needed) and a live mode (real APIs).

## Repository Structure

- `elastic_scripts/elastic_pull.py`: Elastic retrieval client
- `ai_layer/ai_enrich.py`: AI enrichment logic
- `jira_integration/jira_ticket.py`: Jira issue creation
- `soc_workflow/config.py`: environment settings
- `soc_workflow/models.py`: shared dataclasses
- `soc_workflow/guardrails.py`: policy checks and remediation guidance
- `run_pipeline.py`: end-to-end orchestrator
- `docs/`: case study and setup artifacts

## Quick Start

1. Install dependencies:

```bash
python -m pip install -r requirements.txt
```

2. Copy env template and edit values:

```bash
cp .env.example .env
```

3. Run in mock mode (default):

```bash
python run_pipeline.py
```

4. Run in live mode:

- Set `SOC_MODE=live`
- Set `DRY_RUN=false`
- Populate Elastic, OpenAI, and Jira credentials in `.env`

Then run:

```bash
python run_pipeline.py --max-alerts 10 --output pipeline_run_output.json
```

## Output

Each run writes `pipeline_run_output.json` with:

- run metadata
- per-alert enrichment summary
- guardrail decision and remediation actions
- Jira issue key/URL when created
- any stage errors

## Docs

- `docs/elastic_jira_case_study.md`
- `docs/tracker_template.md`
- `docs/elastic_query_example.json`
