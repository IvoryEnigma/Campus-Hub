import React, { useState } from 'react';
import {
  Users,
  Search,
  Lock,
  Unlock,
  Building,
  BookOpen,
  Megaphone,
  ArrowRight,
  Info,
} from 'lucide-react';

export default function CommunitiesView({
  communities,
  currentUser,
  onSelectCommunity,
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  let filtered = communities;
  if (activeCategory !== 'all') {
    filtered = filtered.filter((c) => c.category === activeCategory);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }

  const clubs = communities.filter((c) => c.category === 'club');
  const departments = communities.filter((c) => c.category === 'department');
  const hostels = communities.filter((c) => c.category === 'hostel');

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-block">
          <h1>Campus Communities & Channels</h1>
          <p>
            Explore communication channels across clubs, academic departments, first year engineering, and hostels.
          </p>
        </div>
      </div>

      {/* Critical Campus Policy Note */}
      <div
        style={{
          backgroundColor: '#eff6ff',
          border: '1px solid var(--color-primary-border)',
          borderRadius: 'var(--radius-md)',
          padding: '0.9rem 1.25rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          fontSize: '0.85rem',
          color: '#1e3a8a',
        }}
      >
        <Info size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Campus Communication Policy:</strong> All 29 club channels are broadcast and discussion spaces open to all AIT students (including First Year). They are NOT club membership rosters or ranking lists. Viewing a channel does not imply official membership.
        </div>
      </div>

      {/* Category Pills & Search */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${activeCategory === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveCategory('all')}
          >
            All Spaces ({communities.length})
          </button>
          <button
            className={`btn btn-sm ${activeCategory === 'club' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveCategory('club')}
          >
            29 Club Channels ({clubs.length})
          </button>
          <button
            className={`btn btn-sm ${activeCategory === 'department' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveCategory('department')}
          >
            Departments ({departments.length})
          </button>
          <button
            className={`btn btn-sm ${activeCategory === 'fe' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveCategory('fe')}
          >
            FE Announcements
          </button>
          <button
            className={`btn btn-sm ${activeCategory === 'hostel' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveCategory('hostel')}
          >
            Hostels ({hostels.length})
          </button>
        </div>

        <div style={{ width: '260px', position: 'relative' }}>
          <Search
            size={16}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '10px', top: '10px' }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '32px' }}
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Communities Grid */}
      <div className="grid-3">
        {filtered.map((comm) => {
          const isHostel = comm.category === 'hostel';
          const hasAccess = comm.hasAccess;

          return (
            <div
              key={comm.slug}
              className="card card-hover"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                opacity: isHostel && !hasAccess ? 0.75 : 1,
                borderLeft: isHostel
                  ? `4px solid ${hasAccess ? '#059669' : '#dc2626'}`
                  : undefined,
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                  }}
                >
                  <span
                    className="badge"
                    style={{
                      backgroundColor:
                        comm.category === 'club'
                          ? '#f1f5f9'
                          : comm.category === 'department'
                          ? '#e0e7ff'
                          : comm.category === 'fe'
                          ? '#fef3c7'
                          : hasAccess
                          ? '#ecfdf5'
                          : '#fee2e2',
                      color:
                        comm.category === 'club'
                          ? '#334155'
                          : comm.category === 'department'
                          ? '#3730a3'
                          : comm.category === 'fe'
                          ? '#92400e'
                          : hasAccess
                          ? '#065f46'
                          : '#991b1b',
                    }}
                  >
                    {comm.category.toUpperCase()}
                  </span>

                  {isHostel ? (
                    hasAccess ? (
                      <span className="badge badge-verified" title="Access granted">
                        <Unlock size={12} /> AUTHORIZED
                      </span>
                    ) : (
                      <span className="badge badge-restricted" title="Restricted access">
                        <Lock size={12} /> RESTRICTED
                      </span>
                    )
                  ) : (
                    <span className="badge badge-demo">DEMO</span>
                  )}
                </div>

                <h3
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    marginBottom: '0.4rem',
                    lineHeight: 1.3,
                  }}
                >
                  {comm.name}
                </h3>

                <p
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    marginBottom: '1rem',
                  }}
                >
                  {comm.description}
                </p>
              </div>

              <div>
                <button
                  className={`btn btn-sm ${hasAccess ? 'btn-secondary' : 'btn-outline'}`}
                  style={{ width: '100%', justifyContent: 'space-between' }}
                  onClick={() => onSelectCommunity(comm.slug)}
                >
                  <span>{hasAccess ? 'Open Channel Feed' : 'Access Restricted'}</span>
                  {hasAccess ? <ArrowRight size={14} /> : <Lock size={14} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
