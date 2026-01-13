# How to Apply Branch Protection to Main Branch

This repository now includes a pre-configured branch protection ruleset that will prevent direct pushes to the main branch and require all changes to go through pull requests.

## Quick Start (3 Steps)

### Step 1: Navigate to Repository Settings
1. Go to https://github.com/bollese2/OWASP-AIMA-Gantt
2. Click on **Settings** tab
3. In the left sidebar, click **Rules** > **Rulesets**

### Step 2: Import the Ruleset
1. Click **New ruleset** dropdown
2. Select **Import a ruleset**
3. Click **Browse** and navigate to `.github/rulesets/protect-main-branch.json` in this repository
4. Alternatively, you can copy the contents from: [protect-main-branch.json](.github/rulesets/protect-main-branch.json)

### Step 3: Review and Activate
1. Review the imported settings:
   - ✅ Blocks direct pushes to main
   - ✅ Prevents force pushes
   - ✅ Prevents branch deletion
   - ✅ Requires pull requests with 1 approval
2. Click **Create** to activate the ruleset

## What This Protects Against

Once activated, the main branch will be protected from:
- Direct commits (must use pull requests)
- Force pushes (prevents rewriting history)
- Branch deletion (prevents accidental removal)

## Workflow After Protection

After enabling branch protection, the development workflow becomes:

1. Create a new branch: `git checkout -b feature/my-feature`
2. Make your changes and commit them
3. Push your branch: `git push origin feature/my-feature`
4. Create a pull request on GitHub
5. Get at least 1 approval from a reviewer
6. Merge the pull request to main

## Need Help?

For detailed documentation, see [.github/rulesets/README.md](.github/rulesets/README.md)

For GitHub documentation, visit: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets
