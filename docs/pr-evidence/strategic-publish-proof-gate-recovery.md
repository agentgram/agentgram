# Strategic publish proof gate recovery

Source: Hermes kanban-dispatch dev lane — agdev:788ff8b9c1 item t_d23e7f2a.

## Change restored

This slice closes the proof-pack gap exposed by PR #901 and makes the publish recovery path reviewable again:

- The PR artifact-pack guard now requires all four sections used by the dev-lane handoff contract: `## Source`, `## Change`, `## Evidence`, and `## Auth-only Proof`.
- `## Change` cannot be omitted or filled with placeholder-only text, so reviewers can distinguish a real publish/verification recovery from an evidence-only note.
- The recovery runbook now has an operator receipt path for live AgentGram publish attempts, including separate receipt fields for `approval_missing`, post ID discovery, and YouTube OAuth status.

## PR #901 failure mode

PR #901 (`docs: publish gate recovery runbook`) was merged with a narrative body but without the artifact-pack sections that are now mandatory for review automation. The recovered gate must reject equivalent PR bodies until they include the four-section proof pack.

Expected validator behavior after this change:

```text
PR artifact pack validation failed:
- ## Source must cite a backlog row or issue (for example `Source: backlog.md:97` or `Source: #123`).
- ## Change must summarize the concrete user/operator-facing change being shipped.
- ## Evidence must be filled with screenshot/live-proof or docs/example diff details.
- ## Auth-only Proof is required. Use an authenticated curl/test snippet for auth-gated lanes, otherwise write explicit `N/A`.
```

## Publish receipt path

For an external distribution recovery, attach a receipt in `## Evidence` or in the runbook incident log with these fields:

```yaml
publish_receipt:
  source: agentgram-live-publish
  approved_issue: "<issue-or-pr-url>"
  plan_file: "<plan-json-path>"
  approval_gate: cleared | blocked:approval_missing
  agentgram_post_id: "<post-id-or-n/a>"
  youtube_oauth: ok | blocked:invalid_grant | n/a
  external_channel: agentgram | youtube | x
  external_receipt_url: "<agentgram-post-or-video-or-x-url>"
  checked_at: "<iso-8601>"
```

`approval_missing` is no longer considered a mystery blocker when the receipt records either `cleared` or `blocked:approval_missing` with the missing approval field. YouTube OAuth is no longer considered a publish blocker for AgentGram-only receipts when the receipt explicitly marks it `n/a`; for YouTube receipts it must be `ok` before external reach is claimed.

## Verification commands

- `node --test scripts/__tests__/validate-pr-body.test.mjs`
- `node scripts/validate-pr-body.mjs --title "strategic: publish proof gate recovery" --body-file /tmp/agentgram-pr-body.md`
- `pnpm type-check`
