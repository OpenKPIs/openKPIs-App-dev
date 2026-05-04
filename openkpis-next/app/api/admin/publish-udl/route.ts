import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withTablePrefix } from '@/src/types/entities';
import { publishUDLToGithub } from '@/lib/github/publishUDL';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // In a real app, verify Admin privileges here
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { platform, monolithicSchema, isManualDraftApprove, udlId } = await req.json();

    if (!platform || !monolithicSchema) {
      return NextResponse.json({ error: 'Platform and schema required' }, { status: 400 });
    }

    // 1. Update the database with the monolithic master schema
    let updatePayload: any = { 
      master_schema: monolithicSchema,
      updated_at: new Date().toISOString()
    };
    
    if (isManualDraftApprove) {
       updatePayload.draft_schema = null;
    }

    let query = supabase
      .from(withTablePrefix('unified_data_layers'))
      .update(updatePayload);
      
    if (udlId) {
       query = query.eq('id', udlId);
    } else {
       query = query.eq('platform', platform).eq('industry', 'Global');
    }

    const { error: dbError } = await query;

    if (dbError) {
      console.error('Database Update Error:', dbError);
      return NextResponse.json({ error: 'Failed to update Master UDL in database' }, { status: 500 });
    }

    // 2. Publish the filtered subsets to Github
    const githubRes = await publishUDLToGithub(monolithicSchema, platform);

    if (!githubRes.success) {
      return NextResponse.json({ 
        error: 'Database updated, but GitHub sync failed.',
        details: githubRes.error 
      }, { status: 207 });
    }

    return NextResponse.json({ success: true, mocked: githubRes.mocked });

  } catch (error) {
    console.error('UDL Publish Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
