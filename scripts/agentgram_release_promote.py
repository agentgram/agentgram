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
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Sequence, Union, cast
from zoneinfo import ZoneInfo

DEFAULT_REPO = Path(os.environ.get("AGENTGRAM_REPO", "/Users/sweetheart/.hermes/projects/agentgram/agentgram"))
DEFAULT_RELEASE_LOG = Path(
    os.environ.get(
        "AGENTGRAM_RELEASE_LOG",
        "/Users/sweetheart/.hermes/shared/knowledge/agentgram/release-log.md",
    )
)
REQUIRED_CHECK_NAME = "Enforce develop-only merge to main"


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


def git_ahead_count(repo: Path, *, fetch: bool) -> int:
    if fetch:
        run_command(["git", "fetch", "origin", "main", "develop", "--prune"], cwd=repo)
    result = run_command(
        ["git", "rev-list", "--count", "origin/main..origin/develop"],
        cwd=repo,
    )
    return int(result.stdout)


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


def promote(repo: Path, release_log: Path, *, dry_run: bool, fetch: bool) -> int:
    now = kst_now()
    ahead = git_ahead_count(repo, fetch=fetch)
    plan = build_plan(ahead=ahead, now=now)

    if dry_run:
        print(f"DRY_RUN=1")
        print(f"STATUS={'NO_OP' if ahead == 0 else 'WOULD_PROMOTE'}")
        print(f"AHEAD={ahead}")
        print(f"TITLE={plan.title}")
        print("PR_BODY_BEGIN")
        print(plan.body.rstrip())
        print("PR_BODY_END")
        print(f"LOG_LINE={plan.log_line}")
        return 0

    if ahead == 0:
        append_release_log(release_log, plan.log_line)
        print("Release promote completed with no changes.")
        print("STATUS=NO_OP")
        print(f"ARTIFACT={release_log}")
        print("NEXT=rerun on next tick; promotion only needed when develop is ahead of main.")
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
    line = plan.log_line.format(pr=f"#{pr_number}", enforce=enforce)
    append_release_log(release_log, line)

    print(f"Release promote succeeded: PR #{pr_number} is ready with auto-merge armed.")
    print("STATUS=OK")
    print(f"PR={pr_url}")
    print(f"ARTIFACT={release_log}")
    print("NEXT=Watch required checks; GitHub auto-merge will merge develop into main after they pass.")
    return 0


def parse_args(argv: Sequence[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", type=Path, default=DEFAULT_REPO)
    parser.add_argument("--release-log", type=Path, default=DEFAULT_RELEASE_LOG)
    parser.add_argument("--dry-run", action="store_true", help="Print the planned PR/log output without gh writes")
    parser.add_argument("--no-fetch", action="store_true", help="Use existing origin/main and origin/develop refs")
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    repo = args.repo.expanduser().resolve()
    release_log = args.release_log.expanduser().resolve()
    if not repo.exists():
        raise SystemExit(f"repo does not exist: {repo}")
    return promote(repo, release_log, dry_run=args.dry_run, fetch=not args.no_fetch)


if __name__ == "__main__":
    raise SystemExit(main())
