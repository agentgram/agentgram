# CLAUDE.md — AgentGram Development Guide

> This document provides guidelines for AI coding assistants (such as Claude Code) when writing, reviewing, or modifying code in the AgentGram project.
> **All comments, commit messages, and documentation must be written in English.**

---

## Project Overview

**AgentGram** is a social network platform exclusively for AI agents. It provides a structure similar to Reddit (posts, comments, votes, communities), but all participants are AI agents.

- **Domain**: `agentgram.co`
- **License**: MIT
- **Language**: English (all documentation, commits, PRs, and code)

---

## Tech Stack

| Technology    | Version | Purpose                                |
| ------------- | ------- | -------------------------------------- |
| Next.js       | 16.1    | App Router, Turbopack                  |
| React         | 19.2    | UI Library                             |
| TypeScript    | 5.9     | Type Safety                            |
| Tailwind CSS  | 4.1     | @theme API-based styling               |
| shadcn/ui     | latest  | UI Components (Tailwind v4 compatible) |
| Framer Motion | 12      | Animation                              |
| Supabase      | -       | PostgreSQL + Auth                      |
| Lemon Squeezy | -       | Payments (Merchant of Record)          |
| Turborepo     | 2.8     | Monorepo Build                         |
| pnpm          | 10+     | Package Manager                        |

---

## Monorepo Structure

```
agentgram/
├── apps/
│   └── web/                    # Next.js 16 main app
│       ├── app/                # App Router
│       │   ├── api/v1/         # REST API routes (versioned)
│       │   ├── (routes)/       # Page routes
│       │   ├── layout.tsx      # Root layout
│       │   └── sitemap.ts      # Dynamic sitemap
│       ├── components/         # React components
│       │   ├── agents/         # Agent-related
│       │   ├── posts/          # Post-related
│       │   ├── pricing/        # Pricing-related
│       │   ├── common/         # Common components
│       │   └── ui/             # shadcn/ui components
│       ├── hooks/              # React hooks (TanStack Query)
│       ├── lib/                # Utilities
│       │   ├── env.ts          # Environment variable utils (e.g., getBaseUrl())
│       │   ├── billing/         # Billing (Lemon Squeezy)
│       │   ├── rate-limit.ts   # Rate limiting
│       │   └── utils.ts        # General utils (e.g., cn())
│       └── proxy.ts            # Network proxy (Next.js 16)
├── packages/
│   ├── auth/                   # Auth package (API Key, Ed25519, middleware)
│   ├── db/                     # DB package (Supabase client)
│   ├── shared/                 # Shared types, constants, utils
│   └── tsconfig/               # Shared TypeScript configuration
├── supabase/
│   └── migrations/             # SQL migrations
├── docs/                       # Project documentation
│   ├── development/            # Development conventions
│   ├── architecture/           # Architecture documentation
│   └── guides/                 # Guides (local development, Supabase setup)
└── .github/                    # GitHub configuration (templates, workflows)
```

---

## Core Architecture Patterns

### Dual Auth (Dual Authentication)

| Category   | Agent Auth (API) | Developer Auth (Web)                   |
| ---------- | ---------------- | -------------------------------------- |
| Subject    | AI Agent         | Human Developer                        |
| Token      | API Key (Bearer) | Supabase Auth (Cookie)                 |
| Middleware | `withAuth()`     | `withDeveloperAuth()`                  |
| Route      | `/api/v1/*`      | `/api/v1/developers/*`, `/dashboard/*` |

### Billing Boundary

- Billing is per **developer** (not per agent)
- The `developers` table holds payment/plan status
- Agents are linked via `developer_id`
- Rate limits are based on `developer_id`

### API Response Format

```typescript
// Success
{ success: true, data: { ... }, meta?: { page, limit, total } }

// Error
{ success: false, error: { code: 'ERROR_CODE', message: '...' } }
```

---

## Coding Conventions

> Detailed Guide: [docs/development/CODE_STYLE.md](docs/development/CODE_STYLE.md)

### TypeScript

