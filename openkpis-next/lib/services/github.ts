/**
 * GitHub Service
 * Handles GitHub API operations for syncing content
 */

import { Octokit } from '@octokit/rest';

// Note: Content PRs go to GITHUB_CONTENT_REPO_NAME repository (not the app repo)
const GITHUB_OWNER = process.env.GITHUB_REPO_OWNER || 'devyendarm';
// Handle both formats: "repo-name" or "owner/repo-name"
let GITHUB_CONTENT_REPO = process.env.GITHUB_CONTENT_REPO_NAME || process.env.GITHUB_CONTENT_REPO || 'openKPIs-Content';
// If repo includes owner (e.g., "devyendarm/OpenKPIs-Content-Dev"), extract just the repo name
if (GITHUB_CONTENT_REPO.includes('/')) {
  const parts = GITHUB_CONTENT_REPO.split('/');
  GITHUB_CONTENT_REPO = parts[parts.length - 1]; // Get last part (repo name)
  console.log(`[GitHub Config] Extracted repo name from "${process.env.GITHUB_CONTENT_REPO}" → "${GITHUB_CONTENT_REPO}"`);
}

interface EntityRecord {
  id?: string;
  slug?: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[] | string;
  status?: string;
  created_by?: string;
  created_at?: string;
  formula?: string;
  industry?: string[] | string;
  priority?: string;
  core_area?: string;
  scope?: string;
  kpi_type?: string;
  aggregation_window?: string;
  ga4_implementation?: string;
  adobe_implementation?: string;
  amplitude_implementation?: string;
  data_layer_mapping?: string;
  adobe_client_data_layer?: string;
  xdm_mapping?: string;
  sql_query?: string;
  calculation_notes?: string;
  details?: string;
  last_modified_by?: string;
  last_modified_at?: string;
}

export interface GitHubSyncParams {
  tableName: 'kpis' | 'events' | 'dimensions' | 'metrics' | 'dashboards';
  record: EntityRecord;
  action: 'created' | 'edited';
  userLogin: string;
  userName?: string;
  userEmail?: string;
  contributorName?: string; // Original contributor (created_by)
  editorName?: string | null; // Editor who made the edit (last_modified_by)
  userId?: string; // User ID for token retrieval
}

/**
 * Get user's GitHub OAuth token with silent refresh if needed
 * Priority: Cookie (device-specific) > user_metadata (cross-device) > silent refresh > require reauth
 */
async function getUserOAuthTokenWithRefresh(userId?: string): Promise<{
  token: string | null;
  requiresReauth: boolean;
  error?: string;
}> {
  if (!userId) {
    return {
      token: null,
      requiresReauth: true,
      error: 'User ID required',
    };
  }

  // Import Supabase server client and cookies
  const { createClient } = await import('@/lib/supabase/server');
  const { cookies } = await import('next/headers');
  const supabase = await createClient();
  
  // Get user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user || user.id !== userId) {
    return {
      token: null,
      requiresReauth: true,
      error: 'User not authenticated',
    };
  }

  // PRIORITY 1: Try cookie first (device-specific, most recent)
  let token: string | undefined;
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get('openkpis_github_token')?.value;
    if (cookieToken && cookieToken.trim().length > 0) {
      token = cookieToken;
      console.log('[GitHub Token] Found token in cookie');
    }
  } catch (error) {
    console.warn('[GitHub Token] Could not read cookie:', error);
  }

  // PRIORITY 2: Fallback to user_metadata (cross-device support)
  if (!token) {
    token = user.user_metadata?.github_oauth_token as string | undefined;
    if (token) {
      console.log('[GitHub Token] Found token in user_metadata');
    }
  }

  if (!token) {
    return {
      token: null,
      requiresReauth: true,
      error: 'GitHub token not found. Please sign in with GitHub.',
    };
  }

  // Check expiration from user_metadata (if available)
  const expiresAt = user.user_metadata?.github_token_expires_at as string | undefined;
  const isExpired = expiresAt && new Date(expiresAt).getTime() < Date.now() + 5 * 60 * 1000;

  // PRIORITY 3: Verify token is still valid (or try silent refresh if expired)
  try {
    const octokit = new Octokit({ auth: token });
    const { data: userInfo } = await octokit.users.getAuthenticated();
    console.log('[GitHub Token] Token is valid for user:', userInfo.login);
    
    // Also verify token has repo scope by checking if we can access repos
    try {
      await octokit.repos.listForAuthenticatedUser({ per_page: 1 });
      console.log('[GitHub Token] Token has repository access');
    } catch (scopeError) {
      console.warn('[GitHub Token] Token may not have repo scope:', scopeError);
      // Don't fail here - let the commit attempt determine if repo scope is needed
    }
    
    return { token, requiresReauth: false };
  } catch (error) {
    const err = error as { status?: number; message?: string };
    console.error('[GitHub Token] Token verification failed:', {
      status: err.status,
      message: err.message,
      tokenLength: token?.length,
      tokenPrefix: token?.substring(0, 10),
    });
    
    // Token invalid or expired
    if (isExpired) {
      console.log('[GitHub Token] Token expired, attempting silent refresh...');
    } else {
      console.log('[GitHub Token] Token invalid, attempting refresh...');
    }
    
    const refreshed = await refreshGitHubTokenSilently(supabase, userId);
    
    if (refreshed) {
      console.log('[GitHub Token] Silent refresh successful');
      return { token: refreshed, requiresReauth: false };
    }
    
    // Refresh failed - need user to re-authorize
    console.warn('[GitHub Token] Token verification and refresh both failed');
    return {
      token: null,
      requiresReauth: true,
      error: isExpired 
        ? 'GitHub token expired. Please sign in again to track contributions.'
        : `GitHub token invalid (${err.status || 'unknown error'}). Please sign in again.`,
    };
  }
}

