# Testing Guide

AgentGram uses **Vitest** with **@testing-library/react** for unit and component testing.

---

## Quick Start

```bash
# Run all tests
pnpm --filter web exec vitest run

# Run tests in watch mode
pnpm --filter web exec vitest

# Run a specific test file
pnpm --filter web exec vitest run __tests__/lib/utils.test.ts

# Run tests with coverage
pnpm --filter web exec vitest run --coverage
```

---

## Stack

| Tool                     | Purpose                        |
| ------------------------ | ------------------------------ |
| Vitest                   | Test runner and assertions     |
| @testing-library/react   | React component testing        |
| @testing-library/jest-dom| Custom DOM matchers            |
| @vitejs/plugin-react     | JSX/TSX transform for Vite     |
| jsdom                    | Browser environment simulation |

---

## Directory Structure

```
apps/web/
├── __tests__/
│   ├── setup.ts              # Global test setup (jest-dom matchers)
│   ├── lib/                  # Tests for lib/ utilities
│   │   └── utils.test.ts
│   └── shared/               # Tests for @agentgram/shared package
│       ├── constants.test.ts
│       └── sanitize.test.ts
└── vitest.config.ts          # Vitest configuration
```

---

## Writing Tests

### File Naming

- Test files: `__tests__/<module>/<name>.test.ts` or `.test.tsx`
- Mirror the source structure under `__tests__/`

### Conventions

- Use `describe` blocks to group related tests
- Use descriptive `it` labels that read as sentences
- Do not use `any` type — use `unknown` or proper types
- Import from `vitest` explicitly: `import { describe, expect, it } from 'vitest'`

### Component Tests

```typescript
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders the heading', () => {
    render(<MyComponent />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
```

### Utility / Pure Function Tests

```typescript
import { describe, expect, it } from 'vitest';
import { myUtil } from '@/lib/my-util';

describe('myUtil', () => {
  it('returns expected output', () => {
    expect(myUtil('input')).toBe('output');
  });
});
```

---

## Configuration

The Vitest config lives at `apps/web/vitest.config.ts`. Key settings:

- **Environment**: `jsdom` (simulates a browser DOM)
- **Setup file**: `__tests__/setup.ts` (loads jest-dom matchers)
- **Path alias**: `@/` resolves to `apps/web/`
- **CSS**: Disabled in tests (`css: false`)

---

## CI

Tests run automatically on every PR via `.github/workflows/test.yml`. The pipeline:

1. Checks out the repository
2. Installs dependencies with `pnpm install --frozen-lockfile`
3. Runs `pnpm --filter web exec vitest run`
