import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

export async function POST(req: Request) {
  try {
    const { filePath } = await req.json();

    if (!filePath) {
      return NextResponse.json({ error: 'filePath is required' }, { status: 400 });
    }

    const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
    // Open the parent directory instead of executing the file directly
    const dir = path.dirname(absolutePath);

    // Make sure folder exists so Windows Explorer doesn't throw an error if file wasn't created yet
    await fs.mkdir(dir, { recursive: true });

    // This is Windows-specific since we know the user is on Windows
    exec(`start "" "${dir}"`, (error) => {
      if (error) {
        console.error('Failed to open folder:', error);
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error opening folder:', error);
    return NextResponse.json({ error: 'Failed to open folder' }, { status: 500 });
  }
}
