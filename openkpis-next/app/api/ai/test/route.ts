import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * Test OpenAI API key endpoint
 * This endpoint validates the key source and tests the API
 */
export async function GET(request: NextRequest) {
  try {
    // Get key from process.env (set by next.config.js)
    const processEnvKey = process.env.OPENAI_API_KEY;
    
    // Also read directly from .Credentials.txt for comparison
    const credentialsPath = path.join(process.cwd(), '../credentials/.Credentials.txt');
    let fileKey: string | null = null;
    
    try {
      if (fs.existsSync(credentialsPath)) {
        const fileContent = fs.readFileSync(credentialsPath, 'utf8');
        const match = fileContent.match(/^OPENAI_API_KEY\s*=\s*(.+)$/m);
        if (match) {
          fileKey = match[1].trim().replace(/^["']|["']$/g, '');
        }
      }
    } catch (e) {
      // File read failed, that's okay
    }

    // Diagnostic information
    const diagnostics = {
      processEnv: {
        exists: !!processEnvKey,
        prefix: processEnvKey ? processEnvKey.substring(0, 20) : null,
        suffix: processEnvKey ? '...' + processEnvKey.substring(processEnvKey.length - 10) : null,
        length: processEnvKey?.length || 0,
        hasOldKey: processEnvKey?.includes('yKSYHv5k') || false,
        hasCorrectKey: processEnvKey?.includes('spXzvD9m19lkfWkzFS6q8CvtCNPg7LSAZ') || false,
      },
      file: {
        exists: !!fileKey,
        prefix: fileKey ? fileKey.substring(0, 20) : null,
        suffix: fileKey ? '...' + fileKey.substring(fileKey.length - 10) : null,
        length: fileKey?.length || 0,
        hasOldKey: fileKey?.includes('yKSYHv5k') || false,
        hasCorrectKey: fileKey?.includes('spXzvD9m19lkfWkzFS6q8CvtCNPg7LSAZ') || false,
      },
      match: {
        keysMatch: processEnvKey === fileKey,
        bothHaveCorrect: (processEnvKey?.includes('spXzvD9m') && fileKey?.includes('spXzvD9m')) || false,
        mismatch: processEnvKey !== fileKey,
      },
    };

    if (!processEnvKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'OPENAI_API_KEY not found in process.env. Check next.config.js.',
          diagnostics,
        },
        { status: 500 }
      );
    }

    // Clean the key
    const cleanKey = processEnvKey.trim().replace(/\r?\n/g, '').replace(/\s+/g, '').replace(/^["']|["']$/g, '').trim();

    // Validate format
    if (!cleanKey.startsWith('sk-proj-')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid key format - must start with sk-proj-',
          diagnostics,
        },
        { status: 400 }
      );
    }

    // Check for old cached key
    if (cleanKey.endsWith('sa5UA') || cleanKey.includes('yKSYHv5k4AkQzVylinLZ8yvC_PQlDFmL0')) {
      return NextResponse.json(
        {
          success: false,
          error: 'DETECTED OLD/CACHED API KEY! Restart Next.js dev server to clear cache.',
          diagnostics,
          recommendation: 'Kill all Node processes, clear .next cache, restart server',
        },
        { status: 400 }
      );
    }

    // Test API call
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cleanKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Say "test successful"' }],
        max_tokens: 10,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: 'API request failed',
          status: response.status,
          response: data,
          diagnostics,
          keyInfo: {
            prefix: cleanKey.substring(0, 30),
            suffix: '...' + cleanKey.substring(cleanKey.length - 30),
            length: cleanKey.length,
          },
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'API key is valid and working!',
      diagnostics,
      keyInfo: {
        prefix: cleanKey.substring(0, 30),
        suffix: '...' + cleanKey.substring(cleanKey.length - 30),
        length: cleanKey.length,
        source: 'next.config.js → .Credentials.txt',
      },
      response: data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
