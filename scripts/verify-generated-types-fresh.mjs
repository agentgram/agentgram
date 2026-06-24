#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCHEMA_INPUT_PATTERNS = [
  /^supabase\/migrations\/[^/]+\.sql$/,
  /^supabase\/schemas\/[^/]+\.sql$/,
];
const GENERATED_TYPE_PATHS = new Set(['packages/db/src/types.ts']);

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

function normalizePath(filePath) {
  return String(filePath || '')
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .trim();
}

function splitChangedFiles(text) {
  return String(text || '')
    .replace(/\r/g, '')
    .split('\n')
    .map(normalizePath)
    .filter(Boolean);
}

function isSchemaInput(filePath) {
  const normalized = normalizePath(filePath);
  return SCHEMA_INPUT_PATTERNS.some((pattern) => pattern.test(normalized));
}

function isGeneratedType(filePath) {
  return GENERATED_TYPE_PATHS.has(normalizePath(filePath));
}

export function verifyGeneratedTypesFresh(changedFiles) {
  const files = [...new Set(changedFiles.map(normalizePath).filter(Boolean))];
  const schemaInputs = files.filter(isSchemaInput);
  const generatedTypes = files.filter(isGeneratedType);
  const ok = schemaInputs.length === 0 || generatedTypes.length > 0;

  return {
    ok,
    schemaInputs,
    generatedTypes,
    message: ok
      ? 'Generated database types are fresh for this diff.'
      : [
          'Database schema files changed without updating generated TypeScript types.',
          'Run `pnpm db:types` after applying migrations, commit `packages/db/src/types.ts`, and rerun this check.',
        ].join('\n'),
  };
}

function getChangedFilesFromGit({ base, head }) {
  if (!base) {
    throw new Error(
      'Missing --base. Pass the PR base SHA/ref when reading changed files from git.'
    );
  }

  const range = head ? `${base}...${head}` : `${base}...HEAD`;
  const output = execFileSync('git', ['diff', '--name-only', range], {
    encoding: 'utf8',
  });
  return splitChangedFiles(output);
}

function loadChangedFiles(args) {
  if (args['changed-files']) {
    return splitChangedFiles(args['changed-files']);
  }

  if (args['changed-files-file']) {
    return splitChangedFiles(
      readFileSync(resolve(args['changed-files-file']), 'utf8')
    );
  }

  return getChangedFilesFromGit({
    base: args.base ?? process.env.PR_BASE_SHA,
    head: args.head ?? process.env.PR_HEAD_SHA,
  });
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const changedFiles = loadChangedFiles(args);
  const result = verifyGeneratedTypesFresh(changedFiles);

  if (result.schemaInputs.length > 0) {
    console.log('Schema inputs changed:');
    for (const filePath of result.schemaInputs) {
      console.log(`- ${filePath}`);
    }
  }

  if (result.generatedTypes.length > 0) {
    console.log('Generated type files changed:');
    for (const filePath of result.generatedTypes) {
      console.log(`- ${filePath}`);
    }
  }

  if (!result.ok) {
    console.error(`::error::${result.message}`);
    process.exit(1);
  }

  console.log(result.message);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
