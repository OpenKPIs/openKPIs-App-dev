'use client';

import React, { useState, useEffect } from 'react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  headings?: Array<{ id: string; text: string; level: number }>;
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (headings && headings.length > 0) {
      setTocItems(headings);
      return;
    }

    // Auto-generate TOC from page headings
    const extractHeadings = () => {
      // Wait for content to be rendered
      const headingElements = document.querySelectorAll('article h2, article h3');
      const items: TOCItem[] = [];

      headingElements.forEach((heading) => {
        const text = heading.textContent?.trim() || '';
        if (!text) return;

        // Generate ID from text if not present
        let id = heading.id;
        if (!id) {
          id = text.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
          heading.id = id;
        }

        items.push({
          id,
          text,
          level: parseInt(heading.tagName.charAt(1)),
        });
      });

      setTocItems(items);
    };

    // Try immediately
    extractHeadings();

    // Also try after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      extractHeadings();
    }, 100);

    // Watch for intersection to highlight active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -80% 0px',
        threshold: [0, 0.5, 1],
      }
    );

    // Re-observe headings after extraction
    let timeoutId2: NodeJS.Timeout;
    const setupObserver = () => {
      const headingElements = document.querySelectorAll('article h2, article h3');
      headingElements.forEach((heading) => observer.observe(heading));
    };
    
    timeoutId2 = setTimeout(setupObserver, 200);

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
      if (timeoutId2) clearTimeout(timeoutId2);
    };
  }, [headings]);

  // Always render the container, even if empty (shows "On this page" header)
  // This ensures the right rail space is reserved

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <aside
      style={{
        position: 'sticky',
        top: '80px',
        height: 'fit-content',
        maxHeight: 'calc(100vh - 80px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        minWidth: 0,
        maxWidth: '100%',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--ifm-color-emphasis-50)',
          borderRadius: '8px',
          padding: '1rem',
        }}
      >
        <h3
          style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            marginBottom: '0.75rem',
            marginTop: 0,
            color: 'var(--ifm-color-emphasis-900)',
          }}
        >
          On this page
        </h3>
        {tocItems.length > 0 ? (
          <nav>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                fontSize: '0.875rem',
              }}
            >
              {tocItems.map((item) => (
                <li
                  key={item.id}
                  style={{
                    marginBottom: '0.5rem',
                    paddingLeft: item.level === 3 ? '1rem' : '0',
                  }}
                >
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToHeading(item.id);
                    }}
                    style={{
                      display: 'block',
                      textDecoration: 'none',
                      color: activeId === item.id 
                        ? 'var(--ifm-color-primary)' 
                        : 'var(--ifm-color-emphasis-700)',
                      fontWeight: activeId === item.id ? '500' : '400',
                      borderLeft: activeId === item.id
                        ? '2px solid var(--ifm-color-primary)'
                        : '2px solid transparent',
                      paddingLeft: '0.5rem',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (activeId !== item.id) {
                        e.currentTarget.style.color = 'var(--ifm-color-primary)';
                        e.currentTarget.style.borderLeftColor = 'var(--ifm-color-emphasis-300)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeId !== item.id) {
                        e.currentTarget.style.color = 'var(--ifm-color-emphasis-700)';
                        e.currentTarget.style.borderLeftColor = 'transparent';
                      }
                    }}
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : (
          <p style={{ fontSize: '0.875rem', color: 'var(--ifm-color-emphasis-500)', margin: 0 }}>
            Loading...
          </p>
        )}
      </div>
    </aside>
  );
}