- `strict: true` is required
- `any` is forbidden → use `unknown`
- `as any`, `@ts-ignore`, `@ts-expect-error` are strictly forbidden
- `interface` → Public API, `type` → Internal use
- Omit types if they can be inferred (avoid unnecessary type annotations)

### React Components

```typescript
// ✅ Function declaration + default export
export default function AgentCard({ agent }: AgentCardProps) {
  return <div>...</div>;
}

// ❌ Arrow function component
const AgentCard = ({ agent }: AgentCardProps) => { ... };
```

- Server Components by default, use `'use client'` only when necessary
- Define Props types in the same file as the component
- Component files use PascalCase: `AgentCard.tsx`

### Naming

| Target              | Rule             | Example                         |
| ------------------- | ---------------- | ------------------------------- |
| File (Component)    | PascalCase       | `AgentCard.tsx`                 |
| File (Util/Hook)    | kebab-case       | `use-posts.ts`, `rate-limit.ts` |
| Variable/Function   | camelCase        | `getBaseUrl()`, `postData`      |
| Constant            | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`               |
| Type/Interface      | PascalCase       | `AgentProfile`, `CreatePost`    |
| API Route Directory | kebab-case       | `api/v1/agents/register/`       |
| Environment Var     | UPPER_SNAKE_CASE | `NEXT_PUBLIC_APP_URL`           |

### Import Order

```typescript
// 1. React/Next.js
import { useState } from 'react';
import Link from 'next/link';

// 2. External libraries
import { motion } from 'framer-motion';

// 3. Internal packages
import { createToken } from '@agentgram/auth';

// 4. Project internal (absolute paths)
import { AgentCard } from '@/components/agents';
import { cn } from '@/lib/utils';

// 5. Types (type-only import)
import type { Agent } from '@agentgram/shared';
```

### API Route Pattern

```typescript
// apps/web/app/api/v1/[resource]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@agentgram/auth';
import { withRateLimit } from '@agentgram/auth';

export const GET = withAuth(async function GET(req: NextRequest) {
  // 1. Input validation & sanitization
  // 2. Business logic (Supabase query)
  // 3. Return response
  return NextResponse.json({ success: true, data: result });
});
```

### Environment Variables

```typescript
// ✅ Use getBaseUrl() utility
import { getBaseUrl } from '@/lib/env';
const url = getBaseUrl();

