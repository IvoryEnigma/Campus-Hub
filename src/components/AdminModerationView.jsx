import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  Clock,
  Briefcase,
  Users,
  ExternalLink,
} from 'lucide-react';
import { api } from '../api';

export default function AdminModerationView({ currentUser }) {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPending = async () => {
    setLoading(true);
    try {
      const res = await api.getPendingAlumni();
      setVerifications(res.verifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleReview = async (id, approve) => {
    try {
      await api.reviewAlumni(id, approve);
      alert(`Alumni verification ${approve ? 'APPROVED' : 'REJECTED'}`);
      loadPending();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-block">
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
            <span className="badge badge-official">ADMINISTRATION CONSOLE</span>
            <span className="badge badge-restricted">SUPERVISORY ACCESS</span>
          </div>
          <h1>Alumni & Opportunity Moderation</h1>
          <p>
            Review incoming alumni verification requests and ensure opportunities are vetted before publishing.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          Pending Alumni Verification Queue
        </h2>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading queue...</p>
        ) : verifications.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No verification requests currently pending.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {verifications.map((v) => (
              <div
                key={v.id}
                style={{
                  padding: '1rem',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: v.status === 'pending' ? 'white' : 'var(--bg-surface-subtle)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{v.displayName}</h3>
                    <span className={`badge ${v.status === 'approved' ? 'badge-verified' : v.status === 'rejected' ? 'badge-restricted' : 'badge-demo'}`}>
                      {v.status.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    <strong>{v.designation}</strong> at <strong>{v.company}</strong> (Class of {v.graduationYear})
                  </div>
                  {v.linkedInUrl && (
                    <a
                      href={v.linkedInUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: '0.75rem', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}
                    >
                      <span>LinkedIn Profile</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>

                {v.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleReview(v.id, true)}
                    >
                      <CheckCircle size={14} />
                      <span>Approve</span>
                    </button>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => handleReview(v.id, false)}
                      style={{ color: '#dc2626' }}
                    >
                      <XCircle size={14} />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
