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
  measure_type?: string;
  aggregation_window?: string;
  ga4_event?: string;
  adobe_event?: string;
  W3_data_layer?: string;
  GA4_data_layer?: string;
  Adobe_client_data_layer?: string;
  xdm_mapping?: string;
  sql_query?: string;
  calculation_notes?: string;
  Business_Use_Case?: string;
  dependencies?: string;
  Source_Data?: string;
  report_attributes?: string;
  dashboard_usage?: string;
  segment_eligibility?: string;
  related_kpis?: string[] | string;
  data_sensitivity?: string;
  pii_flag?: boolean;
  last_modified_by?: string;
  last_modified_at?: string;
}

export type GitHubContributionMode = 'internal_app' | 'fork_pr' | 'editor_direct';

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
  mode?: GitHubContributionMode; // Optional: override mode selection
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
  console.log('[GitHub Sync] Using GitHub App with user attribution - commits will count toward contributions');
  // Note: userToken is passed but not used for operations - we use App for all operations
  // User token is only needed to get user info (email) for attribution, which is already in params.userEmail
  
  // Validate required parameters
  if (!params.userLogin) {
    throw new Error('userLogin is required for GitHub sync');
  }
  if (!params.record.name) {
    throw new Error('record.name is required for GitHub sync');
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

  // GITHUB-SUPPORTED APPROACH FOR ORGANIZATION REPOSITORIES:
  // In org repos, users with 'repo' scope CANNOT create branches unless they are collaborators.
  // The GitHub-supported solution is:
  // 1. Use GitHub App to create branch AND commit (has org write access)
  // 2. Set author/committer to USER (not App) - GitHub counts this as user contribution
  // 3. GitHub counts contributions based on author email matching user's verified email
  // Note: We skip user token repo verification because:
  // - User token is only used to get user info (email) for attribution, not for operations
  // - Verifying with user token would fail in org repos and prevent us from using the App approach
  
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

  // Get main branch using App (has org access) - needed for both approaches
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
  // IMPORTANT: If userLogin is 'unknown', we cannot create a valid noreply email
  // In this case, we must have a verified email or the commit won't count toward contributions
  let authorEmail: string;
  if (params.userEmail) {
    authorEmail = params.userEmail;
  } else if (params.userLogin && params.userLogin !== 'unknown') {
    authorEmail = `${params.userLogin}@users.noreply.github.com`;
  } else {
    // Last resort: use user's email from Supabase (may not count if not verified on GitHub)
    // This should rarely happen if user is properly authenticated with GitHub OAuth
    throw new Error('Cannot determine author email for GitHub commit. User must have a verified GitHub email or valid GitHub username.');
  }
  
  console.log('[GitHub Sync] Using author email for contributions:', {
    email: authorEmail,
    isVerified: !!params.userEmail,
    isNoreply: authorEmail.endsWith('@users.noreply.github.com'),
    userLogin: params.userLogin,
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
      
      // Validate PR response data
      if (!prData || typeof prData.number !== 'number' || !prData.html_url) {
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
    } catch (prError) {
      const err = prError as { status?: number; message?: string };
      console.error('[GitHub Sync] PR creation failed after successful commit:', err);
      
      // Commit succeeded but PR failed - return partial success with commit info
      return {
        success: false,
        error: `Commit created successfully, but PR creation failed: ${err.message || 'Unknown error'}. Branch: ${branchName}, Commit SHA: ${commitData.commit.sha}`,
        commit_sha: commitData.commit.sha,
        branch: branchName,
        file_path: filePath,
        // No pr_number or pr_url since PR creation failed
      };
    }
}

// Bot commit function removed - user token covers 100% of contribution requirements
// If user token is unavailable, we require re-auth instead of silently using bot

/**
 * Get user's contribution mode preference
 * Returns 'fork_pr' if user has enabled GitHub fork contributions, else 'internal_app'
 */
async function getUserContributionMode(userId: string): Promise<GitHubContributionMode> {
  try {
    const { createAdminClient } = await import('@/lib/supabase/server');
    const { withTablePrefix } = await import('@/src/types/entities');
    const admin = createAdminClient();
    
    const { data: profile } = await admin
      .from(withTablePrefix('user_profiles'))
      .select('enable_github_fork_contributions')
      .eq('id', userId)
      .maybeSingle();
    
    // Default to true if not set (new users or migration)
    if (profile?.enable_github_fork_contributions === true || profile?.enable_github_fork_contributions === null) {
      return 'fork_pr';
    }
    
    return 'internal_app';
  } catch (error) {
    console.warn('[GitHub Sync] Failed to check user contribution mode, defaulting to fork_pr:', error);
    // Default to fork_pr since that's now the default preference
    return 'fork_pr';
  }
}

/**
 * Sync via Fork + PR workflow
 * Creates/ensures fork exists, commits to fork, opens PR to org repo
 */
async function syncViaForkAndPR(
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
  requiresReauth?: boolean;
}> {
  console.log('[GitHub Fork PR] Starting fork+PR workflow for user:', params.userLogin);
  
  // Validate required parameters
  if (!params.userLogin || params.userLogin === 'unknown') {
    throw new Error('Valid userLogin is required for fork+PR workflow');
  }
  if (!params.record.name) {
    throw new Error('record.name is required for GitHub sync');
  }
  if (!params.userEmail) {
    throw new Error('userEmail (verified GitHub email) is required for fork+PR workflow');
  }

  // Generate YAML content
  const yamlContent = generateYAML(params.tableName, params.record);
  if (!yamlContent || yamlContent.trim().length === 0) {
    throw new Error(`Failed to generate YAML content for ${params.tableName}. Invalid table name or record data.`);
  }

  const fileName = `${params.record.slug || params.record.name || params.record.id || 'untitled'}.yml`;
  const filePath = `data-layer/${params.tableName}/${fileName}`;
  const branchIdentifier = params.record.slug || params.record.name || params.record.id || 'untitled';
  const branchName = `openkpis-${params.action}-${params.tableName}-${branchIdentifier}-${Date.now()}`;

  // Create user Octokit instance
  const userOctokit = new Octokit({ auth: userToken });

  // Step 1: Ensure fork exists
  const forkOwner = params.userLogin;
  const forkRepo = GITHUB_CONTENT_REPO;
  
  console.log('[GitHub Fork PR] Checking if fork exists:', `${forkOwner}/${forkRepo}`);
  
  let forkExists = false;
  try {
    const { status } = await userOctokit.repos.get({
      owner: forkOwner,
      repo: forkRepo,
    });
    forkExists = (status === 200);
  } catch (error) {
    const err = error as { status?: number };
    if (err.status === 404) {
      forkExists = false;
    } else {
      throw new Error(`Failed to check fork existence: ${err.status || 'Unknown error'}`);
    }
  }

  if (!forkExists) {
    console.log('[GitHub Fork PR] Fork does not exist, creating fork...');
    try {
      // Create fork (this is async on GitHub's side)
      await userOctokit.repos.createFork({
        owner: GITHUB_OWNER,
        repo: GITHUB_CONTENT_REPO,
      });
      console.log('[GitHub Fork PR] Fork creation initiated, polling for completion...');
      
      // Poll for fork to be ready (max 10 seconds, 500ms intervals)
      const maxAttempts = 20;
      const pollInterval = 500;
      let attempts = 0;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        attempts++;
        
        try {
          const { status } = await userOctokit.repos.get({
            owner: forkOwner,
            repo: forkRepo,
          });
          if (status === 200) {
            forkExists = true;
            console.log('[GitHub Fork PR] Fork is ready after', attempts * pollInterval, 'ms');
            break;
          }
        } catch (pollError) {
          // Fork not ready yet, continue polling
        }
      }
      
      if (!forkExists) {
        throw new Error('Fork creation is taking longer than expected. Please try again in a few seconds.');
      }
    } catch (error) {
      const err = error as { status?: number; message?: string };
      if (err.status === 422 && err.message?.includes('already exists')) {
        // Fork already exists (race condition)
        forkExists = true;
        console.log('[GitHub Fork PR] Fork already exists (race condition)');
      } else {
        throw new Error(`Failed to create fork: ${err.message || 'Unknown error'}. Please try again later.`);
      }
    }
  } else {
    console.log('[GitHub Fork PR] Fork already exists');
  }

  // Step 2: Get base SHA from upstream main branch
  // Use App token to read org repo (more reliable)
  const appId = process.env.GITHUB_APP_ID;
  const installationIdStr = process.env.GITHUB_INSTALLATION_ID;
  const b64Key = process.env.GITHUB_APP_PRIVATE_KEY_B64;
  
  if (!appId || !installationIdStr || !b64Key) {
    throw new Error('GitHub App credentials not configured');
  }

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

  const appIdNum = Number(appId);
  const installationIdNum = parseInt(installationIdStr, 10);
  
  if (isNaN(appIdNum) || appIdNum <= 0 || isNaN(installationIdNum) || installationIdNum <= 0) {
    throw new Error('Invalid GitHub App credentials');
  }

  const appOctokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: appIdNum,
      privateKey,
      installationId: installationIdNum,
    },
  });

  // Get main branch SHA from org repo
  let mainSha: string;
  try {
    const { data: mainRef } = await appOctokit.git.getRef({
      owner: GITHUB_OWNER,
      repo: GITHUB_CONTENT_REPO,
      ref: 'heads/main',
    });
    if (!mainRef?.object?.sha) {
      throw new Error('Invalid main branch structure');
    }
    mainSha = mainRef.object.sha;
    console.log('[GitHub Fork PR] Got main branch SHA:', mainSha);
  } catch (error) {
    const err = error as { status?: number; message?: string };
    throw new Error(`Failed to get main branch SHA: ${err.message || 'Unknown error'}`);
  }

  // Step 3: Create branch in fork
  try {
    await userOctokit.git.createRef({
      owner: forkOwner,
      repo: forkRepo,
      ref: `refs/heads/${branchName}`,
      sha: mainSha,
    });
    console.log('[GitHub Fork PR] Branch created in fork:', branchName);
  } catch (error) {
    const err = error as { status?: number; message?: string };
    if (err.status === 422 && err.message?.includes('already exists')) {
      console.warn('[GitHub Fork PR] Branch already exists, continuing...');
    } else {
      throw new Error(`Failed to create branch in fork: ${err.message || 'Unknown error'}`);
    }
  }

  // Step 4: Commit file to fork branch
  let commitSha: string;
  try {
    const commitResponse = await userOctokit.repos.createOrUpdateFileContents({
      owner: forkOwner,
      repo: forkRepo,
      path: filePath,
      message: params.action === 'created'
        ? `Add ${params.tableName.slice(0, -1)}: ${params.record.name}`
        : `Update ${params.tableName.slice(0, -1)}: ${params.record.name}`,
      content: Buffer.from(yamlContent).toString('base64'),
      branch: branchName,
      author: {
        name: params.userName || params.userLogin,
        email: params.userEmail,
      },
      committer: {
        name: params.userName || params.userLogin,
        email: params.userEmail,
      },
    });
    
    if (!commitResponse.data.commit?.sha) {
      throw new Error('Invalid commit response');
    }
    commitSha = commitResponse.data.commit.sha;
    console.log('[GitHub Fork PR] File committed to fork:', commitSha);
  } catch (error) {
    const err = error as { status?: number; message?: string };
    throw new Error(`Failed to commit file to fork: ${err.message || 'Unknown error'}`);
  }

  // Step 5: Open PR from fork to org repo
  const prBody = `**Contributed by**: @${params.contributorName || params.userLogin}\n` +
    (params.action === 'edited' && params.editorName && params.editorName !== params.contributorName
      ? `**Edited by**: @${params.editorName}\n`
      : '') +
    `\n**Action**: ${params.action}\n**Type**: ${params.tableName}\n\n---\n\n${params.record.description || 'No description provided.'}`;

  try {
    const prResponse = await userOctokit.pulls.create({
      owner: GITHUB_OWNER,
      repo: GITHUB_CONTENT_REPO,
      title: params.action === 'created'
        ? `Add ${params.tableName.slice(0, -1)}: ${params.record.name}`
        : `Update ${params.tableName.slice(0, -1)}: ${params.record.name}`,
      head: `${forkOwner}:${branchName}`,
      base: 'main',
      body: prBody,
      maintainer_can_modify: true,
    });

    if (!prResponse.data.number || !prResponse.data.html_url) {
      throw new Error('Invalid PR response');
    }

    console.log('[GitHub Fork PR] PR created successfully:', prResponse.data.html_url);
    
    return {
      success: true,
      commit_sha: commitSha,
      pr_number: prResponse.data.number,
      pr_url: prResponse.data.html_url,
      branch: branchName,
      file_path: filePath,
    };
  } catch (error) {
    const err = error as { status?: number; message?: string };
    console.error('[GitHub Fork PR] PR creation failed:', err);
    
    // Commit succeeded but PR failed - return partial success
    return {
      success: false,
      error: `Commit created in fork, but PR creation failed: ${err.message || 'Unknown error'}. You can manually open a PR from ${forkOwner}:${branchName} to ${GITHUB_OWNER}:main`,
      commit_sha: commitSha,
      branch: branchName,
      file_path: filePath,
    };
  }
}

