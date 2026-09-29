import React from 'react';

export default function ExceptionsTable({ exceptions = [] }) {
  const count = exceptions.length;

  return (
    <section className="table-section">
      <div className="table-header-bar">
        <div className="table-header-left">
          <h3 className="section-title" style={{ marginBottom: 0 }}>Control exceptions</h3>
        </div>
        <span className="table-count-label">{count} found</span>
      </div>

      <div className="table-responsive-wrapper">
        <table className="socrr-table">
          <thead>
            <tr>
              <th style={{ width: '12%' }}>CONTROL</th>
              <th style={{ width: '10%' }}>CRITERIA</th>
              <th style={{ width: '15%' }}>CATEGORY</th>
              <th style={{ width: '38%' }}>WHAT FAILED</th>
              <th style={{ width: '25%' }}>MANAGEMENT RESPONSE</th>
            </tr>
          </thead>
          <tbody>
            {count === 0 ? (
              <tr className="empty-state-row">
                <td colSpan={5}>No control exceptions found.</td>
              </tr>
            ) : (
              exceptions.map((exc, idx) => {
                const hasSeparateDetails = exc.details && exc.details !== exc.description;
                return (
                  <tr key={exc.control_id || idx}>
                    <td style={{ fontWeight: 700 }}>{exc.control_id}</td>
                    <td>{exc.criteria || '—'}</td>
                    <td>
                      <span className="chip-outlined">
                        {exc.category || 'general'}
                      </span>
                    </td>
                    <td>
                      <div className="cell-failure-text">
                        {exc.details || exc.description}
                      </div>
                      {hasSeparateDetails && (
                        <div className="cell-failure-details">
                          {exc.description}
                        </div>
                      )}
                    </td>
                    <td style={{ color: exc.management_response === 'Not provided' ? '#888' : 'inherit' }}>
                      {exc.management_response || 'Not provided'}
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
