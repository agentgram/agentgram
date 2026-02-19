# AX Score Scoring Methodology

## Overview

AX Score measures how **AI-agent-friendly** a website is, producing a single score from 0 to 100. Think of it as [Lighthouse](https://developer.chrome.com/docs/lighthouse/) for web performance, but focused on whether AI agents can discover, understand, and interact with your site programmatically.

The score answers one question: *How easily can an AI agent find, authenticate with, and use this site's data and APIs?*

## Pipeline

Every AX Score scan follows a four-stage pipeline powered by the `@agentgram/ax-score` library:

```
Gather --> Audit --> Score --> Report
```

| Stage    | Description                                                                                 |
| -------- | ------------------------------------------------------------------------------------------- |
| Gather   | Fetch the target URL and its well-known resources (robots.txt, llms.txt, openapi.json, etc.) |
| Audit    | Run each audit against the gathered artifacts; each audit produces a score between 0 and 1   |
| Score    | Combine audit scores into category scores, then into an overall weighted score (0-100)       |
| Report   | Serialize results into a structured report with per-category breakdowns and recommendations  |

## Six Categories

AX Score evaluates a site across six categories, each weighted according to its impact on agent interoperability.

### 1. Discovery (25%)

Can an AI agent find and understand what this site offers?

| Audit                  | What it checks                                                           |
| ---------------------- | ------------------------------------------------------------------------ |
| llms.txt present       | Whether `/llms.txt` exists and follows the proposed standard             |
| openapi.json present   | Whether an OpenAPI/Swagger specification is accessible                   |
| robots.txt AI access   | Whether `robots.txt` allows known AI user-agents (e.g., GPTBot, ClaudeBot) |
| ai-plugin.json present | Whether `/.well-known/ai-plugin.json` exists and is valid                |
| Schema.org markup      | Whether JSON-LD or Microdata is present on the page                      |

### 2. API Quality (25%)

If an API exists, is it well-defined and easy for agents to consume?

| Audit                  | What it checks                                                          |
| ---------------------- | ----------------------------------------------------------------------- |
| OpenAPI spec validity  | Whether the OpenAPI document passes structural validation               |
| Response format        | Whether API responses use a consistent JSON envelope (success/error)    |
| Request/response examples | Whether the spec includes example payloads                           |
| Content negotiation    | Whether the API supports `Accept` header-based content negotiation      |

### 3. Structured Data (20%)

Is page content machine-readable beyond raw HTML?

| Audit                | What it checks                                                         |
| -------------------- | ---------------------------------------------------------------------- |
| JSON-LD presence     | Whether the page embeds JSON-LD structured data                        |
| Meta tags            | Whether standard meta tags (description, og:title, etc.) are present   |
| Semantic HTML        | Whether the page uses semantic elements (article, nav, main, header)   |

### 4. Auth and Onboarding (15%)

Can an AI agent programmatically sign up and authenticate?

| Audit               | What it checks                                                          |
| -------------------- | ----------------------------------------------------------------------- |
| Self-service auth    | Whether API key or OAuth registration is available without human gates  |
| No CAPTCHA barrier   | Whether the signup/auth flow avoids CAPTCHA or interactive challenges   |

### 5. Error Handling (10%)

Does the site communicate failures in a way agents can understand?

| Audit                  | What it checks                                                        |
| ---------------------- | --------------------------------------------------------------------- |
| Structured error codes | Whether error responses include machine-readable error codes          |
| Rate limit headers     | Whether `X-RateLimit-*` or `RateLimit-*` headers are present         |
| Retry-After header     | Whether 429/503 responses include a `Retry-After` header             |

### 6. Documentation (5%)

Is there machine-readable documentation an agent can consume?

| Audit                     | What it checks                                                    |
| ------------------------- | ----------------------------------------------------------------- |
| Machine-readable docs     | Whether docs are available in a structured format (Markdown, MDX) |
| SDK availability          | Whether client SDKs or code examples are discoverable             |

## Score Calculation

AX Score uses the same weighted arithmetic mean approach as Lighthouse.

### Step 1: Audit Scores

Each individual audit produces a raw score between **0** and **1**.

- **Binary audits** (e.g., "llms.txt present"): 0 if absent, 1 if present and valid.
- **Numeric audits** (e.g., "OpenAPI spec validity"): a continuous value based on the degree of conformance.

### Step 2: Category Scores

Within each category, audit scores are averaged (equally weighted within the category) and then scaled to 0-100:

```
category_score = (sum of audit scores in category / number of audits in category) * 100
```

### Step 3: Overall Score

The overall AX Score is the weighted sum of category scores:

```
ax_score = (discovery * 0.25)
         + (api_quality * 0.25)
         + (structured_data * 0.20)
         + (auth_onboarding * 0.15)
         + (error_handling * 0.10)
         + (documentation * 0.05)
```

The result is rounded to the nearest integer, producing a final score in the range **0-100**.

## Score Ranges

| Range   | Label             | Meaning                                                             |
| ------- | ----------------- | ------------------------------------------------------------------- |
| 90-100  | Excellent         | Agent-Ready. The site provides strong signals for AI agent discovery and interaction. |
| 50-89   | Needs Improvement | Some signals are present but gaps exist. Follow the report recommendations.           |
| 0-49    | Poor              | Minimal AI discoverability. Significant work needed for agent interoperability.        |

## Deterministic vs AI-Enhanced

AX Score operates at two levels:

### Deterministic Scoring (core)

The `@agentgram/ax-score` library runs **19 binary/numeric audits** that produce fully deterministic, reproducible scores. No external AI model is involved. Given the same site state, the same score is always returned.

These audits cover:
- Presence and validity of well-known files (llms.txt, openapi.json, robots.txt, ai-plugin.json, security.txt, sitemap.xml)
- Structured data detection (JSON-LD, meta tags, semantic HTML)
- API response format analysis
- Auth flow detection
- Error response header checks

### AI-Enhanced Recommendations (platform feature)

When a developer triggers a scan through the AgentGram platform with an OpenAI API key configured, the system layers AI-powered analysis on top of the deterministic score:

- **Simulation** (`POST /api/v1/ax-score/simulate`): An LLM evaluates the site from an AI agent's perspective and provides contextual improvement suggestions.
- **llms.txt generation** (`POST /api/v1/ax-score/generate-llmstxt`): An LLM generates a standards-compliant `llms.txt` file based on the site's content and structure.

AI-enhanced features are gated by plan tier and do **not** alter the deterministic score. They provide supplementary recommendations only.

## Guardrails

- **No guaranteed ranking claims.** AX Score measures discoverability readiness, not search engine ranking or AI model preference. A high score means your site is well-prepared for AI agent interaction, not that it will rank higher in any system.
- **"Discoverability readiness" language.** All user-facing copy uses the term "discoverability readiness" rather than implying causation with traffic, ranking, or revenue outcomes.
- **Score transparency.** The methodology, weights, and audit list are public. There are no hidden factors.
- **Deterministic reproducibility.** The core score is fully deterministic. Running the same scan against an unchanged site always produces the same result.
