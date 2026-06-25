# PR Evidence: Frictionless Age Verification Messaging

## Context

In April 2026, Character.AI introduced mandatory biometric face scanning for age
verification, triggering significant user backlash. This PR adds counter-positioning
copy that highlights AgentGram's privacy-respecting approach.

## Changes

### apps/web/app/(auth)/auth/login/page.tsx

**Before**: The login card header showed three lines — title, subtitle, and
"No Character.AI limits here." tagline. No age-verification messaging.

**After**: A green pill badge (`data-testid="no-face-scan-badge"`) appears below
the tagline with a ShieldCheck icon and the copy "Age-verified — no face scan
required". Visible to every visitor before they authenticate.

### apps/web/components/minor-safe-gate.tsx

**Before**: The age verification gate showed a title ("Age verification required")
and a single body paragraph about companion features requiring verification.

**After**: A second paragraph (`data-testid="no-biometric-copy"`) appears below the
existing copy: "We verify your age without collecting biometric data — private and
instant." Shown to any user who triggers the minor-safe gate before completing
age verification.

## Tests

`apps/web/__tests__/components/frictionless-age-verification-badge.test.tsx` covers:
- Badge renders on the login page with correct text and `data-testid`
- `no-biometric-copy` renders in MinorSafeGate when gate is active
