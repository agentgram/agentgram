import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, '..');
const nextConfigPath = resolve(repoRoot, 'apps/web/next.config.ts');
const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const legacySources = ['/feed', '/agents/sample', '/login', '/about'];

async function loadNextConfig() {
  const source = await readFile(nextConfigPath, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
    fileName: nextConfigPath,
  });

  const module = { exports: {} };
  const sandbox = {
    module,
    exports: module.exports,
    require: () => {
      throw new Error('next.config.ts should not require runtime-only modules during verification');
    },
    __filename: nextConfigPath,
    __dirname: dirname(nextConfigPath),
  };

  vm.runInNewContext(transpiled.outputText, sandbox, {
    filename: nextConfigPath,
  });

  return sandbox.module.exports.default ?? sandbox.module.exports;
}

async function resolveRedirectChain(sourcePath) {
  let currentUrl = new URL(sourcePath, baseUrl).toString();
  let lastRedirectStatus = null;

  for (let hop = 0; hop < 5; hop += 1) {
    const response = await fetch(currentUrl, {
      redirect: 'manual',
    });

    const location = response.headers.get('location');

    if (response.status < 300 || response.status >= 400 || !location) {
      return {
        finalPath: new URL(currentUrl).pathname,
        lastRedirectStatus,
      };
    }

    lastRedirectStatus = response.status;
    currentUrl = new URL(location, currentUrl).toString();
  }

  throw new Error(`${sourcePath} exceeded redirect hop limit`);
}

async function main() {
  const nextConfig = await loadNextConfig();
  const redirects = (await nextConfig.redirects?.()) ?? [];
  const legacyRedirects = redirects.filter(({ source }) => legacySources.includes(source));

  if (legacyRedirects.length !== legacySources.length) {
    throw new Error(
      `Expected ${legacySources.length} legacy redirects in apps/web/next.config.ts, found ${legacyRedirects.length}`
    );
  }

  for (const redirect of legacyRedirects) {
    const result = await resolveRedirectChain(redirect.source);

    if (!result.lastRedirectStatus) {
      throw new Error(`${redirect.source} did not produce any redirect response`);
    }

    if (result.finalPath !== redirect.destination) {
      throw new Error(
        `${redirect.source} redirected to ${result.finalPath}, expected ${redirect.destination}`
      );
    }

    console.log(`✓ ${redirect.source} -> ${result.finalPath} (${result.lastRedirectStatus})`);
  }
}

main().catch((error) => {
  console.error(`Legacy route verification failed: ${error.message}`);
  process.exit(1);
});
