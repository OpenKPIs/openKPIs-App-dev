import React from 'react';
import Link from 'next/link';
import '@/app/styles/components.css';

interface SubmitBarProps {
  submitting: boolean;
  submitLabel: string;
  cancelHref: string;
  // Fork+PR options
  forkPreferenceLoading?: boolean;
  onQuickCreate?: () => void;
  onForkCreate?: () => void;
  showForkOption?: boolean;
}

export default function SubmitBar({ 
  submitting, 
  submitLabel, 
  cancelHref,
  forkPreferenceLoading = false,
  onQuickCreate,
  onForkCreate,
  showForkOption = true,
}: SubmitBarProps) {
  // Show fork option if preference is loaded and feature is enabled
  const canShowFork = !forkPreferenceLoading && showForkOption;

  return (
    <div className="submit-bar">
      {/* Primary action buttons */}
      <div className="submit-bar-actions">
        {/* Quick Create Button */}
        <button
          type="button"
          onClick={onQuickCreate}
          disabled={submitting}
          className="submit-button submit-button-primary"
        >
          {submitting ? 'Please wait…' : submitLabel || 'Quick Create'}
        </button>
        
        {/* Fork + Create Button (if enabled) */}
        {canShowFork && onForkCreate && (
          <button
            type="button"
            onClick={onForkCreate}
            disabled={submitting}
            className="submit-button submit-button-success"
          >
            {submitting ? 'Please wait…' : 'Fork + Create'}
          </button>
        )}
        
        <Link
          href={cancelHref}
          className="btn"
        >
          Cancel
        </Link>
      </div>

      {/* Helper text */}
      {canShowFork && (
        <div className="submit-bar-helper">
          <p>
            <strong>Quick Create</strong> - No GitHub fork or contribution credit (tracked only in OpenKPIs)
          </p>
          <p className="submit-bar-helper-text">
            <strong>Fork + Create</strong> - Creates a fork in your GitHub account and opens a PR for contribution credit
          </p>
        </div>
      )}
    </div>
  );
}