/**
 * Attempt to silently refresh GitHub token
 */
async function refreshGitHubTokenSilently(
  supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>,
  userId: string
): Promise<string | null> {
  try {
    // Check if Supabase session has refreshed token
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // Check user metadata again (Supabase may have refreshed)
      const { data: { user } } = await supabase.auth.getUser();
      const newToken = user?.user_metadata?.github_oauth_token as string | undefined;
      
      if (newToken) {
        // Verify new token works
        const octokit = new Octokit({ auth: newToken });
        await octokit.users.getAuthenticated();
        return newToken;
      }
    }
    
    // Silent refresh not possible
    return null;
  } catch (error) {
    console.error('[GitHub Token] Silent refresh failed:', error);
    return null;
  }
}

/**
 * Create commit using user's OAuth token
 */
async function commitWithUserToken(
  userToken: string,
  params: GitHubSyncParams
): Promise<{
  success: boolean;
  commit_sha?: string;
  pr_number?: number;
  pr_url?: string;
  branch?: string;
  file_path?: string;
  error?: string;
}> {
  console.log('[GitHub Sync] Using user token for commit - commits will count toward contributions');
  const octokit = new Octokit({ auth: userToken });
  
  // Verify user has repo access
  try {
    await octokit.users.getAuthenticated();
  } catch (error) {
    throw new Error('User token does not have repository access');
  }

  const yamlContent = generateYAML(params.tableName, params.record);
  const fileName = `${params.record.slug || params.record.name || params.record.id}.yml`;
  const filePath = `data-layer/${params.tableName}/${fileName}`;
  const branchName = `${params.action}-${params.tableName}-${params.record.slug}-${Date.now()}`;

  // Verify repository access before attempting operations
  console.log(`[GitHub Sync] Attempting to access repository: ${GITHUB_OWNER}/${GITHUB_CONTENT_REPO}`);
  try {
    await octokit.repos.get({
      owner: GITHUB_OWNER,
      repo: GITHUB_CONTENT_REPO,
    });
    console.log(`[GitHub Sync] Verified access to repository: ${GITHUB_OWNER}/${GITHUB_CONTENT_REPO}`);
  } catch (error) {
    const err = error as { status?: number; message?: string };
    if (err.status === 404) {
      throw new Error(`Repository not found or no access: ${GITHUB_OWNER}/${GITHUB_CONTENT_REPO}. User token may not have 'repo' scope or repository access.`);
    }
    throw new Error(`Failed to verify repository access: ${err.message || 'Unknown error'}`);
  }

  // Get main branch
  let mainRef;
  try {
    const refData = await octokit.git.getRef({
      owner: GITHUB_OWNER,
      repo: GITHUB_CONTENT_REPO,
      ref: 'heads/main',
    });
    mainRef = refData.data;
  } catch (error) {
    const err = error as { status?: number; message?: string };
    if (err.status === 404) {
      throw new Error(`Main branch not found in ${GITHUB_OWNER}/${GITHUB_CONTENT_REPO}. Repository may be empty or branch name is different.`);
    }
    throw new Error(`Failed to get main branch: ${err.message || 'Unknown error'}`);
  }

  // Create branch
  try {
    await octokit.git.createRef({
      owner: GITHUB_OWNER,
      repo: GITHUB_CONTENT_REPO,
      ref: `refs/heads/${branchName}`,
      sha: mainRef.object.sha,
    });
  } catch (error) {
    const err = error as { status?: number; message?: string };
    if (err.status === 404) {
      throw new Error(`Cannot create branch in ${GITHUB_OWNER}/${GITHUB_CONTENT_REPO}. User token may not have 'repo' scope or write access.`);
    }
    throw new Error(`Failed to create branch: ${err.message || 'Unknown error'}`);
  }

  // Check if file exists
  let existingFileSha: string | undefined;
  try {
    const { data: existingFile } = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_CONTENT_REPO,
      path: filePath,
      ref: branchName,
    });
    if (existingFile && typeof existingFile === 'object' && 'sha' in existingFile) {
      existingFileSha = existingFile.sha as string;
    }
  } catch {
    // File doesn't exist – continue
  }

  // Create/update file - commit as USER (not bot)
  const { data: commitData } = await octokit.repos.createOrUpdateFileContents({
    owner: GITHUB_OWNER,
    repo: GITHUB_CONTENT_REPO,
    path: filePath,
    message: params.action === 'created'
      ? `Add ${params.tableName.slice(0, -1)}: ${params.record.name}`
      : `Update ${params.tableName.slice(0, -1)}: ${params.record.name}`,
    content: Buffer.from(yamlContent).toString('base64'),
    branch: branchName,
    sha: existingFileSha,
    // Both author AND committer are the user - this makes it count toward contributions
    author: {
      name: params.userName || params.userLogin,
      email: params.userEmail || `${params.userLogin}@users.noreply.github.com`,
    },
    committer: {
      name: params.userName || params.userLogin,
      email: params.userEmail || `${params.userLogin}@users.noreply.github.com`,
    },
  });

  // Build PR body
  let prBody = `**Contributed by**: @${params.contributorName || params.userLogin}\n`;
  if (params.action === 'edited' && params.editorName && params.editorName !== params.contributorName) {
    prBody += `**Edited by**: @${params.editorName}\n`;
  }
  prBody += `\n**Action**: ${params.action}\n**Type**: ${params.tableName}\n\n---\n\n${params.record.description || 'No description provided.'}`;

  // Create PR
  const { data: prData } = await octokit.pulls.create({
    owner: GITHUB_OWNER,
    repo: GITHUB_CONTENT_REPO,
    title: params.action === 'created'
      ? `Add ${params.tableName.slice(0, -1)}: ${params.record.name}`
      : `Update ${params.tableName.slice(0, -1)}: ${params.record.name}`,
    head: branchName,
    base: 'main',
    body: prBody,
    maintainer_can_modify: true,
  });

  return {
    success: true,
    commit_sha: commitData.commit.sha,
    pr_number: prData.number,
    pr_url: prData.html_url,
    branch: branchName,
    file_path: filePath,
  };
}

