/**
 * Application Configuration
 */

export const config = {
  // Application URLs
  appUrl: {
    dev: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    prod: process.env.NEXT_PUBLIC_APP_URL_PROD || 'https://openkpis.org',
  },
  
  // Base URL
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || '/OpenKPIs',
  
  // GitHub
  github: {
    repoOwner: process.env.GITHUB_REPO_OWNER || 'devyendarm',
    contentRepo: process.env.GITHUB_CONTENT_REPO_NAME || 'openKPIs-Content',
    appRepo: process.env.GITHUB_APP_REPO_NAME || 'openKPIs-App',
    contentRepoFull: `${process.env.GITHUB_REPO_OWNER || 'devyendarm'}/${process.env.GITHUB_CONTENT_REPO_NAME || 'openKPIs-Content'}`,
    appRepoFull: `${process.env.GITHUB_REPO_OWNER || 'devyendarm'}/${process.env.GITHUB_APP_REPO_NAME || 'openKPIs-App'}`,
  },
  
  // Feature Flags
  features: {
    aiEnabled: process.env.NEXT_PUBLIC_ENABLE_AI_FEATURES === 'true',
    giscusEnabled: process.env.NEXT_PUBLIC_ENABLE_GISCUS === 'true',
    commentsEnabled: process.env.NEXT_PUBLIC_ENABLE_COMMENTS === 'true',
    experimental: process.env.NEXT_PUBLIC_ENABLE_EXPERIMENTAL === 'true',
  },
  
  // Admin/Editor IDs
  adminUserIds: (process.env.ADMIN_USER_IDS || 'devyendarm').split(',').map(id => id.trim()),
  editorUserIds: (process.env.EDITOR_USER_IDS || '').split(',').filter(Boolean).map(id => id.trim()),
  
  // Environment
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
} as const;

