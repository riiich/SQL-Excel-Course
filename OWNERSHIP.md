# Ownership and permission policy

This is a proprietary, all-rights-reserved project owned and controlled by
`riiich`. Repository access does not transfer ownership or grant a license.

## Default rule

No one other than the owner is authorized to modify, publish, distribute,
deploy, sublicense, sell, or create derivative works from this project.
Cloning, downloading, viewing, forking, discussing, or testing the project does
not create permission.

## How the owner may grant permission

An exception exists only when the owner gives prior, explicit written
permission. A valid permission must state:

- the person or entity receiving permission;
- the files, branches, or portions of the project covered;
- the actions allowed, such as local modification, pull-request submission,
  deployment, or redistribution;
- the permitted purpose and any conditions;
- the start date and expiration date, if applicable.

Permission for one action does not imply another. For example, permission to
edit a local clone does not include permission to push to the official
repository, and permission to submit a pull request does not include permission
to merge it.

The owner must separately approve every change before it becomes part of the
official project. Unauthorized changes are not accepted and do not alter the
ownership of the official project.

## Repository controls

The official remote repository must remain private unless the owner explicitly
decides otherwise. Only the owner should have administrative or write access by
default. Any temporary access must match a written permission and should be
removed when that permission ends.

The default branch should be protected so that:

- every change is committed on a non-default branch and submitted through a
  pull request;
- direct pushes, force pushes, and default-branch deletion are restricted;
- the owner is the required code owner and must approve every change authored
  by another person;
- required checks pass before merge;
- only the owner may bypass the rules.

GitHub does not allow a pull-request author to approve their own PR. For a PR
authored by the owner, the owner must still use a branch and PR, review the final
diff and checks, and use the sole-owner bypass to merge. No other account may
receive bypass access.

The importable ruleset and activation instructions are stored in
`.github/rulesets/owner-reviewed-prs.json` and
`.github/REPOSITORY_SETUP.md`.

## Third-party components

Dependencies and other third-party material remain governed by their own
licenses. The owner claims ownership only over the project's original material
and any rights lawfully assigned to the owner.

See [LICENSE](LICENSE) for the controlling project license terms.
