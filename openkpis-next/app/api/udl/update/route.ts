import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withTablePrefix } from '@/src/types/entities';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, schema } = await req.json();

    if (!id || !schema) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { error: dbError } = await supabase
      .from(withTablePrefix('unified_data_layers'))
      .update({
        draft_schema: schema,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (dbError) {
      console.error('UDL Update Error:', dbError);
      return NextResponse.json({ error: 'Failed to update UDL' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('API /api/udl/update Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
