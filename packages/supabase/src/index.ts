export type { Database } from './database.types';
export {
  APP_ROLES,
  ROLE_HOME,
  getUserRole,
  getUserDisplayName,
  getUserInitials,
  isAppRole,
  roleHome,
  type AppRole,
} from './types';

// Client/server/middleware factories are exported from their own subpaths to keep
// 'use client' / next/headers / next/server boundaries clean:
//   import { createClient } from '@innova/supabase/client'   (browser)
//   import { createClient } from '@innova/supabase/server'   (server)
//   import { updateSession } from '@innova/supabase/middleware'
