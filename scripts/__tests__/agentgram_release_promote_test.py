import importlib.util
import sys
import tempfile
import unittest
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

SCRIPT_PATH = Path(__file__).resolve().parents[1] / "agentgram_release_promote.py"
spec = importlib.util.spec_from_file_location("agentgram_release_promote", SCRIPT_PATH)
assert spec is not None
release_promote = importlib.util.module_from_spec(spec)
assert spec.loader is not None
sys.modules[spec.name] = release_promote
spec.loader.exec_module(release_promote)


class ReleasePromoteTests(unittest.TestCase):
    def setUp(self):
        self.now = datetime(2026, 7, 13, 6, 0, tzinfo=ZoneInfo("Asia/Seoul"))

    def test_pr_body_contains_required_artifact_pack_sections(self):
        body = release_promote.build_pr_body(ahead=3, now=self.now)

        self.assertIn("## Source", body)
        self.assertIn("## Change", body)
        self.assertIn("## Evidence", body)
        self.assertIn("## Auth-only Proof", body)
        self.assertIn("diff:", body)
        self.assertIn("test:", body)
        self.assertIn("N/A", body)

    def test_zero_ahead_plan_is_safe_noop(self):
        plan = release_promote.build_plan(ahead=0, now=self.now)

        self.assertEqual(plan.ahead, 0)
        self.assertIn("| skip | ahead=0 | pr=- | enforce=n/a |", plan.log_line)
        self.assertIn("develop already matches main", plan.log_line)

    def test_positive_ahead_plan_never_mentions_force_push(self):
        plan = release_promote.build_plan(ahead=5, now=self.now)

        self.assertIn("promote develop to main", plan.title)
        self.assertIn("ahead=5", plan.log_line)
        self.assertNotIn("force", plan.body.lower())
        self.assertNotIn("push main", plan.body.lower())

    def test_negative_ahead_is_rejected(self):
        with self.assertRaises(ValueError):
            release_promote.build_plan(ahead=-1, now=self.now)

    def test_append_release_log_does_not_insert_blank_rows(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            log_path = Path(tmpdir) / "release-log.md"
            log_path.write_text("# Log\n", encoding="utf-8")

            release_promote.append_release_log(log_path, "- first")
            release_promote.append_release_log(log_path, "- second")

            self.assertEqual(log_path.read_text(encoding="utf-8"), "# Log\n- first\n- second\n")

    def test_refresh_release_pr_updates_title_and_body_file(self):
        captured = {}
        original_run_command = release_promote.run_command

        def fake_run_command(args, cwd, check=True):
            captured["args"] = list(args)
            captured["cwd"] = cwd
            body_file = Path(args[args.index("--body-file") + 1])
            captured["body"] = body_file.read_text(encoding="utf-8")
            return release_promote.CommandResult("", "", 0)

        try:
            setattr(release_promote, "run_command", fake_run_command)
            release_promote.refresh_release_pr(
                Path("/repo"),
                42,
                title="release: promote develop to main — 2026-07-13",
                body="## Source\nrelease body\n",
            )
        finally:
            setattr(release_promote, "run_command", original_run_command)

        self.assertEqual(captured["cwd"], Path("/repo"))
        self.assertEqual(captured["body"], "## Source\nrelease body\n")
        self.assertEqual(
            captured["args"][:6],
            [
                "gh",
                "pr",
                "edit",
                "42",
                "--title",
                "release: promote develop to main — 2026-07-13",
            ],
        )

    def test_promote_refreshes_existing_release_pr_before_auto_merge(self):
        calls = []
        originals = {
            "kst_now": release_promote.kst_now,
            "git_ahead_count": release_promote.git_ahead_count,
            "existing_release_pr": release_promote.existing_release_pr,
            "refresh_release_pr": release_promote.refresh_release_pr,
            "arm_auto_merge": release_promote.arm_auto_merge,
            "required_check_state": release_promote.required_check_state,
        }

        def fake_refresh(repo, pr_number, *, title, body):
            calls.append(("refresh", repo, pr_number, title, body))

        def fake_arm(repo, pr_number):
            calls.append(("arm", repo, pr_number))

        try:
            setattr(release_promote, "kst_now", lambda: self.now)
            setattr(release_promote, "git_ahead_count", lambda repo, *, fetch: 7)
            setattr(
                release_promote,
                "existing_release_pr",
                lambda repo: {"number": 42, "url": "https://github.com/agentgram/agentgram/pull/42"},
            )
            setattr(release_promote, "refresh_release_pr", fake_refresh)
            setattr(release_promote, "arm_auto_merge", fake_arm)
            setattr(release_promote, "required_check_state", lambda repo, pr_number: "SUCCESS")

            with tempfile.TemporaryDirectory() as tmpdir:
                log_path = Path(tmpdir) / "release-log.md"
                exit_code = release_promote.promote(
                    Path("/repo"),
                    log_path,
                    dry_run=False,
                    fetch=False,
                )
                log_content = log_path.read_text(encoding="utf-8")
        finally:
            for name, value in originals.items():
                setattr(release_promote, name, value)

        self.assertEqual(exit_code, 0)
        self.assertEqual(calls[0][0], "refresh")
        self.assertEqual(calls[0][2], 42)
        self.assertIn("ahead of `main` by 7 commit(s)", calls[0][4])
        self.assertEqual(calls[1], ("arm", Path("/repo"), 42))
        self.assertIn("| ok | ahead=7 | pr=#42 | enforce=SUCCESS |", log_content)


if __name__ == "__main__":
    unittest.main()
