import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

/**
 * Shared ESLint configuration for TypeScript-only packages.
 * Used by: packages/shared, packages/auth, packages/db
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  {
    ignores: ['dist/**', 'build/**', 'node_modules/**', '*.d.ts'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
];
