/**
 * GitHub Service
 * Handles GitHub API operations for syncing content
 */

import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';

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
  let isExpired = false;
  if (expiresAt) {
    try {
      const expiryTime = new Date(expiresAt).getTime();
      // Check if date is valid (not NaN)
      if (!isNaN(expiryTime)) {
        isExpired = expiryTime < Date.now() + 5 * 60 * 1000; // 5 minute buffer
      }
    } catch (dateError) {
      console.warn('[GitHub Token] Invalid expiration date format:', expiresAt);
      // If date parsing fails, assume not expired and let token verification handle it
    }
  }

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
  
  // Validate required parameters
  if (!params.userLogin) {
    throw new Error('userLogin is required for GitHub sync');
  }
  if (!params.record.name) {
    throw new Error('record.name is required for GitHub sync');
  }
  
  // Verify user has repo access
  try {
    await octokit.users.getAuthenticated();
  } catch (error) {
    throw new Error('User token does not have repository access');
  }

  // Generate YAML content - validate it's not empty
  const yamlContent = generateYAML(params.tableName, params.record);
  if (!yamlContent || yamlContent.trim().length === 0) {
    throw new Error(`Failed to generate YAML content for ${params.tableName}. Invalid table name or record data.`);
  }
  
  const fileName = `${params.record.slug || params.record.name || params.record.id || 'untitled'}.yml`;
  const filePath = `data-layer/${params.tableName}/${fileName}`;
  // Use slug, name, or id for branch name - ensure at least one exists
  const branchIdentifier = params.record.slug || params.record.name || params.record.id || 'untitled';
  const branchName = `${params.action}-${params.tableName}-${branchIdentifier}-${Date.now()}`;

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

  // GITHUB-SUPPORTED APPROACH FOR ORGANIZATION REPOSITORIES:
  // In org repos, users with 'repo' scope CANNOT create branches unless they are collaborators.
  // The GitHub-supported solution is:
  // 1. Use GitHub App to create branch AND commit (has org write access)
  // 2. Set author/committer to USER (not App) - GitHub counts this as user contribution
  // 3. GitHub counts contributions based on author email matching user's verified email
  
  const appId = process.env.GITHUB_APP_ID;
  const installationIdStr = process.env.GITHUB_INSTALLATION_ID;
  const b64Key = process.env.GITHUB_APP_PRIVATE_KEY_B64;
  
  if (!appId || !installationIdStr || !b64Key) {
    throw new Error('GitHub App credentials not configured. Cannot create branch in organization repository.');
  }

  // Create GitHub App client
  let privateKey: string;
  try {
    const key = Buffer.from(b64Key.trim(), 'base64').toString('utf8');
    if (key.includes('BEGIN') && key.includes('END')) {
      privateKey = key.replace(/\r\n/g, '\n');
    } else {
      throw new Error('Invalid private key format');
    }
  } catch (error) {
    throw new Error('Failed to decode GitHub App private key');
  }

  // Validate and parse numeric IDs
  const appIdNum = Number(appId);
  const installationIdNum = parseInt(installationIdStr, 10);
  
  if (isNaN(appIdNum) || appIdNum <= 0) {
    throw new Error(`Invalid GITHUB_APP_ID: ${appId}. Must be a positive number.`);
  }
  if (isNaN(installationIdNum) || installationIdNum <= 0) {
    throw new Error(`Invalid GITHUB_INSTALLATION_ID: ${installationIdStr}. Must be a positive number.`);
  }

  const appOctokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: appIdNum,
      privateKey,
      installationId: installationIdNum,
    },
  });

  // Get main branch using App (has org access)
  let mainRef;
  try {
    const refData = await appOctokit.git.getRef({
      owner: GITHUB_OWNER,
      repo: GITHUB_CONTENT_REPO,
      ref: 'heads/main',
    });
    mainRef = refData.data;
    
    // Validate mainRef structure
    if (!mainRef || !mainRef.object || !mainRef.object.sha) {
      throw new Error(`Invalid main branch structure in ${GITHUB_OWNER}/${GITHUB_CONTENT_REPO}`);
    }
  } catch (error) {
    const err = error as { status?: number; message?: string };
    if (err.status === 404) {
      throw new Error(`Main branch not found in ${GITHUB_OWNER}/${GITHUB_CONTENT_REPO}. Repository may be empty or branch name is different.`);
    }
    throw new Error(`Failed to get main branch: ${err.message || 'Unknown error'}`);
  }

  // Create branch using App (has org write access)
  try {
    await appOctokit.git.createRef({
      owner: GITHUB_OWNER,
      repo: GITHUB_CONTENT_REPO,
      ref: `refs/heads/${branchName}`,
      sha: mainRef.object.sha,
    });
    console.log(`[GitHub Sync] Branch created using GitHub App: ${branchName}`);
  } catch (error) {
    const err = error as { status?: number; message?: string };
    // Check if branch already exists (422 error)
    if (err.status === 422 || err.message?.includes('already exists')) {
      console.warn(`[GitHub Sync] Branch ${branchName} already exists, continuing with commit`);
    } else {
      throw new Error(`Failed to create branch: ${err.message || 'Unknown error'}`);
    }
  }

  // Check if file exists (using App)
  let existingFileSha: string | undefined;
  try {
    const { data: existingFile } = await appOctokit.repos.getContent({
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

  // CRITICAL: Use App to commit BUT set author/committer to USER
  // This is the GitHub-supported approach for user contributions in org repos
  // GitHub counts contributions based on author email matching user's verified email
  const authorName = params.userName || params.userLogin || 'Unknown User';
  
  // Email priority: verified email > GitHub noreply format > fallback
  // GitHub noreply format (username@users.noreply.github.com) counts if user has ANY verified email
  const authorEmail = params.userEmail || `${params.userLogin || 'unknown'}@users.noreply.github.com`;
  
  console.log('[GitHub Sync] Using author email for contributions:', {
    email: authorEmail,
    isVerified: !!params.userEmail && params.userEmail !== `${params.userLogin}@users.noreply.github.com`,
    isNoreply: authorEmail.endsWith('@users.noreply.github.com'),
  });
  
  let commitData;
  try {
    const commitResponse = await appOctokit.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_CONTENT_REPO,
      path: filePath,
      message: params.action === 'created'
        ? `Add ${params.tableName.slice(0, -1)}: ${params.record.name}`
        : `Update ${params.tableName.slice(0, -1)}: ${params.record.name}`,
      content: Buffer.from(yamlContent).toString('base64'),
      branch: branchName,
      sha: existingFileSha,
      // CRITICAL: Set author/committer to USER (not App)
      // GitHub counts contributions when author email matches user's verified GitHub email
      author: {
        name: authorName,
        email: authorEmail,
      },
      committer: {
        name: authorName,
        email: authorEmail,
      },
    });
    commitData = commitResponse.data;
    console.log('[GitHub Sync] Commit created using GitHub App with USER attribution - will count toward contributions if email matches verified GitHub email');
  } catch (commitError) {
    const err = commitError as { status?: number; message?: string };
    console.error('[GitHub Sync] Commit failed after branch creation:', {
      status: err.status,
      message: err.message,
      branch: branchName,
      owner: GITHUB_OWNER,
      repo: GITHUB_CONTENT_REPO,
      path: filePath,
    });
    
    throw new Error(`Branch created but commit failed: ${err.message || 'Unknown error'}. Branch: ${branchName}`);
  }

  // Build PR body
  let prBody = `**Contributed by**: @${params.contributorName || params.userLogin}\n`;
  if (params.action === 'edited' && params.editorName && params.editorName !== params.contributorName) {
    prBody += `**Edited by**: @${params.editorName}\n`;
  }
  prBody += `\n**Action**: ${params.action}\n**Type**: ${params.tableName}\n\n---\n\n${params.record.description || 'No description provided.'}`;

  // Validate commit response before proceeding to PR creation
  if (!commitData || !commitData.commit || !commitData.commit.sha) {
    throw new Error('Invalid commit response from GitHub');
  }

  // Create PR using App (has org access)
  // Wrap in try-catch to handle PR creation failures gracefully
  let prData;
  try {
    const prResponse = await appOctokit.pulls.create({
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
    prData = prResponse.data;
    console.log('[GitHub Sync] PR created using GitHub App');
  } catch (prError) {
    const err = prError as { status?: number; message?: string };
    console.error('[GitHub Sync] PR creation failed after successful commit:', err);
    
    // Commit succeeded but PR failed - return partial success with commit info
    // The branch and commit exist, but no PR was created
    // This allows the caller to handle the partial success appropriately
    return {
      success: false,
      error: `Commit created successfully, but PR creation failed: ${err.message || 'Unknown error'}. Branch: ${branchName}, Commit SHA: ${commitData.commit.sha}`,
      commit_sha: commitData.commit.sha,
      branch: branchName,
      file_path: filePath,
      // No pr_number or pr_url since PR creation failed
    };
  }

  // Validate PR response data
  if (!prData || typeof prData.number !== 'number' || !prData.html_url) {
    // This should not happen if PR creation succeeded, but validate anyway
    console.error('[GitHub Sync] PR creation succeeded but response is invalid:', prData);
    return {
      success: false,
      error: 'PR created but response is invalid',
      commit_sha: commitData.commit.sha,
      branch: branchName,
      file_path: filePath,
    };
  }

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

  // Unknown table type - this should not happen, but handle gracefully
  console.error(`[generateYAML] Unknown table name: ${tableName}`);
  throw new Error(`Cannot generate YAML for unknown table type: ${tableName}`);
}
