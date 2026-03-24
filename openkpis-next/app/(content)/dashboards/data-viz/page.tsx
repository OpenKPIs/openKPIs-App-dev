'use client';

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

interface ParsedDataset {
  fileName: string;
  rows: Record<string, unknown>[];
  columns: string[];
}

export default function DataSourcePage() {
  const [dataset, setDataset] = useState<ParsedDataset | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File exceeds the 5MB limit. Please upload a smaller dataset.');
      return;
    }

    setError(null);
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result as string;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rows = XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[];
        if (rows.length === 0) throw new Error('The file appears empty.');
        const columns = Object.keys(rows[0]);
        setDataset({ fileName: file.name, rows, columns });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse file.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Data Source</h1>
        <p style={{ color: 'var(--ifm-color-emphasis-600)', fontSize: '1rem', lineHeight: 1.6 }}>
          Upload your own CSV or Excel file to power your dashboard visualizations with real data.
          Your data stays in your browser — it is never sent to our servers.
        </p>
      </div>

      {/* Upload Card */}
      <div style={{ border: '2px dashed var(--ifm-color-primary)', borderRadius: '16px', padding: '3rem', textAlign: 'center', background: 'rgba(30,136,229,0.03)', marginBottom: '2rem', cursor: 'pointer' }}
        onClick={() => fileInputRef.current?.click()}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📂</div>
        <p style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.5rem' }}>
          {uploading ? 'Parsing your file...' : 'Click to upload or drag & drop'}
        </p>
        <p style={{ color: 'var(--ifm-color-emphasis-600)', fontSize: '0.875rem', margin: 0 }}>
          CSV or Excel (.xlsx, .xls) up to 5MB
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv, .xlsx, .xls"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      {error && (
        <div style={{ padding: '1rem 1.25rem', background: '#fff1f1', border: '1px solid #fca5a5', borderRadius: '8px', color: '#b91c1c', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {dataset && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', padding: '1rem 1.25rem', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px' }}>
            <span style={{ fontSize: '1.25rem' }}>✅</span>
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: '#15803d' }}>Successfully loaded: {dataset.fileName}</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#166534' }}>{dataset.rows.length} rows · {dataset.columns.length} columns</p>
            </div>
            <button
              onClick={() => { setDataset(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
              style={{ marginLeft: 'auto', fontSize: '0.75rem', padding: '0.3rem 0.8rem', border: '1px solid #86efac', borderRadius: '6px', background: 'white', color: '#15803d', cursor: 'pointer' }}
            >
              Clear
            </button>
          </div>

          {/* Column Schema Preview */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Detected Columns</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {dataset.columns.map(col => (
                <span key={col} style={{ padding: '0.3rem 0.8rem', background: 'var(--ifm-color-emphasis-100)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 500, fontFamily: 'monospace' }}>
                  {col}
                </span>
              ))}
            </div>
          </div>

          {/* Data Preview Table */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Data Preview (first 5 rows)</h3>
            <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ background: 'var(--ifm-color-emphasis-50)' }}>
                    {dataset.columns.map(col => (
                      <th key={col} style={{ padding: '0.6rem 1rem', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid var(--ifm-color-emphasis-200)', whiteSpace: 'nowrap' }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataset.rows.slice(0, 5).map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--ifm-color-emphasis-100)' }}>
                      {dataset.columns.map(col => (
                        <td key={col} style={{ padding: '0.5rem 1rem', whiteSpace: 'nowrap', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {String(row[col] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ marginTop: '2rem', padding: '1rem 1.25rem', background: 'var(--ifm-color-emphasis-50)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--ifm-color-emphasis-700)' }}>
            <strong>Next step:</strong> Go to any Dashboard and select this data source from the visualization settings to bind your data to the charts.
          </div>
        </div>
      )}

      {!dataset && !uploading && (
        <div style={{ marginTop: '1rem', padding: '1.25rem', background: 'var(--ifm-color-emphasis-50)', borderRadius: '12px', fontSize: '0.875rem' }}>
          <strong>💡 Tip:</strong> You can also use our built-in mock datasets in the <a href="/ai-analyst" style={{ color: 'var(--ifm-color-primary)' }}>AI Analyst</a> to quickly prototype a dashboard without any data upload.
        </div>
      )}
    </main>
  );
}
