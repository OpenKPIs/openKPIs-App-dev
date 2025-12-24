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

    const { data: updated, error: updateError } = await admin
      .from(config.table)
      .update({
        status: 'published',
        last_modified_by: userName,
        last_modified_at: timestamp,
      })
      .eq('id', itemId)
      .select()
      .single();

    if (updateError || !updated) {
      return errorResp(updateError?.message || 'Failed to update record', 500);
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.headers.get('origin') ||
      new URL(request.url).origin;

    const syncResponse = await fetch(`${baseUrl}${config.syncPath(itemId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'edited' }),
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
