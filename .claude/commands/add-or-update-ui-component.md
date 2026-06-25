---
name: add-or-update-ui-component
description: Workflow command scaffold for add-or-update-ui-component in innova-clients.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-update-ui-component

Use this workflow when working on **add-or-update-ui-component** in `innova-clients`.

## Goal

Adds or updates a UI component in the shared UI library, including implementation, style tokens, and index exports.

## Common Files

- `packages/ui-components/src/components/*.tsx`
- `packages/ui-components/src/index.ts`
- `packages/ui-components/src/tokens.css`
- `packages/ui-components/package.json`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or modify component file in packages/ui-components/src/components/
- Update packages/ui-components/src/index.ts to export the new/updated component
- Optionally update packages/ui-components/src/tokens.css for new tokens or styles
- Optionally update packages/ui-components/package.json if dependencies/scripts change

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.