import React from 'react';
import {
  Home,
  Inbox,
  Users,
  Megaphone,
  BookOpen,
  Building,
  AlertCircle,
  Lightbulb,
  Bookmark,
  UserCheck,
  ShieldAlert,
  ExternalLink,
  X,
} from 'lucide-react';

export default function Sidebar({
  currentView,
  onNavigate,
  currentUser,
  unreadCount,
  isOpen,
  onClose,
}) {
  const isAdminOrFaculty = currentUser?.role === 'admin' || currentUser?.role === 'faculty';

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'inbox', label: 'Campus Inbox', icon: Inbox, badge: unreadCount > 0 ? unreadCount : null },
    { id: 'communities', label: 'Communities', icon: Users },
    { id: 'fe-announcements', label: 'FE Announcements', icon: Megaphone },
    { id: 'departments', label: 'Departments', icon: BookOpen },
    { id: 'hostel', label: 'Hostel', icon: Building },
    { id: 'campus-problems', label: 'Campus Problems', icon: AlertCircle },
    { id: 'innovation', label: 'Innovation Hub', icon: Lightbulb },
    { id: 'saved', label: 'Saved', icon: Bookmark },
    { id: 'profile', label: 'Profile', icon: UserCheck },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`app-sidebar ${isOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="ait-logo-badge">AIT</div>
          <div className="brand-text">
            <h1>AIT CAMPUS HUB</h1>
            <p>Army Institute of Technology</p>
          </div>
          {isOpen && (
            <button
              className="btn-icon mobile-close-btn"
              onClick={onClose}
              aria-label="Close Navigation"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main Navigation</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  onNavigate(item.id);
                  if (onClose) onClose();
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </button>
            );
          })}

          {isAdminOrFaculty && (
            <>
              <div className="nav-section-label" style={{ marginTop: '0.75rem' }}>
                Administration
              </div>
              <button
                type="button"
                className={`nav-item ${currentView === 'moderation' ? 'active' : ''}`}
                onClick={() => {
                  onNavigate('moderation');
                  if (onClose) onClose();
                }}
              >
                <ShieldAlert size={18} />
                <span>Admin & Moderation</span>
              </button>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <a
            href="https://www.aitpune.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-official-link"
            title="Visit Official AIT Pune Website"
          >
            <span>Official Website (aitpune.com)</span>
            <ExternalLink size={14} />
          </a>
          <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            AIT Pune, Dighi Hills • DEMO Prototype
          </div>
        </div>
      </aside>
    </>
  );
}
