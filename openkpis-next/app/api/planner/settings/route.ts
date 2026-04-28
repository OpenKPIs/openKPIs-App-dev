import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const SETTINGS_FILE_PATH = path.join(process.cwd(), 'settings.local.json');

export async function GET() {
  try {
    const data = await fs.readFile(SETTINGS_FILE_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'ENOENT') {
      // File doesn't exist yet, return empty object (the client will merge with default settings)
      return NextResponse.json({});
    }
    console.error('Error reading settings:', error);
    return NextResponse.json({ error: 'Failed to read settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const newSettings = await req.json();
    await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(newSettings, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error writing settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
