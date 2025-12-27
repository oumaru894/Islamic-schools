# GitHub Actions Quick Reference

## 🎯 Workflow Files

| Workflow | File | Purpose |
|----------|------|---------|
| CI/CD Pipeline | `.github/workflows/ci-cd.yml` | Main build, test, and deployment |
| PR Checks | `.github/workflows/pr-checks.yml` | Pull request validation |
| Production Deploy | `.github/workflows/deploy.yml` | Production deployment |

## 🚀 Trigger Events

### CI/CD Pipeline
```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
```

**What happens:**
- ✅ Lint and type check
- 🔨 Build frontend and backend
- 🧪 Run tests
- 🔒 Security audit
- 🚀 Deploy (on push to main/develop)

### PR Checks
```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened]
```

**What happens:**
- ✅ Validate PR
- 🔍 Code quality checks
- 📊 Test coverage
- 🔨 Build verification
- 🔒 Security scan
- 💬 Automated PR comment

### Production Deploy
```yaml
on:
  push:
    branches: [main]
  tags: [v*.*.*]
  workflow_dispatch:
```

**What happens:**
- 🔨 Build production artifacts
- 🚀 Deploy to Vercel (frontend)
- 🚀 Deploy to Railway (backend)
- 🏥 Health checks
- 📢 Notifications

## 📋 Common Commands

### Check Workflow Status
```bash
# View all workflows
gh workflow list

# View workflow runs
gh run list --workflow=ci-cd.yml

# View specific run details
gh run view <run-id>
```

### Trigger Manual Deployment
```bash
# Via GitHub CLI
gh workflow run deploy.yml -f environment=production

# Via GitHub UI
# Actions → Deploy to Production → Run workflow
```

### View Logs
```bash
# View logs for latest run
gh run view --log

# View logs for specific workflow
gh run view --workflow=ci-cd.yml --log
```

## 🔐 Required Secrets

### Deployment Secrets
```
VITE_API_URL              # Frontend API endpoint
VERCEL_TOKEN              # Vercel authentication
VERCEL_ORG_ID             # Vercel organization ID
VERCEL_PROJECT_ID         # Vercel project ID
RAILWAY_TOKEN             # Railway authentication
RAILWAY_PROJECT_ID        # Railway project ID
```

### Optional Secrets
```
CODECOV_TOKEN             # Test coverage reporting
RENDER_SERVICE_ID         # Render service ID
RENDER_DEPLOY_HOOK        # Render deploy hook
```

## 🎨 Badge URLs

Add to your README.md:

```markdown
[![CI/CD](https://github.com/USER/REPO/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/USER/REPO/actions/workflows/ci-cd.yml)
[![Deploy](https://github.com/USER/REPO/actions/workflows/deploy.yml/badge.svg)](https://github.com/USER/REPO/actions/workflows/deploy.yml)
```

## 📊 Workflow Status Indicators

| Icon | Meaning |
|------|---------|
| 🟢 | Success |
| 🔴 | Failure |
| 🟡 | In Progress |
| ⚪ | Queued |
| ⏭️ | Skipped |

## 🔄 Deployment Flows

### Feature Development
```
feature-branch → develop (staging) → main (production)
```

1. Create feature branch
2. Make changes and commit
3. Open PR to develop
4. PR checks run automatically
5. Merge to develop → deploys to staging
6. Test on staging
7. Merge develop to main → deploys to production

### Hotfix
```
hotfix-branch → main (production)
```

1. Create hotfix branch from main
2. Make urgent fix
3. Open PR to main
4. PR checks run
5. Merge to main → immediate production deploy
6. Backport to develop

## 🛠️ Troubleshooting

### Build Failed
```bash
# Check the specific job that failed
gh run view <run-id>

# Re-run failed jobs
gh run rerun <run-id> --failed
```

### Deployment Failed
```bash
# Check deployment logs
gh run view <run-id> --log

# Manual rollback
gh workflow run deploy.yml -f environment=production
```

### Secrets Not Working
```bash
# List secrets (names only, not values)
gh secret list

# Update secret
gh secret set SECRET_NAME
```

## 📝 Environment URLs

| Environment | Frontend | Backend |
|-------------|----------|---------|
| Production | `https://liberia-islamic-schools.vercel.app` | `https://api.liberia-islamic-schools.up.railway.app` |
| Staging | `https://staging.liberia-islamic-schools.vercel.app` | `https://staging-api.railway.app` |
| Local | `http://localhost:5173` | `http://localhost:4000` |

## 🎯 Best Practices

1. **Always test locally first**
   ```bash
   npm run build
   npm test
   ```

2. **Use develop branch for testing**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/new-feature
   ```

3. **Write meaningful commit messages**
   ```bash
   git commit -m "feat: add new school search filter"
   git commit -m "fix: resolve mobile menu overflow"
   ```

4. **Tag releases properly**
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

5. **Monitor deployments**
   - Check Actions tab after pushing
   - Verify deployment URLs
   - Test functionality on deployed site

## 🔗 Useful Links

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [GitHub CLI](https://cli.github.com/manual/)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Railway CLI](https://docs.railway.app/develop/cli)

## 💡 Tips

- Use `continue-on-error: true` for non-critical jobs
- Cache dependencies with `actions/cache`
- Use matrix builds for multiple Node versions
- Set up Slack/Discord notifications for deployments
- Use environments for approval workflows
- Enable branch protection rules on main

---

**Last Updated:** January 2025
