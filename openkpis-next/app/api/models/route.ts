import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const provider = searchParams.get('provider');
  const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!provider) {
    return NextResponse.json({ error: 'Provider is required' }, { status: 400 });
  }

  let resolvedKey = apiKey;

  if (!resolvedKey || resolvedKey === 'null' || resolvedKey === 'undefined') {
    // Fallback to server environment variables if user hasn't provided a BYOK key
    if (provider === 'openai') resolvedKey = process.env.OPENAI_API_KEY || '';
    if (provider === 'anthropic') resolvedKey = process.env.ANTHROPIC_API_KEY || '';
    if (provider === 'google') resolvedKey = process.env.GOOGLE_GEMINI_API_KEY || '';
  }

  if (!resolvedKey) {
    return NextResponse.json({ error: 'API Key is required (either BYOK or Server)' }, { status: 401 });
  }

  try {
    let models: { id: string; label: string }[] = [];

    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${resolvedKey}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch OpenAI models');
      const data = await res.json();
      // Filter for chat models
      const chatModels = data.data.filter((m: { id: string; created: number }) => m.id.startsWith('gpt-') || m.id.startsWith('o1') || m.id.startsWith('o3'));
      // Sort by creation date or alphabetically
      chatModels.sort((a: { created: number }, b: { created: number }) => b.created - a.created);
      models = chatModels.map((m: { id: string }) => ({ id: m.id, label: m.id }));
    } 
    else if (provider === 'anthropic') {
      // Anthropic recently added a models endpoint
      const res = await fetch('https://api.anthropic.com/v1/models', {
        headers: {
          'x-api-key': resolvedKey,
          'anthropic-version': '2023-06-01',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch Anthropic models');
      const data = await res.json();
      const chatModels = data.data.filter((m: { type: string; id: string; display_name?: string }) => m.type === 'model');
      models = chatModels.map((m: { id: string; display_name?: string }) => ({ id: m.id, label: m.display_name || m.id }));
    }
    else if (provider === 'google') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${resolvedKey}`);
      if (!res.ok) throw new Error('Failed to fetch Google models');
      const data = await res.json();
      const chatModels = data.models.filter((m: { supportedGenerationMethods: string[]; name: string; displayName?: string }) => m.supportedGenerationMethods.includes('generateContent'));
      models = chatModels.map((m: { name: string; displayName?: string }) => ({ id: m.name.replace('models/', ''), label: m.displayName || m.name }));
    }
    else {
      return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
    }

    return NextResponse.json({ models });
  } catch (error: unknown) {
    console.error('Model fetch error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to fetch models' }, { status: 500 });
  }
}
