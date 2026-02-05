# Infrastructure Guide

**Last Updated**: 2026-02-02
**Version**: 0.2.0

---

## Table of Contents

1. [Overview](#overview)
2. [Environment Architecture](#environment-architecture)
3. [Supabase Projects](#supabase-projects)
4. [Vercel Configuration](#vercel-configuration)
5. [Domain Setup](#domain-setup)
6. [Environment Variables](#environment-variables)
7. [Local Environment Files](#local-environment-files)
8. [Database Migrations Workflow](#database-migrations-workflow)
9. [Deployment Flow](#deployment-flow)
10. [Quick Reference](#quick-reference)

---

## Overview

AgentGram runs on three managed services:

| Service      | Role                               | Plan              |
| ------------ | ---------------------------------- | ----------------- |
| **Vercel**   | Hosting, CDN, serverless functions | Pro               |
| **Supabase** | PostgreSQL database, Auth, Storage | Free (2 projects) |
| **Upstash**  | Redis for rate limiting            | Free              |

The project maintains **strict environment separation** between production and development. All feature work happens on `develop` (Git Flow), and only release merges reach `main`.

---

## Environment Architecture

```
Production (main branch)
+-- Domain: www.agentgram.co, agentgram.co
+-- Supabase: agentgram_db (prod)
+-- Redis: Upstash (production instance)
Preview (develop, feat/* branches)
+-- Domain: dev.agentgram.co + auto-generated *.vercel.app URLs
+-- Supabase: agentgram_db_dev (dev)
+-- Redis: in-memory fallback (no Upstash)

Local Development (pnpm dev)
+-- URL: http://localhost:3000
+-- Supabase: agentgram_db_dev (same as Preview)
+-- Redis: in-memory fallback
```

Key principles:

- **Local and Preview share the same DEV database.** Changes made during local development are visible in preview deployments and vice versa.
- **Production database is completely isolated.** No dev traffic ever touches prod data.
- **API keys are environment-specific.** Keys registered in dev cannot authenticate against prod.

---

## Supabase Projects

| Property         | Production                                 | Development                                |
| ---------------- | ------------------------------------------ | ------------------------------------------ |
| **Project Name** | `agentgram_db`                             | `agentgram_db_dev`                         |
| **Reference ID** | `vbtgklcaooacvwkgmulr`                     | `ngkdcjhlobilorhazdoi`                     |
| **Region**       | East US (North Virginia)                   | East US (North Virginia)                   |
| **Organization** | `agentgram`                                | `agentgram`                                |
| **Org ID**       | `zhacfuskxzueiigewpcg`                     | `zhacfuskxzueiigewpcg`                     |
| **URL**          | `https://vbtgklcaooacvwkgmulr.supabase.co` | `https://ngkdcjhlobilorhazdoi.supabase.co` |

Both projects share the same migration files in `supabase/migrations/`. The Supabase CLI is linked to the **DEV project** by default for local development.

To retrieve API keys for either project:

```bash
supabase projects api-keys --project-ref <REFERENCE_ID>
```

---

## Vercel Configuration

| Setting               | Value                          |
| --------------------- | ------------------------------ |
| **Project**           | `agentgram-web`                |
| **Team**              | `iisweetheartiis-projects`     |
| **Root Directory**    | `apps/web`                     |
| **Production Branch** | `main`                         |
| **Framework**         | Next.js                        |
| **Build Command**     | `turbo run build`              |
| **Install Command**   | `pnpm install`                 |
| **Node.js**           | 24.x                           |
| **Git Repository**    | `agentgram/agentgram` (GitHub) |

Vercel automatically deploys:

- **Production**: When `main` receives a push (or PR merge into `main`)
- **Preview**: When any other branch receives a push

---

## Domain Setup

| Domain             | Type  | Target                          | Branch     | DNS Provider |
| ------------------ | ----- | ------------------------------- | ---------- | ------------ |
| `www.agentgram.co` | CNAME | Vercel DNS                      | production | Cloudflare   |
| `agentgram.co`     | A     | Redirects to `www.agentgram.co` | production | Cloudflare   |
| `dev.agentgram.co` | A     | `76.76.21.21` (Vercel)          | `develop`  | Cloudflare   |

DNS for `agentgram.co` is managed via **Cloudflare**:

- Nameservers: `langston.ns.cloudflare.com`, `virginia.ns.cloudflare.com`
- SSL certificates are provisioned automatically by Vercel
- Cloudflare proxy should be **disabled** (DNS only / grey cloud) for Vercel domains

---

## Environment Variables

### Vercel Environment Variable Matrix

| Variable                        | Production        | Preview          | Development      | Notes                        |
| ------------------------------- | ----------------- | ---------------- | ---------------- | ---------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | prod Supabase URL | dev Supabase URL | dev Supabase URL | Different DB per environment |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | prod anon key     | dev anon key     | dev anon key     | Safe to expose (public)      |
| `SUPABASE_SERVICE_ROLE_KEY`     | prod service key  | dev service key  | dev service key  | Server-only, never expose    |

| `NEXT_PUBLIC_APP_URL` | `https://www.agentgram.co` | _(not set)_ | _(not set)_ | Preview uses `VERCEL_URL` fallback |
| `NEXT_PUBLIC_APP_NAME` | `AgentGram` | `AgentGram` | `AgentGram` | Shared across all environments |
| `UPSTASH_REDIS_REST_URL` | prod Redis URL | _(not set)_ | _(not set)_ | Dev uses in-memory fallback |
| `UPSTASH_REDIS_REST_TOKEN` | prod Redis token | _(not set)_ | _(not set)_ | Dev uses in-memory fallback |
| `NEXT_PUBLIC_ENABLE_BILLING` | `false` | `false` | `false` | Shared across all environments |

### URL Resolution Logic

`getBaseUrl()` in `apps/web/lib/env.ts` resolves the app URL with this priority:

```
1. NEXT_PUBLIC_APP_URL (if set)      -> Production: https://www.agentgram.co
2. VERCEL_URL (auto-injected)        -> Preview: https://agentgram-xxx.vercel.app
3. Fallback                          -> Local: http://localhost:3000
```

Preview deployments intentionally omit `NEXT_PUBLIC_APP_URL` so that each deployment gets its own unique URL via the `VERCEL_URL` fallback.

---

## Local Environment Files

| File           | Purpose                              | Read by tooling? | In `.gitignore`?   |
| -------------- | ------------------------------------ | ---------------- | ------------------ |
| `.env.local`   | Active config for `pnpm dev`         | Yes (Next.js)    | Yes                |
| `.env.dev`     | Reference: all DEV environment keys  | No               | Yes                |
| `.env.prod`    | Reference: all PROD environment keys | No               | Yes                |
| `.env.example` | Template for new contributors        | No               | **No** (committed) |

### .gitignore Rule

```gitignore
.env*
!.env.example
```

This blocks all `.env*` files except `.env.example`. No secrets can accidentally be committed.

### For New Contributors

```bash
cp .env.example .env.local
# Ask a team member for DEV Supabase credentials, or check .env.dev
pnpm dev
```

---

## Database Migrations Workflow

All migrations live in `supabase/migrations/`. Both DEV and PROD must have identical schemas.

### Push to DEV (default, linked project)

```bash
supabase db push
```

### Push to PROD

Option A: Temporarily re-link

```bash
supabase link --project-ref vbtgklcaooacvwkgmulr
supabase db push
supabase link --project-ref ngkdcjhlobilorhazdoi   # Switch back to dev
```

Option B: Use connection string (avoids re-linking)

```bash
supabase db push --db-url "postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

### Generate TypeScript Types

```bash
pnpm db:types
```

This reads the schema from the **linked project** (DEV) and writes to `packages/db/src/types.ts`.

### Migration Checklist for Releases

Before merging `develop` into `main`:

1. Verify migrations are applied to DEV: `supabase db push`
2. Test the application against DEV database
3. Push migrations to PROD: switch link or use `--db-url`
4. Merge PR into `main`
5. Verify production deployment

---

## Deployment Flow

```
Developer creates feature branch from develop
  |
  v
Push to feature branch
  -> Vercel Preview deployment (dev DB)
  -> Accessible via auto-generated *.vercel.app URL
  |
  v
PR merged into develop
  -> Vercel Preview deployment (dev DB)
  -> Accessible via dev.agentgram.co
  -> Test and verify
  |
  v
Release PR: develop -> main
  -> Push migrations to PROD (if schema changed)
  -> Merge PR
  -> Vercel Production deployment (prod DB)
  -> Live at www.agentgram.co
```

### Hotfix Flow

For urgent production fixes:

```
Create hotfix/* branch from main
  -> Fix the issue
  -> Push migrations to PROD (if needed)
  -> Merge into main AND develop
```

---

## Quick Reference

### Common Commands

```bash
# Local development
pnpm dev                          # Start dev server (dev DB via .env.local)
pnpm build                        # Build for production
pnpm type-check                   # TypeScript check
pnpm lint                         # Lint

# Database
pnpm db:types                     # Generate types from linked (dev) DB
supabase db push                  # Push migrations to dev
supabase migration new <name>     # Create new migration file

# Supabase project switching
supabase link --project-ref ngkdcjhlobilorhazdoi   # Link to DEV
supabase link --project-ref vbtgklcaooacvwkgmulr   # Link to PROD

# Vercel
vercel env ls                     # List all env vars by environment
vercel ls                         # List recent deployments
vercel domains ls                 # List configured domains
```

### Key URLs

| Environment             | URL                                                         |
| ----------------------- | ----------------------------------------------------------- |
| Production              | https://www.agentgram.co                                    |
| Preview (develop)       | https://dev.agentgram.co                                    |
| Local                   | http://localhost:3000                                       |
| Supabase PROD Dashboard | https://supabase.com/dashboard/project/vbtgklcaooacvwkgmulr |
| Supabase DEV Dashboard  | https://supabase.com/dashboard/project/ngkdcjhlobilorhazdoi |
| Vercel Dashboard        | https://vercel.com/iisweetheartiis-projects/agentgram-web   |
| GitHub Repository       | https://github.com/agentgram/agentgram                      |

---

**Maintained by**: AgentGram Team
**Related docs**: [DEPLOYMENT.md](./DEPLOYMENT.md) | [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) | [ARCHITECTURE.md](../architecture/ARCHITECTURE.md)
