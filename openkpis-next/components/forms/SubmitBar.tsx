import React from 'react';
import Link from 'next/link';
import '@/app/styles/components.css';

interface SubmitBarProps {
  submitting: boolean;
  submitLabel: string;
  cancelHref: string;
  // Checkbox state
  forkPreferenceEnabled: boolean;
  forkPreferenceLoading?: boolean;
  onForkPreferenceChange?: (enabled: boolean) => void;
  onCreate?: () => void;
}

export default function SubmitBar({ 
  submitting, 
  submitLabel, 
  cancelHref,
  forkPreferenceEnabled,
  forkPreferenceLoading = false,
  onForkPreferenceChange,
  onCreate,
}: SubmitBarProps) {
  return (
    <div className="submit-bar">
      {/* Checkbox for fork preference */}
      <div className="submit-bar-checkbox-container">
        <label className="submit-bar-checkbox-label">
          <input
            type="checkbox"
            checked={forkPreferenceEnabled}
            onChange={(e) => onForkPreferenceChange?.(e.target.checked)}
            disabled={submitting || forkPreferenceLoading}
            className="submit-bar-checkbox"
          />
          <span className="submit-bar-checkbox-text">
            <strong>(Preferred)</strong> Get contribution credit on your Github account with Fork and PR approach. Unselecting will not give any contribution for your Open Source contributoin on Github
          </span>
        </label>
      </div>

      {/* Primary action buttons */}
      <div className="submit-bar-actions">
        <button
          type="button"
          onClick={onCreate}
          disabled={submitting || forkPreferenceLoading}
          className="submit-button submit-button-primary"
        >
          {submitting ? 'Please wait…' : submitLabel || 'Create'}
        </button>
        
        <Link
          href={cancelHref}
          className="btn"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}


