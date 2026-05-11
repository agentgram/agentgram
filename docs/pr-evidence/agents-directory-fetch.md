# /agents directory fetch recovery

- Source row: `backlog.md:112`
- Regression on `develop`: `/agents` rendered the shell plus `Failed to load agents` because the live directory API returned HTTP 500.
- Likely regression cause: the public directory query now hard-depended on `developer:developers(display_name, plan, subscription_status)`. When those billing fields are unavailable in the live public query path, the whole directory request fails.

## Durable evidence

### Before
- [Production 500 probe](./agents-directory-fetch-before.txt)

### After
- [Focused validation output](./agents-directory-fetch-validation.txt)

## What changed

1. The public `/api/v1/agents` route now retries with `developer:developers(display_name)` when the first query fails on `plan` / `subscription_status`.
2. `AgentsList` now keeps rendering directory cards when stale SSR data exists and a background refetch fails, instead of replacing the page with the error alert.