export async function syncToGitHub(params: GitHubSyncParams): Promise<{
  success: boolean;
  commit_sha?: string;
  pr_number?: number;
  pr_url?: string;
  branch?: string;
  file_path?: string;
  error?: string;
  requiresReauth?: boolean;
  mode?: GitHubContributionMode;
}> {
  try {
    // Determine contribution mode
    // Default to fork_pr (new default), but will be overridden by getUserContributionMode if mode not provided
    let mode: GitHubContributionMode = params.mode || 'fork_pr';
    
    if (!params.mode && params.userId) {
      // Auto-detect mode based on user preference
      mode = await getUserContributionMode(params.userId);
      console.log('[GitHub Sync] Determined contribution mode:', mode);
    }

    // PRIORITY 1: Fork+PR mode (if explicitly requested or user preference enabled)
    if (mode === 'fork_pr' && params.userId) {
      console.log('[GitHub Sync] Using fork+PR mode for user contributions');
      
      const { token: userToken, requiresReauth, error: tokenError } = 
        await getUserOAuthTokenWithRefresh(params.userId);
      
      // Check for reauth requirement first
      if (requiresReauth) {
        console.error('[GitHub Sync] Fork+PR requires re-authentication');
        return {
          success: false,
          error: 'GitHub authorization expired. Please sign in again to use Fork + Create.',
          requiresReauth: true,
          mode: 'fork_pr',
        };
      }
      
      // Check for token availability
      if (!userToken) {
        console.error('[GitHub Sync] Fork+PR mode requested but user token unavailable:', tokenError);
        return {
          success: false,
          error: tokenError || 'GitHub authorization required. Please sign in with GitHub to use Fork + Create.',
          requiresReauth: true,
          mode: 'fork_pr',
        };
      }
      
      // Check for email availability
      if (!params.userEmail) {
        console.error('[GitHub Sync] Fork+PR mode requested but user email unavailable');
        return {
          success: false,
          error: 'Verified GitHub email required for Fork + Create. Please ensure your GitHub account has a verified email address.',
          mode: 'fork_pr',
        };
      }
      
      // Execute fork+PR workflow
      try {
        const result = await syncViaForkAndPR(userToken, params);
        console.log('[GitHub Sync] Fork+PR workflow completed:', result.success ? 'success' : 'partial failure');
        return { ...result, mode: 'fork_pr' };
      } catch (error) {
        const err = error as { message?: string; status?: number };
        console.error('[GitHub Sync] Fork+PR workflow failed, attempting fallback to bot mode:', error);
        
        // Fallback to bot mode if fork+PR fails
        // This ensures the item is still synced to GitHub even if fork+PR fails
        try {
          console.log('[GitHub Sync] Falling back to internal_app mode (bot)');
          const botResult = await commitWithUserToken(userToken, params);
          return {
            ...botResult,
            mode: 'internal_app',
            error: `Fork+PR failed (${err.message || 'unknown error'}), but item was created using bot mode.`,
          };
        } catch (botError) {
          const botErr = botError as { message?: string };
          console.error('[GitHub Sync] Bot mode fallback also failed:', botError);
          return {
            success: false,
            error: `Fork+PR failed (${err.message || 'unknown error'}), and bot mode fallback also failed: ${botErr.message || 'unknown error'}. The item was created, but GitHub sync failed.`,
            mode: 'fork_pr',
          };
        }
      }
    }

    // PRIORITY 2: Internal App mode (default, current behavior)
    if (mode === 'internal_app') {
      console.log('[GitHub Sync] Using internal_app mode (GitHub App)');
      
      if (!params.userId) {
        return {
          success: false,
          error: 'User authentication required. Please sign in with GitHub.',
          requiresReauth: true,
          mode: 'internal_app',
        };
      }
      
      // Use App-based commit (current behavior)
      // This is handled by commitWithUserToken which uses App internally
      const { token: userToken } = await getUserOAuthTokenWithRefresh(params.userId);
      if (userToken) {
        try {
          const result = await commitWithUserToken(userToken, params);
          return { ...result, mode: 'internal_app' };
        } catch (error) {
          const err = error as { message?: string; status?: number };
          console.error('[GitHub Sync] Internal app commit failed:', error);
          
          // For internal_app, we can be more lenient - this is the fallback mode
          return {
            success: false,
            error: err.message || 'Failed to sync to GitHub. Item created but GitHub sync failed.',
            mode: 'internal_app',
          };
        }
      }
      
      // If no user token, we can't proceed
      return {
        success: false,
        error: 'GitHub authorization required. Please sign in with GitHub.',
        requiresReauth: true,
        mode: 'internal_app',
      };
    }
    
    // Fallback: Should not reach here, but handle gracefully
    console.error('[GitHub Sync] Unknown mode or missing userId');
    return {
      success: false,
      error: 'Invalid configuration. Please try again.',
      requiresReauth: false,
      mode: 'internal_app',
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
${formatField('Measure Type', record.measure_type)}
${formatField('Aggregation Window', record.aggregation_window)}
${formatField('GA4 Event', record.ga4_event, true)}
${formatField('Adobe Event', record.adobe_event, true)}
${formatField('W3 Data Layer', record.W3_data_layer, true)}
${formatField('GA4 Data Layer', record.GA4_data_layer, true)}
${formatField('Adobe Client Data Layer', record.Adobe_client_data_layer, true)}
${formatField('XDM Mapping', record.xdm_mapping, true)}
${formatField('SQL Query', record.sql_query, true)}
${formatField('Calculation Notes', record.calculation_notes, true)}
${formatField('Business Use Case', record.Business_Use_Case, true)}
${formatField('Dependencies', record.dependencies, true)}
${formatField('Source Data', record.Source_Data)}
${formatField('Report Attributes', record.report_attributes, true)}
${formatField('Dashboard Usage', record.dashboard_usage, true)}
${formatField('Segment Eligibility', record.segment_eligibility, true)}
${formatField('Related KPIs', formatArray(record.related_kpis))}
${formatField('Data Sensitivity', record.data_sensitivity)}
${formatField('Contains PII', record.pii_flag ? 'Yes' : record.pii_flag === false ? 'No' : '')}
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
