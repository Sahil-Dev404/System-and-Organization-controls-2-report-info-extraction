import React from 'react';

export default function StatCards({ opinion, exceptions, subserviceOrgs, summary }) {
  // Format Auditor qualifications count
  const qualCount = (opinion && opinion.qualifications) ? opinion.qualifications.length : 0;
  const opinionType = (opinion && opinion.type) ? opinion.type : 'Unqualified';

  // Format Exceptions categories note
  const excCount = summary ? summary.exception_count : (exceptions ? exceptions.length : 0);
  const excCategories = exceptions && exceptions.length > 0
    ? Array.from(new Set(exceptions.map((e) => {
        // Format category name nicely: access_control -> Access Control
        return e.category
          ? e.category.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
          : 'General';
      }))).slice(0, 3).join(' · ')
    : 'No exceptions';

  // Format Subservices note
  const carveOutCount = summary ? summary.carve_out_count : (subserviceOrgs ? subserviceOrgs.filter((s) => s.method === 'Carve-Out').length : 0);
  const carveOutNames = subserviceOrgs && subserviceOrgs.length > 0
    ? subserviceOrgs
        .filter((s) => s.method === 'Carve-Out')
        .map((s) => {
          if (s.name.includes('(')) {
            const shortMatch = s.name.match(/\(([^)]+)\)/);
            if (shortMatch) return shortMatch[1];
          }
          return s.name.split(' ')[0];
        })
        .slice(0, 3)
        .join(' · ')
    : 'None';

  // Format CUEC Gaps
  const cuecGap = summary ? summary.cuec_gap : 0;
  const cuecTotal = summary ? summary.cuec_total : 0;

  return (
    <div className="stat-cards-grid">
      {/* 1. Auditor Opinion */}
      <div className="stat-card">
        <div className="stat-card-label">AUDITOR OPINION</div>
        <div className="stat-card-value" style={{ fontSize: '24px' }}>
          {opinionType}
        </div>
        <div className="stat-card-note">
          {qualCount} qualification{qualCount === 1 ? '' : 's'}
        </div>
      </div>

      {/* 2. Control Exceptions */}
      <div className="stat-card">
        <div className="stat-card-label">CONTROL EXCEPTIONS</div>
        <div className="stat-card-value">
          {excCount}
        </div>
        <div className="stat-card-note" title={excCategories}>
          {excCategories}
        </div>
      </div>

      {/* 3. Carve-Out Subservices */}
      <div className="stat-card">
        <div className="stat-card-label">CARVE-OUT SUBSERVICES</div>
        <div className="stat-card-value">
          {carveOutCount}
        </div>
        <div className="stat-card-note" title={carveOutNames}>
          {carveOutNames}
        </div>
      </div>

      {/* 4. CUEC Gaps (INVERTED CARD) */}
      <div className="stat-card stat-card-inverted">
        <div className="stat-card-label">CUEC GAPS</div>
        <div className="stat-card-value">
          {cuecGap} <span className="stat-card-value-small">of {cuecTotal}</span>
        </div>
        <div className="stat-card-note">
          Needs internal control
        </div>
      </div>
    </div>
  );
}
