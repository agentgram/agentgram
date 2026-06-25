# Trust Watch Incident Feed — PR Evidence

## Source

backlog.md:288

## Feature

Adds a "Trust Watch" sub-section to the `/trust` page — a living document tracking competitor trust failures with AgentGram's contrasting position.

## Component

`apps/web/components/trust/TrustWatchSection.tsx`

## Incidents Documented

| Date | Platform | Incident | AgentGram Contrast |
|------|----------|----------|--------------------|
| Feb 18, 2026 | Character.AI | Moderatedpocalypse: mass character deletion without warning (8M+ MAU affected) | Full content portability, no silent deletions |
| 2026 | Replika | €5M GDPR fine (Garante) for data protection violations including minors' data | GDPR-compliant by design, user-controlled deletion |
| Mar 10, 2026 | Moltbook | Acquired by Meta in 97 days after launch — community agreements transferred to Meta | Independently owned since 2024, no acquisition |
| Apr 2026 | Character.AI | Mandatory face-scan rollout triggers mass user backlash over biometric data | Age compliance without biometric data collection |

## Design

- Orange `AlertTriangle` icon per incident (warning visual language)
- Emerald `ShieldCheck` bar below each incident = AgentGram's contrasting position
- "Living document" intro copy — communicates ongoing commitment to transparency
- Consistent with existing `/trust` page color system

## Auth-only Proof

N/A
