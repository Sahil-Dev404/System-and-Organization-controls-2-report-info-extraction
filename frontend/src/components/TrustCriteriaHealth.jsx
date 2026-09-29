import React, { useState } from 'react';

export default function TrustCriteriaHealth({ criteriaHealth }) {
  if (!criteriaHealth || !criteriaHealth.categories || criteriaHealth.categories.length === 0) {
    return null;
  }

  const {
    overall_health = 100.0,
    total_controls_tested = 0,
    total_passed = 0,
    total_exceptions = 0,
    categories = []
  } = criteriaHealth;

  const [activeFilter, setActiveFilter] = useState('ALL');
  const [hoveredCategory, setHoveredCategory] = useState(null);

  // Group or filter principles
  const principles = Array.from(new Set(categories.map((c) => c.principle)));
  const exceptionCategoriesCount = categories.filter((c) => c.exception_count > 0).length;
  const optimalCategoriesCount = categories.filter((c) => c.status === 'Optimal').length;

  const filteredCategories = categories.filter((cat) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'EXCEPTIONS') return cat.exception_count > 0;
    return cat.principle.toUpperCase() === activeFilter.toUpperCase();
  });

  // Calculate coordinates for SVG Spider/Radar Chart
  // Center (175, 175), Radius = 120
  const cx = 175;
  const cy = 175;
  const r = 115;
  const numAxes = categories.length;

  const getCoordinates = (index, valuePercent) => {
    const angle = (Math.PI * 2 / numAxes) * index - Math.PI / 2;
    const distance = (valuePercent / 100) * r;
    const x = cx + distance * Math.cos(angle);
    const y = cy + distance * Math.sin(angle);
    return { x, y, angle };
  };

  // Polygon points string for the data shape
  const polygonPoints = categories
    .map((cat, idx) => {
      const { x, y } = getCoordinates(idx, Math.max(cat.health_score, 10));
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  // Concentric levels (25%, 50%, 75%, 100%)
  const gridLevels = [25, 50, 75, 100];

  return (
    <section className="criteria-health-section">
      <div className="section-header-row">
        <div>
          <h3 className="section-title">Trust criteria health breakdown</h3>
          <p className="section-subtitle">
            Operating effectiveness across AICPA 2017 Trust Services Criteria (TSC) categories
          </p>
        </div>
        <div className="overall-score-pill">
          <span className="overall-score-number">{overall_health}%</span>
          <span className="overall-score-label">OVERALL HEALTH</span>
        </div>
      </div>

      <div className="section-divider" />

      {/* Top 4 Metric Summary Cards */}
      <div className="health-metrics-row">
        <div className="health-metric-box">
          <div className="metric-box-label">CRITERIA CATEGORIES</div>
          <div className="metric-box-value">{categories.length}</div>
          <div className="metric-box-sub">Across {principles.length} Trust Principles</div>
        </div>

        <div className="health-metric-box">
          <div className="metric-box-label">TOTAL CONTROLS TESTED</div>
          <div className="metric-box-value">{total_controls_tested}</div>
          <div className="metric-box-sub">{total_passed} Passed · {total_exceptions} Exceptions</div>
        </div>

        <div className="health-metric-box">
          <div className="metric-box-label">OPTIMAL CATEGORIES</div>
          <div className="metric-box-value">{optimalCategoriesCount}</div>
          <div className="metric-box-sub">100% clean operating effectiveness</div>
        </div>

        <div className={`health-metric-box ${exceptionCategoriesCount > 0 ? 'metric-box-alert' : ''}`}>
          <div className="metric-box-label">ATTENTION / EXCEPTIONS</div>
          <div className="metric-box-value">{exceptionCategoriesCount}</div>
          <div className="metric-box-sub">
            {exceptionCategoriesCount === 0 ? 'No criteria deficiencies' : 'Categories with test failures'}
          </div>
        </div>
      </div>

      {/* Visual Chart + Breakdown Container */}
      <div className="health-visual-grid">
        {/* Left: SVG Radar / Spider Graph */}
        <div className="radar-card">
          <div className="radar-card-header">
            <span className="radar-title">TRUST SERVICES RADAR</span>
            <span className="radar-legend">Health %</span>
          </div>

          <div className="radar-svg-wrapper">
            <svg viewBox="0 0 350 350" className="radar-svg" aria-label="Trust Criteria Radar Chart">
              {/* Concentric Polygons */}
              {gridLevels.map((lvl) => {
                const points = categories
                  .map((_, i) => {
                    const { x, y } = getCoordinates(i, lvl);
                    return `${x.toFixed(1)},${y.toFixed(1)}`;
                  })
                  .join(' ');
                return (
                  <polygon
                    key={lvl}
                    points={points}
                    fill={lvl === 100 ? '#fbfbfb' : 'none'}
                    stroke={lvl === 100 ? '#222' : '#ddd'}
                    strokeWidth={lvl === 100 ? '1.5' : '1'}
                    strokeDasharray={lvl === 100 ? 'none' : '3,3'}
                  />
                );
              })}

              {/* Axis lines from center to vertices */}
              {categories.map((cat, i) => {
                const outer = getCoordinates(i, 100);
                return (
                  <line
                    key={cat.category_id}
                    x1={cx}
                    y1={cy}
                    x2={outer.x}
                    y2={outer.y}
                    stroke="#ccc"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Data Area Polygon */}
              <polygon
                points={polygonPoints}
                fill="rgba(0, 0, 0, 0.15)"
                stroke="#000000"
                strokeWidth="2.5"
              />

              {/* Data Vertex Dots & Hover Targets */}
              {categories.map((cat, i) => {
                const pt = getCoordinates(i, Math.max(cat.health_score, 10));
                const labelPos = getCoordinates(i, 118);
                const isHovered = hoveredCategory === cat.category_id;
                const isExceptional = cat.exception_count > 0;

                return (
                  <g
                    key={cat.category_id}
                    onMouseEnter={() => setHoveredCategory(cat.category_id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Vertex Circle */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 6 : (isExceptional ? 5 : 4)}
                      fill={isExceptional ? '#ffffff' : '#000000'}
                      stroke="#000000"
                      strokeWidth={isExceptional ? '2.5' : '1.5'}
                    />

                    {/* Outer Axis Category Label */}
                    <text
                      x={labelPos.x}
                      y={labelPos.y + 4}
                      textAnchor="middle"
                      fontSize={isHovered ? '11px' : '9.5px'}
                      fontWeight={isHovered ? '800' : '600'}
                      fill="#000000"
                    >
                      {cat.category_id}
                    </text>
                  </g>
                );
              })}

              {/* Center Coordinate Indicator */}
              <circle cx={cx} cy={cy} r="2.5" fill="#000000" />
            </svg>
          </div>

          <div className="radar-footer">
            <span className="radar-footer-hint">
              {hoveredCategory ? (
                (() => {
                  const item = categories.find((c) => c.category_id === hoveredCategory);
                  return item
                    ? `${item.category_id} · ${item.name}: ${item.health_score}% (${item.passed_controls}/${item.total_controls} passed)`
                    : 'Hover vertices to inspect score';
                })()
              ) : (
                'Hover any vertex to view criteria category score'
              )}
            </span>
          </div>
        </div>

        {/* Right: Category Cards & Visual Meters */}
        <div className="health-categories-panel">
          {/* Filter Pills */}
          <div className="health-filters-bar">
            <button
              type="button"
              className={`health-filter-btn ${activeFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setActiveFilter('ALL')}
            >
              All ({categories.length})
            </button>

            {exceptionCategoriesCount > 0 && (
              <button
                type="button"
                className={`health-filter-btn ${activeFilter === 'EXCEPTIONS' ? 'active' : ''}`}
                onClick={() => setActiveFilter('EXCEPTIONS')}
              >
                Exceptions ({exceptionCategoriesCount})
              </button>
            )}

            {principles.map((pr) => (
              <button
                key={pr}
                type="button"
                className={`health-filter-btn ${activeFilter === pr ? 'active' : ''}`}
                onClick={() => setActiveFilter(pr)}
              >
                {pr}
              </button>
            ))}
          </div>

          {/* List of Category Health Items */}
          <div className="categories-list">
            {filteredCategories.map((cat) => {
              const isSelected = hoveredCategory === cat.category_id;
              const hasExceptions = cat.exception_count > 0;

              return (
                <div
                  key={cat.category_id}
                  className={`category-health-card ${isSelected ? 'category-highlighted' : ''} ${hasExceptions ? 'has-exceptions' : ''}`}
                  onMouseEnter={() => setHoveredCategory(cat.category_id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <div className="cat-card-header">
                    <div className="cat-code-and-title">
                      <span className="cat-code-badge">{cat.category_id}</span>
                      <span className="cat-title-text">{cat.name}</span>
                    </div>

                    <div className="cat-status-badge-wrap">
                      <span className="cat-principle-tag">{cat.principle}</span>
                      <span className={`cat-status-pill status-${cat.status.toLowerCase()}`}>
                        {cat.status === 'Optimal' ? 'OPTIMAL' : (cat.status === 'Attention' ? 'ATTENTION' : 'CRITICAL')}
                      </span>
                    </div>
                  </div>

                  {/* Meter Bar */}
                  <div className="cat-meter-container">
                    <div className="cat-meter-track">
                      <div
                        className={`cat-meter-fill ${hasExceptions ? 'meter-fill-pattern' : 'meter-fill-solid'}`}
                        style={{ width: `${Math.max(cat.health_score, 4)}%` }}
                      />
                    </div>
                    <span className="cat-meter-percentage">{cat.health_score}%</span>
                  </div>

                  {/* Stats and Exceptions note */}
                  <div className="cat-card-footer">
                    <div className="cat-controls-tally">
                      <span><strong>{cat.total_controls}</strong> tested</span>
                      <span className="tally-dot">·</span>
                      <span><strong>{cat.passed_controls}</strong> passed</span>
                      {hasExceptions && (
                        <>
                          <span className="tally-dot">·</span>
                          <span className="tally-exception-count"><strong>{cat.exception_count}</strong> failed</span>
                        </>
                      )}
                    </div>

                    {/* Exceptions list if any */}
                    {hasExceptions && cat.exceptions && cat.exceptions.length > 0 && (
                      <div className="cat-exceptions-tags">
                        <span className="cat-exc-label">Exceptions:</span>
                        {cat.exceptions.map((excId) => (
                          <span key={excId} className="cat-exc-chip">
                            {excId}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
