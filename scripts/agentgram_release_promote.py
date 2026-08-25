#!/usr/bin/env python3
"""Create or refresh the AgentGram develop -> main release PR.

The kkami release-promote cron calls this script from the Hermes profile
workspace. Keep the implementation dependency-free so the cron can run even
when the JavaScript workspace is not installed.
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import tempfile
import time
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Sequence, Union, cast
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

DEFAULT_REPO = Path(os.environ.get("AGENTGRAM_REPO", "/Users/sweetheart/.hermes/projects/agentgram/agentgram"))
DEFAULT_RELEASE_LOG = Path(
    os.environ.get(
        "AGENTGRAM_RELEASE_LOG",
        "/Users/sweetheart/.hermes/shared/knowledge/agentgram/release-log.md",
    )
)
DEFAULT_DEPLOYMENT_REPORT_DIR = Path(
    os.environ.get(
        "AGENTGRAM_DEPLOYMENT_REPORT_DIR",
        "/Users/sweetheart/.hermes/shared/knowledge/agentgram",
    )
)
DEFAULT_PRODUCTION_URL = os.environ.get("AGENTGRAM_PRODUCTION_URL", "https://agentgram.co")
DEFAULT_PRODUCTION_SMOKE_ROUTE = os.environ.get("AGENTGRAM_PRODUCTION_SMOKE_ROUTE", "/")
REQUIRED_CHECK_NAME = "Enforce develop-only merge to main"
SUCCESS_DEPLOYMENT_STATE = "success"
TERMINAL_DEPLOYMENT_STATES = {"error", "failure", "canceled", "skipped"}


@dataclass(frozen=True)
class CommandResult:
    stdout: str
    stderr: str
    returncode: int


@dataclass(frozen=True)
class PromotionPlan:
    ahead: int
    title: str
    body: str
    log_line: str


@dataclass(frozen=True)
class DeploymentGate:
    deployment_id: str
    state: str
    environment: str
    sha: str
    target_url: str
    created_at: str
    statuses_url: str
    log_url: str
    description: str


def run_command(args: Sequence[str], cwd: Path, check: bool = True) -> CommandResult:
    result = subprocess.run(
        list(args),
        cwd=cwd,
        text=True,
        capture_output=True,
        check=False,
    )
    command_result = CommandResult(result.stdout.strip(), result.stderr.strip(), result.returncode)
    if check and result.returncode != 0:
        joined = " ".join(args)
        raise RuntimeError(
            f"command failed ({result.returncode}): {joined}\nstdout={command_result.stdout}\nstderr={command_result.stderr}"
        )
    return command_result


def kst_now() -> datetime:
    return datetime.now(ZoneInfo("Asia/Seoul"))


def release_timestamp(now: datetime) -> str:
    return now.strftime("%Y-%m-%d %H:%M KST")


def release_title(now: datetime) -> str:
    return f"release: promote develop to main — {now.strftime('%Y-%m-%d')}"


def build_pr_body(*, ahead: int, now: datetime) -> str:
    timestamp = release_timestamp(now)
    return f"""## Source
Hermes kkami release-promote cron ca3cc60e24bb.
Ref: https://github.com/agentgram/agentgram

## Change
Promote the current `develop` branch to `main` through a guarded release PR.
This run detected `develop` ahead of `main` by {ahead} commit(s) at {timestamp}.

## Evidence
- diff: `git rev-list --count origin/main..origin/develop` => `{ahead}`
- test: release promotion script dry-run/smoke validation is available via `python3 scripts/agentgram_release_promote.py --dry-run --no-fetch`

