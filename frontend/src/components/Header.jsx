import React from 'react';

export default function Header({ onReset }) {
  return (
    <header className="header-wrapper">
      <div className="header-inner">
        <div className="brand-link" onClick={onReset} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onReset()}>
          <div className="brand-icon-s">⌕[SOC]</div>
          <span className="brand-name">SOCLens</span>
        </div>
        <div className="header-status">
          <span className="header-bullet">●</span>
          <span>Runs online · No data leaves this platform</span>
        </div>
      </div>
    </header>
  );
}
