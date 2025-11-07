import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { Octokit } from '@octokit/rest';

// This is a server-side API route, so it can safely import from server.ts

const GITHUB_OWNER = process.env.GITHUB_REPO_OWNER || 'devyendarm';
const GITHUB_CONTENT_REPO = process.env.GITHUB_CONTENT_REPO_NAME || 'openKPIs-Content';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    // Get Supabase admin client
    const supabase = createAdminClient();

    // Fetch KPI from Supabase
    const { data: kpi, error: kpiError } = await supabase
      .from('kpis')
      .select('*')
      .eq('id', id)
      .single();

    if (kpiError || !kpi) {
      return NextResponse.json(
        { error: 'KPI not found' },
        { status: 404 }
      );
    }

    // Get GitHub App credentials
    const appId = process.env.GITHUB_APP_ID;
    const privateKey = process.env.GITHUB_APP_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const installationId = process.env.GITHUB_INSTALLATION_ID;

    if (!appId || !privateKey || !installationId) {
      return NextResponse.json(
        { error: 'GitHub credentials not configured' },
        { status: 500 }
      );
    }

    // Initialize Octokit with GitHub App
    const octokit = new Octokit({
      auth: {
        appId,
        privateKey,
        installationId: parseInt(installationId),
      },
    });

    // Generate YAML content
    const yamlContent = generateYAML(kpi);
    const fileName = `${kpi.slug}.yml`;
    const filePath = `data-layer/kpis/${fileName}`;

    // Get main branch reference
    const { data: mainBranch } = await octokit.git.getRef({
      owner: GITHUB_OWNER,
      repo: GITHUB_CONTENT_REPO,
      ref: 'heads/main',
    });

    const baseSha = mainBranch.object.sha;

    // Check if PR already exists (for updates when publishing)
    let existingPR: any = null;
    let branchName: string;
    
    if (kpi.github_pr_number) {
      try {
        const { data: pr } = await octokit.pulls.get({
          owner: GITHUB_OWNER,
          repo: GITHUB_CONTENT_REPO,
          pull_number: kpi.github_pr_number,
        });
        existingPR = pr;
        // Use existing branch if PR exists
        branchName = pr.head.ref;
      } catch (e) {
        // PR doesn't exist or was closed, create new one
        console.log('[GitHub Sync] Existing PR not found, creating new PR');
        branchName = `${action}-kpi-${kpi.slug}-${Date.now()}`;
      }
    } else {
      // No existing PR, create new branch name
      branchName = `${action}-kpi-${kpi.slug}-${Date.now()}`;
    }

    // Check if file exists in the branch
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
      // File doesn't exist yet in this branch
    }

    // Create branch if it doesn't exist (only if no existing PR)
    if (!existingPR) {
      try {
        await octokit.git.createRef({
          owner: GITHUB_OWNER,
          repo: GITHUB_CONTENT_REPO,
          ref: `refs/heads/${branchName}`,
          sha: baseSha,
        });
      } catch (e: any) {
        // Branch might already exist, that's okay
        if (!e.message?.includes('already exists')) {
          throw e;
        }
      }
    }

    // Create/update file
    const commitMessage = existingPR
      ? `Update KPI: ${kpi.name}${kpi.status === 'published' ? ' (Published)' : ''}`
      : action === 'created'
        ? `Add KPI: ${kpi.name}${kpi.status === 'draft' ? ' (Draft)' : ''}`
        : `Update KPI: ${kpi.name}${kpi.status === 'published' ? ' (Published)' : ''}`;

    const { data: commitData } = await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_CONTENT_REPO,
      path: filePath,
      message: commitMessage,
      content: Buffer.from(yamlContent).toString('base64'),
      branch: branchName,
      sha: existingFileSha,
      committer: {
        name: 'OpenKPIs Bot',
        email: 'bot@openkpis.org',
      },
      author: {
        name: kpi.created_by,
        email: `${kpi.created_by}@users.noreply.github.com`,
      },
    });

    // Create or update Pull Request
    let prData: any;
    if (existingPR) {
      // Update existing PR with new data
      prData = existingPR;
      
      // Update PR body to reflect current status
      const prBody = `**Contributed by**: @${kpi.created_by}\n\n**Action**: ${action}\n**Type**: KPI\n**Status**: ${kpi.status}\n\n---\n\n${kpi.description || 'No description provided.'}`;
      
      await octokit.pulls.update({
        owner: GITHUB_OWNER,
        repo: GITHUB_CONTENT_REPO,
        pull_number: existingPR.number,
        title: `Add KPI: ${kpi.name}${kpi.status === 'published' ? ' (Ready for Review)' : ' (Draft)'}`,
        body: prBody,
      });
    } else {
      // Create new Pull Request
      const { data: newPR } = await octokit.pulls.create({
        owner: GITHUB_OWNER,
        repo: GITHUB_CONTENT_REPO,
        title: `Add KPI: ${kpi.name}${kpi.status === 'draft' ? ' (Draft)' : ' (Ready for Review)'}`,
        head: branchName,
        base: 'main',
        body: `**Contributed by**: @${kpi.created_by}\n\n**Action**: ${action}\n**Type**: KPI\n**Status**: ${kpi.status}\n\n---\n\n${kpi.description || 'No description provided.'}`,
        maintainer_can_modify: true,
      });
      prData = newPR;
    }

    // Update Supabase record
    await supabase
      .from('kpis')
      .update({
        github_commit_sha: commitData.commit.sha,
        github_pr_number: prData.number,
        github_pr_url: prData.html_url,
        github_file_path: filePath,
      })
      .eq('id', id);

    return NextResponse.json({
      success: true,
      commit_sha: commitData.commit.sha,
      pr_number: prData.number,
      pr_url: prData.html_url,
      branch: branchName,
    });
  } catch (error: any) {
    console.error('GitHub sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync to GitHub' },
      { status: 500 }
    );
  }
}

function generateYAML(kpi: any): string {
  const timestamp = new Date().toISOString();
  return `# KPI: ${kpi.name}
# Generated: ${timestamp}
# Contributed by: ${kpi.created_by}

KPI Name: ${kpi.name}
${kpi.formula ? `Formula: ${kpi.formula}` : ''}
${kpi.description ? `Description: |\n  ${kpi.description.split('\n').join('\n  ')}` : ''}
${kpi.category ? `Category: ${kpi.category}` : ''}
${kpi.tags && kpi.tags.length > 0 ? `Tags: [${kpi.tags.join(', ')}]` : ''}
Status: ${kpi.status}
Contributed By: ${kpi.created_by}
Created At: ${kpi.created_at}
${kpi.last_modified_by ? `Last Modified By: ${kpi.last_modified_by}` : ''}
${kpi.last_modified_at ? `Last Modified At: ${kpi.last_modified_at}` : ''}
${kpi.approved_by ? `Approved By: ${kpi.approved_by}` : ''}
${kpi.approved_at ? `Approved At: ${kpi.approved_at}` : ''}
`;
}

