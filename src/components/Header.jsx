import React, { useState } from 'react';
import {
  ExternalLink,
  Bell,
  Menu,
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
          className="mobile-hamburger-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={22} />
        </button>

        <div className="header-title-badge">
          <span className="badge badge-demo">[PROTOTYPE DEMO]</span>
        </div>
      </div>

      <div className="header-right">
        {/* Role Switcher for Evaluation */}
        <div className="role-switcher-container" title="Switch user persona to test role permissions">
          <span className="role-switcher-label">Persona:</span>
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
            className="btn btn-sm btn-outline notif-btn"
            style={{ position: 'relative', minHeight: '40px' }}
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            title="Campus Notifications"
          >
            <Bell size={18} />
            {unreadNotifs.length > 0 && (
              <span className="notif-badge-pill">
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="notif-popover">
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
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications</span>

              </div>

              {notifications.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
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
                        padding: '0.6rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: n.isRead ? 'var(--bg-surface-subtle)' : '#eff6ff',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        border: '1px solid',
                        borderColor: n.isRead ? 'transparent' : 'var(--color-primary-border)',
                      }}
                    >
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.15rem' }}>
                        {n.title}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{n.content}</div>
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
          className="header-user-badge"
          title="Open Profile & Privacy Shield"
        >
          <div className="header-user-avatar">
            {currentUser?.displayName ? currentUser.displayName[0] : 'U'}
          </div>
          <div className="header-user-info">
            <div style={{ fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.2 }}>
              {currentUser?.displayName}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {currentUser?.role?.replace('_', ' ').toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
