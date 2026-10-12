import React from 'react';
import {
  Home,
  Inbox,
  Users,
  Megaphone,
  BookOpen,
  Building,
  Lightbulb,
  Bookmark,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';

export default function Sidebar({ currentView, onNavigate, currentUser, unreadCount }) {
  const isAdminOrFaculty = currentUser?.role === 'admin' || currentUser?.role === 'faculty';

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'inbox', label: 'Campus Inbox', icon: Inbox, badge: unreadCount > 0 ? unreadCount : null },
    { id: 'communities', label: 'Communities', icon: Users },
    { id: 'fe-announcements', label: 'FE Announcements', icon: Megaphone },
    { id: 'departments', label: 'Departments', icon: BookOpen },
    { id: 'hostel', label: 'Hostel', icon: Building },
    { id: 'innovation', label: 'Innovation Hub', icon: Lightbulb },
    { id: 'saved', label: 'Saved', icon: Bookmark },
    { id: 'profile', label: 'Profile', icon: UserCheck },
  ];

  return (
    <aside className="app-sidebar">
      <div className="sidebar-header">
        <div className="ait-logo-badge">AIT</div>
        <div className="brand-text">
          <h1>AIT CAMPUS HUB</h1>
          <p>Army Institute of Technology</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Navigation</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <div
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </div>
          );
        })}

        {isAdminOrFaculty && (
          <>
            <div className="nav-section-label" style={{ marginTop: '0.75rem' }}>
              Administration
            </div>
            <div
              className={`nav-item ${currentView === 'moderation' ? 'active' : ''}`}
              onClick={() => onNavigate('moderation')}
            >
              <ShieldAlert size={18} />
              <span>Admin & Moderation</span>
            </div>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
          <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>AIT Pune, Dighi Hills</div>
          <div>Alandi Road, Pune - 411015</div>
          <div style={{ marginTop: '0.35rem', color: 'var(--color-primary)', fontWeight: 600 }}>
            v1.0 Production SaaS
          </div>
        </div>
      </div>
    </aside>
  );
}
