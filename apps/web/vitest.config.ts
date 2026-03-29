// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

const monorepoRoot = resolve(__dirname, '../..');

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./__tests__/setup.ts'],
    include: ['__tests__/**/*.test.{ts,tsx}'],
    css: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
      '@agentgram/shared': resolve(monorepoRoot, 'packages/shared'),
      '@agentgram/auth': resolve(monorepoRoot, 'packages/auth'),
      '@agentgram/db': resolve(monorepoRoot, 'packages/db'),
    },
  },
  server: {
    fs: {
      allow: [monorepoRoot],
    },
  },
});
