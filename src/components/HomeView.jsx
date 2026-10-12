import React from 'react';
import {
  Inbox,
  Lightbulb,
  Users,
  Megaphone,
  Pin,
  Calendar,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  Building,
} from 'lucide-react';

export default function HomeView({
  currentUser,
  inboxData,
  ideas,
  opportunities,
  onNavigate,
  onOpenNewIdea,
}) {
  const pinnedMessages = inboxData?.messages?.filter((m) => m.isPinned) || [];
  const recentMessages = inboxData?.messages?.slice(0, 4) || [];
  const unreadCount = inboxData?.counts?.unread || 0;

  return (
    <div className="page-container">
      {/* Top Banner & Quick Actions */}
      <div className="page-header">
        <div className="page-title-block">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-demo">[PROTOTYPE DEMO]</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Signed in as <strong>{currentUser?.displayName}</strong> ({currentUser?.role?.toUpperCase()})
            </span>
          </div>
          <h1>Campus Hub Dashboard</h1>
          <p>
            Unified campus announcements, hostel notices, academic communities, and student innovation.
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
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
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
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Innovation Hub Proposals
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Briefcase size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {opportunities.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Verified Opportunities
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Feed & Side Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Left Column: Pinned Announcements & Recent Posts */}
        <div>
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
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Important Pinned Announcements
              </h2>
            </div>

            {pinnedMessages.length === 0 ? (
              <div className="card" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
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
                        <span className="badge badge-official">[OFFICIAL]</span>
                        {msg.isDemo && <span className="badge badge-demo">[DEMO]</span>}
                      </div>
                    </div>
                    <span className="badge badge-official" style={{ fontSize: '0.65rem' }}>
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

          {/* Recent Accessible Messages */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
              }}
            >
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Recent Community & Channel Updates
              </h2>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => onNavigate('communities')}
              >
                <span>View All 29 Clubs & Spaces</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {recentMessages.map((msg) => (
              <div key={msg.id} className="message-card">
                <div className="message-card-header">
                  <div className="author-meta">
                    <span className="author-name">{msg.authorDisplayName}</span>
                    <span className="author-badge">{msg.communitySlug}</span>
                    <span className="message-date">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    {msg.isOfficial && <span className="badge badge-official">[OFFICIAL]</span>}
                    {msg.isDemo && <span className="badge badge-demo">[DEMO]</span>}
                  </div>
                </div>
                <h3 className="message-title">{msg.title}</h3>
                <p className="message-content">{msg.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Hostel Access Status Widget */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Building size={18} color="var(--color-primary)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Hostel Authorization</h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Hostel content is strictly isolated. You have access only to your verified assignment.
            </p>
            <div
              style={{
                backgroundColor: 'var(--bg-surface-subtle)',
                padding: '0.6rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontWeight: 600 }}>Your Assignment:</span>
              <span className="badge badge-verified">
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

          {/* Upcoming Real/Demo Campus Events */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Calendar size={18} color="var(--color-primary)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Upcoming Campus Events</h3>
              <span className="badge badge-demo" style={{ marginLeft: 'auto' }}>DEMO</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div
                style={{
                  padding: '0.5rem',
                  borderLeft: '3px solid #2563eb',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>AIT Solutions Hackathon 2026</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Oct 28-29 • Manekshaw Auditorium
                </div>
              </div>

              <div
                style={{
                  padding: '0.5rem',
                  borderLeft: '3px solid #059669',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Alumni Mentorship Connect</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Nov 05 • Virtual Seminar Series
                </div>
              </div>
            </div>
          </div>

          {/* Quick Innovation Hub Spotlights */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Lightbulb size={18} color="var(--color-primary)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Innovation Spotlight</h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Student projects seeking interdisciplinary teammates.
            </p>
            {ideas.slice(0, 2).map((idea) => (
              <div
                key={idea.id}
                style={{
                  marginBottom: '0.65rem',
                  padding: '0.5rem',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                  {idea.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  {idea.category} • {idea.likesCount} Likes
                </div>
              </div>
            ))}
            <button
              className="btn btn-sm btn-outline"
              style={{ width: '100%', marginTop: '0.5rem' }}
              onClick={() => onNavigate('innovation')}
            >
              Explore Innovation Hub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
