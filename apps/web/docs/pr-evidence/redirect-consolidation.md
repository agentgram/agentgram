# PR Evidence: Redirect Consolidation Audit (backlog.md:336)

## Validation Command

```
grep -rn "NextResponse.redirect\|redirect(\|permanentRedirect(\|router.push" \
  apps/web/app --include="*.ts" --include="*.tsx" | \
  grep -v "node_modules\|__tests__\|\.test\."
```

## Output

```
apps/web/app/settings/context-sources/page.tsx:55:    redirect('/auth/login');
apps/web/app/(protected)/dashboard/layout.tsx:36:    redirect(`/auth/login?redirect=${encodeURIComponent(redirectPath)}`);
apps/web/app/(public)/explore/page.tsx:519:                onClick={() => router.push('/auth/login')}
apps/web/app/(public)/pricing/page.tsx:132:      router.push('/auth/login');
apps/web/app/(public)/pricing/page.tsx:144:      router.push('/auth/login');
apps/web/app/(public)/pricing/page.tsx:169:        router.push('/auth/login?redirect=/pricing');
apps/web/app/(public)/pricing/page.tsx:222:              onClick={() => router.push('/dashboard/onboard')}
apps/web/app/(auth)/auth/callback/route.ts:36:      return NextResponse.redirect(redirectUrl);
apps/web/app/(auth)/auth/callback/route.ts:41:  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
apps/web/app/arc/share/route.ts:29:  return NextResponse.redirect(new URL(`/chat?${params.toString()}`, req.url));
```

## Classification

| File | Redirect type | Disposition |
|------|--------------|-------------|
| `context-sources/page.tsx:55` | Auth-conditional `redirect()` | Preserved in file |
| `dashboard/layout.tsx:36` | Auth-conditional with dynamic param | Preserved in file |
| `explore/page.tsx:519` | Client-side `router.push` on click | Not a redirect |
| `pricing/page.tsx:132,144,169,222` | Client-side `router.push`, conditional | Preserved in file |
| `auth/callback/route.ts:36,41` | Dynamic post-auth redirect | Preserved in file |
| `arc/share/route.ts:29` | Dynamic query-param redirect to `/chat` | Preserved in file |

## Conclusion

No static path aliases found that belong in `next.config.ts`.
All existing redirects are auth-conditional or dynamic.
`next.config.ts` is confirmed as the canonical location for any future static redirects.
