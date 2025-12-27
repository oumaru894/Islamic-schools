# GitHub Actions CI/CD Implementation

## 📋 Overview

This project now includes a comprehensive CI/CD pipeline using GitHub Actions with three main workflows:

1. **CI/CD Pipeline** (`ci-cd.yml`) - Main build, test, and deployment workflow
2. **Pull Request Checks** (`pr-checks.yml`) - Automated PR validation and quality checks
3. **Production Deployment** (`deploy.yml`) - Manual and automated production deployments

---

## 🚀 Workflows

### 1. CI/CD Pipeline (`ci-cd.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**
1. **Code Quality Check** - ESLint and TypeScript type checking
2. **Build Frontend** - Vite build with artifact upload
3. **Build Backend** - Express backend build
4. **Run Tests** - Frontend and backend test suites
5. **Security Audit** - npm audit for vulnerabilities
6. **Deploy to Production** - Automatic deployment on main branch
7. **Deploy to Staging** - Automatic deployment on develop branch

**Environment Variables Required:**
- `VITE_API_URL` - Frontend API endpoint
- `DEPLOY_TOKEN` - Production deployment token
- `STAGING_DEPLOY_TOKEN` - Staging deployment token

---

### 2. Pull Request Checks (`pr-checks.yml`)

**Triggers:**
- Pull request opened, synchronized, or reopened

**Jobs:**
1. **PR Validation** - Check PR title and merge conflicts
2. **Code Quality** - TypeScript compilation, ESLint, Prettier
3. **Test Coverage** - Run tests with coverage reports
4. **Build Verification** - Ensure builds succeed
5. **Security Scan** - Dependency audit and secret scanning
6. **PR Comment** - Automated status comment on PR

**Features:**
- ✅ TypeScript strict type checking
- ✅ Code formatting validation
- ✅ Test coverage reporting (Codecov integration)
- ✅ Build size monitoring
- ✅ Secret detection with TruffleHog
- ✅ Automated PR status comments

---

### 3. Production Deployment (`deploy.yml`)

**Triggers:**
- Push to `main` branch
- Git tags matching `v*.*.*` pattern
- Manual workflow dispatch

**Jobs:**
1. **Build Frontend** - Production-ready Vite build
2. **Build Backend** - Production Express build
3. **Deploy Frontend (Vercel)** - Deploy to Vercel hosting
4. **Deploy Backend (Railway)** - Deploy to Railway
5. **Deploy Backend (Render)** - Alternative Render deployment (disabled by default)
6. **Health Check** - Post-deployment API health checks
7. **Success Notification** - Deployment success message
8. **Rollback** - Automatic rollback on failure

**Deployment Platforms:**

#### Frontend (Vercel)
- **URL:** `https://liberia-islamic-schools.vercel.app`
- **Secrets Required:**
  - `VERCEL_TOKEN` - Vercel authentication token
  - `VERCEL_ORG_ID` - Vercel organization ID
  - `VERCEL_PROJECT_ID` - Vercel project ID

#### Backend (Railway)
- **URL:** `https://api.liberia-islamic-schools.up.railway.app`
- **Secrets Required:**
  - `RAILWAY_TOKEN` - Railway authentication token
  - `RAILWAY_PROJECT_ID` - Railway project ID

#### Backend (Render - Alternative)
- Enable by setting `if: false` to `if: true` in the job
- **Secrets Required:**
  - `RENDER_SERVICE_ID` - Render service ID
  - `RENDER_DEPLOY_HOOK` - Render deploy hook URL

---

## 🔐 Required GitHub Secrets

Navigate to **Settings → Secrets and variables → Actions** and add:

### API & Environment Variables
```
VITE_API_URL=https://api.liberia-islamic-schools.up.railway.app
GEMINI_API_KEY=your_gemini_api_key_here
```

