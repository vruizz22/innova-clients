// Placeholder DB types. Overwritten by the Supabase codegen (Round 2):
//   pnpm dlx supabase@latest gen types typescript --project-id <ID> \
//     > packages/supabase/src/database.types.ts
// Keep this fallback so the package type-checks before codegen runs.
export type Database = Record<string, never>;
