```markdown
# innova-clients Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches the core development patterns, coding conventions, and collaborative workflows used in the `innova-clients` TypeScript monorepo. The repository is organized into packages and apps, supporting a multi-role web platform (student, teacher, admin, parent) with shared UI components, API clients, and utilities. The codebase emphasizes modularity, conventional commits, and reusable design system assets.

## Coding Conventions

### File Naming

- **Files:** Use `camelCase` for file names.
  - Example: `mathInput.ts`, `userProfile.test.ts`
- **Directories:** Use lowercase with hyphens if needed.
  - Example: `ui-components/`, `api-client/`

### Import Style

- Use **alias imports** for internal modules.
  ```typescript
  import { Button } from '@ui-components';
  import { fetchUser } from '@api-client';
  ```

### Export Style

- **Mixed exports**: Both named and default exports are used.
  ```typescript
  // Named export
  export function calculateSum(a: number, b: number): number {
    return a + b;
  }

  // Default export
  export default MyComponent;
  ```

### Commit Messages

- Use **Conventional Commits** with these prefixes:
  - `feat`: New feature
  - `refactor`: Code refactoring
  - `docs`: Documentation changes
  - `chore`: Maintenance or tooling
- Example:
  ```
  feat(ui): add Avatar component
  refactor(api-client): simplify fetch logic
  docs: update deployment instructions
  ```

## Workflows

### Add or Update UI Component

**Trigger:** When adding or updating a reusable UI component in the shared library.  
**Command:** `/add-ui-component`

1. Create or modify the component file in `packages/ui-components/src/components/`.
   ```tsx
   // packages/ui-components/src/components/MyButton.tsx
   export function MyButton(props) { /* ... */ }
   ```
2. Update `packages/ui-components/src/index.ts` to export the new/updated component.
   ```typescript
   export * from './components/MyButton';
   ```
3. Optionally update `packages/ui-components/src/tokens.css` for new style tokens.
4. Optionally update `packages/ui-components/package.json` if dependencies or scripts change.

### Add or Update API Client Endpoint

**Trigger:** When adding or updating an API endpoint in the client library.  
**Command:** `/add-api-endpoint`

1. Create or modify the endpoint file in `packages/api-client/src/`.
   ```typescript
   // packages/api-client/src/getUser.ts
   export async function getUser(id: string) { /* ... */ }
   ```
2. Update `packages/api-client/src/schemas.ts` if new types are needed.
   ```typescript
   export interface User { id: string; name: string; }
   ```
3. Update `packages/api-client/src/index.ts` if needed.
   ```typescript
   export * from './getUser';
   ```
4. Optionally add or update tests for the endpoint.
   ```typescript
   // packages/api-client/src/getUser.test.ts
   import { getUser } from './getUser';
   import { describe, it, expect } from 'vitest';
   ```

### Design System Bundle Sync or Copy

**Trigger:** When updating public-facing design system assets after changes.  
**Command:** `/sync-design-system`

1. Copy or update files from `SuperProfes-Design-System/` to `landing/public/design-system/`.
2. Optionally update copy scripts in `landing/scripts/copy-design-system.js`.
3. Optionally update documentation or README.

### Feature Development Across Multiple Apps

**Trigger:** When implementing a new feature or flow across several user roles or app sections.  
**Command:** `/new-feature`

1. Create or update app route files in `apps/web/app/(role)/feature/page.tsx`.
2. Create or update supporting components in `apps/web/components/`.
3. Update or add shared libraries in `apps/web/lib/` if needed.
4. Optionally update the design system or API client for new UI/API needs.

### Add or Update Shared Library

**Trigger:** When adding or updating a shared utility library.  
**Command:** `/update-shared-lib`

1. Create or modify implementation files in `packages/<lib>/src/`.
2. Update types in `packages/<lib>/src/types.ts` if needed.
3. Update `packages/<lib>/package.json` if dependencies or scripts change.
4. Optionally add or update codegen scripts or tests.

### Add or Update Deployment or CI Config

**Trigger:** When changing deployment targets, CI steps, or adding new environments.  
**Command:** `/update-ci`

1. Modify or add `.github/workflows/*.yml` for CI/CD.
2. Update `docs/DEPLOY_*.md` for deployment instructions.
3. Optionally update `pnpm-lock.yaml` or `turbo.json` for monorepo build changes.

## Testing Patterns

- **Framework:** [vitest](https://vitest.dev/)
- **Test files:** Named with `.test.ts` suffix, placed alongside source files.
  ```typescript
  // packages/api-client/src/getUser.test.ts
  import { describe, it, expect } from 'vitest';
  import { getUser } from './getUser';

  describe('getUser', () => {
    it('fetches a user by id', async () => {
      const user = await getUser('123');
      expect(user).toHaveProperty('id', '123');
    });
  });
  ```
- **Test structure:** Use `describe` and `it` blocks for organization.

## Commands

| Command              | Purpose                                                        |
|----------------------|----------------------------------------------------------------|
| /add-ui-component    | Add or update a reusable UI component in the shared library    |
| /add-api-endpoint    | Add or update an API client endpoint                           |
| /sync-design-system  | Sync or copy design system assets to public directories        |
| /new-feature         | Implement a new feature across multiple app areas              |
| /update-shared-lib   | Add or update a shared utility library                         |
| /update-ci           | Add or update deployment or CI/CD configuration                |
```