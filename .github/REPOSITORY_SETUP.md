# Required GitHub repository controls

The policy files in this repository do not activate GitHub branch protection by
themselves. The owner must apply these controls to the official remote before
granting anyone repository access.

## Activate the ruleset

1. Keep the repository private.
2. Open **Settings → Rules → Rulesets**.
3. Select **New ruleset → Import a ruleset**.
4. Import `.github/rulesets/owner-reviewed-prs.json`.
5. Confirm that the target is the default branch and enforcement is active.
6. Add only `@riiich` (or the repository-owner/admin role containing only that
   account) to the bypass list. This bypass is needed for owner-authored pull
   requests because GitHub does not allow authors to approve their own PRs.
7. Do not add collaborators unless the owner has granted explicit written
   permission.

## Required behavior

For changes authored by anyone other than the owner, the ruleset requires:

- a pull request instead of a direct default-branch push;
- one approving review;
- approval from the code owner defined in `.github/CODEOWNERS`;
- dismissal of approval whenever new commits change the PR;
- resolution of every review conversation;
- protection against force pushes and default-branch deletion.

The owner must inspect the final diff and submit the approving review. No other
review substitutes for owner approval.

## Owner-authored changes

GitHub prohibits pull-request authors from approving their own PRs. The owner
must still create a branch and PR, inspect the final diff and checks, and then
use the sole-owner bypass to merge. No other account should receive bypass
access.

## Access audit

Before and after granting temporary permission, review **Settings →
Collaborators and teams** (or **Manage access**) and confirm that no unintended
account, team, deploy key, GitHub App, or automation has write or admin access.
Remove temporary access when its written permission expires.
