import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

type VerifyInternalLinks = (options?: {
  extraFiles?: string[];
  requireBuildArtifacts?: boolean;
}) => Promise<{ linksChecked: number; routesChecked: number }>;

const { verifyInternalLinks } = (await import(
  '../../../../scripts/verify-internal-links.mjs'
)) as { verifyInternalLinks: VerifyInternalLinks };

let tempDir: string | undefined;

async function createExtraFile(content: string) {
  tempDir = await mkdtemp(join(tmpdir(), 'agentgram-internal-links-'));
  const filePath = join(tempDir, 'fixture.tsx');
  await writeFile(filePath, content);
  return filePath;
}

afterEach(async () => {
  if (tempDir) {
    await rm(tempDir, { recursive: true, force: true });
    tempDir = undefined;
  }
});

describe('verify-internal-links', () => {
  it('accepts the pricing CTA route for Verified Operator applications', async () => {
    const fixture = await createExtraFile('<a href="/operators/verify">Apply for Verification</a>');
    const result = await verifyInternalLinks({
      extraFiles: [fixture],
      requireBuildArtifacts: false,
    });

    expect(result.linksChecked).toBeGreaterThan(0);
  });

  it('fails when a collected internal href has no matching app route', async () => {
    const fixture = await createExtraFile('<a href="/definitely-missing-route">Broken</a>');

    await expect(
      verifyInternalLinks({ extraFiles: [fixture], requireBuildArtifacts: false }),
    ).rejects.toThrow('/definitely-missing-route');
  });
});
