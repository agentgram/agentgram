import importlib.util
import json
import os
import stat
import sys
import tempfile
import unittest
from pathlib import Path

SCRIPT_PATH = Path(__file__).resolve().parents[1] / "install_agentgram_release_promote_cron.py"
spec = importlib.util.spec_from_file_location("install_agentgram_release_promote_cron", SCRIPT_PATH)
assert spec is not None
installer = importlib.util.module_from_spec(spec)
assert spec.loader is not None
sys.modules[spec.name] = installer
spec.loader.exec_module(installer)


class InstallReleasePromoteCronTests(unittest.TestCase):
    def test_prompt_prefers_repo_script_and_keeps_workspace_fallback(self):
        prompt = installer.build_repo_backed_prompt(
            repo_script=Path("/repo/scripts/agentgram_release_promote.py"),
            workspace_script=Path("/profile/workspace/scripts/agentgram_release_promote.py"),
            release_log=Path("/shared/release-log.md"),
        )

        self.assertLess(
            prompt.index("/repo/scripts/agentgram_release_promote.py"),
            prompt.index("/profile/workspace/scripts/agentgram_release_promote.py"),
        )
        self.assertIn("repo-backed release promote script", prompt)
        self.assertIn("If neither script path exists", prompt)
        self.assertIn("Do not force-push `main`", prompt)

    def test_install_workspace_copy_preserves_script_and_marks_executable(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            source = Path(tmpdir) / "source.py"
            target = Path(tmpdir) / "profile" / "scripts" / "agentgram_release_promote.py"
            source.write_text("#!/usr/bin/env python3\nprint('ok')\n", encoding="utf-8")

            installer.install_workspace_copy(source_script=source, workspace_script=target, dry_run=False)

            self.assertEqual(target.read_text(encoding="utf-8"), source.read_text(encoding="utf-8"))
            self.assertTrue(target.stat().st_mode & stat.S_IXUSR)

    def test_update_cron_registry_changes_only_release_promote_prompt(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            jobs_json = Path(tmpdir) / "jobs.json"
            payload = {
                "jobs": [
                    {"id": "other", "name": "other-job", "prompt": "keep me"},
                    {
                        "id": installer.JOB_ID,
                        "name": installer.JOB_NAME,
                        "prompt": "old missing workspace copy prompt",
                        "schedule_display": "0 6 * * *",
                    },
                ]
            }
            jobs_json.write_text(json.dumps(payload), encoding="utf-8")

            changed = installer.update_cron_registry(
                jobs_json=jobs_json,
                repo_script=Path("/repo/scripts/agentgram_release_promote.py"),
                workspace_script=Path("/profile/workspace/scripts/agentgram_release_promote.py"),
                release_log=Path("/shared/release-log.md"),
                dry_run=False,
            )

            updated = json.loads(jobs_json.read_text(encoding="utf-8"))
            self.assertTrue(changed)
            self.assertEqual(updated["jobs"][0]["prompt"], "keep me")
            self.assertIn("/repo/scripts/agentgram_release_promote.py", updated["jobs"][1]["prompt"])
            self.assertEqual(updated["jobs"][1]["schedule_display"], "0 6 * * *")
            self.assertTrue((Path(tmpdir) / "jobs.json.bak-release-promote-cron").exists())

    def test_full_install_dry_run_does_not_write_targets(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            source = Path(tmpdir) / "agentgram_release_promote.py"
            workspace_script = Path(tmpdir) / "workspace" / "scripts" / "agentgram_release_promote.py"
            jobs_json = Path(tmpdir) / "jobs.json"
            source.write_text("print('ok')\n", encoding="utf-8")
            original = {
                "jobs": [
                    {
                        "id": installer.JOB_ID,
                        "name": installer.JOB_NAME,
                        "prompt": "old",
                    }
                ]
            }
            jobs_json.write_text(json.dumps(original), encoding="utf-8")

            result = installer.install(
                source_script=source,
                workspace_script=workspace_script,
                repo_script=Path(tmpdir) / "repo" / "scripts" / "agentgram_release_promote.py",
                jobs_json=jobs_json,
                release_log=Path(tmpdir) / "release-log.md",
                dry_run=True,
            )

            self.assertTrue(result.changed_prompt)
            self.assertFalse(workspace_script.exists())
            self.assertEqual(json.loads(jobs_json.read_text(encoding="utf-8")), original)

    def test_main_uses_provided_argv(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            source = Path(tmpdir) / "agentgram_release_promote.py"
            workspace_script = Path(tmpdir) / "workspace" / "scripts" / "agentgram_release_promote.py"
            jobs_json = Path(tmpdir) / "jobs.json"
            source.write_text("print('ok')\n", encoding="utf-8")
            jobs_json.write_text(
                json.dumps({"jobs": [{"id": installer.JOB_ID, "name": installer.JOB_NAME, "prompt": "old"}]}),
                encoding="utf-8",
            )

            exit_code = installer.main(
                [
                    "--source-script",
                    os.fspath(source),
                    "--workspace-script",
                    os.fspath(workspace_script),
                    "--repo-script",
                    os.fspath(Path(tmpdir) / "repo" / "scripts" / "agentgram_release_promote.py"),
                    "--jobs-json",
                    os.fspath(jobs_json),
                    "--release-log",
                    os.fspath(Path(tmpdir) / "release-log.md"),
                ]
            )

            self.assertEqual(exit_code, 0)
            self.assertTrue(workspace_script.exists())


if __name__ == "__main__":
    unittest.main()
