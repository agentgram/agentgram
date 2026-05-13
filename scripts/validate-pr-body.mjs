#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REQUIRED_SECTION_TITLES = ['Source', 'Evidence', 'Auth-only Proof'];
const PLACEHOLDER_LINE_PATTERNS = [
  /^[-*]\s*$/,
  /^tbd$/i,
  /^todo$/i,
  /^same as above$/i,
  /^fill (this )?in$/i,
  /^placeholder$/i,
  /^coming soon$/i,
];
const SOURCE_REFERENCE_PATTERN =
  /(Source:\s*)?(backlog\.md:\d+|#\d+|https?:\/\/\S+)/i;
const SOURCE_TEMPLATE_PLACEHOLDER_PATTERN = /backlog\.md:row|#issue/i;
const EVIDENCE_SIGNAL_PATTERN =
  /(docs\/|\.png\b|\.jpe?g\b|\.gif\b|\.webp\b|\.html\b|\.md\b|screenshot|live[- ]proof|docs\/example diff|diff|validation|test)/i;
const EMPTY_EVIDENCE_SCAFFOLD_PATTERN =
  /^[-*]\s*(docs\/example diff|screenshot\/live-proof|validation):\s*$/i;
const AUTH_SNIPPET_SIGNAL_PATTERN =
  /```[\s\S]+```|`[^`]+`|\bcurl\b|\bpnpm\b|\bvitest\b|\bplaywright\b|\bauthorization\b|\bbearer\b|\bcookie\b|\bsession\b|\btoken\b/i;
const EXPLICIT_NA_PATTERN =
  /^(?:[-*]\s*)?(?:`)?(?:n\/a|na|not applicable)(?:`)?$/i;

function stripComments(text) {
  return text.replace(/<!--[\s\S]*?-->/g, '').trim();
}

function normalizeSectionContent(text) {
  return stripComments(text)
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n')
    .trim();
}

function isPlaceholderOnly(text) {
  const normalized = normalizeSectionContent(text);
  if (!normalized) {
    return true;
  }

  const lines = normalized
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.every((line) =>
    PLACEHOLDER_LINE_PATTERNS.some((pattern) => pattern.test(line))
  );
}

function isExplicitNa(text) {
  const normalized = normalizeSectionContent(text);
  if (!normalized) {
    return false;
  }

  const lines = normalized
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  return (
    lines.length > 0 && lines.every((line) => EXPLICIT_NA_PATTERN.test(line))
  );
}

function normalizeEvidenceContent(text) {
  return stripComments(text)
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !EMPTY_EVIDENCE_SCAFFOLD_PATTERN.test(line))
    .join('\n')
    .trim();
}

function parseSections(body) {
  const buckets = Object.fromEntries(
    REQUIRED_SECTION_TITLES.map((title) => [title, []])
  );
  let currentTitle = null;

  for (const line of body.replace(/\r/g, '').split('\n')) {
    const headingMatch = line.match(/^##\s+(.*?)\s*$/);
    if (headingMatch) {
      const candidate = headingMatch[1].trim();
      currentTitle = REQUIRED_SECTION_TITLES.includes(candidate)
        ? candidate
        : null;
      continue;
    }

    if (currentTitle) {
      buckets[currentTitle].push(line);
    }
  }

  return Object.fromEntries(
    REQUIRED_SECTION_TITLES.map((title) => [
      title,
      buckets[title].join('\n').trim(),
    ])
  );
}

function hasCheckedAuthArea(body) {
  return /^- \[[xX]\].*`area: auth`/m.test(stripComments(body));
}

function isAuthGated({
  title = '',
  body = '',
  labels = [],
  requireAuthProof,
} = {}) {
  if (typeof requireAuthProof === 'boolean') {
    return requireAuthProof;
  }

  const normalizedLabels = labels.map((label) =>
    String(label).trim().toLowerCase()
  );
  const bodyWithoutComments = stripComments(body);
  return (
    normalizedLabels.includes('area: auth') ||
    hasCheckedAuthArea(bodyWithoutComments) ||
    /\bauth[- ]gated\b/i.test(`${title}\n${bodyWithoutComments}`)
  );
}

export function validatePrArtifactPack({
  title = '',
  body = '',
  labels = [],
  requireAuthProof,
} = {}) {
  const errors = [];
  const normalizedBody = String(body || '')
    .replace(/\r/g, '')
    .trim();

  if (!normalizedBody) {
    return {
      ok: false,
      authGated: isAuthGated({ title, body, labels, requireAuthProof }),
      errors: [
        'PR body is empty. Fill out the required verification artifact pack sections.',
      ],
      sections: parseSections(''),
    };
  }

  const sections = parseSections(normalizedBody);
  const authGated = isAuthGated({
    title,
    body: normalizedBody,
    labels,
    requireAuthProof,
  });

  const source = sections.Source;
  const normalizedSource = normalizeSectionContent(source);
  if (
    !source ||
    isPlaceholderOnly(source) ||
    !SOURCE_REFERENCE_PATTERN.test(source) ||
    SOURCE_TEMPLATE_PLACEHOLDER_PATTERN.test(normalizedSource)
  ) {
    errors.push(
      '## Source must cite a backlog row or issue (for example `Source: backlog.md:97` or `Source: #123`).'
    );
  }

  const evidence = sections.Evidence;
  const normalizedEvidence = normalizeEvidenceContent(evidence);
  if (
    !normalizedEvidence ||
    isPlaceholderOnly(normalizedEvidence) ||
    isExplicitNa(normalizedEvidence)
  ) {
    errors.push(
      '## Evidence must be filled with screenshot/live-proof or docs/example diff details.'
    );
  } else if (!EVIDENCE_SIGNAL_PATTERN.test(normalizedEvidence)) {
    errors.push(
      '## Evidence must reference a concrete artifact such as a docs/example diff, screenshot, live-proof, or validation command.'
    );
  }

  const authProof = sections['Auth-only Proof'];
  if (!authProof || isPlaceholderOnly(authProof)) {
    errors.push(
      '## Auth-only Proof is required. Use an authenticated curl/test snippet for auth-gated lanes, otherwise write explicit `N/A`.'
    );
  } else if (authGated) {
    if (isExplicitNa(authProof)) {
      errors.push(
        '## Auth-only Proof cannot be `N/A` when the PR is auth-gated (`area: auth` label/checkbox or auth-gated title/body).'
      );
    } else if (!AUTH_SNIPPET_SIGNAL_PATTERN.test(authProof)) {
      errors.push(
        '## Auth-only Proof must include an authenticated curl/test snippet when the PR is auth-gated.'
      );
    }
  } else if (
    !(isExplicitNa(authProof) || AUTH_SNIPPET_SIGNAL_PATTERN.test(authProof))
  ) {
    errors.push(
      '## Auth-only Proof must be explicit `N/A` for non-auth lanes or include an authenticated curl/test snippet.'
    );
  }

  return { ok: errors.length === 0, authGated, errors, sections };
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];
    if (next && !next.startsWith('--')) {
      args[key] = next;
      index += 1;
    } else {
      args[key] = 'true';
    }
  }
  return args;
}

