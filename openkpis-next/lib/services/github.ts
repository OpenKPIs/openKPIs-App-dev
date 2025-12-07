/**
 * GitHub Service
 * Handles GitHub API operations for syncing content
 */

import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';

// Note: Content PRs go to GITHUB_CONTENT_REPO_NAME repository (not the app repo)
const GITHUB_OWNER = process.env.GITHUB_REPO_OWNER || 'devyendarm';
const GITHUB_CONTENT_REPO = process.env.GITHUB_CONTENT_REPO_NAME || process.env.GITHUB_CONTENT_REPO || 'openKPIs-Content';

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
    await octokit.users.getAuthenticated();
    console.log('[GitHub Token] Token is valid');
    return { token, requiresReauth: false };
  } catch (error) {
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
    return {
      token: null,
      requiresReauth: true,
      error: isExpired 
        ? 'GitHub token expired. Please sign in again to track contributions.'
        : 'GitHub token invalid. Please sign in again.',
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

  // Get main branch
  const { data: mainRef } = await octokit.git.getRef({
    owner: GITHUB_OWNER,
    repo: GITHUB_CONTENT_REPO,
    ref: 'heads/main',
  });

  // Create branch
  await octokit.git.createRef({
    owner: GITHUB_OWNER,
    repo: GITHUB_CONTENT_REPO,
    ref: `refs/heads/${branchName}`,
    sha: mainRef.object.sha,
  });

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

/**
 * Create commit using bot token (LAST RESORT ONLY)
 */
async function commitWithBotToken(
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
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = resolvePrivateKey();
  const installationIdStr = process.env.GITHUB_INSTALLATION_ID;

  if (!appId || !privateKey || !installationIdStr) {
    throw new Error('Bot credentials not configured');
  }

  const installationId = parseInt(installationIdStr, 10);

  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: Number(appId),
      privateKey,
      installationId,
    },
  });

  const yamlContent = generateYAML(params.tableName, params.record);
  const fileName = `${params.record.slug || params.record.name || params.record.id}.yml`;
  const filePath = `data-layer/${params.tableName}/${fileName}`;
  const branchName = `${params.action}-${params.tableName}-${params.record.slug}-${Date.now()}`;

  // Get main branch
  const { data: mainRef } = await octokit.git.getRef({
    owner: GITHUB_OWNER,
    repo: GITHUB_CONTENT_REPO,
    ref: 'heads/main',
  });

  // Create branch
  await octokit.git.createRef({
    owner: GITHUB_OWNER,
    repo: GITHUB_CONTENT_REPO,
    ref: `refs/heads/${branchName}`,
    sha: mainRef.object.sha,
  });

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

  // Create/update file - commit as BOT (last resort)
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
    committer: {
      name: 'OpenKPIs Bot',
      email: 'bot@openkpis.org',
    },
    author: {
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

  console.warn('[GitHub Sync] Used bot token as last resort - commit will NOT count toward user contributions');

  return {
    success: true,
    commit_sha: commitData.commit.sha,
    pr_number: prData.number,
    pr_url: prData.html_url,
    branch: branchName,
    file_path: filePath,
  };
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
}> {
  try {
    // PRIORITY 1: Try user token (with silent refresh if logged in)
    if (params.userId) {
      const { token: userToken, requiresReauth, error: tokenError } = 
        await getUserOAuthTokenWithRefresh(params.userId);
      
      if (userToken) {
        // Use user token - commits will count toward contributions
        try {
          return await commitWithUserToken(userToken, params);
        } catch (error) {
          console.error('[GitHub Sync] User token commit failed:', error);
          // Fall through to check if we should use bot or require reauth
        }
      }
      
      // PRIORITY 2: User not logged in or token unavailable - require reauth
      if (requiresReauth) {
        return {
          success: false,
          error: tokenError || 'GitHub authorization required',
          requiresReauth: true,
        };
      }
    } else {
      // No userId provided - require login
      return {
        success: false,
        error: 'User authentication required. Please sign in with GitHub.',
        requiresReauth: true,
      };
    }
    
    // PRIORITY 3: Last resort - use bot (only if everything else fails)
    console.warn('[GitHub Sync] All user token attempts failed, using bot as last resort');
    return await commitWithBotToken(params);
    
  } catch (error: unknown) {
    console.error('GitHub sync error:', error);
    const err = error as { message?: string };
    
    // Try bot as absolute last resort
    try {
      console.warn('[GitHub Sync] Error with user token, trying bot as absolute last resort');
      return await commitWithBotToken(params);
    } catch (botError) {
      return {
        success: false,
        error: err.message || 'Failed to sync to GitHub',
        requiresReauth: true,
      };
    }
  }
}

    const yamlContent = generateYAML(params.tableName, params.record);
    const fileName = `${params.record.slug || params.record.name || params.record.id}.yml`;
    const filePath = `data-layer/${params.tableName}/${fileName}`;
    const branchName = `${params.action}-${params.tableName}-${params.record.slug}-${Date.now()}`;

    // Get main branch
    const { data: mainRef } = await octokit.git.getRef({
      owner: GITHUB_OWNER,
      repo: GITHUB_CONTENT_REPO,
      ref: 'heads/main',
    });

    // Create branch
    await octokit.git.createRef({
      owner: GITHUB_OWNER,
      repo: GITHUB_CONTENT_REPO,
      ref: `refs/heads/${branchName}`,
      sha: mainRef.object.sha,
    });

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

    // Create/update file
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
      committer: {
        name: 'OpenKPIs Bot',
        email: 'bot@openkpis.org',
      },
      author: {
        name: params.userName || params.userLogin,
        email: params.userEmail || `${params.userLogin}@users.noreply.github.com`,
      },
    });

    // Build PR body with contributor and editor information
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
  } catch (error: unknown) {
    console.error('GitHub sync error:', error);
    const err = error as { message?: string };
    return {
      success: false,
      error: err.message || 'Failed to sync to GitHub',
    };
  }
}

function resolvePrivateKey(): string | undefined {
  // Use GITHUB_APP_PRIVATE_KEY_B64 from environment
  const b64Key = process.env.GITHUB_APP_PRIVATE_KEY_B64;

  if (b64Key) {
    try {
      const key = Buffer.from(b64Key.trim(), 'base64').toString('utf8');
      if (key.includes('BEGIN') && key.includes('END')) {
        return key.replace(/\r\n/g, '\n');
      }
    } catch {
      // ignore decode errors
    }
  }

  return undefined;
}

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
