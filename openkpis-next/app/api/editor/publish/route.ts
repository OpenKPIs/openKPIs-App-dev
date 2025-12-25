import { NextRequest } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { ok, badRequest, unauthorized, forbidden, error as errorResp, multiStatus } from '@/lib/api/response';
import { withTablePrefix } from '@/src/types/entities';

type ItemType = 'kpi' | 'metric' | 'dimension' | 'event' | 'dashboard';

const TABLE_CONFIG: Record<ItemType, { table: string; syncPath: (id: string) => string }> = {
  kpi: { table: withTablePrefix('kpis'), syncPath: (id: string) => `/api/items/kpi/${id}/sync-github` },
  metric: { table: withTablePrefix('metrics'), syncPath: (id: string) => `/api/items/metric/${id}/sync-github` },
  dimension: { table: withTablePrefix('dimensions'), syncPath: (id: string) => `/api/items/dimension/${id}/sync-github` },
  event: { table: withTablePrefix('events'), syncPath: (id: string) => `/api/items/event/${id}/sync-github` },
  dashboard: { table: withTablePrefix('dashboards'), syncPath: (id: string) => `/api/items/dashboard/${id}/sync-github` },
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return unauthorized();
    }

    // Require admin or editor role (shared helper)
    const { getUserRoleServer } = await import('@/lib/roles/server');
    const role = await getUserRoleServer();
    const isAuthorized = role === 'admin' || role === 'editor';
    if (!isAuthorized) {
      return forbidden();
    }

    const { itemType, itemId } = (await request.json()) as {
      itemType?: ItemType;
      itemId?: string;
    };

    if (!itemType || !itemId) {
      return badRequest('itemType and itemId are required');
    }

    const config = itemType ? TABLE_CONFIG[itemType] : undefined;

    if (!config) {
      return badRequest(`Unsupported item type: ${itemType}`);
    }

    const admin = createAdminClient();
    const userName = user.user_metadata?.user_name || user.email;
    const timestamp = new Date().toISOString();

    // Step 1: Check if this is a draft that was created from a published item
    // If so, we should update the original published item instead of the draft
    const { data: draftItem } = await admin
      .from(config.table)
      .select('id, slug, status')
      .eq('id', itemId)
      .single();

    if (!draftItem || draftItem.status !== 'draft') {
      return errorResp('Item is not a draft', 400);
    }

    // Check if there's already a published item with the same slug
    const { data: existingPublished } = await admin
      .from(config.table)
      .select('id')
      .eq('slug', draftItem.slug)
      .eq('status', 'published')
      .neq('id', itemId) // Exclude the draft itself
      .maybeSingle();

    let updated;
    if (existingPublished) {
      // Update the original published item with data from the draft
      // First, get all data from the draft
      const { data: draftData } = await admin
        .from(config.table)
        .select('*')
        .eq('id', itemId)
        .single();

      if (!draftData) {
        return errorResp('Draft not found', 404);
      }

      // Copy all fields from draft to published item (except id, status, created_by, created_at)
      const {
        id: _id,
        status: _status,
        created_by: _created_by,
        created_at: _created_at,
        ...updateData
      } = draftData;

      // Update the original published item
      const { data: updatedPublished, error: updateError } = await admin
        .from(config.table)
        .update({
          ...updateData,
          status: 'published',
          last_modified_by: userName,
          last_modified_at: timestamp,
        })
        .eq('id', existingPublished.id)
        .select()
        .single();

      if (updateError || !updatedPublished) {
        return errorResp(updateError?.message || 'Failed to update published item', 500);
      }

      // Delete the draft since we've updated the original
      await admin
        .from(config.table)
        .delete()
        .eq('id', itemId);

      updated = updatedPublished;
    } else {
      // No existing published item, just update the draft to published
      const { data: updatedDraft, error: updateError } = await admin
        .from(config.table)
        .update({
          status: 'published',
          last_modified_by: userName,
          last_modified_at: timestamp,
        })
        .eq('id', itemId)
        .select()
        .single();

      if (updateError || !updatedDraft) {
        return errorResp(updateError?.message || 'Failed to update record', 500);
      }

      updated = updatedDraft;
    }

    // Step 2: Sync to GitHub with ALL fields fetched fresh from database
    // Use the updated item's ID (which may be the original published item's ID)
    // The sync endpoint will fetch the complete record with .select('*') to ensure
    // all fields from the edit flow are included in the GitHub PR
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.headers.get('origin') ||
      new URL(request.url).origin;

    const syncResponse = await fetch(`${baseUrl}${config.syncPath(updated.id)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'published' }),
    });

    if (!syncResponse.ok) {
      const errorBody = await syncResponse.json().catch(() => ({}));
      console.error('[Editor Publish] GitHub sync failed', errorBody);
      return multiStatus('Item published but GitHub sync failed', errorBody);
    }

    return ok({ published: true, item: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to publish item';
    console.error('[Editor Publish] Error', error);
    return errorResp(message, 500);
  }
}
