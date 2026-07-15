import { access, readFile, readdir } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, '..');
const appDir = resolve(repoRoot, 'apps/web/app');
const nextDir = resolve(repoRoot, 'apps/web/.next');
const serverAppDir = resolve(nextDir, 'server/app');
const hrefPattern = /\bhref\s*=\s*(?:{\s*)?["'`]([^"'`#?]+)["'`](?:\s*})?/g;
const routeGroupPattern = /\([^/]+\)\//g;
const dynamicSegmentPattern = /\[[^/]+\]/g;
const ignoredPrefixes = [
  '/api/',
  '/_next/',
  '/favicon',
  '/manifest.json',
  '/apple-touch-icon.png',
  '/icon.png',
  '/images/',
  '/logos/',
  '/og-',
  '/robots.txt',
  '/sitemap.xml',
  '/skill.md',
  '/openapi.json',
];

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function walkFiles(root, extensions) {
  if (!(await pathExists(root))) {
    return [];
  }

  const entries = await readdir(root, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = join(root, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walkFiles(entryPath, extensions)));
      continue;
    }

    if (entry.isFile() && extensions.has(extname(entry.name))) {
      files.push(entryPath);
    }
  }

  return files;
}

function normalizeRoute(route) {
  if (route === '') {
    return '/';
  }

  return `/${route}`
    .replaceAll(sep, '/')
    .replace(routeGroupPattern, '')
    .replace(dynamicSegmentPattern, ':dynamic')
    .replace(/\/page$/, '')
    .replace(/\/route$/, '')
    .replace(/\/index$/, '')
    .replace(/\/+/g, '/')
    .replace(/\/$/, '') || '/';
}

function isIgnoredHref(href) {
  if (!href.startsWith('/')) {
    return true;
  }

  if (href.startsWith('//')) {
    return true;
  }

  return ignoredPrefixes.some((prefix) => href.startsWith(prefix));
}

function routeMatches(href, route) {
  if (href === route) {
    return true;
  }

  if (!route.includes(':dynamic')) {
    return false;
  }

  const routeParts = route.split('/').filter(Boolean);
  const hrefParts = href.split('/').filter(Boolean);

  if (routeParts.length !== hrefParts.length) {
    return false;
  }

  return routeParts.every((part, index) => part === ':dynamic' || part === hrefParts[index]);
}

async function collectRoutes() {
  const files = await walkFiles(appDir, new Set(['.tsx', '.ts']));
  return new Set(
    files
      .filter((file) => ['page.tsx', 'page.ts', 'route.ts', 'route.tsx'].includes(file.split(sep).at(-1) ?? ''))
      .map((file) => normalizeRoute(relative(appDir, file).replace(/\.(tsx|ts)$/, ''))),
  );
}

async function collectBuildArtifactFiles() {
  if (!(await pathExists(nextDir))) {
    throw new Error('Missing apps/web/.next. Run `pnpm --filter web build` before verifying internal links.');
  }

  const files = await walkFiles(serverAppDir, new Set(['.html', '.rsc', '.js']));

  if (files.length === 0) {
    throw new Error('Missing apps/web/.next/server/app artifacts. Run a successful Next.js build first.');
  }

  return files;
}

async function collectSourceFiles() {
  return walkFiles(appDir, new Set(['.tsx', '.ts']));
}

async function collectInternalHrefs(files) {
  const hrefs = new Map();

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    const relativeFile = relative(repoRoot, file);

    for (const match of source.matchAll(hrefPattern)) {
      const href = match[1].trim().replace(/\/$/, '') || '/';

      if (isIgnoredHref(href)) {
        continue;
      }

      const locations = hrefs.get(href) ?? [];
      locations.push(relativeFile);
      hrefs.set(href, locations);
    }
  }

  return hrefs;
}

export async function verifyInternalLinks({ extraFiles = [], requireBuildArtifacts = true } = {}) {
  const routes = await collectRoutes();
  const buildFiles = requireBuildArtifacts ? await collectBuildArtifactFiles() : [];
  const sourceFiles = await collectSourceFiles();
  const hrefs = await collectInternalHrefs([...buildFiles, ...sourceFiles, ...extraFiles]);
  const broken = [];

  for (const [href, locations] of hrefs) {
    if (![...routes].some((route) => routeMatches(href, route))) {
      broken.push({ href, locations: [...new Set(locations)].sort() });
    }
  }

  if (broken.length > 0) {
    const details = broken
      .map(({ href, locations }) => `- ${href}\n  seen in: ${locations.join(', ')}`)
      .join('\n');
    throw new Error(`Internal link verification failed:\n${details}`);
  }

  return {
    routesChecked: routes.size,
    linksChecked: hrefs.size,
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  verifyInternalLinks()
    .then(({ routesChecked, linksChecked }) => {
      console.log(`Internal link verification passed: ${linksChecked} links checked against ${routesChecked} app routes.`);
    })
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
}
