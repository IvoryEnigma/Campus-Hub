import React, { useState } from 'react';
import {
  Building,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  AlertTriangle,
  ArrowRight,
  Plus,
} from 'lucide-react';
import CommunityDetailView from './CommunityDetailView';

export default function HostelView({
  currentUser,
  communities,
  onRefreshInbox,
}) {
  const [selectedHostelTab, setSelectedHostelTab] = useState(
    currentUser?.hostelAssignment === "Boys' Hostel" ? 'hostel-boys' : 'hostel-girls'
  );

  const girlsComm = communities.find((c) => c.slug === 'hostel-girls');
  const boysComm = communities.find((c) => c.slug === 'hostel-boys');

  const activeComm = selectedHostelTab === 'hostel-girls' ? girlsComm : boysComm;
  const hasAccess = activeComm?.hasAccess;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-block">
          <h1>Hostel Communication Hub</h1>
          <p>
            Secure, isolated spaces for Girls' Hostel and Boys' Hostel notices, maintenance, and instructions.
          </p>
        </div>
      </div>

      {/* Hostel Selection Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '1.5rem',
        }}
      >
        <button
          className={`action-btn ${selectedHostelTab === 'hostel-girls' ? 'active' : ''}`}
          style={{ padding: '0.75rem 1.25rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={() => setSelectedHostelTab('hostel-girls')}
        >
          <Building size={16} />
          <span>Girls' Hostel</span>
          {girlsComm?.hasAccess ? (
            <span className="badge badge-verified" style={{ fontSize: '0.65rem' }}>
              <Unlock size={10} /> Authorized
            </span>
          ) : (
            <span className="badge badge-restricted" style={{ fontSize: '0.65rem' }}>
              <Lock size={10} /> Restricted
            </span>
          )}
        </button>

        <button
          className={`action-btn ${selectedHostelTab === 'hostel-boys' ? 'active' : ''}`}
          style={{ padding: '0.75rem 1.25rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={() => setSelectedHostelTab('hostel-boys')}
        >
          <Building size={16} />
          <span>Boys' Hostel</span>
          {boysComm?.hasAccess ? (
            <span className="badge badge-verified" style={{ fontSize: '0.65rem' }}>
              <Unlock size={10} /> Authorized
            </span>
          ) : (
            <span className="badge badge-restricted" style={{ fontSize: '0.65rem' }}>
              <Lock size={10} /> Restricted
            </span>
          )}
        </button>
      </div>

      {/* Isolation Enforcement Notice */}
      <div className="privacy-shield-box" style={{ marginBottom: '1.5rem' }}>
        <ShieldCheck size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Server-Enforced Isolation:</strong> AIT Campus Hub enforces strict row-level authorization. Residents of Girls' Hostel are blocked from Boys' Hostel database queries and feeds, and vice versa. Chief Wardens and Administrators hold assigned supervisory access.
        </div>
      </div>

      {/* Main Feed or Isolation Rejection Box */}
      {hasAccess ? (
        <CommunityDetailView
          communitySlug={selectedHostelTab}
          currentUser={currentUser}
          onBack={() => {}}
          onRefreshInbox={onRefreshInbox}
        />
      ) : (
        <div className="card" style={{ borderLeft: '4px solid #dc2626', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#991b1b', marginBottom: '0.75rem' }}>
            <ShieldAlert size={28} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Restricted Hostel Space</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '700px' }}>
            You do not hold authorization credentials for <strong>{activeComm?.name}</strong>.
            Your verified campus assignment is <strong>{currentUser?.hostelAssignment || 'None'}</strong>.
          </p>
          <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            To inspect the authorized channel for your verified persona, select the appropriate tab above or use the active persona switcher in the top navigation bar.
          </p>
        </div>
      )}
    </div>
  );
}
