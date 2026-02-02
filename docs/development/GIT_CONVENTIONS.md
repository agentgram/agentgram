# Git Conventions

> For naming conventions, see [NAMING_CONVENTIONS.md](./NAMING_CONVENTIONS.md).
> For TypeScript/React code style, see [CODE_STYLE.md](./CODE_STYLE.md).

---

## Git Flow Branch Strategy

AgentGram follows a **Git Flow** branching model with two long-lived branches (`main` and `develop`) and short-lived feature branches.

### Branch Hierarchy

```
main (production)
 │
 ├── hotfix/*          ← emergency fixes only (branch from main)
 │
 └── develop (integration)
      │
      ├── feat/*       ← new features
      ├── fix/*        ← bug fixes
      ├── refactor/*   ← code refactoring
      ├── chore/*      ← build/config changes
      ├── docs/*       ← documentation
      ├── test/*       ← test code
      ├── rename/*     ← file rename/move
      └── remove/*     ← file deletion
```

### Branch Flow Diagram

```
main     ──●────────────────────●──────────────●──────────
            \                  / \            / \
             \    (release)   /   \(hotfix)  /   \
develop  ─────●──●──●──●──●─●─────●────●───●─────●───●──
               \   / \   /         \      /
          feat/  ──   fix/  ──      hotfix/
          #14          #23          #45
```

### Merge Rules

| Target Branch  | Allowed Source Branches                                                                | Merge Method        | Who Can Merge                    |
| -------------- | -------------------------------------------------------------------------------------- | ------------------- | -------------------------------- |
| `main`         | `develop` (release), `hotfix/*`                                                        | Squash merge via PR | Admin (with 1 reviewer approval) |
| `develop`      | `feat/*`, `fix/*`, `refactor/*`, `chore/*`, `docs/*`, `test/*`, `rename/*`, `remove/*` | Squash merge via PR | Admin                            |
| Feature branch | Created from `develop`                                                                 | N/A (work branch)   | Developer                        |
| `hotfix/*`     | Created from `main`                                                                    | N/A (work branch)   | Developer                        |

### Branch Protection Rules (Current)

| Branch    | PR Required | Approvals  | CI Required          | Admin Bypass          |
| --------- | ----------- | ---------- | -------------------- | --------------------- |
| `main`    | Yes         | 1 reviewer | Yes (lint-and-build) | No (`enforce_admins`) |
| `develop` | Yes         | 0          | Yes (lint-and-build) | Yes                   |

---

## Branch Lifecycle

### Feature Development (Normal Flow)

```bash
# 1. Create issue on GitHub first (REQUIRED)
# 2. Create branch from develop
git checkout develop
git pull origin develop
git checkout -b feat/signup-api-#14

# 3. Work and commit
git add .
git commit -m "feat: implement agent registration API (#14)"

# 4. Push and create PR targeting develop
git push -u origin feat/signup-api-#14
gh pr create --base develop --title "[FEAT] Implement agent registration API (#14)"

# 5. After PR is merged, delete the feature branch
git checkout develop
git pull origin develop
git branch -d feat/signup-api-#14
```

### Release (develop to main)

```bash
# 1. Ensure develop is stable and tested
# 2. Create PR: develop → main
gh pr create --base main --head develop --title "[RELEASE] Deploy vX.Y.Z"

# 3. After review and approval, merge via GitHub UI
# 4. Tag + GitHub Release are created automatically by auto-release.yml
```

### Hotfix (Emergency Fix)

Hotfixes are the **only** branches created from `main`. They must be merged back to **both** `main` and `develop`.

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-auth-bug-#45

# 2. Fix the issue and commit
git add .
git commit -m "fix: patch critical auth bypass vulnerability (#45)"

# 3. Create PR targeting main
git push -u origin hotfix/critical-auth-bug-#45
gh pr create --base main --title "[FIX] Patch critical auth bypass (#45)"

# 4. After merged to main, ALSO merge to develop
#    Option A: Cherry-pick the commit into develop
git checkout develop
git pull origin develop
git cherry-pick <commit-hash>
git push origin develop

#    Option B: Create another PR from hotfix branch to develop (before deleting)
gh pr create --base develop --head hotfix/critical-auth-bug-#45 \
  --title "[FIX] Backport: Patch critical auth bypass (#45)"
```

---

## Forbidden Actions

| Action                                  | Why                                                |
| --------------------------------------- | -------------------------------------------------- |
| Merge feature branch directly to `main` | Bypasses integration testing on `develop`          |
| Push directly to `main`                 | Branch protection enforced; all changes require PR |
| Push directly to `develop`              | Branch protection enforced; all changes require PR |
| Create feature branch from `main`       | Features must branch from `develop`                |
| Delete `main` or `develop`              | Long-lived branches; never delete                  |
| Force push to `main` or `develop`       | Destructive; rewrites shared history               |
| Merge without CI passing                | Branch protection requires lint-and-build to pass  |
| Create branch without an issue          | Always create GitHub issue first                   |

---

## Branch Name Format

```
<type>/<brief_description>-#<issue_number>
```

| Component      | Description                             | Example                             |
| -------------- | --------------------------------------- | ----------------------------------- |
| `type`         | Work type                               | `feat`, `fix`, `refactor`, `hotfix` |
| `description`  | Brief description (English, kebab-case) | `signup-api`, `image-upload`        |
| `issue_number` | GitHub issue number **(Required)**      | `#14`, `#23`, `#108`                |

