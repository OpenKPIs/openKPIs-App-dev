import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';

// Helper to escape CSV values
function escapeCSV(val: unknown): string {
  if (val === null || val === undefined) return '';
  let str = '';
  if (Array.isArray(val)) {
    str = val.join('; ');
  } else if (typeof val === 'object') {
    str = JSON.stringify(val);
  } else {
    str = String(val);
  }
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { filePath, data } = body;

    if (!filePath || !data) {
      return NextResponse.json({ error: 'filePath and data are required' }, { status: 400 });
    }

    // Resolve path relative to project root if it's not absolute
    const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
    const dir = path.dirname(absolutePath);

    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true });

    const fileExists = fsSync.existsSync(absolutePath);
    
    // Support single object or array of objects
    const dataItems = Array.isArray(data) ? data : [data];
    if (dataItems.length === 0) {
       return NextResponse.json({ success: true, message: 'No data to save.' });
    }

    if (!fileExists) {
      // Create new file with headers
      const headers = Object.keys(dataItems[0]);
      let content = headers.map(escapeCSV).join(',') + '\n';
      
      for (const item of dataItems) {
         content += headers.map(k => escapeCSV(item[k])).join(',') + '\n';
      }
      
      await fs.writeFile(absolutePath, content, 'utf-8');
      return NextResponse.json({ success: true, message: 'Created new file and added rows.' });
    } else {
      // Append to existing file
      const fileContent = await fs.readFile(absolutePath, 'utf-8');
      const lines = fileContent.split('\n');
      const headerLine = lines[0]?.trim();
      
      if (!headerLine) {
        // File is empty, treat as new
        const headers = Object.keys(dataItems[0]);
        let content = headers.map(escapeCSV).join(',') + '\n';
        for (const item of dataItems) {
           content += headers.map(k => escapeCSV(item[k])).join(',') + '\n';
        }
        await fs.writeFile(absolutePath, content, 'utf-8');
        return NextResponse.json({ success: true, message: 'Wrote headers and rows to empty file.' });
      }

      const headers = headerLine.split(',').map(h => h.replace(/^"|"$/g, '').replace(/""/g, '"'));
      
      let appendContent = '';
      for (const item of dataItems) {
        appendContent += headers.map(h => escapeCSV(item[h] ?? '')).join(',') + '\n';
      }
      
      await fs.appendFile(absolutePath, appendContent, 'utf-8');
      
      return NextResponse.json({ success: true, message: 'Appended rows to existing file.' });
    }
  } catch (error) {
    console.error('Error appending to document:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to append to document' }, { status: 500 });
  }
}
