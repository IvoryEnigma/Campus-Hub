import React from 'react';
import {
  Inbox,
  Lightbulb,
  AlertCircle,
  Pin,
  Calendar,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  Building,
  ThumbsUp,
  Server,
  Wifi,
} from 'lucide-react';

export default function HomeView({
  currentUser,
  inboxData,
  ideas,
  opportunities,
  problems = [],
  onNavigate,
  onOpenNewIdea,
}) {
  const pinnedMessages = inboxData?.messages?.filter((m) => m.isPinned) || [];
  const recentMessages = inboxData?.messages?.slice(0, 4) || [];
  const unreadCount = inboxData?.counts?.unread || 0;
  const topProblems = [...problems].sort((a, b) => (b.upvotesCount || 0) - (a.upvotesCount || 0)).slice(0, 3);

  return (
    <div className="page-container">
      {/* Top Banner & Quick Actions */}
      <div className="page-header">
        <div className="page-title-block">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-demo">[PROTOTYPE DEMO]</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Persona: <strong>{currentUser?.displayName}</strong> ({currentUser?.role?.toUpperCase()})
            </span>
          </div>
          <h1>Campus Hub Dashboard</h1>
          <p>
            Unified campus announcements, hostel updates, campus problems feedback, and student innovation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => onNavigate('inbox')}>
            <Inbox size={16} />
            <span>Open Inbox ({unreadCount} Unread)</span>
          </button>
          <button className="btn btn-primary" onClick={onOpenNewIdea}>
            <Lightbulb size={16} />
            <span>Submit Innovation Idea</span>
          </button>
        </div>
      </div>

      {/* Official Disclaimer Note */}
      <div
        style={{
          backgroundColor: '#eff6ff',
          border: '1px solid var(--color-primary-border)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          color: '#1e3a8a',
        }}
      >
        <ShieldCheck size={20} style={{ flexShrink: 0 }} />
        <div>
          <strong>Campus Note:</strong> Posts are student feedback and do not represent official AIT decisions. Never assume college administration approval or funding unless stated in a signed circular.
        </div>
      </div>

      {/* Highlights Bar */}
      <div className="grid-3" style={{ marginBottom: '1.75rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Inbox size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {unreadCount}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Unread Messages
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {problems.length} Tracked
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Campus Problems
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Lightbulb size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {ideas.length} Active
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Innovation Proposals
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Feed & Side Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Left Column: Pinned Announcements & Top Campus Problems */}
        <div>
          {/* Top Campus Problems Card */}
          <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid #dc2626' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={20} color="#dc2626" />
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Top Campus Problems
                </h2>
              </div>
              <span className="badge badge-demo">DEMO STUDENT FEED</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Most validated student issues across campus and hostels based on "I face this too" counts:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {topProblems.map((prob) => (
                <div
                  key={prob.id}
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <span className="badge badge-official" style={{ fontSize: '0.75rem' }}>{prob.category}</span>
                      <span className="badge badge-demo" style={{ fontSize: '0.75rem' }}>{prob.status}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                      {prob.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {prob.location} • {prob.whoIsAffected}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                    <ThumbsUp size={16} />
                    <span>{prob.upvotesCount}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="btn btn-sm btn-outline"
              style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}
              onClick={() => onNavigate('campus-problems')}
            >
              <span>Explore All Campus Problems & Solutions</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Pinned Announcements */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem',
              }}
            >
              <Pin size={18} color="var(--color-primary)" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Important Pinned Announcements
              </h2>
            </div>

            {pinnedMessages.length === 0 ? (
              <div className="card" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No pinned announcements at this moment.
              </div>
            ) : (
              pinnedMessages.map((msg) => (
                <div key={msg.id} className="message-card official">
                  <div className="message-card-header">
                    <div>
                      <div className="author-meta">
                        <span className="author-name">{msg.authorDisplayName}</span>
                        <span className="author-badge">{msg.roleBadge}</span>
                        <span className="message-date">
                          {new Date(msg.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ marginTop: '0.25rem', display: 'flex', gap: '0.4rem' }}>
                        <span className="badge badge-demo">[DEMO NOTICE]</span>
                      </div>
                    </div>
                    <span className="badge badge-official" style={{ fontSize: '0.75rem' }}>
                      PINNED
                    </span>
                  </div>

                  <h3 className="message-title">{msg.title}</h3>
                  <p className="message-content">{msg.content}</p>

                  <div className="message-actions">
                    <button className="action-btn" onClick={() => onNavigate('inbox')}>
                      View In Inbox
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Hostel Access Status Widget */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Building size={18} color="var(--color-primary)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Hostel Authorization</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Hostel spaces and problems are strictly isolated between Girls' Hostel and Boys' Hostel.
            </p>
            <div
              style={{
                backgroundColor: 'var(--bg-surface-subtle)',
                padding: '0.6rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontWeight: 600 }}>Your Assignment:</span>
              <span className="badge badge-official">
                {currentUser?.hostelAssignment || 'None'}
              </span>
            </div>
            <button
              className="btn btn-sm btn-outline"
              style={{ width: '100%', marginTop: '0.75rem' }}
              onClick={() => onNavigate('hostel')}
            >
              Open Hostel Channel
            </button>
          </div>

          {/* System Integrations Status (Phase 2 Requirement) */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Server size={18} color="var(--color-primary)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Campus Integrations</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>AIT ERP / Attendance</div>
                <div style={{ color: '#b45309', fontWeight: 600, fontSize: '0.78rem' }}>
                  Not connected / Requires official AIT access
                </div>
              </div>

              <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Official WhatsApp Sync</div>
                <div style={{ color: '#b45309', fontWeight: 600, fontSize: '0.78rem' }}>
                  Not connected / Requires official AIT access
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Campus Events */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Calendar size={18} color="var(--color-primary)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Upcoming Campus Events</h3>
              <span className="badge badge-demo" style={{ marginLeft: 'auto' }}>DEMO</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div
                style={{
                  padding: '0.6rem',
                  borderLeft: '3px solid #2563eb',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>AIT Solutions Hackathon 2026</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Oct 28-29 • Manekshaw Auditorium
                </div>
              </div>

              <div
                style={{
                  padding: '0.6rem',
                  borderLeft: '3px solid #059669',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Alumni Mentorship Connect</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Nov 05 • Virtual Seminar Series
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
