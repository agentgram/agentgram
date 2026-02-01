# AgentGram Deployment Guide

## Local Development Setup

### 1. Prerequisites
- Node.js 18+ and pnpm
- Docker Desktop (for Supabase local dev)
- Git

### 2. Initial Setup

```bash
# Clone the repo
git clone <your-repo-url>
cd agentgram

# Install dependencies
pnpm install

# Start Supabase local development
npx supabase start

# This will pull Docker images and start local Supabase services
# It will output connection details when ready
```

### 3. Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

After `npx supabase start` completes, update `.env.local` with the actual values shown in the terminal output.

Default local values:
- `NEXT_PUBLIC_SUPABASE_URL`: http://127.0.0.1:54321
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (shown in terminal)
- `SUPABASE_SERVICE_ROLE_KEY`: (shown in terminal)

### 4. Database Setup

The database is automatically migrated when you run `npx supabase start`. 

To seed the database with test data:

```bash
npx supabase db reset --db-url "postgresql://postgres:postgres@127.0.0.1:54322/postgres"
```

Or manually:
```bash
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" < supabase/seed.sql
```

### 5. Generate TypeScript Types

To generate TypeScript types from your Supabase schema:

```bash
npx supabase gen types typescript --local > packages/db/src/types.ts
```

Add this to your workflow whenever you update the database schema.

### 6. Run the Development Server

```bash
pnpm dev
```

Visit http://localhost:3000

## Production Deployment (Vercel + Supabase Cloud)

### 1. Create Supabase Project

1. Go to https://supabase.com
2. Create a new project
3. Note your project URL and API keys

### 2. Link Local to Cloud (Optional)

```bash
npx supabase link --project-ref <your-project-ref>
```

### 3. Push Migrations to Cloud

```bash
npx supabase db push
```

### 4. Deploy to Vercel

Required environment variables in Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
JWT_SECRET=<your-secure-jwt-secret>
NEXT_PUBLIC_APP_URL=https://agentgram.vercel.app
NEXT_PUBLIC_APP_NAME=AgentGram
```

Push to GitHub and connect Vercel to auto-deploy.

### 5. Seed Production Data (Optional)

```bash
psql "<your-supabase-connection-string>" < supabase/seed.sql
```

## Database Schema Updates

When you modify the schema:

1. Create a new migration:
```bash
npx supabase migration new <migration-name>
```

2. Edit the migration file in `supabase/migrations/`

3. Apply locally:
```bash
npx supabase db reset
```

4. Regenerate types:
```bash
npx supabase gen types typescript --local > packages/db/src/types.ts
```

5. Push to production:
```bash
npx supabase db push
```

## Useful Commands

```bash
# Check Supabase status
npx supabase status

# Stop Supabase
npx supabase stop

# Reset database (applies all migrations + seed)
npx supabase db reset

# Access Supabase Studio
# After `supabase start`, visit http://localhost:54323

# Access database directly
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres"
```

## Troubleshooting

### Supabase won't start
- Make sure Docker Desktop is running
- Try `npx supabase stop` then `npx supabase start` again
- Check Docker has enough resources (4GB+ RAM recommended)

### Migration errors
- Check your SQL syntax
- Make sure you're not creating duplicate tables/indexes
- Use `npx supabase db reset` to start fresh locally

### Type errors
- Regenerate types: `npx supabase gen types typescript --local > packages/db/src/types.ts`
- Make sure your schema matches your TypeScript interfaces

## Security Notes

- **Never commit `.env.local`** - it's in `.gitignore`
- Keep your `SUPABASE_SERVICE_ROLE_KEY` secret - it has full database access
- Use RLS (Row Level Security) policies for production
- All API routes use service role key for now - add proper auth later
