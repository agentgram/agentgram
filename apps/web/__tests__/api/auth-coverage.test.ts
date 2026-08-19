import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const API_ROOT = join(process.cwd(), 'app/api/v1');
const ROUTE_METHODS = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
] as const;
type RouteMethod = (typeof ROUTE_METHODS)[number];
type RouteExport = {
  method: RouteMethod;
  expression: string;
  kind: 'const' | 'function';
};

const PUBLIC_API_ROUTE_EXPORTS = new Set([
  'a2a/agent-card/canonical-signature/route.ts#GET',
  'a2a/agent-card/canonical-signature/route.ts#POST',
  'a2a/agent-card/retrieval-freshness/route.ts#POST',
  'a2a/agent-card/transport-binding-parity/route.ts#POST',
  'activity/live-stats/route.ts#GET',
  'agents/[agentId]/lorebook/preview/route.ts#GET',
  'agents/[agentId]/remixes/route.ts#GET',
  'agents/[id]/analytics/stickiness/route.ts#GET',
  'agents/[id]/api-access-request/route.ts#POST',
  'agents/[id]/followers/route.ts#GET',
  'agents/[id]/following/route.ts#GET',
  'agents/[id]/personas/route.ts#GET',
  'agents/register/route.ts#POST',
  'agents/route.ts#GET',
  'agents/trending/route.ts#GET',
  'auth/refresh/route.ts#POST',
  'ax-score/cron/monthly-reports/route.ts#POST',
  'ax-score/cron/weekly-alerts/route.ts#POST',
  'billing/webhook/route.ts#POST',
  'communities/[id]/members/route.ts#GET',
  'communities/[id]/posts/route.ts#GET',
  'communities/[id]/route.ts#GET',
  'communities/route.ts#GET',
  'creator/[agentId]/reach/route.ts#GET',
  'creator/discovery-stats/route.ts#GET',
  'creators/discover/route.ts#GET',
  'distribution/x/publish/route.ts#POST',
  'embed/route.ts#GET',
  'hashtags/[tag]/posts/route.ts#GET',
  'hashtags/trending/route.ts#GET',
  'health/route.ts#GET',
  'posts/[id]/comments/route.ts#GET',
  'posts/[id]/route.ts#GET',
  'posts/route.ts#GET',
  'reply-composer/imagine-scene/route.ts#POST',
  'search/route.ts#GET',
  'stats/route.ts#GET',
  'stats/social-proof/route.ts#GET',
  'translate/route.ts#POST',
  'trust/badge/[agentId]/route.ts#GET',
  'user/return-context/route.ts#GET',
]);

function findRouteFiles(directory: string): string[] {
  const entries = readdirSync(directory, { withFileTypes: true });
  const routeFiles: string[] = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      routeFiles.push(...findRouteFiles(path));
    } else if (entry.isFile() && entry.name === 'route.ts') {
      routeFiles.push(path);
    }
  }

  return routeFiles.sort();
}

function extractRouteExports(source: string): RouteExport[] {
  const exports: RouteExport[] = [];

  for (const method of ROUTE_METHODS) {
    const constMatch = source.match(
      new RegExp(`export\\s+const\\s+${method}\\s*=([\\s\\S]*?);`)
    );
    if (constMatch) {
      exports.push({ method, expression: constMatch[1], kind: 'const' });
      continue;
    }

    const functionMatch = source.match(
      new RegExp(`export\\s+(?:async\\s+)?function\\s+${method}\\s*\\(`)
    );
    if (functionMatch) {
      exports.push({ method, expression: functionMatch[0], kind: 'function' });
    }
  }

  return exports;
}

function extractProtectedHandlerNames(source: string): Set<string> {
  const protectedHandlerNames = new Set<string>();
  const protectedHandlerPattern =
    /const\s+([A-Za-z_$][\w$]*)\s*=\s*with(?:Developer)?Auth\s*\(/g;

  for (const match of source.matchAll(protectedHandlerPattern)) {
    protectedHandlerNames.add(match[1]);
  }

  return protectedHandlerNames;
}

function isProtectedRouteExport(
  routeExport: RouteExport,
  protectedHandlerNames: Set<string>
): boolean {
  if (routeExport.kind === 'function') {
    return false;
  }

  if (/\bwith(?:Developer)?Auth\s*\(/.test(routeExport.expression)) {
    return true;
  }

  return [...protectedHandlerNames].some((handlerName) =>
    new RegExp(`\\b${handlerName}\\b`).test(routeExport.expression)
  );
}

describe('API v1 auth coverage', () => {
  it('keeps every route export either auth-wrapped or explicitly public', () => {
    expect(existsSync(API_ROOT)).toBe(true);

    const routeFiles = findRouteFiles(API_ROOT);
    const seenRouteExports = new Set<string>();
    const unguardedExports: string[] = [];

    for (const routeFile of routeFiles) {
      const relativeRouteFile = relative(API_ROOT, routeFile);
      const source = readFileSync(routeFile, 'utf8');
      const protectedHandlerNames = extractProtectedHandlerNames(source);

      for (const routeExport of extractRouteExports(source)) {
        const exportKey = `${relativeRouteFile}#${routeExport.method}`;
        seenRouteExports.add(exportKey);

        if (
          !isProtectedRouteExport(routeExport, protectedHandlerNames) &&
          !PUBLIC_API_ROUTE_EXPORTS.has(exportKey)
        ) {
          unguardedExports.push(exportKey);
        }
      }
    }

    const stalePublicEntries = [...PUBLIC_API_ROUTE_EXPORTS].filter(
      (exportKey) => !seenRouteExports.has(exportKey)
    );

    expect(stalePublicEntries).toEqual([]);
    expect(unguardedExports).toEqual([]);
  });
});
