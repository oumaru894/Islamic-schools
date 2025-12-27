# GitHub Actions Workflow Cheatsheet

Quick reference for understanding the `ci-cd.yml` workflow.

## 🎯 Quick Overview

| Component | Purpose | Example |
|-----------|---------|---------|
| **Workflow** | The entire automation | `ci-cd.yml` file |
| **Trigger** | When to run | `on: push` |
| **Job** | Group of steps | `lint`, `build`, `test` |
| **Step** | Individual task | `npm install` |
| **Action** | Reusable code | `actions/checkout@v4` |

## 📋 Our Workflow Jobs

```
┌─────────────────────────────────────────────┐
│  TRIGGER: Push or PR to main/develop        │
└─────────────────┬───────────────────────────┘
                  │
    ┌─────────────▼────────────────┐
    │  JOB 1: lint                 │
    │  - ESLint checks             │
    │  - TypeScript checks         │
    └─────────────┬────────────────┘
                  │
       ┌──────────┴──────────┐
       │                     │
  ┌────▼──────┐        ┌─────▼──────┐
  │ JOB 2:    │        │ JOB 3:     │
  │ build-    │        │ build-     │
  │ frontend  │        │ backend    │
  └────┬──────┘        └─────┬──────┘
       │                     │
       └──────────┬──────────┘
                  │
         ┌────────▼─────────┐
         │ JOB 4: test      │
         │ - Frontend tests │
         │ - Backend tests  │
         └────────┬─────────┘
                  │
       ┌──────────┴──────────┐
       │                     │
  ┌────▼────────┐      ┌─────▼────────┐
  │ JOB 6:      │      │ JOB 7:       │
  │ deploy-     │      │ deploy-      │
  │ production  │      │ staging      │
  │ (main only) │      │ (dev only)   │
  └─────────────┘      └──────────────┘
```

## 🔑 Key Syntax Elements

### Workflow Structure
```yaml
name: CI/CD Pipeline              # Workflow name
on: [push, pull_request]          # Triggers
env:                              # Global variables
  VAR: value
jobs:                             # Jobs section
  job-name:                       # Job identifier
    runs-on: ubuntu-latest        # Operating system
    needs: [other-job]            # Dependencies
    if: condition                 # When to run
    steps:                        # Steps list
      - name: Step name           # Step description
        uses: action@v4           # Use an action
        with:                     # Action parameters
          param: value
        run: command              # Shell command
        env:                      # Step variables
          VAR: value
```

### Common Patterns

**Clone Repository:**
```yaml
- uses: actions/checkout@v4
```

**Setup Node.js:**
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '18.x'
    cache: 'npm'
```

**Install Dependencies:**
```yaml
- run: npm ci
```

**Run Commands:**
```yaml
- run: npm run build
```

**Multi-line Commands:**
```yaml
- run: |
    cd folder
    npm install
    npm test
```

**Upload Files:**
```yaml
- uses: actions/upload-artifact@v4
  with:
    name: build-files
    path: dist/
```

**Download Files:**
```yaml
- uses: actions/download-artifact@v4
  with:
    name: build-files
    path: dist/
```

## 🔒 Secrets Usage

**Access a secret:**
```yaml
env:
  API_KEY: ${{ secrets.MY_SECRET }}
```

**Common secrets in our workflow:**
- `VITE_API_URL` - API endpoint
- `DEPLOY_TOKEN` - Deployment token
- `VERCEL_TOKEN` - Vercel auth

## ⚙️ Conditions

**Run only on main branch:**
```yaml
if: github.ref == 'refs/heads/main'
```

**Run only on push (not PR):**
```yaml
if: github.event_name == 'push'
```

**Run if previous step succeeded:**
```yaml
if: success()
```

**Run if previous step failed:**
```yaml
if: failure()
```

**Always run:**
```yaml
if: always()
```

**Combined conditions:**
```yaml
if: github.ref == 'refs/heads/main' && github.event_name == 'push'
```

## 🎨 Job Dependencies

**No dependency (runs in parallel):**
```yaml
job1:
  runs-on: ubuntu-latest
job2:
  runs-on: ubuntu-latest
```

**Sequential (job2 waits for job1):**
```yaml
job1:
  runs-on: ubuntu-latest
job2:
  needs: job1
  runs-on: ubuntu-latest
```

**Wait for multiple jobs:**
```yaml
job1:
  runs-on: ubuntu-latest
job2:
  runs-on: ubuntu-latest
job3:
  needs: [job1, job2]
  runs-on: ubuntu-latest
```

## 📝 Common Commands

| Command | Purpose |
|---------|---------|
| `npm ci` | Install exact dependencies from lockfile |
| `npm run build` | Build the application |
| `npm test` | Run tests |
| `npm run lint` | Check code style |
| `npx tsc --noEmit` | TypeScript type checking |
| `npm audit` | Check for security vulnerabilities |

## 🌍 GitHub Context Variables

```yaml
${{ github.ref }}              # Branch reference (refs/heads/main)
${{ github.event_name }}       # Event type (push, pull_request)
${{ github.actor }}            # User who triggered
${{ github.repository }}       # Repo name (owner/repo)
${{ github.sha }}              # Commit SHA
${{ env.VARIABLE }}            # Environment variable
${{ secrets.SECRET_NAME }}     # Secret value
```

## 🚀 Quick Testing

**Test workflow locally with Act:**
```bash
# Install act
brew install act

# Run workflow
act push

# Run specific job
act -j lint

# List workflows
act -l
```

**View workflows on GitHub:**
1. Go to repository
2. Click **Actions** tab
3. Select a workflow run
4. View logs

## 🐛 Debugging Tips

**Check syntax:**
- Use YAML validator online
- Check indentation (use spaces, not tabs)
- Ensure proper nesting

**Common errors:**
- Typo in action name (`actions/checkout@v4`)
- Missing required parameters
- Incorrect secret name (case-sensitive)
- Wrong branch name in `if` condition

**View detailed logs:**
1. Click on failed job
2. Expand failed step
3. Read error message
4. Check what command actually ran

## 📚 Learn More

**Official Docs:**
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [GitHub Actions](https://docs.github.com/en/actions)

**Marketplace:**
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)

---

**Pro Tip:** Start simple and add complexity gradually. Test each change!
