# GitHub Actions Learning Guide

This guide explains the CI/CD workflow step-by-step to help you learn GitHub Actions.

## 📚 Table of Contents

1. [What is GitHub Actions?](#what-is-github-actions)
2. [Understanding the Workflow File](#understanding-the-workflow-file)
3. [Key Concepts Explained](#key-concepts-explained)
4. [Job Dependencies & Execution Flow](#job-dependencies--execution-flow)
5. [Secrets & Environment Variables](#secrets--environment-variables)
6. [Common Commands & Syntax](#common-commands--syntax)
7. [Hands-On Exercises](#hands-on-exercises)

---

## What is GitHub Actions?

**GitHub Actions** is a CI/CD (Continuous Integration/Continuous Deployment) platform that automates your software development workflows.

### Why Use GitHub Actions?

- ✅ **Automatic Testing**: Run tests on every code change
- ✅ **Automatic Deployment**: Deploy to production when code is merged
- ✅ **Code Quality**: Check code style and security issues
- ✅ **Time Saving**: Automate repetitive tasks
- ✅ **Free for Public Repos**: No cost for open source projects

### Real-World Example

**Without GitHub Actions:**
```
1. Developer writes code
2. Developer manually runs tests
3. Developer manually builds the app
4. Developer manually uploads to server
5. Developer manually checks if deployment worked
```

**With GitHub Actions:**
```
1. Developer writes code
2. Developer pushes to GitHub
3. Everything else happens automatically! ✨
```

---

## Understanding the Workflow File

A workflow file is a YAML file that defines what GitHub should do automatically.

### File Location

```
.github/workflows/ci-cd.yml
```

**Why this location?**
- GitHub looks for workflows in `.github/workflows/` folder
- The file must have `.yml` or `.yaml` extension

### Basic Structure

```yaml
name: Workflow Name          # What to call this workflow

on:                          # When to run
  push:                      # Trigger type
    branches: [main]         # Which branches

jobs:                        # What to do
  job-name:                  # Name of the job
    runs-on: ubuntu-latest   # Where to run
    steps:                   # Individual tasks
      - name: Step 1         # Step description
        run: echo "Hello"    # Command to execute
```

---

## Key Concepts Explained

### 1. Triggers (`on:`)

**What it is:** Defines WHEN the workflow runs.

```yaml
on:
  push:                      # When code is pushed
    branches: [main]
  pull_request:              # When PR is opened
    branches: [main]
  schedule:                  # On a schedule
    - cron: '0 0 * * *'      # Daily at midnight
  workflow_dispatch:         # Manual trigger
```

**In our workflow:**
```yaml
on:
  push:
    branches: [main, develop]      # Run on push to main or develop
  pull_request:
    branches: [main, develop]      # Run on PR to main or develop
```

### 2. Jobs

**What it is:** A set of steps that run together. Jobs run in parallel by default.

```yaml
jobs:
  job1:                      # First job
    runs-on: ubuntu-latest
    steps:
      - run: echo "Job 1"
  
  job2:                      # Runs in parallel with job1
    runs-on: ubuntu-latest
    steps:
      - run: echo "Job 2"
```

**To make jobs run in sequence:**
```yaml
jobs:
  job1:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Job 1"
  
  job2:
    needs: job1              # Wait for job1 to finish first
    runs-on: ubuntu-latest
    steps:
      - run: echo "Job 2"
```

### 3. Steps

**What it is:** Individual tasks within a job. Steps run sequentially.

```yaml
steps:
  - name: Step 1
    run: echo "First"
  
  - name: Step 2
    run: echo "Second"        # Runs after Step 1
```

### 4. Actions (`uses:`)

**What it is:** Reusable pieces of code from GitHub Marketplace or your own repos.

```yaml
steps:
  # Using an official GitHub Action
  - name: Checkout code
    uses: actions/checkout@v4    # @ specifies version
  
  # Using a community Action
  - name: Setup Node.js
    uses: actions/setup-node@v4
    with:                        # Pass parameters to the action
      node-version: '18.x'
```

**Popular Actions:**
- `actions/checkout@v4` - Clone your repository
- `actions/setup-node@v4` - Install Node.js
- `actions/upload-artifact@v4` - Save files between jobs
- `actions/download-artifact@v4` - Retrieve saved files

---

## Hands-On Exercises

### Exercise 1: Understand the Lint Job

**Challenge:** Read the `lint` job in `ci-cd.yml` and answer:

1. What does `actions/checkout@v4` do?
2. Why do we use `npm ci` instead of `npm install`?
3. What does `continue-on-error: true` mean?
4. What happens if TypeScript check fails?

**Answers:**
1. Clones your repository so the workflow can access your code
2. `npm ci` is faster and more reliable for CI (uses package-lock.json exactly)
3. The workflow continues even if this step fails (doesn't block other jobs)
4. With `continue-on-error: true`, the workflow continues; without it, the workflow would stop

---

**Happy Learning! 🚀**

Remember: The best way to learn is by doing. Don't be afraid to experiment!
