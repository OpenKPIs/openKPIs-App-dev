import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export interface AIUsageAuthResult {
  apiKey: string;
  isUsingDefaultKey: boolean;
  userId?: string;
  currentCount: number;
  errorResponse?: NextResponse;
}

export async function authorizeAIRequest(clientKey?: string): Promise<AIUsageAuthResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (clientKey && clientKey.trim() !== '') {
    // User provided their own key, let them use it unhindered
    return {
      apiKey: clientKey,
      isUsingDefaultKey: false,
      userId: user?.id,
      currentCount: 0,
    };
  }

  // No key provided. Proceed with Trial Logic
  if (!user) {
    return {
      apiKey: '',
      isUsingDefaultKey: true,
      currentCount: 0,
      errorResponse: NextResponse.json({ error: 'Please sign in or click ⚙ Settings to provide your own API key.' }, { status: 401 }),
    };
  }

  const aiGenerationsCount = user.user_metadata?.ai_generations_count || 0;

  if (aiGenerationsCount >= 5) {
    return {
      apiKey: '',
      isUsingDefaultKey: true,
      userId: user.id,
      currentCount: aiGenerationsCount,
      errorResponse: NextResponse.json({ error: 'You have reached your 5 free AI generations limit. Please open ⚙ Settings to add your own API key to continue.' }, { status: 403 }),
    };
  }

  const defaultKey = process.env.OPENAI_API_KEY || '';
  if (!defaultKey) {
    return {
      apiKey: '',
      isUsingDefaultKey: true,
      userId: user.id,
      currentCount: aiGenerationsCount,
      errorResponse: NextResponse.json({ error: 'No default site key configured. Please provide your own API key in ⚙ Settings.' }, { status: 500 }),
    };
  }

  return {
    apiKey: defaultKey,
    isUsingDefaultKey: true,
    userId: user.id,
    currentCount: aiGenerationsCount,
  };
}

export async function incrementAIUsage(userId: string, currentCount: number) {
  const admin = createAdminClient();
  await admin.auth.admin.updateUserById(userId, {
    user_metadata: { ai_generations_count: currentCount + 1 }
  });
}
