import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const provider = searchParams.get('provider');
  const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!provider) {
    return NextResponse.json({ error: 'Provider is required' }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json({ error: 'API Key is required' }, { status: 401 });
  }

  try {
    let models: { id: string; label: string }[] = [];

    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch OpenAI models');
      const data = await res.json();
      // Filter for chat models
      const chatModels = data.data.filter((m: any) => m.id.startsWith('gpt-') || m.id.startsWith('o1') || m.id.startsWith('o3'));
      // Sort by creation date or alphabetically
      chatModels.sort((a: any, b: any) => b.created - a.created);
      models = chatModels.map((m: any) => ({ id: m.id, label: m.id }));
    } 
    else if (provider === 'anthropic') {
      // Anthropic recently added a models endpoint
      const res = await fetch('https://api.anthropic.com/v1/models', {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch Anthropic models');
      const data = await res.json();
      const chatModels = data.data.filter((m: any) => m.type === 'model');
      models = chatModels.map((m: any) => ({ id: m.id, label: m.display_name || m.id }));
    }
    else if (provider === 'google') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (!res.ok) throw new Error('Failed to fetch Google models');
      const data = await res.json();
      const chatModels = data.models.filter((m: any) => m.supportedGenerationMethods.includes('generateContent'));
      models = chatModels.map((m: any) => ({ id: m.name.replace('models/', ''), label: m.displayName || m.name }));
    }
    else {
      return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
    }

    return NextResponse.json({ models });
  } catch (error: any) {
    console.error('Model fetch error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch models' }, { status: 500 });
  }
}
