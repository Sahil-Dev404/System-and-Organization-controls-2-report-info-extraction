import React from 'react';

export default function SubserviceTable({ subserviceOrgs = [] }) {
  const count = subserviceOrgs.length;

  return (
    <section className="table-section">
      <div className="table-header-bar">
        <h3 className="section-title" style={{ marginBottom: 0 }}>Subservice organizations</h3>
      </div>

      <div className="table-responsive-wrapper">
        <table className="socrr-table">
          <thead>
            <tr>
              <th style={{ width: '22%' }}>NAME</th>
              <th style={{ width: '12%' }}>METHOD</th>
              <th style={{ width: '28%' }}>SERVICES</th>
              <th style={{ width: '28%' }}>CSOCS</th>
              <th style={{ width: '10%' }}>RISK</th>
            </tr>
          </thead>
          <tbody>
            {count === 0 ? (
              <tr className="empty-state-row">
                <td colSpan={5}>No subservice organizations found.</td>
              </tr>
            ) : (
              subserviceOrgs.map((sub, idx) => {
                const isHighRisk = sub.risk_flag === 'HIGH' || sub.method === 'Carve-Out';
                const csocsText = Array.isArray(sub.csocs) && sub.csocs.length > 0
                  ? sub.csocs.join('; ')
                  : 'Perimeter physical security and environmental controls';

                return (
                  <tr key={sub.name || idx}>
                    <td style={{ fontWeight: 700 }}>{sub.name}</td>
                    <td>{sub.method || 'Carve-Out'}</td>
                    <td>{sub.services || '—'}</td>
                    <td>{csocsText}</td>
                    <td>
                      {isHighRisk ? (
                        <span className="badge-high-risk">HIGH</span>
                      ) : (
                        <span className="badge-low-risk">LOW</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
