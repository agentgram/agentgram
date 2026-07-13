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


if __name__ == "__main__":
    unittest.main()
