import React, { useState } from 'react';
import {
  ExternalLink,
  Bell,
  ShieldCheck,
  User,
  CheckCircle,
  AlertTriangle,
  Menu,
  X,
} from 'lucide-react';

export default function Header({
  currentUser,
  demoUsers,
  onSwitchUser,
  notifications,
  onNotificationRead,
  onNavigate,
  onToggleSidebar,
}) {
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const unreadNotifs = notifications.filter((n) => !n.isRead);

  return (
    <header className="top-header">
      <div className="header-left">
        <button
          className="btn btn-sm btn-outline mobile-toggle"
          onClick={onToggleSidebar}
          style={{ display: 'none' }}
        >
          <Menu size={18} />
        </button>

        <a
          href="https://www.aitpune.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="ait-official-link"
          title="Visit Official AIT Pune Website"
        >
          <span>Official Portal: aitpune.com</span>
          <ExternalLink size={13} />
        </a>
      </div>

      <div className="header-right">
        {/* Role Switcher for Evaluation */}
        <div className="role-switcher-container" title="Switch user persona to test role permissions">
          <span className="role-switcher-label">Active Persona:</span>
          <select
            className="role-select"
            value={currentUser?.id || ''}
            onChange={(e) => onSwitchUser(e.target.value)}
          >
            {demoUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.displayName} ({u.role.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* Notifications Popover */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-sm btn-outline"
            style={{ position: 'relative', padding: '0.4rem 0.6rem' }}
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            title="Campus Notifications"
          >
            <Bell size={16} />
            {unreadNotifs.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                }}
              >
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '40px',
                width: '320px',
                backgroundColor: 'white',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 50,
                padding: '0.75rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  marginBottom: '0.5rem',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Notifications</span>
                <span className="badge badge-demo">[DEMO FEED]</span>
              </div>

              {notifications.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  No recent notifications
                </div>
              ) : (
                <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexFlow: 'column', gap: '0.5rem' }}>
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        onNotificationRead(n.id);
                        if (n.link) onNavigate(n.link.replace('/', ''));
                        setShowNotifMenu(false);
                      }}
                      style={{
                        padding: '0.5rem 0.6rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: n.isRead ? 'var(--bg-surface-subtle)' : '#eff6ff',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        border: '1px solid',
                        borderColor: n.isRead ? 'transparent' : 'var(--color-primary-border)',
                      }}
                    >
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.15rem' }}>
                        {n.title}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{n.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Current User Quick Badge */}
        <div
          onClick={() => onNavigate('profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            padding: '0.25rem 0.5rem',
            borderRadius: 'var(--radius-md)',
          }}
          title="Open Profile & Privacy Shield"
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#e0e7ff',
              color: '#3730a3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            {currentUser?.displayName ? currentUser.displayName[0] : 'U'}
          </div>
          <div style={{ display: 'none', md: 'block' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, lineHeight: 1.1 }}>
              {currentUser?.displayName}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {currentUser?.role?.replace('_', ' ').toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
