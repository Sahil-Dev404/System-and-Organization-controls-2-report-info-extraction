import React from 'react';

export default function ReportDetails({ metadata }) {
  if (!metadata) return null;

  const {
    org = '',
    system = '',
    report_type = 'Type 2',
    period_start = 'N/A',
    period_end = 'N/A',
    auditor = 'Unknown Auditor',
    criteria = []
  } = metadata;

  // Format Period
  let periodString = 'N/A';
  if (period_start && period_end && period_start !== 'N/A' && period_end !== 'N/A') {
    periodString = `${period_start} – ${period_end}`;
  } else if (period_start && period_start !== 'N/A') {
    periodString = period_start;
  }

  return (
    <section className="report-details-section">
      <h3 className="section-title">Report details</h3>
      <div className="section-divider" />

      {/* 4-column metadata grid */}
      <div className="details-grid">
        <div className="detail-col">
          <span className="detail-label">SERVICE ORGANIZATION</span>
          <span className="detail-value">{org || '—'}</span>
        </div>
        <div className="detail-col">
          <span className="detail-label">SYSTEM</span>
          <span className="detail-value">{system || '—'}</span>
        </div>
        <div className="detail-col">
          <span className="detail-label">REPORT TYPE</span>
          <span className="detail-value">{report_type || 'Type 2'}</span>
        </div>
        <div className="detail-col">
          <span className="detail-label">AUDITOR</span>
          <span className="detail-value">{auditor || '—'}</span>
        </div>
      </div>

      {/* Period & Criteria Row */}
      <div className="details-extra-row">
        <div className="detail-col">
          <span className="detail-label">PERIOD</span>
          <span className="detail-value">{periodString}</span>
        </div>

        <div className="detail-col">
          <span className="detail-label">TRUST SERVICES CRITERIA</span>
          <div className="chips-wrapper" style={{ marginTop: '4px' }}>
            {criteria && criteria.length > 0 ? (
              criteria.map((c) => (
                <span key={c} className="chip-black">
                  {c}
                </span>
              ))
            ) : (
              <span className="chip-black">Security</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
