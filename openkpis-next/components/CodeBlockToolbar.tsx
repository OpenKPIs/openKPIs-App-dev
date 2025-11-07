'use client';

import React, { useState, useEffect, useRef } from 'react';

interface CodeBlockToolbarProps {
  code: string;
  language?: string;
  blockId?: string;
  onEdit?: () => void;
}

export default function CodeBlockToolbar({ code, language = 'text', blockId, onEdit }: CodeBlockToolbarProps) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = blockId 
        ? `${window.location.origin}${window.location.pathname}#${blockId}`
        : window.location.href;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleDownload = () => {
    const extension = language === 'sql' ? 'sql' : language === 'json' ? 'json' : 'txt';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${extension}`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <>
      {/* Toolbar - appears on hover */}
      <div
        style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          zIndex: 10,
          padding: '0.25rem 0.375rem',
          borderRadius: '9999px',
          background: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid var(--ifm-color-emphasis-200)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          backdropFilter: 'saturate(140%) blur(6px)',
          transition: 'opacity 0.2s, visibility 0.2s',
          opacity: hovered ? 1 : 0.7,
          visibility: 'visible',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Copied!' : 'Copy'}
          style={{
            appearance: 'none',
            border: 'none',
            background: 'transparent',
            color: 'var(--ifm-font-color-base)',
            width: '28px',
            height: '28px',
            borderRadius: '9999px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--ifm-color-emphasis-200)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          {copied ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v12h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
            </svg>
          )}
        </button>

        {/* Edit Button */}
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit"
            style={{
              appearance: 'none',
              border: 'none',
              background: 'transparent',
              color: 'var(--ifm-font-color-base)',
              width: '28px',
              height: '28px',
              borderRadius: '9999px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--ifm-color-emphasis-200)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM21.41 6.34c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
          </button>
        )}

        {/* Copy Link Button */}
        <button
          type="button"
          onClick={handleCopyLink}
          aria-label="Copy Link"
          style={{
            appearance: 'none',
            border: 'none',
            background: 'transparent',
            color: 'var(--ifm-font-color-base)',
            width: '28px',
            height: '28px',
            borderRadius: '9999px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--ifm-color-emphasis-200)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
          </svg>
        </button>

        {/* Download Button */}
        <button
          type="button"
          onClick={handleDownload}
          aria-label="Download"
          style={{
            appearance: 'none',
            border: 'none',
            background: 'transparent',
            color: 'var(--ifm-font-color-base)',
            width: '28px',
            height: '28px',
            borderRadius: '9999px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--ifm-color-emphasis-200)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
          </svg>
        </button>
      </div>
    </>
  );
}
