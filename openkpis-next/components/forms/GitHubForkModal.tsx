'use client';

import React from 'react';
import '@/app/styles/components.css';

interface GitHubForkModalProps {
  isOpen: boolean;
  onClose: () => void;
  isProcessing?: boolean;
  progress?: number; // 0-100 for progress bar
  mode?: 'fork_pr' | 'internal_app'; // Which mode is being used
}

export default function GitHubForkModal({
  isOpen,
  onClose,
  isProcessing = false,
  progress = 0,
  mode = 'fork_pr',
}: GitHubForkModalProps) {
  if (!isOpen) return null;

  const isForkMode = mode === 'fork_pr';

  return (
    <div 
      className="modal-overlay" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="modal-title"
      onClick={isProcessing ? undefined : onClose}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 id="modal-title" className="modal-title">
          {isForkMode ? 'Create with GitHub Fork + PR' : 'Creating Item'}
        </h2>

        <div className="modal-body">
          {isForkMode ? (
            <>
              <p>
                This option will create a <strong>fork</strong> of the OpenKPIs repository in your GitHub account and open a Pull Request for your contribution.
              </p>

              <div className="modal-section">
                <h3 className="modal-section-title">Benefits:</h3>
                <ul className="modal-list">
                  <li>✅ Real GitHub contributions (green squares on your profile)</li>
                  <li>✅ Fork count increases on your GitHub</li>
                  <li>✅ Professional PR workflow</li>
                  <li>✅ Public contribution history</li>
                </ul>
              </div>

              <div className="modal-note">
                <p>
                  <strong>Note:</strong> The fork will be a full copy of the repository. This is the standard open-source contribution workflow.
                </p>
              </div>
            </>
          ) : (
            <p>
              Creating item using GitHub App. This will sync to GitHub but won&apos;t count toward your personal GitHub contributions.
            </p>
          )}

          {isProcessing && (
            <div className="modal-progress">
              <div className="modal-progress-bar-container">
                <div 
                  className="modal-progress-bar" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="modal-progress-text">
                {isForkMode ? (
                  <>
                    {progress < 30 && 'Creating fork...'}
                    {progress >= 30 && progress < 60 && 'Committing changes...'}
                    {progress >= 60 && progress < 90 && 'Opening Pull Request...'}
                    {progress >= 90 && 'Almost done...'}
                  </>
                ) : (
                  <>
                    {progress < 40 && 'Creating branch...'}
                    {progress >= 40 && progress < 70 && 'Committing changes...'}
                    {progress >= 70 && progress < 90 && 'Opening Pull Request...'}
                    {progress >= 90 && 'Almost done...'}
                  </>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

