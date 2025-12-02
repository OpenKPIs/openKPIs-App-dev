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
}

export async function syncToGitHub(params: GitHubSyncParams): Promise<{
  success: boolean;
  commit_sha?: string;
  pr_number?: number;
  pr_url?: string;
  branch?: string;
  file_path?: string;
  error?: string;
}> {
  try {
    const appId = process.env.GITHUB_APP_ID;
    const privateKey = resolvePrivateKey();
    const installationIdStr = process.env.GITHUB_INSTALLATION_ID;

    if (!appId || !privateKey || !installationIdStr) {
      throw new Error('GitHub credentials not configured (check GITHUB_APP_ID, GITHUB_INSTALLATION_ID, GITHUB_APP_PRIVATE_KEY_B64)');
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

