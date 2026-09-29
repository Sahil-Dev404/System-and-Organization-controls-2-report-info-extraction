import React from 'react';

export default function TrustBoundaryDiagram({ metadata, cuecs = [], subserviceOrgs = [], exceptions = [] }) {
  const orgName = metadata?.org || 'Service Organization';
  const sysName = metadata?.system || 'Core SaaS Platform';
  const criteriaList = metadata?.criteria || ['Security'];

  const cuecCount = cuecs.length;
  const subCount = subserviceOrgs.length;
  const excCount = exceptions.length;

  return (
    <section className="trust-boundary-section">
      <div className="section-header-row">
        <div>
          <h3 className="section-title">System & trust boundary architecture</h3>
          <p className="section-subtitle">
            Shared responsibility model mapping Customer CUECs, Audited Vendor Controls, and Subservice CSOCs
          </p>
        </div>
        <div className="boundary-badge-pill">
          <span>3-TIER TRUST HIERARCHY</span>
        </div>
      </div>

      <div className="section-divider" />

      {/* 3-Tier Layer Flowchart */}
      <div className="boundary-flow-container">
        {/* ================= LAYER 1: USER ENTITY ================= */}
        <div className="boundary-layer-card layer-client">
          <div className="layer-tag">LAYER 1 · USER ENTITY (CUSTOMER)</div>
          <div className="layer-header">
            <h4 className="layer-name">Your Organization</h4>
            <span className="layer-tally-pill">{cuecCount} CUECs</span>
          </div>
          <p className="layer-role-desc">
            Controls that customers are required to operate to achieve the vendor's audit trust objectives.
          </p>

          <div className="layer-responsibilities-list">
            <div className="resp-item">
              <span className="resp-bullet">■</span>
              <span><strong>MFA & Credentials:</strong> Enforce multi-factor authentication on all user & admin accounts.</span>
            </div>
            <div className="resp-item">
              <span className="resp-bullet">■</span>
              <span><strong>Timely Offboarding:</strong> Promptly revoke tenant credentials upon employee termination.</span>
            </div>
            <div className="resp-item">
              <span className="resp-bullet">■</span>
              <span><strong>Least Privilege:</strong> Restrict administrative roles and conduct periodic tenant access audits.</span>
            </div>
            <div className="resp-item">
              <span className="resp-bullet">■</span>
              <span><strong>Endpoint Security:</strong> Ensure workstation disk encryption, firewalls, and anti-malware.</span>
            </div>
          </div>

          <div className="layer-card-footer">
            <span className="layer-footer-note">Governed by Section III Complementary User Entity Controls</span>
          </div>
        </div>

        {/* FLOW CONNECTOR 1 -> 2 */}
        <div className="boundary-connector">
          <div className="connector-line" />
          <div className="connector-badge">
            <span className="connector-arrow">▼</span>
            <span className="connector-text">ENFORCES CUECS · SECURES TENANT ACCESS</span>
            <span className="connector-arrow">▼</span>
          </div>
          <div className="connector-line" />
        </div>

        {/* ================= LAYER 2: AUDITED VENDOR ================= */}
        <div className="boundary-layer-card layer-service">
          <div className="layer-tag">LAYER 2 · AUDITED SERVICE ORGANIZATION</div>
          <div className="layer-header">
            <div>
              <h4 className="layer-name">{orgName}</h4>
              <span className="layer-system-name">{sysName}</span>
            </div>
            <span className="layer-tally-pill">{excCount} Exceptions</span>
          </div>
          <p className="layer-role-desc">
            Primary system in audit scope responsible for software architecture, access control, and operations.
          </p>

          <div className="layer-trust-chips">
            {criteriaList.map((crit, idx) => (
              <span key={idx} className="chip-black">
                {crit}
              </span>
            ))}
          </div>

          <div className="layer-responsibilities-list">
            <div className="resp-item">
              <span className="resp-bullet">■</span>
              <span><strong>Logical Access (CC6):</strong> SSO integration, role-based database permissions, encryption at rest/transit.</span>
            </div>
            <div className="resp-item">
              <span className="resp-bullet">■</span>
              <span><strong>Change Management (CC8):</strong> CI/CD peer code reviews, automated integration testing, CAB sign-offs.</span>
            </div>
            <div className="resp-item">
              <span className="resp-bullet">■</span>
              <span><strong>System Operations (CC7):</strong> 24/7 SIEM monitoring, vulnerability scanners, incident response playbooks.</span>
            </div>
            <div className="resp-item">
              <span className="resp-bullet">■</span>
              <span><strong>Business Continuity (A1):</strong> Automated database snapshots, cross-region backups, annual DR drills.</span>
            </div>
          </div>

          <div className="layer-card-footer">
            <span className="layer-footer-note">Governed by Section IV Trust Services Criteria & Tested Controls</span>
          </div>
        </div>

        {/* FLOW CONNECTOR 2 -> 3 */}
        <div className="boundary-connector">
          <div className="connector-line" />
          <div className="connector-badge">
            <span className="connector-arrow">▼</span>
            <span className="connector-text">RELIES ON CSOCS · OUTSOURCED INFRASTRUCTURE</span>
            <span className="connector-arrow">▼</span>
          </div>
          <div className="connector-line" />
        </div>

        {/* ================= LAYER 3: SUBSERVICE PROVIDERS ================= */}
        <div className="boundary-layer-card layer-subservices">
          <div className="layer-tag">LAYER 3 · CARVE-OUT SUBSERVICE ORGANIZATIONS</div>
          <div className="layer-header">
            <h4 className="layer-name">Downstream Cloud & Hosting Vendors</h4>
            <span className="layer-tally-pill">{subCount} Providers</span>
          </div>
          <p className="layer-role-desc">
            Third-party sub-processors whose controls are carved out and assumed to operate effectively via CSOCs.
          </p>

          {subserviceOrgs.length > 0 && (
            <div className="layer-subservices-chips">
              {subserviceOrgs.map((sub, idx) => (
                <div key={idx} className="sub-provider-item">
                  <span className="sub-provider-name">{sub.name}</span>
                  <span className="sub-provider-method">{sub.method || 'Carve-Out'}</span>
                </div>
              ))}
            </div>
          )}

          <div className="layer-responsibilities-list">
            <div className="resp-item">
              <span className="resp-bullet">■</span>
              <span><strong>Physical Security:</strong> Data center perimeter security, biometric barriers, 24/7 video surveillance.</span>
            </div>
            <div className="resp-item">
              <span className="resp-bullet">■</span>
              <span><strong>Environmental Safeguards:</strong> Redundant power (UPS & diesel generators), HVAC climate control, fire suppression.</span>
            </div>
            <div className="resp-item">
              <span className="resp-bullet">■</span>
              <span><strong>Hardware Lifecycle:</strong> NIST 800-88 compliant disk sanitization and certified physical destruction.</span>
            </div>
          </div>

          <div className="layer-card-footer">
            <span className="layer-footer-note">Governed by Section III Complementary Subservice Organization Controls (CSOCs)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
