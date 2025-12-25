import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { withTablePrefix } from '@/src/types/entities';

type ItemType = 'kpi' | 'metric' | 'dimension' | 'event' | 'dashboard';

const TABLE_MAP: Record<ItemType, string> = {
  kpi: 'kpis',
  metric: 'metrics',
  dimension: 'dimensions',
  event: 'events',
  dashboard: 'dashboards',
};

/**
 * Create a draft version from a published item
 * This allows any authenticated user to edit a published item by creating a draft
 * The draft will go through the editorial review process
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ kind: string; id: string }> }
) {
  try {
    const { kind, id } = await params;

    if (!kind || !id) {
      return NextResponse.json(
        { error: 'Kind and ID are required' },
        { status: 400 }
      );
    }

    const itemType = kind as ItemType;
    if (!TABLE_MAP[itemType]) {
      return NextResponse.json(
        { error: `Invalid item type: ${itemType}` },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const tableName = withTablePrefix(TABLE_MAP[itemType]);
    const admin = createAdminClient();

    // Fetch the published item
    const { data: publishedItem, error: fetchError } = await admin
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !publishedItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Check if item is published
    if (publishedItem.status !== 'published') {
      return NextResponse.json(
        { error: 'Item is not published. Only published items can be edited via this endpoint.' },
        { status: 400 }
      );
    }

    const userName = user.user_metadata?.user_name || user.email || 'unknown';
    const userId = user.id;

    // Check if a draft already exists for this published item
    // We'll use the same slug but check for existing drafts
    const { data: existingDraft } = await admin
      .from(tableName)
      .select('id, slug, status')
      .eq('slug', publishedItem.slug)
      .eq('status', 'draft')
      .maybeSingle();

    if (existingDraft) {
      // Draft already exists, return it
      return NextResponse.json({
        success: true,
        draftId: existingDraft.id,
        slug: existingDraft.slug,
        message: 'Draft already exists for this item',
        isNew: false,
      });
    }

    // Create a new draft by copying all fields from the published item
    // Remove fields that should be reset for the draft
    const {
      id: _id,
      status: _status,
      created_by: _created_by,
      created_at: _created_at,
      last_modified_by: _last_modified_by,
      last_modified_at: _last_modified_at,
      github_commit_sha: _github_commit_sha,
      github_pr_number: _github_pr_number,
      github_pr_url: _github_pr_url,
      github_file_path: _github_file_path,
      ...draftData
    } = publishedItem;

    // Create the draft with new metadata
    const draftPayload = {
      ...draftData,
      status: 'draft',
      created_by: userName, // The user creating the draft
      created_at: new Date().toISOString(),
      last_modified_by: userName,
      last_modified_at: new Date().toISOString(),
      // Clear GitHub metadata (will be set when draft is published)
      github_commit_sha: null,
      github_pr_number: null,
      github_pr_url: null,
      github_file_path: null,
    };

    const { data: createdDraft, error: insertError } = await admin
      .from(tableName)
      .insert(draftPayload)
      .select()
      .single();

    if (insertError || !createdDraft) {
      console.error('Error creating draft:', insertError);
      return NextResponse.json(
        { error: insertError?.message || 'Failed to create draft' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      draftId: createdDraft.id,
      slug: createdDraft.slug,
      message: 'Draft created successfully',
      isNew: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create draft';
    console.error('[Create Draft] Error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

