/**
 * GitHub Service
 * Handles GitHub API operations for syncing content
 */

import { Octokit } from '@octokit/rest';

const GITHUB_OWNER = process.env.GITHUB_REPO_OWNER || 'devyendarm';
const GITHUB_CONTENT_REPO = process.env.GITHUB_CONTENT_REPO_NAME || 'openKPIs-Content';

export interface GitHubSyncParams {
  tableName: 'kpis' | 'events' | 'dimensions' | 'metrics';
  record: any;
  action: 'created' | 'edited';
  userLogin: string;
  userName?: string;
  userEmail?: string;
}

export async function syncToGitHub(params: GitHubSyncParams): Promise<{
  success: boolean;
  commit_sha?: string;
  pr_number?: number;
  pr_url?: string;
  branch?: string;
  error?: string;
}> {
  try {
    const appId = process.env.GITHUB_APP_ID;
    const privateKey = process.env.GITHUB_APP_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const installationId = process.env.GITHUB_INSTALLATION_ID;

    if (!appId || !privateKey || !installationId) {
      throw new Error('GitHub credentials not configured');
    }

    const octokit = new Octokit({
      auth: {
        appId,
        privateKey,
        installationId: parseInt(installationId),
      },
    });

    const yamlContent = generateYAML(params.tableName, params.record);
    const fileName = `${params.record.slug}.yml`;
    const filePath = `data-layer/${params.tableName}/${fileName}`;
    const branchName = `${params.action}-${params.tableName}-${params.record.slug}-${Date.now()}`;

    // Get main branch
    const { data: mainBranch } = await octokit.git.getRef({
      owner: GITHUB_OWNER,
      repo: GITHUB_CONTENT_REPO,
      ref: 'heads/main',
    });

    // Create branch
    await octokit.git.createRef({
      owner: GITHUB_OWNER,
      repo: GITHUB_CONTENT_REPO,
      ref: `refs/heads/${branchName}`,
      sha: mainBranch.object.sha,
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
      if ('sha' in existingFile) {
        existingFileSha = existingFile.sha;
      }
    } catch (e) {
      // File doesn't exist
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

    // Create PR
    const { data: prData } = await octokit.pulls.create({
      owner: GITHUB_OWNER,
      repo: GITHUB_CONTENT_REPO,
      title: params.action === 'created'
        ? `Add ${params.tableName.slice(0, -1)}: ${params.record.name}`
        : `Update ${params.tableName.slice(0, -1)}: ${params.record.name}`,
      head: branchName,
      base: 'main',
      body: `**Contributed by**: @${params.userLogin}\n\n**Action**: ${params.action}\n**Type**: ${params.tableName}\n\n---\n\n${params.record.description || 'No description provided.'}`,
      maintainer_can_modify: true,
    });

    return {
      success: true,
      commit_sha: commitData.commit.sha,
      pr_number: prData.number,
      pr_url: prData.html_url,
      branch: branchName,
    };
  } catch (error: any) {
    console.error('GitHub sync error:', error);
    return {
      success: false,
      error: error.message || 'Failed to sync to GitHub',
    };
  }
}

function generateYAML(tableName: string, record: any): string {
  const timestamp = new Date().toISOString();
  
  if (tableName === 'kpis') {
    return `# KPI: ${record.name}
# Generated: ${timestamp}
# Contributed by: ${record.created_by}

KPI Name: ${record.name}
${record.formula ? `Formula: ${record.formula}` : ''}
${record.description ? `Description: |\n  ${record.description.split('\n').join('\n  ')}` : ''}
${record.category ? `Category: ${record.category}` : ''}
${record.tags && record.tags.length > 0 ? `Tags: [${record.tags.join(', ')}]` : ''}
Status: ${record.status}
Contributed By: ${record.created_by}
Created At: ${record.created_at}
`;
  }
  
  if (tableName === 'events') {
    return `# Event: ${record.name}
# Generated: ${timestamp}
# Contributed by: ${record.created_by}

Event Name: ${record.name}
${record.description ? `Description: |\n  ${record.description.split('\n').join('\n  ')}` : ''}
${record.category ? `Category: ${record.category}` : ''}
${record.tags && record.tags.length > 0 ? `Tags: [${record.tags.join(', ')}]` : ''}
Status: ${record.status}
Contributed By: ${record.created_by}
Created At: ${record.created_at}
`;
  }

  if (tableName === 'dimensions') {
    return `# Dimension: ${record.name}
# Generated: ${timestamp}
# Contributed by: ${record.created_by}

Dimension Name: ${record.name}
${record.description ? `Description: |\n  ${record.description.split('\n').join('\n  ')}` : ''}
${record.category ? `Category: ${record.category}` : ''}
${record.tags && record.tags.length > 0 ? `Tags: [${record.tags.join(', ')}]` : ''}
Status: ${record.status}
Contributed By: ${record.created_by}
Created At: ${record.created_at}
`;
  }

  if (tableName === 'metrics') {
    return `# Metric: ${record.name}
# Generated: ${timestamp}
# Contributed by: ${record.created_by}

Metric Name: ${record.name}
${record.formula ? `Formula: ${record.formula}` : ''}
${record.description ? `Description: |\n  ${record.description.split('\n').join('\n  ')}` : ''}
${record.category ? `Category: ${record.category}` : ''}
${record.tags && record.tags.length > 0 ? `Tags: [${record.tags.join(', ')}]` : ''}
Status: ${record.status}
Contributed By: ${record.created_by}
Created At: ${record.created_at}
`;
  }

  return '';
}

