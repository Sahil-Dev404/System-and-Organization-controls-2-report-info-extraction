import React, { useState } from 'react';

export default function CuecTable({ cuecs = [] }) {
  const [filter, setFilter] = useState('ALL');

  const filteredCuecs = cuecs.filter((c) => {
    if (filter === 'ALL') return true;
    if (filter === 'MAPPED') return c.status === 'Mapped';
    if (filter === 'PARTIAL') return c.status === 'Partially Mapped';
    if (filter === 'GAP') return c.status === 'Gap';
    return true;
  });

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Mapped':
        return <span className="badge-mapped">MAPPED</span>;
      case 'Partially Mapped':
        return <span className="badge-partial">PARTIAL</span>;
      case 'Gap':
      default:
        return (
          <span className="badge-gap">
            <span>GAP</span>
          </span>
        );
    }
  };

  return (
    <section className="table-section">
      <div className="table-header-bar">
        <h3 className="section-title" style={{ marginBottom: 0 }}>CUEC mapping</h3>

        {/* Filters */}
        <div className="table-filters" role="group" aria-label="Filter CUECs by mapping status">
          <button
            type="button"
            className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilter('ALL')}
          >
            All {cuecs.length}
          </button>
          <button
            type="button"
            className={`filter-btn ${filter === 'MAPPED' ? 'active' : ''}`}
            onClick={() => setFilter('MAPPED')}
          >
            Mapped
          </button>
          <button
            type="button"
            className={`filter-btn ${filter === 'PARTIAL' ? 'active' : ''}`}
            onClick={() => setFilter('PARTIAL')}
          >
            Partial
          </button>
          <button
            type="button"
            className={`filter-btn ${filter === 'GAP' ? 'active' : ''}`}
            onClick={() => setFilter('GAP')}
          >
            Gap
          </button>
        </div>
      </div>

      <div className="table-responsive-wrapper">
        <table className="socrr-table">
          <thead>
            <tr>
              <th style={{ width: '10%' }}>ID</th>
              <th style={{ width: '42%' }}>CUEC</th>
              <th style={{ width: '28%' }}>MAPPED INTERNAL CONTROL</th>
              <th style={{ width: '10%' }}>SCORE</th>
              <th style={{ width: '10%' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filteredCuecs.length === 0 ? (
              <tr className="empty-state-row">
                <td colSpan={5}>No CUECs found for this filter.</td>
              </tr>
            ) : (
              filteredCuecs.map((cuec, idx) => {
                const isGap = cuec.status === 'Gap';
                const formattedScore = typeof cuec.score === 'number' ? cuec.score.toFixed(2) : '0.00';

                return (
                  <tr key={cuec.id || idx}>
                    <td style={{ fontWeight: 700 }}>{cuec.id}</td>
                    <td>{cuec.text}</td>
                    <td>
                      {isGap ? (
                        <span className="text-grey-missing">No matching control</span>
                      ) : (
                        <span>{cuec.mapped_control}</span>
                      )}
                    </td>
                    <td>{formattedScore}</td>
                    <td>{renderStatusBadge(cuec.status)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="table-footnote">
        Score: TF-IDF cosine similarity. Mapped &gt;= 0.25 · Partial &gt;= 0.12 · Gap below.
      </p>
    </section>
  );
}
