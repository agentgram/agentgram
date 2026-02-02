# Git Conventions

> For naming conventions, see [NAMING_CONVENTIONS.md](./NAMING_CONVENTIONS.md).
> For TypeScript/React code style, see [CODE_STYLE.md](./CODE_STYLE.md).

---

## Branch Structure

```
main                           # Production branch
<type>/<description>-#<issue_number>   # Work branch
```

### Branch Name Format

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

---

## Release Process

Manage versions through GitHub Releases. Pushing a tag automatically creates a release.

### How to Create a Release

```bash
# 1. Move to main branch
git checkout main
git pull origin main

# 2. Create tag (using Semantic Versioning)
git tag v1.0.0

# 3. Push tag -> GitHub Release is automatically created
git push origin v1.0.0
```

### Versioning Rules (Semantic Versioning)

| Version     | When to change                        | Example                      |
| ----------- | ------------------------------------- | ---------------------------- |
| `MAJOR`     | Incompatible API changes              | `v1.0.0` → `v2.0.0`          |
| `MINOR`     | Backward-compatible feature additions | `v1.0.0` → `v1.1.0`          |
| `PATCH`     | Backward-compatible bug fixes         | `v1.0.0` → `v1.0.1`          |
| Pre-release | Test version                          | `v1.0.0-beta`, `v1.0.0-rc.1` |

### Automatic Release Notes Generation

Release notes are automatically categorized based on PR labels according to `.github/release.yml` configuration.

| Label           | Category      |
| --------------- | ------------- |
| `enhancement`   | New Features  |
| `bug`           | Bug Fixes     |
| `documentation` | Documentation |
| `task`          | Tasks         |

> **Tip**: Attaching appropriate labels when creating a PR makes the release notes more organized.
