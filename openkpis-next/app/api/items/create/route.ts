import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { withTablePrefix } from '@/src/types/entities';
import { syncToGitHub } from '@/lib/services/github';

type ItemType = 'kpi' | 'metric' | 'dimension' | 'event' | 'dashboard';

interface CreateItemRequest {
  type: ItemType;
  name: string;
  slug: string;
  description?: string;
  category?: string;
  tags?: string[];
  formula?: string;
  githubContributionMode?: 'internal_app' | 'fork_pr'; // Explicit mode override from button click
}

const TABLE_MAP: Record<ItemType, string> = {
  kpi: 'kpis',
  metric: 'metrics',
  dimension: 'dimensions',
  event: 'events',
  dashboard: 'dashboards',
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = (await request.json()) as CreateItemRequest;
    const { type, name, slug, description, category, tags, formula, githubContributionMode } = body;

    // Validation
    if (!type || !name || !slug) {
      return NextResponse.json(
        { error: 'Type, name, and slug are required' },
        { status: 400 }
      );
    }

    if (!TABLE_MAP[type]) {
      return NextResponse.json(
        { error: `Invalid item type: ${type}` },
        { status: 400 }
      );
    }

    const userName = user.user_metadata?.user_name || user.email || 'unknown';
    const userId = user.id;
    const tableName = withTablePrefix(TABLE_MAP[type]);
    const admin = createAdminClient();

    // Check if slug already exists
    const { data: existing } = await admin
      .from(tableName)
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'An item with this slug already exists. Please choose a different name.' },
        { status: 409 }
      );
    }

    // Prepare insert payload
    const insertPayload: Record<string, unknown> = {
      name,
      slug,
      description: description || null,
      category: category || null,
      tags: tags || [],
      status: 'draft',
      created_by: userName,
      created_at: new Date().toISOString(),
    };

    // Add formula for KPIs, Metrics, and Events
    if (type === 'kpi' || type === 'metric' || type === 'event') {
      insertPayload.formula = formula || null;
    }

    // Create item in Supabase
    const { data: created, error: insertError } = await admin
      .from(tableName)
      .insert(insertPayload)
      .select()
      .single();

    if (insertError || !created) {
      console.error('Error creating item:', insertError);
      return NextResponse.json(
        { error: insertError?.message || 'Failed to create item' },
        { status: 500 }
      );
    }

    // Create contribution record
    const contributionsTable = withTablePrefix('contributions');
    let contributionCreated = false;
    try {
      const { error: contribError } = await admin
        .from(contributionsTable)
        .insert({
          user_id: userId,
          item_type: type,
          item_id: created.id,
          item_slug: slug,
          action: 'created',
          status: 'pending',
        });

      if (contribError) {
        console.error('Error creating contribution record:', contribError);
        // Non-critical - continue even if contribution record fails
      } else {
        contributionCreated = true;
      }
    } catch (contribErr) {
      console.error('Exception creating contribution:', contribErr);
      // Non-critical - continue
    }

    // Trigger GitHub sync directly (non-blocking, but we'll wait for it)
    let githubResult: { 
      success: boolean; 
      error?: string; 
      pr_url?: string;
      commit_sha?: string;
      branch?: string;
      file_path?: string;
    } = { success: false };
    try {
      // Prefer verified GitHub email for author attribution (counts toward user contributions)
      // First try cached email from user profile, then fetch from GitHub API, then fallback
      let authorEmail: string | undefined = undefined;
      
      // Check user profile for cached verified email (faster, more reliable)
      const { data: profile } = await admin
        .from(withTablePrefix('user_profiles'))
        .select('github_verified_email, github_email_verified_at')
        .eq('id', userId)
        .maybeSingle();
      
      const cachedEmail = profile?.github_verified_email as string | undefined;
      const emailVerifiedAt = profile?.github_email_verified_at as string | undefined;
      
      // Use cached email if it's less than 24 hours old
      if (cachedEmail && emailVerifiedAt) {
        const verifiedDate = new Date(emailVerifiedAt);
        const hoursSinceVerification = (Date.now() - verifiedDate.getTime()) / (1000 * 60 * 60);
        if (hoursSinceVerification < 24) {
          authorEmail = cachedEmail;
        }
      }
      
      // If no valid cached email, fetch from GitHub API
      if (!authorEmail) {
        try {
          const { getVerifiedEmailFromGitHubTokenCookie } = await import('@/lib/github/verifiedEmail');
          const verifiedEmail = await getVerifiedEmailFromGitHubTokenCookie();
          if (verifiedEmail) {
            authorEmail = verifiedEmail;
            // Update cache in user profile (non-blocking)
            admin
              .from(withTablePrefix('user_profiles'))
              .update({
                github_verified_email: verifiedEmail,
                github_email_verified_at: new Date().toISOString(),
              })
              .eq('id', userId)
              .then(() => {
                console.log('[Create Item] Updated cached verified email for user:', userId);
              })
              .catch((err: unknown) => {
                console.warn('[Create Item] Failed to cache verified email:', err);
              });
          }
        } catch (err) {
          console.warn('[Create Item] Failed to fetch verified email from GitHub:', err);
        }
      }
      
      // Final fallback: Use GitHub noreply email format
      // This format (username@users.noreply.github.com) will count toward contributions
      // if the user has any verified email on their GitHub account
      // This is more reliable than user.email which might not be verified
      if (!authorEmail) {
        const githubUsername = user.user_metadata?.preferred_username || 
                              user.user_metadata?.user_name;
        if (githubUsername && githubUsername !== 'unknown') {
          authorEmail = `${githubUsername}@users.noreply.github.com`;
          console.warn('[Create Item] No verified email found, using GitHub noreply format:', authorEmail);
        } else {
          // If we can't get a valid GitHub username, we cannot create a valid noreply email
          // This should rarely happen if user is properly authenticated with GitHub OAuth
          console.error('[Create Item] Cannot determine GitHub username for noreply email. User may need to re-authenticate.');
          // Use user.email as last resort (may not count toward contributions if not verified on GitHub)
          authorEmail = user.email || undefined;
          if (!authorEmail) {
            throw new Error('Cannot determine author email for GitHub commit. Please ensure your GitHub account has a verified email address.');
          }
        }
      }

      // Determine contribution mode:
      // 1. If explicitly provided from checkbox, use it (overrides preference)
      // 2. Otherwise, check user preference (defaults to fork_pr if not set)
      let contributionMode: 'internal_app' | 'fork_pr' = 'fork_pr'; // Default to fork_pr
      
      if (githubContributionMode) {
        // Explicit mode from checkbox - use it directly
        contributionMode = githubContributionMode;
        console.log('[Create Item] Using explicit contribution mode from checkbox:', contributionMode);
      } else {
        // Check user preference (for backward compatibility)
        if (userId) {
          try {
            const { data: profile } = await admin
              .from(withTablePrefix('user_profiles'))
              .select('enable_github_fork_contributions')
              .eq('id', userId)
              .maybeSingle();
            
            // Default to fork_pr if not set (null) or if explicitly true
            if (profile?.enable_github_fork_contributions === false) {
              contributionMode = 'internal_app';
              console.log('[Create Item] User has disabled fork+PR mode (from preference)');
            } else {
              contributionMode = 'fork_pr';
              console.log('[Create Item] Using fork+PR mode (default or enabled)');
            }
          } catch (error) {
            console.warn('[Create Item] Failed to check user contribution mode, defaulting to fork_pr:', error);
            contributionMode = 'fork_pr'; // Default to fork_pr
          }
        }
      }

      // Call syncToGitHub service directly instead of HTTP call
      // Type the record properly for syncToGitHub
      const recordForSync = {
        id: created.id,
        slug: created.slug,
        name: created.name,
        description: created.description,
        category: created.category,
        tags: created.tags,
        status: created.status,
        created_by: created.created_by,
        created_at: created.created_at,
        ...(type === 'kpi' || type === 'metric' ? { formula: (created as { formula?: string }).formula } : {}),
      };

      const syncResult = await syncToGitHub({
        tableName: TABLE_MAP[type] as 'kpis' | 'events' | 'dimensions' | 'metrics' | 'dashboards',
        record: recordForSync,
        action: 'created',
        userLogin: user.user_metadata?.preferred_username as string || 
                   user.user_metadata?.user_name as string || 
                   userName || 'unknown',
        userName: user.user_metadata?.full_name as string || userName,
        userEmail: authorEmail,
        contributorName: user.user_metadata?.preferred_username as string || 
                        user.user_metadata?.user_name as string || 
                        userName || 'unknown',
        userId: userId, // Pass userId for token retrieval
        mode: contributionMode, // Pass the determined contribution mode
      });

      if (syncResult.success) {
        githubResult = {
          success: true,
          pr_url: syncResult.pr_url,
        };

        // Update the item with GitHub PR info
        await admin
          .from(tableName)
          .update({
            github_commit_sha: syncResult.commit_sha,
            github_pr_number: syncResult.pr_number,
            github_pr_url: syncResult.pr_url,
            github_file_path: syncResult.file_path,
          })
          .eq('id', created.id);

        // CRITICAL: Save user preference based on the mode used
        // This ensures future edits will use the same mode
        if (userId) {
          try {
            const profileTable = withTablePrefix('user_profiles');
            const { error: prefError } = await admin
              .from(profileTable)
              .update({
                enable_github_fork_contributions: contributionMode === 'fork_pr',
              })
              .eq('id', userId);
            
            if (prefError) {
              console.warn('[Items Create] Failed to save fork preference (non-critical):', prefError);
              // Don't fail the request - preference save is non-critical
            } else {
              console.log('[Items Create] Saved contribution preference for user:', userId, 'mode:', contributionMode);
            }
          } catch (prefErr) {
            console.warn('[Items Create] Exception saving fork preference (non-critical):', prefErr);
            // Don't fail the request - preference save is non-critical
          }
        }
      } else {
        // Check if this is a partial success (commit succeeded but PR failed)
        if (syncResult.commit_sha) {
          // Commit was created but PR failed - save commit info anyway
          githubResult = {
            success: false,
            error: syncResult.error || 'PR creation failed, but commit was created',
            commit_sha: syncResult.commit_sha,
            branch: syncResult.branch,
            file_path: syncResult.file_path,
          };
          
          // Save commit info even though PR creation failed
          await admin
            .from(tableName)
            .update({
              github_commit_sha: syncResult.commit_sha,
              github_file_path: syncResult.file_path,
              // Don't set PR fields since PR creation failed
            })
            .eq('id', created.id);
          
          console.warn('[Items Create] Partial GitHub success - commit created but PR failed:', syncResult.error);
          
          // Save preference even on partial success - user's intent was fork+PR
          // Use original contributionMode, not syncResult.mode (which might be 'internal_app' after fallback)
          if (userId && contributionMode === 'fork_pr') {
            try {
              const profileTable = withTablePrefix('user_profiles');
              await admin
                .from(profileTable)
                .update({
                  enable_github_fork_contributions: true,
                })
                .eq('id', userId);
              console.log('[Items Create] Saved fork+PR preference (partial success)');
            } catch (prefErr) {
              console.warn('[Items Create] Failed to save preference on partial success (non-critical):', prefErr);
            }
          }
        } else {
          // Complete failure - no commit was created
          githubResult = {
            success: false,
            error: syncResult.error || 'GitHub sync failed',
          };
          console.error('GitHub sync failed:', syncResult.error);
        }
        
        // If reauth is required for fork+PR, return early with proper status
        // For fork+PR, this is critical - user explicitly chose this mode
        if (syncResult.requiresReauth && contributionMode === 'fork_pr') {
          return NextResponse.json(
            {
              success: false,
              error: syncResult.error || 'GitHub authorization expired. Please sign in again to use Fork + Create.',
              requiresReauth: true,
            },
            { status: 401 }
          );
        }
        // For internal_app, reauth is less critical - item is still created
      }
    } catch (githubErr) {
      console.error('Exception during GitHub sync:', githubErr);
      githubResult = {
        success: false,
        error: githubErr instanceof Error ? githubErr.message : 'GitHub sync exception',
      };
    }

    // Return success response
    return NextResponse.json({
      success: true,
      item: {
        id: created.id,
        slug: created.slug,
        name: created.name,
      },
      contribution: contributionCreated,
      github: githubResult,
    });
  } catch (error: unknown) {
    console.error('Error in create item API:', error);
    const message = error instanceof Error ? error.message : 'Failed to create item';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