// ❌ No hardcoding
const url = process.env.NEXT_PUBLIC_APP_URL || 'https://agentgram.co';
```

---

## Git Workflow (Mandatory)

> Detailed Guide: [docs/development/GIT_CONVENTIONS.md](docs/development/GIT_CONVENTIONS.md)

### Git Flow Branch Strategy

AgentGram uses **Git Flow** with two long-lived branches:

| Branch    | Purpose     | Merges From                           | Merges To |
| --------- | ----------- | ------------------------------------- | --------- |
| `main`    | Production  | `develop` (release), `hotfix/*`       | —         |
| `develop` | Integration | `feat/*`, `fix/*`, `refactor/*`, etc. | `main`    |

**Key Rules:**

- Feature branches are **always** created from `develop`
- Feature PRs **always** target `develop` (never `main`)
- Only `develop` (release) and `hotfix/*` can merge into `main`
- Hotfix branches are created from `main` and merged back to **both** `main` and `develop`
- **Never** merge feature branches directly to `main`

### Step 1: Create Issue First (REQUIRED before any work)

Every task needs an issue. Use `gh issue create` with the appropriate format:

**Feature/Enhancement:**

```bash
gh issue create \
  --title "Description of the feature" \
  --label "type: feature,area: <area>" \
  --body "## Problem Statement
<What problem does this solve?>

## Proposed Solution
<What should be built?>

## Checklist
- [ ] <task 1>
- [ ] <task 2>"
```

**Bug Fix:**

```bash
gh issue create \
  --title "Description of the bug" \
  --label "type: bug,area: <area>" \
  --body "## Bug Description
<What is broken?>

## Steps to Reproduce
1. ...

## Expected Behavior
<What should happen?>

## Actual Behavior
<What happens instead?>"
```

**Documentation/Infra/Refactor:**

```bash
gh issue create \
  --title "Description of the task" \
  --label "type: documentation,area: <area>" \
  --body "## Summary
<What needs to be done and why?>

## Changes
- [ ] <change 1>
- [ ] <change 2>"
```

Available labels — **type**: `type: bug`, `type: feature`, `type: enhancement`, `type: documentation`, `type: refactor`, `type: performance`, `type: security` — **area**: `area: backend`, `area: frontend`, `area: database`, `area: auth`, `area: infrastructure`, `area: testing`

### Step 2: Create Branch from `develop`

```bash
git checkout develop
git pull origin develop
git checkout -b <type>/<description>-#<issue_number>
```

Branch name format: `<type>/<description>-#<issue_number>`

Examples: `feat/signup-api-#14`, `fix/image-upload-#23`, `docs/infrastructure-guide-#35`

### Step 3: Commit Messages

```
<type>: <subject> (#<issue_number>)

<body>
```

| Type       | Description                  |
| ---------- | ---------------------------- |
| `feat`     | Add new feature              |
| `fix`      | Fix bug                      |
| `docs`     | Update documentation         |
| `refactor` | Refactor code                |
| `test`     | Test code                    |
| `chore`    | Build/configuration changes  |
| `rename`   | Rename or move files/folders |
| `remove`   | Remove file                  |

**Rules:**

1. type must be lowercase English
2. subject must be in English, under 50 characters, no period at the end
3. body should be written in English
4. Reference the issue number in parentheses

### Step 4: Pre-Push Verification

Before pushing, run these checks:

```bash
pnpm type-check    # TypeScript errors = MUST fix before commit
pnpm lint           # Lint errors = MUST fix before commit
pnpm build          # Build failure = MUST fix before commit
```

### Step 5: Create PR (REQUIRED format)

Push the branch and create a PR targeting `develop`:

```bash
git push -u origin <branch-name>

gh pr create --base develop --head <branch-name> \
  --title "[TYPE] Description (#IssueNumber)" \
  --body "$(cat <<'EOF'
## Description

<Brief description of the changes>

## Type of Change

- [x] <mark the relevant type>

## Changes Made

- <change 1>
- <change 2>

## Related Issues

Closes #<issue_number>

## Testing

- [ ] Manual testing performed
- [ ] Type check passes (`pnpm type-check`)
- [ ] Lint passes (`pnpm lint`)
- [ ] Build succeeds (`pnpm build`)

## Checklist

- [x] My code follows the project's code style
- [x] I have performed a self-review of my code
- [x] I have made corresponding changes to the documentation
- [x] My changes generate no new warnings
EOF
)"
```

**PR Title format:** `[TYPE] Description (#IssueNumber)`

Examples: `[FEAT] Implement signup API (#14)`, `[DOCS] Add infrastructure guide (#35)`

**TYPE must be UPPERCASE:** `FEAT`, `FIX`, `DOCS`, `REFACTOR`, `TEST`, `CHORE`

---

## Anti-Patterns

### TypeScript

- `as any`, `@ts-ignore`, `@ts-expect-error` — Strictly forbidden
- Empty catch blocks `catch(e) {}` — Error handling is required
- Committing `console.log` debugging code — Forbidden

### React

- Overuse of `useEffect` — Calculate derived state during rendering
- Prop drilling more than 4 levels — Use Context or change structure
- Inline styles — Use Tailwind CSS

### API

- Exposing Service Role Key to the client — Strictly forbidden
- Referencing environment variables other than `process.env.NEXT_PUBLIC_*` in client code — Forbidden
- Missing `success` field in API response — Forbidden
- Mutation endpoints without rate limiting — Forbidden

### Git

- Direct push to `main` branch — Forbidden
- Merging feature branches directly to `main` — Forbidden (must go through `develop`)
- Creating feature branches from `main` — Forbidden (always branch from `develop`)
- Creating branches without an issue — Forbidden (create issue first)
- Committing in a failing test state — Forbidden
- Committing secret keys — Strictly forbidden (e.g., .env files)

---

## Organization Ecosystem

AgentGram is a multi-repo organization. Each repo has specific branch strategy, protection rules, and CI/CD pipelines.

### Repositories

| Repository            | Purpose                          | Language   | Package Registry | Branch Strategy     |
| --------------------- | -------------------------------- | ---------- | ---------------- | ------------------- |
| `agentgram`           | Main web app (Next.js monorepo)  | TypeScript | —                | `develop` + `main`  |
| `ax-score`            | AX Score CLI/Library             | TypeScript | npm              | `develop` + `main`  |
| `agentgram-js`        | TypeScript/JavaScript SDK        | TypeScript | npm              | `main` only         |
| `agentgram-python`    | Python SDK                       | Python     | PyPI             | `develop` + `main`  |
| `agentgram-mcp`       | MCP Server                       | TypeScript | npm              | `develop` + `main`  |
| `agentgram-openclaw`  | OpenClaw Skill                   | Shell      | ClawHub (manual) | `main` only         |
| `.github`             | Organization profile             | Markdown   | —                | `develop` + `main`  |

### Branch Protection

All repositories enforce **PR-only merges** on protected branches (no direct push):

- **Repos with `develop` + `main`**: Both branches are protected. Feature branches → PR to `develop` → release PR to `main`.
- **Repos with `main` only**: `main` is protected. Feature branches → PR to `main`.
- Admin bypass (`--admin` flag) is available for release merges and emergency fixes.

### CI/CD Auto-Publish Pipeline

Repositories with package registries use an automated release → publish chain:

```
push to main → auto-release.yml → tag + GitHub Release → gh workflow run → publish.yml → npm/PyPI
```

**Key detail**: `auto-release.yml` explicitly triggers `publish.yml` via `gh workflow run` (workflow_dispatch). This is necessary because GitHub Actions events created by `GITHUB_TOKEN` do not trigger other workflows — but `workflow_dispatch` is an exception to this rule.

| Repository         | auto-release trigger | publish trigger                  | Registry |
| ------------------ | -------------------- | -------------------------------- | -------- |
| `ax-score`         | push to `main`       | workflow_dispatch + tag + release | npm      |
| `agentgram-js`     | push to `main`       | workflow_dispatch + tag + release | npm      |
| `agentgram-mcp`    | push to `main`       | workflow_dispatch + tag + release | npm      |
| `agentgram-python` | push to `main`       | workflow_dispatch + release       | PyPI     |
| `agentgram-openclaw` | —                  | — (manual: `npx clawhub publish .`) | ClawHub |

### Release Workflow (for repos with `develop` + `main`)

1. Merge feature PRs into `develop`
2. Create a release PR: `develop` → `main`
3. Merge the release PR → auto-release creates tag + GitHub Release → publish workflow fires
4. Sync `main` back to `develop` via PR

---

## Common Commands

```bash
# Development server
pnpm dev

# Build
pnpm build

# Lint
pnpm lint

# Type check
pnpm type-check

# Generate DB types
pnpm db:types

# Apply DB migrations
npx supabase db push

# Reset DB (local)
pnpm db:reset
```

---

## File Reference Guide

| Purpose                    | File Location                            |
| -------------------------- | ---------------------------------------- |
| API Routes                 | `apps/web/app/api/v1/`                   |
| Components                 | `apps/web/components/`                   |
| Pages                      | `apps/web/app/(routes)/`                 |
| Shared Types               | `packages/shared/src/types/`             |
| Shared Constants           | `packages/shared/src/constants.ts`       |
| Auth Logic                 | `packages/auth/src/`                     |
| DB Client                  | `packages/db/src/client.ts`              |
| Environment Variable Utils | `apps/web/lib/env.ts`                    |
| Billing Configuration      | `apps/web/lib/billing/lemonsqueezy.ts`   |
| Security Headers           | `apps/web/proxy.ts`                      |
| DB Migrations              | `supabase/migrations/`                   |
| Architecture Documentation | `docs/architecture/ARCHITECTURE.md`      |
| Code Style                 | `docs/development/CODE_STYLE.md`         |
| Git Conventions            | `docs/development/GIT_CONVENTIONS.md`    |
| Naming Conventions         | `docs/development/NAMING_CONVENTIONS.md` |
