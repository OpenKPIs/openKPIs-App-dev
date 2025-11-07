import { NextRequest, NextResponse } from 'next/server';

/**
 * Test endpoint to see what Next.js is actually loading
 * Shows where environment variables come from
 */
export async function GET(request: NextRequest) {
  const info = {
    // What's in process.env
    envVarExists: !!process.env.OPENAI_API_KEY,
    envVarLength: process.env.OPENAI_API_KEY?.length || 0,
    envVarPrefix: process.env.OPENAI_API_KEY?.substring(0, 20) || 'NOT FOUND',
    
    // Node environment
    nodeEnv: process.env.NODE_ENV,
    
    // Where Next.js loads from (this is automatic, we just document it)
    loadedFrom: 'Next.js automatically loads from .env.local when server starts',
    
    // File location
    envFileLocation: '.env.local (project root)',
    
    note: 'process.env is populated by Next.js from .env files. Changes require server restart.',
  };

  return NextResponse.json(info, { status: 200 });
}