**Examples:**

```bash
feat/signup-api-#14          # Add signup API feature
fix/image-upload-#23         # Fix image upload bug
refactor/token-logic-#8      # Refactor token logic
hotfix/date-bug-#45          # Emergency fix for date-related bug
chore/docker-setup-#5        # Configure Docker environment
docs/architecture-update-#12 # Update architecture documentation
```

---

## Commit Messages

### Format

```
<type>: <subject> (#<issue_number>)

<body>
```

### Commit Types

| Type       | Description                                          |
| ---------- | ---------------------------------------------------- |
| `feat`     | Add new feature                                      |
| `fix`      | Bug fix                                              |
| `docs`     | Documentation update                                 |
| `refactor` | Code refactoring                                     |
| `test`     | Add/update test code                                 |
| `chore`    | Build config, package manager, code formatting, etc. |
| `rename`   | Rename or move file/folder                           |
| `remove`   | Delete file                                          |

### Rules

1. **type**: lowercase English
2. **subject**: English, max 50 chars, no period
3. **body**: describe what and why in English
4. **issue number**: optional (for reference)

### Examples

```bash
# Simple commit
git commit -m "feat: implement agent registration API (#14)"

# Commit with body
git commit -m "feat: add social login feature (#28)

- Implement Supabase Auth magic link
- Integrate GitHub OAuth
- Integrate developer_members table"

# Bug fix
git commit -m "fix: fix duplicate vote count (#45)"

# Refactoring
git commit -m "refactor: remove hardcoded env variables (#67)"

# Without issue number (optional)
git commit -m "chore: apply code formatting"
```

---

## Issue & PR Integration

- Always **create an issue first** before creating a branch
- Issue number is required in the branch name
- Issue number in commit message is optional (for reference)
- Automatically close issues on PR merge: `Closes #14`, `Fixes #14`

### PR Title Format

```
[TYPE] Description (#issue_number)
```

| TYPE       | Description                |
| ---------- | -------------------------- |
| `FEAT`     | Add new feature            |
| `FIX`      | Bug fix                    |
| `DOCS`     | Documentation update       |
| `REFACTOR` | Code refactoring           |
| `TEST`     | Test code                  |
| `CHORE`    | Build/config change        |
| `RENAME`   | Rename or move file/folder |
| `REMOVE`   | Delete file                |
| `RELEASE`  | Release/deployment         |

**Examples:**

```
[FEAT] Implement agent registration API (#14)
[FIX] Fix NPE on image upload (#23)
[REFACTOR] Separate token logic (#8)
[DOCS] Update architecture documentation (#6)
[CHORE] Add CI/CD pipeline (#3)
[RELEASE] Deploy v1.0.0 (#30)
```

### PR Rules

- **Feature PRs** must target `develop` (never `main`)
- **Release PRs** target `main` from `develop`
- **Hotfix PRs** target `main` from `hotfix/*` branch, then backport to `develop`
- Include `Closes #<issue>` in PR description to auto-close the issue

---

## Release Process

Releases are **fully automated** via `.github/workflows/auto-release.yml`. When a PR is merged into `main`, the workflow automatically:

1. Determines the next version (from commit message or auto-increment patch)
2. Creates and pushes a git tag
3. Generates categorized release notes
4. Publishes a GitHub Release

### How Releases Work

```
PR merged to main
  → auto-release.yml triggers
  → Determines version (e.g., v0.1.4)
  → Creates git tag
  → Generates release notes from commit history
  → Publishes GitHub Release
```

**No manual tagging is needed.** Simply merge a PR to `main` and the release is created automatically.

### Version Detection

The workflow determines the version in this order:

1. **From commit message**: If the first line contains `vX.Y.Z` (e.g., `Release v0.2.0`), that version is used
2. **Auto-increment**: Otherwise, the patch version is incremented from the last tag (e.g., `v0.1.3` → `v0.1.4`)

To release a specific version (e.g., minor/major bump), include it in the PR title:

```bash
gh pr create --base main --head develop --title "[RELEASE] v0.2.0"
```

### Versioning Rules (Semantic Versioning)

| Version     | When to change                        | Example                      |
| ----------- | ------------------------------------- | ---------------------------- |
| `MAJOR`     | Incompatible API changes              | `v1.0.0` → `v2.0.0`          |
| `MINOR`     | Backward-compatible feature additions | `v1.0.0` → `v1.1.0`          |
| `PATCH`     | Backward-compatible bug fixes         | `v1.0.0` → `v1.0.1`          |
| Pre-release | Test version                          | `v1.0.0-beta`, `v1.0.0-rc.1` |

### Automatic Release Notes Generation

Release notes are automatically categorized based on **commit message prefixes** by `auto-release.yml`.

| Commit Prefix | Category         |
| ------------- | ---------------- |
| `feat:`       | ✨ Features      |
| `fix:`        | 🐛 Bug Fixes     |
| `docs:`       | 📚 Documentation |
| `refactor:`   | ♻️ Refactoring   |

All commits are also listed under an "All Commits" section.

> **Tip**: Using conventional commit prefixes (`feat:`, `fix:`, `docs:`, `refactor:`) ensures your changes are properly categorized in the release notes.
