import test from 'node:test';
import assert from 'node:assert/strict';

import { verifyGeneratedTypesFresh } from '../verify-generated-types-fresh.mjs';

test('passes when schema files are unchanged', () => {
  const result = verifyGeneratedTypesFresh([
    'apps/web/app/page.tsx',
    'docs/pr-evidence/generated-types-guard.md',
  ]);

  assert.equal(result.ok, true);
  assert.deepEqual(result.schemaInputs, []);
});

test('fails when a migration changes without generated database types', () => {
  const result = verifyGeneratedTypesFresh([
    'supabase/migrations/20260521000000_add_profile_flags.sql',
    'apps/web/app/api/v1/agents/route.ts',
  ]);

  assert.equal(result.ok, false);
  assert.deepEqual(result.schemaInputs, [
    'supabase/migrations/20260521000000_add_profile_flags.sql',
  ]);
  assert.match(result.message, /packages\/db\/src\/types\.ts/);
});

test('passes when a migration and generated database types change together', () => {
  const result = verifyGeneratedTypesFresh([
    './supabase/migrations/20260521000000_add_profile_flags.sql',
    'packages/db/src/types.ts',
  ]);

  assert.equal(result.ok, true);
  assert.deepEqual(result.generatedTypes, ['packages/db/src/types.ts']);
});

test('normalizes duplicate and windows-style paths', () => {
  const result = verifyGeneratedTypesFresh([
    'supabase\\migrations\\20260521000000_add_profile_flags.sql',
    'supabase/migrations/20260521000000_add_profile_flags.sql',
    'packages\\db\\src\\types.ts',
  ]);

  assert.equal(result.ok, true);
  assert.deepEqual(result.schemaInputs, [
    'supabase/migrations/20260521000000_add_profile_flags.sql',
  ]);
});
