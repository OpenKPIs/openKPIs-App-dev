import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withTablePrefix } from '@/src/types/entities';

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

type SubmitItem = {
  type: 'kpi' | 'metric' | 'dimension';
  item: {
    name: string;
    description?: string;
    category?: string;
    tags?: string[];
    formula?: string;
  };
};

const contributionsTable = withTablePrefix('contributions');
const auditLogTable = withTablePrefix('audit_log');

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { items } = (await request.json()) as { items: SubmitItem[] };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      );
    }

    // Get current user (validated)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user) {
      console.error('[Submit New Items] Auth error (getUser):', userError);
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userName = user.user_metadata?.user_name || user.email;
    const userId = user.id;

    const submittedIds: string[] = [];

    // Process each item
    for (const { type, item } of items) {
      try {
        const slug = createSlug(item.name);
        const tableName = withTablePrefix(`${type}s`); // kpis, metrics, dimensions

        // Check if item already exists
        const { data: existing } = await supabase
          .from(tableName)
          .select('id, slug')
          .eq('slug', slug)
          .single();

        if (existing) {
          // Item already exists, skip
          submittedIds.push(existing.id);
          continue;
        }

        // Insert new item with draft status
        const insertData: Record<string, unknown> = {
          slug,
          name: item.name,
          description: item.description || null,
          category: item.category || null,
          tags: item.tags || [],
          status: 'draft',
          created_by: userName,
        };

        // Add type-specific fields
        if (type === 'kpi') {
          insertData.formula = item.formula || null;
        }

        const { data: newItem, error: insertError } = await supabase
          .from(tableName)
          .insert(insertData)
          .select()
          .single();

        if (insertError) {
          console.error(`Error creating ${type}:`, insertError);
          continue; // Skip on error
        }

        submittedIds.push(newItem.id);

        // Log to audit trail
        await supabase.from(auditLogTable).insert({
          table_name: tableName,
          record_id: newItem.id,
          action: 'created',
          user_login: userName,
          user_name: user.user_metadata?.full_name || userName,
          user_email: user.email,
          user_avatar_url: user.user_metadata?.avatar_url,
          changes: item,
        });

        // Create contribution record
        await supabase.from(contributionsTable).insert({
          user_id: userId,
          item_type: type,
          item_id: newItem.id,
          item_slug: slug,
          action: 'created',
          status: 'pending',
        });

        // Trigger GitHub sync in parallel (non-blocking) for KPIs
        // This creates a PR immediately for user contribution, even if item is draft
        if (type === 'kpi') {
          // Use absolute URL for internal API call
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                         request.headers.get('origin') || 
                         'http://localhost:3000';
          
          // Fire and forget - don't wait for GitHub sync to complete
          // This allows the response to return immediately while PR is created in background
          fetch(`${baseUrl}/api/items/kpi/${newItem.id}/sync-github`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              // Forward auth headers if available
              ...(request.headers.get('authorization') && {
                'authorization': request.headers.get('authorization')!
              })
            },
            body: JSON.stringify({ action: 'created' }),
          }).catch(err => {
            console.error(`[Submit New Items] Background GitHub sync failed for KPI ${newItem.id}:`, err);
            // Don't fail the request if GitHub sync fails - it's non-critical
          });
        }
        // Note: For metrics/dimensions, add similar sync routes if needed
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error processing ${type} ${item.name}:`, message);
        // Continue with next item
      }
    }

    return NextResponse.json({
      success: true,
      submitted: submittedIds.length,
      message: `Successfully submitted ${submittedIds.length} new item(s) as drafts`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to submit new items';
    console.error('[Submit New Items] Error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

