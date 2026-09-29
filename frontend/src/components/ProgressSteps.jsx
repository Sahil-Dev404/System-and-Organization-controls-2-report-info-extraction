import React, { useEffect, useState } from 'react';

const STEPS = [
  'Parse',
  'Segment',
  'Extract',
  'Map CUECs',
  'Build report'
];

export default function ProgressSteps({ isLoading }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setCurrentStepIndex(0);
      return;
    }

    // Advance steps sequentially every 1.2s up to index 4 (Build report)
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        }
        return prev; // hold on last step until isLoading turns false
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="progress-container" aria-live="polite">
      <div className="progress-track">
        {STEPS.map((stepName, idx) => {
          let statusClass = 'pending';
          let glyph = '○';

          if (idx < currentStepIndex) {
            statusClass = 'completed';
            glyph = '✓';
          } else if (idx === currentStepIndex) {
            statusClass = 'active';
            glyph = '●';
          }

          return (
            <div key={stepName} className={`progress-step-item ${statusClass}`}>
              <span className="step-glyph">{glyph}</span>
              <span>{stepName}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