// Bot commit function removed - user token covers 100% of contribution requirements
// If user token is unavailable, we require re-auth instead of silently using bot

export async function syncToGitHub(params: GitHubSyncParams): Promise<{
  success: boolean;
  commit_sha?: string;
  pr_number?: number;
  pr_url?: string;
  branch?: string;
  file_path?: string;
  error?: string;
  requiresReauth?: boolean;
}> {
  try {
    // PRIORITY 1: Try user token (with silent refresh if logged in)
    if (params.userId) {
      console.log('[GitHub Sync] Attempting to get user token for userId:', params.userId);
      const { token: userToken, requiresReauth, error: tokenError } = 
        await getUserOAuthTokenWithRefresh(params.userId);
      
      console.log('[GitHub Sync] Token retrieval result:', {
        hasToken: !!userToken,
        requiresReauth,
        error: tokenError,
      });
      
      if (userToken) {
        // Use user token - commits will count toward contributions
        console.log('[GitHub Sync] User token found, attempting commit with user token');
        try {
          return await commitWithUserToken(userToken, params);
        } catch (error) {
          const err = error as { message?: string; status?: number };
          console.error('[GitHub Sync] User token commit failed:', error);
          
          // If 404 (repository not found/no access), require reauth
          // This usually means token doesn't have 'repo' scope or user not a collaborator
          if (err.status === 404 || err.message?.includes('not found') || err.message?.includes('no access')) {
            console.warn('[GitHub Sync] Repository access denied (404) - user token may not have repo scope');
            return {
              success: false,
              error: err.message || 'Repository access denied. Please sign in again and grant repository permissions.',
              requiresReauth: true,
            };
          }
          
          // For authentication/authorization errors, require reauth (don't fall back to bot)
          if (err.status === 401 || err.status === 403 || err.message?.includes('Bad credentials') || err.message?.includes('token')) {
            console.warn('[GitHub Sync] User token authentication failed - requiring reauth');
            return {
              success: false,
              error: err.message || 'GitHub token invalid. Please sign in again.',
              requiresReauth: true,
            };
          }
          
          // For other errors (network, rate limit, etc.), still require reauth instead of falling back to bot
          // This ensures we don't silently use bot when user token should work
          console.warn('[GitHub Sync] User token commit error (non-404) - requiring reauth instead of bot fallback');
          return {
            success: false,
            error: err.message || 'Failed to create commit with user token. Please try again or sign in again.',
            requiresReauth: true,
          };
        }
      }
      
      // PRIORITY 2: User not logged in or token unavailable - require reauth
      // NEVER fall back to bot if userId is provided - always require reauth
      console.warn('[GitHub Sync] User token not available, requiresReauth=true:', tokenError);
      return {
        success: false,
        error: tokenError || 'GitHub authorization required. Please sign in again.',
        requiresReauth: true,
      };
    } else {
      // No userId provided - require login
      console.warn('[GitHub Sync] No userId provided');
      return {
        success: false,
        error: 'User authentication required. Please sign in with GitHub.',
        requiresReauth: true,
      };
    }
    
    // This code should never be reached now since we return early in all cases above
    // But keeping as safety net (should not use bot if userId was provided)
    console.error('[GitHub Sync] CRITICAL: Reached bot fallback when userId was provided - this should not happen!');
    return {
      success: false,
      error: 'Failed to use user token. Please sign in again.',
      requiresReauth: true,
    };
    
  } catch (error: unknown) {
    console.error('[GitHub Sync] Unexpected error in syncToGitHub:', error);
    const err = error as { message?: string };
    
    // NEVER use bot - always require reauth if there's an error
    // User contributions are the priority, not silent bot fallback
    console.warn('[GitHub Sync] Error occurred - requiring reauth (no bot fallback)');
    return {
      success: false,
      error: err.message || 'Failed to sync to GitHub. Please sign in again.',
      requiresReauth: true,
    };
  }
}

