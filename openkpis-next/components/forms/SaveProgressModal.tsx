'use client';

import React from 'react';
import '@/app/styles/components.css';

interface SaveProgressModalProps {
  isOpen: boolean;
  progress: number; // 0-100 for progress bar
}

export default function SaveProgressModal({
  isOpen,
  progress,
}: SaveProgressModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="modal-title"
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 id="modal-title" className="modal-title">
          Saving Changes
        </h2>

        <div className="modal-body">
          <p>
            Please wait while your changes are being saved. Do not close this page.
          </p>

          <div className="modal-progress">
            <div className="modal-progress-bar-container">
              <div 
                className="modal-progress-bar" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="modal-progress-text">
              {progress < 30 && 'Preparing to save...'}
              {progress >= 30 && progress < 60 && 'Saving to database...'}
              {progress >= 60 && progress < 90 && 'Processing changes...'}
              {progress >= 90 && progress < 100 && 'Almost done...'}
              {progress >= 100 && 'Save complete!'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

