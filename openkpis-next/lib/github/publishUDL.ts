import { Octokit } from '@octokit/rest';

/**
 * Publishes the Tag-Filtered Master UDL to the dedicated openKPIs-content-publish repository.
 * 
 * @param monolithicSchema The absolute master JSON schema containing all events/parameters with `industries` tags.
 * @param platform The platform name (e.g., 'GA4', 'Adobe Analytics')
 */
export async function publishUDLToGithub(monolithicSchema: any, platform: string) {
  // Use environment variables for Github Token and Repo details
  const githubToken = process.env.GITHUB_ACCESS_TOKEN;
  // If no token is provided in .env, we gracefully mock success for local dev.
  if (!githubToken) {
    console.warn('⚠️ GITHUB_ACCESS_TOKEN missing. Skipping real Octokit push.');
    return { success: true, mocked: true };
  }

  const octokit = new Octokit({ auth: githubToken });
  const owner = process.env.GITHUB_OWNER || 'openkpis';
  const repo = 'openKPIs-content-publish'; // Dedicated content repo
  const branch = 'main';

  // Step 1: Discover all unique industries inside the monolithic schema
  const industries = new Set<string>();
  const allKeys = Object.keys(monolithicSchema);
  
  allKeys.forEach(key => {
    const item = monolithicSchema[key];
    if (item.industries && Array.isArray(item.industries)) {
      item.industries.forEach((ind: string) => {
        if (ind !== 'Global') industries.add(ind);
      });
    }
  });

  // Step 2: For each industry, create a filtered schema
  const filesToCommit: { path: string; content: string }[] = [];
  const safePlatformStr = platform.toLowerCase().replace(/[^a-z0-9]/g, '-');

  industries.forEach(industry => {
    const safeIndustryStr = industry.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const filteredSchema: any = {};

    allKeys.forEach(key => {
      const item = monolithicSchema[key];
      const tags = item.industries || [];
      // Include if it's Global or matches this specific industry
      if (tags.length === 0 || tags.includes('Global') || tags.includes(industry)) {
        filteredSchema[key] = item;
      }
    });

    filesToCommit.push({
      path: `data-layers/${safeIndustryStr}/${safePlatformStr}-schema.json`,
      content: JSON.stringify(filteredSchema, null, 2)
    });
  });

  // Step 3: Use Github Octokit to commit the files
  try {
    // 3a. Get the latest commit SHA of the main branch
    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`
    });
    const latestCommitSha = refData.object.sha;

    // 3b. Get the tree SHA of that commit
    const { data: commitData } = await octokit.git.getCommit({
      owner,
      repo,
      commit_sha: latestCommitSha
    });
    const baseTreeSha = commitData.tree.sha;

    // 3c. Create blobs and tree entries for our new files
    const treeEntries = await Promise.all(filesToCommit.map(async file => {
      const { data: blobData } = await octokit.git.createBlob({
        owner,
        repo,
        content: file.content,
        encoding: 'utf-8'
      });
      return {
        path: file.path,
        mode: '100644' as const,
        type: 'blob' as const,
        sha: blobData.sha
      };
    }));

    // 3d. Create the new tree
    const { data: treeData } = await octokit.git.createTree({
      owner,
      repo,
      base_tree: baseTreeSha,
      tree: treeEntries
    });

    // 3e. Create a new commit
    const { data: newCommitData } = await octokit.git.createCommit({
      owner,
      repo,
      message: `chore(udl): Auto-sync Tag-Filtered Master UDL for ${platform}`,
      tree: treeData.sha,
      parents: [latestCommitSha]
    });

    // 3f. Update the branch reference
    await octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: newCommitData.sha
    });

    return { success: true };
  } catch (error) {
    console.error('Github Publish Error:', error);
    return { success: false, error };
  }
}
