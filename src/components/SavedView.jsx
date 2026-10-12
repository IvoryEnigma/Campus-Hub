import React from 'react';
import { Bookmark, MessageSquare, CheckCircle } from 'lucide-react';
import { api } from '../api';

export default function SavedView({ inboxData, onRefreshInbox }) {
  const savedMessages = inboxData?.messages?.filter((m) => m.isSaved) || [];

  const handleUnsave = async (msgId) => {
    try {
      await api.toggleSave(msgId);
      onRefreshInbox();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-block">
          <h1>Saved Posts & Notices</h1>
          <p>Bookmarked academic circulars, club announcements, and innovation updates.</p>
        </div>
      </div>

      {savedMessages.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <Bookmark size={32} style={{ margin: '0 auto 0.75rem auto', color: 'var(--text-light)' }} />
          <h3>No saved messages</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Click the "Save" bookmark button on any message in the inbox or channel feeds to store it here for quick reference.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {savedMessages.map((msg) => (
            <div key={msg.id} className="message-card">
              <div className="message-card-header">
                <div className="author-meta">
                  <span className="author-name">{msg.authorDisplayName}</span>
                  <span className="author-badge">{msg.communitySlug}</span>
                  <span className="message-date">{new Date(msg.createdAt).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {msg.isOfficial && <span className="badge badge-official">[OFFICIAL]</span>}
                  {msg.isDemo && <span className="badge badge-demo">[DEMO]</span>}
                </div>
              </div>

              <h2 className="message-title">{msg.title}</h2>
              <p className="message-content">{msg.content}</p>

              <div className="message-actions">
                <button
                  className="action-btn active"
                  onClick={() => handleUnsave(msg.id)}
                >
                  <Bookmark size={14} />
                  <span>Remove from Saved</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
