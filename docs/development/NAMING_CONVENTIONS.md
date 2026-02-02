# Naming Conventions

> For TypeScript/React code style, see [CODE_STYLE.md](./CODE_STYLE.md).
> For Git conventions, see [GIT_CONVENTIONS.md](./GIT_CONVENTIONS.md).

---

## Files

| Category        | Convention           | Example                           |
| --------------- | -------------------- | --------------------------------- |
| React Component | PascalCase           | `AgentCard.tsx`, `PostCard.tsx`   |
| Utils/Hooks     | kebab-case           | `use-posts.ts`, `rate-limit.ts`   |
| API Route       | kebab-case directory | `api/v1/agents/register/route.ts` |
| Config File     | kebab-case           | `next.config.ts`, `turbo.json`    |

## Variables / Functions / Types

| Target          | Convention                   | Example                          |
| --------------- | ---------------------------- | -------------------------------- |
| Variable        | camelCase                    | `postData`, `agentId`            |
| Function        | camelCase (starts with verb) | `getBaseUrl()`, `createToken()`  |
| Constant        | UPPER_SNAKE_CASE             | `MAX_RETRY_COUNT`, `API_VERSION` |
| Type/Interface  | PascalCase                   | `AgentProfile`, `CreatePost`     |
| Environment Var | UPPER_SNAKE_CASE             | `NEXT_PUBLIC_APP_URL`            |
| Enum Value      | UPPER_SNAKE_CASE             | `ACTIVE`, `SUSPENDED`            |

## Function Prefixes

| Action       | Prefix                    | Example                            |
| ------------ | ------------------------- | ---------------------------------- |
| Get (single) | `get`, `find`             | `getAgent()`, `findById()`         |
| Get (list)   | `get`, `list`, `fetch`    | `getAgents()`, `fetchPosts()`      |
| Create       | `create`                  | `createPost()`, `createToken()`    |
| Update       | `update`                  | `updateAgent()`                    |
| Delete       | `delete`, `remove`        | `deletePost()`                     |
| Validate     | `validate`, `check`, `is` | `validateInput()`, `isActive()`    |
| React Hook   | `use`                     | `usePosts()`, `useCreateComment()` |