// resolvePrivateKey() removed - no longer needed since bot commits are removed

function generateYAML(tableName: string, record: EntityRecord): string {
  const timestamp = new Date().toISOString();
  
  // Helper to format multi-line text fields
  const formatMultiline = (value: string | undefined | null): string => {
    if (!value) return '';
    return ` |\n  ${value.split('\n').join('\n  ')}`;
  };
  
  // Helper to format array fields
  const formatArray = (value: string[] | string | undefined | null): string => {
    if (!value) return '';
    if (Array.isArray(value)) {
      return value.length > 0 ? `[${value.join(', ')}]` : '';
    }
    if (typeof value === 'string' && value.trim().length > 0) {
      return `[${value.trim()}]`;
    }
    return '';
  };
  
  // Helper to format optional field
  const formatField = (label: string, value: string | undefined | null, multiline = false): string => {
    if (!value || (typeof value === 'string' && value.trim().length === 0)) return '';
    if (multiline) {
      return `${label}:${formatMultiline(value)}\n`;
    }
    return `${label}: ${value}\n`;
  };
  
  if (tableName === 'kpis') {
    const industryStr = formatArray(record.industry);
    const tagsStr = formatArray(record.tags);
    
    return `# KPI: ${record.name}
# Generated: ${timestamp}
# Contributed by: ${record.created_by || 'unknown'}
${record.last_modified_by ? `# Last modified by: ${record.last_modified_by}` : ''}

KPI Name: ${record.name}
${formatField('Formula', record.formula)}
${formatField('Description', record.description, true)}
${formatField('Category', record.category)}
${tagsStr ? `Tags: ${tagsStr}\n` : ''}
${industryStr ? `Industry: ${industryStr}\n` : ''}
${formatField('Priority', record.priority)}
${formatField('Core Area', record.core_area)}
${formatField('Scope', record.scope)}
${formatField('KPI Type', record.kpi_type)}
${formatField('Aggregation Window', record.aggregation_window)}
${formatField('GA4 Implementation', record.ga4_implementation, true)}
${formatField('Adobe Implementation', record.adobe_implementation, true)}
${formatField('Amplitude Implementation', record.amplitude_implementation, true)}
${formatField('Data Layer Mapping', record.data_layer_mapping, true)}
${formatField('Adobe Client Data Layer', record.adobe_client_data_layer, true)}
${formatField('XDM Mapping', record.xdm_mapping, true)}
${formatField('SQL Query', record.sql_query, true)}
${formatField('Calculation Notes', record.calculation_notes, true)}
${formatField('Details', record.details, true)}
${formatField('Status', record.status)}
${formatField('Contributed By', record.created_by)}
${formatField('Created At', record.created_at)}
${formatField('Last Modified By', record.last_modified_by)}
${formatField('Last Modified At', record.last_modified_at)}
`;
  }
  
  if (tableName === 'events') {
    const tagsStr = formatArray(record.tags);
    
    return `# Event: ${record.name}
# Generated: ${timestamp}
# Contributed by: ${record.created_by || 'unknown'}
${record.last_modified_by ? `# Last modified by: ${record.last_modified_by}` : ''}

Event Name: ${record.name}
${formatField('Description', record.description, true)}
${formatField('Category', record.category)}
${tagsStr ? `Tags: ${tagsStr}\n` : ''}
${formatField('Status', record.status)}
${formatField('Contributed By', record.created_by)}
${formatField('Created At', record.created_at)}
${formatField('Last Modified By', record.last_modified_by)}
${formatField('Last Modified At', record.last_modified_at)}
`;
  }

  if (tableName === 'dimensions') {
    const tagsStr = formatArray(record.tags);
    
    return `# Dimension: ${record.name}
# Generated: ${timestamp}
# Contributed by: ${record.created_by || 'unknown'}
${record.last_modified_by ? `# Last modified by: ${record.last_modified_by}` : ''}

Dimension Name: ${record.name}
${formatField('Description', record.description, true)}
${formatField('Category', record.category)}
${tagsStr ? `Tags: ${tagsStr}\n` : ''}
${formatField('Status', record.status)}
${formatField('Contributed By', record.created_by)}
${formatField('Created At', record.created_at)}
${formatField('Last Modified By', record.last_modified_by)}
${formatField('Last Modified At', record.last_modified_at)}
`;
  }

  if (tableName === 'metrics') {
    const tagsStr = formatArray(record.tags);
    
    return `# Metric: ${record.name}
# Generated: ${timestamp}
# Contributed by: ${record.created_by || 'unknown'}
${record.last_modified_by ? `# Last modified by: ${record.last_modified_by}` : ''}

Metric Name: ${record.name}
${formatField('Formula', record.formula)}
${formatField('Description', record.description, true)}
${formatField('Category', record.category)}
${tagsStr ? `Tags: ${tagsStr}\n` : ''}
${formatField('Status', record.status)}
${formatField('Contributed By', record.created_by)}
${formatField('Created At', record.created_at)}
${formatField('Last Modified By', record.last_modified_by)}
${formatField('Last Modified At', record.last_modified_at)}
`;
  }

  if (tableName === 'dashboards') {
    const tagsStr = formatArray(record.tags);
    
    return `# Dashboard: ${record.name}
# Generated: ${timestamp}
# Contributed by: ${record.created_by || 'unknown'}
${record.last_modified_by ? `# Last modified by: ${record.last_modified_by}` : ''}

Dashboard Name: ${record.name}
${formatField('Description', record.description, true)}
${formatField('Category', record.category)}
${tagsStr ? `Tags: ${tagsStr}\n` : ''}
${formatField('Status', record.status)}
${formatField('Contributed By', record.created_by)}
${formatField('Created At', record.created_at)}
${formatField('Last Modified By', record.last_modified_by)}
${formatField('Last Modified At', record.last_modified_at)}
`;
  }

  return '';
}
