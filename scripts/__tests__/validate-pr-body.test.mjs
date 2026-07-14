import test from 'node:test';
import assert from 'node:assert/strict';

import { validatePrArtifactPack } from '../validate-pr-body.mjs';

const nonAuthBody = `## Source
Source: backlog.md:97

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

## Evidence
- Screenshot/live-proof: docs/pr-evidence/pr-446-live-explore.png
- Validation: \`pnpm --filter web exec vitest run\`

## Auth-only Proof
\`\`\`bash
curl -H "Authorization: Bearer $SESSION_TOKEN" https://agentgram.local/api/private/me
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
