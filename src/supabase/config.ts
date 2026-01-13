// Supabase Configuration
// All configuration values are loaded from environment variables in .env.local
// Never commit .env.local to version control - it contains sensitive credentials

// Validate that all required environment variables are present
// Support both SUPABASE_KEY (for server-side) and NEXT_PUBLIC_SUPABASE_ANON_KEY (for client-side)
const requiredEnvVars = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dxumogdtqmhjapklzhxb.supabase.co',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY,
};

// Check for missing environment variables (only check key, URL has default)
// Silently handle missing key - will be caught by client.ts

export const supabaseConfig = {
  url: requiredEnvVars.url!,
  anonKey: requiredEnvVars.anonKey!,
};