## Auth-only Proof
N/A
"""


def build_log_line(
    *,
    now: datetime,
    status: str,
    ahead: int,
    pr: str = "-",
    enforce: str = "n/a",
    message: str,
) -> str:
    return (
        f"- {release_timestamp(now)} | {status} | ahead={ahead} | pr={pr} | "
        f"enforce={enforce} | revenue=none | {message}"
    )


def build_plan(*, ahead: int, now: datetime) -> PromotionPlan:
    if ahead < 0:
        raise ValueError("ahead must not be negative")
    if ahead == 0:
        return PromotionPlan(
            ahead=0,
            title=release_title(now),
            body=build_pr_body(ahead=0, now=now),
            log_line=build_log_line(
                now=now,
                status="skip",
                ahead=0,
                message="develop already matches main",
            ),
        )
    return PromotionPlan(
        ahead=ahead,
        title=release_title(now),
        body=build_pr_body(ahead=ahead, now=now),
        log_line=build_log_line(
            now=now,
            status="ok",
            ahead=ahead,
            pr="{pr}",
            enforce="{enforce}",
            message="release PR ready; auto-merge armed",
        ),
    )


def append_release_log(path: Path, line: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    needs_leading_newline = False
    if path.exists() and path.stat().st_size > 0:
        with path.open("rb") as existing:
            existing.seek(-1, os.SEEK_END)
            needs_leading_newline = existing.read(1) != b"\n"

    with path.open("a", encoding="utf-8") as handle:
        if needs_leading_newline:
            handle.write("\n")
        handle.write(line.rstrip() + "\n")


def gh_api_json(repo: Path, path: str) -> object:
    result = run_command(["gh", "api", path], cwd=repo)
    return json.loads(result.stdout or "null")


def git_ref_sha(repo: Path, ref: str) -> str:
    return run_command(["git", "rev-parse", ref], cwd=repo).stdout


def deployment_query_path(*, sha: str, environment: str | None, per_page: int = 1) -> str:
    query: dict[str, str | int] = {"sha": sha, "per_page": per_page}
    if environment:
        query["environment"] = environment
    return f"repos/agentgram/agentgram/deployments?{urlencode(query)}"


def missing_deployment_gate(*, target_sha: str, environment: str | None, reason: str) -> DeploymentGate:
    return DeploymentGate(
        deployment_id="missing",
        state="missing",
        environment=environment or "any",
        sha=target_sha,
        target_url="",
        created_at="unknown",
        statuses_url="",
        log_url="",
        description=reason,
    )


def deployment_gate(
    repo: Path,
    *,
    deployment_id: str | None,
    environment: str | None,
    target_sha: str,
) -> DeploymentGate:
    if deployment_id:
        deployments = [gh_api_json(repo, f"repos/agentgram/agentgram/deployments/{deployment_id}")]
    else:
        deployments = cast(list[object], gh_api_json(repo, deployment_query_path(sha=target_sha, environment=environment)))
    if not deployments:
        env_msg = f" environment={environment}" if environment else ""
        return missing_deployment_gate(
            target_sha=target_sha,
            environment=environment,
            reason=f"no GitHub deployment found for exact target sha {target_sha}{env_msg}",
        )

    deployment = cast(dict[str, object], deployments[0])
    resolved_id = str(deployment.get("id") or "")
    deployment_sha = str(deployment.get("sha") or "unknown")
    if deployment_sha != target_sha:
        return missing_deployment_gate(
            target_sha=target_sha,
            environment=environment,
            reason=(
                f"deployment {resolved_id} belongs to sha {deployment_sha}, "
                f"not exact target sha {target_sha}"
            ),
        )
    statuses = cast(
        list[object],
        gh_api_json(repo, f"repos/agentgram/agentgram/deployments/{resolved_id}/statuses?per_page=1"),
    )
    if not statuses:
        return DeploymentGate(
            deployment_id=resolved_id,
            state="no_status",
            environment=str(deployment.get("environment") or environment or "unknown"),
            sha=deployment_sha,
            target_url=str(deployment.get("target_url") or ""),
            created_at=str(deployment.get("created_at") or "unknown"),
            statuses_url=str(deployment.get("statuses_url") or ""),
            log_url="",
            description=f"deployment {resolved_id} has no status records",
        )
    status = cast(dict[str, object], statuses[0])
    return DeploymentGate(
        deployment_id=resolved_id,
        state=str(status.get("state") or "unknown"),
        environment=str(status.get("environment") or deployment.get("environment") or "unknown"),
        sha=deployment_sha,
        target_url=str(status.get("target_url") or status.get("environment_url") or deployment.get("target_url") or ""),
        created_at=str(status.get("created_at") or deployment.get("created_at") or "unknown"),
        statuses_url=str(deployment.get("statuses_url") or ""),
        log_url=str(status.get("log_url") or ""),
        description=str(status.get("description") or ""),
    )


def write_deploy_broken_report(report_dir: Path, *, gate: DeploymentGate, now: datetime, dry_run: bool) -> Path:
    report_dir.mkdir(parents=True, exist_ok=True)
    path = report_dir / f"deploy-broken-{now.strftime('%Y%m%d-%H%M%S')}-{gate.deployment_id}.md"
    body = f"""# AgentGram deploy-broken gate report — {release_timestamp(now)}

## Decision

BLOCKED: exact-target GitHub deployment state is `{gate.state}`, not `success`; release-promote must not promote develop to main.

## Evidence

