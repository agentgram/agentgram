#!/usr/bin/env python3
"""Install the AgentGram release-promote cron runner for kkami.

This installer is intentionally dependency-free because it patches the Hermes
profile cron registry in the operator workspace. It installs the restored
release-promote script into kkami's cron workspace as a fallback, then rewrites
the release-promote cron prompt to prefer the repo-backed script path once the
restored script has landed in the canonical checkout.
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import stat
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Sequence

JOB_ID = "ca3cc60e24bb"
JOB_NAME = "hermes-kkami-agentgram-release-promote"
DEFAULT_JOBS_JSON = Path(
    os.environ.get(
        "AGENTGRAM_RELEASE_PROMOTE_JOBS_JSON",
        "/Users/sweetheart/.hermes/profiles/kkami/cron/jobs.json",
    )
)
DEFAULT_WORKSPACE_SCRIPT = Path(
    os.environ.get(
        "AGENTGRAM_RELEASE_PROMOTE_WORKSPACE_SCRIPT",
        "/Users/sweetheart/.hermes/profiles/kkami/workspace/scripts/agentgram_release_promote.py",
    )
)
DEFAULT_REPO_SCRIPT = Path(
    os.environ.get(
        "AGENTGRAM_RELEASE_PROMOTE_REPO_SCRIPT",
        "/Users/sweetheart/.hermes/projects/agentgram/agentgram/scripts/agentgram_release_promote.py",
    )
)
DEFAULT_SOURCE_SCRIPT = Path(
    os.environ.get(
        "AGENTGRAM_RELEASE_PROMOTE_SOURCE_SCRIPT",
        Path(__file__).resolve().with_name("agentgram_release_promote.py"),
    )
)
DEFAULT_RELEASE_LOG = Path(
    os.environ.get(
        "AGENTGRAM_RELEASE_LOG",
        "/Users/sweetheart/.hermes/shared/knowledge/agentgram/release-log.md",
    )
)


@dataclass(frozen=True)
class InstallResult:
    copied_to: Path
    jobs_json: Path
    job_id: str
    dry_run: bool
    changed_prompt: bool


def build_repo_backed_prompt(*, repo_script: Path, workspace_script: Path, release_log: Path) -> str:
    return f"""## Hermes Runtime Policy
- Document handoff only: communicate with other agents through Markdown/JSON files under ~/.hermes/shared/knowledge or profile workspaces.
- Do not create/contact another agent through direct runtime handoff tools, Discord bot mentions, or ad-hoc CLI agent calls.
- Do not create Discord threads for agent-to-agent coordination.

AgentGram release promote run.

1. Prefer the repo-backed release promote script after merge: `{repo_script}`. If it exists, execute `python3 {repo_script}`.
2. If the repo-backed script is not present yet, fall back to the installed kkami cron workspace copy: `{workspace_script}`. If it exists, execute `python3 {workspace_script}`.
3. If neither script path exists, do not run promotion; append exactly one BLOCKED line to `{release_log}` with both missing paths and the next action to merge/sync the restored repo script, then exit cleanly.
4. If the selected script exits non-zero, inspect the output. If `{release_log}` was not updated for this run, append exactly one blocked/error line with the concrete reason.
5. Do not force-push `main`.
6. If `Enforce develop-only merge to main` is failing, do not attempt merge; leave a BLOCKED log line only.
7. End with a concise outcome summary referencing the release PR number, selected script path, or skip reason.
"""


def load_jobs(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def dump_jobs(payload: dict[str, Any]) -> str:
    return json.dumps(payload, ensure_ascii=False, indent=2) + "\n"


def find_release_promote_job(payload: dict[str, Any]) -> dict[str, Any]:
    jobs = payload.get("jobs")
    if not isinstance(jobs, list):
        raise ValueError("cron registry does not contain a jobs list")
    for job in jobs:
        if not isinstance(job, dict):
            continue
        if job.get("id") == JOB_ID or job.get("name") == JOB_NAME:
            return job
    raise ValueError(f"release promote job not found: {JOB_ID} / {JOB_NAME}")


def install_workspace_copy(*, source_script: Path, workspace_script: Path, dry_run: bool) -> None:
    if not source_script.exists():
        raise FileNotFoundError(f"source script does not exist: {source_script}")
    if dry_run:
        return
    workspace_script.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source_script, workspace_script)
    current_mode = workspace_script.stat().st_mode
    workspace_script.chmod(current_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)


def update_cron_registry(
    *,
    jobs_json: Path,
    repo_script: Path,
    workspace_script: Path,
    release_log: Path,
    dry_run: bool,
) -> bool:
    payload = load_jobs(jobs_json)
    job = find_release_promote_job(payload)
    prompt = build_repo_backed_prompt(
        repo_script=repo_script,
        workspace_script=workspace_script,
        release_log=release_log,
    )
    changed = job.get("prompt") != prompt
    if changed:
        job["prompt"] = prompt
    if not dry_run and changed:
        backup = jobs_json.with_name(f"{jobs_json.name}.bak-release-promote-cron")
        shutil.copy2(jobs_json, backup)
        jobs_json.write_text(dump_jobs(payload), encoding="utf-8")
    return changed


def install(
    *,
    source_script: Path,
    workspace_script: Path,
    repo_script: Path,
    jobs_json: Path,
    release_log: Path,
    dry_run: bool,
) -> InstallResult:
    source_script = source_script.expanduser().resolve()
    workspace_script = workspace_script.expanduser().resolve()
    repo_script = repo_script.expanduser().resolve()
    jobs_json = jobs_json.expanduser().resolve()
    release_log = release_log.expanduser().resolve()

    install_workspace_copy(source_script=source_script, workspace_script=workspace_script, dry_run=dry_run)
    changed_prompt = update_cron_registry(
        jobs_json=jobs_json,
        repo_script=repo_script,
        workspace_script=workspace_script,
        release_log=release_log,
        dry_run=dry_run,
    )
    return InstallResult(
        copied_to=workspace_script,
        jobs_json=jobs_json,
        job_id=JOB_ID,
        dry_run=dry_run,
        changed_prompt=changed_prompt,
    )


def parse_args(argv: Sequence[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-script", type=Path, default=DEFAULT_SOURCE_SCRIPT)
    parser.add_argument("--workspace-script", type=Path, default=DEFAULT_WORKSPACE_SCRIPT)
    parser.add_argument("--repo-script", type=Path, default=DEFAULT_REPO_SCRIPT)
    parser.add_argument("--jobs-json", type=Path, default=DEFAULT_JOBS_JSON)
    parser.add_argument("--release-log", type=Path, default=DEFAULT_RELEASE_LOG)
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv if argv is not None else sys.argv[1:])
    result = install(
        source_script=args.source_script,
        workspace_script=args.workspace_script,
        repo_script=args.repo_script,
        jobs_json=args.jobs_json,
        release_log=args.release_log,
        dry_run=args.dry_run,
    )
    print(f"JOB={result.job_id}")
    print(f"WORKSPACE_SCRIPT={result.copied_to}")
    print(f"JOBS_JSON={result.jobs_json}")
    print(f"PROMPT_CHANGED={str(result.changed_prompt).upper()}")
    print(f"DRY_RUN={str(result.dry_run).upper()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
