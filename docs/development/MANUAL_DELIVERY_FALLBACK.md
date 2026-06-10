# Manual Delivery Fallback

Use this lane when automated ACP delegation is unavailable and a P1 product or code task would otherwise stay blocked.

## Trigger

Switch to manual delivery when one of these conditions is true:

- ACP runtime is unavailable.
- ACP session cap blocks new work.
- The same P1 task has timed out across multiple automated ticks without an open PR.

Do not redistribute product/code work to non-code owners just to avoid the ACP blocker.

## Lane

1. Confirm the backlog row, owner, and target date.
2. Create a branch from `origin/develop`.
3. Implement the smallest reviewable code or docs change that resolves the row.
4. Run the narrowest meaningful verification command.
5. Open a PR with a completed verification artifact pack.
6. In `## Evidence`, state that the manual fallback lane was used and name the ACP blocker.
7. Update the backlog row with the PR number and the validation result.

## PR Evidence

Manual fallback PRs still need the normal artifact pack:

- `## Source`: backlog row or issue.
- `## Evidence`: docs/example diff, screenshot/live-proof, or validation command.
- `## Auth-only Proof`: authenticated proof for auth-gated changes, otherwise explicit `N/A`.

Example evidence line: `- Manual fallback lane: ACP session cap blocked automated delivery; implemented directly on refactor/schema-types-manual-fallback.`