### Vercel Deployment
```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

### Railway Deployment
```
RAILWAY_TOKEN=your_railway_token
RAILWAY_PROJECT_ID=your_project_id
```

### Optional Services
```
CODECOV_TOKEN=your_codecov_token (for test coverage reports)
RENDER_SERVICE_ID=your_render_service_id
RENDER_DEPLOY_HOOK=your_render_deploy_hook
```

---

## 📖 Usage Guide

### Automatic Deployments

1. **Production Deployment:**
   ```bash
   git checkout main
   git merge develop
   git push origin main
   # Automatically deploys to production
   ```

2. **Staging Deployment:**
   ```bash
   git checkout develop
   git push origin develop
   # Automatically deploys to staging
   ```

### Manual Deployment

1. Go to **Actions** tab in GitHub
2. Select **Deploy to Production** workflow
3. Click **Run workflow**
4. Choose environment (production/staging)
5. Click **Run workflow** button

### Version Tagging

```bash
git tag v1.0.0
git push origin v1.0.0
# Triggers production deployment with version tag
```

---

## 🧪 Testing Locally

### Run Tests
```bash
# Frontend tests
npm test

# Backend tests
cd server && npm test

# Test coverage
npm run test:coverage
```

### Build Locally
```bash
# Build frontend
npm run build

# Build backend
cd server && npm run build
```

### Linting & Type Checking
```bash
# Run ESLint
npm run lint

# TypeScript type checking
npx tsc --noEmit
```

---

## 🔧 Workflow Customization

### Adding New Jobs

Edit `.github/workflows/ci-cd.yml`:

```yaml
new-job:
  name: My Custom Job
  runs-on: ubuntu-latest
  needs: [previous-job]
  
  steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Custom step
      run: echo "Custom command"
```

### Enabling Render Deployment

Edit `.github/workflows/deploy.yml`:

```yaml
deploy-backend-render:
  name: Deploy Backend (Render)
  runs-on: ubuntu-latest
  needs: build-backend
  if: true  # Change from false to true
```

### Adding Environment Variables

Edit workflow files and add to `env:` section:

```yaml
env:
  NODE_VERSION: '18.x'
  CUSTOM_VAR: 'value'
```

---

## 🎯 Deployment Checklist

Before deploying to production:

- [ ] All tests passing locally
- [ ] TypeScript compiles without errors
- [ ] No ESLint errors
- [ ] Environment variables configured in GitHub Secrets
- [ ] Vercel project created and linked
- [ ] Railway project created and linked
- [ ] Database migrations completed
- [ ] CORS settings configured for production domains
- [ ] API keys rotated for production use
- [ ] Health check endpoints working

---

## 📊 Monitoring Deployments

### Check Workflow Status
1. Go to **Actions** tab in GitHub
2. View recent workflow runs
3. Click on a run to see detailed logs

### View Deployment Logs

**Vercel:**
```bash
vercel logs --prod
```

**Railway:**
```bash
railway logs
```

### Health Check Endpoints

Frontend: `https://liberia-islamic-schools.vercel.app`
Backend: `https://api.liberia-islamic-schools.up.railway.app/health`

---

## 🐛 Troubleshooting

### Build Failures

1. **Check TypeScript errors:**
   ```bash
   npx tsc --noEmit
   ```

2. **Clear cache and rebuild:**
   ```bash
   rm -rf node_modules dist
   npm ci
   npm run build
   ```

### Deployment Failures

1. **Verify secrets are set correctly** in GitHub Settings
2. **Check deployment platform status** (Vercel/Railway)
3. **Review workflow logs** for specific error messages
4. **Ensure environment variables** match production requirements

### Test Failures

1. **Run tests locally:**
   ```bash
   npm test -- --verbose
   ```

2. **Check for environment-specific issues**
3. **Update snapshots if needed:**
   ```bash
   npm test -- -u
   ```

---

## 🔄 Rollback Procedure

### Automatic Rollback
- Workflow automatically detects deployment failures
- Manual intervention may be required for critical issues

### Manual Rollback

**Vercel:**
```bash
vercel rollback <deployment-url>
```

**Railway:**
1. Go to Railway dashboard
2. Select project → Deployments
3. Click "Rollback" on previous stable deployment

**Git Revert:**
```bash
git revert HEAD
git push origin main
```

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Render Deployment Guide](https://render.com/docs)

---

## 🎉 Next Steps

1. **Configure GitHub Secrets** with all required tokens
2. **Create Vercel project** and link to repository
3. **Create Railway project** for backend deployment
4. **Test deployment** by pushing to develop branch
5. **Monitor first production deployment**
6. **Set up monitoring** and alerting (optional)
7. **Configure custom domain** (optional)

---

**Status:** ✅ CI/CD Pipeline Ready
**Version:** 1.0.0
**Last Updated:** January 2025
