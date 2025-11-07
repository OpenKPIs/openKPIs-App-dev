/** @type {import('next').NextConfig} */

const fs = require('fs');
const path = require('path');

/**
 * Load environment variables from .Credentials.txt
 * This ensures credentials are read directly from the source file
 * 
 * On Vercel, environment variables are set directly via Vercel Dashboard,
 * so we skip file loading to avoid filesystem errors.
 */
function loadCredentials() {
  // On Vercel, environment variables are set directly
  // Skip file loading to avoid filesystem errors (Vercel has read-only filesystem)
  if (process.env.VERCEL) {
    console.log('✅ Running on Vercel - using environment variables from Vercel Dashboard');
    return {};
  }
  
  // Local development: try to load from file
  const credentialsPath = path.join(__dirname, '../credentials/.Credentials.txt');
  
  try {
    if (!fs.existsSync(credentialsPath)) {
      console.warn('⚠️  .Credentials.txt not found at:', credentialsPath);
      console.warn('⚠️  Using environment variables from process.env instead');
      return {};
    }

    const fileContent = fs.readFileSync(credentialsPath, 'utf8');
    const envVars = {};
    
    // Parse the credentials file
    const lines = fileContent.split('\n');
    let i = 0;
    
    while (i < lines.length) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Skip comments and empty lines
      if (!trimmedLine || trimmedLine.startsWith('#') || trimmedLine.startsWith('//')) {
        i++;
        continue;
      }
      
      // Parse KEY=VALUE format
      const match = trimmedLine.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.+)$/);
      if (match) {
        const key = match[1];
        let value = match[2].trim();
        
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        
        // Handle multi-line values (like RSA private keys)
        if (value.includes('-----BEGIN') && !value.includes('-----END')) {
          // Multi-line value starting on this line, collect until END marker
          let fullValue = value;
          i++;
          while (i < lines.length && !lines[i].includes('-----END')) {
            fullValue += '\n' + lines[i];
            i++;
          }
          // Include the END line
          if (i < lines.length) {
            fullValue += '\n' + lines[i];
          }
          value = fullValue;
        }
        
        envVars[key] = value;
      }
      
      i++;
    }
    
    console.log('✅ Loaded', Object.keys(envVars).length, 'environment variables from .Credentials.txt');
    return envVars;
  } catch (error) {
    console.error('❌ Error loading credentials file:', error.message);
    console.warn('⚠️  Falling back to process.env (this is normal on Vercel)');
    return {};
  }
}

// Load credentials from .Credentials.txt
const credentials = loadCredentials();

// Merge with process.env (process.env takes precedence for overrides)
const envVars = {
  ...credentials,
  ...process.env, // Allow process.env to override
};

const nextConfig = {
  reactStrictMode: true,
  
  // Images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },

  // Environment Variables - Loaded directly from .Credentials.txt
  // These are available via process.env in both server and client code
  // For client-side access, variables must be prefixed with NEXT_PUBLIC_
  env: {
    // Server-side only (not exposed to client)
    OPENAI_API_KEY: envVars.OPENAI_API_KEY,
    OPENAI_MODEL: envVars.OPENAI_MODEL,
    OPENAI_ORG_ID: envVars.OPENAI_ORG_ID,
    OPENAI_SERVICE_TIER: envVars.OPENAI_SERVICE_TIER,
    
    // Supabase DEV
    NEXT_PUBLIC_SUPABASE_URL_DEV: envVars.NEXT_PUBLIC_SUPABASE_URL_DEV,
    NEXT_PUBLIC_SUPABASE_ANON_KEY_DEV: envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY_DEV,
    SUPABASE_SERVICE_ROLE_KEY_DEV: envVars.SUPABASE_SERVICE_ROLE_KEY_DEV,
    
    // Supabase PROD
    NEXT_PUBLIC_SUPABASE_URL: envVars.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: envVars.SUPABASE_SERVICE_ROLE_KEY,
    
    // GitHub
    GITHUB_REPO_OWNER: envVars.GITHUB_REPO_OWNER,
    GITHUB_CONTENT_REPO: envVars.GITHUB_CONTENT_REPO,
    GITHUB_CONTENT_REPO_NAME: envVars.GITHUB_CONTENT_REPO_NAME,
    GITHUB_TOKEN: envVars.GITHUB_TOKEN,
    GITHUB_TOKEN_DEV: envVars.GITHUB_TOKEN_DEV,
    GITHUB_APP_ID: envVars.GITHUB_APP_ID,
    GITHUB_APP_ID_DEV: envVars.GITHUB_APP_ID_DEV,
    GITHUB_APP_PRIVATE_KEY: envVars.GITHUB_APP_PRIVATE_KEY,
    GITHUB_APP_PRIVATE_KEY_DEV: envVars.GITHUB_APP_PRIVATE_KEY_DEV,
    GITHUB_INSTALLATION_ID: envVars.GITHUB_INSTALLATION_ID,
    GITHUB_INSTALLATION_ID_DEV: envVars.GITHUB_INSTALLATION_ID_DEV,
    GITHUB_WEBHOOK_SECRET: envVars.GITHUB_WEBHOOK_SECRET,
    
    // AI Provider
    AI_PROVIDER: envVars.AI_PROVIDER || 'openai',
    
    // Analytics
    NEXT_PUBLIC_GTM_ID: envVars.NEXT_PUBLIC_GTM_ID,
    SENTRY_DSN: envVars.SENTRY_DSN,
    SENTRY_ENVIRONMENT: envVars.SENTRY_ENVIRONMENT,
    
    // App Configuration
    NEXT_PUBLIC_APP_URL: envVars.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_URL_PROD: envVars.NEXT_PUBLIC_APP_URL_PROD,
    NEXT_PUBLIC_BASE_URL: envVars.NEXT_PUBLIC_BASE_URL,
    
    // Feature Flags
    NEXT_PUBLIC_ENABLE_AI_FEATURES: envVars.NEXT_PUBLIC_ENABLE_AI_FEATURES,
    NEXT_PUBLIC_ENABLE_GISCUS: envVars.NEXT_PUBLIC_ENABLE_GISCUS,
    
    // Session & Admin
    SESSION_SECRET: envVars.SESSION_SECRET,
    ADMIN_USER_IDS: envVars.ADMIN_USER_IDS,
    EDITOR_USER_IDS: envVars.EDITOR_USER_IDS,
  },

  // Turbopack Configuration
  experimental: {
    turbo: {
      // Turbopack will use env vars from the env object above
    },
  },
};

module.exports = nextConfig;
