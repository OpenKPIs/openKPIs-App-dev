'use client';

import React from 'react';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
  canGoBack: boolean;
  canGoNext: boolean;
  onNext: () => void;
  onPrevious: () => void;
}

export default function StepNavigation({
  currentStep,
  totalSteps,
  onStepChange,
  canGoBack,
  canGoNext,
  onNext,
  onPrevious,
}: StepNavigationProps) {
  const stepLabels = ['Requirements', 'KPI Suggestions', 'Insights', 'Dashboards'];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '2rem',
      padding: '1rem',
      background: 'var(--ifm-color-emphasis-100)',
      borderRadius: '12px',
      border: '1px solid var(--ifm-color-emphasis-200)',
    }}>
      {/* Step Indicators */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1 }}>
        {stepLabels.map((label, index) => {
          const stepNum = index + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;
          
          return (
            <React.Fragment key={stepNum}>
              <button
                onClick={() => onStepChange(stepNum)}
                disabled={stepNum > currentStep}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  border: `2px solid ${isActive ? 'var(--ifm-color-primary)' : isCompleted ? 'var(--ifm-color-success)' : 'var(--ifm-color-emphasis-300)'}`,
                  borderRadius: '8px',
                  background: isActive ? 'var(--ifm-color-primary)' : isCompleted ? 'var(--ifm-color-success)' : 'white',
                  color: isActive || isCompleted ? 'white' : 'var(--ifm-font-color-base)',
                  cursor: stepNum <= currentStep ? 'pointer' : 'not-allowed',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.2s ease',
                  opacity: stepNum > currentStep ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (stepNum <= currentStep) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: isActive || isCompleted ? 'rgba(255,255,255,0.3)' : 'transparent',
                  border: `2px solid ${isActive || isCompleted ? 'white' : 'currentColor'}`,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}>
                  {isCompleted ? '✓' : stepNum}
                </span>
                <span>{label}</span>
              </button>
              {index < stepLabels.length - 1 && (
                <div style={{
                  width: '30px',
                  height: '2px',
                  background: isCompleted ? 'var(--ifm-color-success)' : 'var(--ifm-color-emphasis-300)',
                  margin: '0 0.5rem',
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={onPrevious}
          disabled={!canGoBack}
          style={{
            padding: '0.625rem 1.25rem',
            border: '2px solid var(--ifm-color-emphasis-300)',
            borderRadius: '8px',
            background: 'white',
            color: 'var(--ifm-font-color-base)',
            cursor: canGoBack ? 'pointer' : 'not-allowed',
            fontSize: '0.875rem',
            fontWeight: 500,
            opacity: canGoBack ? 1 : 0.5,
            transition: 'all 0.2s ease',
          }}
        >
          ← Previous
        </button>
        <button
          onClick={onNext}
          disabled={!canGoNext}
          style={{
            padding: '0.625rem 1.25rem',
            border: 'none',
            borderRadius: '8px',
            background: canGoNext ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-300)',
            color: 'white',
            cursor: canGoNext ? 'pointer' : 'not-allowed',
            fontSize: '0.875rem',
            fontWeight: 600,
            transition: 'all 0.2s ease',
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
