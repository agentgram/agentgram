import test from 'node:test';
import assert from 'node:assert/strict';

import { validatePrArtifactPack } from '../validate-pr-body.mjs';

const nonAuthBody = `## Source
Source: backlog.md:97

## Change
Require every PR to describe the operator-facing change being shipped.

## Evidence
- Docs/example diff: docs/pr-evidence/row-97-verification-artifact-pack.md
- Validation: \`node --test scripts/__tests__/validate-pr-body.test.mjs\`

## Auth-only Proof
N/A
`;

test('passes a non-auth PR with docs diff evidence and explicit N/A auth proof', () => {
  const result = validatePrArtifactPack({
    title: 'refactor: require verification artifact pack in PRs',
    body: nonAuthBody,
    labels: ['type: refactor'],
  });

  assert.equal(result.ok, true);
  assert.equal(result.authGated, false);
});

test('fails when source does not cite a backlog row or issue', () => {
  const result = validatePrArtifactPack({
    title: 'refactor: require verification artifact pack in PRs',
    body: nonAuthBody.replace(
      'Source: backlog.md:97',
      'Source: follow-up cleanup'
    ),
  });

  assert.equal(result.ok, false);
  assert.match(
    result.errors.join('\n'),
    /## Source must cite a backlog row or issue/
  );
});

test('fails when the required change summary is missing', () => {
  const result = validatePrArtifactPack({
    title: 'refactor: require verification artifact pack in PRs',
    body: nonAuthBody.replace(
      '\n## Change\nRequire every PR to describe the operator-facing change being shipped.\n',
      '\n'
    ),
  });

  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /## Change must summarize/);
});

test('fails when the change summary is placeholder-only', () => {
  const result = validatePrArtifactPack({
    title: 'refactor: require verification artifact pack in PRs',
    body: nonAuthBody.replace(
      'Require every PR to describe the operator-facing change being shipped.',
      'TBD'
    ),
  });

  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /## Change must summarize/);
});

test('fails when evidence is placeholder-only', () => {
  const result = validatePrArtifactPack({
    title: 'refactor: require verification artifact pack in PRs',
    body: nonAuthBody.replace(
      '- Docs/example diff: docs/pr-evidence/row-97-verification-artifact-pack.md\n- Validation: `node --test scripts/__tests__/validate-pr-body.test.mjs`',
      '-'
    ),
  });

  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /## Evidence must be filled/);
});

test('fails auth-gated PRs that mark auth proof as N/A', () => {
  const result = validatePrArtifactPack({
    title: 'feat: auth-gated rollout',
    body: nonAuthBody,
    labels: ['area: auth'],
  });

  assert.equal(result.ok, false);
  assert.equal(result.authGated, true);
  assert.match(result.errors.join('\n'), /cannot be `N\/A`/);
});

test('passes auth-gated PRs with an authenticated curl snippet', () => {
  const result = validatePrArtifactPack({
    title: 'feat: tighten auth proof checks',
    labels: ['area: auth'],
    body: `## Source
Source: #97

## Change
Require auth-gated PRs to include authenticated proof snippets.

## Evidence
- Screenshot/live-proof: docs/pr-evidence/pr-446-live-explore.png
- Validation: \`pnpm --filter web exec vitest run\`

## Auth-only Proof
\`\`\`bash
curl -H "Authorization: Bearer ***" https://agentgram.local/api/private/me
\`\`\`
`,
  });

  assert.equal(result.ok, true);
  assert.equal(result.authGated, true);
});

test('passes a PR whose source cites dev-lane kanban markers', () => {
  const result = validatePrArtifactPack({
    title: 'docs: dev-lane handoff note',
    body: nonAuthBody.replace(
      'Source: backlog.md:97',
      'Source: Hermes kanban-dispatch dev lane — agdev:1ea38b5ef1 item t_bba1111a'
    ),
    labels: ['type: docs'],
  });

  assert.equal(result.ok, true);
  assert.equal(result.authGated, false);
});

test('skips artifact pack validation for dependabot PRs', () => {
  const result = validatePrArtifactPack({
    title: 'chore(deps): bump eslint',
    body: '',
    author: 'dependabot[bot]',
    labels: [],
  });

  assert.equal(result.ok, true);
  assert.equal(result.skipped, true);
  assert.equal(result.skipReason, 'dependabot author');
});

test('skips artifact pack validation for dependencies and documentation labels', () => {
  const dependenciesResult = validatePrArtifactPack({
    title: 'chore(deps): bump turbo',
    body: '',
    author: 'human-maintainer',
    labels: ['dependencies'],
  });
  const documentationResult = validatePrArtifactPack({
    title: 'docs: update deployment guide',
    body: '',
    author: 'human-maintainer',
    labels: ['documentation'],
  });

  assert.equal(dependenciesResult.ok, true);
  assert.equal(dependenciesResult.skipped, true);
  assert.equal(dependenciesResult.skipReason, 'dependencies label');
  assert.equal(documentationResult.ok, true);
  assert.equal(documentationResult.skipped, true);
  assert.equal(documentationResult.skipReason, 'documentation label');
});

test('skips artifact pack validation for docs and package metadata only changes', () => {
  const result = validatePrArtifactPack({
    title: 'docs: refresh setup notes',
    body: '',
    author: 'human-maintainer',
    changedFiles: [
      'docs/development/setup.md',
      'apps/web/package.json',
      'pnpm-lock.yaml',
    ],
  });

  assert.equal(result.ok, true);
  assert.equal(result.skipped, true);
  assert.equal(result.skipReason, 'docs/package metadata only changes');
});

test('skips artifact pack validation for root README-only changes', () => {
  const result = validatePrArtifactPack({
    title: 'docs: refresh root readme',
    body: '',
    author: 'human-maintainer',
    changedFiles: ['README.md'],
  });

  assert.equal(result.ok, true);
  assert.equal(result.skipped, true);
  assert.equal(result.skipReason, 'docs/package metadata only changes');
});

test('skips artifact pack validation for markdown-only changes outside docs', () => {
  const result = validatePrArtifactPack({
    title: 'docs: refresh app readme',
    body: '',
    author: 'human-maintainer',
    changedFiles: ['README.md', 'apps/web/README.md'],
  });

  assert.equal(result.ok, true);
  assert.equal(result.skipped, true);
  assert.equal(result.skipReason, 'docs/package metadata only changes');
});

test('keeps artifact pack validation for non-exempt dev-lane bot PRs', () => {
  const result = validatePrArtifactPack({
    title: 'feat: dev-lane implementation',
    body: '',
    author: 'agentgram-dev-lane[bot]',
    labels: ['type: feature'],
    changedFiles: ['apps/web/app/page.tsx'],
  });

  assert.equal(result.ok, false);
  assert.equal(result.skipped, false);
  assert.match(result.errors.join('\n'), /PR body is empty/);
});

test('does not skip mixed product code changes without an exempt label or author', () => {
  const result = validatePrArtifactPack({
    title: 'docs: update setup and homepage copy',
    body: '',
    author: 'human-maintainer',
    changedFiles: ['docs/development/setup.md', 'apps/web/app/page.tsx'],
  });

  assert.equal(result.ok, false);
  assert.equal(result.skipped, false);
  assert.match(result.errors.join('\n'), /PR body is empty/);
});
