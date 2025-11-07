'use client';

import React from 'react';
import type { AnalyticsSolution } from '../types';

interface Step1RequirementsProps {
  analyticsSolution: AnalyticsSolution;
  setAnalyticsSolution: (value: AnalyticsSolution) => void;
  requirements: string;
  setRequirements: (value: string) => void;
  kpiCount: number;
  setKpiCount: (value: number) => void;
  platforms: string[];
  setPlatforms: (value: string[]) => void;
  loading: boolean;
  onAnalyze: () => void;
}

const PLATFORM_OPTIONS = ['Web', 'Mobile', 'Cross-Device', 'Omnichannel'];

export default function Step1Requirements({
  analyticsSolution,
  setAnalyticsSolution,
  requirements,
  setRequirements,
  kpiCount,
  setKpiCount,
  platforms,
  setPlatforms,
  loading,
  onAnalyze,
}: Step1RequirementsProps) {
  const togglePlatform = (platform: string) => {
    setPlatforms(
      platforms.includes(platform)
        ? platforms.filter(p => p !== platform)
        : [...platforms, platform]
    );
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '2px solid var(--ifm-color-emphasis-100)' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--ifm-font-color-base)', letterSpacing: '-0.02em' }}>
          Step 1: Business Requirements
        </h2>
        <p style={{ margin: 0, color: 'var(--ifm-color-emphasis-700)', fontSize: '0.9375rem', lineHeight: '1.6' }}>
          Select your analytics solution, platforms, and describe your business requirements. Our AI will
          analyze your needs and suggest relevant KPIs, Metrics, and Dimensions specific to your chosen platform.
        </p>
      </div>

      {/* Analytics Solution, KPI Count, and Platforms - Side by Side */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Analytics Solution Dropdown */}
        <div style={{ flexShrink: 0, position: 'relative' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: 'var(--ifm-font-color-base)',
              letterSpacing: '0.01em',
            }}
          >
            Analytics Solution <span style={{ color: 'var(--ifm-color-danger)' }}>*</span>
          </label>
          <select
            value={analyticsSolution}
            onChange={(e) => setAnalyticsSolution(e.target.value as AnalyticsSolution)}
            style={{
              padding: '0.875rem 2.5rem 0.875rem 1rem',
              border: '2px solid var(--ifm-color-emphasis-300)',
              borderRadius: '10px',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
              backgroundColor: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '12px',
              minWidth: '280px',
              width: 'fit-content',
            }}
          >
            <option value="Google Analytics (GA4)">Google Analytics (GA4)</option>
            <option value="Adobe Analytics">Adobe Analytics</option>
            <option value="Adobe Customer Journey Analytics">Adobe Customer Journey Analytics</option>
            <option value="Custom">Custom</option>
          </select>
        </div>

        {/* Number of KPIs Input */}
        <div style={{ flexShrink: 0, width: '140px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: 'var(--ifm-font-color-base)',
              letterSpacing: '0.01em',
            }}
          >
            Number of KPIs
          </label>
          <input
            type="number"
            min="1"
            max="50"
            value={kpiCount}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              if (value >= 1 && value <= 50) {
                setKpiCount(value);
              }
            }}
            style={{
              width: '100%',
              padding: '0.875rem',
              border: '2px solid var(--ifm-color-emphasis-300)',
              borderRadius: '10px',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
              transition: 'all 0.2s ease',
              textAlign: 'center',
            }}
          />
        </div>
      </div>

      {/* Platforms Selection */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '600',
            marginBottom: '0.75rem',
            color: 'var(--ifm-font-color-base)',
            letterSpacing: '0.01em',
          }}
        >
          Platforms
        </label>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {PLATFORM_OPTIONS.map((platform) => (
            <button
              key={platform}
              type="button"
              onClick={() => togglePlatform(platform)}
              style={{
                padding: '0.625rem 1.25rem',
                border: `2px solid ${platforms.includes(platform) ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-300)'}`,
                borderRadius: '8px',
                background: platforms.includes(platform) ? 'var(--ifm-color-primary)' : 'white',
                color: platforms.includes(platform) ? 'white' : 'var(--ifm-font-color-base)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!platforms.includes(platform)) {
                  e.currentTarget.style.borderColor = 'var(--ifm-color-primary)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(var(--ifm-color-primary-rgb), 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!platforms.includes(platform)) {
                  e.currentTarget.style.borderColor = 'var(--ifm-color-emphasis-300)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {platform}
            </button>
          ))}
        </div>
      </div>

      {/* Requirements Textarea */}
      <div style={{ marginBottom: '2rem' }}>
        <label
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '600',
            marginBottom: '0.5rem',
            color: 'var(--ifm-font-color-base)',
            letterSpacing: '0.01em',
          }}
        >
          Business Requirements <span style={{ color: 'var(--ifm-color-danger)' }}>*</span>
        </label>
        <textarea
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          placeholder="Describe your business objectives and what you want to analyze. For example: 'I want to analyze product performance and understand customer acquisition and retention patterns.'"
          rows={6}
          style={{
            width: '100%',
            padding: '1rem',
            border: '2px solid var(--ifm-color-emphasis-300)',
            borderRadius: '10px',
            fontSize: '0.9375rem',
            fontFamily: 'inherit',
            lineHeight: '1.6',
            resize: 'vertical',
            transition: 'all 0.2s ease',
          }}
        />
      </div>

      {/* Analyze Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={onAnalyze}
          disabled={loading || !requirements.trim() || !analyticsSolution}
          style={{
            padding: '0.875rem 2.5rem',
            backgroundColor: loading || !requirements.trim() || !analyticsSolution
              ? 'var(--ifm-color-emphasis-300)'
              : 'var(--ifm-color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: loading || !requirements.trim() || !analyticsSolution ? 'not-allowed' : 'pointer',
            fontSize: '0.9375rem',
            fontWeight: 600,
            letterSpacing: '0.02em',
            transition: 'all 0.2s ease',
            boxShadow: loading || !requirements.trim() || !analyticsSolution
              ? 'none'
              : '0 4px 12px rgba(var(--ifm-color-primary-rgb), 0.3)',
          }}
        >
          {loading ? 'Analyzing...' : 'Analyze & Generate Suggestions →'}
        </button>
      </div>
    </div>
  );
}
