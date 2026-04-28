import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withTablePrefix } from '@/src/types/entities';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, items, customFields, id } = body;

    if (!name || !items) {
      return NextResponse.json({ error: 'Name and items are required' }, { status: 400 });
    }

    const planData = {
      user_id: user.id,
      name,
      description: description || null,
      items: items || [],
      custom_fields: customFields || [],
      updated_at: new Date().toISOString(),
    };

    if (id) {
      // Update existing
      const { data, error } = await supabase
        .from(withTablePrefix('tracking_plans'))
        .update(planData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    } else {
      // Insert new
      const { data, error } = await supabase
        .from(withTablePrefix('tracking_plans'))
        .insert([{ ...planData, created_at: planData.updated_at }])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

  } catch (error) {
    console.error('Error saving tracking plan:', error);
    return NextResponse.json({ error: 'Failed to save tracking plan' }, { status: 500 });
  }
}
