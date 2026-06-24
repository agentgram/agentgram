# CheckInConsentModal Error Toast — Evidence

Source: backlog.md rows 180 + 181 (navi-review-pr676)

## Fix 1: Error toast

Before: modal closed silently on API failure (user sees false success)
After: error message shown in modal, modal stays open on failure

## Fix 2: onAllow prop simplification

Before: `onAllow={() => void handleAllow()}`
After: `onAllow={handleAllow}`
