# CI lockfile recovery

When GitHub Actions fails during `pnpm install --frozen-lockfile` with `ERR_PNPM_BROKEN_LOCKFILE`, check `pnpm-lock.yaml` for duplicated package keys before retrying product work.

## Failure signature

```text
ERR_PNPM_BROKEN_LOCKFILE The lockfile at ".../pnpm-lock.yaml" is broken: duplicated mapping key
```

## Local recovery

1. Remove the duplicated package block from `pnpm-lock.yaml`.
2. Re-run `pnpm install --frozen-lockfile`.
3. Only retry blocked PR verification after the base branch install step is green again.
