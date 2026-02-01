# 🔍 AgentGram Hardcode & Mock Data Audit Report

**프로젝트**: AgentGram  
**감사 일시**: 2025-02-01  
**검토자**: AI Assistant  
**범위**: Next.js 16 + Turborepo monorepo (apps/web/, packages/*)

---

## 📊 Executive Summary

총 **21개** 환경변수 사용처 발견  
총 **53개** console.log/error 발견  
주요 보안 이슈 **3건** (Critical)  
하드코딩된 URL **15+개소**  

---

## 🔴 Critical Issues (즉시 수정 필요)

### 1. JWT Secret Fallback 값

**파일**: `packages/auth/src/jwt.ts:3`

```typescript
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
```

**문제점**:
- 환경변수가 없을 때 취약한 기본값 사용
- 프로덕션에서 이 fallback이 사용되면 모든 토큰이 위조 가능

**해결방안**:
```typescript
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
```

---

### 2. Demo Agent ID 하드코딩

**파일**: `apps/web/app/pricing/page.tsx:93`

```typescript
const agentId = 'demo-agent-id';
```

**문제점**:
- 프로덕션에서 실제 agent ID를 사용해야 하는데 더미값 사용
- 결제 플로우가 작동하지 않음

**해결방안**:
- 로그인된 사용자의 실제 agent ID를 세션/쿠키에서 가져오기
- 또는 /agents/register로 리다이렉트

---

### 3. Domain/URL 하드코딩 (여러 곳)

**위치**: 15+ 파일

주요 하드코딩 URL들:
- `https://agentgram.co` - 프로덕션 도메인
- `https://github.com/agentgram/agentgram` - GitHub 레포 (OK, 고정값)
- `https://discord.gg/agentgram` - Discord 초대 링크
- `https://twitter.com/rosie8_ai` - Twitter 계정
- `sales@agentgram.co` - 이메일 주소

**영향받는 파일**:
```
apps/web/app/sitemap.ts:4
apps/web/app/layout.tsx:11,35,53,106,154,162,163
apps/web/app/agents/page.tsx:18
apps/web/app/explore/page.tsx:18
apps/web/app/docs/quickstart/page.tsx:33,43,47,69,72,76,244
apps/web/app/docs/api/page.tsx:33,55,71,92,114,129,140,152,164,183,200,416
apps/web/app/docs/page.tsx:24,44,53,113,124
apps/web/app/pricing/page.tsx:88
apps/web/proxy.ts:61-63
apps/web/app/page.tsx (structured data, 여러 곳)
```

**해결방안**:
모든 URL을 환경변수로 이동:
```typescript
// .env.example에 추가
NEXT_PUBLIC_APP_URL=https://agentgram.co
NEXT_PUBLIC_GITHUB_URL=https://github.com/agentgram/agentgram
NEXT_PUBLIC_DISCORD_INVITE=https://discord.gg/agentgram
NEXT_PUBLIC_TWITTER_HANDLE=@rosie8_ai
NEXT_PUBLIC_SALES_EMAIL=sales@agentgram.co
```

---

## 🟡 Warnings (개선 권장)

### 4. 테스트/더미 데이터 부재

**파일**: 프로젝트 전체

**발견 사항**:
- `grep "Lorem ipsum\|dummy\|mock\|fake"` 결과: **0건**
- 테스트 데이터나 placeholder가 없음
- 실제 사용자 데이터만 표시되는 것으로 보임

**권장 사항**:
- 개발 환경에서 사용할 시드 데이터 추가 (`supabase/seed.sql` 확장)
- UI 컴포넌트 Storybook 추가 시 mock data 필요

---

### 5. console.log/error 과다 사용

**총 53개** console 호출 발견

#### Production Log 잔존 (삭제 또는 Logger로 교체)

**apps/web/app/api/v1/posts/[id]/route.ts:286**
```typescript
console.log(`Post deleted: ${id} by agent: ${agentId} - title: "${existingPost.title}"`);
```
→ 민감 정보 로깅, 프로덕션에서 제거 필요

**apps/web/app/api/v1/stripe/webhook/route.ts (여러 곳)**
```typescript
console.log(`✅ Checkout completed: agent=${agentId}, customer=${customerId}`);
console.log(`✅ Subscription created: customer=${customerId}, plan=${plan}`);
console.log(`💰 Invoice paid: customer=${customerId}, amount=${invoice.amount_paid}`);
```
→ 결제 정보 로깅, structured logger로 교체 권장

#### Error Logging (유지 OK, 단 개선 권장)

**Error console.error 사용처 (50건)**:
- `packages/auth/src/jwt.ts:33`
- `packages/auth/src/keypair.ts:48`
- 모든 API route handlers (예외 처리용)

**권장 사항**:
- Sentry, LogRocket 등 에러 트래킹 서비스 도입
- 또는 Winston/Pino 같은 structured logger 사용
```typescript
import { logger } from '@/lib/logger';
logger.error('JWT verification error', { error, context });
```

---

### 6. Hardcoded Rate Limits & Constants

**파일**: `packages/shared/src/constants.ts`

```typescript
export const RATE_LIMITS = {
  POST_CREATE: {
    limit: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  // ...
}
```

**상태**: ✅ 이건 OK (상수로 관리하는 게 맞음)

단, 향후 동적 조정이 필요하면 DB나 Feature Flag로 이동 고려

---

### 7. Hardcoded Pricing

**파일**: `apps/web/lib/stripe.ts:13-36`

```typescript
export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    limits: {
      apiRequestsPerDay: 100,
      postsPerDay: 5,
      communities: 1,
    },
  },
  pro: {
    name: 'Pro',
    price: 2900, // $29.00 in cents
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    // ...
  },
  // ...
}
```

**문제점**:
- 가격 정보가 코드에 하드코딩
- 가격 변경 시 코드 수정 및 재배포 필요

**해결방안**:
- Stripe Product/Price API에서 동적으로 가져오기
- 또는 CMS/Admin 패널에서 관리

---

### 8. Stripe Webhook Secret 누락 처리 부재

**파일**: `apps/web/app/api/v1/stripe/webhook/route.ts:26`

```typescript
process.env.STRIPE_WEBHOOK_SECRET!
```

**문제점**:
- `!` 단언으로 강제 non-null 처리
- 환경변수 누락 시 런타임 에러

**해결방안**:
```typescript
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
if (!webhookSecret) {
  throw new Error('STRIPE_WEBHOOK_SECRET not configured');
}
```

---

### 9. Placeholder 텍스트 (양호)

**파일**:
- `apps/web/app/agents/page.tsx:74` - "Search agents by handle or description..."
- `apps/web/app/explore/page.tsx:54` - "Search posts, agents, communities..."
- `apps/web/components/common/SearchBar.tsx:13` - "Search..."

**상태**: ✅ OK (UI placeholder는 문제 없음)

---

## 🟢 Info (참고 사항)

### 10. TODO/FIXME 주석

**검색 결과**: `grep -rn "TODO\|FIXME\|XXX\|HACK"` → **0건**

✅ 미완성 마커 없음 (좋음)

---

### 11. 환경변수 사용 현황

#### `.env.example`에 정의된 변수들:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
JWT_SECRET
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_APP_NAME
STRIPE_SECRET_KEY (optional)
STRIPE_WEBHOOK_SECRET (optional)
STRIPE_PRO_PRICE_ID (optional)
STRIPE_ENTERPRISE_PRICE_ID (optional)
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION (optional)
```

#### 코드에서 실제 사용되는 환경변수 (21곳):
1. `JWT_SECRET` - packages/auth/src/jwt.ts:3 ⚠️
2. `NEXT_PUBLIC_SUPABASE_URL` - 6곳 ✅
3. `NEXT_PUBLIC_SUPABASE_ANON_KEY` - 2곳 ✅
4. `SUPABASE_SERVICE_ROLE_KEY` - 4곳 ✅
5. `NEXT_PUBLIC_APP_URL` - 3곳 ✅
6. `STRIPE_SECRET_KEY` - 2곳 ✅
7. `STRIPE_WEBHOOK_SECRET` - 1곳 ⚠️
8. `STRIPE_PRO_PRICE_ID` - 2곳 ✅
9. `STRIPE_ENTERPRISE_PRICE_ID` - 2곳 ✅
10. `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` - 1곳 ✅
11. `NEXT_PUBLIC_GA_MEASUREMENT_ID` - 1곳 (⚠️ .env.example에 없음!)
12. `NEXT_PUBLIC_SITE_URL` - 1곳 (⚠️ .env.example에 없음!)

#### 🔴 .env.example에 누락된 변수:
```bash
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# CORS/Proxy (기본값: NEXT_PUBLIC_APP_URL 사용)
NEXT_PUBLIC_SITE_URL=https://agentgram.co
```

→ `.env.example` 업데이트 필요!

---

### 12. Deprecated/Unsafe API 사용

**파일**: `apps/web/next.config.ts:6`

```typescript
typescript: {
  ignoreBuildErrors: true,
}
```

**문제점**:
- 타입 에러 무시로 빌드 시 버그 놓칠 수 있음

**해결방안**:
- 모든 타입 에러 수정 후 `ignoreBuildErrors: false`로 변경

---

### 13. Social Links 및 외부 URL 검증

#### GitHub
- ✅ `https://github.com/agentgram/agentgram` (여러 곳)

#### Twitter
- ⚠️ `@rosie8_ai` (apps/web/app/layout.tsx:53,163)
- 실제 프로젝트 계정인지 확인 필요

#### Discord
- ⚠️ `https://discord.gg/agentgram` (apps/web/app/layout.tsx:162)
- 초대 링크가 유효한지, 만료되지 않는 영구 링크인지 확인 필요

#### Email
- ⚠️ `sales@agentgram.co` (apps/web/app/pricing/page.tsx:88)
- 이메일 계정이 실제 설정되어 있는지 확인 필요

---

### 14. Database Schema & Migration Files

**발견 파일**:
```
supabase/migrations/20260201000000_initial_schema.sql
supabase/migrations/20260201010000_add_stripe_columns.sql
supabase/migrations/20260201020000_add_voting_functions.sql
supabase/seed.sql
packages/db/src/schema.sql
```

**상태**: ✅ Migration 파일은 정상 (하드코딩 없음)

---

### 15. Supabase Client Singleton Pattern

**파일**: `packages/db/src/client.ts`

```typescript
let supabaseClient: ReturnType<typeof createClient> | null = null;
```

**상태**: ✅ 올바른 싱글톤 패턴 사용

---

## 📋 완전성 체크

### 환경변수 검증

| 변수명 | .env.example | 코드 사용 | 상태 |
|--------|-------------|----------|------|
| NEXT_PUBLIC_SUPABASE_URL | ✅ | ✅ | ✅ |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | ✅ | ✅ | ✅ |
| SUPABASE_SERVICE_ROLE_KEY | ✅ | ✅ | ✅ |
| JWT_SECRET | ✅ | ⚠️ (fallback) | ⚠️ |
| NEXT_PUBLIC_APP_URL | ✅ | ✅ | ✅ |
| NEXT_PUBLIC_APP_NAME | ✅ | ❌ (사용 안 함) | 🟡 |
| STRIPE_SECRET_KEY | ✅ | ✅ | ✅ |
| STRIPE_WEBHOOK_SECRET | ✅ | ⚠️ (! 단언) | ⚠️ |
| STRIPE_PRO_PRICE_ID | ✅ | ✅ | ✅ |
| STRIPE_ENTERPRISE_PRICE_ID | ✅ | ✅ | ✅ |
| NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION | ✅ | ✅ | ✅ |
| NEXT_PUBLIC_GA_MEASUREMENT_ID | ❌ | ✅ | 🔴 |
| NEXT_PUBLIC_SITE_URL | ❌ | ✅ | 🔴 |

---

## 🎯 권장 조치 사항 (우선순위순)

### P0 (즉시)
1. ✅ `JWT_SECRET` fallback 제거 → throw error
2. ✅ `demo-agent-id` 제거 → 실제 인증 플로우 구현
3. ✅ `.env.example`에 누락 변수 추가:
   - `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - `NEXT_PUBLIC_SITE_URL`
   - Social link 환경변수들

### P1 (1주일 내)
4. ✅ 모든 하드코딩 URL을 환경변수로 이동
5. ✅ Stripe webhook secret null check 추가
6. ✅ `ignoreBuildErrors: false`로 변경 (타입 에러 수정 후)
7. ✅ console.log 제거 또는 structured logger로 교체

### P2 (2주일 내)
8. ✅ Sentry/LogRocket 같은 에러 트래킹 도입
9. ✅ 가격 정보 동적 로딩 (Stripe API 또는 CMS)
10. ✅ 개발용 시드 데이터 추가

### P3 (향후)
11. ✅ Rate limit을 DB나 Feature Flag로 이동 (동적 조정 필요 시)
12. ✅ Storybook 도입 + mock data 정의

---

## 📊 통계 요약

| 카테고리 | 발견 건수 | 심각도 |
|---------|----------|--------|
| 🔴 Critical Hardcoded Values | 3 | High |
| 🟡 Warning: console.log/error | 53 | Medium |
| 🟡 Warning: Hardcoded URLs | 15+ | Medium |
| 🟢 Missing env vars in .env.example | 2 | Low |
| ✅ TODO/FIXME comments | 0 | - |
| ✅ Lorem ipsum / Mock data | 0 | - |

---

## ✅ 양호한 점

1. **TODO/FIXME 없음** - 코드가 비교적 완성도 높음
2. **Mock 데이터 없음** - 프로덕션 준비 상태
3. **환경변수 활용** - 대부분의 민감 정보는 환경변수 사용
4. **타입 안전성** - TypeScript 사용 (단, ignoreBuildErrors 주의)
5. **Migration 관리** - Supabase migration 체계적
6. **패키지 구조** - Monorepo로 코드 재사용 좋음

---

## 🚨 즉시 수정 필요 코드 예시

### Before (현재)
```typescript
// ❌ packages/auth/src/jwt.ts
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// ❌ apps/web/app/pricing/page.tsx
const agentId = 'demo-agent-id';

// ❌ apps/web/app/sitemap.ts
const baseUrl = 'https://agentgram.co';
```

### After (권장)
```typescript
// ✅ packages/auth/src/jwt.ts
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// ✅ apps/web/app/pricing/page.tsx
import { useSession } from '@/hooks/useSession';
const { agentId } = useSession();
if (!agentId) {
  router.push('/agents/register');
  return;
}

// ✅ apps/web/app/sitemap.ts
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
```

---

## 📝 최종 의견

AgentGram 프로젝트는 **전반적으로 양호한 상태**입니다. 

**강점**:
- 깨끗한 코드베이스 (TODO/미완성 부분 없음)
- 환경변수 활용도 높음
- 타입 안전성 (TypeScript)

**개선 필요**:
- JWT Secret fallback 제거 (보안 Critical)
- demo-agent-id 제거 (기능 Critical)
- 하드코딩 URL → 환경변수 이동
- console.log → structured logger
- .env.example 업데이트

**예상 작업 시간**:
- P0 수정: 2-3시간
- P1 수정: 1-2일
- P2 개선: 3-5일

---

**보고서 생성일**: 2025-02-01  
**다음 감사 권장일**: 2025-03-01 (월 1회)
