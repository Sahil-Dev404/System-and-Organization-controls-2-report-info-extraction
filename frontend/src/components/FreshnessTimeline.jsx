import React, { useState } from 'react';

export default function FreshnessTimeline({ freshness, org = 'Vendor' }) {
  const [showTemplate, setShowTemplate] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!freshness) return null;

  const {
    period_start = 'N/A',
    period_end = 'N/A',
    days_since_end = 0,
    months_since_end = 0.0,
    status = 'Active',
    alert_message = '',
    requires_bridge_letter = false
  } = freshness;

  const todayStr = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const emailTemplate = `Subject: SOC 2 Bridge Letter / Gap Letter Request — ${org}

Hi ${org} Security & Compliance Team,

We are currently conducting our periodic vendor security assessment for ${org}.

Our records show that your latest SOC 2 Type 2 report covers the period from ${period_start} to ${period_end} (${months_since_end} months ago).

To maintain continuous compliance assurance, could you please provide:
1. An official signed SOC 2 Bridge Letter (Gap Letter) covering the period from ${period_end} to the present date, confirming there have been no material changes or unaddressed control deficiencies in your system.
2. The expected issuance date of your next SOC 2 Type 2 report.

Thank you for your assistance.

Best regards,
Information Security & Vendor Risk Team`;

  const handleCopy = () => {
    navigator.clipboard.writeText(emailTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="freshness-timeline-section">
      <div className="freshness-header-row">
        <div>
          <h3 className="section-title">Audit period & freshness timeline</h3>
          <p className="section-subtitle">
            Temporal coverage, validity tracking, and 12-month annual review window
          </p>
        </div>

        <div className="freshness-status-wrap">
          <span className={`freshness-badge freshness-badge-${status.toLowerCase().replace(/\s+/g, '-')}`}>
            {status.toUpperCase()}
          </span>
          <span className="freshness-age-label">{months_since_end} mo. since period end</span>
        </div>
      </div>

      <div className="section-divider" />

      {/* Horizontal Timeline Track */}
      <div className="timeline-track-container">
        <div className="timeline-line" />

        <div className="timeline-milestones">
          {/* Milestone 1: Audit Start */}
          <div className="timeline-node">
            <div className="timeline-dot" />
            <div className="timeline-node-content">
              <span className="node-label">AUDIT START</span>
              <span className="node-date">{period_start}</span>
            </div>
          </div>

          {/* Milestone 2: Audit End */}
          <div className="timeline-node">
            <div className="timeline-dot timeline-dot-solid" />
            <div className="timeline-node-content">
              <span className="node-label">AUDIT END</span>
              <span className="node-date">{period_end}</span>
            </div>
          </div>

          {/* Milestone 3: Today's Review */}
          <div className="timeline-node timeline-node-today">
            <div className="timeline-dot timeline-dot-today" />
            <div className="timeline-node-content">
              <span className="node-label">TODAY'S REVIEW</span>
              <span className="node-date">{todayStr}</span>
              <span className="node-sub">+{days_since_end} days elapsed</span>
            </div>
          </div>

          {/* Milestone 4: 12-Month Validity Threshold */}
          <div className="timeline-node">
            <div className={`timeline-dot ${requires_bridge_letter ? 'timeline-dot-alert' : ''}`} />
            <div className="timeline-node-content">
              <span className="node-label">12-MO. VALIDITY WINDOW</span>
              <span className="node-date">
                {status === 'Expired' ? 'EXPIRED' : (status === 'Expiring Soon' ? 'EXPIRING SOON' : 'ACTIVE')}
              </span>
              <span className="node-sub">
                {status === 'Expired' ? 'Bridge Letter Required' : 'Standard 365-day cadence'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notice Banner */}
      <div className={`freshness-notice-banner ${requires_bridge_letter ? 'banner-alert' : 'banner-clean'}`}>
        <div className="notice-banner-left">
          <span className="notice-icon">{requires_bridge_letter ? '⚠️' : '✓'}</span>
          <span className="notice-text">{alert_message}</span>
        </div>

        {requires_bridge_letter && (
          <button
            type="button"
            className="bridge-letter-btn"
            onClick={() => setShowTemplate(!showTemplate)}
          >
            {showTemplate ? 'Hide Email Draft' : 'Request Bridge Letter'}
          </button>
        )}
      </div>

      {/* Expandable Bridge Letter Request Template */}
      {showTemplate && requires_bridge_letter && (
        <div className="bridge-template-box">
          <div className="bridge-template-header">
            <span className="bridge-template-title">PRE-FILLED BRIDGE LETTER REQUEST EMAIL</span>
            <button type="button" className="copy-template-btn" onClick={handleCopy}>
              {copied ? '✓ Copied to Clipboard' : 'Copy Email Template'}
            </button>
          </div>
          <pre className="bridge-template-text">{emailTemplate}</pre>
        </div>
      )}
    </section>
  );
}
