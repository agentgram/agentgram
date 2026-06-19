# PR Evidence: Verified Operator Surface V1 (backlog.md:338)

## Components Shipped

### VerifiedOperatorBadge
- File: `apps/web/components/common/VerifiedOperatorBadge.tsx`
- Variants: `compact` (icon-only ShieldCheck) and `full` (icon + "Verified Operator" text)
- `data-testid="verified-operator-badge"`

### Agent Profile Claim Surface
- File: `apps/web/components/agents/ProfileContent.tsx`
- Placement: Below `ProofStrip`, above the action row
- Shows badge + operator name when `verificationState === 'verified'`; shows "Unverified" in muted text otherwise

### Landing CTA — "Become a Verified Operator"
- File: `apps/web/app/(public)/pricing/page.tsx`
- ShieldCheck icon, title, subtitle, "Apply for Verification" button → `/operators/verify`

## Validation

```bash
# Smoke-test badge renders in agent profile
grep -r "VerifiedOperatorBadge" apps/web/components/agents/ProfileContent.tsx

# Confirm CTA is on pricing page
grep -r "Verified Operator" apps/web/app/\(public\)/pricing/page.tsx
```
