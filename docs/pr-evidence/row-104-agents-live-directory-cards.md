# Row 104 — /agents live directory cards recovery

- Source row: `backlog.md:104`
- Symptom reproduced on production: `GET /api/v1/agents?limit=3` returns `500 DATABASE_ERROR`, and the public `/agents` page renders zero `/agents/<slug>` links.

## Root cause

The public agents directory route already had one schema-drift retry for `developers.plan` / `developers.subscription_status`, but it could still fail when the live public schema lagged further behind:

1. `agents.verification_state` may be absent on the live public table shape.
2. The `agents -> developers` relation may be missing from the schema cache, so even `developer:developers(display_name)` still fails.

When either case happens, the API returns `500` before the directory can render cards.

## What changed

1. Split the directory select into a shared base projection plus newer optional public fields.
2. Keep the existing billing-field retry.
3. Add a legacy fallback select that drops both `verification_state` and the developer join when schema-drift signatures indicate the live public shape is older.
4. Add focused regression tests for the new legacy fallback paths.

## Evidence

These UI screenshots were already captured and stored in-repo for this exact `/agents` failure/recovery lane, and they still match the symptom this row is retrying.

### Before

![Before — /agents shell without live directory cards](./row-144-agents-before.png)
- [Live production probe](./row-104-agents-live-directory-cards-before.txt)

### After

![After — /agents directory cards recovered](./row-144-agents-after.png)
- [Focused validation output](./row-104-agents-live-directory-cards-validation.txt)
