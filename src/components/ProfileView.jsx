import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  User,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  Briefcase,
  AlertCircle,
  Save,
} from 'lucide-react';
import { api } from '../api';

export default function ProfileView({
  currentUser,
  onRefreshUser,
}) {
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Alumni Registration form
  const [showAlumniForm, setShowAlumniForm] = useState(false);
  const [gradYear, setGradYear] = useState('2024');
  const [company, setCompany] = useState('');
  const [designation, setDesignation] = useState('');
  const [linkedIn, setLinkedIn] = useState('');
  const [alumniSubmitting, setAlumniSubmitting] = useState(false);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateProfile({ displayName });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      onRefreshUser();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRegisterAlumni = async (e) => {
    e.preventDefault();
    setAlumniSubmitting(true);
    try {
      await api.registerAlumni({
        graduationYear: gradYear,
        company,
        designation,
        linkedInUrl: linkedIn,
      });
      alert('Alumni registration submitted! Your profile is pending Administrator verification.');
      setShowAlumniForm(false);
      onRefreshUser();
    } catch (err) {
      alert(err.message);
    } finally {
      setAlumniSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-block">
          <h1>Student Profile & Privacy Shield</h1>
          <p>
            Manage your personal profile and inspect AIT Campus Hub's data privacy guarantees.
          </p>
        </div>
      </div>

      {/* Strict Privacy Shield Guarantee Box */}
      <div className="privacy-shield-box" style={{ marginBottom: '1.75rem' }}>
        <ShieldCheck size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>AIT Student Privacy Shield Active</h3>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
            To safeguard students from data leakage and unsolicited contact, our system enforces strict server-level masking: Only your chosen <strong>Display Name</strong> is visible in public threads, comments, and community channels. Your <strong>Registration Number</strong>, <strong>Personal Phone</strong>, <strong>Email</strong>, and <strong>Department/Branch</strong> are cryptographically shielded and never served to other clients.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
        {/* Left Column: Public Identity & Editable Display Name */}
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>
              Public Display Settings
            </h2>

            <form onSubmit={handleUpdateName}>
              <div className="form-group">
                <label className="form-label">Chosen Display Name (Publicly Visible)</label>
                <input
                  type="text"
                  className="form-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your preferred name"
                  required
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  This is the ONLY identifier shown on announcements, discussions, and innovation ideas.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                  <Save size={14} />
                  <span>{saving ? 'Saving...' : 'Update Display Name'}</span>
                </button>
                {saveSuccess && (
                  <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>
                    Saved successfully!
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Alumni & Mentor Registration Section */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Briefcase size={18} color="var(--color-primary)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Alumni & Mentor Verification</h3>
              </div>
              {currentUser?.role === 'alumni' && (
                <span className={`badge ${currentUser.verified ? 'badge-verified' : 'badge-demo'}`}>
                  {currentUser.verified ? 'VERIFIED ALUMNI' : 'PENDING VERIFICATION'}
                </span>
              )}
            </div>

            {currentUser?.role === 'alumni' ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {currentUser.verified ? (
                  <div style={{ backgroundColor: '#f0fdf4', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0' }}>
                    <p style={{ color: '#166534', fontWeight: 600 }}>
                      You are a verified AIT Alumni ({currentUser.company} - {currentUser.graduationYear}). You are authorized to publish verified opportunities and mentor students.
                    </p>
                  </div>
                ) : (
                  <div style={{ backgroundColor: '#fffbeb', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #fde68a' }}>
                    <p style={{ color: '#92400e', fontWeight: 600 }}>
                      Your Alumni verification is under review by the College Administration. You will be able to publish campus opportunities once approved.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Graduated from AIT? Register your alumni profile to mentor current students and post verified job, internship, or research opportunities.
                </p>

                {!showAlumniForm ? (
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowAlumniForm(true)}>
                    Register as AIT Alumni / Mentor
                  </button>
                ) : (
                  <form onSubmit={handleRegisterAlumni} style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Graduation Year *</label>
                      <input
                        type="number"
                        className="form-input"
                        value={gradYear}
                        onChange={(e) => setGradYear(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Current Company / Organization *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Microsoft, Qualcomm, DRDO"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Designation / Role *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Software Development Engineer"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">LinkedIn Profile URL</label>
                      <input
                        type="url"
                        className="form-input"
                        placeholder="https://linkedin.com/in/username"
                        value={linkedIn}
                        onChange={(e) => setLinkedIn(e.target.value)}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="submit" className="btn btn-primary btn-sm" disabled={alumniSubmitting}>
                        {alumniSubmitting ? 'Submitting...' : 'Submit for Admin Review'}
                      </button>
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowAlumniForm(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Private Protected Records (Shielded from Public) */}
        <div>
          <div className="card" style={{ borderLeft: '4px solid #059669' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Lock size={18} color="#059669" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Private Records (Visible to You Only)</h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              These records are securely protected in the institute database and NEVER shared with other students or third parties:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  REGISTRATION NUMBER
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {currentUser?.regNumber || 'Verified on Enrollment'}
                </div>
              </div>

              <div style={{ padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  INSTITUTE EMAIL
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  {currentUser?.email || 'N/A'}
                </div>
              </div>

              <div style={{ padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  CONTACT PHONE
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  {currentUser?.phone || 'N/A'}
                </div>
              </div>

              <div style={{ padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  HOSTEL ASSIGNMENT
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {currentUser?.hostelAssignment || 'None'}
                </div>
              </div>

              <div style={{ padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  ACADEMIC BRANCH & BATCH
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  {currentUser?.branch || 'General'} ({currentUser?.admissionBatch || 'Campus Resident'})
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
