import { NextRequest } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { ok, badRequest, unauthorized, forbidden, error as errorResp } from '@/lib/api/response';
import { withTablePrefix } from '@/src/types/entities';

type ItemType = 'kpi' | 'metric' | 'dimension' | 'event' | 'dashboard';

const TABLE_CONFIG: Record<ItemType, { table: string }> = {
  kpi: { table: withTablePrefix('kpis') },
  metric: { table: withTablePrefix('metrics') },
  dimension: { table: withTablePrefix('dimensions') },
  event: { table: withTablePrefix('events') },
  dashboard: { table: withTablePrefix('dashboards') },
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

    // Require admin or editor role
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
        status: 'rejected',
        last_modified_by: userName,
        last_modified_at: timestamp,
      })
      .eq('id', itemId)
      .select()
      .single();

    if (updateError || !updated) {
      return errorResp(updateError?.message || 'Failed to reject record', 500);
    }

    return ok({ rejected: true, item: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to reject item';
    console.error('[Editor Reject] Error', error);
    return errorResp(message, 500);
  }
}

