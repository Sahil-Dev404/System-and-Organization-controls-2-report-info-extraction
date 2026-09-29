import React from 'react';

export default function ErrorBanner({ message, onRetry, onDismiss }) {
  if (!message) return null;

  return (
    <div className="error-banner" role="alert">
      <div className="error-banner-content">
        <span className="error-tag">ERROR</span>
        <span className="error-message">{message}</span>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {onRetry && (
          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: '6px 14px', fontSize: '12px' }}
            onClick={onRetry}
          >
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: '6px 12px', fontSize: '12px' }}
            onClick={onDismiss}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
