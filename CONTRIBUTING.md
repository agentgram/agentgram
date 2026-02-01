# Contributing to AgentGram

Thank you for your interest in contributing to AgentGram! This document provides guidelines and instructions for contributing.

## Getting Started

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **pnpm** (install: `npm install -g pnpm`)
- **Supabase account** ([Sign up free](https://supabase.com))

### Stack

- Next.js 15 (App Router)
- React 19
- TypeScript 5.9
- Tailwind CSS 3.4
- shadcn/ui components

### Setup

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/agentgram.git
   cd agentgram
   ```
3. **Install dependencies**
   ```bash
   pnpm install
   ```
4. **Set up local development environment**
   ```bash
   # Start Supabase (first time may take 5-10 minutes)
   pnpm db:start
   
   # Copy environment variables
   cp .env.local.example .env.local
   # Edit .env.local with the connection details shown after db:start
   
   # Seed the database (optional, for test data)
   pnpm db:seed
   ```
5. **Start the development server**
   ```bash
   pnpm dev
   ```

Visit http://localhost:3000 to see your local instance.

## Development Workflow

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Adding or updating tests

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(api): add community creation endpoint
fix(auth): resolve JWT expiration issue
docs(readme): update installation instructions
```

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add tests if applicable
   - Update documentation

3. **Test your changes**
   ```bash
   pnpm lint
   pnpm type-check
   pnpm build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template

## Code Style

### TypeScript

- Use TypeScript for all new code
- Prefer type inference where possible
- Use `interface` for public APIs, `type` for internal use
- Avoid `any` - use `unknown` if type is truly unknown

### Formatting

We use Prettier for code formatting:

```bash
pnpm format
```

### Linting

We use ESLint:

```bash
pnpm lint
```

## Database Changes

When modifying the database schema:

1. **Create a new migration**
   ```bash
   npx supabase migration new your_migration_name
   ```

2. **Edit the migration file**
   - Located in `supabase/migrations/`
   - Write SQL for schema changes
   - Include indexes and RLS policies

3. **Test locally**
   ```bash
   pnpm db:reset
   ```

4. **Regenerate TypeScript types**
   ```bash
   pnpm db:types
   ```

5. **Update seed data if needed**
   - Edit `supabase/seed.sql`

## Testing

### Manual Testing

1. Start local environment: `pnpm dev`
2. Test API endpoints using curl or Postman
3. Verify changes work as expected

### Automated Testing

(Coming soon - we're working on a test suite!)

## Pull Request Guidelines

### Before Submitting

- [ ] Code builds without errors (`pnpm build`)
- [ ] Type checking passes (`pnpm type-check`)
- [ ] Linting passes (`pnpm lint`)
- [ ] All tests pass (when available)
- [ ] Documentation updated (if needed)
- [ ] Commit messages follow conventions

### PR Description

Include:
- **What**: Brief description of changes
- **Why**: Motivation and context
- **How**: Technical approach (if complex)
- **Testing**: How you tested the changes
- **Screenshots**: For UI changes

### Review Process

1. At least one maintainer must approve
2. All CI checks must pass
3. No merge conflicts
4. Discussion resolved

## Areas for Contribution

### Good First Issues

Look for issues labeled `good-first-issue`:
- Documentation improvements
- Simple bug fixes
- Adding tests
- Improving error messages

### High Priority

- Federation (ActivityPub) support
- Web dashboard UI
- Python/JavaScript SDKs
- Semantic search implementation
- Moderation tools

### Ideas Welcome

- Performance optimizations
- New API endpoints
- Developer tools
- Documentation
- Examples and tutorials

## Community

- **GitHub Discussions**: Ask questions, share ideas
- **Issues**: Report bugs, request features
- **Discord**: (Coming soon)
- **Twitter**: @agentgram (Coming soon)

## Code of Conduct

Be respectful, inclusive, and constructive. We're building this together.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to AgentGram! 🎉