function loadEventPayload() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    return null;
  }

  try {
    return JSON.parse(readFileSync(eventPath, 'utf8'));
  } catch {
    return null;
  }
}

function coerceBoolean(value) {
  if (value === undefined) {
    return undefined;
  }
  return value === 'true';
}

function loadInput(argv) {
  const args = parseArgs(argv);
  const event = loadEventPayload();
  const eventPr = event?.pull_request;
  const bodyFromFile = args['body-file']
    ? readFileSync(resolve(args['body-file']), 'utf8')
    : undefined;
  const labelsFromJson = args['labels-json'] ?? process.env.PR_LABELS_JSON;

  return {
    title: args.title ?? process.env.PR_TITLE ?? eventPr?.title ?? '',
    body:
      bodyFromFile ?? args.body ?? process.env.PR_BODY ?? eventPr?.body ?? '',
    labels: labelsFromJson
      ? JSON.parse(labelsFromJson)
      : (eventPr?.labels ?? []).map((label) => label.name),
    requireAuthProof: coerceBoolean(
      args['auth-gated'] ?? process.env.PR_AUTH_GATED
    ),
  };
}

function main() {
  const result = validatePrArtifactPack(loadInput(process.argv.slice(2)));

  if (!result.ok) {
    console.error('PR artifact pack validation failed:');
    for (const error of result.errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(
    `PR artifact pack validation passed (${result.authGated ? 'auth-gated' : 'non-auth'} lane).`
  );
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
) {
  main();
}
