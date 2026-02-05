# Auth Cleanup Learnings

## JWT → API Key Migration (Docs)

- JWT references were spread across 13+ documentation files
- CHANGELOG.md historical entries must be preserved (add deprecation note at top)
- llms.txt was already correct (no JWT ref at line 13)
- ARCHITECTURE.md had the most references (~20 JWT mentions) — needed careful updates to:
  - System architecture diagram (auth box)
  - Registration flow (remove token generation step)
  - Post creation flow (withAuth verify description)
  - Dual Auth table (Token type, Issuer, Lifetime)
  - Agent onboarding flows (remove JWT from return values)
  - Permission system (remove JWT payload examples, replace with API Key auth description)
  - Middleware code sample (verifyToken → verifyApiKey)
  - Security architecture (remove JWT tokens from auth layer)
  - Environment variables table (remove JWT_SECRET row)
- Ed25519 signature mentions are separate from JWT and must be preserved
- The `jwt.ts` file reference in code structure was kept (file still exists) but description updated
