# GitHub Workflow Security Analysis

## pull_request_target Usage Review

### File: `.github/workflows/auto-label.yml`

### Issue
Medium severity: `pull_request_target` event is used with write permissions.

### What is pull_request_target?
- Triggers workflow on PRs from forks
- Runs in the context of the base repository (not the fork)
- Has access to repository secrets and write permissions
- **Risk**: Can be exploited by malicious PRs from external contributors

### Current Implementation Analysis

#### Permissions
```yaml
permissions:
  issues: write
  pull-requests: write
  contents: read
```

#### Potential Risks
1. **Untrusted Input Processing**
   - PR title and body are used without sanitization
   - Could potentially contain malicious content
   
2. **Fork PR Handling**
   - Any external contributor can trigger this workflow
   - No verification of PR author

3. **File Path Processing**
   - File paths from PR are used for labeling
   - Could contain special characters or injection attempts

### Current Mitigations
✅ Uses `actions/github-script` which provides some isolation
✅ Only performs read operations on PR content
✅ Only adds labels (limited scope)

### Recommended Improvements

#### Option 1: Use pull_request instead (RECOMMENDED)
Change to `pull_request` to only process internal PRs:
```yaml
on:
  issues:
    types: [opened]
  pull_request:
    types: [opened]
```
**Pros**: Safer, no fork PR risks
**Cons**: External contributor PRs won't be auto-labeled

#### Option 2: Add PR author verification
Keep `pull_request_target` but verify the author:
```yaml
- name: Check PR author
  if: github.event_name == 'pull_request_target'
  uses: actions/github-script@v8
  with:
    script: |
      // Only process PRs from organization members or collaborators
      const author = context.payload.pull_request.user.login;
      try {
        await github.rest.repos.checkCollaborator({
          owner: context.repo.owner,
          repo: context.repo.repo,
          username: author
        });
        core.setOutput('is_collaborator', 'true');
      } catch {
        core.setOutput('is_collaborator', 'false');
      }
```

#### Option 3: Sanitize inputs
Add input validation and sanitization:
```yaml
- name: Sanitize PR content
  run: |
    # Remove special characters and limit length
    PR_TITLE=$(echo "${{ github.event.pull_request.title }}" | tr -cd '[:alnum:][:space:]-_' | cut -c1-200)
    echo "PR_TITLE=$PR_TITLE" >> $GITHUB_ENV
```

### Recommendation
**Use Option 1**: Change to `pull_request` for maximum security.

For AgentGram's current stage (pre-production), auto-labeling fork PRs is not critical. Manual labeling for external contributions is acceptable and safer.

### Alternative: Hybrid Approach
Keep `pull_request_target` only for the issue labeling job, and use `pull_request` for PR labeling:
```yaml
on:
  issues:
    types: [opened]
  pull_request:
    types: [opened]
  pull_request_target:
    types: [opened]

jobs:
  label-issues:
    if: github.event_name == 'issues'
    # ... issue labeling code
  
  label-prs:
    if: github.event_name == 'pull_request'
    # ... PR labeling code (internal PRs only)
  
  label-fork-prs:
    if: github.event_name == 'pull_request_target' && github.event.pull_request.head.repo.fork
    # ... limited labeling for fork PRs with extra validation
```

### Action Items
1. ✅ Security analysis completed
2. ⏳ Create PR with security improvements
3. ⏳ Review with team
4. ⏳ Merge and test

### References
- [GitHub Security: pull_request_target](https://securitylab.github.com/research/github-actions-preventing-pwn-requests/)
- [GitHub Actions Security Best Practices](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
