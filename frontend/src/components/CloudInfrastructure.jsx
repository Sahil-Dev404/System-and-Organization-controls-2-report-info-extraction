import React from 'react';

export default function CloudInfrastructure({ cloudInfra }) {
  if (!cloudInfra) return null;

  const {
    hosting_providers = [],
    databases = [],
    encryption_at_rest = [],
    encryption_in_transit = []
  } = cloudInfra;

  return (
    <section className="cloud-infra-section">
      <div className="section-header-row">
        <div>
          <h3 className="section-title">Cloud & infrastructure stack (Section III)</h3>
          <p className="section-subtitle">
            Hosting environments, data repositories, and cryptographic safeguards verified in scope
          </p>
        </div>
        <div className="infra-pill-count">
          <span>SEC. III TECHNICAL DISCLOSURES</span>
        </div>
      </div>

      <div className="section-divider" />

      <div className="cloud-infra-grid">
        {/* 1. Hosting Providers */}
        <div className="infra-card">
          <div className="infra-card-header">
            <span className="infra-card-icon">☁️</span>
            <div>
              <span className="infra-card-title">HOSTING & CLOUD ENVIRONMENTS</span>
              <span className="infra-card-desc">Underlying cloud infrastructure and data center providers</span>
            </div>
          </div>
          <div className="infra-chips-container">
            {hosting_providers.length > 0 ? (
              hosting_providers.map((h, i) => (
                <span key={i} className="infra-chip infra-chip-hosting">
                  {h}
                </span>
              ))
            ) : (
              <span className="infra-chip infra-chip-muted">Cloud Infrastructure</span>
            )}
          </div>
        </div>

        {/* 2. Databases & Storage */}
        <div className="infra-card">
          <div className="infra-card-header">
            <span className="infra-card-icon">🗄️</span>
            <div>
              <span className="infra-card-title">DATA STORAGE & DATABASES</span>
              <span className="infra-card-desc">Persistent data stores, warehouses, and object storage</span>
            </div>
          </div>
          <div className="infra-chips-container">
            {databases.length > 0 ? (
              databases.map((db, i) => (
                <span key={i} className="infra-chip infra-chip-db">
                  {db}
                </span>
              ))
            ) : (
              <span className="infra-chip infra-chip-muted">Managed Database Services</span>
            )}
          </div>
        </div>

        {/* 3. Encryption at Rest */}
        <div className="infra-card">
          <div className="infra-card-header">
            <span className="infra-card-icon">🔒</span>
            <div>
              <span className="infra-card-title">ENCRYPTION AT REST</span>
              <span className="infra-card-desc">Cryptographic standards protecting volume and database storage</span>
            </div>
          </div>
          <div className="infra-chips-container">
            {encryption_at_rest.length > 0 ? (
              encryption_at_rest.map((enc, i) => (
                <span key={i} className="infra-chip infra-chip-rest">
                  {enc}
                </span>
              ))
            ) : (
              <span className="infra-chip infra-chip-muted">AES-256 Volume Encryption</span>
            )}
          </div>
        </div>

        {/* 4. Encryption in Transit */}
        <div className="infra-card">
          <div className="infra-card-header">
            <span className="infra-card-icon">🌐</span>
            <div>
              <span className="infra-card-title">ENCRYPTION IN TRANSIT</span>
              <span className="infra-card-desc">Network perimeter, API endpoints, and transport cipher suites</span>
            </div>
          </div>
          <div className="infra-chips-container">
            {encryption_in_transit.length > 0 ? (
              encryption_in_transit.map((tr, i) => (
                <span key={i} className="infra-chip infra-chip-transit">
                  {tr}
                </span>
              ))
            ) : (
              <span className="infra-chip infra-chip-muted">TLS 1.2 / TLS 1.3</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
