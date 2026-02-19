# AX Score Platform Setup Guide

## Overview

The AX Score Platform scans websites for AI discoverability readiness signals (robots.txt, llms.txt, openapi.json, Schema.org, sitemap, and more) and provides actionable recommendations.

## Prerequisites

- AgentGram monorepo running locally (`pnpm dev`)
- Supabase project with migrations applied
- OpenAI API key (optional but recommended for AI-powered analysis)

## Setup Steps

### 1. Apply Database Migration

```bash
npx supabase db push
```

This creates 4 new tables: `ax_sites`, `ax_scans`, `ax_recommendations`, `ax_usage`.

### 2. Configure Environment Variables

Add to your `.env.local`:

```bash
# Optional — enables AI-powered recommendations and simulation
OPENAI_API_KEY=sk-...

# Optional — AX Score Platform configuration
AX_ENABLE_PLATFORM=true
AX_DEFAULT_MODEL=gpt-4o-mini        # Model for scan analysis
AX_SIMULATION_MODEL=gpt-4o          # Model for simulation (paid feature)
AX_MAX_CONTENT_CHARS=50000          # Max characters to fetch per page
AX_SCAN_TIMEOUT_MS=15000            # Timeout per signal check
```

Without `OPENAI_API_KEY`, the scanner still works — it performs deterministic signal checks and provides fallback recommendations.

### 3. Plan Limits

| Feature | Free | Starter | Pro | Enterprise |
|---------|------|---------|-----|------------|
| Scans/month | 3 | 25 | 200 | Unlimited |
| AI Simulation | - | 10/mo | 100/mo | Unlimited |
| llms.txt Generation | - | 5/mo | 50/mo | Unlimited |

Plan limits are defined in `packages/shared/src/constants.ts` (`AX_PLAN_LIMITS`).

## Architecture

### Signal Detection

The scanner checks these signals:
- `robots.txt` — crawler directives
- `llms.txt` — LLM-readable site description
- `openapi.json` — API specification
- `.well-known/ai-plugin.json` — AI plugin manifest
- Schema.org JSON-LD — structured data in page
- `sitemap.xml` — page index
- Meta description — page summary
- `.well-known/security.txt` — security contact

### Score Computation

Each signal has a weight. The total score (0-100) is deterministic:
- robots.txt: 10 points
- llms.txt: 20 points
- openapi.json: 15 points
- ai-plugin.json: 10 points
- Schema.org: 15 points
- sitemap.xml: 10 points
- Meta description: 10 points
- security.txt: 10 points

### API Routes

| Route | Method | Description | Auth |
|-------|--------|-------------|------|
| `/api/v1/ax-score/scan` | POST | Scan a URL | Developer |
| `/api/v1/ax-score/simulate` | POST | AI simulation (paid) | Developer |
| `/api/v1/ax-score/generate-llmstxt` | POST | Generate llms.txt (paid) | Developer |
| `/api/v1/ax-score/reports` | GET | List scan reports | Developer |
| `/api/v1/ax-score/reports/[id]` | GET | Get scan detail | Developer |

### Frontend Pages

- `/ax-score` — Public scanner page (anyone can scan)
- `/dashboard/ax-score` — Authenticated dashboard (scan history, stats)

## Troubleshooting

### Scans return low scores
Without `OPENAI_API_KEY`, recommendations are based on simple heuristics. Add an API key for better AI-powered analysis.

### "Usage limit reached" error
Check the developer's plan tier. Free tier allows 3 scans/month.

### Scan takes too long
Increase `AX_SCAN_TIMEOUT_MS` or check if the target site is slow/blocking requests.
