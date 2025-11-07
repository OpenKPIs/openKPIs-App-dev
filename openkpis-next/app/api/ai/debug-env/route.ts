import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * Debug endpoint - reads .env.local file directly from filesystem
 * This shows us EXACTLY what's in the file vs what Next.js loaded
 */
export async function GET(request: NextRequest) {
  try {
    const projectRoot = process.cwd();
    const envFilePath = path.join(projectRoot, '.env.local');
    
    // Read file directly from filesystem
    let fileContent = '';
    let fileExists = false;
    let keyFromFile = '';
    
    try {
      fileContent = fs.readFileSync(envFilePath, 'utf8');
      fileExists = true;
      
      // Extract OPENAI_API_KEY from file
      const lines = fileContent.split('\n');
      for (const line of lines) {
        if (line.trim().startsWith('OPENAI_API_KEY=') && !line.trim().startsWith('#')) {
          keyFromFile = line.split('=')[1]?.trim() || '';
          break;
        }
      }
    } catch (e) {
      fileExists = false;
    }
    
    // What Next.js loaded into process.env
    const keyFromProcessEnv = process.env.OPENAI_API_KEY || '';
    
    return NextResponse.json({
      diagnostic: 'This shows what file has vs what Next.js loaded',
      file: {
        exists: fileExists,
        path: envFilePath,
        keyFound: !!keyFromFile,
        keyLength: keyFromFile.length,
        keyPrefix: keyFromFile.substring(0, 30),
        keySuffix: '...' + keyFromFile.substring(Math.max(0, keyFromFile.length - 30)),
        hasWrongKey: keyFromFile.includes('yKSYHv5k4AkQzVylinLZ8yvC_PQlDFmL0'),
        hasCorrectKey: keyFromFile.includes('spXzv'),
      },
      processEnv: {
        keyExists: !!keyFromProcessEnv,
        keyLength: keyFromProcessEnv.length,
        keyPrefix: keyFromProcessEnv.substring(0, 30),
        keySuffix: '...' + keyFromProcessEnv.substring(Math.max(0, keyFromProcessEnv.length - 30)),
        hasWrongKey: keyFromProcessEnv.includes('yKSYHv5k4AkQzVylinLZ8yvC_PQlDFmL0'),
        hasCorrectKey: keyFromProcessEnv.includes('spXzv'),
      },
      match: {
        keysMatch: keyFromFile === keyFromProcessEnv,
        bothHaveCorrect: keyFromFile.includes('spXzv') && keyFromProcessEnv.includes('spXzv'),
        bothHaveWrong: keyFromFile.includes('yKSYHv5k4AkQzVylinLZ8yvC_PQlDFmL0') && keyFromProcessEnv.includes('yKSYHv5k4AkQzVylinLZ8yvC_PQlDFmL0'),
      },
      recommendation: keyFromFile.includes('yKSYHv5k4AkQzVylinLZ8yvC_PQlDFmL0') 
        ? 'The .env.local FILE itself has the wrong key. Update it or copy from credentials folder.'
        : keyFromProcessEnv.includes('yKSYHv5k4AkQzVylinLZ8yvC_PQlDFmL0')
        ? 'The file is correct but Next.js loaded wrong key. Check for other .env files or restart server.'
        : 'Both file and process.env look correct. Check server logs.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}


