/**
 * Supabase exports - CLIENT-SIDE ONLY
 * 
 * For client components, use:
 * - `supabase` - browser client
 * - Auth functions from './auth'
 * 
 * For server components/API routes, import directly from './server':
 * - `createClient()` from '@/lib/supabase/server'
 * - `createAdminClient()` from '@/lib/supabase/server'
 */

export { supabase } from './client';
export * from './auth';

// DO NOT export server functions here - they use next/headers which is server-only
// Import server functions directly: import { createClient } from '@/lib/supabase/server'

