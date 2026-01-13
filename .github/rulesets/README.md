# Branch Protection Configuration

This directory contains GitHub repository rulesets that configure branch protection rules for the OWASP-AIMA-Gantt repository.

## Overview

The `protect-main-branch.json` ruleset ensures that the main branch is protected from direct pushes by requiring all changes to go through pull requests.

## What This Ruleset Does

The main branch protection ruleset includes the following rules:

1. **Prevents Branch Deletion**: The main branch cannot be deleted
2. **Prevents Force Pushes**: No force push or non-fast-forward updates are allowed
3. **Requires Pull Requests**: All changes to the main branch must go through a pull request
   - Requires at least 1 approving review before merging
   - Does not require code owner review (can be adjusted if needed)
   - Does not dismiss stale reviews on new pushes (can be adjusted if needed)

## How to Apply This Ruleset

Since GitHub rulesets are managed through the GitHub UI or API (not as files in the repository), follow these steps to apply the ruleset:

### Option 1: Import via GitHub UI (Recommended)

1. Navigate to your repository on GitHub
2. Go to **Settings** > **Rules** > **Rulesets**
3. Click **New ruleset** > **Import a ruleset**
4. Browse and select the `protect-main-branch.json` file from `.github/rulesets/`
5. Review the imported settings
6. Click **Create** to activate the ruleset

### Option 2: Create Manually via GitHub UI

1. Navigate to your repository on GitHub
2. Go to **Settings** > **Rules** > **Rulesets**
3. Click **New ruleset** > **New branch ruleset**
4. Configure the following:
   - **Ruleset Name**: Protect Main Branch
   - **Enforcement status**: Active
   - **Target branches**: Default branch (main)
   - **Rules**:
     - ✅ Restrict deletions
     - ✅ Block force pushes
     - ✅ Require a pull request before merging
       - Required approvals: 1
5. Save the ruleset

### Option 3: Apply via GitHub API

You can also apply this ruleset programmatically using the GitHub REST API:

```bash
# Replace {owner}, {repo}, and {token} with your values
curl -X POST \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/{owner}/{repo}/rulesets \
  -d @.github/rulesets/protect-main-branch.json
```

## Customizing the Ruleset

You can customize the ruleset by editing the JSON file before importing:

- **Increase required reviews**: Change `"required_approving_review_count": 1` to a higher number
- **Require code owner reviews**: Set `"require_code_owner_review": true`
- **Dismiss stale reviews**: Set `"dismiss_stale_reviews_on_push": true`
- **Require last push approval**: Set `"require_last_push_approval": true` to require re-approval after new pushes

## Bypass Actors

The ruleset includes a bypass configuration that allows repository administrators to bypass these rules in emergency situations. This is configured with:
- `actor_type`: "RepositoryRole"
- `actor_id`: 5 (Repository Admin)
- `bypass_mode`: "always"

You can adjust this to be more restrictive or remove it entirely if desired.

## Verification

After applying the ruleset:

1. Try to push directly to the main branch - it should be rejected
2. Create a pull request - it should be required to merge changes
3. Verify that the ruleset appears in **Settings** > **Rules** > **Rulesets** as "Active"

## Additional Resources

- [GitHub Docs: About rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [GitHub Docs: Creating rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository)
- [GitHub Docs: Available rules for rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)
- [GitHub Ruleset Recipes](https://github.com/github/ruleset-recipes)