- deployment_id: `{gate.deployment_id}`
- environment: `{gate.environment}`
- state: `{gate.state}`
- commit_sha: `{gate.sha}`
- deployment_url: {gate.target_url or 'n/a'}
- status_created_at: `{gate.created_at}`
- statuses_api: {gate.statuses_url or 'n/a'}
- log_url: {gate.log_url or 'n/a'}
- detail: {gate.description or 'n/a'}

## Required follow-up

Create a Hermes Kanban card assigned to `kkami` with `deploy-broken` in the title and this report path in the body. Do not resume release promotion until a newer deployment reports `success`.
"""
    if not dry_run:
        path.write_text(body, encoding="utf-8")
    return path


def git_ahead_count(repo: Path, *, fetch: bool) -> int:
    if fetch:
        run_command(["git", "fetch", "origin", "main", "develop", "--prune"], cwd=repo)
    result = run_command(
        ["git", "rev-list", "--count", "origin/main..origin/develop"],
        cwd=repo,
    )
    return int(result.stdout)


def print_deployment_gate(prefix: str, gate: DeploymentGate) -> None:
    print(f"{prefix}_DEPLOYMENT_ID={gate.deployment_id}")
    print(f"{prefix}_DEPLOYMENT_ENVIRONMENT={gate.environment}")
    print(f"{prefix}_DEPLOYMENT_STATE={gate.state}")
    print(f"{prefix}_DEPLOYMENT_SHA={gate.sha}")
    print(f"{prefix}_DEPLOYMENT_URL={gate.target_url or 'n/a'}")


def wait_for_pr_merge(repo: Path, pr_number: int, *, timeout_seconds: int, poll_interval_seconds: int) -> str:
    deadline = time.monotonic() + timeout_seconds
    last_state = "UNKNOWN"
    while time.monotonic() <= deadline:
        pr = cast(
            dict[str, object],
            gh_api_json(repo, f"repos/agentgram/agentgram/pulls/{pr_number}"),
        )
        state = str(pr.get("state") or "unknown")
        merged = bool(pr.get("merged"))
        last_state = f"state={state} merged={merged}"
        if merged:
            merge_commit = cast(dict[str, object], pr.get("merge_commit_sha") and {"oid": pr.get("merge_commit_sha")})
            oid = str(merge_commit.get("oid") or pr.get("merge_commit_sha") or "")
            if oid:
                return oid
            run_command(["git", "fetch", "origin", "main", "--prune"], cwd=repo)
            return git_ref_sha(repo, "origin/main")
        if state == "closed":
            raise RuntimeError(f"release PR #{pr_number} closed without merge")
        time.sleep(poll_interval_seconds)
    raise RuntimeError(f"timed out waiting for release PR #{pr_number} to merge ({last_state})")


def wait_for_successful_deployment(
    repo: Path,
    *,
    sha: str,
    environment: str,
    timeout_seconds: int,
    poll_interval_seconds: int,
) -> DeploymentGate:
    deadline = time.monotonic() + timeout_seconds
    last_gate = missing_deployment_gate(target_sha=sha, environment=environment, reason="not checked yet")
    while time.monotonic() <= deadline:
        last_gate = deployment_gate(repo, deployment_id=None, environment=environment, target_sha=sha)
        if last_gate.state == SUCCESS_DEPLOYMENT_STATE:
            return last_gate
        if last_gate.state in TERMINAL_DEPLOYMENT_STATES:
            raise RuntimeError(
                f"{environment} deployment for sha {sha} ended as {last_gate.state}; "
                f"deployment_id={last_gate.deployment_id} url={last_gate.target_url or 'n/a'}"
            )
        time.sleep(poll_interval_seconds)
    raise RuntimeError(
        f"timed out waiting for {environment} deployment success for sha {sha}; "
        f"last_state={last_gate.state} deployment_id={last_gate.deployment_id}"
    )


def smoke_check(*, base_url: str, route: str) -> str:
    normalized_base = base_url.rstrip("/")
    normalized_route = route if route.startswith("/") else f"/{route}"
    url = f"{normalized_base}{normalized_route}"
    request = Request(url, headers={"User-Agent": "agentgram-release-promote/1.0"})
    try:
        with urlopen(request, timeout=20) as response:
            status = int(response.status)
            response.read(512)
    except HTTPError as exc:
        raise RuntimeError(f"production smoke check failed: {url} returned HTTP {exc.code}") from exc
    except URLError as exc:
        raise RuntimeError(f"production smoke check failed: {url}: {exc.reason}") from exc
    if status != 200:
        raise RuntimeError(f"production smoke check failed: {url} returned HTTP {status}")
    return url


def existing_release_pr(repo: Path) -> dict[str, object] | None:
    result = run_command(
        [
            "gh",
            "pr",
            "list",
            "--base",
            "main",
            "--head",
            "develop",
            "--state",
            "open",
            "--json",
            "number,url",
            "--limit",
            "1",
        ],
        cwd=repo,
    )
    prs = json.loads(result.stdout or "[]")
    return prs[0] if prs else None


def create_release_pr(repo: Path, *, title: str, body: str) -> dict[str, object]:
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".md", delete=False) as handle:
        handle.write(body)
        body_file = Path(handle.name)
    try:
        run_command(
            [
                "gh",
                "pr",
                "create",
                "--base",
                "main",
                "--head",
                "develop",
                "--title",
                title,
                "--body-file",
                str(body_file),
            ],
            cwd=repo,
        )
    finally:
        body_file.unlink(missing_ok=True)
    pr = existing_release_pr(repo)
    if not pr:
        raise RuntimeError("gh pr create completed but no open develop -> main PR was found")
    return pr


def refresh_release_pr(repo: Path, pr_number: int, *, title: str, body: str) -> None:
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".md", delete=False) as handle:
        handle.write(body)
        body_file = Path(handle.name)
    try:
        run_command(
            [
                "gh",
                "pr",
                "edit",
                str(pr_number),
                "--title",
                title,
                "--body-file",
                str(body_file),
            ],
            cwd=repo,
        )
    finally:
        body_file.unlink(missing_ok=True)


def required_check_state(repo: Path, pr_number: int) -> str:
    result = run_command(
        ["gh", "pr", "checks", str(pr_number), "--required", "--json", "name,state"],
        cwd=repo,
        check=False,
    )
    if result.returncode != 0:
        return "UNKNOWN"
    checks = json.loads(result.stdout or "[]")
    for check in checks:
        if check.get("name") == REQUIRED_CHECK_NAME:
            return str(check.get("state") or "UNKNOWN")
    return "ABSENT"


def arm_auto_merge(repo: Path, pr_number: int) -> None:
    run_command(["gh", "pr", "merge", str(pr_number), "--auto", "--merge"], cwd=repo)


def promote(
    repo: Path,
    release_log: Path,
    report_dir: Path,
    *,
    dry_run: bool,
    fetch: bool,
    deployment_id: str | None,
    deployment_environment: str | None,
    target_sha_override: str | None,
    production_url: str,
    production_smoke_route: str,
    merge_timeout_seconds: int,
    deployment_timeout_seconds: int,
    poll_interval_seconds: int,
) -> int:
    now = kst_now()
    ahead = git_ahead_count(repo, fetch=fetch)
    target_sha = target_sha_override or git_ref_sha(repo, "origin/develop")
    plan = build_plan(ahead=ahead, now=now)
    gate_required = ahead > 0 or deployment_id is not None or target_sha_override is not None

    if ahead == 0 and not gate_required:
        if dry_run:
            print("DRY_RUN=1")
            print("STATUS=NO_OP")
            print(f"TARGET_SHA={target_sha}")
            print(f"AHEAD={ahead}")
            print(f"TITLE={plan.title}")
            print("PR_BODY_BEGIN")
            print(plan.body.rstrip())
            print("PR_BODY_END")
            print(f"LOG_LINE={plan.log_line}")
            return 0
        append_release_log(release_log, plan.log_line)
        print("Release promote completed with no changes.")
        print("STATUS=NO_OP")
        print(f"TARGET_SHA={target_sha}")
        print(f"ARTIFACT={release_log}")
        print("NEXT=rerun on next tick; promotion only needed when develop is ahead of main.")
        return 0

    gate = deployment_gate(
        repo,
        deployment_id=deployment_id,
        environment=deployment_environment,
        target_sha=target_sha,
    )
    if gate.state != SUCCESS_DEPLOYMENT_STATE:
        report_path = write_deploy_broken_report(report_dir, gate=gate, now=now, dry_run=dry_run)
        line = (
            f"- {release_timestamp(now)} | blocked | deployment_state={gate.state} | "
            f"deployment_id={gate.deployment_id} | sha={gate.sha} | url={gate.target_url or 'n/a'} | "
            f"report={report_path} | release promotion halted before develop->main"
        )
        if not dry_run:
            append_release_log(release_log, line)
        print(f"DRY_RUN={1 if dry_run else 0}")
        print("STATUS=BLOCKED")
        print(f"TARGET_SHA={target_sha}")
        print_deployment_gate("PRE_PROMOTE", gate)
        print(f"ARTIFACT={report_path}")
        print("KANBAN_CREATE=assignee:kkami title:deploy-broken AgentGram deployment failure blocks release-promote")
        print("NEXT=Fix the failed deployment, then rerun only after the exact target SHA has a success deployment status.")
        return 0 if dry_run else 2

    if dry_run:
        print(f"DRY_RUN=1")
        print(f"STATUS={'NO_OP' if ahead == 0 else 'WOULD_PROMOTE'}")
        print(f"TARGET_SHA={target_sha}")
        print_deployment_gate("PRE_PROMOTE", gate)
        print(f"AHEAD={ahead}")
        print(f"TITLE={plan.title}")
        print("PR_BODY_BEGIN")
        print(plan.body.rstrip())
        print("PR_BODY_END")
        print(f"LOG_LINE={plan.log_line}")
        return 0

    pr = existing_release_pr(repo)
    if pr:
        pr_number = int(cast(Union[int, str], pr["number"]))
        refresh_release_pr(repo, pr_number, title=plan.title, body=plan.body)
    else:
        pr = create_release_pr(repo, title=plan.title, body=plan.body)
        pr_number = int(cast(Union[int, str], pr["number"]))
    pr_url = str(pr.get("url") or f"#{pr_number}")
    arm_auto_merge(repo, pr_number)
    enforce = required_check_state(repo, pr_number)
    production_sha = wait_for_pr_merge(
        repo,
        pr_number,
        timeout_seconds=merge_timeout_seconds,
        poll_interval_seconds=poll_interval_seconds,
    )
    production_gate = wait_for_successful_deployment(
        repo,
        sha=production_sha,
        environment="Production",
        timeout_seconds=deployment_timeout_seconds,
        poll_interval_seconds=poll_interval_seconds,
    )
    smoke_url = smoke_check(base_url=production_url, route=production_smoke_route)
    line = (
        plan.log_line.format(pr=f"#{pr_number}", enforce=enforce)
        + f" | production_sha={production_sha} | production_deployment={production_gate.deployment_id} | smoke={smoke_url}"
    )
    append_release_log(release_log, line)

    print(f"Release promote succeeded: PR #{pr_number} merged and production smoke passed.")
    print("STATUS=OK")
    print(f"PR={pr_url}")
    print(f"TARGET_SHA={target_sha}")
    print(f"PRODUCTION_SHA={production_sha}")
    print_deployment_gate("PRODUCTION", production_gate)
    print(f"SMOKE_URL={smoke_url}")
    print(f"ARTIFACT={release_log}")
    print("NEXT=release promotion is complete; future runs should only promote newer develop commits.")
    return 0


def parse_args(argv: Sequence[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", type=Path, default=DEFAULT_REPO)
    parser.add_argument("--release-log", type=Path, default=DEFAULT_RELEASE_LOG)
    parser.add_argument("--deployment-report-dir", type=Path, default=DEFAULT_DEPLOYMENT_REPORT_DIR)
    parser.add_argument("--dry-run", action="store_true", help="Print the planned PR/log output without gh writes")
    parser.add_argument("--no-fetch", action="store_true", help="Use existing origin/main and origin/develop refs")
    parser.add_argument("--deployment-id", help="Override deployment id for gate dry-run/replay")
    parser.add_argument("--deployment-environment", help="Optional deployment environment filter, e.g. Production")
    parser.add_argument("--target-sha", help="Override target sha for gate replay/dry-run")
    parser.add_argument("--production-url", default=DEFAULT_PRODUCTION_URL)
    parser.add_argument("--production-smoke-route", default=DEFAULT_PRODUCTION_SMOKE_ROUTE)
    parser.add_argument("--merge-timeout-seconds", type=int, default=1800)
    parser.add_argument("--deployment-timeout-seconds", type=int, default=1800)
    parser.add_argument("--poll-interval-seconds", type=int, default=30)
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    repo = args.repo.expanduser().resolve()
    release_log = args.release_log.expanduser().resolve()
    report_dir = args.deployment_report_dir.expanduser().resolve()
    if not repo.exists():
        raise SystemExit(f"repo does not exist: {repo}")
    return promote(
        repo,
        release_log,
        report_dir,
        dry_run=args.dry_run,
        fetch=not args.no_fetch,
        deployment_id=args.deployment_id,
        deployment_environment=args.deployment_environment,
        target_sha_override=args.target_sha,
        production_url=args.production_url,
        production_smoke_route=args.production_smoke_route,
        merge_timeout_seconds=args.merge_timeout_seconds,
        deployment_timeout_seconds=args.deployment_timeout_seconds,
        poll_interval_seconds=args.poll_interval_seconds,
    )


if __name__ == "__main__":
    raise SystemExit(main())
